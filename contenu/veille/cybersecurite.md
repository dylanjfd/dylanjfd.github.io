---
mise-en-page: fiche
fil-ariane: Veille cybersécurité
titre-onglet: Veille cybersécurité : les joueurs, cibles des cybercriminels
parent: [Veille](pages/veille.html)
titre-seo: Veille cybersécurité : les joueurs ciblés — Dylan JOFFREDO
description: Veille cybersécurité BTS SIO SISR : pourquoi les joueurs sont une cible favorite des cybercriminels et comment protéger une salle de jeu.
---

<!--
  FICHE DE VEILLE — CYBERSÉCURITÉ (pages/veille/cybersecurite.html) — « Codex »
  Même structure que contenu/veille/systeme.md (voir les explications en tête de ce fichier).
  - Les mesures de protection de la salle, la procédure de l'atelier et les tests en machines
    virtuelles sont dans la fiche projet pages/projets/labo-parc-gaming.html.
  - Synthèses : entre les marqueurs SYNTHESES-CYBERSECURITE, dans l'ordre chronologique (la plus récente en dernier).
-->

# Codex · Veille cybersécurité | Pourquoi les joueurs sont-ils l'une des cibles favorites des cybercriminels ?

Ma veille cybersécurité : les menaces qui visent les joueurs, et ce qu'elles changent pour un lieu de jeu comme Reboot.

::: badges
cybersécurité, en cours
:::

::: infos
Catégorie: Cybersécurité
Cadre: Veille en formation (BTS SIO)
Période: Depuis octobre 2026
Projet lié: Reboot, salle gaming et atelier de réparation
:::

## Prologue | Introduction

### Pourquoi les cybercriminels s'attaquent-ils aux joueurs ?

Les joueurs réunissent plusieurs éléments qui en font des cibles faciles et rentables :

- **Des comptes qui valent de l'argent.** Un compte Steam avec des jeux, des objets rares ou des skins (comme ceux de CS2) peut être revendu ou vidé contre de l'argent réel. Les comptes Discord volés servent aussi à piéger les amis de la victime.
- **Des téléchargements risqués.** Cheats, mods, versions crackées : beaucoup de joueurs téléchargent des fichiers depuis des sources non officielles. Ces fichiers sont le premier moyen de diffusion des logiciels malveillants. Certains « cheats » demandent même de désactiver l'antivirus pour fonctionner.
- **Une confiance dans la communauté.** Un lien partagé sur Discord, une vidéo YouTube, un message du type « tu peux tester mon jeu ? » : les joueurs font confiance à leur communauté, ce que les attaquants exploitent.
- **Un public jeune et nombreux.** Des millions de joueurs, souvent peu sensibilisés à la cybersécurité, sur des jeux très populaires (Roblox, Fortnite, GTA…).
- **Des PC puissants.** Leurs cartes graphiques peuvent être détournées en secret pour miner de la cryptomonnaie.
- **Des moyens de paiement enregistrés** sur les plateformes de jeu.

Résultat : selon une étude de la société Flare, 41 % des infections par des voleurs de données analysées venaient d'un fichier lié au jeu vidéo.

## Question de la quête | Problématique

> **Comment protéger les joueurs et un lieu de jeu comme Reboot face à ces menaces ?**

## Bestiaire | Comprendre les menaces

- **Voleurs de données (infostealers)** — des logiciels comme Lumma, la famille la plus fréquente dans l'étude de Flare, récupèrent en silence les identifiants enregistrés sur le PC.
- **Faux cheats, mods et cracks piégés** — le fichier promet un avantage en jeu ou un jeu gratuit, mais installe un logiciel malveillant.
- **Arnaques Discord** — un contact demande « tu peux tester mon jeu ? » et envoie un fichier piégé ; souvent, son propre compte a déjà été volé.
- **Faux sites d'échange de skins** — des copies de vrais sites qui récupèrent les identifiants Steam au moment de la connexion.




## Entrées du codex | Synthèses

Une synthèse par mois, de la plus ancienne à la plus récente : l'actualité, puis mon analyse.

::: cartes depliables
<!-- SYNTHESES-CYBERSECURITE:START -->
### Entrée I | Joueurs : l'impatience et la confiance exploitées à grande échelle
date: Novembre 2026
sources: [Huntress — l'engouement pour GTA VI mène aux malwares](https://www.huntress.com/blog/fake-gta6-download-malware-analysis), [CyberSecurityNews — un faux mod Minecraft vole identifiants et cookies](https://news.google.com/rss/articles/CBMiXkFVX3lxTE0tdHNGdEVQUEN5YVZGdWc4dWhWYS0tV0ZjSVRkSEJYSmQyT0JVUXJTdjFWcWNROG52dDdzWE1oRmNxSlk4ZzhPeVNORUQ1ZjNjQ1VFeEFwYV9uLUlYZmfSAWNBVV95cUxONHhWTTZuSzlrNm1yVndCMnVzTW9helZRb0tpRnRhZEUxTVVaYmtwZmZ4LUctZ25McC1TVkxfWTVPWlE0MG9Oa19Ua254VzMycDJhZ0lLakNDUkdNdGgyVWN4RXc?oc=5), [La Crème Du Gaming — de faux émulateurs PS5 volent les données des joueurs](https://news.google.com/rss/articles/CBMihgJBVV95cUxPVG9JX2w4SlNyLXp1LUItQUxQMkRJTnZfUTBUMjJ5VFpGQU1yZFpWQm1NZlNZYk4xUjJsQkJvQkR1N2VrRnJIZnNNR0JDYWJoNTY4eldwZFhWRFNlOUZqRUpPcW15VmIxVjZYSFltckZnSDl6emE1blVJOVRGczhycF9DM2w1M2VETTl2RVdPc3kybHVHYkt5ZjlMMXVhTkJJVkxEWkdLcUE3TFlkUFZWNGRBS0VReVg4UHNWV3drd2k1ZjVsV0xDX1NsaG5aQ1pSaWttYm1TRDFUaldwek1YRGt6bi1yekdoYmtpZW5mZTNaTi1QblJ3ZXZVQjBRM1k4bFQyV3Nn?oc=5), [Tom's Guide — fuite de données chez Steam](https://www.tomsguide.fr/fuite-de-donnees-chez-steam-vos-infos-personnelles-sont-en-danger-gare-au-phishing/), [BleepingComputer — le lanceur PC de NIKKE piraté](https://www.bleepingcomputer.com/news/security/nikke-pc-game-launcher-hacked-to-spread-remote-access-data-stealing-malware/), [GBHackers — des malwares déguisés en jeux et logiciels populaires](https://news.google.com/rss/articles/CBMiWEFVX3lxTFBLQlphSmZYc1ZRVl9RS0ZjU2p3cUFXeUtCM0s2TEttQjNkOXBVUERWWC12ZnBGMmxYaXJ6UWtnSjBMS3F1U1poQjJOd1EtTGNfdndRaXZCMlnSAV5BVV95cUxPaUZlcGtTS1h0Sko3bFY0TkpmR2EtMXkxclp1QzhqdXRzZENMOE1QOG9NMlF0endmZHBuUnQ5SUNMWFcwTVp1cXBWal9GbXowRjNlWFJ2dVFzamk4cVlB?oc=5), [The Times of India — un kit de malware à 200 $ contre les joueurs de GTA 6](https://news.google.com/rss/articles/CBMi_AFBVV95cUxNVXk0dTQ0S3RuRDJWM09yTTNUbHkwOXE2X0dTY0lYcEFsRmV0Yy00OEtLSnJxYjBvQXlvcnQzc2tLUVM0LVNDS1MxaExUZXRDV2VqTFZFUjhlNXc4bGJ6NzExaWVYSko4RFBzalNJa2NjT052OTJ4NmhRbWZVUkEwWEM1NTRCa3l1RkJSdU5YcEg4dHVsZGIxWExwZ0c2djlNd0JKRmR3djg5Y3FuVmp0cnhnMDB0c3ZRYzBPcWczLUxucXVSNU1HcDRFTkpEeFJzZlJZU3RzdzlROUZiOS11RFhIYzJXdjluWFlhNFRDZVpwa3FnYnFpdUNIXzHSAYICQVVfeXFMTjBOTUI1N2pvOUhJWW5lbnRyUGc2V1hZQUlqZkZmRE1TNUI4OXdBWHNRRnFMU1BKenZodkxucmtWeVZ4Tjlvb080V1p5c1JleXdCdkkwZ3hJekZScFdzSXBfWVZfYlk5ZjRjd2ZLbGFCUjB4OC1fd25IR1JmOUp5Q3FkUHNJVFU0azlrSTd6MDNNME44QjZuc0gzcVF1aGpVZG5mdXV1Y1MzN1QzWlZqbDVtTGdWUEt6YVpnWncycUJnelpsV2d6MXo0UVljdEp5NnpOUnJhbVh1RFBHQVYzTXpvN2ZMQXQ1WE1oZDBFMDFhUGRjTkE0dnMyXzIxei03RmVn?oc=5), [GBHackers — 8 000 joueurs infectés par des jeux piégés](https://news.google.com/rss/articles/CBMihwFBVV95cUxNMDJ0Ung3NWE1endzMWNJUXdIUmJtZDd5RU1ZbVJVa0xOcHY1a21rOXk4LWd5TlhoeXR2RHBuRVVaNktUSFEwdk5TcTF0NXgzdkZ1QTRmZTQwcXVQX1lvaXg1bC1ra09rNTZELVpwbG1JeERJdkl6QzRnUzZlV1NRQVRUOHhYcWvSAYwBQVVfeXFMUGJwOG9aUndPOFMyQy15UVFwSXJQT29OOVRrQ01fYjNLeHlMYWlkTGc3RmtxenpNTzQ2SkdFRFdaUHl6SjRfeWpVYnJVNHJYU2s0Tm1QaUZ0dVVYQXdDSWFkZl9SVzllM25KWS1DOUlZV0FvTTRyWVRtVTRXQlJjT0pJOGNPS19RMDRfS1k?oc=5), [CyberSecurityNews — 355 domaines diffusent de faux lanceurs de GTA 6](https://news.google.com/rss/articles/CBMiZEFVX3lxTE5HdkgxU0lwcWFQSHJTQ1Q0OEhlSDJCRXc2Tk5lNTJEV3BCRjdUQnJaZGNQa0hKTzBHeHZFSjI0UnFWOFdfYlh0ODQxVERISlljSU1HR1hQcDZtTUphQnhuVURNUm3SAWpBVV95cUxOVzJPVUgxbEYta1lNRmVWTV9qelpYaDdFWDNiUUtFS1lORTFMM2o3NFE2VDkxOVpnZWtkNEN3QktxdVFYdHlTaTkwOHVGZTV3elF6VUVwdnNUX2wwZDl2NHZMb3FUT3VmSklB?oc=5), [Infosecurity Magazine — l'ICO met en garde contre les arnaques GTA 6](https://www.infosecurity-magazine.com/news/ico-gta-6-scam-warning-release/)

**Résumé :** De faux téléchargements de GTA VI, un faux mod Minecraft, de faux émulateurs PS5 et des jeux piratés installent des chevaux de Troie et des voleurs de données, et même le lanceur officiel de NIKKE a diffusé un malware. Steam a aussi subi une fuite de données chez un prestataire. Avec la sortie de GTA VI le 19 novembre, les arnaques changent d'échelle : un kit vendu environ 200 $, 355 domaines qui diffusent de faux lanceurs, huit jeux Steam piégés qui ont permis de voler au moins 220 000 $ en cryptomonnaie, et une mise en garde de l'ICO, l'autorité britannique de protection des données.

**Mon analyse :** Les joueurs sont des cibles faciles parce qu'ils veulent vite obtenir des jeux, des mods ou des émulateurs, et les téléchargent souvent hors des sources officielles. Les cybercriminels y cachent des chevaux de Troie et des voleurs de données pour récupérer mots de passe, comptes et données bancaires, voire détruire les fichiers ; au moment de sa découverte, le faux mod Minecraft n'était détecté par aucun antivirus. Les joueurs sont aussi ciblés par des sources qui leur semblent fiables : le lanceur officiel de NIKKE a diffusé un virus resté plus d'un mois sans être détecté, et la responsabilité en revient à l'éditeur. Même sans erreur de leur part, ils sont exposés quand une plateforme se fait voler leurs données, ce qui ouvre la porte au phishing. De faux jeux et cracks installent aussi en silence des programmes qui revendent la connexion et la puissance du PC. Pour la première fois, un éditeur s'attaque à la source : Nintendo a fait supprimer 144 dépôts GitHub qui hébergeaient des firmwares de puces de piratage pour la Switch, mais il reste à voir si cela freine vraiment le piratage, ou si ces fichiers réapparaissent ailleurs, sur des sites encore moins sûrs pour les joueurs. Avec la sortie de GTA VI, les arnaques changent d'échelle : un kit vendu environ 200 $ permet à n'importe qui de piéger les joueurs, 355 domaines diffusent de faux lanceurs, et l'affaire des jeux Steam piégés montre ce que les pirates cherchent : les portefeuilles crypto et les mots de passe enregistrés. Ce qui change par rapport aux semaines précédentes, c'est l'industrialisation : des kits prêts à l'emploi, des centaines de domaines et des bots qui choisissent leurs victimes. Les joueurs sont ciblés parce qu'ils sont nombreux, impatients, et que leur PC contient souvent de l'argent. La sortie du jeu n'a pas mis fin aux arnaques : comme il n'existe toujours pas de version PC, l'attente continue, et les faux lanceurs avec. Le sujet dépasse donc le jeu vidéo : un PC de joueur infecté expose aussi la messagerie, les comptes bancaires et parfois les accès professionnels. Pour un joueur, les conseils de l'ICO restent la meilleure défense : un mot de passe par compte, la double authentification, ne rien télécharger en dehors des boutiques officielles, même si elles ne sont pas infaillibles (les jeux piégés étaient publiés sur Steam), et ne jamais désactiver l'antivirus pour installer quelque chose. Sur un parc, ma réponse serait des comptes standards sans droits d'administrateur, les clés USB bloquées et Defender avec la protection contre les applications indésirables (PUA) activée par GPO ; en cas d'infection, j'isolerais le poste, je changerais les mots de passe depuis un poste sain, puis je réinstallerais le système.
<!-- SYNTHESES-CYBERSECURITE:END -->
:::


## Bibliothèque | Sources

Des organismes publics, des éditeurs de sécurité et la presse spécialisée, lus automatiquement chaque jour et recoupés entre eux avant chaque synthèse.

::: tableau Sources de la veille : type et fiabilité
| Source | Type | Pourquoi elle est fiable |
|---|---|---|
| [ANSSI / CERT-FR](https://www.cert.ssi.gouv.fr/) | Agence de l'État | Centre gouvernemental de veille et d'alerte : il publie les alertes et avis de sécurité officiels en France. |
| [Cybermalveillance.gouv.fr](https://www.cybermalveillance.gouv.fr/) | Dispositif public | Dispositif national d'assistance aux victimes : il décrit les arnaques en cours et les bons réflexes pour le grand public. |
| [BleepingComputer](https://www.bleepingcomputer.com/) | Presse spécialisée, en anglais | Site de référence sur les logiciels malveillants et les fuites de données, souvent cité par la presse et les chercheurs. |
| [ESET WeLiveSecurity](https://www.welivesecurity.com/fr/) | Blog d'éditeur de sécurité | Analyses des chercheurs d'ESET à partir de leurs propres détections : source de première main, mais d'un éditeur d'antivirus, donc à recouper. |
| [Malwarebytes Labs](https://www.malwarebytes.com/blog) | Blog d'éditeur de sécurité, en anglais | Recherches de Malwarebytes sur les arnaques et les logiciels malveillants qui visent le grand public ; même réserve que pour ESET. |
| [ZATAZ](https://www.zataz.com/) | Site d'actualité spécialisé | Média français consacré à la cybercriminalité, qui suit de près les fuites de données et la revente de données volées. |
| [Numerama — Cyberguerre](https://www.numerama.com/cyberguerre/) | Presse spécialisée | Rubrique cybersécurité d'un média français consacré au numérique, écrite par des journalistes pour le grand public. |
| [Infosecurity Magazine](https://www.infosecurity-magazine.com/) | Presse professionnelle, en anglais | Magazine britannique consacré à la sécurité informatique, dont les articles citent les chercheurs et les entreprises concernées. |
| [Tom's Guide — Sécurité](https://www.tomsguide.fr/category/web/securite/) | Presse grand public | Rubrique sécurité d'un média high-tech : elle relaie les fuites de données et les arnaques qui touchent les particuliers, dont les joueurs ; source de relais, à recouper avec la source d'origine. |
:::


## Du codex au terrain | Mise en pratique

> Les mesures de protection de la salle, la procédure de l'atelier pour un PC infecté et mes tests en machines virtuelles sont dans ma fiche projet [Labo : gestion et sécurisation d'un parc de PC gaming](pages/projets/labo-parc-gaming.html).

::: encart
## Codex | Liens avec mes autres veilles
- **Système** — la restauration au redémarrage efface un logiciel malveillant installé par un client : [voir ma veille système](pages/veille/systeme.html).
- **Réseau** — les données des clients de l'atelier sont des données personnelles : où les stocker, et sous quelle loi ? [Voir ma veille réseau](pages/veille/reseau.html).
:::

::: encart competences
## Récompenses | Compétences E5 mobilisées
- Organiser son développement professionnel
:::

::: navigation Navigation entre les veilles
- [Veille précédente : réseau](pages/veille/reseau.html)
- [Retour à la veille](pages/veille.html)
:::
