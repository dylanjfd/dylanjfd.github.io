"""Tests de fetch_replies.py : retrait du texte cité et découpage des avis « #numéro ».

Lancer depuis la racine du dépôt :  python -m unittest discover -s veille/tests -v
"""

import email
import sys
import unittest
from email import policy
from email.message import EmailMessage
from pathlib import Path

ICI = Path(__file__).resolve().parent
sys.path.insert(0, str(ICI.parent))

import fetch_replies as fr  # noqa: E402

DIGESTS = ICI / 'digests'


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
            "Bonjour,\n\n#2 premier avis\n#5 : avec deux-points\n#2 — suite du 2\n#9 voir https://example.com/page#3 ici")
        self.assertEqual(general, 'Bonjour,')
        self.assertEqual(avis, [
            (2, 'premier avis\n\nsuite du 2'),
            (5, 'avec deux-points'),
            (9, 'voir https://example.com/page#3 ici'),
        ])

    def test_sans_numero(self):
        self.assertEqual(fr.decouper_avis('Rien à dire cette semaine.'), ('Rien à dire cette semaine.', []))

    def test_numero_sans_texte_ignore(self):
        self.assertEqual(fr.decouper_avis('#1\n#2 oui')[1], [(2, 'oui')])


class AnalyseReponse(unittest.TestCase):
    def test_faux_email_complet(self):
        resultat = fr.analyser(lire_eml('reponse-exemple.eml'), DIGESTS)
        self.assertEqual(resultat['digest'], '2026-10-19')
        self.assertEqual(resultat['commentaire_general'], 'Bonjour,\nquelques avis pour cette semaine.')
        numeros = [a['numero'] for a in resultat['avis']]
        self.assertEqual(numeros, [1, 3, 2, 7])
        avis = {a['numero']: a for a in resultat['avis']}
        self.assertIn("Le RGPD n'est pas le seul critère", avis[1]['avis'])
        self.assertEqual(avis[1]['article']['titre'], 'G7 choisit le cloud SecNumCloud de S3NS')
        self.assertIn('https://example.com/page#3', avis[3]['avis'])
        self.assertEqual(avis[2]['avis'].count('\n\n'), 1)  # les deux « #2 » regroupés
        self.assertIsNone(avis[7]['article'])
        self.assertIn('#7 ne correspond à aucun article du digest.', resultat['avertissements'])
        texte_complet = ' '.join(a['avis'] for a in resultat['avis'])
        self.assertNotIn('Dylan', texte_complet)          # signature retirée
        self.assertNotIn('VPS1Euro', texte_complet)       # e-mail d'origine retiré
        self.assertNotIn('reponse-test-1', str(resultat))  # Message-ID jamais en clair
        self.assertEqual(len(resultat['id']), 32)

    def test_reponse_html_seulement(self):
        html = ('<div dir="ltr"><div>#1 avis en HTML</div><div>#2 deuxième&nbsp;avis</div></div><br>'
                '<div class="gmail_quote"><div dir="ltr" class="gmail_attr">Le lun. 19 oct. 2026, Veille a écrit :</div>'
                '<blockquote>#1 G7 choisit le cloud</blockquote></div>')
        resultat = fr.analyser(reponse('', html=html), DIGESTS)
        self.assertEqual([(a['numero'], a['avis']) for a in resultat['avis']], [(1, 'avis en HTML'), (2, 'deuxième avis')])

    def test_email_de_veille_lui_meme_ignore(self):
        message = reponse('#1 G7', objet='[Veille souveraineté] Semaine du 19/10/2026 — 3 actualités',
                          X_Veille_Digest='2026-10-19')
        self.assertIsNone(fr.analyser(message, DIGESTS))

    def test_autre_expediteur_ou_autre_objet_ignore(self):
        self.assertIsNone(fr.analyser(reponse('#1 x', From='Autre <autre@example.com>'), DIGESTS, 'moi@example.com'))
        self.assertIsNotNone(fr.analyser(reponse('#1 x'), DIGESTS, 'MOI@example.com'))
        self.assertIsNone(fr.analyser(reponse('#1 x', objet='Re: autre sujet'), DIGESTS))

    def test_digest_absent(self):
        resultat = fr.analyser(reponse('#1 x', objet='Re: [Veille souveraineté] Semaine du 05/01/2026 — 2 actualités'), DIGESTS)
        self.assertEqual(resultat['digest'], '2026-01-05')
        self.assertIsNone(resultat['avis'][0]['article'])
        self.assertTrue(any('introuvable' in a for a in resultat['avertissements']))

    def test_empreinte_stable(self):
        self.assertEqual(fr.empreinte('<a@example.com>'), fr.empreinte(' <a@example.com> '))
        self.assertNotEqual(fr.empreinte('<a@example.com>'), fr.empreinte('<b@example.com>'))


if __name__ == '__main__':
    unittest.main()
