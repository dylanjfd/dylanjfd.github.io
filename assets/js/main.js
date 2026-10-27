/* ==========================================================================
   Portfolio BTS SIO — main.js (réglages + démarrage)
   Thème « Quête d'aventure » — sans framework ni bibliothèque.
   --------------------------------------------------------------------------
   Les scripts sont séparés par rôle (tous dans assets/js/) :
     theme-init.js  thème mémorisé, appliqué avant l'affichage (dans <head>)
     icones.js      icônes SVG originales
     markdown.js    analyseur Markdown maison
     rendu.js       construction des pages à partir de contenu/*.md
     interface.js   thème, menu mobile, apparitions, particules, filtre, flèches
     formulaire.js  formulaire de contact (page contact uniquement)
     main.js        ce fichier : réglages CONFIG puis démarrage
   Le texte des pages se modifie dans les fichiers Markdown du dossier contenu/.
   ========================================================================== */

/* ==========================================================================
   Réglages (CONFIG) — à personnaliser
   ========================================================================== */
const CONFIG = {
  // Option du BTS SIO : 'SISR' ou 'SLAM'.
  // Utilisée dans le texte ({{option}} dans les fichiers .md), la fiche de personnage
  // et pour afficher les branches de compétences propres à l'option ({option=SISR}).
  OPTION: 'SISR',

  // Adresse d'envoi du formulaire de contact :
  //  - Formspree : 'https://formspree.io/f/votre-identifiant'
  //  - PHP       : '../contact.php' (hébergement PHP, voir contact.php)
  // Tant que c'est vide, le formulaire affiche un message d'aide au lieu d'envoyer.
  FORM_ENDPOINT: '',

  // (Optionnel) adresse e-mail proposée en solution de repli dans les messages du formulaire.
  CONTACT_EMAIL: 'dylan.joffredo1207@gmail.com',
};

/* ==========================================================================
   Démarrage
   ========================================================================== */
(function () {
  'use strict';
  const P = window.Portfolio || {};

  // L'en-tête (logo, menu, bouton de thème) est déjà dans le HTML : actif tout de suite.
  if (P.interface) P.interface.initEntete();

  // Le contenu est construit à partir du Markdown, puis les animations et le formulaire sont activés.
  const rendu = P.rendre ? P.rendre() : Promise.resolve();
  rendu.then(() => {
    if (P.interface) P.interface.initContenu();
    if (P.formulaire) P.formulaire.init();
  });
}());
