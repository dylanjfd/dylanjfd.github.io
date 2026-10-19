"""Tests de collect.py : mots-clés, nettoyage des résumés, sélection et objet de l'e-mail.

Lancer depuis la racine du dépôt :  python -m unittest discover -s veille/tests -v
"""

import sys
import unittest
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import collect  # noqa: E402

MOTS_CLES = ['souveraineté numérique', 'Cloud Act', 'hébergeur', 'PME', 'SecNumCloud', 'données personnelles']


class MotsCles(unittest.TestCase):
    def setUp(self):
        self.motif = collect.motif_mots_cles(MOTS_CLES)

    def trouve(self, texte):
        return bool(self.motif.search(collect.sans_accents(texte)))

    def test_accents_majuscules_pluriels(self):
        self.assertTrue(self.trouve('La SOUVERAINETE NUMERIQUE en question'))
        self.assertTrue(self.trouve('Les hébergeurs européens'))
        self.assertTrue(self.trouve('Offre secnumcloud'))
        self.assertTrue(self.trouve('Protéger ses données personnelles'))
        self.assertTrue(self.trouve('Les PME face au cloud'))

    def test_mots_entiers_seulement(self):
        self.assertFalse(self.trouve('Les cloud acteurs du marché'))
        self.assertTrue(self.trouve('Le Cloud Act américain'))
        self.assertFalse(self.trouve('Un développement spmexx'))


class Nettoyage(unittest.TestCase):
    def test_html_encode_deux_fois(self):
        self.assertEqual(collect.texte_brut('&lt;p&gt;Souveraineté.&amp;nbsp;Le &lt;a href="x"&gt;lien&lt;/a&gt;'),
                         'Souveraineté. Le lien')

    def test_extrait_deux_lignes(self):
        lignes = collect.lignes_extrait('mot ' * 100)
        self.assertEqual(len(lignes), 2)
        self.assertTrue(lignes[-1].endswith('…'))

    def test_lien_sans_suivi(self):
        self.assertEqual(collect.normaliser_lien('https://a.fr/x?utm_source=rss&id=3#haut'), 'https://a.fr/x?id=3')


class Selection(unittest.TestCase):
    def test_tri_doublons_numerotation(self):
        articles = [
            {'titre': 'Ancien', 'source': 'A', 'date': '2026-10-13T08:00:00+00:00', 'lien': 'https://a.fr/1', 'resume': ''},
            {'titre': 'Récent', 'source': 'B', 'date': '2026-10-18T08:00:00+00:00', 'lien': 'https://b.fr/2', 'resume': ''},
            {'titre': 'Déjà envoyé', 'source': 'C', 'date': '2026-10-19T08:00:00+00:00', 'lien': 'https://c.fr/3', 'resume': ''},
        ]
        choix = collect.selectionner(collect.fusionner(articles, articles), {'https://c.fr/3': '2026-10-12'}, 10, premier_numero=4)
        self.assertEqual([(a['numero'], a['titre']) for a in choix], [(4, 'Récent'), (5, 'Ancien')])

    def test_maximum(self):
        articles = [{'titre': str(i), 'source': 'A', 'date': f'2026-10-1{i}T08:00:00+00:00', 'lien': f'https://a.fr/{i}', 'resume': ''}
                    for i in range(10)]
        self.assertEqual(len(collect.selectionner(articles, {}, 3)), 3)


class Objet(unittest.TestCase):
    def test_objet(self):
        jour = date(2026, 10, 19)
        self.assertEqual(collect.objet_mail(jour, 7), '[Veille souveraineté] Semaine du 19/10/2026 — 7 actualités')
        self.assertEqual(collect.objet_mail(jour, 1), '[Veille souveraineté] Semaine du 19/10/2026 — 1 actualité')
        self.assertEqual(collect.objet_mail(jour, 0), "[Veille souveraineté] Semaine du 19/10/2026 — Pas d'actualité cette semaine")

    def test_mail_sans_article(self):
        texte = collect.texte_mail([], date(2026, 10, 19), ['CNIL'], 7)
        self.assertIn("Pas d'actualité cette semaine", texte)
        self.assertNotIn('#numéro', texte)


if __name__ == '__main__':
    unittest.main()
