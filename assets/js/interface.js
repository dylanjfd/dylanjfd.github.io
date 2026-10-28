/* ==========================================================================
   Portfolio BTS SIO — interface.js
   Comportements de l'interface (sans framework ni bibliothèque).
   --------------------------------------------------------------------------
   SOMMAIRE
    1. Thème clair / sombre (mémorisé dans le navigateur, sans cookie) et CV assorti
    2. Menu mobile
    3. Apparition au défilement et jauges
    4. Particules lumineuses du hero (30 maximum)
    5. Filtre du journal de quêtes (projets)
    6. Aperçu des PDF (CV, tableau E5) avec bouton de téléchargement
    7. Navigation aux flèches directionnelles (pages, puis toute la page après Tab)
    8. Divers : année du pied de page, cases à compléter
    9. Initialisation : en-tête (immédiat) puis contenu (après rendu.js)
   ========================================================================== */
(function () {
  'use strict';
  const P = (window.Portfolio = window.Portfolio || {});
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ========================================================================
     1. Thème clair / sombre
     ======================================================================== */
  const THEME_COLORS = { dark: '#0e1320', light: '#f3ecdd' };

  function currentTheme() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function setTheme(theme, remember) {
    root.setAttribute('data-theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEME_COLORS[theme]);
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.setAttribute('aria-pressed', String(theme === 'light'));
    });
    if (remember) {
      try { localStorage.setItem('theme', theme); } catch (e) { /* stockage indisponible : on ignore */ }
    }
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }

  function initTheme() {
    setTheme(currentTheme(), false);
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.addEventListener('click', () => setTheme(currentTheme() === 'light' ? 'dark' : 'light', true));
    });
  }

  /* CV assorti au thème : dans le Markdown, les liens pointent vers assets/docs/cv.pdf
     (version par défaut, utilisée sans JavaScript). Ils sont redirigés ici vers la
     version sombre ou claire, puis mis à jour à chaque changement de thème. */
  const CV = {
    dark: { fichier: 'cv-nuit.pdf', version: 'version sombre' },
    light: { fichier: 'cv-parchemin.pdf', version: 'version claire' },
  };

  function updateCvLinks() {
    const { fichier, version } = CV[currentTheme()];
    // [data-cv] : liens déjà redirigés (leur adresse ne se termine plus par cv.pdf)
    document.querySelectorAll('a[href$="assets/docs/cv.pdf"], a[data-cv]').forEach((link) => {
      if (!link.hasAttribute('data-cv')) link.setAttribute('data-cv', link.getAttribute('href'));
      link.setAttribute('href', link.getAttribute('data-cv').replace(/cv\.pdf$/, fichier));
      if (link.hasAttribute('download')) link.setAttribute('download', fichier);
      // Précision lue par les lecteurs d'écran ; « PDF » n'est pas répété s'il figure déjà dans le texte (« CV (PDF) »)
      let precision = link.querySelector('[data-cv-precision]');
      if (!precision) {
        precision = document.createElement('span');
        precision.className = 'sr-only';
        precision.setAttribute('data-cv-precision', /\bpdf\b/i.test(link.textContent) ? '' : 'PDF, ');
        link.appendChild(precision);
      }
      precision.textContent = ` (${precision.getAttribute('data-cv-precision')}${version})`;
    });
  }

  function initCvLinks() {
    updateCvLinks();
    document.addEventListener('themechange', updateCvLinks);
  }

  /* ========================================================================
     2. Menu mobile
     ======================================================================== */
  function initNav() {
    const toggle = document.querySelector('[data-nav-toggle]');
    const nav = toggle ? document.getElementById(toggle.getAttribute('aria-controls')) : null;
    if (!toggle || !nav) return;

    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    };

    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        event.preventDefault(); // Échap déjà utilisé : la sélection reste sur le bouton du menu
        setOpen(false);
        toggle.focus();
      }
    });

    document.addEventListener('click', (event) => {
      if (nav.classList.contains('is-open') && !nav.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
    });

    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) setOpen(false);
    });

    const desktop = window.matchMedia('(min-width: 64rem)');
    const onChange = () => { if (desktop.matches) setOpen(false); };
    if (desktop.addEventListener) desktop.addEventListener('change', onChange);
  }

  /* ========================================================================
     3. Apparition au défilement et jauges
     .reveal : apparition en fondu ; .gauge : remplissage segment par segment.
     ======================================================================== */
  function initReveal() {
    const items = document.querySelectorAll('.reveal, .gauge');
    if (!items.length) return;
    if (!('IntersectionObserver' in window) || reduceMotion.matches) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
    items.forEach((el) => observer.observe(el));
  }

  /* ========================================================================
     4. Particules lumineuses du hero
     30 particules maximum, en pause quand l'onglet est caché, que le hero
     n'est plus visible ou que la fenêtre du CV est ouverte, désactivées si
     prefers-reduced-motion est actif.
     ======================================================================== */
  function initParticles() {
    const canvas = document.querySelector('[data-particles]');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const MAX_PARTICLES = 30;
    const particles = [];
    let width = 0;
    let height = 0;
    let rafId = 0;
    let inView = true;
    let apercuOuvert = false; // fenêtre d'aperçu PDF (CV) ouverte par-dessus
    let rgb = '227, 194, 125';

    function readColor() {
      const value = getComputedStyle(root).getPropertyValue('--particle-rgb').trim();
      if (value) rgb = value;
    }

    function spawn(p, anywhere) {
      p.x = Math.random() * width;
      p.y = anywhere ? Math.random() * height : height + 12;
      p.r = 0.7 + Math.random() * 1.6;
      p.speed = 0.12 + Math.random() * 0.28;
      p.drift = (Math.random() - 0.5) * 0.12;
      p.phase = Math.random() * Math.PI * 2;
      p.alpha = 0.25 + Math.random() * 0.45;
      return p;
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      // Moins de particules sur petit écran, jamais plus de 30
      const target = Math.max(8, Math.min(MAX_PARTICLES, Math.round(width / 45)));
      while (particles.length < target) particles.push(spawn({}, true));
      particles.length = target;
    }

    function frame() {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.y -= p.speed;
        p.phase += 0.012;
        p.x += p.drift + Math.sin(p.phase) * 0.12;
        if (p.y < -12 || p.x < -12 || p.x > width + 12) spawn(p, false);
        const alpha = p.alpha * (0.65 + 0.35 * Math.sin(p.phase * 1.7));
        const radius = p.r * 5;
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
        glow.addColorStop(0, `rgba(${rgb}, ${alpha})`);
        glow.addColorStop(0.35, `rgba(${rgb}, ${alpha * 0.35})`);
        glow.addColorStop(1, `rgba(${rgb}, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      rafId = requestAnimationFrame(frame);
    }

    function start() {
      if (!rafId && inView && !apercuOuvert && !document.hidden && !reduceMotion.matches) rafId = requestAnimationFrame(frame);
    }

    function stop() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    }

    readColor();
    resize();
    start();

    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    document.addEventListener('themechange', readColor);
    // Pendant l'aperçu du CV, le navigateur n'a plus que le PDF à dessiner : défilement fluide
    document.addEventListener('apercupdf', (event) => {
      apercuOuvert = event.detail.ouvert;
      if (apercuOuvert) stop(); else start();
    });

    const onMotionChange = () => {
      if (reduceMotion.matches) {
        stop();
        ctx.clearRect(0, 0, width, height);
      } else {
        start();
      }
    };
    if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', onMotionChange);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        inView = entries[0].isIntersecting;
        if (inView) start(); else stop();
      }).observe(canvas);
    }

    let resizeTimer = 0;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });
  }

  /* ========================================================================
     5. Filtre du journal de quêtes (projets)
     Boutons [data-filter] ; cartes [data-type="entreprise" | "academique" | "personnel"].
     ======================================================================== */
  function initQuestFilter() {
    const buttons = document.querySelectorAll('[data-filter]');
    const cards = document.querySelectorAll('[data-type]');
    const count = document.querySelector('[data-filter-count]');
    if (!buttons.length || !cards.length) return;

    function apply(filter) {
      let visible = 0;
      cards.forEach((card) => {
        const show = filter === 'all' || card.getAttribute('data-type') === filter;
        card.hidden = !show;
        if (show) {
          visible += 1;
          card.classList.add('is-visible');
        }
      });
      buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.getAttribute('data-filter') === filter)));
      if (count) {
        const text = `${visible} projet${visible > 1 ? 's' : ''} affiché${visible > 1 ? 's' : ''}`;
        if (count.textContent !== text) count.textContent = text;
      }
    }

    buttons.forEach((button) => button.addEventListener('click', () => apply(button.getAttribute('data-filter'))));
    const active = document.querySelector('[data-filter][aria-pressed="true"]');
    apply(active ? active.getAttribute('data-filter') : 'all');
  }

  /* ========================================================================
     6. Aperçu des PDF (CV, tableau E5)
     Les boutons [data-apercu-pdf] ouvrent le document dans une fenêtre
     (<dialog>) avec un bouton « Télécharger ». Sur mobile, ou si le navigateur
     n'affiche pas les PDF lui-même, le document s'ouvre dans un nouvel onglet.
     ======================================================================== */
  function initPdfPreview() {
    const links = document.querySelectorAll('[data-apercu-pdf]');
    if (!links.length) return;

    const inline = typeof HTMLDialogElement === 'function'
      && navigator.pdfViewerEnabled !== false
      && !window.matchMedia('(pointer: coarse)').matches;
    if (!inline) {
      links.forEach((link) => {
        link.target = '_blank';
        link.rel = 'noopener';
      });
      return;
    }

    const icons = P.icones || {};
    const dialog = document.createElement('dialog');
    dialog.className = 'pdf-viewer';
    dialog.setAttribute('aria-labelledby', 'pdf-viewer-title');
    dialog.innerHTML = `
      <div class="pdf-viewer__bar">
        <p class="pdf-viewer__title" id="pdf-viewer-title"></p>
        <div class="pdf-viewer__actions">
          <a class="btn btn--primary" data-pdf-download download>${icons.telecharger || ''}Télécharger</a>
          <button class="btn btn--ghost" type="button" data-pdf-close>${icons.fermer || ''}Fermer</button>
        </div>
      </div>
      <iframe class="pdf-viewer__frame"></iframe>`;
    document.body.appendChild(dialog);

    const title = dialog.querySelector('#pdf-viewer-title');
    const download = dialog.querySelector('[data-pdf-download]');
    const frame = dialog.querySelector('iframe');

    function open(link) {
      const href = link.getAttribute('href');
      // « Voir mon CV (PDF) » ou « Voir mon CV (PDF, version sombre) » → « Mon CV »
      const label = link.textContent.replace(/\((pdf|version)[^)]*\)/gi, '').trim().replace(/^(voir|afficher|consulter|télécharger)\s+/i, '');
      const name = label.charAt(0).toUpperCase() + label.slice(1);
      title.textContent = name;
      frame.title = `Aperçu : ${name}`;
      download.href = href;
      if (frame.getAttribute('src') !== href) frame.setAttribute('src', href);
      dialog.showModal();
      document.dispatchEvent(new CustomEvent('apercupdf', { detail: { ouvert: true } }));
    }

    links.forEach((link) => link.addEventListener('click', (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey) return; // ouverture dans un onglet demandée
      event.preventDefault();
      open(link);
    }));

    dialog.querySelector('[data-pdf-close]').addEventListener('click', () => dialog.close());
    // Fermeture par le bouton, Échap ou un clic sur le fond : les animations reprennent
    dialog.addEventListener('close', () => document.dispatchEvent(new CustomEvent('apercupdf', { detail: { ouvert: false } })));
    // Clic sur le fond assombri, autour de la fenêtre
    dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  }

  /* ========================================================================
     7. Navigation aux flèches directionnelles
     Sans sélection : ← / → changent de page (boutons de bas de page sur une
     fiche projet, ordre du menu principal ailleurs) ; ↑ / ↓ font défiler.
     Dès qu'un élément est sélectionné au clavier (Tab) : les quatre flèches
     déplacent la sélection vers l'élément le plus proche dans cette direction,
     dans toute la page. Si cet élément est encore hors de l'écran, ↑ / ↓ font
     d'abord défiler la page (le texte entre deux liens n'est pas sauté).
     Échap retire la sélection : ← / → changent de nouveau de page.
     ======================================================================== */
  const FOCUSABLES = 'a[href], button:not([disabled]), input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]';
  const SAISIE_TEXTE = 'input:not([type]), input[type="text"], input[type="email"], input[type="tel"], input[type="url"], input[type="search"], input[type="password"]';
  const FLECHES_NATIVES = 'video, audio, input[type="radio"], input[type="range"], input[type="number"], input[type="date"], input[type="time"], input[type="datetime-local"], input[type="month"], input[type="week"], input[type="color"]';
  const DIRECTIONS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  const PAS_DEFILEMENT = 0.6; // part de l'écran parcourue par ↑ / ↓ quand l'élément suivant est loin
  let modeClavier = false;    // passe à vrai avec Tab, à faux avec un clic ou Échap

  /** Liens vers la page précédente et la page suivante (null s'il n'y en a pas). */
  function pagesVoisines() {
    const pager = document.querySelectorAll('.pager a[href]');
    if (pager.length) {
      return { precedente: pager[0], suivante: pager.length > 1 ? pager[pager.length - 1] : null };
    }
    const menu = Array.from(document.querySelectorAll('#site-nav a[href]'));
    const i = menu.findIndex((a) => a.hasAttribute('aria-current'));
    if (i < 0) return { precedente: null, suivante: null };
    return { precedente: menu[i - 1] || null, suivante: menu[i + 1] || null };
  }

  /** Vrai si un élément est sélectionné au clavier (Tab puis flèches), pas par un clic de souris. */
  function selectionClavier(n) {
    return modeClavier && !!n && n !== document.body && n !== document.documentElement && n.tabIndex >= 0;
  }

  /** Éléments que Tab peut atteindre et qui sont affichés, dans l'ordre de lecture. */
  function elementsSelectionnables(racine) {
    return Array.from(racine.querySelectorAll(FOCUSABLES)).filter((n) => n.tabIndex >= 0
      && !n.classList.contains('skip-link')
      && n.getClientRects().length
      && getComputedStyle(n).visibility !== 'hidden');
  }

  /**
   * Position d'un élément à l'écran. Une carte cliquable compte pour la carte entière.
   * L'en-tête reste collé en haut de l'écran : vu depuis le contenu, on le place
   * à sa position naturelle (tout en haut de la page) pour ne pas y sauter en plein texte.
   */
  function boite(n, actuel) {
    const zone = n.classList.contains('stretched-link') ? n.closest('.card') || n : n;
    const r = zone.getBoundingClientRect();
    const decalage = zone.closest('.site-header') && !actuel.closest('.site-header') ? window.scrollY : 0;
    return { left: r.left, right: r.right, top: r.top - decalage, bottom: r.bottom - decalage };
  }

  /** Haut de la zone visible, sous l'en-tête collant. */
  function hautVisible() {
    const entete = document.querySelector('.site-header');
    return entete ? Math.max(0, entete.getBoundingClientRect().bottom) : 0;
  }

  /** Élément le plus proche de « actuel » dans la direction donnée, d'après les positions à l'écran. */
  function voisinSpatial(actuel, [dx, dy], candidats) {
    let a = boite(actuel, actuel);
    // Sélection restée derrière pendant le défilement : ↓ repart du haut de l'écran, ↑ du bas
    if ((dy > 0 && a.bottom <= hautVisible()) || (dy < 0 && a.top >= window.innerHeight)) {
      const y = dy > 0 ? hautVisible() : window.innerHeight;
      a = { left: a.left, right: a.right, top: y, bottom: y };
    }
    let meilleur = null;
    let meilleurScore = Infinity;
    candidats.forEach((n) => {
      if (n === actuel || n.contains(actuel) || actuel.contains(n)) return;
      const b = boite(n, actuel);
      // Distance entre les bords dans la direction voulue (négative : l'élément n'est pas de ce côté)
      const avance = dx > 0 ? b.left - a.right : dx < 0 ? a.left - b.right : dy > 0 ? b.top - a.bottom : a.top - b.bottom;
      if (avance < -2) return;
      // Décalage sur le côté : nul si les deux éléments sont sur la même ligne (ou la même colonne)
      const ecart = dx ? Math.max(0, b.top - a.bottom, a.top - b.bottom) : Math.max(0, b.left - a.right, a.left - b.right);
      if (dx && ecart > 0) return; // ← / → : seulement sur la même ligne
      const decentrage = dx ? Math.abs(b.top + b.bottom - a.top - a.bottom) : Math.abs(b.left + b.right - a.left - a.right);
      const score = avance + ecart * 3 + decentrage * 0.05;
      if (score < meilleurScore) {
        meilleurScore = score;
        meilleur = { element: n, boite: b };
      }
    });
    return meilleur;
  }

  /** Sélectionne un élément et le fait apparaître à l'écran, au plus près (carte cliquable : la carte entière). */
  function selectionner(n) {
    n.focus({ preventScroll: true });
    const zone = n.classList.contains('stretched-link') ? n.closest('.card') || n : n;
    zone.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  /** Vrai si le curseur d'un champ de texte est tout au début (ou tout à la fin), ou si le champ est vide. */
  function curseurAuBord(n, versLaFin) {
    let debut = null;
    let fin = null;
    try { debut = n.selectionStart; fin = n.selectionEnd; } catch (e) { /* champ e-mail : position inconnue */ }
    if (debut === null) return n.value === '';
    return versLaFin ? debut === n.value.length && fin === n.value.length : debut === 0 && fin === 0;
  }

  /** Vrai si la flèche doit garder son rôle habituel dans l'élément sélectionné (saisie, lecteur…). */
  function flechesNatives(n, touche) {
    const verticale = touche === 'ArrowUp' || touche === 'ArrowDown';
    const versLaFin = touche === 'ArrowRight' || touche === 'ArrowDown';
    if (n.isContentEditable || n.matches(FLECHES_NATIVES)) return true;
    // Champ de texte : les flèches déplacent le curseur, puis font sortir du champ une fois au bord
    // (champ d'une ligne : ↑ / ↓ en sortent tout de suite). Une liste (select) se comporte comme
    // un bouton : les flèches passent au champ voisin, Espace ou Entrée l'ouvrent.
    if (n.matches('textarea')) return !curseurAuBord(n, versLaFin);
    if (n.matches(SAISIE_TEXTE)) return !verticale && !curseurAuBord(n, versLaFin);
    // Zone qui défile sur le côté (tableau large) : ← / → la font défiler
    if (!verticale) {
      for (let p = n; p && p !== document.body; p = p.parentElement) {
        if (p.scrollWidth > p.clientWidth + 1 && /auto|scroll/.test(getComputedStyle(p).overflowX)) return true;
      }
    }
    return false;
  }

  function initArrowNav() {
    const voisines = pagesVoisines();

    // Un clic (souris, doigt) quitte le mode clavier : ← / → changent de nouveau de page
    document.addEventListener('pointerdown', () => { modeClavier = false; }, true);

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        modeClavier = true;
        return;
      }
      if (event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const dialogue = document.querySelector('dialog[open]');
      const actuel = document.activeElement;

      // Échap : retire la sélection (le menu mobile et l'aperçu PDF gèrent leur propre Échap)
      if (event.key === 'Escape') {
        if (!dialogue && selectionClavier(actuel) && !actuel.matches('input, textarea, select')) {
          actuel.blur();
          modeClavier = false;
        }
        return;
      }

      const direction = DIRECTIONS[event.key];
      if (!direction) return;

      if (selectionClavier(actuel)) {
        if (flechesNatives(actuel, event.key)) return;
        const candidats = elementsSelectionnables(dialogue || document);
        const voisin = voisinSpatial(actuel, direction, candidats);
        if (direction[0]) {
          // ← / → sans voisin sur la ligne : élément précédent ou suivant dans l'ordre de lecture
          const i = candidats.indexOf(actuel);
          const cible = voisin ? voisin.element : i >= 0 ? candidats[i + direction[0]] : null;
          if (cible) {
            event.preventDefault();
            selectionner(cible);
          }
          return;
        }
        if (!voisin) return; // ↑ / ↓ sans rien au-dessus ou en dessous : la page défile normalement
        event.preventDefault();
        // Voisin proche : on le sélectionne ; voisin loin : la page avance d'un grand pas vers lui,
        // pour lire le texte qui les sépare
        const haut = hautVisible();
        const pas = (window.innerHeight - haut) * PAS_DEFILEMENT;
        const manque = direction[1] > 0 ? voisin.boite.bottom - window.innerHeight : haut - voisin.boite.top;
        if (manque <= pas) selectionner(voisin.element);
        else window.scrollBy({ top: direction[1] * pas });
        return;
      }

      if (dialogue || !direction[0] || event.repeat) return;
      // Champ ou tableau cliqué à la souris : les flèches y gardent leur rôle, jamais de changement de page
      if (actuel && actuel !== document.body && (actuel.matches('input, textarea, select') || flechesNatives(actuel, event.key))) return;
      const lien = direction[0] < 0 ? voisines.precedente : voisines.suivante;
      if (!lien) return;
      event.preventDefault();
      window.location.assign(lien.href);
    });

    // Astuce dans le pied de page (masquée sur les écrans tactiles, voir 03-entete-pied.css)
    const pied = document.querySelector('.footer__bottom');
    if (pied) {
      const astuce = document.createElement('p');
      astuce.className = 'footer__hint';
      astuce.innerHTML = voisines.precedente || voisines.suivante
        ? 'Astuce : <kbd>←</kbd> <kbd>→</kbd> pour changer de page ; après <kbd>Tab</kbd>, les flèches déplacent la sélection (<kbd>Échap</kbd> pour la retirer).'
        : 'Astuce : après <kbd>Tab</kbd>, les flèches du clavier déplacent la sélection (<kbd>Échap</kbd> pour la retirer).';
      pied.appendChild(astuce);
    }
  }

  /* ========================================================================
     8. Divers : année du pied de page, cases à compléter
     ======================================================================== */
  function initYear() {
    const year = String(new Date().getFullYear());
    document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = year; });
  }

  function reportTodos() {
    const count = document.querySelectorAll('.todo').length;
    if (count && window.console) {
      console.info(`[Portfolio] ${count} case(s) à compléter sur cette page : textes [[entre doubles crochets]] dans contenu/*.md.`);
    }
  }

  /* ========================================================================
     9. Initialisation
     ======================================================================== */
  P.interface = {
    /** En-tête présent dans le HTML : utilisable tout de suite. */
    initEntete() {
      initTheme();
      initNav();
    },
    /** Contenu produit par rendu.js à partir du Markdown. */
    initContenu() {
      initCvLinks();
      initReveal();
      initParticles();
      initQuestFilter();
      initPdfPreview();
      initArrowNav();
      initYear();
      reportTodos();
    },
  };
}());
