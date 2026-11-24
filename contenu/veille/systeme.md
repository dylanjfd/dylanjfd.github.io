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
### Entrée I | Mettre à jour vite, sans perdre la maîtrise du parc
date: Novembre 2026
sources: [IT-Connect — faille UEFI CVE-2026-97631](https://www.it-connect.fr/faille-uefi-edk-ii-pxe-icmp-cve-2026-97631/), [Microsoft — les nouveautés Windows d'octobre 2026](https://techcommunity.microsoft.com/t5/windows-it-pro-blog/windows-news-you-can-use-october-2026/ba-p/4552396), [LeMagIT — navigateur d'entreprise sécurisé ou extensions de sécurité](https://www.lemagit.fr/conseil/Navigateur-dentreprise-securise-ou-extensions-de-securite-comment-choisir), [Tech Insider — logiciels de gestion des correctifs, de 0 à 3,75 $ par poste](https://news.google.com/rss/articles/CBMilgFBVV95cUxQN2gyVHlfM3JNb2R0UnJIMGlJWVhBemtLemVvbjZyeDFqZlhvWU8weTRuV2pFN0d2RE44YjNCbVZzRWdFRXJKLW1ZN3A3YlFzYmhNRDZ5dE5HX1QxOW9rMW0za0trelU0MEVJSmc0U1k5VXpqejBqRlN3djhFcWxIUGNkaTRuSERBckFEVkxKaHdES1kycXc?oc=5), [Microsoft — contrôle fin des mises à jour dans Windows Autopatch](https://techcommunity.microsoft.com/t5/windows-it-pro-blog/granular-controls-for-multiple-updates-in-windows-autopatch/ba-p/4572668), [Microsoft — sauvegarde et restauration des paramètres Windows](https://techcommunity.microsoft.com/t5/windows-it-pro-blog/enhanced-resilience-with-windows-settings-backup-and-restore/ba-p/4571757), [IT-Connect — échecs d'activation après les mises à jour de novembre](https://www.it-connect.fr/windows-activation-slmgr-erreur-080041008/), [Microsoft — Windows baseline protection](https://techcommunity.microsoft.com/t5/windows-it-pro-blog/a-verifiable-security-state-with-windows-baseline-protection/ba-p/4572654), [London Insider — bug d'Autopatch avec le hotpatch de novembre](https://news.google.com/rss/articles/CBMi0AFBVV95cUxPd0xkYmxjd2phdHB6UFJLcmlxTGVXcGhoVG85MFJjNUxuV2J2UDVuV0E3N3RDXzIzM1BkTk5EODh4THZQUzlocVlQR1Q1RzRCYmtqY0xOei03UzZKbzVnaVBUZmpFMV94cjNZS1kzN2ZmQ3cwU0Zlc0g2MDdrYUNxSXN5T0hTSEl6VVhndnVKemlpbGx4aVU4c3dPTlFFa25ydHh5ekttdGRBYnVBQ3BLN0xPNjJxb0ZUT2xwbHFpNXM0SU42OHQtc29mMi1NUFlU?oc=5), [BetaNews — verrouiller un PC perdu depuis Intune sans l'effacer](https://news.google.com/rss/articles/CBMia0FVX3lxTE9rYTBhWktNbTJPUE9rLXJ4TGhJbnY4OFdiN3J6TTlGOVpFN1lrTE5oM0Z6RW5EcG1NTnVYUjJLNzlBRHdPV0V3UldjOXVIemJlOExOM2t1c3o2blRzQkJIc0pMeXVDeVdaeU84?oc=5)

**Résumé :** Une faille UEFI permet d'exécuter du code avant le Secure Boot sur un poste qui démarre par le réseau (PXE). Les mises à jour de novembre font échouer l'activation de Windows, et le hotpatch distribué par Windows Autopatch empêche certaines applications de s'installer ou de se lancer. Dans le même temps, Microsoft fait évoluer ses outils de gestion : contrôle plus fin des mises à jour dans Autopatch, sauvegarde et restauration des paramètres Windows, Windows baseline protection et verrouillage à distance d'un PC perdu depuis Intune.

**Mon analyse :** Ce mois-ci, un même constat revient : il faut mettre à jour vite, mais sans perdre la maîtrise du parc. Vite, parce que 28 % des failles qui ont un exploit public sont attaquées dans les 24 heures, et parce que la faille UEFI CVE-2026-97631 montre qu'un parc mal configuré peut être compromis avant même le démarrage de Windows : il faut désactiver le PXE inutile, démarrer en priorité sur le disque et mettre à jour le BIOS/UEFI de tous les postes. Microsoft durcit d'ailleurs la sécurité par défaut et impose son rythme de migration aux petites structures ; comme Windows est l'un des systèmes que je maîtrise le mieux, suivre ses nouveautés et ses failles me permet d'anticiper ces changements plutôt que de les subir. Mais les mises à jour peuvent aussi casser le parc : le Patch Tuesday de novembre fait échouer l'activation de Windows (erreur 0x80041008), la KB5132061 refuse de s'installer sur les PC qui avaient reçu la préversion d'octobre, et le hotpatch distribué par Autopatch empêche Office et d'autres logiciels de se lancer. Une fonction pratique comme le hotpatch, qui évite de redémarrer, n'est donc intéressante que si l'admin garde la main pour la suspendre quand elle pose problème. J'en retiens qu'il faut déployer par vagues (un groupe pilote, puis le reste du parc), ne jamais installer de préversion sur les postes de production et documenter chaque correctif manuel, comme une modification du registre, sans pour autant retarder trop longtemps les correctifs de sécurité. Microsoft fait évoluer ses outils (contrôle fin des mises à jour, sauvegarde des paramètres, Windows baseline protection, verrouillage d'un PC perdu sans l'effacer), mais ils poussent vers Intune, Autopatch et son cloud, souvent avec des licences supplémentaires, et confient des données à une entreprise soumise au Cloud Act. Pour mon parc d'une quinzaine de PC, je préfère une solution interne et presque gratuite, plutôt qu'un outil cloud américain comme Action1 : Windows Server avec Active Directory, WSUS et des GPO pour les mises à jour, WAPT ou winget pour les applications, GLPI pour l'inventaire et Wazuh pour les vulnérabilités. Elle demande plus de maintenance, mais je maîtrise chaque brique, les données restent en interne, et les principes restent les mêmes : un socle de sécurité commun vérifié régulièrement (TPM, Secure Boot, BitLocker), des postes chiffrés et un navigateur Chrome ou Edge durci par GPO, avec SmartScreen et un filtrage DNS, sans payer de navigateur d'entreprise.
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
