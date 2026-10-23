---
mise-en-page: fiche
fil-ariane: Veille système
parent: [Veille](pages/veille.html)
---

<!--
  FICHE DE VEILLE — SYSTÈME (pages/veille/systeme.html) — « Codex »
  Structure commune aux trois veilles (système, réseau, cybersécurité) :
    Introduction → Problématique → Contenu (actualités datées et sourcées, analyse)
    → Synthèses → Analyse critique et bilan → Sources → Mise en pratique.
  - Une veille reste de la veille : les tests en machines virtuelles sont dans la fiche projet
    pages/projets/labo-parc-gaming.html (encadré « Mise en pratique » en bas de page).
  - Synthèses : une carte par mois entre les marqueurs SYNTHESES-SYSTEME, la plus récente en premier.
    Format : « ### Entrée I | Titre », lignes date: et sources:, puis le résumé et « Mon analyse ».
    Remplace la carte à compléter par ta première synthèse. Ne supprime pas les marqueurs.
  - Les blocs « ::: encart » s'affichent dans la colonne de droite.
-->

# Codex · Veille système | Gérer un parc de PC en libre-service

Ma veille système : comment installer, mettre à jour et remettre en état, d'un seul geste, tous les PC d'une salle gaming.

::: badges
système, en cours
:::

::: infos
Catégorie: Système
Cadre: Veille en formation (BTS SIO)
Période: Depuis octobre 2026
Projet lié: Reboot, salle gaming de 25 PC
:::

## Prologue | Introduction

Dans une salle gaming, les mêmes PC passent chaque jour entre les mains de clients différents. Chacun peut installer, modifier ou télécharger des fichiers pendant sa session ; le client suivant doit pourtant retrouver un poste propre, à jour et rapide.

Préparer 25 postes un par un n'est pas tenable : il faut une méthode pour installer, mettre à jour et remettre en état tout le parc d'un coup. Trois grandes approches existent, et cette veille suit leur actualité pour choisir celle qui convient à Reboot.

## Question de la quête | Problématique

> **Déploiement d'images, restauration au redémarrage ou diskless : quelle solution pour gérer les 25 PC d'une salle gaming comme Reboot ?**

## Carte du codex | Les trois approches

::: tableau Les trois approches pour gérer un parc de PC en libre-service
| Approche | Principe | Exemples d'outils |
|---|---|---|
| Déploiement d'images | On prépare un PC « modèle », puis on copie son système sur tous les autres par le réseau. | FOG Project, Clonezilla (gratuits et libres) |
| Restauration au redémarrage | Toutes les modifications faites pendant une session sont effacées au redémarrage. | Unified Write Filter (intégré à Windows), Deep Freeze, Reboot Restore Rx |
| Diskless (sans disque) | Les PC n'ont pas de disque et démarrent sur une image stockée sur un serveur central. | Senet Boot (solution pour salles gaming) |
:::

## Chroniques | Les actualités qui ont lancé ma veille

::: cartes
### Microsoft arrête son outil de déploiement MDT
date: 12 janvier 2026
source: [The Register](https://www.theregister.com/2026/01/12/microsoft_deployment_platform/)

Microsoft a mis fin au support de son outil de déploiement MDT en janvier 2026 et recommande ses outils Autopilot et Configuration Manager. Question : quelles solutions restent accessibles à une petite structure ?

### L'Unified Write Filter, réservé à certaines éditions de Windows
date: 12 juin 2026
source: [Windows OS Hub](https://woshub.com/device-lockdown-unified-write-filter-uwf-windows/)

L'Unified Write Filter est intégré à Windows, mais seulement dans les éditions Entreprise, Éducation et IoT : un vrai sujet de licence pour une PME.

### Le diskless des salles gaming : tout s'efface, mais le réseau doit suivre
date: 27 août 2026
source: [Senet](https://senet.cloud/blog/senet-boot-diskless-system), article en russe

Les systèmes diskless pour salles gaming effacent tout au redémarrage, y compris les identifiants laissés par un client, mais demandent un serveur solide et un réseau très rapide (selon l'éditeur Senet, un lien 10 Gbit/s côté serveur pour environ 30 PC).
:::

## Grille d'analyse | Comparaison des trois approches

Ma grille pour comparer les trois approches dans le cas de Reboot (25 PC en libre-service).

::: tableau Grille de comparaison des trois approches pour les 25 PC de Reboot
| Critère | Déploiement d'images | Restauration au redémarrage | Diskless |
|---|---|---|---|
| Coût (licences, matériel) | [[À compléter]] | [[À compléter]] | [[À compléter]] |
| Difficulté de mise en place | [[À compléter]] | [[À compléter]] | [[À compléter]] |
| Temps pour mettre à jour un jeu sur 25 PC | [[À compléter]] | [[À compléter]] | [[À compléter]] |
| Sécurité (retour à un état propre) | [[À compléter]] | [[À compléter]] | [[À compléter]] |
| Dépendance au réseau et au serveur | [[À compléter]] | [[À compléter]] | [[À compléter]] |
| Performances (chargement des jeux) | [[À compléter]] | [[À compléter]] | [[À compléter]] |
| Point faible principal | [[À compléter]] | [[À compléter]] | [[À compléter]] |
:::

> En diskless, le serveur est un point de défaillance unique : s'il tombe, toute la salle s'arrête.

## Entrées du codex | Synthèses

Une synthèse par mois, de la plus récente à la plus ancienne : l'actualité, puis mon analyse.

::: cartes
<!-- SYNTHESES-SYSTEME:START -->
### Entrée I | [[Titre de la synthèse]]
date: [[Mois année]]
sources: [[Liens vers les articles]]

[[Résumé de l'actualité du mois.]]

**Mon analyse :** [[ce que cette actualité change pour la salle gaming de Reboot.]]
<!-- SYNTHESES-SYSTEME:END -->
:::

## Bilan du chroniqueur | Analyse critique et bilan

[[Ce que ta veille t'a appris : quelle approche retiens-tu pour les 25 PC de Reboot, et pourquoi ? Tendances observées, limites des sources consultées, conséquences pour ton futur métier.]]

- [[Tendance observée]]
- [[Point de vigilance ou question ouverte]]

## Bibliothèque | Sources

::: sources
- [The Register — Microsoft euthanizes ancient deployment toolkit](https://www.theregister.com/2026/01/12/microsoft_deployment_platform/) — Presse informatique britannique · 12 janvier 2026
- [Windows OS Hub — Unified Write Filter](https://woshub.com/device-lockdown-unified-write-filter-uwf-windows/) — Site de tutoriels d'administration Windows · 12 juin 2026
- [Senet — SENET BOOT Diskless System](https://senet.cloud/blog/senet-boot-diskless-system) — Éditeur de la solution, donc source à recouper · article en russe · 27 août 2026
:::

## Du codex au terrain | Mise en pratique

> Mes tests en machines virtuelles liés à cette veille (Clonezilla, FOG Project, Unified Write Filter) sont dans ma fiche projet [Labo : gestion et sécurisation d'un parc de PC gaming](pages/projets/labo-parc-gaming.html).

::: encart
## Codex | Liens avec mes autres veilles
- **Cybersécurité** — la restauration au redémarrage efface un éventuel logiciel malveillant installé par un client : [voir ma veille cybersécurité](pages/veille/cybersecurite.html).
- **Réseau** — héberger les images ou les sauvegardes du parc chez un fournisseur en ligne pose la question de la souveraineté des données : [voir ma veille réseau](pages/veille/veille-1.html).
:::

::: encart competences
## Récompenses | Compétences E5 mobilisées
- Organiser son développement professionnel
:::

::: navigation Navigation entre les veilles
- [Retour à la veille](pages/veille.html)
- [Veille suivante : réseau](pages/veille/veille-1.html)
:::
