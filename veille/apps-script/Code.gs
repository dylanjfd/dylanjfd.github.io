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
 *  - Veille cybersécurité (C) : en plus des flux, des recherches Google Actualités ; la même actu reprise
 *    par plusieurs sites n'apparaît qu'une fois (« + N autres sources ») et les articles sont classés
 *    par pertinence (mots-clés menace + jeu trouvés, bonus si « joueur/gamer » est dans le titre), puis par date.
 *  - `rattrapageCyber` (à lancer une seule fois à la main) : mêmes recherches sur 90 jours, dans un e-mail
 *    à part « [Veille] Rattrapage cybersécurité », sans toucher à l'e-mail du lundi.
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
  // Leurs articles ne passent pas par les mots-clés (l'alerte est déjà ciblée), seulement par l'anti-doublon.
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
      categorie: 'Cybersécurité', prefixe: 'C', articlesMax: 10, actif: true,
      // pertinence : la même actu reprise par plusieurs sites n'apparaît qu'une fois (« + N autres sources »)
      // et les articles sont classés par pertinence (mots-clés menace + jeu, bonus motsTitreBonus), puis par date.
      // maxEnAttente : articles gardés en attente pour cette veille (beaucoup de sources, donc plus que les autres).
      pertinence: true, maxEnAttente: 80,
      motsTitreBonus: ['joueur', 'joueuse', 'gamer'],
      flux: [
        { nom: 'CERT-FR (ANSSI)',                url: 'https://www.cert.ssi.gouv.fr/feed/', langue: 'FR' },
        { nom: 'Cybermalveillance.gouv.fr',      url: 'https://www.cybermalveillance.gouv.fr/feed/atom-flux-actualites', langue: 'FR' },
        { nom: 'BleepingComputer',               url: 'https://www.bleepingcomputer.com/feed/', langue: 'EN' },
        { nom: 'ESET WeLiveSecurity',            url: 'https://www.welivesecurity.com/fr/rss/feed/', langue: 'FR' },
        { nom: 'Malwarebytes Labs',              url: 'https://www.malwarebytes.com/blog/feed/index.xml', langue: 'EN' },
        { nom: 'ZATAZ',                          url: 'https://www.zataz.com/feed/', langue: 'FR' },
        { nom: 'Numerama (Cyberguerre)',         url: 'https://www.numerama.com/cyberguerre/feed/', langue: 'FR' },
        { nom: 'Infosecurity Magazine',          url: 'https://www.infosecurity-magazine.com/rss/news/', langue: 'EN' },
        { nom: 'Tom\'s Guide (Sécurité)',        url: 'https://www.tomsguide.fr/category/web/securite/feed/', langue: 'FR' },
        { nom: 'Security Affairs',               url: 'https://securityaffairs.com/feed', langue: 'EN' },
        { nom: 'The Hacker News',                url: 'https://feeds.feedburner.com/TheHackersNews', langue: 'EN' },
        { nom: 'Cybernews',                      url: 'https://cybernews.com/feed/', langue: 'EN' },
        { nom: 'Kaspersky Securelist',           url: 'https://securelist.com/feed/', langue: 'EN' },
        { nom: 'Bitdefender (Hot for Security)', url: 'https://www.bitdefender.com/nuxt/api/en-us/rss/hotforsecurity/', langue: 'EN' },
        { nom: 'Check Point Research',           url: 'https://research.checkpoint.com/feed/', langue: 'EN' },
        { nom: 'Huntress',                       url: 'https://www.huntress.com/blog/rss.xml', langue: 'EN' },
      ],
      // Recherches Google Actualités (flux RSS) : l'adresse est construite par urlGoogleActualites_
      // (« when:7d », ou « when:90d » pour rattrapageCyber). Nom affiché : « Google Actualités : <requête> ».
      // Le vrai nom du site vient de la balise <source> du flux. Ces articles passent aussi par les deux
      // groupes de mots-clés (sur le titre : Google ne donne pas de résumé), car une requête comme « joueurs »
      // remonte aussi du sport ou des piratages de plateformes crypto.
      googleActualites: [
        { requete: '"joueurs" malware OR piratage OR arnaque', langue: 'FR' },
        { requete: '"jeu vidéo" cyberattaque', langue: 'FR' },
        { requete: 'Steam OR Discord OR Roblox arnaque OR piratage', langue: 'FR' },
        { requete: '"faux jeu" OR "faux cheat" virus', langue: 'FR' },
        { requete: 'gamers malware OR infostealer', langue: 'EN' },
        { requete: '"fake game" OR "fake cheat" malware', langue: 'EN' },
        { requete: 'Steam OR Discord OR Roblox OR Minecraft malware', langue: 'EN' },
        { requete: '"game mod" OR crack malware', langue: 'EN' },
        { requete: '"GTA 6" malware OR scam', langue: 'EN' },
        { requete: 'esports OR "gaming account" hack OR stolen', langue: 'EN' },
      ],
      // Alertes Google : déjà ciblées, elles ne passent pas par les mots-clés, seulement par l'anti-doublon.
      // Pour en ajouter une : sur https://www.google.fr/alerts, crée l'alerte (ex. « arnaque Steam »),
      // « Afficher les options » → « Envoyer à : Flux RSS », puis copie l'adresse du flux (icône RSS) ici :
      // { nom: 'Alerte Google — arnaque Steam', url: 'https://www.google.fr/alerts/feeds/…/…', langue: 'FR' },
      googleAlerts: [],
      groupesMotsCles: [
        [ // menace
          'infostealer', 'voleur de données', 'stealer', 'malware', 'logiciel malveillant', 'Lumma', 'StealC',
          'phishing', 'hameçonnage', 'vol de compte', 'account takeover', 'cookie', 'session hijacking',
          'piratage', 'piraté', 'pirate', 'hacked', 'hack', 'hacker', 'arnaque', 'escroquerie', 'scam', 'fraud',
          'fraude', 'compromis', 'compromised', 'fuite', 'fuite de données', 'data breach', 'ransomware',
          'rançongiciel', 'wiper', 'trojan', 'cheval de Troie', 'chevaux de Troie', 'RAT', 'backdoor', 'virus',
          'menace', 'cryptominer', 'minage', 'credential', 'identifiants', 'mot de passe', 'stolen', 'volé',
          'fake', 'faux', 'piégé', 'piégée', 'cyberattaque', 'cyberattack',
        ],
        [ // jeu
          'joueur', 'joueuse', 'gamer', 'gamers', 'gaming', 'jeu', 'jeux', 'jeu vidéo', 'video game', 'game',
          'games', 'jeu PC', 'PC game', 'esport', 'esports', 'e-sport', 'cheat', 'cheats', 'triche', 'aimbot',
          'anti-cheat', 'mod', 'modding', 'crack', 'skin', 'skins', 'loot', 'launcher', 'Steam', 'Steam Workshop',
          'Discord', 'Roblox', 'Fortnite', 'Minecraft', 'Valorant', 'Counter-Strike', 'CS2', 'GTA', 'GTA 6',
          'GTA VI', 'Grand Theft Auto', 'League of Legends', 'Call of Duty', 'Battlefield', 'Apex', 'Genshin',
          'itch.io', 'Epic Games', 'Riot', 'Riot Games', 'Battle.net', 'EA', 'Ubisoft', 'Xbox', 'PlayStation',
          'PSN', 'PS4', 'PS5', 'Nintendo', 'Nintendo Switch', 'Twitch',
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
const MAX_EN_ATTENTE = 30;              // par veille, sauf si la veille a son propre maxEnAttente
const LONGUEUR_RESUME = 250;
const JOURS_RATTRAPAGE = 90;             // rattrapageCyber : recherches Google Actualités sur 90 jours
const MAX_RATTRAPAGE = 30;               // articles au plus dans l'e-mail de rattrapage
// Fiabilité d'une source, pour garder la meilleure quand la même actu est reprise par plusieurs sites
const FIABILITE = { flux: 3, alerte: 2, actu: 1 };
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
    sources_(veille, CONFIG.JOURS).forEach(source => {
      if (!lus[source.url]) lus[source.url] = lireFlux_(source);
      lus[source.url].forEach(a => {
        const article = retenir_(veille, source, a, limite);
        if (!article) return;
        const cle = cle_(article.l);
        // Déjà mis de côté (pour cette veille ou une précédente) ou déjà envoyé : un article, une section, un envoi
        if (tampon[cle] || PROPS.getProperty('S:' + cle)) return;
        tampon[cle] = article;
        ajoutes++;
      });
    });
  });

  // Retire ce qui a plus de 7 jours, puis garde au plus MAX_EN_ATTENTE articles par veille (ou le maxEnAttente
  // de la veille) : les plus pertinents puis les plus récents (veille C), les plus récents sinon (pas de note).
  Object.keys(tampon).forEach(k => { if (tampon[k].d < limite) delete tampon[k]; });
  const parVeille = {};
  Object.keys(tampon).sort((a, b) => (tampon[b].p || 0) - (tampon[a].p || 0) || tampon[b].d - tampon[a].d)
    .forEach(k => {
      const v = tampon[k].v || PREFIXE_ANCIEN;
      const veille = CONFIG.VEILLES.find(x => x.prefixe === v);
      parVeille[v] = (parVeille[v] || 0) + 1;
      if (parVeille[v] > ((veille && veille.maxEnAttente) || MAX_EN_ATTENTE)) delete tampon[k];
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
  CONFIG.VEILLES.forEach(veille => sources_(veille, CONFIG.JOURS).forEach(source => {
    flux[source.url] = flux[source.url] || { source: source, veilles: [] };
    flux[source.url].veilles.push(veille.prefixe);
  }));
  let erreurs = 0;
  Object.keys(flux).forEach(url => {
    const f = flux[url];
    try {
      const articles = lireFluxBrut_(f.source);
      // Une recherche Google Actualités peut ne rien trouver sur 7 jours : ce n'est pas une erreur
      if (!articles.length && f.source.type !== 'actu') throw new Error('aucun article lisible');
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

/**
 * À lancer une seule fois à la main : actualités de la veille cybersécurité des 90 derniers jours
 * (recherches Google Actualités en « when:90d », plus les flux de la veille), dans un e-mail à part
 * « [Veille] Rattrapage cybersécurité ». Ne touche ni au tampon ni aux liens envoyés : l'e-mail du lundi
 * ne change pas. Les liens déjà envoyés un lundi ne sont pas repris.
 */
function rattrapageCyber() {
  rattrapage_('C', false);
}

/** Affiche l'e-mail de rattrapage dans le journal sans l'envoyer. */
function apercuRattrapageCyber() {
  rattrapage_('C', true);
}

function rattrapage_(prefixe, essai) {
  const veille = CONFIG.VEILLES.find(v => v.prefixe === prefixe);
  const limite = Date.now() - JOURS_RATTRAPAGE * JOUR_MS;
  const trouves = {};
  sources_(veille, JOURS_RATTRAPAGE).forEach(source => {
    lireFlux_(source).forEach(a => {
      const article = retenir_(veille, source, a, limite);
      if (!article) return;
      const cle = cle_(article.l);
      if (trouves[cle] || PROPS.getProperty('S:' + cle)) return;     // lecture seule : rien n'est enregistré
      trouves[cle] = Object.assign({ cle: cle }, article);
    });
  });
  const candidats = Object.keys(trouves).map(k => trouves[k]);
  const articles = regrouper_(veille, candidats).slice(0, MAX_RATTRAPAGE)
    .map((a, i) => Object.assign({ numero: veille.prefixe + (i + 1) }, a));
  const sections = [{ veille: veille, articles: articles }];

  const aujourdhui = Utilities.formatDate(new Date(), CONFIG.FUSEAU, 'dd/MM/yyyy');
  const sousTitre = `Rattrapage des ${JOURS_RATTRAPAGE} derniers jours, au ${aujourdhui}`;
  const sujet = `[Veille] Rattrapage cybersécurité`;
  const consigne = `${candidats.length} article(s) retenu(s), ${articles.length} actualité(s) affichée(s) ` +
    `(au plus ${MAX_RATTRAPAGE}), classées par pertinence puis par date. Cet e-mail ne remplace pas celui du lundi.`;
  const texte = construireTexte_(`Veille technologique — ${sousTitre}`, sections, consigne, []);
  if (essai) {
    console.log(`SUJET : ${sujet}\n\n${texte}`);
    return;
  }
  const dest = CONFIG.DESTINATAIRE || Session.getEffectiveUser().getEmail();
  GmailApp.sendEmail(dest, sujet, texte,
    { htmlBody: construireHtml_(sections, sousTitre, consigne, []), name: 'Veille technologique' });
  console.log(`Envoyé à ${dest} : ${sujet} (${articles.length} actualités)`);
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
  // Veille avec pertinence (C) : doublons regroupés, classement par pertinence ; sinon du plus récent au plus ancien
  const sections = veillesActives_().map(veille => {
    const siens = enAttente.filter(a => a.v === veille.prefixe);
    return {
      veille: veille,
      articles: (veille.pertinence ? regrouper_(veille, siens) : siens)
        .slice(0, veille.articlesMax)
        .map((a, i) => Object.assign({ numero: veille.prefixe + (i + 1) }, a)),
    };
  });
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
  const texte = construireTexte_(`Veille technologique — semaine du ${semaine}`, sections, consigne, rappel);
  const html = construireHtml_(sections, `Semaine du ${semaine}`, consigne, rappel);

  if (essai) {
    console.log(`SUJET : ${sujet}\n\n${texte}`);
    return;
  }

  const dest = CONFIG.DESTINATAIRE || Session.getEffectiveUser().getEmail();
  GmailApp.sendEmail(dest, sujet, texte, { htmlBody: html, name: 'Veille technologique' });

  // Mémorise les liens envoyés (jamais renvoyés, quelle que soit la veille) et les retire du tampon,
  // y compris ceux des autres sources de la même actu (« + N autres sources »)
  const t = Date.now();
  articles.forEach(a => (a.cles || [a.cle]).forEach(c => { PROPS.setProperty('S:' + c, String(t)); delete tampon[c]; }));
  ecrireTampon_(tampon);
  nettoyerVus_();
  console.log(`Envoyé à ${dest} : ${sujet}`);
}

/**
 * Version texte de l'e-mail. « + N autres sources » est écrit APRÈS la ligne du lien : fetch_replies.py
 * lit numéro, titre, « Source · date · langue », extrait puis lien, et ignore la suite.
 */
function construireTexte_(entete, sections, consigne, rappel) {
  return [entete]
    .concat(...sections.map(s => [`== ${titreSection_(s.veille)} ==`].concat(s.articles.length
      ? s.articles.map(a => [`#${a.numero} — ${a.t}`, `${a.s} · ${dateCourte_(a.d)} · ${a.g || '?'}`]
          .concat(a.r ? [extrait_(a.r)] : [], [a.l], a.autres && a.autres.length ? [autresSources_(a)] : [])
          .join('\n'))
      : ['Pas d\'actualité cette semaine.']).join('\n\n')))
    .concat(consigne ? ['—\n' + consigne] : [], rappel.length ? [rappel.join('\n')] : [])
    .join('\n\n');
}

/** Chaque information sur sa propre ligne, lien visible en clair : fetch_replies.py retrouve ainsi les articles dans le texte cité de ta réponse. */
function construireHtml_(sections, sousTitre, consigne, rappel) {
  let h = `<div style="font-family:Arial,sans-serif;max-width:680px;color:#222;line-height:1.45">
<h2 style="margin:0 0 4px">Veille technologique</h2>
<p style="color:#666;margin:0 0 12px">${esc_(sousTitre)} · ${sections.map(s => esc_(s.veille.categorie)).join(', ')}</p>`;
  sections.forEach(s => {
    h += `<h3 style="margin:24px 0 4px;padding-bottom:3px;border-bottom:2px solid #c9a35b;color:#7a5c22">${esc_(titreSection_(s.veille))}</h3>`;
    if (!s.articles.length) h += '<p style="color:#666">Pas d\'actualité cette semaine.</p>';
    s.articles.forEach(a => {
      h += `<div style="margin:16px 0">
<div style="font-size:16px"><b>#${a.numero}</b> — <a href="${esc_(a.l)}" style="color:#2c5f7c;font-weight:bold;text-decoration:none">${esc_(a.t)}</a></div>
<div style="color:#888;font-size:12px">${esc_(a.s)} · ${dateCourte_(a.d)} · ${esc_(a.g || '?')}</div>
${a.r ? `<div style="font-size:13px;color:#444">${esc_(extrait_(a.r))}</div>` : ''}
<div style="font-size:12px"><a href="${esc_(a.l)}" style="color:#2c5f7c">${esc_(a.l)}</a></div>
${a.autres && a.autres.length ? `<div style="color:#888;font-size:12px">${esc_(autresSources_(a))}</div>` : ''}
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
/** Sources d'une veille, avec leur type : flux, alerte (Google Alerts) ou actu (recherche Google Actualités sur `jours` jours). */
function sources_(veille, jours) {
  const type = t => f => Object.assign({ type: t }, f);
  const actus = (veille.googleActualites || []).map(q => ({
    nom: 'Google Actualités : ' + q.requete, url: urlGoogleActualites_(q, jours), langue: q.langue, type: 'actu',
  }));
  return veille.flux.map(type('flux')).concat((veille.googleAlerts || []).map(type('alerte')), actus);
}
/** Adresse du flux RSS d'une recherche Google Actualités, en français ou en anglais selon la langue. */
function urlGoogleActualites_(q, jours) {
  const pays = q.langue === 'EN' ? 'hl=en-US&gl=US&ceid=US:en' : 'hl=fr&gl=FR&ceid=FR:fr';
  return 'https://news.google.com/rss/search?q=' + encodeURIComponent(q.requete).replace(/%20/g, '+') +
    '+when:' + jours + 'd&' + pays;
}

/**
 * Article d'un flux tel qu'il est gardé (tampon ou rattrapage), ou null s'il est trop ancien ou hors sujet.
 * Alerte Google : pas de mots-clés. Recherche Google Actualités : titre sans « - Site », vrai nom du site
 * (balise <source>), pas de résumé (il répète le titre), mots-clés vérifiés sur le titre.
 */
function retenir_(veille, source, a, limite) {
  if (!a.date || a.date.getTime() < limite) return null;
  let titre = a.titre, resume = a.resume, site = source.nom;
  if (source.type === 'actu') {
    site = a.site || 'Google Actualités';
    titre = sansSite_(titre, a.site);
    resume = '';
  }
  const texte = normaliser_(titre + ' ' + resume);
  if (source.type !== 'alerte' && !motifsVeille_(veille).groupes.every(m => m.test(texte))) return null;
  const article = { t: titre, l: lienArticle_(a.lien), r: resume.slice(0, LONGUEUR_RESUME), s: site,
                    g: source.langue || '', d: a.date.getTime(), v: veille.prefixe };
  if (veille.pertinence) {
    article.p = pertinence_(veille, titre, resume);          // note de pertinence
    article.f = FIABILITE[source.type] || FIABILITE.flux;    // fiabilité de la source
  }
  return article;
}
/** « Titre - Le Monde » → « Titre » (les titres Google Actualités finissent par le nom du site). */
function sansSite_(titre, site) {
  if (!site) return titre;
  const fin = new RegExp('\\s+[-–—|]\\s+' + site.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*$');
  return titre.replace(fin, '').trim() || titre;
}

/** Expressions d'une veille, calculées une fois : groupes, un motif par mot-clé (pour la note), mots du bonus. */
const MOTIFS_ = {};
function motifsVeille_(veille) {
  if (!MOTIFS_[veille.prefixe]) {
    MOTIFS_[veille.prefixe] = {
      groupes: veille.groupesMotsCles.map(motifMotsCles_),
      // Un motif par mot-clé distinct (« piraté » et « pirate » ne comptent qu'une fois)
      mots: veille.groupesMotsCles.map(g => g.map(normaliser_).filter((m, i, t) => t.indexOf(m) === i)
        .map(m => motifMotsCles_([m]))),
      bonus: veille.motsTitreBonus && veille.motsTitreBonus.length ? motifMotsCles_(veille.motsTitreBonus) : null,
    };
  }
  return MOTIFS_[veille.prefixe];
}
/** Pertinence : nombre de mots-clés différents trouvés (menace + jeu), +2 si un mot du bonus est dans le titre. */
function pertinence_(veille, titre, resume) {
  const m = motifsVeille_(veille);
  const texte = normaliser_(titre + ' ' + resume);
  let note = 0;
  m.mots.forEach(groupe => groupe.forEach(motif => { if (motif.test(texte)) note++; }));
  if (m.bonus && m.bonus.test(normaliser_(titre))) note += 2;
  return note;
}

/**
 * Regroupe la même actu reprise par plusieurs sites (titres très proches ; le même lien est déjà
 * regroupé par la clé). Garde la source la plus fiable (flux spécialisé, puis alerte, puis Google
 * Actualités), puis la plus pertinente ; les autres sont listées dans « + N autres sources ».
 * Résultat classé par pertinence, puis du plus récent au plus ancien.
 */
function regrouper_(veille, articles) {
  const tries = articles.map(a => Object.assign({}, a, {
    p: a.p != null ? a.p : pertinence_(veille, a.t, a.r || ''),
    f: a.f || FIABILITE.flux,                                  // anciens articles : venus d'un flux
  })).sort((a, b) => b.f - a.f || b.p - a.p || b.d - a.d);
  const groupes = [];
  tries.forEach(a => {
    const mots = motsTitre_(a.t);
    const groupe = groupes.find(g => g.mots.some(m => titresProches_(m, mots)));
    if (groupe) { groupe.membres.push(a); groupe.mots.push(mots); }
    else groupes.push({ membres: [a], mots: [mots] });
  });
  return groupes.map(g => {
    const choisi = g.membres[0];
    const autres = g.membres.slice(1).map(x => x.s).filter((s, i, t) => s !== choisi.s && t.indexOf(s) === i);
    return Object.assign({}, choisi, {
      p: Math.max.apply(null, g.membres.map(x => x.p)),
      autres: autres,
      cles: g.membres.map(x => x.cle),
    });
  }).sort((a, b) => b.p - a.p || b.d - a.d);
}
const MOTS_VIDES = ('les des une pour par sur dans avec qui que est sont aux son ses leur leurs cette ces plus pas ' +
  'apres selon comme the and for with from that this are was has have its into over after new how your you ' +
  'their they will can not now what why who').split(' ');
/** Mots significatifs d'un titre (3 lettres et plus, sans accents ni mots vides). */
function motsTitre_(titre) {
  return normaliser_(titre).replace(/[^a-z0-9]+/g, ' ').split(' ')
    .filter((m, i, t) => m.length >= 3 && MOTS_VIDES.indexOf(m) < 0 && t.indexOf(m) === i);
}
/** Deux titres « très proches » : au moins 3 mots communs couvrant 75 % du plus court, ou 60 % de mots communs en tout. */
function titresProches_(a, b) {
  if (!a.length || !b.length) return false;
  const communs = a.filter(m => b.indexOf(m) >= 0).length;
  const total = a.length + b.length - communs;
  return (communs >= 3 && communs / Math.min(a.length, b.length) >= 0.75) || communs / total >= 0.6;
}
function autresSources_(a) {
  const n = a.autres.length;
  return `+ ${n} ${n > 1 ? 'autres sources' : 'autre source'} (${a.autres.join(', ')})`;
}
function titreSection_(veille) {
  return `${veille.categorie} — ${veille.nom}`;
}
function extrait_(resume) {
  return resume.length > LONGUEUR_RESUME ? resume.slice(0, LONGUEUR_RESUME) + '…' : resume;
}

/**
 * Mot-clé entier, pluriels compris (« hébergeurs », « jeux vidéo »), mais pas « cloud acteurs ».
 * Mots de 3 lettres ou moins (RAT, mod, EA, PSN…) : seulement le « s » (« mods », pas « modes »), et jamais
 * à l'intérieur d'un mot (pas « RAT » dans « pirate », pas « mod » dans « modèle »).
 */
function motifMotsCles_(motsCles) {
  const variantes = motsCles.map(m => normaliser_(m).split(' ')
    .map(x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + (x.length <= 3 ? '(?:s)?' : '(?:s|x|es)?')).join('\\s+'));
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
      site: texte_(e, 'source'),                          // Google Actualités : vrai nom du site
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
/** Lien d'une alerte Google (google.com/url?…&url=…) → adresse de l'article, pour que l'anti-doublon la reconnaisse. */
function lienArticle_(lien) {
  const m = /^https?:\/\/(?:www\.)?google\.[a-z.]+\/url\?(?:.*&)?url=([^&]+)/.exec(lien);
  if (!m) return lien;
  try { return decodeURIComponent(m[1]); } catch (err) { return lien; }   // « % » mal encodé : lien gardé tel quel
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
