---
mise-en-page: fiche
fil-ariane: TP Active Directory
titre-onglet: TP Active Directory et GPO
parent: [Projets](pages/projets.html)
titre-seo: Active Directory et GPO — Projet BTS SIO de Dylan JOFFREDO
description: Projet BTS SIO SISR de Dylan JOFFREDO : domaine Active Directory sous Windows Server 2025, deux postes Windows 11 intégrés et deux GPO déployées.
---

<!--
  FICHE DE QUÊTE — PROJET 4 (pages/projets/projet-4.html)
  Même organisation que projet-1.md (voir les explications en tête de ce fichier).
  Suite du TP VirtualBox (projet-2) : bloc « ::: suite » sous le titre, et ligne
  « suite de: » de sa carte dans projets.md (chaîne de quêtes du Journal de quêtes).
  Documentation du TP : assets/docs/tp-active-directory-gpo.pdf
    Pour la remplacer, dépose le nouveau PDF dans assets/docs/ sous le même nom :
    les deux liens de cette fiche (section « Livrable » et encart « Archives ») suivent.
  Petit secret : le bloc « ::: presentation arc » (fin de la section « Livrable ») devient
    un arc et une cible, au-dessus du séparateur. Quand la flèche se plante dans le mille,
    la présentation de l'oral s'ouvre en plein écran : assets/docs/tp-active-directory-gpo-presentation.pdf
    (même principe pour la remplacer). La version modifiable (.pptx) reste dans le dépôt,
    sans lien sur le site. La phrase n'apparaît qu'au survol de l'arc ou de la cible.
-->

# Fiche de quête · Quête secondaire | TP Active Directory : domaine, OU et GPO

::: suite
[Installation de systèmes d'exploitation sous VirtualBox](pages/projets/projet-2.html)
:::

Un domaine Active Directory monté sur les machines virtuelles du TP précédent : un contrôleur de domaine Windows Server 2025, deux postes Windows 11 intégrés et deux stratégies de groupe déployées.

::: badges
secondaire, terminée
:::

::: infos
Cadre: Projet en formation (TP)
Organisation: BTS SIO — 1re année
Période: Novembre 2026
Rôle: En autonomie : installation, configuration et documentation
:::

## Briefing de mission | Contexte

### Ce que c'est
Un TP de BTS SIO réalisé sur les machines du [TP précédent](pages/projets/projet-2.html) : le serveur WIN-SRV-01 (Windows Server 2025, adresse IP fixe 192.168.50.10) devient contrôleur du domaine domaine.local, et les postes WIN-CLI-01 et WIN-CLI-02 (Windows 11 Pro) le rejoignent, sur le réseau NAT VirtualBox RN-TPOS (192.168.50.0/24).

### À quoi ça sert
Active Directory centralise les comptes, les ordinateurs et les règles d'un réseau : un compte créé une seule fois sur le serveur fonctionne sur tous les postes, et une stratégie de groupe (GPO) applique un réglage à tout un ensemble de postes ou d'utilisateurs, sans intervenir sur chacun. C'est la base de la gestion d'un parc Windows en entreprise.

### Conditions de la mission

- Les machines du TP précédent, sur le même PC hôte : un seul poste client allumé à la fois, pour économiser la mémoire.
- Le serveur démarré en premier et allumé pendant tout le TP : les postes ont besoin de son DNS pour trouver le domaine.
- Des postes en Windows 11 Pro : l'édition Famille ne peut pas rejoindre un domaine.
- Un instantané VirtualBox pris avant de commencer, pour pouvoir revenir en arrière.

## Objectifs de la quête | Objectifs

- 🥉 Objectif 1 — Installer : ajouter le rôle AD DS au serveur et créer le domaine domaine.local.
- 🥈 Objectif 2 — Organiser : créer une OU Utilisateurs et une OU Ordinateurs, puis intégrer les deux postes Windows 11 au domaine.
- 🥇 Objectif 3 — Déployer : une GPO pour le fond d'écran des postes et une GPO pour une politique de mot de passe forte.

## Étapes de la quête | Solution

::: etapes
### Rôle AD DS et promotion du serveur
Installation du rôle AD DS depuis le Gestionnaire de serveur, puis promotion de WIN-SRV-01 en contrôleur de domaine : nouvelle forêt domaine.local, avec le DNS intégré.

### Unités d'organisation et compte de test
Création des OU Utilisateurs et Ordinateurs dans la console Utilisateurs et ordinateurs Active Directory, et d'un compte de test, j.test, dans l'OU Utilisateurs.

### Intégration des postes au domaine
Sur chaque poste : DNS pointé vers le serveur (192.168.50.10), ajout au domaine, connexion avec le compte du domaine (`whoami` renvoie `domaine\j.test`), puis rangement du poste dans l'OU Ordinateurs.

### GPO-FondEcran
Liée à l'OU Utilisateurs : l'image, partagée sur le serveur, est copiée sur chaque poste par une préférence de GPO, puis imposée comme papier peint.

### GPO-MotDePasse
Liée au domaine en priorité 1, devant la Default Domain Policy : 12 caractères minimum, complexité exigée, 90 jours maximum, historique de 24 mots de passe.
:::

## Butin et bilan | Résultats

- Les deux postes Windows 11 font partie du domaine et sont rangés dans l'OU Ordinateurs. On s'y connecte avec le même compte, j.test, créé une seule fois sur le serveur.
- Les deux GPO marchent : le fond d'écran choisi s'affiche sur les postes et un mot de passe trop simple est refusé. Je l'ai vérifié avec les commandes `gpresult` et `net accounts`.
- Un problème réglé : le bureau restait noir au lieu d'afficher le fond d'écran. Il y avait trois erreurs à la suite : l'image était lue sur le réseau avant qu'il soit prêt, le fichier s'appelait en fait fond.jpg.jpg (Windows cachait l'extension) et le chemin de l'image était mal écrit. Je les ai trouvées avec `gpresult`, l'Observateur d'événements et `reg query`.
- Livrable : une documentation technique de 26 pages, à suivre étape par étape.

> **Bilan personnel :** ce TP m'a appris qu'une GPO peut être bien reçue par un poste sans pour autant marcher. Pour trouver la panne, j'ai vérifié une chose après l'autre : est-ce que la GPO arrive sur le poste, pourquoi elle échoue, et ce que Windows a vraiment reçu. J'ai aussi compris que, sans DNS, les postes ne trouvent pas le domaine, et qu'une GPO doit être placée au bon endroit : sur les utilisateurs pour le fond d'écran, sur tout le domaine pour le mot de passe.

## Livrable | Documentation technique

La documentation complète du TP : la procédure pas à pas, illustrée de 55 figures, puis deux annexes, les incidents rencontrés et un glossaire.

::: actions
- [Consulter la documentation technique (PDF)](assets/docs/tp-active-directory-gpo.pdf)
:::

::: presentation arc
Clique sur l'arc ou tire la corde pour viser la cible.

- [Présentation orale du TP (PDF)](assets/docs/tp-active-directory-gpo-presentation.pdf)
:::

::: encart competences
## Récompenses | Compétences E5 mobilisées
- Gérer le patrimoine informatique
- Répondre aux incidents et aux demandes
- Mettre à disposition des utilisateurs un service informatique
:::

::: encart technologies
## Équipement | Technologies
- Windows Server 2025
- Active Directory
- DNS
- GPO
- Windows 11
- VirtualBox
- gpresult
:::

::: encart ressources
## Archives | Documents
- [Documentation technique (PDF)](assets/docs/tp-active-directory-gpo.pdf)
:::

::: encart
## Codex | Pour aller plus loin
- [La quête précédente : systèmes sous VirtualBox](pages/projets/projet-2.html)
- [Mes compétences systèmes et réseaux](pages/competences.html)
:::

::: navigation Navigation entre les projets
- [Projet précédent](pages/projets/projet-2.html)
- [Projet suivant](pages/projets/labo-parc-gaming.html)
:::
