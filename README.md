# La Réserve des Gourmands
*Cahier de projet — Version 13 — Février 2026*
*À partager à chaque nouvelle session de travail*

---

## 1. Description du Projet

Application web hébergée sur GitHub Pages. Deux utilisateurs partageant le même inventaire en temps réel. Mémoire augmentée pour les stocks de la maison, livre de recettes intelligent et surveillance des circulaires.

**Architecture modulaire :** Même moteur, style et configuration différents selon le projet. Déploiements futurs : Réserve des Bricoleurs, Réserve des Jardiniers.

---

## 2. Règles de Développement

**Ces règles s'appliquent automatiquement à chaque session.**

- Toujours utiliser les variables CSS — jamais de valeur en dur
- Toujours respecter --rayon pour les coins
- Toujours respecter la palette définie — jamais inventer une couleur
- Toujours respecter les espacements --espace-xs/s/m/l/xl
- Toujours respecter les tailles de police définies
- Jamais toucher au styles.css sauf correction approuvée
- iPhone SE d'abord — tester chaque élément à 375px
- Zone tactile minimum --taille-tactile (44px) sur tous les boutons
- Toujours joindre styles.css à chaque demande de développement
- Jamais coder sans accord explicite du client
- Quand un bout de code est envoyé avec l'instruction 'réécrit' — réécrire le bloc complet, prêt pour copier-coller, sans explication technique
- Expliquer ce qui va être fait AVANT de le faire — le client valide, ensuite on code
- Les explications sont claires et fonctionnelles — pas de jargon technique, pas de références à des lignes de code

---

## 3. Identité Visuelle

### 3.1 Direction artistique

- Style : moderne, épuré, rectangles assumés — pas de coins ronds excessifs
- Fond général : blanc
- Conteneurs : blancs avec ombre douce — pas de bordures rigides, pas de transparence
- En-tête : photo 100% largeur du contenu, hauteur 80vh
- Titre "RÉSERVE DES GOURMANDS" sur 2 lignes, en majuscule blanc avec ombre sur la photo
- Photo de fond : jason-leung (Unsplash) — URL intégrée directement
- Taille minimum de texte partout dans le site : 15px

### 3.2 Menu Burger

- Burger à gauche, fixe en haut de l'écran (classe .bouton-burger-fixe)
- Quand ouvert : panneau qui glisse depuis la gauche, fond --couleur-brun-fonce, texte blanc
- Largeur automatique selon le texte le plus long
- Items du menu en accordéon — un seul ouvert à la fois, tous fermés à l'ouverture
- Se ferme automatiquement au clic en dehors du menu

### 3.3 Typographie

- Police : Cabinet Grotesk (Fontshare)
- Poids autorisés : Thin (100), Extralight (200), Light (300), Regular (400), Medium (500) — jamais Bold ou plus
- Taille minimum : 15px (--taille-item-liste) partout dans le site

### 3.4 Palette de couleurs

- --couleur-creme : #f5efe6
- --couleur-beige : #e8ddd0
- --couleur-beige-moyen : #d4c4b0
- --couleur-brun-clair : #a08060
- --couleur-brun : #6b4f3a
- --couleur-brun-fonce : #3d2b1f
- --couleur-accent-rouge : #c0392b
- --couleur-accent-orange : #d4820a
- --couleur-accent-vert : #2e7d52
- --couleur-accent-bleu : #4e679c
- --couleur-blanc : #ffffff
- --couleur-fond : #ffffff

### 3.5 Variables de base

- --rayon : 2px
- --taille-tactile : 44px
- --burger-top : 28px
- --burger-left : var(--espace-l)
- --espace-xs: 4px / --espace-s: 8px / --espace-m: 12px / --espace-l: 16px / --espace-xl: 20px
- --taille-accordeon-header : 16px
- --taille-item-liste : 15px (minimum partout dans le site)

---

## 4. Structure Technique

### 4.1 Fichiers GitHub

- **index.html** — Structure HTML de toutes les pages
- **scripts.js** — JavaScript
- **styles.css** — Les 26 styles UI + classes de mise en page
- **README.md** — Cahier de projet

### 4.2 Hébergement

- GitHub Pages — https://ngjcpvino.github.io/Reservedesgourmands/
- HTTPS automatique — accès caméra autorisé
- Dépôt public (GitHub Pages gratuit)

### 4.3 Données — Google Sheets API

- ID Sheet : 1-BFJlOcyxipKqJZOglcdVzVnUNp8VYoOrcKRMwTR8bI
- Clé API : stockée dans scripts.js — ⚠️ À régénérer et sécuriser (note v13)
- Lecture : clé API simple (déjà fonctionnelle)
- Écriture : OAuth2 — à configurer lors du module Ajouter/Consommer

### 4.4 Onglets Google Sheet

- **Produits** — ID, Nom, Marque, CodeBarre, Categorie, Emplacement, QteStock, QteReserve, QteMinimum, DateExpiration, Notes, Photo, Actif
- **Emplacements** — ID, Nom, Zone, Description, Actif
- **Categories** — ID, Nom, DureeConservation, Actif
- **Magasins** — ID, Nom, Type, Actif
- **Recettes** — ID, Nom, Portions, TempsPrepMin, TempsCuissonMin, Instructions, Notes, Photo, Favori, Actif
- **Ingredients** — ID, RecetteID, ProduitID, NomIngredient, Quantite, Unite
- **Listes** — ID, Nom, Type, Statut, DateCreation
- **Configuration** — Cle, Valeur
- **Utilisateurs** — ID, Nom, Email, Actif

### 4.5 Librairies externes

- Cabinet Grotesk — Fontshare
- Quagga 0.12.1 — scan code-barres (cdnjs)

### 4.6 Responsive Design

- iPhone SE (375px) en premier — le plus contraignant
- iPad ensuite, PC en dernier (max-width 700px centré)
- Une seule feuille de style, trois comportements

---

## 5. Inventaire des 26 Styles UI

### Navigation (3)
- **style-logo** — Zone du logo
- **bouton-burger** — Menu hamburger fixe en haut gauche, 44px + classe bouton-burger-fixe
- **titre-page** — Titre de chaque page

### Boutons (3)
- **bouton-principal** — Icône 75px sans texte, 4 variantes de couleur (brun/vert/orange/bleu), fond à 0.75
- **bouton-confirmer** — Action principale
