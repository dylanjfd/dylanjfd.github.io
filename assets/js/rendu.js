/* ==========================================================================
   Portfolio BTS SIO — rendu.js
   Construit chaque page à partir de son fichier Markdown (contenu/*.md) :
   en-tête de page, sections, cartes, jauges, frise, tableau E5…
   La structure HTML produite est celle attendue par les feuilles de style.
   --------------------------------------------------------------------------
   SOMMAIRE
    1. Réglages et outils (éléments, texte en ligne, champs « clé: valeur »)
    2. Composants partagés (boutons, badges, jauges, étiquettes)
    3. Blocs génériques (paragraphes, listes, citations, tableaux, images)
    4. Blocs spéciaux « ::: nom » (un par composant du thème)
    5. En-têtes de page (accueil et pages intérieures)
    6. Sections et mises en page (standard, fiche, texte, contact)
    7. Gabarit commun (nom, pied de page, titre de l'onglet) et erreurs
    8. Point d'entrée : Portfolio.rendre()
   ========================================================================== */
(function () {
  'use strict';
  const P = (window.Portfolio = window.Portfolio || {});
  const MD = P.markdown;
  const ICO = P.icones;

  /* ========================================================================
     1. Réglages et outils
     ======================================================================== */
  const LIBELLES_OPTIONS = {
    SISR: "Solutions d'infrastructure, systèmes et réseaux",
    SLAM: 'Solutions logicielles et applications métiers',
  };
  const NIVEAUX_XP = ['Notions', 'Intermédiaire', 'Avancé', 'Maîtrise'];
  const COMPETENCES_E5 = [
    'Gérer le patrimoine informatique',
    'Répondre aux incidents et aux demandes',
    'Développer la présence en ligne',
    'Travailler en mode projet',
    'Mettre à disposition un service informatique',
    'Organiser son développement professionnel',
  ];
  const CHIFFRES_ROMAINS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  const ICONES_BRANCHES = {
    serveur: 'serveur', systemes: 'serveur', reseau: 'reseau', reseaux: 'reseau',
    bouclier: 'bouclier', securite: 'bouclier', cybersecurite: 'bouclier',
    code: 'code', web: 'code', application: 'application', applications: 'application',
    base: 'base', donnees: 'base', bdd: 'base', outils: 'outils', langue: 'langue', langues: 'langue',
  };
  const BADGES = {
    principale: { classe: 'badge--main', icone: 'losangePlein', texte: 'Quête principale' },
    secondaire: { classe: 'badge--side', icone: 'losangeVide', texte: 'Quête secondaire' },
    terminee: { classe: 'badge--done', icone: 'coche', texte: 'Terminée' },
    termine: { classe: 'badge--done', icone: 'coche', texte: 'Terminé' },
    'en-cours': { classe: 'badge--progress', icone: 'horloge', texte: 'En cours' },
    prevue: { classe: '', icone: 'horloge', texte: 'Prévue' },
    prevu: { classe: '', icone: 'horloge', texte: 'Prévu' },
    'a-venir': { classe: '', icone: 'horloge', texte: 'À venir' },
    debloque: { classe: 'badge--main', icone: 'tropheePetit', texte: 'Débloqué' },
    verrouille: { classe: '', icone: 'cadenasPetit', texte: 'Verrouillé' },
  };
  const ICONES_COORDONNEES = [
    [/mail|courriel/, 'courriel'],
    [/linkedin/, 'personne'],
    [/github|gitlab/, 'code'],
    [/localisation|adresse|ville|lieu/, 'lieu'],
    [/disponib/, 'calendrier'],
  ];

  let RACINE = '';
  let SITE = {};
  const idsUtilises = new Set();

  /** Crée un élément. Le contenu peut être un nœud, un tableau, ou du HTML déjà sûr (produit par markdown.js). */
  function el(balise, attributs, contenu) {
    const noeud = document.createElement(balise);
    if (attributs) {
      Object.keys(attributs).forEach((cle) => {
        const valeur = attributs[cle];
        if (valeur === false || valeur == null) return;
        if (cle === 'class') noeud.className = valeur;
        else noeud.setAttribute(cle, valeur === true ? '' : valeur);
      });
    }
    ajouter(noeud, contenu);
    return noeud;
  }

  function ajouter(parent, contenu) {
    if (contenu == null || contenu === false) return parent;
    if (Array.isArray(contenu)) contenu.forEach((c) => ajouter(parent, c));
    else if (contenu instanceof Node) parent.appendChild(contenu);
    else parent.insertAdjacentHTML('beforeend', String(contenu));
    return parent;
  }

  const ligne = (texte) => MD.enLigne(texte, { racine: RACINE });
  const texteDe = (bloc) => bloc.lignes.join('\n');

  /** Texte sans mise en forme (titre de l'onglet, identifiants…). */
  function brut(texte) {
    const div = document.createElement('div');
    div.innerHTML = ligne(texte);
    return div.textContent.replace(/\s+/g, ' ').trim();
  }

  /** Identifiant unique tiré d'un titre (pour aria-labelledby et les ancres). */
  function identifiant(texte) {
    const base = MD.normaliserCle(brut(texte)).replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'section';
    let id = base;
    let n = 2;
    while (idsUtilises.has(id) || document.getElementById(id)) id = `${base}-${n++}`;
    idsUtilises.add(id);
    return id;
  }

  function optionCourante() {
    const option = String((typeof CONFIG === 'object' && CONFIG.OPTION) || 'SISR').trim().toUpperCase();
    return LIBELLES_OPTIONS[option] ? option : 'SISR';
  }

  /**
   * Paragraphe de champs : chaque ligne est de la forme « Clé: valeur ».
   * Renvoie [{ libelle, cle, valeur }] ou null si une ligne ne suit pas ce format.
   */
  const RE_CHAMP = /^([\p{L}\p{N}][\p{L}\p{N} '’.·()\/-]{0,40}?)\s*:\s*(.*)$/u;
  function champs(bloc) {
    if (!bloc || bloc.type !== 'paragraphe') return null;
    const liste = [];
    for (const l of bloc.lignes) {
      const m = RE_CHAMP.exec(l.trim());
      if (!m) return null;
      liste.push({ libelle: m[1].trim(), cle: MD.normaliserCle(m[1]), valeur: m[2].trim() });
    }
    return liste;
  }

  function valeurChamp(liste, ...cles) {
    const trouve = (liste || []).find((c) => cles.includes(c.cle));
    return trouve ? trouve.valeur : '';
  }

  /**
   * Retire le premier paragraphe s'il s'agit d'un paragraphe de champs.
   * Avec une liste de clés autorisées, une phrase comme « 3 réalisations : … » reste du texte.
   */
  function extraireChamps(blocs, clesAutorisees) {
    const liste = champs(blocs[0]);
    if (!liste) return [];
    if (clesAutorisees && !liste.every((c) => clesAutorisees.includes(c.cle))) return [];
    blocs.shift();
    return liste;
  }
  const CLES_CARTE = ['date', 'source', 'auteur', 'lieu', 'periode', 'duree', 'niveau'];
  const CLES_QUETE = ['type', 'statut', 'fiche', 'lien', 'contexte', 'technologies', 'recompenses', 'competences'];
  const CLES_SUCCES = ['statut', 'date', 'type', 'justificatif'];

  /** Regroupe des blocs par titre (du niveau indiqué, ou de tout niveau). */
  function parTitres(blocs, niveau) {
    const groupes = [];
    let courant = null;
    blocs.forEach((b) => {
      if (b.type === 'titre' && (!niveau || b.niveau === niveau)) {
        courant = { titre: b, blocs: [] };
        groupes.push(courant);
      } else {
        if (!courant) {
          courant = { titre: null, blocs: [] };
          groupes.push(courant);
        }
        courant.blocs.push(b);
      }
    });
    return groupes;
  }

  const decouperListe = (valeur) => String(valeur).split(',').map((x) => x.trim()).filter(Boolean);
  const premiereListe = (bloc) => bloc.enfants.find((x) => x.type === 'liste');
  const capitale = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  /** Premier lien d'une ligne Markdown : { href, html }. */
  function lienDepuis(texte) {
    const div = document.createElement('div');
    div.innerHTML = ligne(texte);
    const a = div.querySelector('a');
    return a ? { href: a.getAttribute('href'), html: a.innerHTML } : null;
  }

  /** Paragraphe constitué d'un seul lien. */
  function lienSeul(bloc) {
    if (!bloc || bloc.type !== 'paragraphe' || bloc.lignes.length !== 1) return null;
    return /^\[.+\]\(.+\)$/.test(bloc.lignes[0].trim()) ? lienDepuis(bloc.lignes[0]) : null;
  }

  /* ========================================================================
     2. Composants partagés
     ======================================================================== */
  /** Bouton ; un lien vers un PDF ouvre l'aperçu du document, qui propose de le télécharger (interface.js). */
  function bouton(lien, primaire) {
    const pdf = /\.pdf($|[?#])/i.test(lien.href);
    const a = el('a', { class: `btn ${primaire ? 'btn--primary' : 'btn--ghost'}`, href: lien.href, 'data-apercu-pdf': pdf });
    return ajouter(a, pdf ? [ICO.oeil, lien.html] : [lien.html, ICO.fleche]);
  }

  /** Badge à partir d'un mot-clé : principale, secondaire, terminée, en cours, prévue, débloqué, verrouillé. */
  function badge(mot) {
    const def = BADGES[MD.normaliserCle(mot)];
    if (!def) return el('span', { class: 'badge' }, ligne(mot));
    return el('span', { class: `badge ${def.classe}`.trim() }, [ICO[def.icone], def.texte]);
  }

  function jauge(valeur, max, xp) {
    const g = el('span', { class: xp ? 'gauge gauge--xp' : 'gauge', 'data-value': String(valeur), 'aria-hidden': 'true' });
    for (let i = 0; i < max; i++) g.appendChild(document.createElement('span'));
    return g;
  }

  /** Étiquettes de technologies ; « [[Nom]] » donne une étiquette « à compléter ». */
  function etiquettes(valeurs, libelle) {
    const ul = el('ul', { class: 'tags', 'aria-label': libelle || 'Technologies' });
    valeurs.forEach((v) => {
      const aCompleter = /^\[\[(.*)\]\]$/.exec(v.trim());
      ul.appendChild(aCompleter ? el('li', { class: 'todo' }, ligne(aCompleter[1])) : el('li', null, ligne(v)));
    });
    return ul;
  }

  function listeRecompenses(valeurs, empilee) {
    const ul = el('ul', { class: `rewards__list${empilee ? ' rewards__list--stack' : ''}`, 'aria-label': 'Compétences E5 mobilisées' });
    valeurs.forEach((v) => ul.appendChild(el('li', null, ligne(v))));
    return ul;
  }

  function listeDefinitions(liste, classe) {
    return el('dl', { class: classe }, liste.map((c) => el('div', null, [
      el('dt', null, MD.echapper(c.libelle)),
      el('dd', null, ligne(c.valeur)),
    ])));
  }

  /** Surtitre (petit libellé RPG) + titre. */
  function titreComplet(titre, options) {
    const o = options || {};
    const id = o.id === false ? null : (o.id || identifiant(titre.texte));
    const elements = [];
    if (titre.surtitre) elements.push(el('p', { class: o.classeSurtitre || 'eyebrow' }, ligne(titre.surtitre)));
    elements.push(el(`h${o.niveau || titre.niveau}`, { id, class: o.classe || null }, ligne(titre.texte)));
    return { elements, id };
  }

  /* ========================================================================
     3. Blocs génériques
     ======================================================================== */
  function bloc(b, ctx) {
    const c = ctx || {};
    switch (b.type) {
      case 'paragraphe': return paragraphe(b, c);
      case 'titre': return titreComplet(b, { classeSurtitre: 'card__kicker' }).elements;
      case 'liste': return liste(b, c);
      case 'citation': return citation(b);
      case 'tableau': return tableau(b, '');
      case 'separateur': return el('div', { class: 'divider', 'aria-hidden': 'true' });
      case 'conteneur': return conteneur(b, c);
      default: return null;
    }
  }

  const RE_IMAGE = /^!\[([^\]]*)\]\((.+)\)$/;
  function paragraphe(b, ctx) {
    const image = b.lignes.length === 1 ? RE_IMAGE.exec(b.lignes[0].trim()) : null;
    if (image) {
      return el('figure', { class: 'figure-md' }, [
        el('img', { src: MD.resoudreAdresse(image[2], RACINE), alt: brut(image[1]), loading: 'lazy' }),
        image[1] ? el('figcaption', null, ligne(image[1])) : null,
      ]);
    }
    return el('p', { class: ctx.classe || null }, ligne(texteDe(b)));
  }

  /** Médaille en tête d'élément : « - 🥉 … », « - 🥈 … » ou « - 🥇 … » (l'emoji est remplacé par l'icône). */
  const MEDAILLES = {
    '🥉': { rang: 'bronze', texte: 'Médaille de bronze' },
    '🥈': { rang: 'argent', texte: "Médaille d'argent" },
    '🥇': { rang: 'or', texte: "Médaille d'or" },
  };
  const RE_MEDAILLE = /^(🥉|🥈|🥇)\s*/u;

  function elementListe(texte) {
    const m = RE_MEDAILLE.exec(texte);
    if (!m) return el('li', null, ligne(texte));
    const medaille = MEDAILLES[m[1]];
    return el('li', { class: `medal-item medal-item--${medaille.rang}` }, [
      el('span', { class: 'medal', role: 'img', 'aria-label': medaille.texte }, ICO.medaille),
      ligne(texte.slice(m[0].length)),
    ]);
  }

  function liste(b, ctx) {
    const simple = ctx.disposition === 'texte' || ctx.simple;
    const l = el(b.ordonnee ? 'ol' : 'ul', { class: !b.ordonnee && !simple ? 'list-diamond' : null });
    b.elements.forEach((item) => {
      const li = elementListe(item.texte);
      item.enfants.forEach((sous) => li.appendChild(liste(sous, ctx)));
      l.appendChild(li);
    });
    return l;
  }

  /** Citation « > » : encadré (callout), ou recommandation si la dernière ligne commence par « — ». */
  function citation(b) {
    const paragraphes = [];
    let courant = [];
    b.lignes.forEach((l) => {
      if (l.trim()) courant.push(l);
      else if (courant.length) {
        paragraphes.push(courant);
        courant = [];
      }
    });
    if (courant.length) paragraphes.push(courant);
    const dernier = paragraphes[paragraphes.length - 1] || [];
    let auteur = null;
    if (dernier.length && /^(—|--)\s*/.test(dernier[dernier.length - 1].trim())) {
      auteur = dernier.pop().trim().replace(/^(—|--)\s*/, '');
      if (!dernier.length) paragraphes.pop();
    }
    const contenu = paragraphes.map((p) => el('p', null, ligne(p.join('\n'))));
    if (auteur === null) return el('div', { class: 'callout' }, contenu);
    return el('figure', { class: 'quote' }, [el('blockquote', null, contenu), el('figcaption', null, ['— ', ligne(auteur)])]);
  }

  /** Tableau ; « x » dans une cellule = coche dorée ; une ligne « **Groupe** » seule = intertitre. */
  const RE_COCHE = /^(x|✓|✔|oui)$/i;
  function tableau(b, legende) {
    const nbColonnes = b.entetes.length;
    const aCocher = b.entetes.map((_, c) => b.rangs.some((r) => RE_COCHE.test((r[c] || '').trim())));
    const large = aCocher.some(Boolean);
    const table = el('table', { class: `e5-table${large ? '' : ' e5-table--simple'}` });
    const idLegende = legende ? identifiant('legende-tableau') : null;
    if (legende) table.appendChild(el('caption', { id: idLegende }, ligne(legende)));

    const ligneEntete = el('tr');
    b.entetes.forEach((h, c) => {
      const th = el('th', { scope: 'col', class: aCocher[c] ? 'col-check' : null });
      const competence = /^C([1-6])\b\s*(.*)$/.exec(h);
      if (competence) {
        const n = Number(competence[1]);
        th.innerHTML = `<span aria-hidden="true">C${n}${competence[2] ? `<br>${ligne(competence[2])}` : ''}</span>`
          + `<span class="sr-only">C${n} — ${COMPETENCES_E5[n - 1]}</span>`;
      } else {
        th.innerHTML = ligne(h);
      }
      ligneEntete.appendChild(th);
    });
    table.appendChild(el('thead', null, ligneEntete));

    let corps = el('tbody');
    table.appendChild(corps);
    b.rangs.forEach((rang) => {
      const premier = (rang[0] || '').trim();
      const groupe = /^\*\*(.+)\*\*$/.exec(premier);
      if (groupe && rang.slice(1).every((x) => !x.trim())) {
        if (corps.childNodes.length) {
          corps = el('tbody');
          table.appendChild(corps);
        }
        corps.appendChild(el('tr', null, el('th', { scope: 'rowgroup', colspan: String(nbColonnes) }, ligne(groupe[1]))));
        return;
      }
      const tr = el('tr');
      for (let c = 0; c < nbColonnes; c++) {
        const valeur = (rang[c] || '').trim();
        if (c === 0) tr.appendChild(el('th', { scope: 'row' }, ligne(valeur)));
        else if (aCocher[c]) {
          tr.appendChild(el('td', { class: 'cell-check' }, RE_COCHE.test(valeur)
            ? `<span class="check">${ICO.cocheTableau}<span class="sr-only">Oui</span></span>`
            : '<span class="sr-only">Non</span>'));
        } else tr.appendChild(el('td', null, ligne(valeur)));
      }
      corps.appendChild(tr);
    });

    const enveloppe = el('div', {
      class: 'table-wrap reveal', role: 'region', tabindex: '0',
      'aria-labelledby': idLegende, 'aria-label': idLegende ? null : 'Tableau',
    }, table);
    if (!large) return enveloppe;
    return [el('p', { class: 'table-hint' }, '<span aria-hidden="true">↔</span> Faites glisser le tableau pour voir toutes les colonnes.'), enveloppe];
  }

  /* ========================================================================
     4. Blocs spéciaux « ::: nom »
     ======================================================================== */
  function conteneur(b, ctx) {
    switch (b.nom) {
      case 'actions': return actions(b, 'section__actions');
      case 'cartes': return cartes(b);
      case 'quetes': return quetes(b);
      case 'chronologie': return chronologie(b);
      case 'infos': return infos(b, ctx.heros ? 'meta-list' : 'info-list');
      case 'badges': return badges(b);
      case 'legende': return legende(b);
      case 'etapes': return etapes(b);
      case 'capture': return capture(b);
      case 'encart': return encart(b);
      case 'navigation': return navigation(b);
      case 'competences': return competences(b);
      case 'sources': return sources(b);
      case 'succes': return succes(b);
      case 'stage': return stage(b);
      case 'competences-e5': return competencesE5(b);
      case 'tableau':
      case 'tableau-e5': {
        const t = b.enfants.find((x) => x.type === 'tableau');
        return t ? tableau(t, b.args) : null;
      }
      case 'plan': return plan(b);
      case 'colonnes': return colonnes(b, false);
      case 'note': return el('div', { class: 'todo-note' }, b.enfants.map((x) => bloc(x, { simple: true })));
      case 'fiche': return fiche(b);
      default: return el('div', { class: `bloc-${b.nom}` }, b.enfants.map((x) => bloc(x, ctx)));
    }
  }

  /** Boutons : le premier est le bouton d'action doré, les suivants sont secondaires. */
  function actions(b, classe) {
    const l = premiereListe(b);
    const div = el('div', { class: classe });
    (l ? l.elements : []).forEach((item, i) => {
      const lien = lienDepuis(item.texte);
      if (lien) div.appendChild(bouton(lien, i === 0));
    });
    return div;
  }

  /** Grille de cartes ; « ::: cartes numerotees » ajoute un numéro dans un losange. */
  function cartes(b) {
    const numerotees = /numerot/i.test(b.args);
    const ul = el('ul', { class: 'grid grid--3 reveal-group' });
    parTitres(b.enfants).filter((g) => g.titre).forEach((g, i) => {
      const t = g.titre;
      const lien = /^\[.+\]\(.+\)$/.test(t.texte) ? lienDepuis(t.texte) : null;
      const carte = el('div', { class: `card${lien ? ' card--link' : ''}${numerotees ? ' explore-card' : ''}` });
      if (numerotees) carte.appendChild(el('span', { class: 'explore-card__num', 'aria-hidden': 'true' }, CHIFFRES_ROMAINS[i] || String(i + 1)));
      if (t.surtitre) carte.appendChild(el('p', { class: 'card__kicker' }, ligne(t.surtitre)));
      const h = el(`h${t.niveau}`, { class: 'card__title' });
      if (lien) h.appendChild(el('a', { class: 'stretched-link', href: lien.href }, lien.html));
      else h.innerHTML = ligne(t.texte);
      carte.appendChild(h);
      const blocs = g.blocs.slice();
      const meta = extraireChamps(blocs, CLES_CARTE);
      if (meta.length) {
        carte.appendChild(el('p', { class: 'codex-entry__meta' }, meta.map((c) => el('span', null,
          c.cle === 'date' ? ligne(c.valeur) : `${MD.echapper(capitale(c.libelle))} : ${ligne(c.valeur)}`))));
      }
      blocs.forEach((x) => ajouter(carte, bloc(x, { classe: 'card__text' })));
      if (lien) carte.appendChild(el('span', { class: 'card__more', 'aria-hidden': 'true' }, ['Découvrir ', ICO.fleche]));
      ul.appendChild(el('li', { class: 'reveal' }, carte));
    });
    return ul;
  }

  /** Journal de quêtes : filtre + cartes projet (type, statut, fiche, contexte, technologies, récompenses). */
  function quetes(b) {
    const filtres = el('div', { class: 'filters', role: 'group', 'aria-label': 'Filtrer les projets' }, [
      el('button', { class: 'filter-btn', type: 'button', 'data-filter': 'all', 'aria-pressed': 'true' }, 'Tous les projets'),
      el('button', { class: 'filter-btn', type: 'button', 'data-filter': 'entreprise', 'aria-pressed': 'false' }, 'Quêtes principales <span class="filter-btn__hint">(entreprise)</span>'),
      el('button', { class: 'filter-btn', type: 'button', 'data-filter': 'academique', 'aria-pressed': 'false' }, 'Quêtes secondaires <span class="filter-btn__hint">(formation)</span>'),
    ]);
    const ul = el('ul', { class: 'quest-grid reveal-group' });
    parTitres(b.enfants).filter((g) => g.titre).forEach((g) => {
      const blocs = g.blocs.slice();
      const f = extraireChamps(blocs, CLES_QUETE);
      const type = MD.normaliserCle(valeurChamp(f, 'type') || 'principale');
      const statut = valeurChamp(f, 'statut');
      const fiche = valeurChamp(f, 'fiche', 'lien');
      const contexte = valeurChamp(f, 'contexte');
      const technologies = valeurChamp(f, 'technologies');
      const recompenses = valeurChamp(f, 'recompenses', 'competences');
      const href = fiche ? MD.resoudreAdresse(fiche, RACINE) : null;

      const article = el('article', { class: `card quest-card${href ? ' card--link' : ''}` });
      article.appendChild(el('div', { class: 'quest-card__badges' }, [badge(type), statut ? badge(statut) : null]));
      const h = el(`h${g.titre.niveau}`, { class: 'quest-card__title' });
      if (href) h.appendChild(el('a', { class: 'stretched-link', href }, ligne(g.titre.texte)));
      else h.innerHTML = ligne(g.titre.texte);
      article.appendChild(h);
      if (contexte) article.appendChild(el('p', { class: 'quest-card__meta' }, ligne(contexte)));
      blocs.forEach((x) => ajouter(article, bloc(x, { classe: 'quest-card__desc' })));
      if (technologies) article.appendChild(etiquettes(decouperListe(technologies)));
      if (recompenses) {
        article.appendChild(el('div', { class: 'rewards' }, [
          el('p', { class: 'rewards__label' }, 'Récompenses :'),
          listeRecompenses(decouperListe(recompenses)),
        ]));
      }
      if (href) article.appendChild(el('span', { class: 'card__more', 'aria-hidden': 'true' }, ['Voir la fiche ', ICO.fleche]));
      ul.appendChild(el('li', { class: 'reveal', 'data-type': type === 'secondaire' ? 'academique' : 'entreprise' }, article));
    });
    const n = ul.children.length;
    const compteur = el('p', { class: 'filters__count', role: 'status', 'data-filter-count': true },
      `${n} projet${n > 1 ? 's' : ''} affiché${n > 1 ? 's' : ''}`);
    return [filtres, compteur, ul];
  }

  /** Frise : « - date | titre | détail | statut » (statut : en cours, terminé, prévu…) */
  function chronologie(b) {
    const l = premiereListe(b);
    const ol = el('ol', { class: 'timeline' });
    (l ? l.elements : []).forEach((item) => {
      const [date = '', titre = '', detail = '', etat = ''] = item.texte.split(/\s+\|\s+/);
      const enCours = /en cours/i.test(etat);
      const termine = /termin/i.test(etat);
      ol.appendChild(el('li', { class: `timeline__item${enCours ? ' is-current' : ''}${termine ? ' is-done' : ''}` }, [
        el('p', { class: 'timeline__date' }, [ligne(date), etat.trim() ? badge(etat.trim()) : null]),
        el('h3', { class: 'timeline__title' }, ligne(titre)),
        detail ? el('p', { class: 'timeline__meta' }, ligne(detail)) : null,
      ]));
    });
    return ol;
  }

  function infos(b, classe) {
    const liste = [];
    b.enfants.forEach((x) => (champs(x) || []).forEach((c) => liste.push(c)));
    return listeDefinitions(liste, classe);
  }

  function badges(b) {
    const mots = b.enfants.filter((x) => x.type === 'paragraphe').map(texteDe).join(',');
    return el('div', { class: 'page-hero__badges' }, decouperListe(mots.replace(/\n/g, ',')).map(badge));
  }

  /** Légende : « - principale : projet réalisé en entreprise » */
  function legende(b) {
    const l = premiereListe(b);
    const ul = el('ul', { class: 'legend', 'aria-label': 'Légende' });
    (l ? l.elements : []).forEach((item) => {
      const m = /^(.+?)\s*:\s*(.*)$/.exec(item.texte);
      if (m) ul.appendChild(el('li', null, [badge(m[1]), ligne(m[2])]));
    });
    return ul;
  }

  /** Étapes numérotées : chaque « ### Titre » devient une étape. */
  function etapes(b) {
    const ol = el('ol', { class: 'steps' });
    parTitres(b.enfants).filter((g) => g.titre).forEach((g) => {
      ol.appendChild(el('li', null, [el(`h${g.titre.niveau}`, null, ligne(g.titre.texte)), g.blocs.map((x) => bloc(x, {}))]));
    });
    return ol;
  }

  /** Emplacement de capture d'écran : 1er paragraphe = texte, 2e = légende. */
  function capture(b) {
    const paras = b.enfants.filter((x) => x.type === 'paragraphe');
    return el('figure', null, [
      el('div', { class: 'shot-placeholder' }, paras[0] ? ligne(texteDe(paras[0])) : ''),
      paras[1] ? el('figcaption', null, ligne(texteDe(paras[1]))) : null,
    ]);
  }

  /** Encart (colonne latérale) : « ::: encart competences | technologies | ressources | coordonnees » */
  function encart(b) {
    const type = MD.normaliserCle((b.args.split(/\s+/)[0]) || '');
    const carte = el('div', { class: 'card' });
    parTitres(b.enfants).forEach((g) => {
      if (g.titre) {
        if (g.titre.surtitre) carte.appendChild(el('p', { class: 'card__kicker' }, ligne(g.titre.surtitre)));
        carte.appendChild(el(`h${g.titre.niveau}`, null, ligne(g.titre.texte)));
      }
      g.blocs.forEach((x) => {
        const elements = x.type === 'liste' ? x.elements.map((item) => item.texte) : null;
        const f = type === 'coordonnees' ? champs(x) : null;
        if (elements && type === 'competences') carte.appendChild(listeRecompenses(elements, true));
        else if (elements && type === 'technologies') carte.appendChild(etiquettes(elements));
        else if (elements && type === 'ressources') carte.appendChild(ressources(elements));
        else if (f) carte.appendChild(coordonnees(f));
        else ajouter(carte, bloc(x, { classe: 'card__text' }));
      });
    });
    return carte;
  }

  function ressources(elements) {
    const ul = el('ul', { class: 'resource-list' });
    elements.forEach((texte) => {
      const t = texte.toLowerCase();
      let icone = 'document';
      if (/github|gitlab|code|script|config/.test(t)) icone = 'code';
      else if (/vid[ée]o|d[ée]mo/.test(t)) icone = 'lecture';
      ul.appendChild(el('li', null, [ICO[icone], ligne(texte)]));
    });
    return ul;
  }

  function coordonnees(liste) {
    const ul = el('ul', { class: 'contact-list' });
    liste.forEach((c) => {
      const trouve = ICONES_COORDONNEES.find(([re]) => re.test(c.cle));
      ul.appendChild(el('li', null, [
        ICO[trouve ? trouve[1] : 'document'],
        el('div', null, [el('strong', null, MD.echapper(c.libelle)), ligne(c.valeur)]),
      ]));
    });
    return ul;
  }

  /** Navigation entre pages : 1er lien = retour (secondaire), dernier = suite (bouton doré). */
  function navigation(b) {
    const l = premiereListe(b);
    const liens = (l ? l.elements : []).map((item) => lienDepuis(item.texte)).filter(Boolean);
    const div = el('div', { class: 'container pager' });
    liens.forEach((lien, i) => {
      const suite = liens.length > 1 && i === liens.length - 1;
      const a = el('a', { class: `btn ${suite ? 'btn--primary' : 'btn--ghost'}`, href: lien.href });
      div.appendChild(ajouter(a, suite ? [lien.html, ICO.fleche] : [ICO.flecheRetour, lien.html]));
    });
    return el('nav', { class: 'section section--alt', 'aria-label': b.args || 'Navigation entre les pages' }, div);
  }

  /** Arbre de talents : « ### Branche I | Titre {icone=… option=…} » + « - Nom — détail : niveau » */
  function competences(b) {
    const option = optionCourante();
    const legendeNiveaux = el('ul', { class: 'xp-legend', 'aria-label': 'Échelle des niveaux' },
      NIVEAUX_XP.map((nom, i) => el('li', null, [jauge(i + 1, 4, true), nom])));
    const grille = el('div', { class: 'talent-grid reveal-group' });
    parTitres(b.enfants).filter((g) => g.titre).forEach((g) => {
      const attrs = g.titre.attributs;
      if (attrs.option && String(attrs.option).toUpperCase() !== option) return;
      const nomIcone = ICONES_BRANCHES[MD.normaliserCle(attrs.icone || '')] || 'losangePlein';
      const id = identifiant(g.titre.texte);
      const ul = el('ul', { class: 'skill-list' });
      g.blocs.filter((x) => x.type === 'liste').forEach((l) => l.elements.forEach((item) => {
        const skill = competence(item.texte, option);
        if (skill) ul.appendChild(skill);
      }));
      grille.appendChild(el('div', { class: 'reveal' }, el('section', { class: 'card branch', 'aria-labelledby': id }, [
        el('div', { class: 'branch__head' }, [
          el('span', { class: 'branch__icon', 'aria-hidden': 'true' }, ICO[nomIcone]),
          el('div', null, [
            g.titre.surtitre ? el('p', { class: 'card__kicker' }, ligne(g.titre.surtitre)) : null,
            el(`h${g.titre.niveau}`, { class: 'branch__title', id }, ligne(g.titre.texte)),
          ]),
        ]),
        ul,
      ])));
    });
    return [legendeNiveaux, grille];
  }

  function competence(texte, option) {
    let t = texte.trim();
    const filtre = /\s*\{option=(\w+)\}\s*$/i.exec(t);
    if (filtre) {
      if (filtre[1].toUpperCase() !== option) return null;
      t = t.slice(0, filtre.index);
    }
    const m = /^(.*?)\s*:\s*([1-4]|notions|interm[ée]diaire|avanc[ée]|ma[îi]trise)\s*$/i.exec(t);
    if (!m) return el('li', { class: 'skill' }, el('span', { class: 'skill__name' }, ligne(t)));
    let niveau = Number(m[2]);
    if (!niveau) niveau = { notions: 1, intermediaire: 2, avance: 3, maitrise: 4 }[MD.normaliserCle(m[2])] || 1;
    const [nom, ...detail] = m[1].split(/\s+—\s+/);
    return el('li', { class: 'skill' }, [
      el('span', { class: 'skill__name' }, [ligne(nom.trim()), detail.length ? el('span', { class: 'skill__detail' }, ligne(detail.join(' — '))) : null]),
      el('span', { class: 'skill__level' }, NIVEAUX_XP[niveau - 1]),
      jauge(niveau, 4, true),
    ]);
  }

  /** Sources : « - [Nom](adresse) — description » */
  function sources(b) {
    const l = premiereListe(b);
    const ul = el('ul', { class: 'source-list' });
    (l ? l.elements : []).forEach((item) => {
      const [lien, ...description] = item.texte.split(/\s+—\s+/);
      ul.appendChild(el('li', null, [ligne(lien), description.length ? el('span', null, ligne(description.join(' — '))) : null]));
    });
    return ul;
  }

  /** Succès : statut obtenue (débloqué, trophée) ou en cours / prévue (verrouillé, cadenas). */
  function succes(b) {
    const ul = el('ul', { class: 'achievements reveal-group' });
    parTitres(b.enfants).filter((g) => g.titre).forEach((g) => {
      const blocs = g.blocs.slice();
      const f = extraireChamps(blocs, CLES_SUCCES);
      const statut = MD.normaliserCle(valeurChamp(f, 'statut') || 'obtenue');
      const obtenue = /^obtenu/.test(statut);
      const libelle = obtenue ? 'Obtenue' : /cours/.test(statut) ? 'En cours' : 'Prévue';
      const date = valeurChamp(f, 'date');
      const type = valeurChamp(f, 'type');
      const preuve = valeurChamp(f, 'justificatif');
      const corps = el('div', null, [
        el('p', { class: 'achievement__status' }, [
          `<span class="sr-only">${obtenue ? 'Succès débloqué' : 'Verrouillé'} : </span>${libelle}`,
          date ? ` · ${ligne(date)}` : null,
        ]),
        el(`h${g.titre.niveau}`, { class: 'achievement__title' }, ligne(g.titre.texte)),
        type ? el('p', { class: 'achievement__meta' }, ligne(type)) : null,
      ]);
      blocs.forEach((x) => ajouter(corps, bloc(x, { classe: 'achievement__desc' })));
      if (preuve) corps.appendChild(el('p', { class: 'achievement__proof' }, ['Justificatif : ', ligne(preuve)]));
      ul.appendChild(el('li', { class: 'reveal' }, el('article', { class: `card achievement${obtenue ? '' : ' achievement--locked'}` }, [
        el('span', { class: 'achievement__icon', 'aria-hidden': 'true' }, obtenue ? ICO.trophee : ICO.cadenas),
        corps,
      ])));
    });
    return ul;
  }

  /** Fiche de stage : titre, champs (statut + infos), sous-parties « ### », lien final. */
  function stage(b) {
    const groupes = parTitres(b.enfants);
    const tete = groupes.shift();
    if (!tete || !tete.titre) return null;
    const id = identifiant(tete.titre.texte);
    const blocs = tete.blocs.slice();
    const f = extraireChamps(blocs);
    const statut = valeurChamp(f, 'statut');
    const meta = f.filter((c) => c.cle !== 'statut');
    const article = el('article', { class: 'card stage reveal', 'aria-labelledby': id }, [
      el('div', { class: 'stage__head' }, [
        el('div', null, [
          tete.titre.surtitre ? el('p', { class: 'card__kicker' }, ligne(tete.titre.surtitre)) : null,
          el(`h${tete.titre.niveau}`, { id }, ligne(tete.titre.texte)),
        ]),
        statut ? badge(statut) : null,
      ]),
      meta.length ? listeDefinitions(meta, 'meta-list') : null,
    ]);
    blocs.forEach((x) => ajouter(article, bloc(x, {})));
    const grille = el('div', { class: 'stage__grid' });
    let lienFinal = null;
    groupes.forEach((g) => {
      const sid = identifiant(g.titre.texte);
      const partie = el('section', { 'aria-labelledby': sid }, el(`h${g.titre.niveau}`, { id: sid }, ligne(g.titre.texte)));
      g.blocs.forEach((x) => {
        const lien = lienSeul(x);
        if (lien) {
          lienFinal = lien;
          return;
        }
        const c = champs(x);
        if (c && c.every((k) => k.cle === 'technologies')) c.forEach((k) => partie.appendChild(etiquettes(decouperListe(k.valeur))));
        else ajouter(partie, bloc(x, {}));
      });
      grille.appendChild(partie);
    });
    if (grille.childNodes.length) article.appendChild(grille);
    if (lienFinal) article.appendChild(el('a', { class: 'stage__link', href: lienFinal.href }, [lienFinal.html, ICO.fleche]));
    return article;
  }

  function competencesE5(b) {
    const l = premiereListe(b);
    return el('ol', { class: 'competence-list reveal', 'aria-label': 'Compétences du bloc 1' },
      (l ? l.elements : []).map((item) => el('li', null, ligne(item.texte))));
  }

  /** Plan du site : chaque « ## Titre » devient une carte avec ses liens. */
  function plan(b, alterne) {
    const grille = el('div', { class: 'container sitemap' });
    parTitres(b.enfants, 2).forEach((g) => {
      const carte = el('section', { class: 'card' });
      if (g.titre) {
        const id = identifiant(g.titre.texte);
        carte.setAttribute('aria-labelledby', id);
        carte.appendChild(el('h2', { id }, ligne(g.titre.texte)));
      }
      g.blocs.forEach((x) => ajouter(carte, bloc(x, { simple: true })));
      grille.appendChild(carte);
    });
    return el('section', { class: `section${alterne ? ' section--alt' : ''}` }, grille);
  }

  /** Deux colonnes : chaque « ## Surtitre | Titre » ouvre une colonne. */
  function colonnes(b, alterne) {
    const split = el('div', { class: 'container split' });
    parTitres(b.enfants, 2).forEach((g) => {
      const colonne = el('section', { class: 'reveal' });
      if (g.titre) {
        const t = titreComplet(g.titre);
        colonne.setAttribute('aria-labelledby', t.id);
        ajouter(colonne, t.elements);
      }
      g.blocs.forEach((x) => ajouter(colonne, bloc(x, { colonne: true })));
      split.appendChild(colonne);
    });
    return el('div', { class: `section${alterne ? ' section--alt' : ''}` }, split);
  }

  /** Fiche de personnage (accueil) : niveau, photo, attributs « - Nom : note sur 5 ». */
  function fiche(b) {
    const f = [];
    b.enfants.forEach((x) => (champs(x) || []).forEach((c) => f.push(c)));
    const l = premiereListe(b);
    const option = optionCourante();
    const niveau = valeurChamp(f, 'niveau') || '1';
    const photo = valeurChamp(f, 'photo');
    const nom = SITE.nom || '';

    const portrait = photo && !/^\[\[/.test(photo)
      ? el('div', { class: 'portrait' }, el('div', { class: 'portrait__frame' },
        el('img', { src: MD.resoudreAdresse(photo, RACINE), alt: `Photo de ${brut(nom)}`, width: '216', height: '216' })))
      : el('div', { class: 'portrait', 'aria-hidden': 'true' }, [
        el('div', { class: 'portrait__frame' }, ICO.silhouette),
        '<span class="portrait__hint"><span class="todo">Ta photo</span></span>',
      ]);

    const aside = el('aside', { class: 'card sheet', 'aria-labelledby': 'sheet-title' }, [
      el('p', { class: 'eyebrow sheet__label', id: 'sheet-title' }, 'Fiche de personnage'),
      el('div', { class: 'sheet__head' }, [
        portrait,
        el('div', null, [
          el('p', { class: 'sheet__name' }, ligne(nom)),
          el('dl', { class: 'sheet-stats' }, [
            el('div', null, [el('dt', null, 'Classe'), el('dd', null, [
              el('span', null, option),
              el('span', { class: 'sheet-stats__hint' }, MD.echapper(LIBELLES_OPTIONS[option])),
            ])]),
            el('div', null, [el('dt', null, 'Niveau'), el('dd', null, [
              'Niv. ', ligne(niveau),
              el('span', { class: 'sheet-stats__hint' }, 'année de BTS (1 ou 2)'),
            ])]),
          ]),
        ]),
      ]),
    ]);

    if (l) {
      aside.appendChild(el('div', { class: 'divider', 'aria-hidden': 'true' }));
      aside.appendChild(el('p', { class: 'sheet__subtitle' }, ['Attributs ', el('span', null, 'savoir-être')]));
      const ul = el('ul', { class: 'attributes' });
      l.elements.forEach((item) => {
        const m = /^(.*?)\s*:\s*(\d)\s*$/.exec(item.texte.trim());
        if (!m) return;
        const note = Math.max(0, Math.min(5, Number(m[2])));
        ul.appendChild(el('li', { class: 'attribute' }, [
          el('span', { class: 'attribute__name' }, ligne(m[1])),
          el('span', { class: 'attribute__value' }, `${note}<span aria-hidden="true">/</span><span class="sr-only"> sur </span>5`),
          jauge(note, 5),
        ]));
      });
      aside.appendChild(ul);
    }
    return aside;
  }

  /* ========================================================================
     5. En-têtes de page
     ======================================================================== */
  function filAriane(blocs, entete) {
    const h1 = blocs.find((b) => b.type === 'titre' && b.niveau === 1);
    const courant = entete['fil-ariane'] || (h1 ? h1.texte : '');
    return el('nav', { class: 'breadcrumb', 'aria-label': "Fil d'Ariane" }, el('ol', null, [
      el('li', null, el('a', { href: `${RACINE}index.html` }, 'Accueil')),
      entete.parent ? el('li', null, ligne(entete.parent)) : null,
      el('li', null, el('span', { 'aria-current': 'page' }, ligne(courant))),
    ]));
  }

  function herosPage(blocs, entete) {
    const contenu = el('div', { class: 'container' }, filAriane(blocs, entete));
    blocs.forEach((b) => {
      if (b.type === 'titre' && b.niveau === 1) {
        if (b.surtitre) contenu.appendChild(el('p', { class: 'eyebrow' }, ligne(b.surtitre)));
        contenu.appendChild(el('h1', null, ligne(b.texte)));
      } else if (b.type === 'paragraphe') {
        contenu.appendChild(el('p', { class: 'page-hero__intro' }, ligne(texteDe(b))));
      } else if (b.type === 'conteneur' && b.nom === 'infos') {
        contenu.appendChild(infos(b, 'meta-list'));
      } else {
        ajouter(contenu, bloc(b, { heros: true }));
      }
    });
    return el('header', { class: 'page-hero' }, [
      el('div', { class: 'page-hero__decor', 'aria-hidden': 'true' }, '<div class="topo"></div>'),
      contenu,
    ]);
  }

  function liensReseaux() {
    const ul = el('ul', { class: 'chip-links', 'aria-label': 'Me retrouver' });
    const lien = (adresse, icone, libelle) => {
      if (!adresse) return;
      const href = MD.resoudreAdresse(adresse, RACINE);
      const aCompleter = /\[\[/.test(adresse);
      ul.appendChild(el('li', null, el('a', { class: 'chip-link', href, rel: /^https?:/i.test(href) ? 'me' : null }, [
        ICO[icone], aCompleter ? `<span class="todo">${libelle}</span>` : libelle,
      ])));
    };
    lien(SITE.github, 'code', 'GitHub');
    lien(SITE.linkedin, 'personne', 'LinkedIn');
    lien('pages/contact.html', 'courriel', 'Me contacter');
    return ul;
  }

  function herosAccueil(blocs, entete) {
    const contenu = el('div', { class: 'hero__content' });
    const grille = el('div', { class: 'container hero__grid' }, contenu);
    if (entete.disponibilite) {
      contenu.appendChild(el('p', { class: 'status-pill' }, [
        '<span class="status-pill__dot" aria-hidden="true"></span>',
        el('span', null, ligne(entete.disponibilite)),
      ]));
    }
    let paragraphes = 0;
    blocs.forEach((b) => {
      if (b.type === 'titre' && b.niveau === 1) {
        if (b.surtitre) contenu.appendChild(el('p', { class: 'eyebrow' }, ligne(b.surtitre)));
        const h1 = el('h1', { class: 'hero__title', id: 'hero-title' }, ligne(b.texte));
        // *texte en italique* dans le titre = mis en valeur en or
        h1.querySelectorAll('em').forEach((em) => {
          const span = el('span', { class: 'hero__name' }, em.innerHTML);
          em.replaceWith(span);
        });
        contenu.appendChild(h1);
      } else if (b.type === 'paragraphe') {
        contenu.appendChild(el('p', { class: paragraphes++ === 0 ? 'lead' : null }, ligne(texteDe(b))));
      } else if (b.type === 'conteneur' && b.nom === 'actions') {
        contenu.appendChild(actions(b, 'hero__actions'));
      } else if (b.type === 'conteneur' && b.nom === 'fiche') {
        grille.appendChild(el('div', { class: 'hero__sheet reveal' }, fiche(b)));
      } else {
        ajouter(contenu, bloc(b, {}));
      }
    });
    contenu.appendChild(liensReseaux());
    return el('section', { class: 'hero', 'aria-labelledby': 'hero-title' }, [
      el('div', { class: 'hero__decor', 'aria-hidden': 'true' }, [
        '<div class="topo"></div>',
        ICO.roseDesVents,
        '<canvas class="hero__particles" data-particles></canvas>',
      ]),
      grille,
    ]);
  }

  /* ========================================================================
     6. Sections et mises en page
     ======================================================================== */
  const SECTIONNANTS = new Set(['colonnes', 'plan']);

  /** Sépare l'en-tête de page (avant le premier « ## ») des sections. */
  function decouper(blocs) {
    const heros = [];
    const sections = [];
    let courante = null;
    blocs.forEach((b) => {
      if (b.type === 'titre' && b.niveau === 2) {
        courante = { titre: b, blocs: [] };
        sections.push(courante);
      } else if (b.type === 'conteneur' && SECTIONNANTS.has(b.nom)) {
        courante = { titre: null, blocs: [b] };
        sections.push(courante);
      } else if (courante) {
        courante.blocs.push(b);
      } else {
        heros.push(b);
      }
    });
    return { heros, sections };
  }

  function sectionStandard(section, index, disposition) {
    const alterne = disposition === 'accueil' ? index % 2 === 0 : index % 2 === 1;
    const premier = section.blocs[0];
    if (!section.titre && premier && premier.type === 'conteneur' && SECTIONNANTS.has(premier.nom)) {
      const rendu = premier.nom === 'plan' ? plan(premier, alterne) : colonnes(premier, alterne);
      if (section.blocs.length === 1) return rendu;
      const suite = rendu.querySelector('.container');
      section.blocs.slice(1).forEach((b) => ajouter(suite, bloc(b, {})));
      return rendu;
    }

    const contenu = el('div', { class: 'container' });
    const sec = el('section', { class: `section${alterne ? ' section--alt' : ''}` }, contenu);
    const reste = section.blocs.slice();
    if (section.titre) {
      const t = section.titre;
      if (t.attributs.masque) {
        const id = identifiant(t.texte);
        sec.setAttribute('aria-labelledby', id);
        contenu.appendChild(el('h2', { class: 'sr-only', id }, ligne(t.texte)));
      } else {
        const titre = titreComplet(t);
        sec.setAttribute('aria-labelledby', titre.id);
        const entete = el('header', { class: `section__header${t.attributs.centre ? ' section__header--center' : ''} reveal` }, titre.elements);
        while (reste.length && reste[0].type === 'paragraphe' && !RE_IMAGE.test(reste[0].lignes.join(' ').trim())) {
          entete.appendChild(el('p', { class: 'section__intro' }, ligne(texteDe(reste.shift()))));
        }
        if (reste.length && reste[0].type === 'conteneur' && reste[0].nom === 'actions') {
          entete.appendChild(actions(reste.shift(), 'section__actions'));
        }
        contenu.appendChild(entete);
      }
    }
    reste.forEach((b) => ajouter(contenu, bloc(b, { disposition })));
    return sec;
  }

  /** Page projet : corps (sections) + colonne latérale (encarts) + navigation. */
  function sectionsFiche(sections, encarts, nav) {
    const corps = el('div', { class: 'quest-body' });
    sections.forEach((s) => {
      const partie = el('section', { class: 'quest-section reveal' });
      if (s.titre) {
        const t = titreComplet(s.titre);
        partie.setAttribute('aria-labelledby', t.id);
        ajouter(partie, t.elements);
      }
      s.blocs.forEach((b) => ajouter(partie, bloc(b, { disposition: 'fiche' })));
      if (partie.childNodes.length) corps.appendChild(partie);
    });
    const disposition = el('div', { class: 'container quest-layout' }, corps);
    if (encarts.length) disposition.appendChild(el('aside', { class: 'quest-aside', 'aria-label': 'Résumé du projet' }, encarts.map(encart)));
    return [el('div', { class: 'section' }, disposition), nav ? navigation(nav) : null];
  }

  /** Pages de texte (mentions légales, confidentialité) : une colonne de lecture. */
  function sectionTexte(sections) {
    const prose = el('div', { class: 'container prose' });
    sections.forEach((s) => {
      if (s.titre) prose.appendChild(el('h2', { id: identifiant(s.titre.texte) }, ligne(s.titre.texte)));
      s.blocs.forEach((b) => ajouter(prose, bloc(b, { disposition: 'texte' })));
    });
    return el('section', { class: 'section' }, prose);
  }

  /** Page contact : formulaire (resté dans le HTML) + encarts (coordonnées, données). */
  function sectionContact(encarts, formulaire) {
    const aside = el('aside', { class: 'contact-aside reveal', 'aria-label': 'Coordonnées' }, encarts.map(encart));
    return el('section', { class: 'section', 'aria-labelledby': 'formulaire-title' },
      el('div', { class: 'container contact-layout' }, [el('div', { class: 'reveal' }, formulaire || null), aside]));
  }

  function construirePage(main, page, formulaire) {
    const entete = page.entete;
    const disposition = MD.normaliserCle(entete['mise-en-page'] || 'standard');
    let blocs = page.blocs;
    const encarts = [];
    let nav = null;
    if (disposition === 'fiche' || disposition === 'contact') {
      blocs = blocs.filter((b) => {
        if (b.type === 'conteneur' && b.nom === 'encart') { encarts.push(b); return false; }
        if (b.type === 'conteneur' && b.nom === 'navigation') { nav = b; return false; }
        return true;
      });
    }
    const { heros, sections } = decouper(blocs);
    ajouter(main, disposition === 'accueil' ? herosAccueil(heros, entete) : herosPage(heros, entete));
    if (disposition === 'texte') ajouter(main, sectionTexte(sections));
    else if (disposition === 'fiche') ajouter(main, sectionsFiche(sections, encarts, nav));
    else if (disposition === 'contact') {
      ajouter(main, sectionContact(encarts, formulaire));
      sections.forEach((s, i) => ajouter(main, sectionStandard(s, i + 1, disposition)));
    } else sections.forEach((s, i) => ajouter(main, sectionStandard(s, i, disposition)));
    return disposition;
  }

  /* ========================================================================
     7. Gabarit commun et erreurs
     ======================================================================== */
  function remplirGabarit(site) {
    document.querySelectorAll('[data-site="nom"]').forEach((n) => { n.innerHTML = ligne(SITE.nom || 'Portfolio BTS SIO'); });
    const pied = document.querySelector('[data-site="pied"]');
    if (pied && site.blocs.length) {
      pied.textContent = '';
      site.blocs.forEach((b) => ajouter(pied, bloc(b, { simple: true })));
    }
  }

  function titreOnglet(page, disposition) {
    const nom = brut(SITE.nom || '');
    const h1 = page.blocs.find((b) => b.type === 'titre' && b.niveau === 1);
    if (disposition === 'accueil' || !h1) return `${nom} — Portfolio BTS SIO`;
    const titre = brut(page.entete['titre-onglet'] || page.entete['fil-ariane'] || h1.texte);
    return `${titre} — ${nom} · Portfolio BTS SIO`;
  }

  function etatErreur(chemin) {
    const local = location.protocol === 'file:';
    const message = local
      ? "Le site est ouvert directement depuis les fichiers : le navigateur bloque alors la lecture des fichiers Markdown. Lancez le serveur local (double-clic sur outils/serveur-local.bat) ou l'extension Live Server de VS Code, puis ouvrez http://localhost:8000."
      : `Le contenu de cette page n'a pas pu être chargé (fichier ${chemin}).`;
    return el('div', { class: 'container contenu-etat' }, el('div', { class: 'notice notice--error', role: 'alert' }, [
      el('strong', { class: 'notice__title' }, 'Contenu indisponible'),
      el('span', null, MD.echapper(message)),
    ]));
  }

  function remplacerVariables(texte, variables) {
    return texte.replace(/\{\{\s*([\w-]+)\s*\}\}/g, (tout, cle) => (Object.prototype.hasOwnProperty.call(variables, cle) ? variables[cle] : tout));
  }

  async function charger(chemin) {
    const reponse = await fetch(RACINE + chemin, { cache: 'no-cache' });
    if (!reponse.ok) throw new Error(`${chemin} : erreur ${reponse.status}`);
    return reponse.text();
  }

  /* ========================================================================
     8. Point d'entrée
     <body data-racine="../" data-contenu="contenu/projets.md">
     ======================================================================== */
  P.rendre = async function rendre() {
    const corps = document.body;
    const main = document.getElementById('contenu');
    if (!main || !corps.hasAttribute('data-contenu')) return;
    RACINE = corps.getAttribute('data-racine') || '';
    const chemin = corps.getAttribute('data-contenu');
    const formulaire = main.querySelector('[data-contact-form]');
    if (formulaire) formulaire.remove();
    idsUtilises.clear();
    try {
      const [texteSite, textePage] = await Promise.all([charger('contenu/site.md'), charger(chemin)]);
      const option = optionCourante();
      const variables = Object.assign({}, MD.analyser(texteSite).entete, { option, 'option-libelle': LIBELLES_OPTIONS[option] });
      const site = MD.analyser(remplacerVariables(texteSite, variables));
      SITE = site.entete;
      const page = MD.analyser(remplacerVariables(textePage, variables));
      main.textContent = '';
      const disposition = construirePage(main, page, formulaire);
      remplirGabarit(site);
      document.title = titreOnglet(page, disposition);
    } catch (erreur) {
      main.textContent = '';
      main.appendChild(etatErreur(chemin));
      if (formulaire) main.appendChild(el('div', { class: 'container contenu-etat' }, formulaire));
      if (window.console) console.error('[Portfolio]', erreur);
    } finally {
      main.removeAttribute('aria-busy');
    }
  };
}());
