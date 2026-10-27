---
mise-en-page: fiche
fil-ariane: Projet 1
titre-onglet: Projet serveur web
parent: [Projets](pages/projets.html)
---

<!--
  FICHE DE QUÊTE — PROJET 1 (pages/projets/projet-1.html)
  - L'en-tête : titre, résumé, badges (principale/secondaire/annexe, terminée/en cours) et infos.
  - Chaque « ## Surtitre | Titre » est une partie de la fiche.
  - Les blocs « ::: encart » s'affichent dans la colonne de droite.
  - Pour ajouter une vraie capture, remplace le bloc « ::: capture » par :
      ![Légende de la capture](assets/img/projet-1-capture.png)
-->

# Fiche de quête · Quête annexe | Projet serveur web

Mise en place d'un hébergement web pour le portfolio sur un serveur Debian sécurisé, en HTTPS, sauvegardé et supervisé.

::: badges
annexe, en cours
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

::: encart competences
## Récompenses | Compétences E5 mobilisées
- Gérer le patrimoine informatique
- Répondre aux incidents et aux demandes
- Mettre à disposition un service
:::

::: encart technologies
## Équipement | Technologies
- Debian
- Nginx
- Cloudflare
- Git
- Uptime Kuma
:::

::: navigation Navigation entre les projets
- [Retour aux projets](pages/projets.html)
- [Projet suivant](pages/projets/projet-2.html)
:::
