# La Réserve des Gourmands
AIzaSyBuennUE5SMN1YkV_38JObgGYj6_aAmTSc

*Cahier de projet — Version 12 — Février 2026*
*À partager à chaque nouvelle session de travail*

-----

## 1. Description du Projet

Deux utilisateurs partageant le même inventaire en temps réel. Mémoire augmentée pour les stocks de la maison, livre de recettes intelligent et surveillance des circulaires.

**Architecture modulaire :** Même moteur, style et configuration différents selon le projet. Déploiements futurs : Réserve des Bricoleurs, Réserve des Jardiniers.

-----

## 2. Règles de Développement

**Ces règles s’appliquent automatiquement à chaque session.**

- Toujours utiliser les variables CSS — jamais de valeur en dur
- Toujours respecter –rayon pour les coins
- Toujours respecter la palette définie — jamais inventer une couleur
- Toujours respecter les espacements –espace-xs/s/m/l/xl
- Toujours respecter les tailles de police définies
- Jamais toucher au styles.html sauf correction approuvée
- iPhone SE d’abord — tester chaque élément à 375px
- Zone tactile minimum –taille-tactile (44px) sur tous les boutons
- Toujours joindre styles.html à chaque demande de développement
- Jamais coder sans accord explicite du client
- Quand un bout de code est envoyé avec l’instruction ‘réécrit’ — réécrire le bloc complet, prêt pour copier-coller, sans explication technique
- Expliquer ce qui va être fait AVANT de le faire — le client valide, ensuite on code
- Les explications sont claires et fonctionnelles — pas de jargon technique, pas de références à des lignes de code

-----

## 3. Identité Visuelle

### 3.1 Direction artistique

- Style : moderne, épuré, rectangles assumés — pas de coins ronds excessifs
- Fond général : blanc
- Conteneurs : blancs avec ombre douce — pas de bordures rigides, pas de transparence
- En-tête : photo 100% largeur du contenu, hauteur 80vh
- Titre “RÉSERVE DES GOURMANDS” sur 2 lignes, en majuscule blanc avec ombre sur la photo
- Photo de fond : jason-leung (Unsplash) — URL intégrée directement
- Taille minimum de texte partout dans le site : 15px

### 3.2 Menu Burger

- Burger à gauche, fixe en haut de l’écran (classe .bouton-burger-fixe)
- Quand ouvert : panneau qui glisse depuis la gauche, fond –couleur-brun-fonce, texte blanc
- Largeur automatique selon le texte le plus long
- Items du menu en accordéon — un seul ouvert à la fois, tous fermés à l’ouverture
- Se ferme automatiquement au clic en dehors du menu

### 3.3 Typographie

- Police : Cabinet Grotesk (Fontshare)
- Poids autorisés : Thin (100), Extralight (200), Light (300), Regular (400), Medium (500) — jamais Bold ou plus
- Taille minimum : 15px (–taille-item-liste) partout dans le site

### 3.4 Palette de couleurs

- –couleur-creme : #f5efe6
- –couleur-beige : #e8ddd0
- –couleur-beige-moyen : #d4c4b0
- –couleur-brun-clair : #a08060
- –couleur-brun : #6b4f3a
- –couleur-brun-fonce : #3d2b1f
- –couleur-accent-rouge : #c0392b
- –couleur-accent-orange : #d4820a
- –couleur-accent-vert : #2e7d52
- –couleur-accent-bleu : #4e679c *(bleu extrait de la photo d’en-tête)*
- –couleur-blanc : #ffffff
- –couleur-fond : #ffffff

### 3.5 Variables de base

- –rayon : 2px
- –taille-tactile : 44px
- –burger-top : 28px
- –burger-left : var(–espace-l)
- –espace-xs: 4px / –espace-s: 8px / –espace-m: 12px / –espace-l: 16px / –espace-xl: 20px
- –taille-accordeon-header : 16px
- –taille-item-liste : 15px (minimum partout dans le site)

-----

## 4. Structure Technique

### 4.1 Fichiers Google Apps Script

- **Code.gs** — Logique serveur
- **index.html** — Structure HTML
- **scripts.html** — JavaScript
- **styles.html** — Les 26 styles UI + classes de mise en page

### 4.2 Fonctions Code.gs

- `doGet()` — Déploiement web
- `include(filename)` — Inclusion des fichiers HTML
- `initialiserSheet()` — Crée les 9 onglets avec colonnes — à appeler UNE SEULE FOIS
- `remplirDonneesTest()` — Remplit la Sheet avec des données de démonstration — à appeler UNE SEULE FOIS
- `getDonneesAccueil()` — Retourne les données pour les 5 accordéons de l’accueil
- `sauvegarderSheet()` — Copie la Sheet dans le dossier Sauvegardes sur Drive
- `configurerDeclencheur()` — Configure la sauvegarde automatique chaque nuit à 3h — à appeler UNE SEULE FOIS

### 4.3 Onglets Google Sheet

ID Sheet : 1yllq5bIpxOqV5L4AcTPG8z4XIijNRyYRqLDYIsW8LSs

- **Produits** — ID, Nom, Marque, CodeBarre, Categorie, Emplacement, QteStock, QteReserve, QteMinimum, DateExpiration, Notes, Photo, Actif
- **Emplacements** — ID, Nom, Zone, Description, Actif
- **Categories** — ID, Nom, DureeConservation, Actif
- **Magasins** — ID, Nom, Type, Actif
- **Recettes** — ID, Nom, Portions, TempsPrepMin, TempsCuissonMin, Instructions, Notes, Photo, Favori, Actif
- **Ingredients** — ID, RecetteID, ProduitID, NomIngredient, Quantite, Unite
- **Listes** — ID, Nom, Type, Statut, DateCreation
- **Configuration** — Cle, Valeur
- **Utilisateurs** — ID, Nom, Email, Actif

### 4.4 Responsive Design

- iPhone SE (375px) en premier — le plus contraignant
- iPad ensuite, PC en dernier (max-width 700px centré)
- Une seule feuille de style, trois comportements

-----

## 5. Inventaire des 26 Styles UI

### Navigation (3)

- **style-logo** — Zone du logo
- **bouton-burger** — Menu hamburger fixe en haut gauche, 44px + classe bouton-burger-fixe
- **titre-page** — Titre de chaque page

### Boutons (3)

- **bouton-principal** — Icône 75px sans texte, 4 variantes de couleur (brun/vert/orange/bleu), fond à 0.75
- **bouton-confirmer** — Action principale
- **bouton-secondaire** — Éditer, supprimer

### Accordéon (3)

- **accordeon-container** — Bloc dépliable, un seul ouvert à la fois
- **accordeon-header** — En-tête brun avec texte crème, flèche, 16px
- **accordeon-item** — Ligne dans le bloc, 15px minimum

### Badges et Notifications (4)

- **badge-priorite-haute** — Rouge, stock 0
- **badge-priorite-moyenne** — Orange, réserve vide
- **badge-info** — Vert, info générale
- **toast-confirmation** — Notification temporaire, variantes succès/erreur/avertissement

### Formulaires (6)

- **champ-texte** — Saisie texte avec bordure
- **liste-deroulante** — Dropdown avec bordure
- **compteur-quantite** — Boutons + et - avec bordure
- **case-a-cocher** — Checkbox mobile avec bordure
- **toggle** — Interrupteur actif/inactif
- **filtre-recherche** — Barre recherche + filtres

### Conteneurs Spéciaux (4)

- **fenetre-camera** — Zone de scan
- **zone-photo** — Photo produit ou recette
- **zone-svg** — Conteneur SVG emplacement
- **carte-recette** — Photo + titre + infos

### Listes et Items (3)

- **item-liste-achat** — Ligne avec nom, marque, quantité, case
- **item-modifiable** — Ligne avec boutons éditer et supprimer
- **etoile-favori** — Icône toggle favori recettes

### Classes de mise en page (nouvelles)

- **app-conteneur** — max-width 700px, centré
- **entete-wrapper / entete-photo / entete-titre** — En-tête photo
- **menu-overlay / menu-contenu / menu-accordeon-header / menu-accordeon-item** — Menu glissant
- **accueil-contenu / accueil-grille** — Mise en page accueil
- **bouton-principal-brun/vert/orange/bleu** — Variantes couleur boutons

-----

## 6. Pages de l’Application

### 6.1 Accueil — COMPLÉTÉE

- Photo 100% largeur contenu, hauteur 80vh
- Titre “Réserve des Gourmands” sur 2 lignes, clamp(40px, 12vw, 70px)
- 4 boutons-principaux avec icônes 75px : Scanner, Trouver, Consommer, Listes
  - Scanner : icône scan, fond brun
  - Trouver : icône loupe, fond vert
  - Consommer : icône ✓, fond orange
  - Listes : icône cards, fond bleu
- 5 accordéons branchés sur Sheet : Stock épuisé, Réserve vide, À consommer bientôt, En spécial, Listes en attente
- Un seul accordéon ouvert à la fois
- Données en temps réel depuis la Sheet

### 6.2 Scanner — À FAIRE

- Choix action AVANT scan : Ajouter, Consommer, Trouver
- Sources interrogées automatiquement : Open Food Facts, feed-me, flippscrape

### 6.3 Ajouter / Consommer / Trouver — À FAIRE

- Ajouter : détection auto nouveau/existant, emplacement proposé
- Consommer : stock mis à jour, alerte réserve vide, liste si dernier item
- Trouver : lecture seule, peut basculer vers Déménager ou Consommer

### 6.4 Listes d’Achats — À FAIRE

- Accordéon par type : Épicerie, Pharmacie, Magasin, Boutiques
- Temps réel 2 utilisateurs, quantités auto au retour

### 6.5 Recettes — À FAIRE

- Cartes-recettes avec filtre-recherche
- Accordéon Ingrédients/Instructions/Notes, compteur portions, favoris
- Faisable maintenant, Il manque juste un ingrédient, import Paprika 3 (167 recettes)

### 6.6 Configuration — À FAIRE

**Ordre :** 1. Emplacements 2. Catégories 3. Durées 4. Magasins 5. Alertes

-----

## 7. Sources de Données Externes

- Open Food Facts : nom, marque, photo — gratuit
- feed-me : prix courant Metro
- flippscrape : rabais circulaires par code postal

-----

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

-----

## 9. SVG Emplacements

### Complétés

- Armoire verte IKEA IDÅSEN, Armoires brunes 1 et 2, Frigo LG French Door
- Armoires basses noires, Armoires murales bois, Armoire coin noire SEKTION, Bibliothèque IVAR

### Restant à modéliser

- Garde-manger, Îlot, Porte épices, Buanderie, Congélateur sous-sol

-----

## 10. Sauvegarde

- Sauvegarde automatique chaque nuit à 3h via déclencheur Apps Script
- Copie complète de la Sheet dans le dossier “Sauvegardes — La Réserve des Gourmands” sur Google Drive
- 30 dernières copies conservées, les plus vieilles supprimées automatiquement
- Déclencheur configuré via `configurerDeclencheur()` — déjà exécuté

-----

## 11. Notes et Prochaines Étapes

- **PROCHAINE ÉTAPE : Page Scanner ou Configuration** — à décider
- Icône Consommer manquante — placeholder ✓ pour l’instant
- Photos recettes : évaluer Drive vs OneDrive vs base64 lors du module recettes
- Ajouter IGA, Super C, Maxi dans flippscrape
- SVG restant à modéliser : garde-manger, îlot, porte épices, buanderie, congélateur sous-sol

-----

## 12. Journal des Sessions

### Session Février 2026 — nuit blanche productive (v11)

- Configuration complète : emplacements, catégories, durées, magasins, alertes
- Inventaire UI : 26 styles identifiés et nommés
- Structure technique définie : 4 fichiers GAS, 9 onglets Sheet
- 14 règles de développement établies et dans les préférences
- Direction visuelle v1 : fond transparent — abandonnée
- Direction visuelle v2 : blanc, rectangles assumés, Cabinet Grotesk, photo en en-tête — retenue
- Catalogue styles créé avec photo base64 intégrée

### Session Février 2026 — blocs de 15 minutes 😄 (v12)

- Catalogue styles corrigé : Cabinet Grotesk, blanc, sans transparence, variables verre conservées
- styles.html définitif créé — 26 styles + classes de mise en page
- index.html créé — page d’accueil complète
- scripts.html créé — logique accordéons, menu burger, données
- Code.gs créé — initialisation Sheet, données test, accueil, sauvegarde
- Sheet initialisée : 9 onglets avec colonnes et données de test
- Sauvegarde automatique configurée — chaque nuit à 3h
- Palette enrichie : –couleur-accent-bleu #4e679c
- Taille minimum 15px (–taille-item-liste) partout dans le site
