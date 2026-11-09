---
mise-en-page: fiche
fil-ariane: Veille système
titre-onglet: Veille système : gérer le parc informatique d'une PME
parent: [Veille](pages/veille.html)
titre-seo: Veille système : parc informatique des PME — Dylan JOFFREDO
description: Veille système BTS SIO SISR : gérer le parc informatique d'une PME, bonnes pratiques (inventaire, mises à jour, sauvegardes), risques et actualités.
---

<!--
  FICHE DE VEILLE — SYSTÈME (pages/veille/systeme.html) — « Codex »
  Structure commune aux trois veilles (système, réseau, cybersécurité) :
    Introduction → Problématique → Contenu (actualités datées et sourcées, analyse)
    → Synthèses → Analyse critique et bilan → Sources.
  - Chroniques : remplace « [[Ce que j'en retiens.]] » à la fin de chaque carte par ton analyse.
  - Synthèses : une carte par mois entre les marqueurs SYNTHESES-SYSTEME, la plus récente en premier.
    Format : « ### Entrée I | Titre », lignes date: et sources:, puis le résumé et « Mon analyse ».
    Remplace la carte à compléter par ta première synthèse. Ne supprime pas les marqueurs.
  - Les blocs « ::: encart » s'affichent dans la colonne de droite.
-->

# Codex · Veille système | Gérer le parc informatique d'une PME

Ma veille système : ce qu'une PME doit mettre en place pour garder un parc informatique sain, et ce qu'elle risque si elle ne le fait pas.

::: badges
système, en cours
:::

::: infos
Catégorie: Système
Cadre: Veille en formation (BTS SIO)
Période: Depuis octobre 2026
Rythme: Une synthèse par semaine, regroupée en une synthèse par mois
:::

## Prologue | Introduction

Dans une PME, l'informatique est souvent gérée au fil de l'eau : un PC acheté quand quelqu'un arrive, des logiciels installés à la main, des mises à jour faites quand on y pense. Avec le temps, le parc devient hétérogène : plusieurs versions de Windows, des postes oubliés, du matériel trop vieux pour être mis à jour. Chaque différence fait perdre du temps au support et peut devenir une faille.

Les PME ont rarement un service informatique dédié ou un gros budget. Cette veille suit l'actualité pour répondre à deux questions : que faut-il mettre en place pour avoir un parc sain, et que risque-t-on si on ne le fait pas ?

## Question de la quête | Problématique

> **Gérer le parc informatique d'une PME : quelles bonnes pratiques et quels risques ?**

## Carte du codex | Les bonnes pratiques

Cinq étapes pour garder un parc sain, de l'arrivée d'un PC jusqu'à son remplacement.

::: etapes
### Inventorier
Savoir ce que l'on possède : chaque PC, sa configuration, ses logiciels et son utilisateur. Des outils comme GLPI ou OCS Inventory tiennent cette liste à jour automatiquement, grâce à un agent installé sur les postes.

### Standardiser
Installer des PC identiques à partir d'une image de référence : un système préparé une seule fois, avec les logiciels et les réglages de l'entreprise, puis déployé sur tous les postes.

### Mettre à jour
Appliquer les correctifs de sécurité sur tous les postes, sans en oublier : Windows Update, WSUS (serveur de mises à jour installé dans l'entreprise) ou Intune (gestion des postes depuis le cloud de Microsoft).

### Sauvegarder
Copier régulièrement les données importantes, en garder une copie hors des locaux, et vérifier que l'on sait les restaurer.

### Gérer la fin de vie
Suivre l'âge du matériel et la date de fin de support du système, pour remplacer ou reconditionner les PC avant la fin des mises à jour de sécurité.
:::

## Bestiaire | Les risques

Ce qui arrive quand le parc n'est pas géré :

- **PC tous différents** — chaque poste a sa propre configuration : le support prend plus de temps et des logiciels deviennent incompatibles entre eux.
- **Postes oubliés ou non inventoriés** — un PC que personne ne suit n'est ni mis à jour ni sauvegardé.
- **Matériel ou système en fin de vie** — il ne reçoit plus de correctifs de sécurité, ou il est trop vieux pour passer à la version suivante.
- **Panne sans sauvegarde** — un disque qui lâche, un PC volé ou chiffré, et les données sont perdues.
- **Licences mal suivies** — des logiciels utilisés sans licence valide, ou des licences payées pour des postes qui n'existent plus.
- **Failles non corrigées** — un poste qui n'est pas à jour est une porte d'entrée pour une attaque.





## Entrées du codex | Synthèses

Une synthèse par mois, de la plus récente à la plus ancienne : l'actualité, puis mon analyse.

::: cartes
<!-- SYNTHESES-SYSTEME:START -->
### Entrée I | [[Titre de la synthèse]]
date: [[Mois année]]
sources: [[Liens vers les articles]]

[[Résumé de l'actualité du mois.]]

**Mon analyse :** [[ce que cette actualité change pour la gestion du parc d'une PME.]]
<!-- SYNTHESES-SYSTEME:END -->
:::


## Bibliothèque | Sources

Des sites spécialisés, la presse et l'éditeur lui-même, lus automatiquement chaque jour avec des recherches Google Actualités, et recoupés entre eux avant chaque synthèse.

::: tableau Sources de la veille : type et fiabilité
| Source | Type | Pourquoi elle est fiable |
|---|---|---|
| [IT-Connect](https://www.it-connect.fr/) | Site spécialisé | Site français consacré à l'administration systèmes et réseaux : il suit de près GLPI, Windows, Intune et WSUS, avec des articles techniques détaillés. |
| [LeMagIT](https://www.lemagit.fr/) | Presse professionnelle | Rédaction spécialisée dans l'informatique d'entreprise : postes de travail, infrastructures, sécurité. |
| [Microsoft — Windows IT Pro Blog](https://techcommunity.microsoft.com/category/windows/blog/windows-itpro-blog) | Blog de l'éditeur, en anglais | Source de première main sur les mises à jour, les fins de support et les outils de gestion de Windows ; c'est l'éditeur qui parle de ses produits, donc ses recommandations sont à recouper. |
| [The Register](https://www.theregister.com/) | Presse informatique, en anglais | Média britannique de l'informatique professionnelle, qui suit de près les changements de Microsoft ; ses titres sont volontiers ironiques, je m'appuie sur les faits qu'il rapporte. |
| [BleepingComputer](https://www.bleepingcomputer.com/) | Presse spécialisée, en anglais | Site de référence sur les mises à jour de sécurité de Windows (Patch Tuesday) et les failles, souvent cité par la presse. |
| [Journal du Geek](https://www.journaldugeek.com/) | Presse high-tech grand public | Média français grand public, utile pour repérer les annonces qui touchent beaucoup d'utilisateurs ; source de relais, à recouper avec la source d'origine. |
:::


::: encart
## Codex | Liens avec mes autres veilles
- **Réseau** — les PME et l'hébergement de leurs données : où stocker les sauvegardes du parc, et sous quelle loi ? [Voir ma veille réseau](pages/veille/reseau.html).
- **Cybersécurité** — les attaques elles-mêmes ; ici, je regarde la gestion du parc qui permet de s'en protéger : [voir ma veille cybersécurité](pages/veille/cybersecurite.html).
:::

::: encart competences
## Récompenses | Compétences E5 mobilisées
- Organiser son développement professionnel
:::

::: navigation Navigation entre les veilles
- [Retour à la veille](pages/veille.html)
- [Veille suivante : réseau](pages/veille/reseau.html)
:::
