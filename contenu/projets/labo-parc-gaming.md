---
mise-en-page: fiche
fil-ariane: Labo parc gaming
parent: [Projets](pages/projets.html)
---

<!--
  FICHE DE QUÊTE — LABO PARC GAMING (pages/projets/labo-parc-gaming.html)
  Même organisation que projet-1.md (voir les explications en tête de ce fichier).
  Mise en pratique des veilles système et cybersécurité (pages/veille/systeme.html et
  cybersecurite.html), qui renvoient ici dans leur encadré « Mise en pratique ».
  Captures : remplace chaque bloc « ::: capture » par une image, par exemple
      ![Texte alternatif : ce que montre la capture](assets/img/labo-clonezilla.png)
  (le texte entre crochets sert à la fois de texte alternatif et de légende).
-->

# Fiche de quête · Quête annexe | Labo : gestion et sécurisation d'un parc de PC gaming

Mise en pratique de mes veilles système et cybersécurité : des tests en machines virtuelles pour gérer et protéger les 25 PC de la salle gaming de Reboot, et une procédure pour l'atelier de réparation.

::: badges
annexe, en cours
:::

::: infos
Cadre: Projet personnel, lié à mes veilles
Organisation: Reboot (projet d'entreprise)
Période: [[Période des tests]]
Rôle: [[En autonomie]]
:::

## Briefing de mission | Contexte

### Mission
Préparer techniquement Reboot : une salle gaming de 25 PC en libre-service, utilisés chaque jour par des clients différents, et un atelier de réparation qui reçoit des PC infectés.

### Pourquoi ce labo
Mes veilles comparent des solutions ; ce labo les teste en machines virtuelles avant de les proposer dans un vrai lieu. Veilles liées : [veille système](pages/veille/systeme.html) et [veille cybersécurité](pages/veille/cybersecurite.html).

### Conditions de la mission

- Tests uniquement en machines virtuelles.
- Aucun vrai logiciel malveillant : le fichier de test EICAR sert de faux virus.
- [[Matériel utilisé : hyperviseur, ressources du PC hôte, réseau virtuel.]]

## Objectifs de la quête | Objectifs

- 🥉 Objectif 1 — Déployer : préparer un Windows « modèle » et le copier sur d'autres postes (Clonezilla, FOG Project).
- 🥈 Objectif 2 — Protéger : vérifier qu'un poste revient à un état propre et qu'un compte joueur ne peut rien installer.
- 🥇 Objectif 3 — Réagir : définir les mesures de protection de la salle et la procédure de l'atelier pour un PC infecté.

## Étapes de la quête | Tests système

::: etapes
### Capturer et restaurer un Windows « modèle » avec Clonezilla
**Objectif :** capturer un Windows « modèle » avec Clonezilla et le restaurer sur une deuxième machine virtuelle, en chronométrant l'opération.

**Résultat :** [[Temps mesuré et constat.]]

::: capture
[[Capture à ajouter : assets/img/labo-clonezilla.png]]

[[Texte alternatif : décris ce que montre la capture.]]
:::

### Déployer l'image par le réseau avec FOG Project
**Objectif :** installer FOG Project sur une machine virtuelle Debian et déployer l'image par le réseau (démarrage PXE).

**Résultat :** [[Constat du déploiement.]]

::: capture
[[Capture à ajouter : assets/img/labo-fog-pxe.png]]

[[Texte alternatif : décris ce que montre la capture.]]
:::

### Tester l'Unified Write Filter
**Objectif :** sur une version d'évaluation de Windows Entreprise, créer un fichier, redémarrer et vérifier qu'il a disparu.

**Résultat :** [[Constat après le redémarrage.]]

::: capture
[[Capture à ajouter : assets/img/labo-uwf.png]]

[[Texte alternatif : décris ce que montre la capture.]]
:::

### Diskless : étude théorique
**Objectif :** étude théorique uniquement, sans test, du matériel serveur et réseau nécessaire.

**Résultat :** [[Conclusion de l'étude.]]

::: capture
[[Schéma à ajouter : assets/img/labo-diskless-schema.png]]

[[Texte alternatif : décris ce que montre le schéma.]]
:::
:::

## Étapes de la quête | Tests cybersécurité

::: avertissement Règle de sécurité
Je ne télécharge jamais de vrai cheat ni de vrai logiciel malveillant, même dans une machine virtuelle.
:::

::: etapes
### Détection du fichier de test EICAR
**Objectif :** vérifier que l'antivirus détecte le fichier de test EICAR (faux virus officiel et inoffensif).

**Résultat :** [[Réaction de l'antivirus.]]

::: capture
[[Capture à ajouter : assets/img/labo-eicar.png]]

[[Texte alternatif : décris ce que montre la capture.]]
:::

### Compte joueur sans droits administrateur
**Objectif :** vérifier qu'un compte joueur sans droits administrateur ne peut rien installer.

**Résultat :** [[Constat.]]

::: capture
[[Capture à ajouter : assets/img/labo-compte-joueur.png]]

[[Texte alternatif : décris ce que montre la capture.]]
:::

### Test combiné : EICAR et Unified Write Filter
**Objectif :** déposer le fichier EICAR sur un poste protégé par l'Unified Write Filter, redémarrer et constater qu'il a disparu.

**Résultat :** [[Constat après le redémarrage.]]

::: capture
[[Capture à ajouter : assets/img/labo-eicar-uwf.png]]

[[Texte alternatif : décris ce que montre la capture.]]
:::
:::

## Défenses de la salle | Protéger la salle Reboot

- Comptes joueurs sans droits administrateur.
- Liste des seuls logiciels autorisés.
- Restauration au redémarrage ([voir ma veille système](pages/veille/systeme.html)).
- Déconnexion automatique des comptes Steam et Discord en fin de session.
- Réseau séparé pour les joueurs, l'atelier et la caisse.
- Mises à jour et antivirus à jour.

[[Pour chaque mesure : l'outil retenu et la façon de la configurer.]]

## Atelier | Procédure pour un PC client infecté

::: etapes
### Isoler la machine
Déconnecter le PC du réseau. [[Précisions.]]

### Sauvegarder les données du client
[[Méthode et support de sauvegarde.]]

### Analyser ou réinstaller le système
[[Outils d'analyse, critères pour choisir de réinstaller.]]

### Faire changer les mots de passe
Depuis un autre appareil. [[Comptes concernés.]]

### Fermer les sessions et activer la double authentification
Déconnecter toutes les sessions ouvertes, puis activer la double authentification. [[Précisions.]]

### Informer le client
Lui expliquer les bonnes pratiques. [[Conseils donnés.]]
:::

> **RGPD :** les données des clients sont des données personnelles, à traiter selon le RGPD.

## Butin et bilan | Résultats

- [[Résultat des tests système (temps de déploiement, restauration).]]
- [[Résultat des tests cybersécurité.]]
- [[Livrables : procédure de l'atelier, configuration type d'un poste…]]

> **Bilan personnel :** [[ce que ce labo t'a appris, les difficultés rencontrées, ce que tu retiens pour Reboot.]]

::: encart competences
## Récompenses | Compétences E5 mobilisées
- Gérer le patrimoine informatique
- Répondre aux incidents et aux demandes
- Mettre à disposition un service
:::

::: encart technologies
## Équipement | Technologies
- Clonezilla
- FOG Project
- PXE
- Debian
- Unified Write Filter
- EICAR
:::

::: encart
## Codex | Veilles liées
- **Système** : [Gérer un parc de PC en libre-service](pages/veille/systeme.html)
- **Cybersécurité** : [Pourquoi les joueurs sont-ils ciblés ?](pages/veille/cybersecurite.html)
:::

::: encart ressources
## Archives | Documents
- [[Compte rendu des tests (PDF)]]
- [[Procédure de l'atelier (PDF)]]
:::

::: navigation Navigation entre les projets
- [Projet précédent](pages/projets/projet-2.html)
- [Retour aux projets](pages/projets.html)
:::
