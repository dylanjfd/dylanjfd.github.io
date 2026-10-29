/* ==========================================================================
   Portfolio BTS SIO — outils/prerendu.mjs
   Pré-rendu des pages : le texte de chaque fichier contenu/*.md est écrit
   directement dans le <main> de sa page HTML. Les moteurs de recherche et
   les robots des IA, qui n'exécutent pas tous JavaScript, lisent ainsi tout
   le portfolio. Le rendu est fait par les scripts du site eux-mêmes
   (markdown.js, rendu.js), exécutés dans jsdom : même HTML, mêmes classes CSS
   que dans le navigateur. Dans le navigateur, rendu.js voit que la page est
   déjà construite (attribut data-prerendu) et ne la refait pas ; interface.js
   ajoute ensuite le thème, les animations et le reste, comme avant.

   Le script écrit aussi :
   - l'en-tête de chaque page : titre, description, canonical, aperçu de lien
     (og:, twitter:) et données structurées JSON-LD, d'après l'en-tête du .md
     (champs « titre-seo: », « description: », « indexer: non ») ;
   - sitemap.xml (dates <lastmod> comprises) et llms.txt.
   --------------------------------------------------------------------------
   Lancé à chaque push par .github/workflows/prerendu.yml.
   En local : npm install (une seule fois), puis npm run prerendu.
   --------------------------------------------------------------------------
   SOMMAIRE
    1. Réglages et outils (fichiers, git, dimensions des images)
    2. Rendu d'une page avec les scripts du site
    3. En-tête de la page : titre, description, aperçu de lien, JSON-LD
    4. Vérifications (titres h1 à h6, longueurs, JSON-LD)
    5. sitemap.xml et llms.txt
    6. Programme principal
   ========================================================================== */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { JSDOM, VirtualConsole } from 'jsdom';

/* ==========================================================================
   1. Réglages et outils
   ========================================================================== */
const DEPOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://dylanjoffredo.me/';
const SCRIPTS_RENDU = ['assets/js/icones.js', 'assets/js/markdown.js', 'assets/js/rendu.js'];
const SCRIPT_DEMARRAGE = 'assets/js/main.js'; // réglages CONFIG (option SISR / SLAM), puis Portfolio.rendre()
const IMAGE_APERCU = 'assets/img/apercu.png'; // aperçu des liens partagés (LinkedIn, Discord, WhatsApp, X…)
const LIMITES = { titre: 60, description: 155 }; // au-delà, Google coupe le texte
const PAGES_INFORMATIONS = ['pages/mentions-legales.html', 'pages/confidentialite.html', 'pages/plan-du-site.html'];

const lire = (chemin) => readFileSync(join(DEPOT, chemin), 'utf8').replace(/^﻿/, '');

/** Écrit un fichier seulement s'il change ; renvoie vrai s'il a été modifié. */
function ecrire(chemin, texte) {
  const fichier = join(DEPOT, chemin);
  const avant = existsSync(fichier) ? readFileSync(fichier, 'utf8').replace(/\r\n/g, '\n') : null;
  if (avant === texte) return false;
  writeFileSync(fichier, texte);
  return true;
}

const echapper = (texte) => String(texte)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** {{nom}}, {{option}}… comme dans rendu.js */
const remplacerVariables = (texte, variables) => texte.replace(/\{\{\s*([\w-]+)\s*\}\}/g,
  (tout, cle) => (Object.prototype.hasOwnProperty.call(variables, cle) ? variables[cle] : tout));

/** Valeur d'un champ, sauf s'il reste une case [[à compléter]]. */
const rempli = (valeur) => (valeur && !/\[\[/.test(valeur) ? valeur : undefined);

function listerPages() {
  const pages = ['index.html', '404.html'].filter((p) => existsSync(join(DEPOT, p)));
  const parcourir = (dossier) => readdirSync(join(DEPOT, dossier), { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((entree) => {
      const chemin = `${dossier}/${entree.name}`;
      if (entree.isDirectory()) parcourir(chemin);
      else if (entree.name.endsWith('.html')) pages.push(chemin);
    });
  parcourir('pages');
  return pages;
}

function git(...args) {
  try {
    return execFileSync('git', args, { cwd: DEPOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch (e) {
    return '';
  }
}

function aujourdhui() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Date de dernière modification (sitemap) : aujourd'hui si un fichier n'est pas encore commité, sinon date du dernier commit. */
function derniereModification(fichiers) {
  if (git('status', '--porcelain', '--', ...fichiers)) return aujourdhui();
  return git('log', '-1', '--format=%cs', '--', ...fichiers) || aujourdhui();
}

/** Largeur et hauteur d'une image PNG, JPEG, GIF ou WebP (lues dans l'en-tête du fichier). */
function dimensionsImage(fichier) {
  const b = readFileSync(fichier);
  if (b.length > 24 && b.readUInt32BE(0) === 0x89504e47) return { largeur: b.readUInt32BE(16), hauteur: b.readUInt32BE(20) };
  if (b.toString('ascii', 0, 3) === 'GIF') return { largeur: b.readUInt16LE(6), hauteur: b.readUInt16LE(8) };
  if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const format = b.toString('ascii', 12, 16);
    if (format === 'VP8X') return { largeur: 1 + b.readUIntLE(24, 3), hauteur: 1 + b.readUIntLE(27, 3) };
    if (format === 'VP8L') {
      const bits = b.readUInt32LE(21);
      return { largeur: 1 + (bits & 0x3fff), hauteur: 1 + ((bits >> 14) & 0x3fff) };
    }
    if (format === 'VP8 ') return { largeur: b.readUInt16LE(26) & 0x3fff, hauteur: b.readUInt16LE(28) & 0x3fff };
  }
  if (b[0] === 0xff && b[1] === 0xd8) {
    // JPEG : on saute de segment en segment jusqu'au marqueur SOF, qui contient les dimensions
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const marqueur = b[i + 1];
      if (marqueur >= 0xc0 && marqueur <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marqueur)) {
        return { hauteur: b.readUInt16BE(i + 5), largeur: b.readUInt16BE(i + 7) };
      }
      i += 2 + b.readUInt16BE(i + 2);
    }
  }
  return null;
}

/* ==========================================================================
   2. Rendu d'une page avec les scripts du site
   ========================================================================== */
async function rendrePage(chemin) {
  const url = new URL(chemin, SITE).href;
  const messages = [];
  const consoleVirtuelle = new VirtualConsole();
  consoleVirtuelle.on('warn', (...m) => messages.push(m.join(' ')));
  consoleVirtuelle.on('error', (...m) => messages.push(`Erreur : ${m.join(' ')}`));
  consoleVirtuelle.on('jsdomError', (e) => messages.push(`Erreur : ${e.message}`));
  const dom = new JSDOM(lire(chemin), { url, runScripts: 'dangerously', virtualConsole: consoleVirtuelle });
  const { window } = dom;
  const { document } = window;
  const contenu = document.body.getAttribute('data-contenu');
  const main = document.getElementById('contenu');
  if (!contenu || !main) {
    window.close();
    return null; // ex. pages/veille/veille-1.html : simple redirection vers reseau.html
  }
  main.removeAttribute('data-prerendu'); // sinon rendu.js garderait l'ancien texte

  // fetch() de rendu.js : les fichiers .md sont lus sur le disque
  window.fetch = async (adresse) => {
    const fichier = join(DEPOT, decodeURIComponent(new URL(adresse, window.location.href).pathname));
    const ok = existsSync(fichier);
    return { ok, status: ok ? 200 : 404, text: async () => (ok ? readFileSync(fichier, 'utf8') : '') };
  };
  const executer = (code) => {
    const script = document.createElement('script');
    script.textContent = code;
    document.head.appendChild(script);
    script.remove();
  };
  SCRIPTS_RENDU.forEach((script) => executer(lire(script)));
  // main.js démarre le site en appelant Portfolio.rendre() : on garde la promesse pour attendre la fin du rendu
  const P = window.Portfolio;
  const rendre = P.rendre;
  let rendu = Promise.resolve();
  P.rendre = () => (rendu = rendre());
  executer(lire(SCRIPT_DEMARRAGE));
  await rendu;
  P.rendre = rendre;
  if (main.querySelector('.notice--error')) throw new Error(main.textContent.replace(/\s+/g, ' ').trim());

  main.setAttribute('data-prerendu', '');
  // Images du Markdown : largeur et hauteur réelles, pour éviter les sauts de mise en page
  main.querySelectorAll('img:not([width])').forEach((img) => {
    const adresse = new URL(img.getAttribute('src'), url);
    if (adresse.origin !== new URL(SITE).origin) return;
    const fichier = join(DEPOT, decodeURIComponent(adresse.pathname));
    const taille = existsSync(fichier) ? dimensionsImage(fichier) : null;
    if (!taille) {
      messages.push(`Image introuvable ou de format inconnu : ${img.getAttribute('src')}`);
      return;
    }
    img.setAttribute('width', String(taille.largeur));
    img.setAttribute('height', String(taille.hauteur));
  });

  // Commentaire juste avant <main> : d'où vient le texte de la page
  const note = ` Texte de cette page : ${contenu}. outils/prerendu.mjs l'écrit dans <main> à chaque push : modifier le .md, pas le HTML. `;
  let avant = main.previousSibling;
  while (avant && avant.nodeType === 3 && !avant.textContent.trim()) avant = avant.previousSibling;
  if (avant && avant.nodeType === 8) avant.data = note;
  else main.before(document.createComment(note), '\n  ');

  return { chemin, url, contenu, dom, window, document, main, messages };
}

/* ==========================================================================
   3. En-tête de la page : titre, description, aperçu de lien, JSON-LD
   ========================================================================== */
function lireEntetes(page) {
  const MD = page.window.Portfolio.markdown;
  const texteSite = lire('contenu/site.md');
  const option = String(page.window.eval('typeof CONFIG === "object" && CONFIG.OPTION || "SISR"')).toUpperCase();
  const variables = Object.assign({}, MD.analyser(texteSite).entete, { option });
  return {
    site: MD.analyser(remplacerVariables(texteSite, variables)).entete,
    page: MD.analyser(remplacerVariables(lire(page.contenu), variables)).entete,
    normaliser: MD.normaliserCle,
  };
}

/** Fil d'Ariane affiché sur la page → BreadcrumbList (schema.org). */
function filAriane(page) {
  const elements = [...page.document.querySelectorAll('.breadcrumb li')].map((li, i) => {
    const lien = li.querySelector('a[href]');
    const adresse = lien ? new URL(lien.getAttribute('href'), page.url).href : page.canonical;
    return { '@type': 'ListItem', position: i + 1, name: li.textContent.replace(/\s+/g, ' ').trim(), item: adresse.replace(/index\.html$/, '') };
  });
  return elements.length > 1 ? { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: elements } : null;
}

/** Accueil : la personne (sans téléphone, e-mail ni adresse précise) et le site. */
function personneEtSite(site, nomDuSite, description) {
  const personne = {
    '@type': 'Person',
    '@id': `${SITE}#personne`,
    name: site.nom,
    jobTitle: rempli(site.poste),
    description: rempli(site.presentation),
    url: SITE,
    image: rempli(site.photo) ? new URL(site.photo, SITE).href : undefined,
    address: rempli(site.ville) ? { '@type': 'PostalAddress', addressLocality: site.ville, addressCountry: 'FR' } : undefined,
    worksFor: rempli(site.employeur) ? { '@type': 'Organization', name: site.employeur } : undefined,
    affiliation: rempli(site.ecole) ? { '@type': 'EducationalOrganization', name: site.ecole } : undefined,
    sameAs: [site.linkedin, site.github].filter(rempli),
  };
  const siteWeb = {
    '@type': 'WebSite',
    '@id': `${SITE}#site`,
    url: SITE,
    name: nomDuSite,
    description,
    inLanguage: 'fr-FR',
    author: { '@id': `${SITE}#personne` },
  };
  return { '@context': 'https://schema.org', '@graph': [personne, siteWeb] };
}

function ecrireEntete(page) {
  const { document } = page;
  const { site, page: entete, normaliser } = lireEntetes(page);
  const est404 = page.chemin === '404.html';
  const nomDuSite = `${site.nom} · Portfolio BTS SIO`;
  page.titre = entete['titre-seo'] || document.title;
  page.description = entete.description || (document.querySelector('meta[name="description"]') || { content: '' }).content;
  page.noindex = est404 || normaliser(entete.indexer || 'oui') === 'non';
  page.canonical = est404 ? null : new URL(page.chemin === 'index.html' ? '' : page.chemin, SITE).href;

  // Les balises gérées ici sont retirées puis réécrites, toujours dans le même ordre
  const head = document.head;
  const retirer = (n) => {
    const avant = n.previousSibling;
    if (avant && avant.nodeType === 3 && !avant.textContent.trim()) avant.remove();
    n.remove();
  };
  head.querySelectorAll('meta[name="description"], meta[name="robots"], link[rel="canonical"], meta[property^="og:"], meta[name^="twitter:"], script[type="application/ld+json"]').forEach(retirer);
  [...head.childNodes].filter((n) => n.nodeType === 8 && /Aperçu affiché|prerendu\.mjs|schema\.org/.test(n.data)).forEach(retirer);

  const lignes = [`<!-- Titre, description, aperçu de lien et données structurées : écrits par outils/prerendu.mjs d'après l'en-tête de ${page.contenu} -->`];
  const meta = (attribut, cle, valeur) => lignes.push(`<meta ${attribut}="${cle}" content="${echapper(valeur)}">`);
  meta('name', 'description', page.description);
  if (page.noindex) meta('name', 'robots', 'noindex');
  if (page.canonical) lignes.push(`<link rel="canonical" href="${page.canonical}">`);

  if (!est404) {
    const image = new URL(IMAGE_APERCU, SITE).href;
    const taille = dimensionsImage(join(DEPOT, IMAGE_APERCU));
    const texteImage = [site.nom, rempli(site.poste) && site.poste.toLowerCase(), 'portfolio BTS SIO'].filter(Boolean).join(', ');
    lignes.push("<!-- Aperçu affiché quand le lien est partagé (LinkedIn, Discord, WhatsApp, X…) -->");
    meta('property', 'og:type', 'website');
    meta('property', 'og:locale', 'fr_FR');
    meta('property', 'og:site_name', nomDuSite);
    meta('property', 'og:title', page.titre);
    meta('property', 'og:description', page.description);
    meta('property', 'og:url', page.canonical);
    meta('property', 'og:image', image);
    if (taille) {
      meta('property', 'og:image:width', String(taille.largeur));
      meta('property', 'og:image:height', String(taille.hauteur));
    }
    meta('property', 'og:image:alt', texteImage);
    meta('name', 'twitter:card', 'summary_large_image');
    meta('name', 'twitter:title', page.titre);
    meta('name', 'twitter:description', page.description);
    meta('name', 'twitter:image', image);
    meta('name', 'twitter:image:alt', texteImage);

    const donnees = page.chemin === 'index.html' ? personneEtSite(site, nomDuSite, page.description) : filAriane(page);
    if (donnees) {
      const json = JSON.stringify(donnees, null, 2).replace(/</g, '\\u003c');
      lignes.push('<!-- Données structurées (schema.org) : qui je suis, fil d\'Ariane -->');
      lignes.push(`<script type="application/ld+json">\n${json.replace(/^/gm, '  ')}\n  </script>`);
    }
  }

  const titre = document.querySelector('title') || head.insertBefore(document.createElement('title'), head.firstChild);
  titre.textContent = page.titre;
  const modele = document.createElement('template');
  modele.innerHTML = lignes.map((l) => `\n  ${l}`).join('');
  titre.after(modele.content);
}

/* ==========================================================================
   4. Vérifications (affichées dans le journal, sans bloquer)
   ========================================================================== */
function verifier(page) {
  const { document } = page;
  const alertes = [...page.messages];
  const h1 = document.querySelectorAll('h1').length;
  if (h1 !== 1) alertes.push(`${h1} titres <h1> au lieu d'un seul`);
  let precedent = 0;
  document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
    const niveau = Number(h.tagName[1]);
    if (precedent && niveau > precedent + 1) alertes.push(`<h${niveau}> « ${h.textContent.trim()} » juste après un <h${precedent}>`);
    precedent = niveau;
  });
  if (page.titre.length > LIMITES.titre) alertes.push(`titre trop long (${page.titre.length} caractères, ${LIMITES.titre} maximum)`);
  if (!page.description) alertes.push('description manquante');
  else if (page.description.length > LIMITES.description) alertes.push(`description trop longue (${page.description.length} caractères, ${LIMITES.description} maximum)`);
  document.querySelectorAll('script[type="application/ld+json"]').forEach((s) => {
    try {
      JSON.parse(s.textContent);
    } catch (e) {
      throw new Error(`JSON-LD invalide : ${e.message}`);
    }
  });
  return alertes;
}

/* ==========================================================================
   5. sitemap.xml et llms.txt
   ========================================================================== */
/**
 * Pages à indexer, dans l'ordre de sitemap.xml (une nouvelle page s'ajoute à la fin),
 * avec la priorité déjà choisie pour chacune.
 */
function pagesIndexees(pages) {
  const ancien = existsSync(join(DEPOT, 'sitemap.xml')) ? lire('sitemap.xml') : '';
  const priorites = new Map([...ancien.matchAll(/<loc>([^<]+)<\/loc>(?:<lastmod>[^<]*<\/lastmod>)?(?:<priority>([^<]+)<\/priority>)?/g)]
    .map((m) => [m[1], m[2] || '0.5']));
  const ordre = [...priorites.keys()];
  const rang = (p) => (ordre.includes(p.canonical) ? ordre.indexOf(p.canonical) : ordre.length);
  return pages.filter((p) => p.canonical && !p.noindex)
    .sort((a, b) => rang(a) - rang(b))
    .map((p) => Object.assign(p, { priorite: priorites.get(p.canonical) || '0.5' }));
}

function ecrireSitemap(indexees) {
  const lignes = indexees
    .map((p) => `  <url><loc>${p.canonical}</loc><lastmod>${p.lastmod}</lastmod><priority>${p.priorite}</priority></url>`);
  return ecrire('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<!--
  Plan du site XML (référencement) : écrit par outils/prerendu.mjs à chaque push.
  Les dates <lastmod> sont celles de la dernière modification de chaque page et de son .md.
  Une page avec « indexer: non » dans l'en-tête de son .md n'y figure pas.
-->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${lignes.join('\n')}
</urlset>
`);
}

/** llms.txt : présentation courte et liens vers les pages, pour les assistants IA (https://llmstxt.org/). */
function ecrireLlms(visibles, site) {
  const nom = (p) => (p.chemin === 'index.html' ? 'Accueil' : p.main.querySelector('h1').textContent.replace(/\s+/g, ' ').trim());
  const lien = (p) => `- [${nom(p)}](${p.canonical}): ${p.description}`;
  const groupes = [
    ['Pages principales', (p) => !/^pages\/(projets|veille)\//.test(p.chemin) && !PAGES_INFORMATIONS.includes(p.chemin)],
    ['Projets détaillés', (p) => p.chemin.startsWith('pages/projets/')],
    ['Veilles technologiques', (p) => p.chemin.startsWith('pages/veille/')],
    ['Informations', (p) => PAGES_INFORMATIONS.includes(p.chemin)],
  ];
  const sections = groupes.map(([titre, filtre]) => [titre, visibles.filter(filtre)]).filter(([, liste]) => liste.length)
    .map(([titre, liste]) => `## ${titre}\n\n${liste.map(lien).join('\n')}`);
  const reseaux = [['LinkedIn', site.linkedin], ['GitHub', site.github]].filter(([, adresse]) => rempli(adresse))
    .map(([libelle, adresse]) => `- [${libelle}](${adresse})`);
  reseaux.unshift(`- [CV (PDF)](${new URL('assets/docs/cv.pdf', SITE).href})`);
  return ecrire('llms.txt', `# ${site.nom} — Portfolio BTS SIO

> ${rempli(site.presentation) || ''}

Portfolio de l'épreuve E5 du BTS SIO : projets, compétences, veille technologique, alternance et certifications.

${sections.join('\n\n')}

## Me retrouver

${reseaux.join('\n')}
`);
}

/* ==========================================================================
   6. Programme principal
   ========================================================================== */
/**
 * HTML écrit comme dans les pages d'origine : attributs sans valeur (defer, crossorigin),
 * éléments SVG vides fermés par « /> ». Seules les balises sont touchées : dans le texte,
 * « < » est toujours échappé en « &lt; ».
 */
function nettoyer(html) {
  return html
    .replace(/^<!DOCTYPE html>/i, '<!doctype html>\n')
    .replace(/(<html[^>]*>)(<!--[\s\S]*?-->)?<head>/, (tout, balise, commentaire) => `${balise}\n${commentaire ? `${commentaire}\n` : ''}<head>`)
    .replace(/<[a-zA-Z][^<>]*>/g, (balise) => balise.replace(/ ([\w:-]+)=""/g, ' $1'))
    .replace(/<(path|circle|ellipse|line|polyline|polygon|rect|stop|use)\b([^<>]*)><\/\1>/g, '<$1$2/>')
    .replace(/\s*<\/body>\s*<\/html>\s*$/, '\n</body>\n</html>\n');
}

const pages = [];
let erreurs = 0;
for (const chemin of listerPages()) {
  try {
    const page = await rendrePage(chemin);
    if (!page) continue;
    ecrireEntete(page);
    page.modifie = ecrire(chemin, nettoyer(page.dom.serialize()));
    page.alertes = verifier(page);
    pages.push(page);
  } catch (e) {
    erreurs++;
    console.error(`✗ ${chemin} : ${e.message}`);
  }
}

pages.forEach((p) => { p.lastmod = derniereModification([p.chemin, p.contenu]); });
const site = pages.length ? lireEntetes(pages[0]).site : {};
const indexees = pagesIndexees(pages);
const sitemapModifie = indexees.length ? ecrireSitemap(indexees) : false;
const llmsModifie = indexees.length ? ecrireLlms(indexees, site) : false;

console.log(`Pré-rendu : ${pages.length} pages${erreurs ? `, ${erreurs} en erreur` : ''}`);
pages.forEach((p) => {
  const mots = p.main.textContent.split(/\s+/).filter(Boolean).length;
  const cases = p.main.querySelectorAll('.todo').length;
  const details = [`${mots} mots`, `titre ${p.titre.length}/${LIMITES.titre}`, `description ${p.description.length}/${LIMITES.description}`];
  if (cases) details.push(`${cases} case(s) à compléter`);
  if (p.noindex) details.push('noindex');
  console.log(`${p.alertes.length ? '!' : '✓'} ${p.chemin}${p.modifie ? ' (mis à jour)' : ''} — ${details.join(', ')}`);
  p.alertes.forEach((a) => console.log(`    ${a}`));
  p.window.close();
});
console.log(`sitemap.xml${sitemapModifie ? ' (mis à jour)' : ''}, llms.txt${llmsModifie ? ' (mis à jour)' : ''}`);
if (erreurs) process.exitCode = 1;
