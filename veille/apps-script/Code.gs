/**
 * Veille technologique : réseau (souveraineté numérique des PME), système et cybersécurité.
 * Google Apps Script — remplace GitHub Actions (veille.yml) pour la collecte et l'e-mail du lundi.
 * C'est la configuration de référence : veille/config.json en est une copie.
 *
 *  - Chaque jour : pour chaque veille, lit ses flux RSS et met de côté les articles des 7 derniers jours
 *    qui contiennent au moins un mot-clé de chacun de ses groupes (titre ou résumé, sans tenir compte des
 *    majuscules ni des accents, mots entiers, pluriels compris).
 *  - Chaque lundi vers 7 h 45 : envoie un seul e-mail
 *    « [Veille] Semaine du JJ/MM/AAAA — Réseau N, Système N, Cybersécurité N », une section par veille,
 *    articles du plus récent au plus ancien, numérotés avec la lettre de la veille : #R1…, #S1…, #C1…
 *    Un lien envoyé n'est jamais renvoyé, quelle que soit la veille, et un article n'apparaît que dans
 *    une section (la première veille qui le retient).
 *  - Tu réponds à l'e-mail avec le numéro suivi de ton avis (ex. « #C2 je pense que… »),
 *    puis ta synthèse de la semaine sur une ligne qui commence par #SEMAINE.
 *  - Le premier lundi du mois, l'e-mail rappelle de demander à Claude les synthèses du mois précédent,
 *    construites en regroupant les synthèses de la semaine (#SEMAINE) de ce mois.
 *
 * Mise en place : coller ce fichier dans le projet Apps Script, exécuter `testerFlux`, puis `apercu`
 * (e-mail affiché dans le journal sans l'envoyer), puis une fois `installer`.
 * Aucun mot de passe : l'e-mail part de ton compte Google.
 */

const CONFIG = {
  DESTINATAIRE: '',        // vide = ton adresse Google
  JOURS: 7,
  FUSEAU: 'Europe/Paris',

  // Une entrée par veille, dans l'ordre des sections de l'e-mail. actif: false = veille non collectée.
  // groupesMotsCles : l'article doit contenir au moins un mot de CHAQUE groupe.
  // Alertes Google (google.fr/alerts → « Envoyer à : Flux RSS ») : ajouter { nom, url, langue } à googleAlerts.
  VEILLES: [
    {
      nom: 'Souveraineté numérique des PME', categorie: 'Réseau', prefixe: 'R', articlesMax: 8, actif: true,
      flux: [
        { nom: 'CERT-FR (ANSSI)',                url: 'https://www.cert.ssi.gouv.fr/feed/', langue: 'FR' },
        { nom: 'CNIL',                           url: 'https://www.cnil.fr/fr/rss.xml', langue: 'FR' },
        { nom: 'Next',                           url: 'https://next.ink/feed/', langue: 'FR' },
        { nom: 'LeMagIT',                        url: 'https://www.lemagit.fr/rss/ContentSyndication.xml', langue: 'FR' },
        { nom: 'Le Monde Informatique',          url: 'https://www.lemondeinformatique.fr/flux-rss/thematique/toutes-les-actualites/rss.xml', langue: 'FR' },
      ],
      googleAlerts: [],
      groupesMotsCles: [[
        'souveraineté numérique', 'cloud souverain', 'SecNumCloud', 'Cloud Act',
        'hébergement', 'hébergeur', 'RGPD', 'données personnelles', 'PME',
        'cloud de confiance', 'OVHcloud', 'Scaleway',
      ]],
    },
    {
      nom: 'Gérer un parc de PC en libre-service', categorie: 'Système', prefixe: 'S', articlesMax: 6, actif: true,
      flux: [
        { nom: 'IT-Connect',                     url: 'https://www.it-connect.fr/feed/', langue: 'FR' },
        { nom: 'LeMagIT',                        url: 'https://www.lemagit.fr/rss/ContentSyndication.xml', langue: 'FR' },
        { nom: 'The Register',                   url: 'https://www.theregister.com/headlines.atom', langue: 'EN' },
        { nom: 'Windows IT Pro Blog (Microsoft)', url: 'https://techcommunity.microsoft.com/t5/s/gxcuf89792/rss/board?board.id=Windows-ITPro-blog', langue: 'EN' },
        { nom: 'BleepingComputer',               url: 'https://www.bleepingcomputer.com/feed/', langue: 'EN' },
      ],
      googleAlerts: [],
      groupesMotsCles: [[
        'déploiement d\'images', 'image deployment', 'PXE', 'FOG Project', 'Clonezilla',
        'Unified Write Filter', 'UWF', 'Deep Freeze', 'Reboot Restore', 'diskless', 'MDT',
        'Microsoft Deployment Toolkit', 'Autopilot', 'Configuration Manager', 'Sysprep',
        'gestion de parc', 'kiosk mode', 'LAN center', 'cybercafé',
      ]],
    },
    {
      nom: 'Pourquoi les joueurs sont-ils l\'une des cibles favorites des cybercriminels ?',
      categorie: 'Cybersécurité', prefixe: 'C', articlesMax: 6, actif: true,
      flux: [
        { nom: 'CERT-FR (ANSSI)',                url: 'https://www.cert.ssi.gouv.fr/feed/', langue: 'FR' },
        { nom: 'Cybermalveillance.gouv.fr',      url: 'https://www.cybermalveillance.gouv.fr/feed/atom-flux-actualites', langue: 'FR' },
        { nom: 'BleepingComputer',               url: 'https://www.bleepingcomputer.com/feed/', langue: 'EN' },
        { nom: 'ESET WeLiveSecurity',            url: 'https://www.welivesecurity.com/fr/rss/feed/', langue: 'FR' },
        { nom: 'Malwarebytes Labs',              url: 'https://www.malwarebytes.com/blog/feed/index.xml', langue: 'EN' },
        { nom: 'ZATAZ',                          url: 'https://www.zataz.com/feed/', langue: 'FR' },
        { nom: 'Numerama (Cyberguerre)',         url: 'https://www.numerama.com/cyberguerre/feed/', langue: 'FR' },
      ],
      googleAlerts: [],
      groupesMotsCles: [
        [ // menace
          'infostealer', 'voleur de données', 'stealer', 'malware', 'logiciel malveillant', 'Lumma', 'StealC',
          'phishing', 'hameçonnage', 'vol de compte', 'account takeover', 'cookie', 'session hijacking',
        ],
        [ // jeu
          'joueur', 'gamer', 'gaming', 'jeu vidéo', 'video game', 'cheat', 'mod', 'crack', 'Steam', 'Discord',
          'Roblox', 'Fortnite', 'Minecraft', 'Valorant', 'Counter-Strike', 'CS2', 'GTA', 'skin', 'anti-cheat',
        ],
      ],
    },
  ],
};

// Avant les trois veilles, l'e-mail « [Veille souveraineté] » ne portait que la veille souveraineté
// numérique, devenue la veille réseau : les articles mis de côté à cette époque n'ont pas de lettre
// et vont dans la section « R ». Les liens déjà envoyés (propriétés « S: ») restent valables pour toutes les veilles.
const PREFIXE_ANCIEN = 'R';

// Propriétés du script : 500 Ko au plus en tout. « A: » = article mis de côté (7 jours au plus,
// MAX_EN_ATTENTE par veille), « S: » = lien déjà envoyé (gardé un an, environ 30 octets).
const MAX_EN_ATTENTE = 30;
const LONGUEUR_RESUME = 250;
const JOURS_MEMOIRE = 365;
const LIMITE_PROPRIETES = 500 * 1024;

const PROPS = PropertiesService.getScriptProperties();
const JOUR_MS = 86400000;

/* ============================ Tâches planifiées ============================ */

/** Tous les jours : met de côté les nouveaux articles (certains flux ne gardent que ~5 jours). */
function collecter() {
  const limite = Date.now() - CONFIG.JOURS * JOUR_MS;
  const tampon = lireTampon_();
  const lus = {};                                            // un flux suivi par plusieurs veilles n'est lu qu'une fois
  let ajoutes = 0;

  veillesActives_().forEach(veille => {
    const motifs = veille.groupesMotsCles.map(motifMotsCles_);
    sources_(veille).forEach(source => {
      if (!lus[source.url]) lus[source.url] = lireFlux_(source);
      lus[source.url].forEach(a => {
        if (!a.date || a.date.getTime() < limite) return;
        const texte = normaliser_(a.titre + ' ' + a.resume);
        if (!motifs.every(m => m.test(texte))) return;
        const cle = cle_(a.lien);
        // Déjà mis de côté (pour cette veille ou une précédente) ou déjà envoyé : un article, une section, un envoi
        if (tampon[cle] || PROPS.getProperty('S:' + cle)) return;
        tampon[cle] = { t: a.titre, l: a.lien, r: a.resume.slice(0, LONGUEUR_RESUME), s: source.nom,
                        g: source.langue || '', d: a.date.getTime(), v: veille.prefixe };
        ajoutes++;
      });
    });
  });

  // Retire ce qui a plus de 7 jours, puis garde au plus MAX_EN_ATTENTE articles (les plus récents) par veille
  Object.keys(tampon).forEach(k => { if (tampon[k].d < limite) delete tampon[k]; });
  const parVeille = {};
  Object.keys(tampon).sort((a, b) => tampon[b].d - tampon[a].d).forEach(k => {
    const v = tampon[k].v || PREFIXE_ANCIEN;
    parVeille[v] = (parVeille[v] || 0) + 1;
    if (parVeille[v] > MAX_EN_ATTENTE) delete tampon[k];
  });
  ecrireTampon_(tampon);
  console.log(`Collecte : ${ajoutes} nouvel(s) article(s), ${Object.keys(tampon).length} en attente. ${tailleProprietes_()}`);
}

/** Chaque lundi : envoie l'e-mail de la semaine. */
function envoyerLundi() {
  envoyer_(false);
}

/** Affiche l'e-mail dans le journal sans l'envoyer ni rien enregistrer. */
function apercu() {
  envoyer_(true);
}

/** Teste chaque flux (une fois, même s'il sert à plusieurs veilles) et affiche OK ou l'erreur dans le journal. */
function testerFlux() {
  const flux = {};
  CONFIG.VEILLES.forEach(veille => sources_(veille).forEach(source => {
    flux[source.url] = flux[source.url] || { source: source, veilles: [] };
    flux[source.url].veilles.push(veille.prefixe);
  }));
  let erreurs = 0;
  Object.keys(flux).forEach(url => {
    const f = flux[url];
    try {
      const articles = lireFluxBrut_(f.source);
      if (!articles.length) throw new Error('aucun article lisible');
      const recent = Math.max.apply(null, articles.map(a => (a.date ? a.date.getTime() : 0)));
      console.log(`OK — ${f.source.nom} [${f.veilles.join(', ')}] : ${articles.length} articles` +
        (recent ? `, le plus récent du ${dateCourte_(recent)}` : ', sans date'));
    } catch (err) {
      erreurs++;
      console.warn(`ERREUR — ${f.source.nom} [${f.veilles.join(', ')}] : ${err.message || err} (${url})`);
    }
  });
  console.log(`${Object.keys(flux).length} flux testés, ${erreurs} en erreur. ${tailleProprietes_()}`);
}

/** À exécuter une fois : crée les deux déclencheurs (et supprime les anciens). */
function installer() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('collecter').timeBased().everyDays(1).atHour(18).inTimezone(CONFIG.FUSEAU).create();
  ScriptApp.newTrigger('envoyerLundi').timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(7).nearMinute(45).inTimezone(CONFIG.FUSEAU).create();
  collecter();
  console.log('Déclencheurs installés : collecte chaque jour vers 18 h, e-mail le lundi vers 7 h 45 (Paris).');
}

/* ================================ E-mail ================================== */

function envoyer_(essai) {
  collecter();
  const limite = Date.now() - CONFIG.JOURS * JOUR_MS;
  const tampon = lireTampon_();
  // Les anciens articles (veille souveraineté) n'ont ni lettre ni langue : réseau, et flux tous français
  const enAttente = Object.keys(tampon)
    .map(k => Object.assign({ cle: k, v: PREFIXE_ANCIEN, g: 'FR' }, tampon[k]))
    .filter(a => a.d >= limite)
    .sort((a, b) => b.d - a.d);
  const sections = veillesActives_().map(veille => ({
    veille: veille,
    articles: enAttente.filter(a => a.v === veille.prefixe)
      .slice(0, veille.articlesMax)
      .map((a, i) => Object.assign({ numero: veille.prefixe + (i + 1) }, a)),
  }));
  const articles = [].concat(...sections.map(s => s.articles));

  const maintenant = new Date();
  const semaine = Utilities.formatDate(maintenant, CONFIG.FUSEAU, 'dd/MM/yyyy');
  const premierLundi = Number(Utilities.formatDate(maintenant, CONFIG.FUSEAU, 'd')) <= 7;
  const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août',
                'septembre', 'octobre', 'novembre', 'décembre'];
  const moisPrec = new Date(maintenant.getFullYear(), maintenant.getMonth() - 1, 15);
  const nomMoisPrec = MOIS[moisPrec.getMonth()] + ' ' + moisPrec.getFullYear();
  const rappel = premierLundi
    ? [`C'est le premier lundi du mois : demande à Claude les ${sections.length} synthèses de ${nomMoisPrec}, ` +
       'une par veille, en regroupant tes synthèses de la semaine (#SEMAINE) du mois (« fais la synthèse de ma veille ») :']
        .concat(sections.map(s => `- ${titreSection_(s.veille)}`))
    : [];
  const consigne = (articles.length ? 'Réponds avec le numéro suivi de ton avis, par exemple : #C2 je pense que… ' : '') +
      'Termine par ta synthèse de la semaine sur une ligne qui commence par #SEMAINE, par exemple : #SEMAINE cette semaine, …';

  const sujet = `[Veille] Semaine du ${semaine} — ` +
    sections.map(s => `${s.veille.categorie} ${s.articles.length}`).join(', ');
  const texte = [`Veille technologique — semaine du ${semaine}`]
    .concat(...sections.map(s => [`== ${titreSection_(s.veille)} ==`].concat(s.articles.length
      ? s.articles.map(a => [`#${a.numero} — ${a.t}`, `${a.s} · ${dateCourte_(a.d)} · ${a.g || '?'}`]
          .concat(a.r ? [extrait_(a.r)] : [], [a.l]).join('\n'))
      : ['Pas d\'actualité cette semaine.']).join('\n\n')))
    .concat(consigne ? ['—\n' + consigne] : [], rappel.length ? [rappel.join('\n')] : [])
    .join('\n\n');
  const html = construireHtml_(sections, semaine, consigne, rappel);

  if (essai) {
    console.log(`SUJET : ${sujet}\n\n${texte}`);
    return;
  }

  const dest = CONFIG.DESTINATAIRE || Session.getEffectiveUser().getEmail();
  GmailApp.sendEmail(dest, sujet, texte, { htmlBody: html, name: 'Veille technologique' });

  // Mémorise les liens envoyés (jamais renvoyés, quelle que soit la veille) et les retire du tampon
  const t = Date.now();
  articles.forEach(a => { PROPS.setProperty('S:' + a.cle, String(t)); delete tampon[a.cle]; });
  ecrireTampon_(tampon);
  nettoyerVus_();
  console.log(`Envoyé à ${dest} : ${sujet}`);
}

/** Chaque information sur sa propre ligne, lien visible en clair : fetch_replies.py retrouve ainsi les articles dans le texte cité de ta réponse. */
function construireHtml_(sections, semaine, consigne, rappel) {
  let h = `<div style="font-family:Arial,sans-serif;max-width:680px;color:#222;line-height:1.45">
<h2 style="margin:0 0 4px">Veille technologique</h2>
<p style="color:#666;margin:0 0 12px">Semaine du ${semaine} · ${sections.map(s => esc_(s.veille.categorie)).join(', ')}</p>`;
  sections.forEach(s => {
    h += `<h3 style="margin:24px 0 4px;padding-bottom:3px;border-bottom:2px solid #c9a35b;color:#7a5c22">${esc_(titreSection_(s.veille))}</h3>`;
    if (!s.articles.length) h += '<p style="color:#666">Pas d\'actualité cette semaine.</p>';
    s.articles.forEach(a => {
      h += `<div style="margin:16px 0">
<div style="font-size:16px"><b>#${a.numero}</b> — <a href="${esc_(a.l)}" style="color:#2c5f7c;font-weight:bold;text-decoration:none">${esc_(a.t)}</a></div>
<div style="color:#888;font-size:12px">${esc_(a.s)} · ${dateCourte_(a.d)} · ${esc_(a.g || '?')}</div>
${a.r ? `<div style="font-size:13px;color:#444">${esc_(extrait_(a.r))}</div>` : ''}
<div style="font-size:12px"><a href="${esc_(a.l)}" style="color:#2c5f7c">${esc_(a.l)}</a></div>
</div>`;
    });
  });
  if (consigne) h += `<p style="background:#f3ecdd;border-left:4px solid #c9a35b;padding:8px 12px;margin-top:24px">${esc_(consigne)}</p>`;
  if (rappel.length) {
    h += `<div style="background:#eef4f8;border-left:4px solid #2c5f7c;padding:8px 12px"><b>${esc_(rappel[0])}</b><ul style="margin:6px 0 0">` +
      rappel.slice(1).map(l => `<li>${esc_(l.replace(/^- /, ''))}</li>`).join('') + '</ul></div>';
  }
  return h + '</div>';
}

/* ================================ Outils =================================== */

function veillesActives_() {
  return CONFIG.VEILLES.filter(v => v.actif !== false);
}
function sources_(veille) {
  return veille.flux.concat(veille.googleAlerts || []);
}
function titreSection_(veille) {
  return `${veille.categorie} — ${veille.nom}`;
}
function extrait_(resume) {
  return resume.length > LONGUEUR_RESUME ? resume.slice(0, LONGUEUR_RESUME) + '…' : resume;
}

/** Mot-clé entier, pluriels compris (« hébergeurs », « jeux vidéo »), mais pas « cloud acteurs » : comme collect.py. */
function motifMotsCles_(motsCles) {
  const variantes = motsCles.map(m => normaliser_(m).split(' ')
    .map(x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?:s|x|es)?').join('\\s+'));
  return new RegExp('\\b(?:' + variantes.join('|') + ')\\b');
}

/** Articles d'un flux ; une erreur (flux absent, XML invalide) est écrite dans le journal et donne une liste vide. */
function lireFlux_(source) {
  try {
    return lireFluxBrut_(source);
  } catch (err) {
    console.warn(`${source.nom} → ${err.message || err}`);
    return [];
  }
}

function lireFluxBrut_(source) {
  const rep = UrlFetchApp.fetch(source.url, {
    muteHttpExceptions: true, followRedirects: true,
    headers: { 'User-Agent': 'Mozilla/5.0 (veille portfolio BTS SIO)' },
  });
  if (rep.getResponseCode() !== 200) throw new Error(`HTTP ${rep.getResponseCode()}`);
  const racine = XmlService.parse(rep.getContentText()).getRootElement();
  const atom = XmlService.getNamespace('http://www.w3.org/2005/Atom');
  const DC = 'http://purl.org/dc/elements/1.1/';

  if (racine.getName() === 'rss') {
    return racine.getChild('channel').getChildren('item').map(e => ({
      titre: nettoyerHtml_(texte_(e, 'title')),
      lien: texte_(e, 'link'),
      resume: nettoyerHtml_(texte_(e, 'description')),
      date: date_(texte_(e, 'pubDate')) || date_(texteNs_(e, 'date', DC)),
    })).filter(a => a.titre && a.lien);
  }
  if (racine.getName() === 'feed') {
    return racine.getChildren('entry', atom).map(e => {
      const l = e.getChildren('link', atom).find(x => !x.getAttribute('rel') || x.getAttribute('rel').getValue() === 'alternate');
      return {
        titre: nettoyerHtml_(texte_(e, 'title', atom)),
        lien: l ? l.getAttribute('href').getValue() : '',
        resume: nettoyerHtml_(texte_(e, 'summary', atom) || texte_(e, 'content', atom)),
        date: date_(texte_(e, 'published', atom)) || date_(texte_(e, 'updated', atom)),
      };
    }).filter(a => a.titre && a.lien);
  }
  if (racine.getName() === 'RDF') {                       // RSS 1.0 (ex. Le Monde Informatique)
    const rss = XmlService.getNamespace('http://purl.org/rss/1.0/');
    return racine.getChildren('item', rss).map(e => ({
      titre: nettoyerHtml_(texte_(e, 'title', rss)),
      lien: texte_(e, 'link', rss),
      resume: nettoyerHtml_(texte_(e, 'description', rss)),
      date: date_(texteNs_(e, 'date', DC)),
    })).filter(a => a.titre && a.lien);
  }
  throw new Error(`format inconnu (${racine.getName()})`);
}

function lireTampon_() {
  const brut = PROPS.getProperties();
  const tampon = {};
  Object.keys(brut).forEach(k => { if (k.indexOf('A:') === 0) tampon[k.slice(2)] = JSON.parse(brut[k]); });
  return tampon;
}
function ecrireTampon_(tampon) {
  const brut = PROPS.getProperties();
  Object.keys(brut).forEach(k => { if (k.indexOf('A:') === 0 && !tampon[k.slice(2)]) PROPS.deleteProperty(k); });
  const ecrire = {};
  Object.keys(tampon).forEach(k => { ecrire['A:' + k] = JSON.stringify(tampon[k]); });
  if (Object.keys(ecrire).length) PROPS.setProperties(ecrire);
}
function nettoyerVus_() {
  const limite = Date.now() - JOURS_MEMOIRE * JOUR_MS;    // garde les liens envoyés pendant un an
  const brut = PROPS.getProperties();
  Object.keys(brut).forEach(k => { if (k.indexOf('S:') === 0 && Number(brut[k]) < limite) PROPS.deleteProperty(k); });
}
/** Place occupée dans les propriétés du script, avec une alerte au-delà de 80 % de la limite. */
function tailleProprietes_() {
  const brut = PROPS.getProperties();
  const octets = Object.keys(brut).reduce((n, k) => n + k.length + String(brut[k]).length, 0);
  const pourcent = Math.round(100 * octets / LIMITE_PROPRIETES);
  return `Propriétés : ${Math.ceil(octets / 1024)} Ko sur 500 (${pourcent} %)` +
    (pourcent >= 80 ? ' — ATTENTION : réduire MAX_EN_ATTENTE ou JOURS_MEMOIRE.' : '.');
}

/** Minuscules, sans accents, apostrophes et espaces normalisés : « Souveraineté » → « souverainete ». */
function normaliser_(s) {
  return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/’/g, '\'').replace(/\s+/g, ' ').trim();
}
function cle_(lien) {
  const d = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, lien.trim());
  return Utilities.base64EncodeWebSafe(d).slice(0, 16);
}
function texte_(el, nom, ns) {
  const c = ns ? el.getChild(nom, ns) : el.getChild(nom);
  return c ? c.getText().trim() : '';
}
function texteNs_(el, nom, uri) {
  return texte_(el, nom, XmlService.getNamespace(uri));
}
function nettoyerHtml_(html) {
  return String(html).replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&#8217;|&rsquo;/g, '’').replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"').replace(/&#039;|&#39;/g, "'")
    .replace(/\s+/g, ' ').trim();
}
/** Date d'un flux ; accepte aussi « 2026-10-22 15:07:21 » (Cybermalveillance). null si absente ou illisible. */
function date_(s) {
  if (!s) return null;
  let d = new Date(s);
  if (isNaN(d) && /^\d{4}-\d{2}-\d{2} \d/.test(s)) d = new Date(s.replace(' ', 'T'));
  return isNaN(d) ? null : d;
}
function dateCourte_(ms) {
  return Utilities.formatDate(new Date(ms), CONFIG.FUSEAU, 'dd/MM/yyyy');
}
function esc_(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
