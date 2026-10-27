---
mise-en-page: fiche
fil-ariane: Veille cybersécurité
titre-onglet: Veille cybersécurité : les joueurs, cibles des cybercriminels
parent: [Veille](pages/veille.html)
---

<!--
  FICHE DE VEILLE — CYBERSÉCURITÉ (pages/veille/cybersecurite.html) — « Codex »
  Même structure que contenu/veille/systeme.md (voir les explications en tête de ce fichier).
  - Les mesures de protection de la salle, la procédure de l'atelier et les tests en machines
    virtuelles sont dans la fiche projet pages/projets/labo-parc-gaming.html.
  - Synthèses : entre les marqueurs SYNTHESES-CYBERSECURITE, la plus récente en premier.
-->

# Codex · Veille cybersécurité | Pourquoi les joueurs sont-ils l'une des cibles favorites des cybercriminels ?

Ma veille cybersécurité : les menaces qui visent les joueurs, et ce qu'elles changent pour un lieu de jeu comme Reboot.

::: badges
cybersécurité, en cours
:::

::: infos
Catégorie: Cybersécurité
Cadre: Veille en formation (BTS SIO)
Période: Depuis octobre 2026
Projet lié: Reboot, salle gaming et atelier de réparation
:::

## Prologue | Introduction

### Pourquoi les cybercriminels s'attaquent-ils aux joueurs ?

Les joueurs réunissent plusieurs éléments qui en font des cibles faciles et rentables :

- **Des comptes qui valent de l'argent.** Un compte Steam avec des jeux, des objets rares ou des skins (comme ceux de CS2) peut être revendu ou vidé contre de l'argent réel. Les comptes Discord volés servent aussi à piéger les amis de la victime.
- **Des téléchargements risqués.** Cheats, mods, versions crackées : beaucoup de joueurs téléchargent des fichiers depuis des sources non officielles. Ces fichiers sont le premier moyen de diffusion des logiciels malveillants. Certains « cheats » demandent même de désactiver l'antivirus pour fonctionner.
- **Une confiance dans la communauté.** Un lien partagé sur Discord, une vidéo YouTube, un message du type « tu peux tester mon jeu ? » : les joueurs font confiance à leur communauté, ce que les attaquants exploitent.
- **Un public jeune et nombreux.** Des millions de joueurs, souvent peu sensibilisés à la cybersécurité, sur des jeux très populaires (Roblox, Fortnite, GTA…).
- **Des PC puissants.** Leurs cartes graphiques peuvent être détournées en secret pour miner de la cryptomonnaie.
- **Des moyens de paiement enregistrés** sur les plateformes de jeu.

Résultat : selon une étude de la société Flare, 41 % des infections par des voleurs de données analysées venaient d'un fichier lié au jeu vidéo.

## Question de la quête | Problématique

> **Comment protéger les joueurs et un lieu de jeu comme Reboot face à ces menaces ?**

## Bestiaire | Comprendre les menaces

- **Voleurs de données (infostealers)** — des logiciels comme Lumma, la famille la plus fréquente dans l'étude de Flare, récupèrent en silence les identifiants enregistrés sur le PC.
- **Faux cheats, mods et cracks piégés** — le fichier promet un avantage en jeu ou un jeu gratuit, mais installe un logiciel malveillant.
- **Arnaques Discord** — un contact demande « tu peux tester mon jeu ? » et envoie un fichier piégé ; souvent, son propre compte a déjà été volé.
- **Faux sites d'échange de skins** — des copies de vrais sites qui récupèrent les identifiants Steam au moment de la connexion.

> **Point clé :** ces logiciels volent aussi les cookies de connexion, ce qui permet d'entrer dans un compte sans connaître le mot de passe ni le code de double authentification.

## Chroniques | Les actualités suivies

::: cartes
### 41 % des infections liées au jeu vidéo
date: 25 novembre 2025
source: [Flare](https://flare.io/learn/resources/cybercrime-favorite-target-gamers/)

Flare a analysé environ 50 000 infections par des voleurs de données : 41 % venaient d'un fichier lié au jeu vidéo, et Lumma était la famille la plus répandue.

### Battlefield 6 et Black Ops 7 exigent Secure Boot et TPM 2.0
date: 7 août 2025
source: [TheSixthAxis](https://www.thesixthaxis.com/2025/08/07/battlefield-6-and-black-ops-7-both-need-secure-boot-and-tpm-2-0-for-pc-anti-cheat/)

Pour lutter contre la triche, ces deux jeux demandent sur PC le démarrage sécurisé (Secure Boot) et la puce de sécurité TPM 2.0. [[Ce que j'en retiens pour les PC de Reboot.]]
:::

## Entrées du codex | Synthèses

Une synthèse par mois, de la plus récente à la plus ancienne : l'actualité, puis mon analyse.

::: cartes
<!-- SYNTHESES-CYBERSECURITE:START -->
### Entrée I | [[Titre de la synthèse]]
date: [[Mois année]]
sources: [[Liens vers les articles]]

[[Résumé de l'actualité du mois.]]

**Mon analyse :** [[ce que cette actualité change pour les joueurs et pour Reboot.]]
<!-- SYNTHESES-CYBERSECURITE:END -->
:::

## Bilan du chroniqueur | Analyse critique et bilan

[[Ce que ta veille t'a appris : comment protéger les joueurs et un lieu comme Reboot ? Tendances observées, limites des sources consultées, conséquences pour ton futur métier.]]

- [[Tendance observée]]
- [[Point de vigilance ou question ouverte]]

## Bibliothèque | Sources

::: sources
- [Flare — How Gamers Became Cybercrime's Favorite Target](https://flare.io/learn/resources/cybercrime-favorite-target-gamers/) — Société spécialisée dans la surveillance des menaces · 25 novembre 2025
- [TheSixthAxis — Battlefield 6 et Black Ops 7 exigent Secure Boot et TPM 2.0](https://www.thesixthaxis.com/2025/08/07/battlefield-6-and-black-ops-7-both-need-secure-boot-and-tpm-2-0-for-pc-anti-cheat/) — Site d'actualité du jeu vidéo · 7 août 2025
- [[Source sur le vol des cookies de connexion]] — [[À ajouter : l'étude de Flare n'en parle pas (piste : CERT-FR ou ANSSI)]]
:::

## Du codex au terrain | Mise en pratique

> Les mesures de protection de la salle, la procédure de l'atelier pour un PC infecté et mes tests en machines virtuelles sont dans ma fiche projet [Labo : gestion et sécurisation d'un parc de PC gaming](pages/projets/labo-parc-gaming.html).

::: encart
## Codex | Liens avec mes autres veilles
- **Système** — la restauration au redémarrage efface un logiciel malveillant installé par un client : [voir ma veille système](pages/veille/systeme.html).
- **Réseau** — les données des clients de l'atelier sont des données personnelles : où les stocker, et sous quelle loi ? [Voir ma veille réseau](pages/veille/reseau.html).
:::

::: encart competences
## Récompenses | Compétences E5 mobilisées
- Organiser son développement professionnel
:::

::: navigation Navigation entre les veilles
- [Veille précédente : réseau](pages/veille/reseau.html)
- [Retour à la veille](pages/veille.html)
:::
