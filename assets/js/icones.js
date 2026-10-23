/* ==========================================================================
   Portfolio BTS SIO — icones.js
   Icônes SVG originales utilisées par rendu.js (toutes décoratives :
   aria-hidden="true"). Pour en ajouter une : ajoute une entrée à ICONES.
   ========================================================================== */
(function () {
  'use strict';
  const P = (window.Portfolio = window.Portfolio || {});

  const svg = (viewBox, attributs, contenu) =>
    `<svg viewBox="${viewBox}" aria-hidden="true" focusable="false" ${attributs}>${contenu}</svg>`;
  const trait = (epaisseur) =>
    `fill="none" stroke="currentColor" stroke-width="${epaisseur}" stroke-linecap="round" stroke-linejoin="round"`;
  const losangePlein = '<path d="M8 1.5 14.5 8 8 14.5 1.5 8Z" fill="currentColor"/>';

  const ICONES = {
    // Boutons et liens
    telecharger: svg('0 0 24 24', trait(2), '<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>'),
    oeil: svg('0 0 24 24', trait(2), '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.8"/>'),
    fermer: svg('0 0 24 24', trait(2), '<path d="M6 6l12 12M18 6 6 18"/>'),
    fleche: svg('0 0 24 24', trait(2), '<path d="M5 12h14M13 6l6 6-6 6"/>'),
    flecheRetour: svg('0 0 24 24', trait(2), '<path d="M19 12H5M11 6l-6 6 6 6"/>'),

    // Réseaux et coordonnées
    code: svg('0 0 24 24', trait(1.8), '<path d="M8.5 7.5 4 12l4.5 4.5M15.5 7.5 20 12l-4.5 4.5M13.5 5l-3 14"/>'),
    personne: svg('0 0 24 24', trait(1.8), '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c.9-3.6 3.7-5.5 7-5.5s6.1 1.9 7 5.5"/>'),
    courriel: svg('0 0 24 24', trait(1.8), '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/>'),
    lieu: svg('0 0 24 24', trait(1.8), '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.3"/>'),
    calendrier: svg('0 0 24 24', trait(1.8), '<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>'),

    // Ressources des projets
    lecture: svg('0 0 24 24', 'fill="none" stroke="currentColor" stroke-width="1.8"', '<circle cx="12" cy="12" r="8.5"/><path d="M10 8.8v6.4l5.2-3.2Z" fill="currentColor" stroke="none"/>'),
    document: svg('0 0 24 24', trait(1.8), '<path d="M6.5 3.5H14l4 4v13H6.5Z"/><path d="M14 3.5V8h4M9.5 12.5h6M9.5 16h6"/>'),

    // Badges (type de quête, statut)
    losangePlein: svg('0 0 16 16', '', losangePlein),
    losangeVide: svg('0 0 16 16', '', '<path d="M8 2.2 13.8 8 8 13.8 2.2 8Z" fill="none" stroke="currentColor" stroke-width="1.6"/>'),
    etoile: svg('0 0 16 16', '', '<path d="M8 1.2Q9 7 14.8 8 9 9 8 14.8 7 9 1.2 8 7 7 8 1.2Z" fill="currentColor"/>'),
    coche: svg('0 0 16 16', trait(2), '<path d="m3 8.5 3.2 3.2L13 4.8"/>'),
    horloge: svg('0 0 16 16', trait(1.6), '<circle cx="8" cy="8" r="6"/><path d="M8 4.8V8l2.2 1.6"/>'),
    loupe: svg('0 0 16 16', trait(1.7), '<circle cx="6.8" cy="6.8" r="4.6"/><path d="m10.3 10.3 4 4"/>'),
    tropheePetit: svg('0 0 24 24', trait(2), '<path d="M7.5 4h9v5a4.5 4.5 0 0 1-9 0Z"/><path d="M12 13.5V17M8.5 20h7"/>'),
    cadenasPetit: svg('0 0 24 24', trait(2), '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>'),

    // Badges de catégorie des veilles (système, réseau, cybersécurité)
    ecranPetit: svg('0 0 16 16', trait(1.6), '<rect x="1.8" y="2.4" width="12.4" height="8.4" rx="1.3"/><path d="M8 10.8v2.6M5.4 13.6h5.2"/><path d="M5 8.2 7 6.3l1.4 1.2L11 5" stroke-width="1.3"/>'),
    reseauPetit: svg('0 0 16 16', trait(1.5), '<circle cx="8" cy="3.1" r="1.6"/><circle cx="3.1" cy="12.7" r="1.6"/><circle cx="12.9" cy="12.7" r="1.6"/><path d="M8 4.7v3.4M8 8.1 4.3 11.4M8 8.1l3.7 3.3M4.7 12.7h6.6"/>'),
    bouclierPetit: svg('0 0 16 16', trait(1.5), '<path d="M8 1.5 2.9 3.6v3.9c0 3 2.1 5.5 5.1 7 3-1.5 5.1-4 5.1-7V3.6Z"/><circle cx="8" cy="7" r="1.3"/><path d="M8 8.3v2.4"/>'),

    // Avertissement (« ::: avertissement » dans le Markdown)
    alerte: svg('0 0 24 24', trait(1.8), '<path d="M12 3.2 2.6 19.8h18.8Z"/><path d="M12 9.6v4.8M12 17h.01"/>'),

    // Succès (certifications)
    trophee: svg('0 0 24 24', trait(1.7), '<path d="M7.5 4h9v5a4.5 4.5 0 0 1-9 0Z"/><path d="M7.5 6H5a2.5 2.5 0 0 0 2.7 3.6M16.5 6H19a2.5 2.5 0 0 1-2.7 3.6M12 13.5V17M8.5 20h7M10 17h4"/><path d="M12 5.6l1.1 1.1L12 7.8l-1.1-1.1Z" fill="currentColor"/>'),
    cadenas: svg('0 0 24 24', trait(1.7), '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5M12 14.5V17"/>'),

    // Médaille des objectifs (« - 🥉 … » dans le Markdown) : métal coloré en CSS selon le rang
    medaille: svg('0 0 32 40', '',
      '<path class="medal__ribbon medal__ribbon--back" d="M20 1h8l-7 18h-8Z"/>' +
      '<path class="medal__stripe medal__stripe--back" d="M23 1h2l-7 18h-2Z"/>' +
      '<path class="medal__ribbon" d="M4 1h8l7 18h-8Z"/>' +
      '<path class="medal__stripe" d="M7 1h2l7 18h-2Z"/>' +
      '<circle class="medal__disc" cx="16" cy="27" r="11.4"/>' +
      '<circle class="medal__ticks" cx="16" cy="27" r="10"/>' +
      '<circle class="medal__ring" cx="16" cy="27" r="8.4"/>' +
      '<path class="medal__shine" d="M9.4 24.6a7 7 0 0 1 4.6-4.6"/>' +
      '<path class="medal__emblem" d="M16 20.6Q16.9 26.1 22.4 27 16.9 27.9 16 33.4 15.1 27.9 9.6 27 15.1 26.1 16 20.6Z"/>'),

    // Coche dorée du tableau E5
    cocheTableau: svg('0 0 24 24', 'fill="none" stroke="currentColor"', '<path d="M12 2.5 21.5 12 12 21.5 2.5 12Z" stroke-width="1.2" opacity=".5"/><path d="m7.6 12.3 3 3 5.9-6.3" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>'),

    // Portrait par défaut de la fiche de personnage
    silhouette: svg('0 0 100 100', 'fill="none" stroke="currentColor" stroke-width="2.2"', '<circle cx="50" cy="40" r="15"/><path d="M20 92c3-17 15-27 30-27s27 10 30 27"/><path d="M50 6 55 11 50 16 45 11Z" fill="currentColor" stroke="none"/>'),

    // Branches de compétences ({icone=…} dans le Markdown)
    serveur: svg('0 0 24 24', trait(1.7), '<rect x="4" y="4" width="16" height="6" rx="1.5"/><rect x="4" y="14" width="16" height="6" rx="1.5"/><path d="M8 7h.01M8 17h.01M12 7h4M12 17h4"/>'),
    reseau: svg('0 0 24 24', trait(1.7), '<circle cx="12" cy="5" r="2.2"/><circle cx="5" cy="18" r="2.2"/><circle cx="19" cy="18" r="2.2"/><path d="M12 7.2v4.3M12 11.5l-5.6 4.8M12 11.5l5.6 4.8"/>'),
    bouclier: svg('0 0 24 24', trait(1.7), '<path d="M12 3 5 6v5.5c0 4.2 2.9 7.8 7 9.5 4.1-1.7 7-5.3 7-9.5V6Z"/><path d="m9 12 2 2 4-4"/>'),
    application: svg('0 0 24 24', trait(1.7), '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M3.5 9h17M7 6.8h.01M9.5 6.8h.01M9 13l-2 2 2 2M15 13l2 2-2 2"/>'),
    base: svg('0 0 24 24', 'fill="none" stroke="currentColor" stroke-width="1.7"', '<ellipse cx="12" cy="6" rx="7" ry="2.8"/><path d="M5 6v12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8V6M5 12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8"/>'),
    outils: svg('0 0 24 24', trait(1.7), '<rect x="3.5" y="8" width="17" height="11.5" rx="2"/><path d="M9 8V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v2M3.5 13h17M11 13v2h2v-2"/>'),
    langue: svg('0 0 24 24', trait(1.7), '<path d="M5 5h14a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 19 16h-7l-4.5 3.5V16H5a1.5 1.5 0 0 1-1.5-1.5v-8A1.5 1.5 0 0 1 5 5Z"/>'),
  };

  // Rose des vents du hero d'accueil (décor original, masqué aux lecteurs d'écran par son conteneur)
  ICONES.roseDesVents = `<svg class="hero__compass" viewBox="0 0 200 200" focusable="false">
    <defs>
      <g id="compass-point"><path d="M100 6 107 93 100 100Z"/><path d="M100 6 93 93 100 100Z" fill-opacity=".38"/></g>
      <g id="compass-point-small"><path d="M100 36 104.5 95.5 100 100Z"/><path d="M100 36 95.5 95.5 100 100Z" fill-opacity=".38"/></g>
    </defs>
    <g class="compass__ring" fill="none" stroke="currentColor">
      <circle cx="100" cy="100" r="97" stroke-width=".7"/>
      <circle cx="100" cy="100" r="91" stroke-width="3" stroke-dasharray=".7 4.065"/>
      <circle cx="100" cy="100" r="85.5" stroke-width=".6"/>
      <circle cx="100" cy="100" r="60" stroke-width=".5" stroke-dasharray="1.5 3"/>
    </g>
    <g class="compass__needle" fill="currentColor">
      <use href="#compass-point-small" transform="rotate(45 100 100)"/>
      <use href="#compass-point-small" transform="rotate(135 100 100)"/>
      <use href="#compass-point-small" transform="rotate(225 100 100)"/>
      <use href="#compass-point-small" transform="rotate(315 100 100)"/>
      <use href="#compass-point"/>
      <use href="#compass-point" transform="rotate(90 100 100)"/>
      <use href="#compass-point" transform="rotate(180 100 100)"/>
      <use href="#compass-point" transform="rotate(270 100 100)"/>
      <circle cx="100" cy="100" r="6" fill="none" stroke="currentColor" stroke-width="1.2"/>
      <circle cx="100" cy="100" r="2.2"/>
    </g>
  </svg>`;

  P.icones = ICONES;
}());
