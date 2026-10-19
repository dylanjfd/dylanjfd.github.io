#!/usr/bin/env python3
"""Veille souveraineté numérique : lecture de mes réponses aux e-mails de veille.

Se connecte en IMAP à Gmail (identifiants du fichier .env local), récupère mes réponses
aux e-mails « [Veille souveraineté] », retire le texte cité de l'e-mail d'origine, découpe
mes avis par « #numéro » et les relie aux articles du digest correspondant
(veille/digests/AAAA-MM-JJ.json). Le résultat est affiché en JSON.

Utilisation :
  python veille/fetch_replies.py --dry-run          réponses non traitées, sans rien enregistrer
  python veille/fetch_replies.py                    idem, puis les note comme traitées
  python veille/fetch_replies.py --marquer ID [ID…] note des réponses comme traitées (après validation)
  python veille/fetch_replies.py --fichier r.eml    lit des e-mails enregistrés au lieu de Gmail

Les réponses déjà traitées sont notées dans veille/processed.json par Message-ID, sous forme
d'empreinte SHA-256 : le dépôt est public, l'identifiant de l'e-mail n'y apparaît pas en clair.

Fichier .env (jamais envoyé sur GitHub, voir .env.example) :
  GMAIL_USER, GMAIL_APP_PASSWORD, et VEILLE_TO si mes réponses partent d'une autre adresse.
"""

import argparse
import email
import hashlib
import html
import imaplib
import json
import os
import re
import sys
from datetime import date, datetime, timedelta, timezone
from email import policy
from email.utils import parseaddr, parsedate_to_datetime
from pathlib import Path

DOSSIER = Path(__file__).resolve().parent
FICHIER_ENV = DOSSIER.parent / '.env'
FICHIER_TRAITES = DOSSIER / 'processed.json'
DOSSIER_DIGESTS = DOSSIER / 'digests'

OBJET = '[Veille souveraineté]'
JOURS_RECHERCHE = 120  # réponses cherchées sur les 4 derniers mois
MOIS_IMAP = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

# Fin de « Le lun. 19 oct. 2026 à 07:45, Veille <adresse> a écrit : » (ou « On … wrote: »)
A_ECRIT = re.compile(r'(?:a\s+écrit|wrote)\s*:[ \t]*$', re.M | re.I)
DEBUT_ATTRIBUTION = re.compile(r'[ \t]*(?:Le|On)\s', re.I)
# Autres débuts de message cité ou de signature
FIN_DU_MESSAGE = re.compile(r"^[ \t]*(?:-{2,}\s*(?:Original Message|Message d'origine)\s*-{2,}|--[ \t]*)$", re.M | re.I)
# « #2 » en début de ligne ou après une espace (pas l'ancre d'une adresse : page#2)
NUMERO = re.compile(r'(?:(?<=\s)|^)#(\d{1,3})\b[ \t]*[:\-–—]?[ \t]*', re.M)
SEMAINE = re.compile(r'Semaine du (\d{2})/(\d{2})/(\d{4})')


# ---------------------------------------------------------------------------
# Fichiers
# ---------------------------------------------------------------------------
def lire_json(chemin, defaut):
    try:
        return json.loads(Path(chemin).read_text(encoding='utf-8'))
    except FileNotFoundError:
        return defaut


def ecrire_json(chemin, donnees):
    chemin = Path(chemin)
    temporaire = chemin.with_suffix(chemin.suffix + '.tmp')
    temporaire.write_text(json.dumps(donnees, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    temporaire.replace(chemin)


def charger_env(chemin=FICHIER_ENV):
    """Lit le fichier .env (CLÉ=valeur) ; les variables déjà définies dans l'environnement priment."""
    valeurs = {}
    if Path(chemin).exists():
        for ligne in Path(chemin).read_text(encoding='utf-8').splitlines():
            ligne = ligne.strip()
            if ligne and not ligne.startswith('#') and '=' in ligne:
                cle, valeur = ligne.split('=', 1)
                valeurs[cle.strip()] = valeur.strip().strip('"').strip("'")
    valeurs.update({k: v for k, v in os.environ.items() if k in ('GMAIL_USER', 'GMAIL_APP_PASSWORD', 'VEILLE_TO')})
    return valeurs


def empreinte(message_id):
    """Identifiant d'une réponse : empreinte SHA-256 (32 caractères) de son Message-ID."""
    return hashlib.sha256((message_id or '').strip().encode('utf-8')).hexdigest()[:32]


# ---------------------------------------------------------------------------
# Texte de la réponse
# ---------------------------------------------------------------------------
def html_vers_texte(contenu):
    """Version texte d'une réponse en HTML, sans le message cité (bloc gmail_quote ou blockquote)."""
    contenu = re.split(r'<div[^>]+class="[^"]*gmail_quote|<blockquote', contenu, maxsplit=1, flags=re.I)[0]
    contenu = re.sub(r'<(?:br|/p|/div|/li)[^>]*>', '\n', contenu, flags=re.I)
    contenu = re.sub(r'<[^>]+>', '', contenu)
    return html.unescape(contenu).replace(' ', ' ')


def texte_du_message(message):
    corps = message.get_body(preferencelist=('plain', 'html'))
    if corps is None:
        return ''
    contenu = corps.get_content()
    return html_vers_texte(contenu) if corps.get_content_type() == 'text/html' else contenu


def debut_attribution(texte):
    """Position de « Le … a écrit : », que Gmail coupe parfois sur deux ou trois lignes ; None si absent.

    On part de « a écrit : » et on remonte au plus deux lignes, sans franchir de ligne vide,
    jusqu'à la ligne qui commence par « Le » (ou « On ») : mes propres phrases ne sont jamais coupées.
    """
    for fin in A_ECRIT.finditer(texte):
        lignes = texte[:fin.start()].split('\n')
        for k in range(len(lignes) - 1, max(-1, len(lignes) - 4), -1):
            if not lignes[k].strip():
                break
            if DEBUT_ATTRIBUTION.match(lignes[k]):
                return sum(len(ligne) + 1 for ligne in lignes[:k])
    return None


def retirer_citation(texte):
    """Garde seulement ce que j'ai écrit : coupe à « Le … a écrit : » et retire les lignes citées (« > »)."""
    texte = texte.replace('\r\n', '\n').replace('\r', '\n')
    debut = debut_attribution(texte)
    if debut is not None:
        texte = texte[:debut]
    fin = FIN_DU_MESSAGE.search(texte)
    if fin:
        texte = texte[:fin.start()]
    lignes = [ligne for ligne in texte.split('\n') if not ligne.lstrip().startswith('>')]
    return '\n'.join(lignes).strip()


def nettoyer(texte):
    """Espaces en trop retirés ; les paragraphes sont gardés."""
    lignes = [re.sub(r'[ \t]+', ' ', ligne).strip() for ligne in texte.split('\n')]
    return re.sub(r'\n{3,}', '\n\n', '\n'.join(lignes)).strip()


def decouper_avis(texte):
    """« #2 je pense que… #5 bof » → (texte avant le premier numéro, [(2, 'je pense que…'), (5, 'bof')]).

    Un même numéro écrit deux fois est regroupé, dans l'ordre d'écriture.
    """
    morceaux = NUMERO.split(texte)
    general = nettoyer(morceaux[0])
    avis = {}
    for i in range(1, len(morceaux), 2):
        numero, contenu = int(morceaux[i]), nettoyer(morceaux[i + 1])
        if contenu:
            avis[numero] = f'{avis[numero]}\n\n{contenu}' if numero in avis else contenu
    return general, list(avis.items())


# ---------------------------------------------------------------------------
# Analyse d'une réponse
# ---------------------------------------------------------------------------
def date_du_digest(objet):
    trouve = SEMAINE.search(objet or '')
    if not trouve:
        return None
    jour, mois, annee = (int(x) for x in trouve.groups())
    return date(annee, mois, jour).isoformat()


def analyser(message, dossier_digests=DOSSIER_DIGESTS, adresse=None):
    """Réponse prête à relire, ou None si l'e-mail n'est pas une de mes réponses à la veille."""
    objet = str(message.get('Subject', ''))
    if message.get('X-Veille-Digest') or OBJET not in objet:
        return None  # e-mail de veille lui-même, ou autre e-mail
    if adresse and parseaddr(str(message.get('From', '')))[1].lower() != adresse.lower():
        return None
    try:
        envoye = parsedate_to_datetime(str(message.get('Date'))).astimezone(timezone.utc).isoformat(timespec='seconds')
    except (TypeError, ValueError):
        envoye = None

    jour_digest = date_du_digest(objet)
    digest = lire_json(Path(dossier_digests) / f'{jour_digest}.json', None) if jour_digest else None
    articles = {a['numero']: a for a in digest['articles']} if digest else {}
    general, avis = decouper_avis(retirer_citation(texte_du_message(message)))

    avertissements = []
    if not jour_digest:
        avertissements.append("Date de la semaine introuvable dans l'objet.")
    elif digest is None:
        avertissements.append(f'Digest veille/digests/{jour_digest}.json introuvable (faire git pull ?).')
    resultat = []
    for numero, texte in avis:
        article = articles.get(numero)
        if digest is not None and article is None:
            avertissements.append(f'#{numero} ne correspond à aucun article du digest.')
        resultat.append({'numero': numero, 'avis': texte, 'article': article})
    if not avis:
        avertissements.append('Aucun avis « #numéro » dans cette réponse.')

    return {
        'id': empreinte(message.get('Message-ID')),
        'date': envoye,
        'objet': objet,
        'digest': jour_digest,
        'avis': resultat,
        'commentaire_general': general,
        'avertissements': avertissements,
    }


# ---------------------------------------------------------------------------
# Gmail (IMAP)
# ---------------------------------------------------------------------------
def boite_tous_messages(imap):
    """Boîte « Tous les messages » de Gmail (drapeau \\All), quelle que soit la langue du compte."""
    statut, boites = imap.list()
    for ligne in boites if statut == 'OK' else []:
        ligne = ligne.decode('utf-8', 'replace')
        trouve = re.match(r'\((?P<drapeaux>[^)]*)\) "[^"]*" (?P<nom>.+)$', ligne)
        if trouve and '\\All' in trouve.group('drapeaux'):
            return trouve.group('nom')
    return 'INBOX'


def messages_gmail(utilisateur, mot_de_passe, adresse):
    """E-mails envoyés depuis mon adresse avec « Veille » dans l'objet (le tri fin est fait par analyser)."""
    depuis = date.today() - timedelta(days=JOURS_RECHERCHE)
    depuis_imap = f'{depuis.day:02d}-{MOIS_IMAP[depuis.month - 1]}-{depuis.year}'
    with imaplib.IMAP4_SSL('imap.gmail.com', 993) as imap:
        imap.login(utilisateur, mot_de_passe)
        imap.select(boite_tous_messages(imap), readonly=True)  # lecture seule : rien n'est marqué comme lu
        statut, numeros = imap.search(None, 'SINCE', depuis_imap, 'FROM', f'"{adresse}"', 'SUBJECT', '"Veille"')
        if statut != 'OK':
            raise RuntimeError('recherche IMAP refusée')
        for numero in numeros[0].split():
            statut, donnees = imap.fetch(numero, '(BODY.PEEK[])')
            if statut == 'OK' and donnees and isinstance(donnees[0], tuple):
                yield email.message_from_bytes(donnees[0][1], policy=policy.default)


# ---------------------------------------------------------------------------
# Programme principal
# ---------------------------------------------------------------------------
def main(arguments=None):
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    analyseur = argparse.ArgumentParser(description='Lecture de mes réponses aux e-mails de veille.')
    analyseur.add_argument('--dry-run', action='store_true', help='affiche les réponses sans les noter comme traitées')
    analyseur.add_argument('--marquer', nargs='+', metavar='ID', help='note ces réponses comme traitées, sans lire Gmail')
    analyseur.add_argument('--fichier', nargs='+', metavar='EML', help='lit ces e-mails enregistrés au lieu de Gmail')
    analyseur.add_argument('--digests', default=str(DOSSIER_DIGESTS), help=argparse.SUPPRESS)
    args = analyseur.parse_args(arguments)

    traites = lire_json(FICHIER_TRAITES, {})
    aujourd_hui = datetime.now(timezone.utc).date().isoformat()

    if args.marquer:
        for identifiant in args.marquer:
            traites[identifiant] = aujourd_hui
        ecrire_json(FICHIER_TRAITES, dict(sorted(traites.items())))
        print(f'{len(args.marquer)} réponse(s) notée(s) comme traitée(s) dans veille/processed.json.')
        return 0

    if args.fichier:
        messages = [email.message_from_bytes(Path(f).read_bytes(), policy=policy.default) for f in args.fichier]
        adresse = None
    else:
        env = charger_env()
        manquants = [nom for nom in ('GMAIL_USER', 'GMAIL_APP_PASSWORD') if not env.get(nom)]
        if manquants:
            print(f"Identifiants manquants dans .env : {', '.join(manquants)} (voir .env.example et le README).", file=sys.stderr)
            return 2
        adresse = env.get('VEILLE_TO') or env['GMAIL_USER']
        messages = messages_gmail(env['GMAIL_USER'], env['GMAIL_APP_PASSWORD'], adresse)

    reponses = []
    for message in messages:
        reponse = analyser(message, args.digests, adresse)
        if reponse and reponse['id'] not in traites:
            reponses.append(reponse)
    reponses.sort(key=lambda r: r['date'] or '')
    print(json.dumps({'reponses': reponses}, ensure_ascii=False, indent=2))

    if reponses and not args.dry_run:
        for reponse in reponses:
            traites[reponse['id']] = aujourd_hui
        ecrire_json(FICHIER_TRAITES, dict(sorted(traites.items())))
    return 0


if __name__ == '__main__':
    sys.exit(main())
