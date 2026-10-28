/* ==========================================================================
   Portfolio BTS SIO — presentation.js
   Petit secret de la fiche du projet 2 : une épée et un bouclier flottent
   sur les bords de la page, juste au-dessus du séparateur. Un clic (ou
   Entrée) sur l'une des armes, ou une arme glissée jusqu'au losange central,
   les fait se rencontrer : flash doré, étincelles, léger tremblement, puis la
   présentation de l'oral s'ouvre en plein écran, diapo par diapo.
   --------------------------------------------------------------------------
   Contenu : bloc « ::: presentation » du fichier Markdown de la page
   (la phrase d'aide + le lien du PDF). Démarrage : main.js, après rendu.js.
   Lecture du PDF : PDF.js (Mozilla, Apache 2.0), hébergé dans assets/js/pdfjs/,
   chargé seulement quand on approche une arme.
   Styles : assets/css/08-presentation.css.

   SOMMAIRE
    1. Réglages
    2. Dessins de l'épée et du bouclier (SVG originaux)
    3. Rencontre des armes : clic, clavier, glisser
    4. Choc : flash, étincelles, tremblement
    5. Diaporama : plein écran, PDF.js, navigation
    6. Initialisation
   ========================================================================== */
(function () {
  'use strict';
  const P = (window.Portfolio = window.Portfolio || {});

  /* ========================================================================
     1. Réglages
     ======================================================================== */
  const SEUIL_GLISSER = 6;        // px parcourus avant qu'un appui devienne un glisser
  const APPROCHE = 90;            // px : le losange central s'illumine quand une arme approche
  const DUREE_RENCONTRE = 560;    // ms : les armes glissent l'une vers l'autre
  const DUREE_RACCORD = 170;      // ms : l'arme glissée se cale au centre
  const DUREE_RETOUR = 480;       // ms : arme lâchée avant le centre, qui revient à sa place
  const DELAI_OUVERTURE = 500;    // ms entre le choc et l'ouverture de la présentation
  const NB_ETINCELLES = 18;
  const DELAI_CALME = 2500;       // ms sans bouger la souris : le bouton × et le curseur s'effacent
  const SEUIL_BALAYAGE = 40;      // px : glisser le doigt sur une diapo pour changer de diapo

  // Proportions des dessins (viewBox) : pointe de l'épée, bord gauche du bouclier
  const POINTE_EPEE = 236 / 240;
  const BORD_BOUCLIER = 6 / 112;

  const mouvementReduit = window.matchMedia('(prefers-reduced-motion: reduce)');
  const attendre = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

  /* ========================================================================
     2. Dessins de l'épée et du bouclier (SVG originaux)
     Couleurs dans 08-presentation.css (classes presentation__teinte-*) :
     elles suivent le thème clair ou sombre.
     ======================================================================== */
  const SVG_EPEE = `
    <svg viewBox="0 0 240 64" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="presentation-acier" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" class="presentation__teinte-acier-clair"/>
          <stop offset="0.5" class="presentation__teinte-acier"/>
          <stop offset="1" class="presentation__teinte-acier-sombre"/>
        </linearGradient>
        <linearGradient id="presentation-or-epee" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" class="presentation__teinte-or-clair"/>
          <stop offset="0.55" class="presentation__teinte-or"/>
          <stop offset="1" class="presentation__teinte-or-sombre"/>
        </linearGradient>
        <linearGradient id="presentation-poignee" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" class="presentation__teinte-nuit-clair"/>
          <stop offset="1" class="presentation__teinte-nuit"/>
        </linearGradient>
        <linearGradient id="presentation-eclat-lame" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#fff" stop-opacity="0"/>
          <stop offset="0.5" stop-color="#fff" stop-opacity="0.85"/>
          <stop offset="1" stop-color="#fff" stop-opacity="0"/>
        </linearGradient>
        <clipPath id="presentation-lame">
          <path d="M72 23.5 208 25.4 236 32 208 38.6 72 40.5Z"/>
        </clipPath>
      </defs>
      <path class="presentation__contour" d="M72 23.5 208 25.4 236 32 208 38.6 72 40.5Z" fill="url(#presentation-acier)"/>
      <path d="M80 32H204" stroke="#5d6a7e" stroke-opacity="0.55" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M76 25.9 204 27.4" stroke="#fff" stroke-opacity="0.75" stroke-width="1.1" stroke-linecap="round"/>
      <g clip-path="url(#presentation-lame)">
        <path class="presentation__reflet" d="M40 16h22L52 48H30Z" fill="url(#presentation-eclat-lame)"/>
      </g>
      <rect class="presentation__contour" x="24" y="26.5" width="39" height="11" rx="3" fill="url(#presentation-poignee)"/>
      <path class="presentation__filet" d="M31 26.5l-4 11M38 26.5l-4 11M45 26.5l-4 11M52 26.5l-4 11M59 26.5l-4 11" stroke-width="1.4"/>
      <path class="presentation__contour" d="M66 6c4 4 5 14 5 26s-1 22-5 26l-4-3c2-7 3-15 3-23s-1-16-3-23Z" fill="url(#presentation-or-epee)"/>
      <circle cx="64" cy="7" r="3.2" fill="url(#presentation-or-epee)"/>
      <circle cx="64" cy="57" r="3.2" fill="url(#presentation-or-epee)"/>
      <path d="M68 27l4.5 5-4.5 5-4.5-5Z" class="presentation__gemme"/>
      <path class="presentation__contour" d="M5 32 15 22 25 32 15 42Z" fill="url(#presentation-or-epee)"/>
      <path d="M11 32 15 28 19 32 15 36Z" class="presentation__gemme"/>
    </svg>`;

  const SVG_BOUCLIER = `
    <svg viewBox="0 0 112 132" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="presentation-or-bouclier" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" class="presentation__teinte-or-clair"/>
          <stop offset="0.5" class="presentation__teinte-or"/>
          <stop offset="1" class="presentation__teinte-or-sombre"/>
        </linearGradient>
        <linearGradient id="presentation-nuit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" class="presentation__teinte-nuit-clair"/>
          <stop offset="1" class="presentation__teinte-nuit"/>
        </linearGradient>
        <radialGradient id="presentation-lueur" cx="0.32" cy="0.22" r="0.62">
          <stop offset="0" stop-color="#fff" stop-opacity="0.24"/>
          <stop offset="1" stop-color="#fff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <path class="presentation__contour" d="M56 4c16 8 33 10 50 10v46c0 34-20 56-50 68C26 116 6 94 6 60V14c17 0 34-2 50-10Z" fill="url(#presentation-or-bouclier)"/>
      <path d="M56 12.5c14 7 29 9 42.5 9V60c0 29.5-17 49-42.5 60C30.5 109 13.5 89.5 13.5 60V21.5c13.5 0 28.5-2 42.5-9Z" fill="url(#presentation-nuit)"/>
      <path class="presentation__filet" d="M56 19.5c12 6 25 8 36 8V60c0 25.5-14.5 42.5-36 52.5C34.5 102.5 20 85.5 20 60V27.5c11 0 24-2 36-8Z" stroke-width="1.2"/>
      <path d="M56 12.5c14 7 29 9 42.5 9V60c0 29.5-17 49-42.5 60C30.5 109 13.5 89.5 13.5 60V21.5c13.5 0 28.5-2 42.5-9Z" fill="url(#presentation-lueur)"/>
      <g transform="translate(35.2 43.2) scale(1.3)" fill="url(#presentation-or-bouclier)">
        <path fill-rule="evenodd" d="M16 1.5 30.5 16 16 30.5 1.5 16ZM16 8 8 16l8 8 8-8Z"/>
        <path d="M16 12.2 19.8 16 16 19.8 12.2 16Z"/>
      </g>
      <g class="presentation__rivets">
        <circle cx="19" cy="18" r="1.9"/>
        <circle cx="93" cy="18" r="1.9"/>
        <circle cx="9.8" cy="62" r="1.9"/>
        <circle cx="102.2" cy="62" r="1.9"/>
        <circle cx="56" cy="123" r="1.9"/>
      </g>
    </svg>`;

  /* ========================================================================
     3. Rencontre des armes : clic, clavier, glisser
     États : repos → (glisse) → rencontre → ouvert → repos
     ======================================================================== */
  let presentation = null;   // rangée pleine largeur au-dessus du séparateur
  let epee = null;
  let bouclier = null;
  let sceau = null;          // losange central : point de rencontre
  let eclat = null;          // flash doré du choc
  let urlPdf = '';
  let titre = '';
  let etat = 'repos';
  let glisse = null;         // arme en cours de glisser : { arme, id, x, y, depart, bouge }
  let ignorerClic = false;   // le clic qui suit un glisser ne relance pas la rencontre
  const positions = new Map();

  /** Déplace une arme (décalage par rapport à sa place, en px). */
  function placer(arme, x, y) {
    positions.set(arme, { x, y });
    arme.style.translate = x || y ? `${x}px ${y}px` : '';
  }

  /** Fait glisser une arme jusqu'au décalage voulu ; la promesse se résout à l'arrivée. */
  function glisserVers(arme, x, y, duree, acceleration) {
    const depart = positions.get(arme);
    placer(arme, x, y);
    if (!duree) return Promise.resolve();
    return arme.animate(
      [{ translate: `${depart.x}px ${depart.y}px` }, { translate: `${x}px ${y}px` }],
      { duration: duree, easing: acceleration },
    ).finished.catch(() => {});
  }

  /** Arrête le flottement d'une arme en douceur (pour la saisir ou la faire glisser). */
  function poserFlotte(arme) {
    const flotte = arme.firstElementChild;
    const actuel = getComputedStyle(flotte).transform;
    flotte.style.animation = 'none';
    if (actuel && actuel !== 'none') flotte.animate([{ transform: actuel }, { transform: 'none' }], { duration: 220, easing: 'ease-out' });
  }

  function reprendreFlotte(arme) {
    arme.firstElementChild.style.animation = '';
  }

  function centre(element) {
    const r = element.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  /** Avant de l'arme (pointe de l'épée, bord gauche du bouclier), en coordonnées d'écran. */
  function avant(arme) {
    const r = arme.getBoundingClientRect();
    return { x: r.left + r.width * (arme === epee ? POINTE_EPEE : BORD_BOUCLIER), y: r.top + r.height / 2 };
  }

  /** Arme glissée : 'atteint' quand son avant passe le centre, 'proche' en approchant, sinon false. */
  function auCentre(arme) {
    const c = centre(sceau);
    const a = avant(arme);
    if (Math.abs(a.y - c.y) > presentation.clientHeight * 0.75) return false;
    const reste = arme === epee ? c.x - a.x : a.x - c.x;
    if (reste <= 0) return 'atteint';
    return reste < APPROCHE ? 'proche' : false;
  }

  /** Décalages qui amènent la pointe de l'épée contre le bord du bouclier, sur le losange central. */
  function ciblesRencontre() {
    const c = centre(sceau);
    const cibles = new Map();
    [epee, bouclier].forEach((arme) => {
      const a = avant(arme);
      const p = positions.get(arme);
      const contact = arme === epee ? c.x + 4 : c.x - 4; // la pointe disparaît sous le rebord du bouclier
      cibles.set(arme, { x: p.x + contact - a.x, y: p.y + c.y - a.y });
    });
    return cibles;
  }

  /** Les deux armes se rejoignent au centre ; « meneuse » : l'arme glissée jusque-là, déjà au centre. */
  async function rencontre(meneuse) {
    if (etat === 'rencontre' || etat === 'ouvert') return;
    etat = 'rencontre';
    prechargerPdf();
    presentation.classList.add('is-rencontre');
    [epee, bouclier].forEach(poserFlotte);
    const cibles = ciblesRencontre();
    const acceleration = 'cubic-bezier(0.55, 0, 0.85, 0.35)'; // de plus en plus vite jusqu'au choc
    await Promise.all([epee, bouclier].map((arme) => {
      const c = cibles.get(arme);
      return glisserVers(arme, c.x, c.y, arme === meneuse ? DUREE_RACCORD : DUREE_RENCONTRE, acceleration);
    }));
    if (etat !== 'rencontre') return;
    choc();
    await attendre(DELAI_OUVERTURE);
    if (etat === 'rencontre') ouvrirDiaporama();
  }

  /** Clic, Entrée ou Espace sur une arme. */
  function lancer() {
    if (etat !== 'repos') return;
    if (mouvementReduit.matches) ouvrirDiaporama(); // mouvement réduit : ouverture directe
    else rencontre(null);
  }

  function debutGlisser(event) {
    const arme = event.currentTarget;
    if (etat !== 'repos' || !event.isPrimary || event.button !== 0 || mouvementReduit.matches) return;
    prechargerPdf();
    const p = positions.get(arme);
    glisse = { arme, id: event.pointerId, x: event.clientX, y: event.clientY, depart: p, bouge: false };
    arme.setPointerCapture(event.pointerId);
  }

  function pendantGlisser(event) {
    if (!glisse || event.pointerId !== glisse.id) return;
    const dx = event.clientX - glisse.x;
    const dy = event.clientY - glisse.y;
    if (!glisse.bouge) {
      if (Math.hypot(dx, dy) < SEUIL_GLISSER) return;
      glisse.bouge = true;
      etat = 'glisse';
      glisse.arme.classList.add('is-saisie');
      document.documentElement.classList.add('is-glisse-arme');
      poserFlotte(glisse.arme);
    }
    const { arme } = glisse;
    placer(arme, glisse.depart.x + dx, glisse.depart.y + dy);
    const proche = auCentre(arme);
    sceau.classList.toggle('is-proche', proche !== false);
    if (proche === 'atteint') {
      terminerGlisser();
      rencontre(arme); // l'autre arme vient la rejoindre
    }
  }

  /** Fin du glisser ; renvoie l'arme si elle a bougé (null : simple clic, géré par l'événement click). */
  function terminerGlisser() {
    if (!glisse) return null;
    const { arme, id, bouge } = glisse;
    glisse = null;
    arme.classList.remove('is-saisie');
    document.documentElement.classList.remove('is-glisse-arme');
    sceau.classList.remove('is-proche');
    if (arme.hasPointerCapture(id)) arme.releasePointerCapture(id);
    if (!bouge) return null;
    ignorerClic = true;
    return arme;
  }

  function finGlisser(event) {
    if (!glisse || event.pointerId !== glisse.id) return;
    const arme = terminerGlisser();
    if (!arme || etat !== 'glisse') return;
    // Lâchée avant le centre : l'arme revient doucement à sa place
    etat = 'retour';
    glisserVers(arme, 0, 0, DUREE_RETOUR, 'cubic-bezier(0.2, 0.7, 0.2, 1)').then(() => {
      if (etat !== 'retour') return;
      reprendreFlotte(arme);
      etat = 'repos';
    });
  }

  /** Après la présentation : les armes reprennent leur place et leur flottement. */
  function reinitialiser() {
    etat = 'repos';
    glisse = null;
    [epee, bouclier].forEach((arme) => {
      arme.getAnimations().forEach((a) => a.cancel());
      placer(arme, 0, 0);
      arme.classList.remove('is-saisie');
      reprendreFlotte(arme);
    });
    presentation.classList.remove('is-rencontre');
    if (!mouvementReduit.matches) {
      presentation.classList.add('is-retour');
      setTimeout(() => presentation.classList.remove('is-retour'), 700);
    }
  }

  /* ========================================================================
     4. Choc : flash, étincelles, tremblement
     ======================================================================== */
  function choc() {
    const c = centre(sceau);
    const zone = presentation.getBoundingClientRect();
    const x = c.x - zone.left;
    const y = c.y - zone.top;
    const portee = Math.min(1, zone.height / 150); // étincelles moins lointaines sur mobile

    eclat.animate(
      [{ opacity: 0.95, scale: '0.2' }, { opacity: 0.7, scale: '1', offset: 0.35 }, { opacity: 0, scale: '2.3' }],
      { duration: 560, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' },
    );

    for (let i = 0; i < NB_ETINCELLES; i++) {
      const etincelle = document.createElement('span');
      etincelle.className = 'presentation__etincelle';
      etincelle.style.left = `${x}px`;
      etincelle.style.top = `${y}px`;
      const angle = Math.random() * Math.PI * 2;
      const distance = (55 + Math.random() * 85) * portee;
      etincelle.style.rotate = `${angle}rad`;
      presentation.appendChild(etincelle);
      etincelle.animate(
        [
          { translate: '0 0', scale: '1', opacity: 1 },
          { translate: `${Math.cos(angle) * distance}px ${Math.sin(angle) * distance * 0.8}px`, scale: '0.25', opacity: 0 },
        ],
        { duration: 420 + Math.random() * 280, easing: 'cubic-bezier(0.15, 0.7, 0.3, 1)' },
      ).finished.then(() => etincelle.remove(), () => etincelle.remove());
    }

    // Recul des deux armes, puis léger tremblement de la page
    epee.firstElementChild.animate([{ transform: 'none' }, { transform: 'translateX(-8px) rotate(-3deg)' }, { transform: 'none' }], { duration: 280, easing: 'ease-out' });
    bouclier.firstElementChild.animate([{ transform: 'none' }, { transform: 'translateX(7px) rotate(4deg)' }, { transform: 'none' }], { duration: 280, easing: 'ease-out' });
    const page = document.getElementById('contenu');
    if (page) {
      page.animate(
        [{ translate: '0 0' }, { translate: '-5px 2px' }, { translate: '4px -2px' }, { translate: '-3px 1px' }, { translate: '2px 0' }, { translate: '0 0' }],
        { duration: 340, easing: 'linear' },
      );
    }
  }

  /* ========================================================================
     5. Diaporama : plein écran, PDF.js, navigation
     → Espace, clic, Page suivante : diapo suivante ; ← Page précédente : précédente ;
     Début / Fin : première / dernière ; Échap : fermer. Sur écran tactile : glisser.
     ======================================================================== */
  let dialog = null;
  let scene = null;          // zone de la diapo (un clic = diapo suivante)
  let compteur = null;
  let message = null;        // chargement ou erreur
  let pdf = null;            // document PDF.js
  let chargementPdf = null;
  let courant = 1;
  let jeton = 0;             // seule la dernière diapo demandée s'affiche
  const rendus = new Map();  // numéro → { cle, promesse } : diapo courante et ses voisines, prêtes à l'avance
  let minuterieCalme = 0;
  let minuterieTaille = 0;
  let defilementAvant = null; // position de la page avant le plein écran, rétablie à la fermeture
  let toucher = null;
  let ignorerClicScene = false;

  /** Adresse absolue d'un fichier du site (data-racine du <body> : « ../../ » pour une fiche projet). */
  function adresse(chemin) {
    return new URL((document.body.getAttribute('data-racine') || '') + chemin, window.location.href).href;
  }

  /** Charge PDF.js puis le document ; appelé dès qu'on approche une arme, pour être prêt au choc. */
  function chargerPdf() {
    if (!chargementPdf) {
      chargementPdf = import(adresse('assets/js/pdfjs/pdf.min.mjs'))
        .then((pdfjs) => {
          pdfjs.GlobalWorkerOptions.workerSrc = adresse('assets/js/pdfjs/pdf.worker.min.mjs');
          return pdfjs.getDocument({ url: urlPdf }).promise;
        })
        .then((doc) => {
          pdf = doc;
          return doc;
        })
        .catch((erreur) => {
          chargementPdf = null; // nouvel essai à la prochaine ouverture
          throw erreur;
        });
    }
    return chargementPdf;
  }

  function prechargerPdf() {
    chargerPdf().catch(() => {});
  }

  /** Le plein écran a pu décaler la page : on la remet là où elle était (une fois sorti du plein écran). */
  function retablirDefilement() {
    if (defilementAvant === null || document.fullscreenElement) return;
    const y = defilementAvant;
    defilementAvant = null;
    requestAnimationFrame(() => window.scrollTo({ top: y, behavior: 'instant' }));
  }

  /** Dessine une diapo dans un <canvas> à la taille de l'écran (net, sans déformation). */
  function rendre(numero) {
    const zone = scene.getBoundingClientRect();
    const largeur = Math.max(1, Math.round(zone.width));
    const hauteur = Math.max(1, Math.round(zone.height));
    const densite = Math.min(window.devicePixelRatio || 1, 3);
    const cle = `${largeur}x${hauteur}@${densite}`;
    const deja = rendus.get(numero);
    if (deja && deja.cle === cle) return deja.promesse;

    const promesse = pdf.getPage(numero).then(async (page) => {
      const base = page.getViewport({ scale: 1 });
      const vue = page.getViewport({ scale: Math.min(largeur / base.width, hauteur / base.height) * densite });
      const canvas = document.createElement('canvas');
      canvas.className = 'diaporama__diapo';
      canvas.width = Math.floor(vue.width);
      canvas.height = Math.floor(vue.height);
      await page.render({ canvas, viewport: vue }).promise;
      // Texte de la diapo pour les lecteurs d'écran
      const contenu = await page.getTextContent();
      const texte = contenu.items.map((item) => item.str).join(' ').replace(/\s+/g, ' ').trim();
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', `Diapositive ${numero} : ${texte}`);
      return canvas;
    });
    rendus.set(numero, { cle, promesse });
    promesse.catch(() => rendus.delete(numero));
    return promesse;
  }

  async function afficher(numero) {
    if (!pdf || !dialog.open) return;
    const total = pdf.numPages;
    courant = Math.min(Math.max(1, numero), total);
    const ticket = ++jeton;
    compteur.innerHTML = `<span aria-hidden="true">${courant} / ${total}</span><span class="sr-only">Diapositive ${courant} sur ${total}</span>`;
    let canvas;
    try {
      canvas = await rendre(courant);
    } catch (erreur) {
      if (ticket === jeton) afficherErreur(erreur);
      return;
    }
    if (ticket !== jeton || !dialog.open) return;
    if (scene.firstChild !== canvas) scene.replaceChildren(canvas);
    // Les diapos voisines sont préparées pendant que l'on parle ; les autres sont libérées
    rendus.forEach((rendu, n) => { if (Math.abs(n - courant) > 1) rendus.delete(n); });
    if (courant < total) rendre(courant + 1).catch(() => {});
    if (courant > 1) rendre(courant - 1).catch(() => {});
  }

  function afficherMessage(texte) {
    message.textContent = texte;
    message.hidden = !texte;
  }

  function afficherErreur(erreur) {
    if (window.console) console.error('[Portfolio] Présentation :', erreur);
    message.replaceChildren(
      Object.assign(document.createElement('p'), { textContent: "La présentation n'a pas pu s'ouvrir ici." }),
      Object.assign(document.createElement('a'), {
        className: 'btn btn--primary', href: urlPdf, target: '_blank', rel: 'noopener', textContent: 'Ouvrir le PDF',
      }),
    );
    message.hidden = false;
  }

  /** Souris immobile : le bouton × et le curseur s'effacent (projection plus nette). */
  function reveiller() {
    dialog.classList.remove('is-calme');
    clearTimeout(minuterieCalme);
    minuterieCalme = setTimeout(() => dialog.classList.add('is-calme'), DELAI_CALME);
  }

  function creerDiaporama() {
    const icones = P.icones || {};
    dialog = document.createElement('dialog');
    dialog.className = 'diaporama';
    dialog.setAttribute('aria-label', titre);
    dialog.innerHTML = `
      <div class="diaporama__scene" tabindex="-1" autofocus></div>
      <div class="diaporama__message" role="status" hidden></div>
      <p class="diaporama__compteur" aria-live="polite"></p>
      <button class="diaporama__fermer" type="button" aria-label="Fermer la présentation (Échap)">${icones.fermer || '×'}</button>`;
    document.body.appendChild(dialog);
    scene = dialog.querySelector('.diaporama__scene');
    message = dialog.querySelector('.diaporama__message');
    compteur = dialog.querySelector('.diaporama__compteur');

    dialog.querySelector('.diaporama__fermer').addEventListener('click', () => dialog.close());

    // Clavier (et télécommandes de présentation, qui envoient Page suivante / précédente)
    dialog.addEventListener('keydown', (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey || !pdf) return;
      let cible;
      switch (event.key) {
        case 'ArrowRight': case 'ArrowDown': case 'PageDown': cible = courant + 1; break;
        case 'ArrowLeft': case 'ArrowUp': case 'PageUp': cible = courant - 1; break;
        case ' ': case 'Spacebar':
          if (event.target.closest('button, a')) return; // Espace garde son rôle sur le bouton ×
          cible = event.shiftKey ? courant - 1 : courant + 1;
          break;
        case 'Home': cible = 1; break;
        case 'End': cible = pdf.numPages; break;
        default: return;
      }
      // Empêche aussi interface.js d'utiliser les flèches (changement de page, sélection)
      event.preventDefault();
      afficher(cible);
    });

    // Clic : diapo suivante ; écran tactile : glisser vers la gauche ou la droite
    scene.addEventListener('click', () => {
      if (ignorerClicScene) {
        ignorerClicScene = false;
        return;
      }
      if (pdf) afficher(courant + 1);
    });
    scene.addEventListener('pointerdown', (event) => {
      ignorerClicScene = false;
      toucher = event.pointerType === 'mouse' ? null : { x: event.clientX, y: event.clientY };
    });
    scene.addEventListener('pointerup', (event) => {
      if (!toucher || !pdf) return;
      const dx = event.clientX - toucher.x;
      const dy = event.clientY - toucher.y;
      toucher = null;
      if (Math.abs(dx) > SEUIL_BALAYAGE && Math.abs(dx) > Math.abs(dy) * 1.2) {
        ignorerClicScene = true;
        afficher(courant + (dx < 0 ? 1 : -1));
      }
    });
    scene.addEventListener('pointercancel', () => { toucher = null; });
    dialog.addEventListener('pointermove', reveiller);
    dialog.addEventListener('pointerdown', reveiller);

    // Écran redimensionné (entrée en plein écran, rotation…) : diapo redessinée à la bonne taille
    if (typeof ResizeObserver === 'function') {
      new ResizeObserver(() => {
        clearTimeout(minuterieTaille);
        minuterieTaille = setTimeout(() => { if (dialog.open && pdf) afficher(courant); }, 150);
      }).observe(scene);
    }

    // Fermeture (Échap, bouton ×) : sortie du plein écran, armes remises en place
    dialog.addEventListener('close', () => {
      clearTimeout(minuterieCalme);
      jeton++;
      scene.replaceChildren();
      rendus.clear();
      if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
      reinitialiser();
      retablirDefilement(); // encore en plein écran : ce sera fait à la sortie (fullscreenchange)
    });
  }

  async function ouvrirDiaporama() {
    etat = 'ouvert';
    if (typeof HTMLDialogElement !== 'function') {
      window.open(urlPdf, '_blank', 'noopener');
      reinitialiser();
      return;
    }
    if (!dialog) creerDiaporama();
    defilementAvant = window.scrollY;

    // Vrai plein écran d'abord (la fenêtre doit s'afficher par-dessus) ; refusé : la présentation
    // recouvre simplement la fenêtre du navigateur
    const racine = document.documentElement;
    if (racine.requestFullscreen && !document.fullscreenElement) {
      let demande = null;
      try {
        demande = racine.requestFullscreen({ navigationUI: 'hide' });
      } catch (erreur) {
        demande = null;
      }
      if (demande) await Promise.race([demande.catch(() => {}), attendre(1200)]);
      if (etat !== 'ouvert') return; // Échap pendant le passage en plein écran
    }

    courant = 1;
    scene.replaceChildren();
    afficherMessage('Chargement de la présentation…');
    dialog.showModal();
    reveiller();
    try {
      await chargerPdf();
    } catch (erreur) {
      if (dialog.open) afficherErreur(erreur);
      return;
    }
    if (!dialog.open) return;
    afficherMessage('');
    afficher(1);
  }

  /* ========================================================================
     6. Initialisation
     ======================================================================== */
  function construire(texteAide) {
    presentation = document.createElement('div');
    presentation.className = 'presentation reveal';
    presentation.innerHTML = `
      <button class="presentation__arme presentation__arme--epee" type="button" aria-label="Épée : lancer la présentation" aria-describedby="presentation-aide">
        <span class="presentation__flotte">${SVG_EPEE}</span>
      </button>
      <span class="presentation__sceau" aria-hidden="true"></span>
      <span class="presentation__eclat" aria-hidden="true"></span>
      <button class="presentation__arme presentation__arme--bouclier" type="button" aria-label="Bouclier : lancer la présentation" aria-describedby="presentation-aide">
        <span class="presentation__flotte">${SVG_BOUCLIER}</span>
      </button>
      <p class="presentation__aide" id="presentation-aide"></p>`;
    presentation.querySelector('.presentation__aide').textContent = texteAide;
    epee = presentation.querySelector('.presentation__arme--epee');
    bouclier = presentation.querySelector('.presentation__arme--bouclier');
    sceau = presentation.querySelector('.presentation__sceau');
    eclat = presentation.querySelector('.presentation__eclat');

    [epee, bouclier].forEach((arme) => {
      positions.set(arme, { x: 0, y: 0 });
      arme.addEventListener('click', (event) => {
        // Le clic qui suit un glisser est ignoré ; Entrée et Espace (detail = 0) lancent toujours
        if (ignorerClic && event.detail !== 0) {
          ignorerClic = false;
          return;
        }
        lancer();
      });
      arme.addEventListener('pointerdown', debutGlisser);
      arme.addEventListener('pointermove', pendantGlisser);
      arme.addEventListener('pointerup', finGlisser);
      arme.addEventListener('pointercancel', finGlisser);
      arme.addEventListener('lostpointercapture', finGlisser);
      // PDF.js et le document sont chargés dès qu'on approche une arme
      arme.addEventListener('pointerenter', prechargerPdf, { once: true });
      arme.addEventListener('focus', prechargerPdf, { once: true });
    });
    // Un nouvel appui annule le « clic ignoré » d'un glisser précédent
    document.addEventListener('pointerdown', () => { ignorerClic = false; }, true);

    // Esc en plein écran : le navigateur quitte le plein écran ; la présentation se ferme avec lui
    document.addEventListener('fullscreenchange', () => {
      if (document.fullscreenElement) return;
      if (dialog && dialog.open) {
        dialog.close();
        return;
      }
      if (etat === 'ouvert') reinitialiser();
      retablirDefilement();
    });
  }

  P.presentation = {
    /** Remplace le bloc « ::: presentation » par l'épée et le bouclier, au-dessus du séparateur. */
    init() {
      const bloc = document.querySelector('.bloc-presentation');
      const lien = bloc && bloc.querySelector('a[href]');
      if (!lien) return;
      urlPdf = lien.href;
      titre = lien.textContent.replace(/\(\s*pdf\s*\)/i, '').trim() || 'Présentation';
      const paragraphe = bloc.querySelector('p');
      construire((paragraphe && paragraphe.textContent.trim()) || 'Clique ou fais glisser une arme vers le centre.');
      // Toute la largeur de la page, sous les deux colonnes de la fiche
      const fiche = bloc.closest('.section');
      if (fiche) fiche.appendChild(presentation);
      else bloc.after(presentation);
      bloc.remove();
    },
  };
}());
