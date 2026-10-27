---
fil-ariane: Veille
titre-onglet: Veille technologique
---

<!--
  PAGE VEILLE (pages/veille.html) — « Codex »
  Une carte par veille, comme sur la page Projets, dans un bloc « ::: quetes veilles »
  (pas de type ni de filtre) :
    ### Titre de la veille
    catégorie: système, réseau ou cybersécurité (badge coloré avec icône ; sans catégorie : badge « Veille »)
    statut: terminée ou en cours
    fiche: chemin de la page détaillée (pages/veille/systeme.html…)
    résumé: une phrase qui présente la veille (sa problématique)
    cadre: Veille en formation (BTS SIO), Alternance — 2e année…
    période: ex. depuis octobre 2026
    thèmes: liste séparée par des virgules
    récompenses: 3 compétences E5 au maximum, en version courte, séparées par des virgules
  Chaque ligne doit commencer par son nom de champ suivi de « : » ; une ligne mal écrite est ignorée.
  Le détail de chaque veille est dans contenu/veille/systeme.md, veille-1.md (réseau : souveraineté
  numérique, ne pas renommer) et cybersecurite.md. Les trois reçoivent les synthèses de /veille,
  à partir de l'e-mail de veille du lundi (numéros S, R et C, voir veille/apps-script/Code.gs).
  Pour ajouter une veille : voir contenu/GUIDE-MARKDOWN.md, section « Ajouter une veille ».
-->

# Codex | Veille technologique

Ma veille part d'un projet concret : Reboot, un atelier de réparation informatique avec une salle gaming de 25 PC et des contrats de maintenance pour les professionnels et les particuliers. Chaque veille suit un domaine différent de l'informatique et répond à une question que pose ce projet.

## Trois domaines | Trois veilles, trois domaines : système, réseau et cybersécurité

Chaque fiche présente la problématique, les actualités suivies avec leurs sources, mes synthèses et mon analyse critique.

::: quetes veilles
### Gérer un parc de PC en libre-service
catégorie: système
statut: en cours
fiche: pages/veille/systeme.html
résumé: Déploiement d'images, restauration au redémarrage ou diskless : quelle solution pour gérer les 25 PC d'une salle gaming comme Reboot ?
cadre: Veille en formation (BTS SIO)
période: depuis octobre 2026
thèmes: FOG Project, Clonezilla, Unified Write Filter, Diskless
récompenses: Développement pro.

### Souveraineté numérique
catégorie: réseau
statut: en cours
fiche: pages/veille/veille-1.html
résumé: La souveraineté numérique est-elle accessible aux PME, ou reste-t-elle réservée aux grandes organisations ?
cadre: Veille en formation (BTS SIO)
période: depuis octobre 2026
thèmes: RGPD, Cloud Act, SecNumCloud, OVHcloud, Scaleway
récompenses: Développement pro.

### Pourquoi les joueurs sont-ils l'une des cibles favorites des cybercriminels ?
catégorie: cybersécurité
statut: en cours
fiche: pages/veille/cybersecurite.html
résumé: Comment protéger les joueurs et un lieu de jeu comme Reboot face à ces menaces ?
cadre: Veille en formation (BTS SIO)
période: depuis octobre 2026
thèmes: Infostealers, Faux cheats, Arnaques Discord, Vol de comptes
récompenses: Développement pro.

:::

## Grimoire | Comment fonctionne ma veille

Ma veille est automatisée avec un script Google Apps Script. Chaque soir, il lit 14 flux RSS de sites spécialisés et garde les articles récents qui correspondent à mes trois sujets : réseau, système et cybersécurité. Chaque lundi matin, je reçois un e-mail qui regroupe ces articles. J'y réponds avec mon avis sur les articles qui m'intéressent et une courte synthèse de la semaine. Au début de chaque mois, je regroupe ces synthèses de la semaine en une synthèse mensuelle.

## Progression | Tableau de synthèse E5 {centre}

Toutes les réalisations et les compétences mobilisées pour chacune sont récapitulées dans le tableau de synthèse.

::: actions
- [Consulter le tableau E5](pages/tableau-e5.html)
:::
