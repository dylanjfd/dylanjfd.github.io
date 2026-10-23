/* ==========================================================================
   Portfolio BTS SIO — markdown.js
   Analyseur Markdown maison (aucune bibliothèque) : transforme le texte des
   fichiers contenu/*.md en une liste de blocs, que rendu.js met en page.
   --------------------------------------------------------------------------
   SOMMAIRE
    1. Outils (échappement, clés, adresses)
    2. Texte en ligne : **gras**, *italique*, `code`, [lien](adresse),
       ![image](adresse), [[texte à compléter]]
    3. Blocs : en-tête « --- », titres, paragraphes, listes, citations,
       tableaux, séparateurs, blocs spéciaux « ::: nom » … « ::: »
   La syntaxe complète est décrite dans contenu/GUIDE-MARKDOWN.md.
   ========================================================================== */
(function () {
  'use strict';
  const P = (window.Portfolio = window.Portfolio || {});

  /* ========================================================================
     1. Outils
     ======================================================================== */
  function echapper(texte) {
    return String(texte)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** Clé normalisée : minuscules, sans accents, espaces → tirets (« Récompenses » → « recompenses »). */
  function normaliserCle(cle) {
    return String(cle)
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[\s_]+/g, '-');
  }

  /**
   * Adresse d'un lien : les chemins du Markdown sont écrits depuis la racine du site
   * (ex. « pages/projets.html ») et sont convertis pour la page affichée.
   * Les protocoles dangereux (javascript:, data:…) sont refusés.
   */
  function resoudreAdresse(adresse, racine) {
    const url = String(adresse).replace(/\[\[|\]\]/g, '').trim();
    if (/^(https?:|mailto:|tel:)/i.test(url)) return url.replace(/ /g, '%20');
    if (/^[a-z][\w+.-]*:/i.test(url)) return '#';
    if (url.startsWith('#') || url.startsWith('/')) return url;
    return (racine || '') + url.replace(/ /g, '%20');
  }

  /** Lien vers un autre site : ouvert dans un nouvel onglet, ce qui est signalé (RGAA 13.2). */
  function estExterne(adresse) {
    if (!/^https?:/i.test(adresse)) return false;
    try {
      return new URL(adresse).host !== window.location.host;
    } catch (e) {
      return true;
    }
  }
  const SIGNAL_EXTERNE = '<span class="lien-externe" aria-hidden="true">↗</span><span class="sr-only"> (nouvel onglet)</span>';

  /* ========================================================================
     2. Texte en ligne
     Les morceaux déjà transformés sont mis de côté (« jetons ») pour ne pas
     être transformés deux fois, puis restitués à la fin.
     ======================================================================== */

  /** Repère un lien « [texte](adresse) » qui commence à la position i (crochets imbriqués acceptés). */
  function lireLien(s, i) {
    let profondeur = 0;
    let j = i;
    for (; j < s.length; j++) {
      if (s[j] === '\\') { j++; continue; }
      if (s[j] === '[') profondeur++;
      else if (s[j] === ']') {
        profondeur--;
        if (profondeur === 0) break;
      }
    }
    if (profondeur !== 0 || s[j + 1] !== '(') return null;
    let k = j + 2;
    let niveau = 1;
    for (; k < s.length; k++) {
      if (s[k] === '(') niveau++;
      else if (s[k] === ')') {
        niveau--;
        if (niveau === 0) break;
      }
    }
    if (niveau !== 0) return null;
    const cible = s.slice(j + 2, k).trim();
    const avecTitre = /^(.*?)\s+"([^"]*)"$/.exec(cible);
    return {
      fin: k,
      texte: s.slice(i + 1, j),
      adresse: avecTitre ? avecTitre[1] : cible,
      titre: avecTitre ? avecTitre[2] : '',
    };
  }

  function transformer(source, ctx) {
    const garder = (html) => `\u0000${ctx.jetons.push(html) - 1}\u0000`;
    let s = source;

    // Caractères protégés par une barre oblique inverse : \* \_ \[ …
    s = s.replace(/\\([\\`*_[\]{}()#+\-.!|>])/g, (_, c) => garder(echapper(c)));

    // `code`
    s = s.replace(/`([^`]+)`/g, (_, code) => garder(`<code>${echapper(code)}</code>`));

    // Images et liens
    let sortie = '';
    for (let i = 0; i < s.length; i++) {
      const image = s[i] === '!' && s[i + 1] === '[';
      if (s[i] === '[' || image) {
        const lien = lireLien(s, image ? i + 1 : i);
        if (lien) {
          const adresse = echapper(resoudreAdresse(lien.adresse, ctx.racine));
          if (image) {
            const alt = echapper(lien.texte.replace(/\[\[|\]\]|[*_`]/g, ''));
            sortie += garder(`<img src="${adresse}" alt="${alt}" loading="lazy">`);
          } else {
            const titre = lien.titre ? ` title="${echapper(lien.titre)}"` : '';
            const externe = estExterne(resoudreAdresse(lien.adresse, ctx.racine));
            const cible = externe ? ' target="_blank" rel="noopener noreferrer"' : '';
            sortie += garder(`<a href="${adresse}"${titre}${cible}>${transformer(lien.texte, ctx)}${externe ? SIGNAL_EXTERNE : ''}</a>`);
          }
          i = lien.fin;
          continue;
        }
      }
      sortie += s[i];
    }
    s = sortie;

    // [[texte à compléter]]
    s = s.replace(/\[\[([\s\S]+?)\]\]/g, (_, contenu) => garder(`<span class="todo">${transformer(contenu, ctx)}</span>`));

    // Reste du texte : échappement, emphase, sauts de ligne
    s = echapper(s);
    s = s.replace(/\*\*(?=\S)([\s\S]*?\S)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(^|[^*\w])\*(?=\S)([\s\S]*?\S)\*(?!\*)/g, '$1<em>$2</em>');
    s = s.replace(/(^|[^\w])_(?=\S)([\s\S]*?\S)_(?!\w)/g, '$1<em>$2</em>');
    s = s.replace(/(?: {2,}|\\)\n/g, '<br>').replace(/\n/g, ' ');
    return s;
  }

  /** Convertit une ligne de Markdown en HTML (texte échappé, adresses vérifiées). */
  function enLigne(texte, options) {
    const ctx = { racine: (options && options.racine) || '', jetons: [] };
    let html = transformer(String(texte == null ? '' : texte), ctx);
    let precedent;
    do {
      precedent = html;
      html = html.replace(/\u0000(\d+)\u0000/g, (_, n) => ctx.jetons[Number(n)]);
    } while (html !== precedent);
    return html;
  }

  /* ========================================================================
     3. Blocs
     ======================================================================== */
  const RE_TITRE = /^(#{1,6})\s+(.+?)\s*#*\s*$/;
  const RE_LISTE = /^(\s*)([-*+]|\d{1,3}[.)])\s+(.*)$/;
  const RE_CONTENEUR = /^:{3,}\s*(\S*)\s*(.*)$/;
  const RE_SEPARATEUR = /^(?:(?:\*\s*){3,}|(?:-\s*){3,}|(?:_\s*){3,})$/;
  const RE_TABLEAU_SEPARATEUR = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/;

  /** Options en fin de titre : {centre} {masque} {icone=serveur option=SISR} */
  function lireAttributs(texte) {
    const attributs = {};
    texte.split(/[\s,]+/).filter(Boolean).forEach((paire) => {
      const [cle, ...valeur] = paire.split('=');
      attributs[normaliserCle(cle)] = valeur.length ? valeur.join('=').replace(/^["']|["']$/g, '') : true;
    });
    return attributs;
  }

  /** « ## Surtitre | Titre {options} » */
  function lireTitre(niveau, brut) {
    let texte = brut;
    let attributs = {};
    const options = /\s*\{([^{}]*)\}\s*$/.exec(texte);
    if (options) {
      attributs = lireAttributs(options[1]);
      texte = texte.slice(0, options.index);
    }
    let surtitre = '';
    const separateur = texte.indexOf(' | ');
    if (separateur >= 0) {
      surtitre = texte.slice(0, separateur).trim();
      texte = texte.slice(separateur + 3);
    }
    return { type: 'titre', niveau, texte: texte.trim(), surtitre, attributs };
  }

  function cellules(ligne) {
    let s = ligne.trim();
    if (s.startsWith('|')) s = s.slice(1);
    if (s.endsWith('|') && !s.endsWith('\\|')) s = s.slice(0, -1);
    return s.split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, '|'));
  }

  /**
   * Analyse un fichier Markdown.
   * Renvoie { entete: { clé: valeur }, blocs: [ … ] } où chaque bloc a un « type » :
   * titre, paragraphe, liste, citation, tableau, separateur, conteneur (avec ses enfants).
   */
  function analyser(source) {
    let texte = String(source || '').replace(/^﻿/, '').replace(/\r\n?/g, '\n');
    texte = texte.replace(/<!--[\s\S]*?-->/g, '');
    const lignes = texte.split('\n');

    // En-tête de page entre deux lignes « --- »
    const entete = {};
    let i = 0;
    while (i < lignes.length && !lignes[i].trim()) i++;
    if (i < lignes.length && lignes[i].trim() === '---') {
      let j = i + 1;
      while (j < lignes.length && lignes[j].trim() !== '---') {
        const champ = /^\s*([^:]+?)\s*:\s?(.*)$/.exec(lignes[j]);
        if (champ) entete[normaliserCle(champ[1])] = champ[2].trim();
        j++;
      }
      i = j + 1;
    }

    const racine = { type: 'racine', enfants: [] };
    const pile = [racine];
    const parent = () => pile[pile.length - 1];
    let paragraphe = null;
    let liste = null;
    let citation = null;
    const fermer = () => {
      paragraphe = null;
      liste = null;
      citation = null;
    };

    for (; i < lignes.length; i++) {
      const ligne = lignes[i];
      const t = ligne.trim();

      // Bloc spécial « ::: nom options » … « ::: »
      const conteneur = RE_CONTENEUR.exec(t);
      if (conteneur) {
        fermer();
        if (!conteneur[1]) {
          if (pile.length > 1) pile.pop();
          continue;
        }
        const bloc = { type: 'conteneur', nom: normaliserCle(conteneur[1]), args: conteneur[2].trim(), enfants: [] };
        parent().enfants.push(bloc);
        pile.push(bloc);
        continue;
      }

      if (!t) {
        fermer();
        continue;
      }

      const titre = RE_TITRE.exec(t);
      if (titre) {
        fermer();
        parent().enfants.push(lireTitre(titre[1].length, titre[2]));
        continue;
      }

      if (RE_SEPARATEUR.test(t)) {
        fermer();
        parent().enfants.push({ type: 'separateur' });
        continue;
      }

      // Tableau : ligne d'en-têtes puis ligne « |---|:-:| »
      if (t.startsWith('|') && i + 1 < lignes.length && RE_TABLEAU_SEPARATEUR.test(lignes[i + 1])) {
        fermer();
        const entetes = cellules(t);
        const alignements = cellules(lignes[i + 1]).map((c) => {
          if (c.startsWith(':') && c.endsWith(':')) return 'centre';
          return c.endsWith(':') ? 'droite' : '';
        });
        const rangs = [];
        i += 2;
        while (i < lignes.length && lignes[i].trim().startsWith('|')) {
          rangs.push(cellules(lignes[i]));
          i++;
        }
        i--;
        parent().enfants.push({ type: 'tableau', entetes, alignements, rangs });
        continue;
      }

      // Citation « > … »
      if (t.startsWith('>')) {
        paragraphe = null;
        liste = null;
        if (!citation) {
          citation = { type: 'citation', lignes: [] };
          parent().enfants.push(citation);
        }
        citation.lignes.push(t.replace(/^>\s?/, ''));
        continue;
      }

      // Élément de liste (« - », « * », « 1. »), imbriqué selon le retrait
      const element = RE_LISTE.exec(ligne);
      if (element) {
        paragraphe = null;
        citation = null;
        const retrait = element[1].replace(/\t/g, '    ').length;
        const ordonnee = /\d/.test(element[2]);
        if (!liste) {
          const nouvelle = { type: 'liste', ordonnee, elements: [] };
          parent().enfants.push(nouvelle);
          liste = { niveaux: [{ retrait, liste: nouvelle }] };
        }
        const niveaux = liste.niveaux;
        while (niveaux.length > 1 && retrait < niveaux[niveaux.length - 1].retrait) niveaux.pop();
        let niveau = niveaux[niveaux.length - 1];
        if (retrait >= niveau.retrait + 2 && niveau.liste.elements.length) {
          const dernier = niveau.liste.elements[niveau.liste.elements.length - 1];
          const sousListe = { type: 'liste', ordonnee, elements: [] };
          dernier.enfants.push(sousListe);
          niveau = { retrait, liste: sousListe };
          niveaux.push(niveau);
        }
        niveau.liste.elements.push({ texte: element[3], enfants: [] });
        continue;
      }

      // Suite d'un élément de liste (ligne qui n'est pas un nouvel élément)
      if (liste) {
        const niveau = liste.niveaux[liste.niveaux.length - 1];
        const dernier = niveau.liste.elements[niveau.liste.elements.length - 1];
        dernier.texte += `\n${t}`;
        continue;
      }

      // Paragraphe (les lignes consécutives forment un seul paragraphe)
      citation = null;
      if (!paragraphe) {
        paragraphe = { type: 'paragraphe', lignes: [] };
        parent().enfants.push(paragraphe);
      }
      paragraphe.lignes.push(ligne.replace(/^\s+/, ''));
    }

    return { entete, blocs: racine.enfants };
  }

  P.markdown = { analyser, enLigne, echapper, normaliserCle, resoudreAdresse };
}());
