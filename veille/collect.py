#!/usr/bin/env python3
"""Veille souveraineté numérique : collecte des actualités et envoi du récapitulatif par e-mail.

Lit les flux RSS de veille/config.json, garde les articles des 7 derniers jours qui
contiennent au moins un mot-clé (titre ou résumé), sans doublon (veille/seen.json garde
les liens déjà envoyés), puis envoie un e-mail en texte simple et en HTML via Gmail.

Utilisation :
  python veille/collect.py              collecte et envoie l'e-mail
  python veille/collect.py --dry-run    affiche l'e-mail sans l'envoyer ni rien enregistrer
  python veille/collect.py --accumuler  collecte seulement et met les articles de côté

Les flux RSS ne gardent que leurs derniers articles, parfois moins de 7 jours : le
workflow GitHub lance donc --accumuler chaque jour (articles gardés dans veille/tampon.json,
conservé dans le cache de GitHub Actions) et l'envoi le lundi.

Identifiants : variables d'environnement GMAIL_USER, GMAIL_APP_PASSWORD et VEILLE_TO
(secrets GitHub). Aucune adresse ni aucun mot de passe n'est écrit dans le dépôt.
"""

import argparse
import html
import json
import os
import re
import smtplib
import socket
import ssl
import sys
import tempfile
import textwrap
import unicodedata
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage
from email.utils import formataddr, make_msgid
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

import feedparser

try:
    from zoneinfo import ZoneInfo
    PARIS = ZoneInfo('Europe/Paris')
except Exception:  # base des fuseaux horaires absente (Windows sans le paquet tzdata)
    PARIS = timezone.utc

DOSSIER = Path(__file__).resolve().parent
FICHIER_CONFIG = DOSSIER / 'config.json'
FICHIER_VUS = DOSSIER / 'seen.json'
FICHIER_TAMPON = DOSSIER / 'tampon.json'
DOSSIER_DIGESTS = DOSSIER / 'digests'

OBJET = '[Veille souveraineté]'
JOURS_MEMOIRE = 60  # un lien envoyé reste 60 jours dans seen.json, bien plus que la fenêtre de 7 jours
LARGEUR_EXTRAIT = 76  # extrait de 2 lignes de 76 caractères au plus
AGENT = 'VeillePortfolio/1.0 (+https://dylanjfd.github.io/pages/veille.html)'
CONSIGNE = ("Réponds à ce mail en écrivant #numéro suivi de ton avis, par exemple : #2 je pense que… "
            "Tu peux ignorer les articles qui ne t'intéressent pas.")


# ---------------------------------------------------------------------------
# Fichiers JSON
# ---------------------------------------------------------------------------
def lire_json(chemin, defaut):
    try:
        return json.loads(Path(chemin).read_text(encoding='utf-8'))
    except FileNotFoundError:
        return defaut


def ecrire_json(chemin, donnees):
    """Écrit le fichier d'un coup (fichier temporaire puis remplacement) pour ne jamais le laisser à moitié écrit."""
    chemin = Path(chemin)
    chemin.parent.mkdir(parents=True, exist_ok=True)
    temporaire = chemin.with_suffix(chemin.suffix + '.tmp')
    temporaire.write_text(json.dumps(donnees, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    temporaire.replace(chemin)


# ---------------------------------------------------------------------------
# Texte : accents, mots-clés, extraits, liens
# ---------------------------------------------------------------------------
def sans_accents(texte):
    """Minuscules, sans accents, apostrophes et espaces normalisés : « Souveraineté » → « souverainete »."""
    texte = unicodedata.normalize('NFKD', texte or '')
    texte = ''.join(c for c in texte if not unicodedata.combining(c))
    texte = texte.replace('’', "'").replace(' ', ' ').replace(' ', ' ')
    return re.sub(r'\s+', ' ', texte).strip().lower()


def motif_mots_cles(mots_cles):
    """Expression qui trouve un mot-clé entier, au singulier ou au pluriel (« hébergeurs », pas « cloud acteurs »)."""
    variantes = []
    for mot in mots_cles:
        morceaux = sans_accents(mot).split()
        if morceaux:
            variantes.append(r'\s+'.join(re.escape(m) for m in morceaux))
    return re.compile(r'\b(?:' + '|'.join(variantes) + r')(?:s|x|es)?\b')


def texte_brut(fragment):
    """Retire les balises HTML et les entités d'un titre ou d'un résumé de flux.

    Deux passages, car certains flux (LeMagIT) encodent leur HTML deux fois : « &lt;p&gt; ».
    """
    fragment = fragment or ''
    for _ in range(2):
        fragment = html.unescape(re.sub(r'<[^>]+>', ' ', fragment))
    fragment = fragment.replace(' ', ' ').replace(' ', ' ')
    return re.sub(r'\s+', ' ', fragment).strip()


def lignes_extrait(texte, largeur=LARGEUR_EXTRAIT):
    """Extrait de 2 lignes au plus, coupé entre deux mots."""
    return textwrap.wrap(texte, width=largeur, max_lines=2, placeholder=' …') if texte else []


def normaliser_lien(url):
    """Lien sans paramètres de suivi (utm_…) ni ancre, pour repérer les doublons."""
    morceaux = urlsplit((url or '').strip())
    requete = [(k, v) for k, v in parse_qsl(morceaux.query, keep_blank_values=True) if not k.lower().startswith('utm_')]
    return urlunsplit((morceaux.scheme, morceaux.netloc, morceaux.path, urlencode(requete), ''))


# ---------------------------------------------------------------------------
# Dates
# ---------------------------------------------------------------------------
def date_entree(entree):
    """Date de publication (ou de mise à jour) d'un article du flux, en UTC ; None si absente."""
    for cle in ('published_parsed', 'updated_parsed', 'created_parsed'):
        valeur = entree.get(cle)
        if valeur:
            return datetime(*valeur[:6], tzinfo=timezone.utc)
    return None


def date_courte(iso):
    """« 2026-10-18T09:30:00+00:00 » → « 18/10/2026 » (heure de Paris)."""
    return datetime.fromisoformat(iso).astimezone(PARIS).strftime('%d/%m/%Y')


# ---------------------------------------------------------------------------
# Collecte
# ---------------------------------------------------------------------------
def lire_flux(source, maintenant):
    """Articles d'un flux : titre, source, date, lien et résumé en texte brut."""
    flux = feedparser.parse(source['url'], agent=AGENT)
    statut = flux.get('status', 200)
    if statut >= 400 or (flux.get('bozo') and not flux.entries):
        raise RuntimeError(f"flux illisible (code {statut}) : {flux.get('bozo_exception', '')}")
    articles = []
    for entree in flux.entries:
        lien = normaliser_lien(entree.get('link'))
        titre = texte_brut(entree.get('title'))
        if not lien or not titre:
            continue
        date = date_entree(entree) or maintenant  # sans date : on garde le jour de la collecte
        articles.append({
            'titre': titre,
            'source': source['nom'],
            'date': date.isoformat(timespec='seconds'),
            'lien': lien,
            'resume': texte_brut(entree.get('summary') or entree.get('description')),
        })
    return articles


def collecter(config, maintenant):
    """Articles récents qui contiennent au moins un mot-clé, et liste des flux en erreur."""
    motif = motif_mots_cles(config['mots_cles'])
    limite = maintenant - timedelta(days=config.get('jours', 7))
    sources = config.get('flux', []) + config.get('google_alerts', [])
    articles, erreurs = [], []
    for source in sources:
        try:
            for article in lire_flux(source, maintenant):
                recent = datetime.fromisoformat(article['date']) >= limite
                if recent and motif.search(sans_accents(article['titre'] + ' ' + article['resume'])):
                    articles.append(article)
        except Exception as erreur:  # un flux en panne ne bloque pas les autres
            erreurs.append(f"{source['nom']} : {erreur}")
    return articles, erreurs, len(sources)


def fusionner(*listes):
    """Une seule fois chaque lien (le premier rencontré est gardé)."""
    vus, resultat = set(), []
    for liste in listes:
        for article in liste:
            if article['lien'] not in vus:
                vus.add(article['lien'])
                resultat.append(article)
    return resultat


def recents(articles, maintenant, jours):
    limite = maintenant - timedelta(days=jours)
    return [a for a in articles if datetime.fromisoformat(a['date']) >= limite]


def selectionner(articles, deja_envoyes, maximum, premier_numero=1):
    """Articles jamais envoyés, du plus récent au plus ancien, numérotés à partir de premier_numero."""
    nouveaux = [a for a in articles if a['lien'] not in deja_envoyes]
    nouveaux.sort(key=lambda a: a['date'], reverse=True)
    return [
        {
            'numero': premier_numero + i,
            'titre': a['titre'],
            'source': a['source'],
            'date': a['date'],
            'lien': a['lien'],
            'extrait': ' '.join(lignes_extrait(a['resume'])),
        }
        for i, a in enumerate(nouveaux[:maximum])
    ]


# ---------------------------------------------------------------------------
# E-mail
# ---------------------------------------------------------------------------
def objet_mail(jour, nombre):
    semaine = f"{OBJET} Semaine du {jour.strftime('%d/%m/%Y')}"
    if nombre == 0:
        return f"{semaine} — Pas d'actualité cette semaine"
    return f"{semaine} — {nombre} actualité{'s' if nombre > 1 else ''}"


def texte_mail(articles, jour, noms_sources, jours):
    entete = [f"Veille souveraineté numérique — semaine du {jour.strftime('%d/%m/%Y')}", '']
    if not articles:
        return '\n'.join(entete + [
            "Pas d'actualité cette semaine : aucun article des "
            f"{jours} derniers jours ne contient les mots-clés suivis.",
            '',
            f"Sources consultées : {', '.join(noms_sources)}.",
        ]) + '\n'
    lignes = entete + [
        f"{len(articles)} actualité{'s' if len(articles) > 1 else ''} des {jours} derniers jours, "
        "de la plus récente à la plus ancienne.",
        '',
    ]
    for a in articles:
        lignes.append(f"#{a['numero']} {a['titre']}")
        lignes.append(f"   {a['source']} · {date_courte(a['date'])}")
        lignes.extend(f"   {ligne}" for ligne in lignes_extrait(a['extrait']))
        lignes.append(f"   {a['lien']}")
        lignes.append('')
    lignes += ['—', CONSIGNE]
    return '\n'.join(lignes) + '\n'


def html_mail(articles, jour, noms_sources, jours):
    e = html.escape
    titre = f"Semaine du {jour.strftime('%d/%m/%Y')}"
    if articles:
        sous_titre = (f"{len(articles)} actualité{'s' if len(articles) > 1 else ''} des {jours} derniers jours, "
                      "de la plus récente à la plus ancienne")
    else:
        sous_titre = "Pas d'actualité cette semaine"
    cartes = []
    for a in articles:
        cartes.append(f"""
      <div style="background:#fffaf0;border:1px solid #d8ccb2;border-radius:8px;padding:14px 16px;margin:0 0 12px;">
        <p style="margin:0 0 4px;font-size:13px;color:#5f5443;"><strong style="color:#7a5c22;font-size:15px;">#{a['numero']}</strong> · {e(a['source'])} · {date_courte(a['date'])}</p>
        <p style="margin:0 0 6px;font-size:17px;line-height:1.35;font-weight:bold;"><a href="{e(a['lien'], quote=True)}" style="color:#2a2418;">{e(a['titre'])}</a></p>
        <p style="margin:0 0 8px;font-size:14px;color:#3d3426;">{e(a['extrait'])}</p>
        <p style="margin:0;font-size:13px;"><a href="{e(a['lien'], quote=True)}" style="color:#6b4f1d;">Lire l'article</a></p>
      </div>""")
    if articles:
        pied = f"""
      <div style="border-top:2px solid #c9a35b;margin-top:20px;padding-top:12px;font-size:14px;">
        <p style="margin:0;">{e(CONSIGNE)}</p>
      </div>"""
    else:
        pied = f"""
      <p style="margin:0 0 8px;">Aucun article des {jours} derniers jours ne contient les mots-clés suivis.</p>
      <p style="margin:0;color:#5f5443;font-size:14px;">Sources consultées : {e(', '.join(noms_sources))}.</p>"""
    return f"""<!doctype html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>{e(OBJET)} {e(titre)}</title></head>
<body style="margin:0;padding:0;background:#f3ecdd;">
  <div style="max-width:640px;margin:0 auto;padding:24px 16px;font-family:'Segoe UI',Arial,sans-serif;color:#2a2418;line-height:1.5;">
    <p style="margin:0;color:#7a5c22;font-size:12px;letter-spacing:.12em;text-transform:uppercase;">Codex · Veille souveraineté numérique</p>
    <h1 style="margin:4px 0;font-size:22px;">{e(titre)}</h1>
    <p style="margin:0 0 20px;color:#5f5443;">{e(sous_titre)}</p>{''.join(cartes)}{pied}
  </div>
</body>
</html>
"""


def construire_mail(articles, jour, noms_sources, jours, expediteur, destinataire, nombre):
    message = EmailMessage()
    message['Subject'] = objet_mail(jour, nombre)
    message['From'] = formataddr(('Veille souveraineté', expediteur))
    message['To'] = destinataire
    message['Message-ID'] = make_msgid(idstring=f'veille-{jour.isoformat()}')
    message['X-Veille-Digest'] = jour.isoformat()  # repère pour fetch_replies.py : ce n'est pas une réponse
    message.set_content(texte_mail(articles, jour, noms_sources, jours))
    message.add_alternative(html_mail(articles, jour, noms_sources, jours), subtype='html')
    return message


def envoyer(message, utilisateur, mot_de_passe):
    with smtplib.SMTP_SSL('smtp.gmail.com', 465, context=ssl.create_default_context(), timeout=60) as smtp:
        smtp.login(utilisateur, mot_de_passe)
        smtp.send_message(message)


# ---------------------------------------------------------------------------
# Programme principal
# ---------------------------------------------------------------------------
def main(arguments=None):
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    analyseur = argparse.ArgumentParser(description='Collecte de la veille souveraineté et envoi par e-mail.')
    mode = analyseur.add_mutually_exclusive_group()
    mode.add_argument('--dry-run', action='store_true', help="affiche l'e-mail sans l'envoyer ni rien enregistrer")
    mode.add_argument('--accumuler', action='store_true', help='collecte seulement, sans envoi (articles mis de côté)')
    args = analyseur.parse_args(arguments)

    socket.setdefaulttimeout(30)
    config = json.loads(FICHIER_CONFIG.read_text(encoding='utf-8'))
    jours = config.get('jours', 7)
    maintenant = datetime.now(timezone.utc)
    jour = maintenant.astimezone(PARIS).date()
    noms_sources = [s['nom'] for s in config.get('flux', []) + config.get('google_alerts', [])]

    nouveaux, erreurs, nombre_sources = collecter(config, maintenant)
    for erreur in erreurs:
        print(f'Attention — {erreur}', file=sys.stderr)
    if nombre_sources and len(erreurs) == nombre_sources:
        print('Aucun flux lisible : rien n\'est envoyé (problème de réseau ?).', file=sys.stderr)
        return 1

    tampon = recents(lire_json(FICHIER_TAMPON, []), maintenant, jours)
    articles = fusionner(nouveaux, tampon)

    if args.accumuler:
        ecrire_json(FICHIER_TAMPON, articles)
        print(f'Collecte : {len(nouveaux)} article(s) trouvé(s), {len(articles)} mis de côté pour le prochain envoi.')
        return 0

    deja_envoyes = lire_json(FICHIER_VUS, {})
    chemin_digest = DOSSIER_DIGESTS / f'{jour.isoformat()}.json'
    digest = lire_json(chemin_digest, {'date': jour.isoformat(), 'articles': []})
    # Second envoi le même jour (relance manuelle) : la numérotation continue dans le même digest
    premier = max((a['numero'] for a in digest['articles']), default=0) + 1
    choix = selectionner(articles, deja_envoyes, config.get('articles_max', 10), premier)

    if args.dry_run:
        message = construire_mail(choix, jour, noms_sources, jours, 'expediteur@example.com', 'destinataire@example.com', len(choix))
        apercu = Path(tempfile.gettempdir()) / f'veille-apercu-{jour.isoformat()}.html'
        apercu.write_text(html_mail(choix, jour, noms_sources, jours), encoding='utf-8')
        print(f"Objet : {message['Subject']}\n")
        print(texte_mail(choix, jour, noms_sources, jours))
        print(f'(Essai : rien n\'est envoyé ni enregistré. Version HTML : {apercu})')
        return 0

    manquants = [nom for nom in ('GMAIL_USER', 'GMAIL_APP_PASSWORD', 'VEILLE_TO') if not os.environ.get(nom)]
    if manquants:
        print(f"Identifiants manquants : {', '.join(manquants)} (secrets GitHub ou variables d'environnement).", file=sys.stderr)
        return 2
    message = construire_mail(choix, jour, noms_sources, jours,
                              os.environ['GMAIL_USER'], os.environ['VEILLE_TO'], len(choix))
    envoyer(message, os.environ['GMAIL_USER'], os.environ['GMAIL_APP_PASSWORD'])
    print(f"E-mail envoyé : {message['Subject']}")

    if choix:
        digest['articles'].extend(choix)
        ecrire_json(chemin_digest, digest)
        for article in choix:
            deja_envoyes[article['lien']] = jour.isoformat()
    limite = (jour - timedelta(days=JOURS_MEMOIRE)).isoformat()
    ecrire_json(FICHIER_VUS, {lien: date for lien, date in sorted(deja_envoyes.items()) if date >= limite})
    ecrire_json(FICHIER_TAMPON, [a for a in articles if a['lien'] not in deja_envoyes])
    return 0


if __name__ == '__main__':
    sys.exit(main())
