# La Réserve des Gourmands
*Cahier de projet — Version 14 — Février 2026*
*À partager à chaque nouvelle session de travail*

---

## 1. Description du Projet

Application web hébergée sur GitHub Pages. Deux utilisateurs partageant le même inventaire en temps réel. Mémoire augmentée pour les stocks de la maison, livre de recettes intelligent et surveillance des circulaires.

**Architecture modulaire :** Même moteur, style et configuration différents selon le projet. Déploiements futurs : Réserve des Bricoleurs, Réserve des Jardiniers.

---

## 2. Règles de Développement

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
- **scripts-config.js** — Variables globales, lireOnglet, ecrireOnglet, auth OAuth2, afficherToast
- **scripts-nav.js** — Navigation, menu burger, accordéons
- **scripts-accueil.js** — Chargement et affichage données accueil
- **scripts-scanner.js** — Scanner, Quagga, Open Food Facts, formulaire Ajouter
- **styles.css** — Les 26 styles UI + classes de mise en page
- **README.md** — Cahier de projet

### 4.2 Hébergement
- GitHub Pages — https://ngjcpvino.github.io/Reservedesgourmands/
- HTTPS automatique — accès caméra autorisé
- Dépôt public (GitHub Pages gratuit)

### 4.3 Données — Google Sheets API
- ID Sheet : 1-BFJlOcyxipKqJZOglcdVzVnUNp8VYoOrcKRMwTR8bI
- Clé API lecture : dans scripts-config.js — ⚠️ À régénérer et sécuriser avant production
- Client ID OAuth2 : 1052424777819-vipdir50gal3d6ht1ob4bd1tmbk6v5hv.apps.googleusercontent.com
- Lecture : clé API simple ✅ fonctionnelle
- Écriture : OAuth2 Google Identity Services ✅ configuré

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
- Google Identity Services — OAuth2 écriture Sheet

### 4.6 Ordre des scripts dans index.html
```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
<script src="scripts-config.js"></script>
<script src="scripts-nav.js"></script>
<script src="scripts-accueil.js"></script>
<script src="scripts-scanner.js"></script>
```

---

## 5. Inventaire des 26 Styles UI

### Navigation (3)
- **style-logo**, **bouton-burger**, **titre-page**

### Boutons (3)
- **bouton-principal** — 4 variantes brun/vert/orange/bleu
- **bouton-confirmer**, **bouton-secondaire**

### Accordéon (3)
- **accordeon-container**, **accordeon-header**, **accordeon-item**

### Badges et Notifications (4)
- **badge-priorite-haute**, **badge-priorite-moyenne**, **badge-info**, **toast-confirmation**

### Formulaires (6)
- **champ-texte**, **liste-deroulante**, **compteur-quantite**, **case-a-cocher**, **toggle**, **filtre-recherche**

### Conteneurs Spéciaux (4)
- **fenetre-camera**, **zone-photo**, **zone-svg**, **carte-recette**

### Listes et Items (3)
- **item-liste-achat**, **item-modifiable**, **etoile-favori**

### Classes de mise en page
- **app-conteneur**, **entete-wrapper/photo/titre**, **menu-overlay/contenu/accordeon**, **accueil-contenu/grille**

---

## 6. Pages de l'Application

### 6.1 Accueil — COMPLÉTÉE ✅
- Photo 80vh, titre clamp, 4 boutons principaux
- 5 accordéons : Stock épuisé, Réserve vide, À consommer bientôt, En spécial, Listes en attente
- Données en temps réel depuis la Sheet

### 6.2 Scanner — EN COURS 🔄

**Étape 1 — COMPLÉTÉE ✅**
- 3 boutons : Ajouter (brun), Consommer (orange), Trouver (vert)
- Quagga avec confirmation 3 lectures
- Saisie manuelle en option
- Recherche produit dans Sheet + Open Food Facts
- Affichage résultat avec photo, nom, marque, code

**Étape 2 — EN COURS 🔄**
- Formulaire Ajouter codé — à tester
- OAuth2 configuré — à tester
- Bouton Consommer — à faire
- Bouton Trouver — à faire

**PROCHAINE ÉTAPE : Tester le formulaire Ajouter + OAuth2, puis coder Consommer**

### 6.3 Trouver — À FAIRE
### 6.4 Consommer — À FAIRE
### 6.5 Listes d'Achats — À FAIRE
### 6.6 Recettes — À FAIRE (import Paprika 3 — 167 recettes)
### 6.7 Configuration — À FAIRE

---

## 7. Sources de Données Externes
- Open Food Facts — nom, marque, photo — ✅ intégré
- feed-me — prix courant Metro — à intégrer
- flippscrape — rabais circulaires par code postal — à intégrer

---

## 8. Emplacements, Catégories, Magasins

### Emplacements
- Cuisine : Frigo LG, armoires, îlot, garde-manger, porte épices
- Dépense/Buanderie : Armoire verte IDÅSEN, Armoires brunes 1 et 2, tablettes
- Sous-sol La Réserve : Congélateur + 4 bibliothèques IVAR

### Catégories
- Pain, Fromages/charcuterie, Viande (4 sous-cat), Poissons, Fruits/légumes, Laitiers, Garde-manger, Breuvages, Collations, Emballages, Nettoyage, Médicaments, Hygiène, Surgelés, Épices

### Magasins
- Épicerie : IGA, Metro, Super C, Costco
- Pharmacie : Jean Coutu, Familiprix, Pharmaprix
- Boutique : William J. Walter Saucissier

---

## 9. SVG Emplacements

### Complétés
- Armoire verte IKEA IDÅSEN, Armoires brunes 1 et 2, Frigo LG French Door
- Armoires basses noires, Armoires murales bois, Armoire coin noire SEKTION, Bibliothèque IVAR

### Restant à modéliser
- Garde-manger, Îlot, Porte épices, Buanderie, Congélateur sous-sol

---

## 10. Sécurité — Points à régler

- ⚠️ Clé API Google visible dans scripts-config.js — à sécuriser avant production
- ⚠️ Client ID OAuth2 visible dans scripts-config.js — acceptable pour usage personnel
- Dépôt GitHub public — ne jamais mettre mots de passe dans les fichiers
- ⚠️ Sauvegarde automatique à reconfigurer hors GAS

---

## 11. Journal des Sessions

### Session Février 2026 — nuit blanche productive (v11)
- Configuration complète, 26 styles, structure technique GAS

### Session Février 2026 — blocs de 15 minutes (v12)
- Tous les fichiers GAS créés, Sheet initialisée

### Session Février 2026 — migration GAS → GitHub Pages (v13)
- Migration complète, connexion Sheets API lecture fonctionnelle
- Page Scanner étape 1 complétée

### Session Février 2026 — restructuration et OAuth2 (v14)
- Scripts séparés en 4 fichiers modulaires
- OAuth2 configuré dans Google Cloud Console
- Formulaire Ajouter codé dans scripts-scanner.js
- Écriture Sheet via ecrireOnglet() dans scripts-config.js
- PROCHAINE SESSION : tester formulaire Ajouter, puis coder Consommer et Trouver
