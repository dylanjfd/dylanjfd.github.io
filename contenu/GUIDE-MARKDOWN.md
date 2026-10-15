# Guide de rédaction des pages en Markdown

Tout le texte du portfolio se trouve dans ce dossier `contenu/` : **un fichier `.md` par page**. Les pages HTML ne contiennent que la structure (en-tête, menu, pied de page) : `assets/js/rendu.js` lit le fichier Markdown de la page et l'affiche avec le thème « Quête d'aventure ».

| Page | Fichier à modifier |
|---|---|
| Accueil (`index.html`) | `accueil.md` |
| Projets | `projets.md` |
| Projets détaillés | `projets/projet-1.md`, `projet-2.md`, `projet-3.md` |
| Compétences | `competences.md` |
| Veille | `veille.md` |
| Alternance | `alternance.md` |
| Certifications | `certifications.md` |
| Tableau E5 | `tableau-e5.md` |
| Contact | `contact.md` (le formulaire lui-même est dans `pages/contact.html`) |
| Mentions légales, confidentialité, plan du site | `mentions-legales.md`, `confidentialite.md`, `plan-du-site.md` |
| Réglages communs (ton nom, e-mail, liens, pied de page) | `site.md` |

## Voir ses modifications

Le navigateur refuse de lire les fichiers `.md` quand on ouvre `index.html` par un double-clic. Lance plutôt le serveur local : **double-clic sur `outils/serveur-local.bat`** (ou extension *Live Server* de VS Code). Modifie un fichier `.md`, enregistre, puis actualise la page (F5).

## 1. Les bases

```markdown
Un paragraphe. Les lignes qui se suivent forment un seul paragraphe.
Laisse une ligne vide pour commencer un nouveau paragraphe.

**gras**, *italique*, `code`, [un lien](pages/projets.html), [un site](https://www.cnil.fr/)

- liste à puces (affichée avec des losanges dorés)
- deuxième élément
  - sous-élément (2 espaces de retrait)

1. liste numérotée
2. deuxième élément

> **Bilan personnel :** une citation devient un encadré doré.
```

- **Liens** : écris les chemins **depuis la racine du site** (`pages/projets.html`, `assets/docs/cv.pdf`), quelle que soit la page.
- **Saut de ligne** dans un paragraphe : termine la ligne par `\`.
- **Commentaires** `<!-- … -->` : ignorés à l'affichage (pratique pour te laisser des notes).

## 2. Cases à compléter

Tout texte entre **doubles crochets** s'affiche encadré en pointillés dorés : c'est un texte à remplacer.

```markdown
[[Présente-toi en 4-5 lignes…]]   →   Je m'appelle Dylan, j'ai 19 ans…
```

Remplace le texte **et retire les crochets**. La console du navigateur (F12) indique combien de cases restent sur la page.

## 3. Variables communes

Écris-les une seule fois dans `site.md`, elles sont remplacées partout :

| Variable | Valeur |
|---|---|
| `{{nom}}` | ton nom (`site.md`) |
| `{{email}}`, `{{github}}`, `{{linkedin}}` | tes coordonnées (`site.md`) |
| `{{option}}` | SISR ou SLAM (réglage `OPTION` dans `assets/js/main.js`) |

## 4. Titres et petits libellés RPG

```markdown
# Journal de quêtes | Projets          ← titre de la page (un seul par fichier)
## Origines | Biographie               ← titre de section
### Étape I | À court terme            ← titre de carte, d'étape, de compétence…
```

Le texte **avant la barre `|`** est le petit libellé RPG affiché au-dessus du titre ; le titre lui-même reste classique. Sans barre, il n'y a pas de libellé.

Options possibles en fin de titre :

- `{centre}` : section centrée (ex. une invitation à consulter une autre page) ;
- `{masque}` : titre lu par les lecteurs d'écran mais non affiché ;
- `{icone=serveur}` et `{option=SISR}` : pour les branches de compétences (voir plus bas).

## 5. En-tête de fichier

Quelques réglages se placent tout en haut du fichier, entre deux lignes `---` :

```markdown
---
mise-en-page: fiche          (accueil, fiche, texte, contact ; rien = page standard)
fil-ariane: Projet 1         (texte court affiché dans le fil d'Ariane)
parent: [Projets](pages/projets.html)
---
```

## 6. Blocs spéciaux

Un bloc commence par `::: nom` et se termine par `:::`. Les blocs peuvent s'imbriquer (le `:::` ferme le dernier bloc ouvert).

### Boutons — `::: actions`

```markdown
::: actions
- [Voir mon CV](assets/docs/cv.pdf)
- [Voir mes projets](pages/projets.html)
:::
```

Le premier lien est le bouton doré ; les suivants sont secondaires. Un lien vers un PDF reçoit l'icône d'un œil : le clic affiche le document dans une fenêtre, avec un bouton « Télécharger » (sur mobile, le PDF s'ouvre dans un nouvel onglet).

### Deux colonnes — `::: colonnes`

Chaque `## Surtitre | Titre` à l'intérieur ouvre une colonne.

### Cartes — `::: cartes` (et `::: cartes numerotees`)

```markdown
::: cartes
### Étape I | À court terme
Texte de la carte.

### Codex | [Veille](pages/veille.html)
Un titre en lien rend toute la carte cliquable.
:::
```

Juste sous le titre d'une carte, les lignes `date:` et `source:` s'affichent en petit (synthèses de veille).

### Fiche de personnage — `::: fiche` (accueil)

```markdown
::: fiche
niveau: 2
photo: assets/img/photo.jpg

- Rigueur : 4
- Curiosité : 5
:::
```

`niveau` = année de BTS ; `photo` vide = illustration par défaut ; attributs notés **sur 5** (la jauge suit).

### Frise — `::: chronologie`

```markdown
::: chronologie
- 2025 – 2027 | BTS SIO — option {{option}} | Lycée, ville | en cours
- 2022 – 2025 | Cuisinier | Gestion du stress, organisation d'équipe | terminé
:::
```

Colonnes séparées par `|` : date, titre, précision, puis un statut facultatif affiché en badge : `terminé` (losange et tracé illuminés en or), `en cours` (losange vide, tracé en pointillés), `prévu` ou `à venir`.

### Informations — `::: infos`

```markdown
::: infos
Formation: BTS SIO — Lycée, ville
Localisation: Rennes (35)
:::
```

Chaque ligne `Libellé: valeur` devient une ligne du tableau d'informations.

### Projets — `::: quetes` et `::: legende`

```markdown
::: quetes
### Titre du projet
type: principale          (principale = entreprise, secondaire = formation)
statut: terminée          (terminée ou en cours)
fiche: pages/projets/projet-1.html
contexte: Alternance — 1re année · Entreprise · 2026
technologies: Windows Server, Active Directory, GLPI
récompenses: Gérer le patrimoine informatique, Mettre à disposition un service

Description du projet en deux phrases.
:::
```

Le filtre (« Quêtes principales / secondaires ») est créé automatiquement.

### Page projet — `::: badges`, `::: etapes`, `::: capture`, `::: encart`, `::: navigation`

```markdown
::: badges
principale, terminée
:::

::: etapes
### Installation et configuration
Ce qui a été fait.
:::

![Légende de la capture](assets/img/projet-1-capture.png)

::: encart technologies
## Équipement | Technologies
- GLPI
- Windows Server
:::

::: navigation Navigation entre les projets
- [Retour aux projets](pages/projets.html)
- [Projet suivant](pages/projets/projet-2.html)
:::
```

- Une image seule sur sa ligne devient une figure avec légende. Tant que tu n'as pas la capture, garde le bloc `::: capture` (emplacement en pointillés).
- Types d'encart : `competences`, `technologies`, `ressources` (icônes code / vidéo / document selon le texte), `coordonnees`, ou rien.
- Mots-clés de badges : `principale`, `secondaire`, `terminée`, `en cours`, `prévue`, `débloqué`, `verrouillé`.

### Compétences — `::: competences`

```markdown
::: competences
### Branche I | Systèmes {icone=serveur option=SISR}
- Windows Server — AD DS, DNS, DHCP : 3
- Scripts d'administration — PowerShell : 1
:::
```

Niveau en fin de ligne : `1` Notions, `2` Intermédiaire, `3` Avancé, `4` Maîtrise (la jauge et le libellé suivent). Icônes : `serveur`, `reseau`, `bouclier`, `code`, `application`, `base`, `outils`, `langue`. `{option=SISR}` ou `{option=SLAM}` limite la branche à une option.

### Veille — `::: sources`

```markdown
::: sources
- [CERT-FR](https://www.cert.ssi.gouv.fr/) — Alertes et avis de sécurité
:::
```

### Alternance — `::: alternance` et `::: chronologie`

```markdown
::: alternance
## Contrat d'apprentissage · 2026 – 2028 | Poste — Entreprise
statut: en cours
Entreprise: Nom de l'entreprise, ville
Poste: Technicien support & systèmes
Maître d'apprentissage: Fonction du maître d'apprentissage
Rythme: 2 jours à l'école, 3 jours en entreprise
Dates du contrat: Septembre 2026 – août 2028

### Missions confiées
- Mission 1

### Projets menés en alternance
- [Titre du projet](pages/projets/projet-3.html) — précision

### Technologies utilisées
technologies: GLPI, Active Directory

### Recommandation
> « Appréciation du maître d'apprentissage. »
> — Fonction du maître d'apprentissage

[Voir tous mes projets](pages/projets.html)
:::

::: chronologie
- 2026 – 2027 | 1re année — titre | Précision | en cours
- 2027 – 2028 | 2e année — titre | Précision | à venir
:::
```

Le lien seul en dernière ligne s'affiche en bas de la fiche. Dans `::: chronologie`, une ligne par étape : date | titre | précision | statut.

### Certifications — `::: succes`

```markdown
::: succes
### Cisco CCNA — Introduction to Networks
statut: obtenue           (obtenue = succès débloqué ; en cours ou prévue = verrouillé)
date: juin 2026
type: Certification éditeur
justificatif: [Attestation (PDF)](assets/docs/attestation-ccna.pdf)

Courte description.
:::
```

### Tableau E5 — `::: tableau` et `::: competences-e5`

```markdown
::: tableau Légende du tableau
| Réalisation | Contexte | Période | C1 Patrimoine | C2 Incidents |
|---|---|---|:-:|:-:|
| **En formation** | | | | |
| [Projet 2](pages/projets/projet-2.html) | En équipe | 2026 | x | |
:::
```

Un `x` = coche dorée ; une ligne dont seule la première case est en **gras** = intertitre ; les colonnes `C1` à `C6` reçoivent l'intitulé officiel de la compétence pour les lecteurs d'écran.

### Plan du site — `::: plan` · Note à toi-même — `::: note`

- `::: plan` : chaque `## Titre` devient une carte de liens.
- `::: note` : encadré pointillé « à adapter », à supprimer une fois la page terminée.

## 7. Ajouter une page

1. Copie une page HTML existante (ex. `pages/veille.html`) sous un nouveau nom.
2. Dans cette copie, change `<title>`, la `description` et l'attribut `data-contenu="contenu/ma-page.md"` de la balise `<body>`.
3. Crée `contenu/ma-page.md`.
4. Ajoute la page au menu (dans chaque page HTML), à `plan-du-site.md` et à `sitemap.xml`.
