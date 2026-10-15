---
mise-en-page: fiche
fil-ariane: Projet 1
parent: [Projets](pages/projets.html)
---

<!--
  FICHE DE QUÊTE — PROJET 1 (pages/projets/projet-1.html)
  - L'en-tête : titre, résumé, badges (principale/secondaire, terminée/en cours) et infos.
  - Chaque « ## Surtitre | Titre » est une partie de la fiche.
  - Les blocs « ::: encart » s'affichent dans la colonne de droite.
  - Pour ajouter une vraie capture, remplace le bloc « ::: capture » par :
      ![Légende de la capture](assets/img/projet-1-capture.png)
-->

# Fiche de quête · Quête principale | Projet serveur web

Mise en place d'un hébergement web pour le portfolio sur un serveur Debian sécurisé, en HTTPS, sauvegardé et supervisé.

::: badges
principale, en cours
:::

::: infos
Cadre: Projet personnel
Organisation: Personnel
Période: 2026 – 2028
Rôle: Administrateur système, en autonomie
:::

## Briefing de mission | Contexte

### Mission
Mettre en ligne le portfolio du BTS SIO, accessible à tous en HTTPS.

### Mon choix
Plutôt que de confier le site à un hébergeur, je préfère construire et défendre mon propre serveur web, puis en assurer l’administration et l’entretien au quotidien.

### Objectif de la quête
Un hébergement sécurisé et complet, avec sauvegardes et supervision.

### Conditions de la mission

- Ressources limitées : matériel récupéré, seul le nom de domaine est payant.
- Défense : la sécurité de mon hébergement doit être optimale.
- Échec interdit : le site doit répondre le jour de l’épreuve.


## Objectifs de la quête | Objectifs

- 🥉 Objectif 1 — Ouvrir la porte : mettre le portfolio en ligne sur mon serveur Debian, accessible en HTTPS depuis mon nom de domaine.
- 🥈 Objectif 2 — Fortifier : sécuriser le serveur : accès SSH par clé uniquement, pare-feu actif, Fail2ban, aucun port ouvert sur la box.
- 🥇 Objectif 3 — Garantir : garantir la continuité du service : sauvegardes automatiques, supervision avec alerte et retour du site après une panne.

## Étapes de la quête | Solution

[[Décris la solution retenue et pourquoi elle a été choisie (comparaison rapide avec les autres solutions envisagées).]]

::: etapes
### Analyse du besoin et choix de la solution
[[Recueil des besoins, comparaison des outils, validation avec le tuteur.]]

### Installation et configuration
[[Serveur, services, comptes, droits d'accès : les étapes clés et les choix techniques.]]

### Tests et recette
[[Scénarios de test, problèmes rencontrés et corrections apportées.]]

### Mise en service et documentation
[[Déploiement, documentation technique, accompagnement des utilisateurs.]]
:::

::: capture
[[Capture d'écran à ajouter (ex. : assets/img/projet-1-capture.png)]]

[[Légende : ce que montre la capture.]]
:::

## Butin et bilan | Résultats

- [[Résultat mesurable 1 (ex. : 45 postes inventoriés automatiquement)]]
- [[Résultat mesurable 2 (ex. : délai moyen de prise en charge divisé par deux)]]
- [[Livrables : documentation technique, procédure utilisateur…]]

> **Bilan personnel :** [[ce que tu as appris, les difficultés rencontrées et comment tu les as surmontées, ce que tu améliorerais.]]

::: encart competences
## Récompenses | Compétences E5 mobilisées
- Gérer le patrimoine informatique
- Répondre aux incidents et aux demandes
- Mettre à disposition un service
:::

::: encart technologies
## Équipement | Technologies
- [[Windows Server]]
- [[Active Directory]]
- [[GLPI]]
:::

<!-- Remplace https://github.com/ par l'adresse de ton dépôt ; ajoute tes PDF dans assets/docs/ -->
::: encart ressources
## Archives | Code source et documents
- [[[Scripts et configurations (GitHub)]]](https://github.com/)
- [[Démonstration vidéo]]
- [[Documentation technique (PDF)]]
- [[Procédure utilisateur (PDF)]]
:::

::: navigation Navigation entre les projets
- [Retour aux projets](pages/projets.html)
- [Projet suivant](pages/projets/projet-2.html)
:::
