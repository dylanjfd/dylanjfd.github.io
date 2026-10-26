"""Tests de collect.py : mots-clés, nettoyage des résumés, trois veilles, sélection et e-mail.

Lancer depuis la racine du dépôt :  python -m unittest discover -s veille/tests -v
"""

import re
import sys
import unittest
from datetime import date, datetime, timezone
from pathlib import Path
from unittest import mock

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

    def test_pluriel_de_chaque_mot(self):
        motif = collect.motif_mots_cles(['voleur de données', 'jeu vidéo', "déploiement d'images", 'Counter-Strike'])
        for texte in ('Des voleurs de données', 'Les jeux vidéos', 'Le déploiement d’images Windows', 'Counter-Strike 2'):
            self.assertTrue(motif.search(collect.sans_accents(texte)), texte)

    def test_un_mot_de_chaque_groupe(self):
        menace = collect.motif_mots_cles(['infostealer', 'malware', 'cookie'])
        jeu = collect.motif_mots_cles(['joueur', 'Steam', 'mod'])
        self.assertTrue(collect.retenu([menace, jeu], 'Un infostealer vise les joueurs'))
        self.assertTrue(collect.retenu([menace, jeu], 'Des mods Steam piégés par un malware'))
        self.assertFalse(collect.retenu([menace, jeu], 'Nouveau malware bancaire'))
        self.assertFalse(collect.retenu([menace, jeu], 'Les joueurs de Steam en hausse'))


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
        choix = collect.selectionner(collect.fusionner(articles, articles), {'https://c.fr/3': '2026-10-12'}, 10, 'R', premier_numero=4)
        self.assertEqual([(a['numero'], a['veille'], a['titre']) for a in choix], [('R4', 'R', 'Récent'), ('R5', 'R', 'Ancien')])

    def test_maximum(self):
        articles = [{'titre': str(i), 'source': 'A', 'date': f'2026-10-1{i}T08:00:00+00:00', 'lien': f'https://a.fr/{i}', 'resume': ''}
                    for i in range(10)]
        self.assertEqual(len(collect.selectionner(articles, {}, 3, 'S')), 3)


class TroisVeilles(unittest.TestCase):
    CONFIG = {'jours': 7, 'veilles': [
        {'prefixe': 'R', 'actif': True, 'flux': [{'nom': 'Next', 'url': 'https://next'}], 'groupes_mots_cles': [['RGPD']]},
        {'prefixe': 'S', 'actif': False, 'flux': [{'nom': 'Next', 'url': 'https://next'}], 'groupes_mots_cles': [['Clonezilla']]},
        {'prefixe': 'C', 'flux': [{'nom': 'Next', 'url': 'https://next'}, {'nom': 'ZATAZ', 'url': 'https://zataz'}],
         'groupes_mots_cles': [['vol de compte', 'malware'], ['Steam', 'joueur']]},
    ]}
    FLUX = {
        'https://next': [
            {'titre': 'RGPD et vol de comptes Steam', 'resume': '', 'lien': 'https://next/1', 'source': 'Next', 'date': '2026-10-18T08:00:00+00:00'},
            {'titre': 'Clonezilla 4', 'resume': '', 'lien': 'https://next/2', 'source': 'Next', 'date': '2026-10-18T08:00:00+00:00'},
        ],
        'https://zataz': [
            {'titre': 'Vol de comptes Steam', 'resume': '', 'lien': 'https://zataz/1', 'source': 'ZATAZ', 'date': '2026-10-17T08:00:00+00:00'},
            {'titre': 'Nouveau malware bancaire', 'resume': '', 'lien': 'https://zataz/2', 'source': 'ZATAZ', 'date': '2026-10-17T08:00:00+00:00'},
        ],
    }

    def test_un_flux_lu_une_fois_un_article_par_veille(self):
        lectures = []

        def faux_flux(source, maintenant):
            lectures.append(source['url'])
            return self.FLUX[source['url']]

        maintenant = datetime(2026, 10, 19, tzinfo=timezone.utc)
        with mock.patch.object(collect, 'lire_flux', faux_flux):
            articles, erreurs, nombre = collect.collecter(self.CONFIG, maintenant)
        self.assertEqual(sorted(lectures), ['https://next', 'https://zataz'])
        self.assertEqual((erreurs, nombre), ([], 2))
        # Veille S inactive : Clonezilla n'est pas gardé. L'article RGPD + vol de compte Steam va à la première
        # veille (R). Le malware bancaire n'a aucun mot du groupe « jeu » : écarté.
        self.assertEqual([(a['veille'], a['lien']) for a in collect.fusionner(articles)],
                         [('R', 'https://next/1'), ('C', 'https://zataz/1')])

    def test_anciens_articles_et_digests_sans_lettre(self):
        self.assertEqual(collect.veille_de({'lien': 'https://a.fr'}), 'R')  # tampon d'avant les trois veilles
        ancien = {'date': '2026-10-19', 'articles': [{'numero': 1}, {'numero': 3}]}
        self.assertEqual(collect.etiquette(ancien['articles'][1]), 'R3')
        self.assertEqual(collect.prochain_numero(ancien, 'R'), 4)
        self.assertEqual(collect.prochain_numero(ancien, 'S'), 1)
        nouveau = {'date': '2026-11-02', 'articles': [{'numero': 'R2'}, {'numero': 'C12'}, {'numero': 'S1'}]}
        self.assertEqual([collect.prochain_numero(nouveau, p) for p in 'RSC'], [3, 2, 13])


class Objet(unittest.TestCase):
    VEILLES = [{'prefixe': 'R', 'categorie': 'Réseau', 'nom': 'Souveraineté numérique des PME'},
               {'prefixe': 'S', 'categorie': 'Système', 'nom': 'Parc de PC'},
               {'prefixe': 'C', 'categorie': 'Cybersécurité', 'nom': 'Joueurs'}]
    ARTICLE = {'numero': 'R1', 'veille': 'R', 'titre': 'Le cloud Bleu', 'source': 'LeMagIT', 'langue': 'FR',
               'date': '2026-10-18T08:00:00+00:00', 'lien': 'https://a.fr/1', 'extrait': 'Extrait.'}

    def sections(self, *articles):
        return [{'veille': v, 'articles': list(a)} for v, a in zip(self.VEILLES, articles)]

    def test_objet(self):
        sections = self.sections([self.ARTICLE] * 3, [], [self.ARTICLE] * 2)
        self.assertEqual(collect.objet_mail(date(2026, 10, 19), sections),
                         '[Veille] Semaine du 19/10/2026 — Réseau 3, Système 0, Cybersécurité 2')

    def test_mail_sans_article(self):
        texte = collect.texte_mail(self.sections([], [], []), date(2026, 10, 19))
        self.assertEqual(texte.count("Pas d'actualité cette semaine."), 3)
        self.assertNotIn('Réponds avec le numéro', texte)
        # Sans article, la synthèse de la semaine est quand même demandée
        self.assertTrue(texte.rstrip().endswith(
            '—\nTermine par ta synthèse de la semaine sur une ligne qui commence par #SEMAINE, par exemple : #SEMAINE cette semaine, …'))

    def test_une_section_par_veille(self):
        sections = self.sections([self.ARTICLE], [], [])
        texte = collect.texte_mail(sections, date(2026, 10, 19))
        self.assertIn('== Réseau — Souveraineté numérique des PME ==\n\n#R1 — Le cloud Bleu\n'
                      'LeMagIT · 18/10/2026 · FR\nExtrait.\nhttps://a.fr/1', texte)
        self.assertIn("== Système — Parc de PC ==\n\nPas d'actualité cette semaine.", texte)
        self.assertTrue(texte.rstrip().endswith(
            'Réponds avec le numéro suivi de ton avis, par exemple : #C2 je pense que… '
            'Termine par ta synthèse de la semaine sur une ligne qui commence par #SEMAINE, par exemple : #SEMAINE cette semaine, …'))
        page = collect.html_mail(sections, date(2026, 10, 19))
        self.assertIn('#R1</strong>', page)
        self.assertIn('>https://a.fr/1</a>', page)  # lien visible en clair, retrouvé dans le texte cité


class Configuration(unittest.TestCase):
    def test_config_du_depot(self):
        config = collect.lire_json(collect.FICHIER_CONFIG, None)
        veilles = config['veilles']
        self.assertEqual([(v['prefixe'], v['categorie'], v['articles_max']) for v in veilles],
                         [('R', 'Réseau', 8), ('S', 'Système', 6), ('C', 'Cybersécurité', 6)])
        reseau = veilles[0]
        self.assertEqual((reseau['nom'], reseau['page'], reseau['fichier'], reseau['marqueurs'], reseau['actif']),
                         ('Souveraineté numérique des PME', 'pages/veille/veille-1.html', 'contenu/veille/veille-1.md',
                          'SYNTHESES', True))
        self.assertEqual(len(veilles[2]['groupes_mots_cles']), 2)  # cybersécurité : menace ET jeu
        racine = collect.DOSSIER.parent
        for veille in veilles:
            self.assertTrue((racine / veille['page']).exists(), veille['page'])
            contenu = (racine / veille['fichier']).read_text(encoding='utf-8')
            self.assertIn(f"<!-- {veille['marqueurs']}:START -->", contenu)
            self.assertIn(f"<!-- {veille['marqueurs']}:END -->", contenu)
            self.assertTrue(veille['flux'] and all(veille['groupes_mots_cles']))
            self.assertTrue(all(f['langue'] in ('FR', 'EN') for f in veille['flux']))

    def test_meme_configuration_que_code_gs(self):
        """Code.gs fait référence : config.json doit en être la copie exacte (flux, langues, mots-clés, maximums)."""
        code = (collect.DOSSIER / 'apps-script' / 'Code.gs').read_text(encoding='utf-8')
        for veille in collect.lire_json(collect.FICHIER_CONFIG, None)['veilles']:
            self.assertIn(f"prefixe: '{veille['prefixe']}', articlesMax: {veille['articles_max']}", code)
            for flux in veille['flux']:
                self.assertRegex(code, re.escape(f"url: '{flux['url']}', langue: '{flux['langue']}'"))
            for groupe in veille['groupes_mots_cles']:
                for mot in groupe:
                    self.assertIn("'" + mot.replace("'", "\\'") + "'", code)


if __name__ == '__main__':
    unittest.main()
