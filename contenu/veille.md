---
fil-ariane: Veille
titre-onglet: Veille technologique
titre-seo: Veille technologique BTS SIO SISR — Dylan JOFFREDO
description: Veille technologique de Dylan JOFFREDO (BTS SIO SISR, Nantes) : gestion du parc informatique et souveraineté numérique des PME, cybersécurité des joueurs.
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

Ma veille part d'un projet concret : Reboot, un atelier de réparation informatique avec une salle gaming de 15 PC et des contrats de maintenance pour les professionnels et les particuliers. Chaque veille suit un domaine différent de l'informatique et répond à une question que pose ce projet.

## Trois domaines | Trois veilles, trois domaines : système, réseau et cybersécurité

Chaque fiche présente la problématique, les actualités suivies avec leurs sources, mes synthèses et mon analyse critique.

::: quetes veilles
### Gérer le parc informatique d'une PME
catégorie: système
statut: en cours
fiche: pages/veille/systeme.html
résumé: Gérer le parc informatique d'une PME : quelles bonnes pratiques et quels risques ?
cadre: Veille en formation (BTS SIO)
période: depuis octobre 2026
thèmes: GLPI, Déploiement, Mises à jour, Sauvegardes, Fin de support
récompenses: Développement pro.

### Souveraineté numérique
catégorie: réseau
statut: en cours
fiche: pages/veille/reseau.html
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

Ma veille est automatisée avec un script Google Apps Script. Chaque soir, il lit 21 flux RSS de sites spécialisés et garde les articles récents qui correspondent à mes trois sujets : réseau, système et cybersécurité. Chaque lundi matin, je reçois un e-mail qui regroupe ces articles. J'y réponds avec mon avis sur les articles qui m'intéressent et une courte synthèse de la semaine. Au début de chaque mois, je regroupe ces synthèses de la semaine en une synthèse mensuelle.

::: details Voir comment ça marche en détail
### Étape I | Chaque soir : la collecte

Vers 18 h, le script lit les flux RSS de mes sources : 5 pour la veille réseau, 5 pour la veille système et 14 pour la veille cybersécurité, soit 21 sites différents, car certains servent à deux veilles. Les veilles système et cybersécurité utilisent aussi 21 recherches Google Actualités, en français et en anglais.

Il ne garde que les articles des sept derniers jours dont le titre ou le résumé contient les bons mots-clés :

- **Réseau** — un mot du sujet : souveraineté numérique, cloud souverain, SecNumCloud, Cloud Act, RGPD, OVHcloud, Scaleway…
- **Système** — un mot du parc (PC, poste, Windows, serveur…) **et** un mot de sa gestion (inventaire, GLPI, déploiement, mise à jour, sauvegarde, fin de support…).
- **Cybersécurité** — une menace (infostealer, phishing, vol de compte, arnaque, ransomware…) **et** un mot du jeu vidéo (joueur, Steam, Discord, cheat, Twitch…).

Un article n'est retenu que pour une seule veille.

### Étape II | Chaque lundi : l'e-mail de la semaine

Vers 7 h 45, je reçois un seul e-mail pour mes trois veilles, avec une section par veille : 8 articles au plus pour la veille réseau, 6 pour la veille système et 10 pour la veille cybersécurité. Chaque article porte un numéro qui commence par la lettre de sa veille (R pour réseau, S pour système, C pour cybersécurité), puis son titre, sa source, sa date, sa langue, un extrait et le lien.

- Un article déjà envoyé n'est jamais renvoyé.
- En cybersécurité, une même actualité reprise par plusieurs sites n'apparaît qu'une fois, sous la source la plus fiable, et les articles sont classés par pertinence.

### Étape III | Ma réponse : mes avis et la synthèse de la semaine

Je réponds à l'e-mail en donnant mon avis sur les articles qui m'intéressent, avec leur numéro (« #C2 je pense que… »). Je termine par une courte synthèse de la semaine, sur une ligne qui commence par « #SEMAINE ».

### Étape IV | Chaque mois : la synthèse publiée

Au début du mois, un script Python lit mes réponses dans Gmail et retrouve l'article commenté par chaque avis. Avec un assistant IA (Claude), mes synthèses de la semaine, complétées par mes avis, sont regroupées en une synthèse par veille : l'orthographe et le style sont corrigés, mais mon opinion reste la même et aucun fait n'est ajouté. Je compare mes phrases d'origine avec la version reformulée, je valide, puis la synthèse est publiée sur la fiche de la veille.

Le code de cette automatisation est public : [dossier veille sur GitHub](https://github.com/dylanjfd/dylanjfd.github.io/tree/main/veille).
:::

## Progression | Tableau de synthèse E5 {centre}

Toutes les réalisations et les compétences mobilisées pour chacune sont récapitulées dans le tableau de synthèse.

::: actions
- [Consulter le tableau E5](pages/tableau-e5.html)
:::
