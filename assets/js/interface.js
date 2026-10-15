/* ==========================================================================
   Portfolio BTS SIO — interface.js
   Comportements de l'interface (sans framework ni bibliothèque).
   --------------------------------------------------------------------------
   SOMMAIRE
    1. Thème clair / sombre (mémorisé dans le navigateur, sans cookie)
    2. Menu mobile
    3. Apparition au défilement et jauges
    4. Particules lumineuses du hero (30 maximum)
    5. Filtre du journal de quêtes (projets)
    6. Aperçu des PDF (CV, tableau E5) avec bouton de téléchargement
    7. Divers : année du pied de page, cases à compléter
    8. Initialisation : en-tête (immédiat) puis contenu (après rendu.js)
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
     30 particules maximum, en pause quand l'onglet est caché ou que le hero
     n'est plus visible, désactivées si prefers-reduced-motion est actif.
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
      if (!rafId && inView && !document.hidden && !reduceMotion.matches) rafId = requestAnimationFrame(frame);
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
      // « Voir mon CV (PDF) » → « Mon CV »
      const label = link.textContent.replace(/\(pdf\)/i, '').trim().replace(/^(voir|afficher|consulter|télécharger)\s+/i, '');
      const name = label.charAt(0).toUpperCase() + label.slice(1);
      title.textContent = name;
      frame.title = `Aperçu : ${name}`;
      download.href = href;
      if (frame.getAttribute('src') !== href) frame.setAttribute('src', href);
      dialog.showModal();
    }

    links.forEach((link) => link.addEventListener('click', (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey) return; // ouverture dans un onglet demandée
      event.preventDefault();
      open(link);
    }));

    dialog.querySelector('[data-pdf-close]').addEventListener('click', () => dialog.close());
    // Clic sur le fond assombri, autour de la fenêtre
    dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  }

  /* ========================================================================
     7. Divers : année du pied de page, cases à compléter
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
     8. Initialisation
     ======================================================================== */
  P.interface = {
    /** En-tête présent dans le HTML : utilisable tout de suite. */
    initEntete() {
      initTheme();
      initNav();
    },
    /** Contenu produit par rendu.js à partir du Markdown. */
    initContenu() {
      initReveal();
      initParticles();
      initQuestFilter();
      initPdfPreview();
      initYear();
      reportTodos();
    },
  };
}());
