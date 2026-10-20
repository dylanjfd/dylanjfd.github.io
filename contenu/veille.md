---
fil-ariane: Veille
---

<!--
  PAGE VEILLE (pages/veille.html) — « Codex »
  Sujet : la souveraineté numérique est-elle accessible aux PME ?
  - Synthèses : une carte par mois entre les marqueurs SYNTHESES ci-dessous, la plus récente en premier.
    Claude les rédige à partir de tes réponses aux e-mails de veille
    (voir le README, section « Veille automatisée »). Ne supprime pas les marqueurs.
    Format : « ### Entrée I | Titre », lignes date: et sources:, puis « Résumé » et « Mon analyse ».
  - Sources : tableau Markdown (source, type, pourquoi elle est fiable).
  - Textes à rédiger : masqués en commentaire (« À RÉDIGER ») pour ne pas afficher de case jaune
    en ligne. Remplace-les par ton texte et retire les marqueurs de commentaire.
-->

# Codex | Veille technologique

La souveraineté numérique est-elle accessible aux PME ? Le sujet de ma veille, ma méthode, mes sources, mes synthèses mensuelles et mon analyse critique.

## Prologue | Introduction

Tout d'abord, qu'est-ce que la souveraineté numérique ?

> La souveraineté numérique, c'est la capacité d'un pays, d'une organisation ou d'une personne à garder le contrôle sur ses données et ses outils numériques, sans dépendre d'acteurs étrangers qui pourraient y accéder, les bloquer ou imposer leurs règles.

Elle repose sur trois questions simples :

- Où sont mes données ?
- Quelle loi s'applique ?
- Puis-je changer de fournisseur ?

Être souverain ne signifie pas refuser tous les outils étrangers. Il s'agit de faire des choix en connaissance de cause : identifier les données sensibles, savoir où elles vont, et garder une porte de sortie.

Pour une grande organisation, ces choix sont confiés à des équipes spécialisées. Mais qu'en est-il des petites structures ? C'est la question à laquelle cette veille tente de répondre : la souveraineté numérique est-elle accessible aux PME, ou reste-t-elle réservée aux grandes organisations ?

::: colonnes

## Origine de la quête | Pourquoi ce sujet

<!-- À RÉDIGER : explique le lien avec ton projet d'hébergement du portfolio sur un VPS : quel hébergeur choisir (européen ou américain), où sont stockées les données, quelle loi s'applique, pourrais-tu changer facilement de fournisseur ? -->

Projet lié : [Projet serveur web](pages/projets/projet-1.html).

## Carte du codex | Les axes suivis

- **Cadre légal** — le RGPD, règlement européen qui protège les données personnelles, face au Cloud Act, loi américaine qui permet aux autorités des États-Unis d'exiger d'un fournisseur américain les données qu'il détient, même stockées en Europe.
- **Labels de confiance** — la qualification SecNumCloud, délivrée par l'ANSSI aux offres de cloud qui respectent ses exigences de sécurité et de protection face aux lois extra-européennes.
- **Marché des hébergeurs** — les offres européennes (OVHcloud, Scaleway…) face aux fournisseurs américains (AWS, Microsoft Azure, Google Cloud).
- **Évolution des prix** — ce que coûte une solution souveraine pour une petite structure, comparée aux offres américaines.
- **Cas concrets** — choix d'hébergement d'organisations, décisions de la CNIL, incidents et migrations.

:::

## Grimoire | Méthode et outils

- **Alertes par mots-clés** — souveraineté numérique, cloud souverain, SecNumCloud, Cloud Act, hébergeur, RGPD, données personnelles, PME, OVHcloud, Scaleway…
- **Flux RSS** — les sites des sources ci-dessous, lus automatiquement chaque jour.
- **Collecte hebdomadaire par e-mail** — un script Google Apps Script garde les articles des sept derniers jours qui contiennent un mot-clé ; chaque lundi matin, je reçois par e-mail les dix plus récents, numérotés.
- **Synthèses relues** — je réponds à l'e-mail en donnant mon avis sur les articles qui m'intéressent (« #2 je pense que… ») ; chaque mois, mes avis sont regroupés et reformulés avec un assistant IA (Claude), puis je relis et valide la synthèse avant de la publier ici.
- **Rythme** — une collecte par semaine, une synthèse par mois.

Le code de cette automatisation est public : [dossier veille sur GitHub](https://github.com/dylanjfd/dylanjfd.github.io/tree/main/veille).

## Bibliothèque | Sources

Des sources reconnues, organismes publics et presse spécialisée, recoupées entre elles avant chaque synthèse.

| Source | Type | Pourquoi elle est fiable |
|---|---|---|
| [ANSSI / CERT-FR](https://www.cert.ssi.gouv.fr/) | Agence de l'État | Autorité nationale de cybersécurité : elle publie les alertes officielles et délivre la qualification SecNumCloud. |
| [CNIL](https://www.cnil.fr/) | Autorité administrative indépendante | Régulateur du RGPD en France : ses recommandations, décisions et sanctions sont des sources de première main. |
| [Next](https://next.ink/) | Presse spécialisée | Média consacré au numérique, dont les articles renvoient vers les textes et documents d'origine. |
| [LeMagIT](https://www.lemagit.fr/) | Presse professionnelle | Rédaction spécialisée dans l'informatique d'entreprise : cloud, infrastructures, sécurité. |
| [Le Monde Informatique](https://www.lemondeinformatique.fr/) | Presse professionnelle | Titre historique de la presse informatique professionnelle, qui suit l'actualité des fournisseurs de cloud. |

## Entrées du codex | Synthèses

Une synthèse par mois, de la plus récente à la plus ancienne : l'actualité, puis mon analyse.

::: cartes
<!-- SYNTHESES:START -->
<!-- SYNTHESES:END -->
:::

<!-- À RÉDIGER : section masquée tant qu'elle n'est pas écrite. Pour l'afficher, supprime cette ligne et la dernière ligne du commentaire.

## Bilan du chroniqueur | Analyse critique et bilan

Ce que ta veille t'a appris : la souveraineté numérique est-elle accessible aux PME ? Tendances observées, limites des sources consultées, conséquences pour une organisation et pour ton futur métier.

- Tendance observée 1
- Tendance observée 2
- Point de vigilance ou question ouverte
-->
