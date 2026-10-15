# Portfolio BTS SIO — Dylan JOFFREDO

Site statique (HTML, CSS et JavaScript, sans framework ni bibliothèque) qui sert de support à l'épreuve **E5 du BTS SIO** : présentation, projets, compétences, veille technologique, alternance, certifications, tableau de synthèse et contact.

Thème visuel : **« Quête d'aventure »**, une interface inspirée des jeux d'aventure / RPG modernes, sobre et professionnelle (titres classiques, vocabulaire RPG réservé aux petits libellés).

**Le texte de chaque page se modifie dans un fichier Markdown** (`contenu/*.md`) : pas besoin de toucher au HTML. La syntaxe est expliquée dans [`contenu/GUIDE-MARKDOWN.md`](contenu/GUIDE-MARKDOWN.md).

## Sommaire

1. [Organisation des fichiers](#1-organisation-des-fichiers)
2. [Voir le site en local](#2-voir-le-site-en-local)
3. [Modifier le contenu](#3-modifier-le-contenu)
4. [Formulaire de contact](#4-formulaire-de-contact)
5. [Mise en ligne (HTTPS) et versionnage Git](#5-mise-en-ligne-https-et-versionnage-git)
6. [Thème « Quête d'aventure »](#6-thème--quête-daventure-)
7. [Conformité aux consignes E5](#7-conformité-aux-consignes-e5)
8. [Accessibilité, RGPD et licence](#8-accessibilité-rgpd-et-licence)

---

## 1. Organisation des fichiers

Chaque langage a ses propres fichiers : **HTML** pour la structure, **Markdown** pour le texte, **CSS** pour l'apparence, **JavaScript** pour le comportement. Aucun style ni script n'est écrit dans les pages HTML.

```
index.html, pages/*.html      Structure des pages (en-tête, menu, pied de page)
pages/projets/projet-*.html   Structure des 3 fiches projet
contenu/                      TEXTE DES PAGES, un fichier Markdown par page
  site.md                     Ton nom, ton e-mail, tes liens, le texte du pied de page
  accueil.md, projets.md, competences.md, veille.md, alternance.md,
  certifications.md, tableau-e5.md, contact.md,
  mentions-legales.md, confidentialite.md, plan-du-site.md
  projets/projet-1.md … projet-3.md
  GUIDE-MARKDOWN.md           Mode d'emploi de la syntaxe
assets/css/
  style.css                   Point d'entrée : sommaire + import des modules ci-dessous
  01-variables.css            Couleurs des deux thèmes, police Cinzel, ornements
  02-base.css                 Base, accessibilité, mise en page, libellés RPG, séparateurs
  03-entete-pied.css          En-tête, menu, bouton de thème, pied de page
  04-composants.css           Boutons, cases à compléter, jauges, cartes, badges, frise
  05-accueil.css              Hero d'accueil et fiche de personnage
  06-pages.css                Pages intérieures (projets, compétences, veille, alternance…)
  07-animations-responsive.css  Apparitions, responsive, mouvement réduit, impression
assets/js/
  theme-init.js               Thème mémorisé, appliqué avant l'affichage
  icones.js                   Icônes SVG originales
  markdown.js                 Analyseur Markdown maison
  rendu.js                    Construit chaque page à partir de son fichier .md
  interface.js                Thème, menu mobile, apparitions, particules, filtre des projets
  formulaire.js               Formulaire de contact
  main.js                     Réglages CONFIG (option SISR/SLAM, formulaire) + démarrage
assets/img/                   favicon.svg, topo.svg (carte topographique originale)
assets/fonts/                 Police Cinzel + licence OFL.txt
assets/docs/                  cv.pdf (ton CV), tableau-synthese-e5.pdf (provisoire)
outils/serveur-local.bat      Serveur local de prévisualisation (Windows)
contact.php                   Envoi du formulaire sur un hébergement PHP
sitemap.xml, robots.txt       Référencement
.nojekyll                     Indique à GitHub Pages de publier les fichiers tels quels
LICENSE                       Licence MIT du code
```

## 2. Voir le site en local

Le navigateur refuse de lire les fichiers `.md` quand on ouvre `index.html` par un double-clic : un message l'indique alors à la place du contenu. Ouvre le site avec un petit serveur :

- **Le plus simple** : double-clic sur `outils/serveur-local.bat`. Le site s'ouvre sur <http://localhost:8000> ; ferme la fenêtre noire pour arrêter.
- **VS Code** : extension *Live Server*, clic droit sur `index.html` → *Open with Live Server*.
- **Python** (s'il est installé) : `python -m http.server 8000`.
- **PHP** (exécute aussi `contact.php`) : `php -S localhost:8000`.

Modifie un fichier `.md`, enregistre, puis actualise la page (F5).

## 3. Modifier le contenu

### Où écrire

| Pour modifier… | Ouvre… |
|---|---|
| Ton nom, ton e-mail, GitHub, LinkedIn, le pied de page | `contenu/site.md` |
| Le texte d'une page | `contenu/<page>.md` |
| L'option SISR / SLAM, l'adresse d'envoi du formulaire | `assets/js/main.js` (objet `CONFIG`) |
| Les champs du formulaire de contact | `pages/contact.html` |

### Cases à compléter

Tout texte entre **doubles crochets** `[[…]]` s'affiche encadré en pointillés dorés : remplace-le par ton texte et **retire les crochets**. Pour tout retrouver : recherche `[[` dans le dossier `contenu/` (`Ctrl+Maj+F` dans VS Code). La console du navigateur (F12) indique aussi le nombre de cases restantes sur chaque page.

### Raccourcis utiles (détails dans le guide)

- **Photo** : dépose ta photo dans `assets/img/` puis indique son chemin dans `contenu/accueil.md` (`photo: assets/img/photo.jpg`, bloc `::: fiche`).
- **Niveau et attributs** de la fiche de personnage : bloc `::: fiche` de `accueil.md` (attributs notés sur 5, la jauge suit).
- **Compétences** : une ligne `- Nom — précisions : niveau` (1 Notions, 2 Intermédiaire, 3 Avancé, 4 Maîtrise).
- **Projets** : bloc `::: quetes` de `projets.md` (type principale/secondaire, statut, compétences E5…) et un fichier par fiche dans `contenu/projets/`.
- **Certifications** : `statut: obtenue` (succès débloqué) ou `en cours` / `prévue` (verrouillé).
- **Tableau E5** : un `x` dans une case = coche dorée. Remplace aussi `assets/docs/tableau-synthese-e5.pdf` par l'export PDF du modèle officiel `[E5]_Epreuve_support_modele_tableau_synthese_annexe_BTS_SIO_2026.xlsx` complété.
- **CV** : `assets/docs/cv.pdf` (copie de « CV Dylan Joffredo.pdf »). Pour le mettre à jour, remplace ce fichier en gardant le même nom.

## 4. Formulaire de contact

Le formulaire (`pages/contact.html`, `assets/js/formulaire.js`) vérifie les champs en français, place le focus sur le premier champ invalide, demande le consentement RGPD et contient un pot de miel anti-spam (`_gotcha`). Les messages s'affichent dans la zone `role="status"` ; après un envoi réussi, une notification « ✦ Quête mise à jour — message envoyé » s'ajoute au message de confirmation.

Tant que `CONFIG.FORM_ENDPOINT` est vide (dans `assets/js/main.js`), rien n'est envoyé et un message d'aide s'affiche. Deux solutions :

- **Formspree** (hébergement statique, ex. GitHub Pages) : crée un formulaire sur <https://formspree.io>, puis mets son adresse dans `FORM_ENDPOINT` (ex. `'https://formspree.io/f/abcdwxyz'`).
- **PHP** (hébergement avec PHP et `mail()`) : renseigne `CONTACT_TO` (et si besoin `CONTACT_FROM`) dans `contact.php`, puis mets `FORM_ENDPOINT: '../contact.php'`. Sans JavaScript, le formulaire est directement envoyé à `contact.php`.

## 5. Mise en ligne (HTTPS) et versionnage Git

Le portfolio doit être accessible en ligne, en HTTPS. Exemple avec **GitHub Pages** (gratuit, HTTPS inclus) :

1. Installe Git (<https://git-scm.com>) et crée un dépôt public sur GitHub (ex. `portfolio`).
2. Dans le dossier du site :
   ```
   git init
   git add .
   git commit -m "Thème Quête d'aventure"
   git branch -M main
   git remote add origin https://github.com/ton-pseudo/portfolio.git
   git push -u origin main
   ```
3. Sur GitHub : *Settings* → *Pages* → *Deploy from a branch* → `main` / `(root)`, puis coche *Enforce HTTPS*. Le site est publié sur `https://ton-pseudo.github.io/portfolio/`.
4. Remplace `https://prenom-nom.fr/` par cette adresse dans `sitemap.xml` et `robots.txt`.
5. Utilise Formspree pour le formulaire (GitHub Pages n'exécute pas PHP).

Le fichier `.nojekyll` empêche GitHub Pages de transformer les fichiers `.md` : ils restent lisibles par le site. Avec GitHub, tu peux aussi corriger un texte directement dans le navigateur : ouvre le fichier `.md` sur github.com, clique sur le crayon, enregistre (*Commit changes*), et le site est mis à jour en une minute.

Alternatives : Netlify ou Vercel (glisser-déposer du dossier), ou un hébergeur PHP (OVH, Infomaniak, Hostinger…) pour utiliser `contact.php`. Un nom de domaine (`prenom-nom.fr`, environ 10 €/an) est recommandé mais pas obligatoire.

## 6. Thème « Quête d'aventure »

### Palette

Les couleurs sont des variables CSS (`assets/css/01-variables.css`). Ratios de contraste WCAG mesurés :

| Thème | Couleur | Fond | Contraste |
|---|---|---|---|
| Sombre (défaut) | texte `#efe6d2` | fond `#0e1320` | 14,94:1 |
| Sombre | texte secondaire `#a59c88` | surface `#1e2638` | 5,55:1 |
| Sombre | or `#c9a35b` | surface `#1e2638` | 6,39:1 |
| Sombre | bleu acier `#6fa8c7` | surface `#171e2e` | 6,42:1 |
| Sombre | succès `#7bc47f` / danger `#e07a6b` | surfaces | 7,96:1 / 5,16:1 |
| Sombre | bouton : texte `#0e1320` | or `#c9a35b` | 7,83:1 |
| Clair « parchemin » | texte `#2a2116` | fond `#f3ecdd` | 13,45:1 |
| Clair | texte secondaire `#5f5443` | fond alterné `#ebe2ce` | 5,75:1 |
| Clair | or texte `#725522` | fond alterné `#ebe2ce` | 5,37:1 |
| Clair | bleu acier `#2c5f7c` / succès `#2b6430` / danger `#a63d2e` | surface `#fbf7ee` | 6,47 / 6,61 / 5,90:1 |
| Clair | bouton : texte `#2a2116` | or `#c9a35b` | 6,68:1 |

Fonds : `#0e1320` (bleu nuit), `#121826` (alterné), surfaces `#171e2e` / `#1e2638`, bordures `#2e3648` ; en clair : `#f3ecdd`, surfaces `#fbf7ee`, bordures `#d8ccb2`.

> L'or foncé `#8a6a2b` du thème clair n'atteint que 4,27:1 sur le parchemin `#f3ecdd` : il sert aux décors, bordures et anneaux de focus (seuil de 3:1 pour les éléments graphiques), tandis que les petits textes dorés utilisent `#725522`. Un contrôle automatique de tous les textes affichés (deux thèmes, 390 et 1366 px) ne relève aucun contraste insuffisant.

### Typographie

- Texte courant et titres : polices système (aucun téléchargement).
- Petits libellés RPG uniquement : **Cinzel** (SIL Open Font License 1.1), hébergée dans `assets/fonts/` (aucune requête vers Google Fonts), avec repli sur des polices à empattements du système. Crédit et licence dans `contenu/mentions-legales.md` et `assets/fonts/OFL.txt`.

### Modifier les libellés RPG

Les titres restent classiques. Le vocabulaire RPG est le texte placé **avant la barre `|`** dans les titres Markdown (`## Origines | Biographie`) : modifie-le ou supprime-le dans le fichier `.md` de la page. Quelques libellés d'interface sont fixes dans `assets/js/rendu.js` (« Fiche de personnage », « Récompenses : », badges « Quête principale / secondaire », filtre des projets) et dans `assets/js/formulaire.js` (notification « Quête mise à jour »).

### Décors et animations

- **Hero** : carte topographique `assets/img/topo.svg` (courbes de niveau originales, très faible opacité), rose des vents en SVG (`assets/js/icones.js`), particules dorées sur un `<canvas>` (`MAX_PARTICLES = 30` dans `interface.js`, en pause quand l'onglet est caché ou que le hero sort de l'écran).
- **Cartes** : coins ornementaux en SVG (variables `--corner-*`), bordure or et léger halo au survol.
- **Séparateurs** : fine ligne dorée avec un losange central, ajoutée automatiquement entre les sections.
- **Jauges** : remplissage segment par segment à l'apparition.
- Tous les décors sont en `aria-hidden="true"`. Avec le réglage système « réduire les animations » (`prefers-reduced-motion`), toutes les animations sont désactivées (`07-animations-responsive.css`, section 27).

## 7. Conformité aux consignes E5

Consignes : <https://ghenry.net/bts/sio/[E5]_Details_Portefolio.php>

| Exigence | Où dans le portfolio | État |
|---|---|---|
| Présentation : photo, biographie, CV PDF, LinkedIn / GitHub, projet professionnel | `contenu/accueil.md`, `contenu/site.md`, `assets/docs/cv.pdf` | CV en place ; photo et textes à compléter |
| Projets en entreprise et académiques : contexte, objectifs, solutions, captures, démos, code source | `contenu/projets.md` + 3 fiches dans `contenu/projets/` | Prêt, à compléter |
| Compétences : langages, outils / frameworks, systèmes et réseaux, bases de données, niveaux | `contenu/competences.md` | Prêt, à adapter |
| Veille : sujet, outils, sources fiables, synthèses régulières, analyse critique | `contenu/veille.md` | Prêt, à compléter |
| Tableau E5 : compétences du référentiel, projets, contexte et durée, PDF officiel | `contenu/tableau-e5.md`, `assets/docs/tableau-synthese-e5.pdf` | PDF à remplacer |
| Alternance : entreprise, poste, maître d'apprentissage, rythme, contrat, missions, évolution | `contenu/alternance.md` | Prêt, à compléter |
| Certifications : éditeurs (Cisco, Microsoft, AWS…), langues, formations, badges, justificatifs | `contenu/certifications.md` | Prêt, à compléter |
| Contact : formulaire, e-mail pro, localisation, disponibilité, réseaux | `contenu/contact.md`, `pages/contact.html` | Envoi à configurer |
| Adaptation à l'option SISR / SLAM | `CONFIG.OPTION` + branches de compétences dédiées | Fait |
| 3 projets détaillés plutôt que 10 survolés | 3 fiches de quête | Fait |
| Responsive (mobile, tablette, ordinateur) | Testé de 320 à 1440 px, sans défilement horizontal | Fait |
| Mentions légales : auteur, contact, hébergeur, crédits | `contenu/mentions-legales.md` | Hébergeur à compléter |
| RGPD : politique de confidentialité, consentement ; aucun cookie donc pas de bandeau | `contenu/confidentialite.md`, case de consentement | Fait |
| Ressources libres de droits | Visuels SVG originaux, police sous licence OFL | Fait (photo : la tienne) |
| SEO : balises meta, titres descriptifs, HTML sémantique, sitemap XML | Toutes les pages, `sitemap.xml`, `robots.txt` | Domaine à renseigner |
| Liens fonctionnels (pas de 404) | Liens internes vérifiés | Fait |
| Licence du code + fichier `LICENSE` | `LICENSE` (MIT) | Fait |
| Accessibilité RGAA : alternatives textuelles, contrastes, clavier | Voir section 8 | Fait |
| Hébergement en ligne + HTTPS | Section 5 | À faire |
| Versionnage Git / GitHub | Section 5 | À faire |
| Nom de domaine (recommandé) | Section 5 | Optionnel |

## 8. Accessibilité, RGPD et licence

- **Accessibilité** : lien d'évitement, navigation complète au clavier, focus visible en or, menu mobile utilisable au clavier (Échap pour fermer), textes alternatifs, décors masqués aux lecteurs d'écran, aucune information portée uniquement par la couleur (icônes et textes sur les badges, statuts et jauges), contrastes AA vérifiés dans les deux thèmes, respect de `prefers-reduced-motion`. Sans JavaScript, chaque page indique où lire sa version texte (fichier Markdown) et le formulaire de contact reste utilisable.
- **RGPD** : aucun cookie, aucun outil de mesure d'audience, aucune ressource chargée depuis un service tiers. Seul le choix du thème est mémorisé dans le navigateur (`localStorage`, clé `theme`). Le formulaire demande un consentement explicite.
- **Licence** : code sous licence MIT (`LICENSE`). La police Cinzel reste sous SIL Open Font License 1.1 ; les contenus personnels restent la propriété de leur auteur.
