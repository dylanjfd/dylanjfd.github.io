/**
 * Veille « La souveraineté numérique est-elle accessible aux PME ? »
 * Google Apps Script — remplace GitHub Actions (veille.yml) pour la collecte et l'e-mail du lundi.
 *
 *  - Chaque jour : lit les flux RSS, met de côté les articles des 7 derniers jours
 *    qui contiennent un mot-clé (titre ou résumé, sans tenir compte des majuscules ni des accents).
 *  - Chaque lundi vers 7 h 45 : envoie « [Veille souveraineté] Semaine du JJ/MM/AAAA — N actualités »,
 *    10 articles au plus, numérotés, du plus récent au plus ancien. Un lien envoyé n'est jamais renvoyé.
 *  - Tu réponds à l'e-mail avec « #numéro ton avis » (ex. « #2 je pense que… »).
 *  - Le premier lundi du mois, l'e-mail rappelle de demander la synthèse du mois précédent à Claude.
 *
 * Mise en place : exécuter une fois `installer`, puis `apercu` pour voir l'e-mail sans l'envoyer.
 * Aucun mot de passe : l'e-mail part de ton compte Google.
 */

const CONFIG = {
  DESTINATAIRE: '',        // vide = ton adresse Google
  JOURS: 7,
  ARTICLES_MAX: 10,
  FUSEAU: 'Europe/Paris',

  FLUX: [
    { nom: 'CERT-FR (ANSSI)',       url: 'https://www.cert.ssi.gouv.fr/feed/' },
    { nom: 'CNIL',                  url: 'https://www.cnil.fr/fr/rss.xml' },
    { nom: 'Next',                  url: 'https://next.ink/feed/' },
    { nom: 'LeMagIT',               url: 'https://www.lemagit.fr/rss/ContentSyndication.xml' },
    { nom: 'Le Monde Informatique', url: 'https://www.lemondeinformatique.fr/flux-rss/thematique/toutes-les-actualites/rss.xml' },
  ],
  // Alertes Google (google.fr/alerts → « Envoyer à : Flux RSS ») : { nom: '…', url: '…' }
  GOOGLE_ALERTS: [],

  MOTS_CLES: [
    'souveraineté numérique', 'cloud souverain', 'SecNumCloud', 'Cloud Act',
    'hébergement', 'hébergeur', 'RGPD', 'données personnelles', 'PME',
    'cloud de confiance', 'OVHcloud', 'Scaleway',
  ],
};

const PROPS = PropertiesService.getScriptProperties();
const JOUR_MS = 86400000;

/* ============================ Tâches planifiées ============================ */

/** Tous les jours : met de côté les nouveaux articles (certains flux ne gardent que ~5 jours). */
function collecter() {
  const limite = Date.now() - CONFIG.JOURS * JOUR_MS;
  const motsCles = CONFIG.MOTS_CLES.map(normaliser_);
  const tampon = lireTampon_();
  let ajoutes = 0;

  CONFIG.FLUX.concat(CONFIG.GOOGLE_ALERTS).forEach(source => {
    lireFlux_(source).forEach(a => {
      if (!a.date || a.date.getTime() < limite) return;
      const texte = normaliser_(a.titre + ' ' + a.resume);
      if (!motsCles.some(m => texte.includes(m))) return;
      const cle = cle_(a.lien);
      if (tampon[cle] || PROPS.getProperty('S:' + cle)) return;
      tampon[cle] = { t: a.titre, l: a.lien, r: a.resume.slice(0, 300), s: source.nom, d: a.date.getTime() };
      ajoutes++;
    });
  });

  // Retire ce qui a plus de 7 jours
  Object.keys(tampon).forEach(k => { if (tampon[k].d < limite) delete tampon[k]; });
  ecrireTampon_(tampon);
  console.log(`Collecte : ${ajoutes} nouvel(s) article(s), ${Object.keys(tampon).length} en attente.`);
}

/** Chaque lundi : envoie l'e-mail de la semaine. */
function envoyerLundi() {
  envoyer_(false);
}

/** Affiche l'e-mail dans le journal sans l'envoyer ni rien enregistrer. */
function apercu() {
  envoyer_(true);
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
  const articles = Object.keys(tampon)
    .map(k => Object.assign({ cle: k }, tampon[k]))
    .filter(a => a.d >= limite)
    .sort((a, b) => b.d - a.d)
    .slice(0, CONFIG.ARTICLES_MAX);

  const maintenant = new Date();
  const semaine = Utilities.formatDate(maintenant, CONFIG.FUSEAU, 'dd/MM/yyyy');
  const premierLundi = Number(Utilities.formatDate(maintenant, CONFIG.FUSEAU, 'd')) <= 7;
  const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août',
                'septembre', 'octobre', 'novembre', 'décembre'];
  const moisPrec = new Date(maintenant.getFullYear(), maintenant.getMonth() - 1, 15);
  const nomMoisPrec = MOIS[moisPrec.getMonth()] + ' ' + moisPrec.getFullYear();
  const rappel = premierLundi
    ? `C'est le premier lundi du mois : demande à Claude la synthèse de ${nomMoisPrec} (« fais la synthèse de ma veille »).`
    : '';

  let sujet, texte, html;
  if (articles.length === 0) {
    sujet = `[Veille souveraineté] Semaine du ${semaine} — Pas d'actualité cette semaine`;
    texte = 'Aucun article ne correspondait aux mots-clés cette semaine.' + (rappel ? '\n\n' + rappel : '');
    html = `<p>Aucun article ne correspondait aux mots-clés cette semaine.</p>${rappel ? `<p><b>${esc_(rappel)}</b></p>` : ''}`;
  } else {
    const n = articles.length;
    sujet = `[Veille souveraineté] Semaine du ${semaine} — ${n} actualité${n > 1 ? 's' : ''}`;
    const consigne = 'Réponds à cet e-mail avec #numéro suivi de ton avis, par exemple « #2 je pense que… ». Ignore les articles qui ne t\'intéressent pas.';
    texte = consigne + '\n\n' + articles.map((a, i) =>
      `#${i + 1} — ${a.t}\n${a.s} · ${dateCourte_(a.d)}\n${a.l}\n${a.r}`).join('\n\n') +
      (rappel ? '\n\n' + rappel : '');
    html = construireHtml_(articles, semaine, consigne, rappel);
  }

  if (essai) {
    console.log(`SUJET : ${sujet}\n\n${texte}`);
    return;
  }

  const dest = CONFIG.DESTINATAIRE || Session.getEffectiveUser().getEmail();
  GmailApp.sendEmail(dest, sujet, texte, { htmlBody: html, name: 'Veille souveraineté' });

  // Mémorise les liens envoyés (jamais renvoyés) et les retire du tampon
  const t = Date.now();
  articles.forEach(a => { PROPS.setProperty('S:' + a.cle, String(t)); delete tampon[a.cle]; });
  ecrireTampon_(tampon);
  nettoyerVus_();
  console.log(`Envoyé à ${dest} : ${sujet}`);
}

function construireHtml_(articles, semaine, consigne, rappel) {
  let h = `<div style="font-family:Arial,sans-serif;max-width:680px;color:#222;line-height:1.45">
<h2 style="margin:0 0 4px">Veille souveraineté numérique</h2>
<p style="color:#666;margin:0 0 12px">Semaine du ${semaine} · La souveraineté numérique est-elle accessible aux PME ?</p>
<p style="background:#f3ecdd;border-left:4px solid #c9a35b;padding:8px 12px">${esc_(consigne)}</p>`;
  articles.forEach((a, i) => {
    h += `<div style="margin:16px 0">
<div style="font-size:16px"><b>#${i + 1}</b> — <a href="${esc_(a.l)}" style="color:#2c5f7c;font-weight:bold;text-decoration:none">${esc_(a.t)}</a></div>
<div style="color:#888;font-size:12px">${esc_(a.s)} · ${dateCourte_(a.d)}</div>
${a.r ? `<div style="font-size:13px;color:#444">${esc_(a.r.slice(0, 250))}${a.r.length > 250 ? '…' : ''}</div>` : ''}
</div>`;
  });
  if (rappel) h += `<p style="background:#eef4f8;border-left:4px solid #2c5f7c;padding:8px 12px"><b>${esc_(rappel)}</b></p>`;
  return h + '</div>';
}

/* ================================ Outils =================================== */

function lireFlux_(source) {
  try {
    const rep = UrlFetchApp.fetch(source.url, {
      muteHttpExceptions: true, followRedirects: true,
      headers: { 'User-Agent': 'Mozilla/5.0 (veille portfolio BTS SIO)' },
    });
    if (rep.getResponseCode() !== 200) {
      console.warn(`${source.nom} → HTTP ${rep.getResponseCode()}`);
      return [];
    }
    const racine = XmlService.parse(rep.getContentText()).getRootElement();
    const atom = XmlService.getNamespace('http://www.w3.org/2005/Atom');

    if (racine.getName() === 'rss') {
      return racine.getChild('channel').getChildren('item').map(e => ({
        titre: texte_(e, 'title'),
        lien: texte_(e, 'link'),
        resume: nettoyerHtml_(texte_(e, 'description')),
        date: date_(texte_(e, 'pubDate') || texteNs_(e, 'date', 'http://purl.org/dc/elements/1.1/')),
      })).filter(a => a.titre && a.lien);
    }
    if (racine.getName() === 'feed') {
      return racine.getChildren('entry', atom).map(e => {
        const l = e.getChildren('link', atom).find(x => !x.getAttribute('rel') || x.getAttribute('rel').getValue() === 'alternate');
        return {
          titre: texte_(e, 'title', atom),
          lien: l ? l.getAttribute('href').getValue() : '',
          resume: nettoyerHtml_(texte_(e, 'summary', atom) || texte_(e, 'content', atom)),
          date: date_(texte_(e, 'published', atom) || texte_(e, 'updated', atom)),
        };
      }).filter(a => a.titre && a.lien);
    }
    if (racine.getName() === 'RDF') {                       // RSS 1.0 (ex. Le Monde Informatique)
      const rss = XmlService.getNamespace('http://purl.org/rss/1.0/');
      return racine.getChildren('item', rss).map(e => ({
        titre: texte_(e, 'title', rss),
        lien: texte_(e, 'link', rss),
        resume: nettoyerHtml_(texte_(e, 'description', rss)),
        date: date_(texteNs_(e, 'date', 'http://purl.org/dc/elements/1.1/')),
      })).filter(a => a.titre && a.lien);
    }
    console.warn(`${source.nom} → format inconnu (${racine.getName()})`);
    return [];
  } catch (err) {
    console.warn(`${source.nom} → ${err}`);
    return [];
  }
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
  const limite = Date.now() - 365 * JOUR_MS;               // garde les liens envoyés pendant un an
  const brut = PROPS.getProperties();
  Object.keys(brut).forEach(k => { if (k.indexOf('S:') === 0 && Number(brut[k]) < limite) PROPS.deleteProperty(k); });
}

function normaliser_(s) {
  return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
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
function date_(s) {
  const d = s ? new Date(s) : null;
  return d && !isNaN(d) ? d : null;
}
function dateCourte_(ms) {
  return Utilities.formatDate(new Date(ms), CONFIG.FUSEAU, 'dd/MM/yyyy');
}
function esc_(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
