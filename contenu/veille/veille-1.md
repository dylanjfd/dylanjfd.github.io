---
mise-en-page: fiche
fil-ariane: Veille réseau
titre-onglet: Veille réseau : souveraineté numérique
parent: [Veille](pages/veille.html)
titre-seo: Veille réseau : souveraineté numérique — Dylan JOFFREDO
description: Veille réseau BTS SIO SISR de Dylan JOFFREDO sur la souveraineté numérique des PME : problématique, méthode, synthèses mensuelles et sources fiables.
---

<!--
  FICHE DE VEILLE — RÉSEAU (pages/veille/reseau.html) — « Codex »
  Sujet : la souveraineté numérique est-elle accessible aux PME ?
  Veille de la catégorie réseau (lettre R dans l'e-mail du lundi : #R1, #R2…, voir veille/apps-script/Code.gs).
  Le fichier garde son nom (veille-1.md) : /veille écrit dedans.
  Même structure que contenu/veille/systeme.md et cybersecurite.md.
  - L'en-tête : titre, problématique, badges (catégorie, puis terminée ou en cours) et infos.
  - Chaque « ## Surtitre | Titre » est une partie de la fiche ; les blocs « ::: encart » vont dans la colonne de droite.
  - Synthèses : une carte par mois entre les marqueurs SYNTHESES ci-dessous, dans l'ordre chronologique (la plus récente en dernier).
    Claude les rédige à partir de tes réponses « #R… » aux e-mails de veille
    (voir le README, section « Veille automatisée »). Ne supprime pas les marqueurs.
    Format : « ### Entrée I | Titre », lignes date: et sources:, puis « Résumé » et « Mon analyse ».
  - Sources : tableau Markdown (source, type, pourquoi elle est fiable).
  - Textes à rédiger : masqués en commentaire (« À RÉDIGER ») pour ne pas afficher de case jaune
    en ligne. Remplace-les par ton texte et retire les marqueurs de commentaire.
-->

# Codex · Veille réseau | Souveraineté numérique des PME

La souveraineté numérique est-elle accessible aux PME ? Le sujet de ma veille, ma méthode, mes sources, mes synthèses mensuelles et mon analyse critique.

::: badges
réseau, en cours
:::

::: infos
Catégorie: Réseau
Cadre: Veille en formation (BTS SIO)
Période: Depuis octobre 2026
Rythme: Une synthèse par semaine, regroupée en une synthèse par mois
:::

## Prologue | Introduction

Tout d'abord, qu'est-ce que la souveraineté numérique ?

> La souveraineté numérique, c'est la capacité d'un pays, d'une organisation ou d'une personne à garder le contrôle sur ses données et ses outils numériques, sans dépendre d'acteurs étrangers qui pourraient y accéder, les bloquer ou imposer leurs règles.

Elle repose sur trois questions simples :

- Où sont mes données ?
- Quelle loi s'applique ?
- Puis-je changer de fournisseur ?

Être souverain ne signifie pas refuser tous les outils étrangers. Il s'agit de faire des choix en connaissance de cause : identifier les données sensibles, savoir où elles vont, et garder une porte de sortie.

Pour une grande organisation, ces choix sont confiés à des équipes spécialisées. Mais qu'en est-il des petites structures ? C'est la question à laquelle cette veille tente de répondre : la souveraineté numérique est-elle accessible aux PME, ou reste-t-elle réservée aux grandes organisations ?

## Question de la quête | Problématique

> **La souveraineté numérique est-elle accessible aux PME, ou reste-t-elle réservée aux grandes organisations ?**

## Origine de la quête | Pourquoi ce sujet

<!-- À RÉDIGER : explique le lien avec ton projet d'hébergement du portfolio sur un VPS : quel hébergeur choisir (européen ou américain), où sont stockées les données, quelle loi s'applique, pourrais-tu changer facilement de fournisseur ? -->

Projet lié : [Projet serveur web](pages/projets/projet-1.html).

## Carte du codex | Les axes suivis

- **Cadre légal** — le RGPD, règlement européen qui protège les données personnelles, face au Cloud Act, loi américaine qui permet aux autorités des États-Unis d'exiger d'un fournisseur américain les données qu'il détient, même stockées en Europe.
- **Labels de confiance** — la qualification SecNumCloud, délivrée par l'ANSSI aux offres de cloud qui respectent ses exigences de sécurité et de protection face aux lois extra-européennes.
- **Marché des hébergeurs** — les offres européennes (OVHcloud, Scaleway…) face aux fournisseurs américains (AWS, Microsoft Azure, Google Cloud).
- **Évolution des prix** — ce que coûte une solution souveraine pour une petite structure, comparée aux offres américaines.
- **Cas concrets** — choix d'hébergement d'organisations, décisions de la CNIL, incidents et migrations.

## Entrées du codex | Synthèses

Une synthèse par mois, de la plus ancienne à la plus récente : l'actualité, puis mon analyse.

::: cartes depliables
<!-- SYNTHESES:START -->
### Entrée I | Cloud de confiance : des offres concrètes, mais encore dépendantes
date: Octobre 2026
sources: [LeMagIT — Le cloud Bleu est là](https://www.lemagit.fr/actualites/366652544/Le-cloud-Bleu-est-la), [Next — On a testé VPS1Euro](https://next.ink/262503/on-a-teste-vps1euro-12-euro-cest-deja-beaucoup-trop-cher/), [Le Monde Informatique — G7 choisit le cloud SecNumCloud de S3NS](https://www.lemondeinformatique.fr/actualites/lire-g7-choisit-le-cloud-secnumcloud-de-s3ns-100847.html), [LeMagIT — Snowflake se rapproche de Bleu et d'Orange Business](https://www.lemagit.fr/actualites/366652398/Cloud-de-confiance-Snowflake-se-rapproche-de-Bleu-et-dOrange-Business)

**Résumé :** Bleu (Orange et Capgemini) passe en production avec des garanties de service et une soixantaine de clients, G7 choisit le cloud de S3NS (Thales, sur une technologie Google Cloud) et Snowflake annonce vouloir confier l'exploitation de sa plateforme à Orange Business. À l'opposé, Next a testé VPS1Euro, un serveur à très bas prix aux nombreuses lacunes.

**Mon analyse :** Ces alternatives souveraines sont encourageantes : elles permettent de garder le contrôle de ses données sans renoncer aux technologies les plus performantes, et Snowflake répond au Cloud Act en confiant l'exploitation à des équipes européennes. Mais elles reposent sur une technologie américaine (Azure, Google Cloud, Snowflake) : une dépendance demeure, notamment pour les mises à jour. Je pense que les organisations qui cherchent un cloud vraiment sécurisé attendront la qualification SecNumCloud de Bleu, prévue pour la fin de l'année, avant de s'engager. Quant à VPS1Euro, il montre qu'en visant le prix le plus bas, on peut perdre gros (mot de passe root envoyé en clair, correctifs avec des années de retard, matériel de 2013) : c'est au mieux un outil de test.

### Entrée II | Souveraineté numérique : des offres européennes concrètes, mais des dépendances à surveiller
date: Novembre 2026
sources: [Next — 50 VPS à moins de 10 euros par mois](https://next.ink/261825/notre-comparatif-maison-de-50-vps-a-10-euros-maximum-par-mois/), [Next — la messagerie du CNRS migre vers Partage de Renater](https://next.ink/265651/le-cnrs-continue-son-menage-anti-gafam-sa-messagerie-migre-vers-partage-de-renater/), [Le Monde Informatique — Bull et Schwarz Digits pour un cloud souverain dédié à l'IA](https://www.lemondeinformatique.fr/actualites/lire-bull-et-schwarz-digits-s-allient-pour-developper-un-cloud-souverain-europeen-dedie-a-l-ia-100903.html), [Le Monde Informatique — BlackLine se déploie sur S3NS](https://www.lemondeinformatique.fr/actualites/lire-blackline-se-deploie-sur-s3ns-100897.html), [LeMagIT — 10 critères pour assurer sa souveraineté numérique](https://www.lemagit.fr/conseil/10-criteres-pour-assurer-sa-souverainete-numerique), [Le Monde Informatique — DEEP et l'hyperscaler cloud européen](https://www.lemondeinformatique.fr/infrastructure-cloud/titre-sebastien-genesca-directeur-general-de-deep-l-europe-doit-se-donner-les-moyens-de-faire-emerger-un-veritable-hyperscaler-cloud-europeen), [LeMagIT — OVHai Workspace](https://www.lemagit.fr/actualites/366655152/OVHai-Workspace-la-suite-collaborative-nourrit-la-feuille-de-route-IA-dOVHcloud), [Le Monde Informatique — les cinq mesures de Numeum](https://www.lemondeinformatique.fr/cybersecurite-conformite/presidentielle-2027-numeum-propose-cinq-mesures-pour-renforcer-la-souverainete-numerique-francaise), [Next — l'IA souveraine d'OVHcloud avec Qwant, Shadow et Staan](https://next.ink/268119/ovhcloud-des-modeles-et-une-infrastructure-ia-souverains-avec-qwant-shadow-et-staan/)

**Résumé :** Le CNRS migre la messagerie de ses agents vers Partage de Renater, Bull et Schwarz Digits s'allient pour un cloud souverain dédié à l'IA, et l'éditeur américain BlackLine s'installe sur le cloud de confiance S3NS. Fin novembre, OVHcloud multiplie les annonces : sa suite collaborative OVHai Workspace en accès anticipé et une IA européenne de bout en bout avec Qwant, Shadow et EUSP. DEEP, qui appuie son cloud souverain sur OVHcloud, appelle à faire émerger un hyperscaler européen, et Numeum propose cinq mesures pour la présidentielle de 2027.

**Mon analyse :** Ce mois-ci, j'ai compris que la souveraineté numérique ne se limite pas au lieu où sont hébergées les données. Pour une PME au budget limité, un VPS à moins de 10 € par mois suffit pour des services courants (VPN, gestionnaire de mots de passe, petit site) et, chez un hébergeur français ou européen indépendant des sociétés américaines, il met ses données hors de portée du Cloud Act. La souveraineté avance aussi à plus grande échelle, mais à des degrés différents. Le CNRS quitte les GAFAM pour Partage de Renater, basé sur le logiciel libre Zimbra, à condition que les agents adoptent l'outil. Bull et Schwarz Digits se complètent (serveurs IA fabriqués à Angers, cloud STACKIT), mais ce n'est encore qu'un protocole d'accord, sans calendrier ni chiffres. L'exemple de BlackLine sur S3NS montre qu'il faut distinguer « cloud de confiance » et « cloud souverain » : un hébergement en France sous SecNumCloud protège du Cloud Act, mais la dépendance technologique à Google et à un éditeur américain demeure. La grille d'Olivier Klein m'a donné une méthode : connaître sa chaîne de dépendances, se préparer à une coupure unilatérale de service (kill switch) et assurer sa réversibilité, c'est-à-dire pouvoir partir sans tout reconstruire. L'affaire Grok Build rappelle un autre risque : une PME qui fait générer ses applications par l'IA d'un éditeur américain ne maîtrise ni leur code ni leur sécurité. Fin novembre, les offres européennes se concrétisent, mais restent fragiles. OVHai Workspace, hébergée en France, est une alternative à Microsoft 365 et à Google Workspace, mais elle est encore en Alpha et sans prix : je la testerais d'abord avec un petit groupe pilote. OVHcloud, Qwant, Shadow et EUSP construisent une IA entièrement européenne, mais ces entreprises gravitent toutes autour d'Octave Klaba. DEEP s'appuie sur OVHcloud pour son cloud souverain. Reste à savoir si ses tarifs resteront compétitifs face aux hyperscalers américains. Les propositions de Numeum vont dans le bon sens face au retard de la France en R&D, mais certaines restent vagues, et elles défendent d'abord les intérêts des entreprises du secteur. Beaucoup de choses reposent donc sur OVHcloud, ce qui montre à la fois sa force et le manque d'alternatives : pour une PME, choisir européen ne suffit pas, il faut aussi éviter de remplacer une dépendance à Microsoft par une dépendance à un seul fournisseur. Ces annonces sont encourageantes, mais la plupart restent des projets : une suite en Alpha, des partenariats tout juste signés et des propositions de campagne. Je suivrai la sortie d'OVHai Workspace et son prix, car c'est ce qui décidera si une PME peut vraiment l'utiliser au quotidien.
<!-- SYNTHESES:END -->
:::

<!-- À RÉDIGER : section masquée tant qu'elle n'est pas écrite. Pour l'afficher, supprime cette ligne et la dernière ligne du commentaire.

## Bilan du chroniqueur | Analyse critique et bilan

Ce que ta veille t'a appris : la souveraineté numérique est-elle accessible aux PME ? Tendances observées, limites des sources consultées, conséquences pour une organisation et pour ton futur métier.

- Tendance observée 1
- Tendance observée 2
- Point de vigilance ou question ouverte
-->

## Bibliothèque | Sources

Des sources reconnues, organismes publics et presse spécialisée, recoupées entre elles avant chaque synthèse.

::: tableau Sources de la veille : type et fiabilité
| Source | Type | Pourquoi elle est fiable |
|---|---|---|
| [ANSSI / CERT-FR](https://www.cert.ssi.gouv.fr/) | Agence de l'État | Autorité nationale de cybersécurité : elle publie les alertes officielles et délivre la qualification SecNumCloud. |
| [CNIL](https://www.cnil.fr/) | Autorité administrative indépendante | Régulateur du RGPD en France : ses recommandations, décisions et sanctions sont des sources de première main. |
| [Next](https://next.ink/) | Presse spécialisée | Média consacré au numérique, dont les articles renvoient vers les textes et documents d'origine. |
| [LeMagIT](https://www.lemagit.fr/) | Presse professionnelle | Rédaction spécialisée dans l'informatique d'entreprise : cloud, infrastructures, sécurité. |
| [Le Monde Informatique](https://www.lemondeinformatique.fr/) | Presse professionnelle | Titre historique de la presse informatique professionnelle, qui suit l'actualité des fournisseurs de cloud. |
:::

## Du codex au terrain | Mise en pratique

> Le choix de l'hébergement de mon portfolio met cette veille en pratique : [Projet serveur web](pages/projets/projet-1.html). Mes tests en machines virtuelles sont regroupés dans ma fiche projet [Labo : gestion et sécurisation d'un parc de PC gaming](pages/projets/labo-parc-gaming.html).

::: encart
## Codex | Liens avec mes autres veilles
- **Système** — les images et les sauvegardes des PC de Reboot : où les héberger, et sous quelle loi ? [Voir ma veille système](pages/veille/systeme.html).
- **Cybersécurité** — les données des clients de l'atelier sont des données personnelles, protégées par le RGPD : [voir ma veille cybersécurité](pages/veille/cybersecurite.html).
:::

::: encart competences
## Récompenses | Compétences E5 mobilisées
- Organiser son développement professionnel
:::

::: navigation Navigation entre les veilles
- [Veille précédente : système](pages/veille/systeme.html)
- [Veille suivante : cybersécurité](pages/veille/cybersecurite.html)
:::
