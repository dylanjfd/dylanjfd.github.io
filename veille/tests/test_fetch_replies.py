"""Tests de fetch_replies.py : retrait du texte cité, découpage des avis « #R2 » et anciens e-mails « #2 ».

Lancer depuis la racine du dépôt :  python -m unittest discover -s veille/tests -v
"""

import email
import json
import sys
import tempfile
import unittest
from email import policy
from email.message import EmailMessage
from pathlib import Path

ICI = Path(__file__).resolve().parent
sys.path.insert(0, str(ICI.parent))

import fetch_replies as fr  # noqa: E402

DIGESTS = ICI / 'digests'
VEILLES = {'R': {'prefixe': 'R', 'categorie': 'Réseau'}, 'S': {'prefixe': 'S', 'categorie': 'Système'},
           'C': {'prefixe': 'C', 'categorie': 'Cybersécurité'}}


def lire_eml(nom):
    return email.message_from_bytes((ICI / nom).read_bytes(), policy=policy.default)


def reponse(corps, objet='Re: [Veille souveraineté] Semaine du 19/10/2026 — 3 actualités', html=None, **entetes):
    message = EmailMessage()
    message['From'] = entetes.get('From', 'Moi <moi@example.com>')
    message['To'] = 'veille@example.com'
    message['Subject'] = objet
    message['Date'] = 'Mon, 19 Oct 2026 21:12:00 +0200'
    message['Message-ID'] = entetes.get('Message_ID', '<test@example.com>')
    for cle, valeur in entetes.items():
        if cle.startswith('X_'):
            message[cle.replace('_', '-')] = valeur
    if html is None:
        message.set_content(corps)
    else:
        message.set_content(html, subtype='html')
    return email.message_from_bytes(message.as_bytes(), policy=policy.default)


class RetraitCitation(unittest.TestCase):
    def test_attribution_gmail_sur_deux_lignes(self):
        texte = ("#1 mon avis\n"
                 "Le RGPD n'est pas le seul critère.\n\n"
                 "Le lun. 19 oct. 2026 à 07:45, Veille souveraineté <\n"
                 "veille@example.com> a écrit :\n\n"
                 "> #1 G7 choisit le cloud SecNumCloud\n")
        propre = fr.retirer_citation(texte)
        self.assertEqual(propre, "#1 mon avis\nLe RGPD n'est pas le seul critère.")

    def test_ma_phrase_qui_commence_par_le_est_gardee(self):
        texte = ("#2 Le prix compte.\nLe reste aussi.\n"
                 "Le lun. 19 oct. 2026 à 07:45, Veille <veille@example.com> a écrit :\n> cité\n")
        self.assertEqual(fr.retirer_citation(texte), '#2 Le prix compte.\nLe reste aussi.')

    def test_attribution_anglaise_et_espace_insecable(self):
        texte = "#1 ok\n\nOn Mon, Oct 19, 2026 at 7:45 AM Veille <veille@example.com> wrote:\n> cité\n"
        self.assertEqual(fr.retirer_citation(texte), '#1 ok')
        texte = "#1 ok\n\nLe lun. 19 oct. 2026, Veille <v@example.com> a écrit :\n> cité\n"
        self.assertEqual(fr.retirer_citation(texte), '#1 ok')

    def test_lignes_citees_au_milieu_et_signature(self):
        texte = "> #1 titre cité\n#1 mon avis\n  > autre ligne citée\nsuite de l'avis\n--\nDylan\n"
        self.assertEqual(fr.retirer_citation(texte), "#1 mon avis\nsuite de l'avis")


class DecoupageAvis(unittest.TestCase):
    def test_numeros_et_regroupement(self):
        general, avis = fr.decouper_avis(
            "Bonjour,\n\n#R2 premier avis\n#s5 : avec deux-points\n#R2 — suite du 2\n#C9 voir https://example.com/page#3 ici")
        self.assertEqual(general, 'Bonjour,')
        self.assertEqual(avis, [
            ('R2', 'premier avis\n\nsuite du 2'),
            ('S5', 'avec deux-points'),
            ('C9', 'voir https://example.com/page#3 ici'),
        ])

    def test_anciens_numeros_sans_lettre(self):
        _, avis = fr.decouper_avis('#2 premier avis\n#R2 suite\n#5 bof', 'R')
        self.assertEqual(avis, [('R2', 'premier avis\n\nsuite'), ('R5', 'bof')])
        self.assertEqual(fr.decouper_avis('#2 sans lettre')[1], [('2', 'sans lettre')])

    def test_sans_numero(self):
        self.assertEqual(fr.decouper_avis('Rien à dire cette semaine.'), ('Rien à dire cette semaine.', []))
        self.assertEqual(fr.decouper_avis('Le #RGPD et le #R2D2 ne sont pas des numéros.')[1], [])

    def test_numero_sans_texte_ignore(self):
        self.assertEqual(fr.decouper_avis('#R1\n#R2 oui')[1], [('R2', 'oui')])


class SyntheseSemaine(unittest.TestCase):
    def test_separee_des_avis(self):
        reste, synthese = fr.extraire_synthese_semaine(
            "#R1 premier avis\n#SEMAINE cette semaine, le cloud souverain avance.\nLes PME suivent.")
        self.assertEqual(synthese, 'cette semaine, le cloud souverain avance.\nLes PME suivent.')
        self.assertEqual(fr.decouper_avis(reste)[1], [('R1', 'premier avis')])

    def test_entre_deux_avis_et_en_minuscules(self):
        reste, synthese = fr.extraire_synthese_semaine("#R1 a\n  #semaine : bilan de la semaine\n#C2 b\n#Semaine — suite")
        self.assertEqual(synthese, 'bilan de la semaine\n\nsuite')
        self.assertEqual(fr.decouper_avis(reste)[1], [('R1', 'a'), ('C2', 'b')])

    def test_seulement_en_debut_de_ligne(self):
        texte = '#R1 je reviendrai dessus dans #SEMAINE'
        self.assertEqual(fr.extraire_synthese_semaine(texte), (texte, None))
        self.assertEqual(fr.extraire_synthese_semaine('#R1 rien de plus'), ('#R1 rien de plus', None))

    def test_dans_la_reponse_avec_la_date_du_lundi(self):
        objet = 'Re: [Veille] Semaine du 02/11/2026 — Réseau 0, Système 0, Cybersécurité 0'
        resultat = fr.analyser(reponse('#SEMAINE semaine calme, rien de marquant.', objet=objet), DIGESTS, veilles=VEILLES)
        self.assertEqual(resultat['synthese_semaine'], {'semaine_du': '2026-11-02', 'texte': 'semaine calme, rien de marquant.'})
        self.assertEqual((resultat['avis'], resultat['avertissements']), ([], []))

    def test_absente_des_anciennes_reponses(self):
        resultat = fr.analyser(lire_eml('reponse-exemple.eml'), DIGESTS, veilles=VEILLES)
        self.assertIsNone(resultat['synthese_semaine'])
        resultat = fr.analyser(reponse('Rien.', objet='Re: [Veille] Semaine du 02/11/2026'), DIGESTS, veilles=VEILLES)
        self.assertIn('Aucun avis « #numéro » ni synthèse « #SEMAINE » dans cette réponse.', resultat['avertissements'])


class AnalyseReponse(unittest.TestCase):
    def test_faux_email_complet(self):
        # Ancien e-mail « [Veille souveraineté] » et ancien digest : numéros sans lettre = veille réseau
        resultat = fr.analyser(lire_eml('reponse-exemple.eml'), DIGESTS, veilles=VEILLES)
        self.assertEqual(resultat['digest'], '2026-10-19')
        self.assertEqual(resultat['commentaire_general'], 'Bonjour,\nquelques avis pour cette semaine.')
        numeros = [(a['numero'], a['veille']) for a in resultat['avis']]
        self.assertEqual(numeros, [('R1', 'R'), ('R3', 'R'), ('R2', 'R'), ('R7', 'R')])
        avis = {a['numero']: a for a in resultat['avis']}
        self.assertIn("Le RGPD n'est pas le seul critère", avis['R1']['avis'])
        self.assertEqual(avis['R1']['article']['titre'], 'G7 choisit le cloud SecNumCloud de S3NS')
        self.assertIn('https://example.com/page#3', avis['R3']['avis'])
        self.assertEqual(avis['R2']['avis'].count('\n\n'), 1)  # les deux « #2 » regroupés
        self.assertIsNone(avis['R7']['article'])
        # Le texte cité de l'ancien e-mail n'a pas de lien : le digest sert de secours
        self.assertEqual(avis['R1']['article']['lien'], 'https://example.com/articles/g7-secnumcloud')
        self.assertEqual(resultat['avertissements'],
                         ["#R7 : article introuvable dans le texte cité de l'e-mail d'origine et dans le digest."])
        texte_complet = ' '.join(a['avis'] for a in resultat['avis'])
        self.assertNotIn('Dylan', texte_complet)          # signature retirée
        self.assertNotIn('VPS1Euro', texte_complet)       # e-mail d'origine retiré
        self.assertNotIn('reponse-test-1', str(resultat))  # Message-ID jamais en clair
        self.assertEqual(len(resultat['id']), 32)

    def test_reponse_html_seulement(self):
        html = ('<div dir="ltr"><div>#1 avis en HTML</div><div>#2 deuxième&nbsp;avis</div></div><br>'
                '<div class="gmail_quote"><div dir="ltr" class="gmail_attr">Le lun. 19 oct. 2026, Veille a écrit :</div>'
                '<blockquote>#1 G7 choisit le cloud</blockquote></div>')
        resultat = fr.analyser(reponse('', html=html), DIGESTS, veilles=VEILLES)
        self.assertEqual([(a['numero'], a['avis']) for a in resultat['avis']], [('R1', 'avis en HTML'), ('R2', 'deuxième avis')])

    def test_nouvel_email_trois_veilles(self):
        objet = 'Re: [Veille] Semaine du 02/11/2026 — 12 actualités'
        resultat = fr.analyser(reponse('#R1 cloud\n#s3 images\n#C2 Steam\n#4 oubli\n#X1 inconnue', objet=objet),
                               DIGESTS, veilles=VEILLES)
        self.assertEqual([(a['numero'], a['veille']) for a in resultat['avis']],
                         [('R1', 'R'), ('S3', 'S'), ('C2', 'C'), ('4', None), ('X1', None)])
        self.assertTrue(any(a.startswith('#4 : lettre de veille manquante') for a in resultat['avertissements']))
        self.assertTrue(any(a.startswith('#X1 : lettre de veille') for a in resultat['avertissements']))
        self.assertIn('R (réseau), S (système), C (cybersécurité)', resultat['avertissements'][-1])

    def test_nouveau_digest_numeros_avec_lettre(self):
        with tempfile.TemporaryDirectory() as dossier:
            Path(dossier, '2026-11-02.json').write_text(json.dumps({'date': '2026-11-02', 'articles': [
                {'numero': 'R1', 'veille': 'R', 'titre': 'Cloud Bleu'},
                {'numero': 'C1', 'veille': 'C', 'titre': 'Vol de comptes Steam'}]}), encoding='utf-8')
            resultat = fr.analyser(reponse('#C1 oui\n#R1 non\n#S1 ?', objet='Re: [Veille] Semaine du 02/11/2026 — 2 actualités'),
                                   dossier, veilles=VEILLES)
        articles = {a['numero']: a['article'] for a in resultat['avis']}
        self.assertEqual((articles['C1']['titre'], articles['R1']['titre'], articles['S1']),
                         ('Vol de comptes Steam', 'Cloud Bleu', None))
        self.assertEqual(resultat['avertissements'],
                         ["#S1 : article introuvable dans le texte cité de l'e-mail d'origine et dans le digest."])

    def test_article_retrouve_dans_le_texte_cite(self):
        # Réponse à un e-mail d'Apps Script : aucun digest, les articles viennent du texte cité
        corps = ("#C1 je trouve ça inquiétant\n#r2 bof\n#SEMAINE peu d'actualité côté système.\n\n"
                 "Le lun. 2 nov. 2026 à 07:45, Veille technologique <\nveille@example.com> a écrit :\n\n"
                 "> Veille technologique — semaine du 02/11/2026\n>\n"
                 "> == Réseau — Souveraineté numérique des PME ==\n>\n"
                 "> #R1 — Le cloud Bleu est là <https://www.lemagit.fr/dessin/Le-cloud-Bleu-est-la>\n"
                 "> LeMagIT · 26/10/2026 · FR\n> La joint-venture cloud d'Orange et Capgemini…\n"
                 "> https://www.lemagit.fr/dessin/Le-cloud-Bleu-est-la\n>\n"
                 "> #R2 — Chez Contabo, le prix d'un VPS se joue au tirage au sort, de 6,6 à\n> 13,2 euros\n"
                 "> Next · 23/10/2026 · FR\n> https://next.ink/263438/chez-contabo\n>\n"
                 "> == Système — Gérer un parc de PC en libre-service ==\n>\n> Pas d'actualité cette semaine.\n>\n"
                 "> == Cybersécurité — Pourquoi les joueurs sont-ils l'une des cibles favorites des cybercriminels ? ==\n>\n"
                 "> #C1 — Capcom confirms data breach affecting 11.7 million accounts\n"
                 "> BleepingComputer · 22/10/2026 · EN\n> Japanese gaming giant Capcom has confirmed…\n"
                 "> https://www.bleepingcomputer.com/news/security/capcom\n>\n"
                 "> —\n> Réponds avec le numéro suivi de ton avis, par exemple :\n> #C2 je pense que… Termine par ta synthèse de\n"
                 "> la semaine sur une ligne qui commence par #SEMAINE, par exemple :\n> #SEMAINE cette semaine, …\n")
        resultat = fr.analyser(reponse(corps, objet='Re: [Veille] Semaine du 02/11/2026 — Réseau 2, Système 0, Cybersécurité 1'),
                               DIGESTS, veilles=VEILLES)
        self.assertEqual(resultat['avertissements'], [])
        avis = {a['numero']: a for a in resultat['avis']}
        self.assertEqual(list(avis), ['C1', 'R2'])
        self.assertEqual((avis['C1']['avis'], avis['R2']['avis']), ('je trouve ça inquiétant', 'bof'))
        # Ma synthèse, pas l'exemple « #SEMAINE cette semaine, … » de la consigne citée
        self.assertEqual(resultat['synthese_semaine'], {'semaine_du': '2026-11-02', 'texte': "peu d'actualité côté système."})
        self.assertEqual(avis['C1']['article'], {
            'numero': 'C1', 'titre': 'Capcom confirms data breach affecting 11.7 million accounts',
            'source': 'BleepingComputer', 'date': '22/10/2026', 'langue': 'EN',
            'extrait': 'Japanese gaming giant Capcom has confirmed…',
            'lien': 'https://www.bleepingcomputer.com/news/security/capcom'})
        self.assertEqual(avis['R2']['article']['titre'],
                         "Chez Contabo, le prix d'un VPS se joue au tirage au sort, de 6,6 à 13,2 euros")
        cites = fr.articles_cites(fr.texte_cite(reponse(corps)))
        self.assertEqual(sorted(cites), ['C1', 'R1', 'R2'])  # la consigne « #C2 je pense que… » n'est pas un article
        self.assertEqual(cites['R1']['lien'], 'https://www.lemagit.fr/dessin/Le-cloud-Bleu-est-la')
        self.assertEqual(cites['R1']['titre'], 'Le cloud Bleu est là')

    def test_article_retrouve_dans_le_html_cite(self):
        html = ('<div dir="ltr">#S1 utile pour Reboot</div><div class="gmail_quote">'
                '<div class="gmail_attr">Le lun. 2 nov. 2026, Veille a écrit :</div><blockquote>'
                '<h3>Système — Gérer un parc de PC en libre-service</h3><div style="margin:16px 0">'
                '<div style="font-size:16px"><b>#S1</b> — <a href="https://itc.fr/clonezilla?a=1&amp;b=2">Clonezilla : cloner un poste</a></div>'
                '<div style="color:#888">IT-Connect · 23/10/2026 · FR</div><div>Un extrait.</div>'
                '<div><a href="https://itc.fr/clonezilla?a=1&amp;b=2">https://itc.fr/clonezilla?a=1&amp;b=2</a></div>'
                '</div></blockquote></div>')
        resultat = fr.analyser(reponse('', html=html, objet='Re: [Veille] Semaine du 02/11/2026 — Réseau 0, Système 1, Cybersécurité 0'),
                               DIGESTS, veilles=VEILLES)
        article = resultat['avis'][0]['article']
        self.assertEqual((resultat['avis'][0]['numero'], resultat['avis'][0]['avis']), ('S1', 'utile pour Reboot'))
        self.assertEqual((article['titre'], article['source'], article['langue'], article['extrait'], article['lien']),
                         ('Clonezilla : cloner un poste', 'IT-Connect', 'FR', 'Un extrait.', 'https://itc.fr/clonezilla?a=1&b=2'))

    def test_email_de_veille_lui_meme_ignore(self):
        message = reponse('#1 G7', objet='[Veille souveraineté] Semaine du 19/10/2026 — 3 actualités',
                          X_Veille_Digest='2026-10-19')
        self.assertIsNone(fr.analyser(message, DIGESTS))
        # Celui d'Apps Script part de mon adresse, sans l'en-tête X-Veille-Digest, mais ce n'est pas une réponse
        for objet in ('[Veille souveraineté] Semaine du 19/10/2026 — 3 actualités', '[Veille] Semaine du 02/11/2026 — 4 actualités'):
            self.assertIsNone(fr.analyser(reponse('#R1 G7', objet=objet), DIGESTS, veilles=VEILLES))
        self.assertIsNotNone(fr.analyser(reponse('#R1 x', objet='RE : [Veille] Semaine du 02/11/2026'), DIGESTS, veilles=VEILLES))

    def test_autre_expediteur_ou_autre_objet_ignore(self):
        self.assertIsNone(fr.analyser(reponse('#1 x', From='Autre <autre@example.com>'), DIGESTS, 'moi@example.com'))
        self.assertIsNotNone(fr.analyser(reponse('#1 x'), DIGESTS, 'MOI@example.com'))
        self.assertIsNone(fr.analyser(reponse('#1 x', objet='Re: autre sujet'), DIGESTS))
        self.assertIsNone(fr.analyser(reponse('#1 x', objet='Re: [Veilles] autre sujet'), DIGESTS))

    def test_digest_absent(self):
        resultat = fr.analyser(reponse('#1 x', objet='Re: [Veille souveraineté] Semaine du 05/01/2026 — 2 actualités'), DIGESTS)
        self.assertEqual(resultat['digest'], '2026-01-05')
        self.assertIsNone(resultat['avis'][0]['article'])
        self.assertTrue(any('introuvable' in a for a in resultat['avertissements']))

    def test_empreinte_stable(self):
        self.assertEqual(fr.empreinte('<a@example.com>'), fr.empreinte(' <a@example.com> '))
        self.assertNotEqual(fr.empreinte('<a@example.com>'), fr.empreinte('<b@example.com>'))
        # Valeur calculée avant les trois veilles : les réponses notées dans processed.json restent traitées
        self.assertEqual(fr.empreinte('<reponse-test-1@example.com>'), 'd3491ec51fbfaec2c7db5b3768d34571')

    def test_config_du_depot(self):
        veilles = fr.lire_veilles()
        self.assertEqual(list(veilles), ['R', 'S', 'C'])
        self.assertEqual(veilles[fr.PREFIXE_ANCIEN]['categorie'], 'Réseau')


if __name__ == '__main__':
    unittest.main()
