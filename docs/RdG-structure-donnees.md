# La Réserve des Gourmands — Référence unique : structure des données

> **Source de vérité des colonnes.** Le code lit et écrit TOUJOURS par position
> (colonne A, B, C…), jamais par nom d'en-tête. Toute nouvelle colonne s'ajoute
> au **bout** de la table — jamais insérée au milieu. Un seul document : celui-ci.
>
> Contexte : nouveau Sheet propre (l'ancien est abandonné), lu et écrit à travers
> un coffre-fort Apps Script (lui seul connaît la clé et l'ID du Sheet).

---

## Règles qui s'appliquent à TOUTES les tables

- **Colonne A = ID** : la date/heure de création de la ligne. Identifiant stable,
  unique, jamais réutilisé, jamais un simple numéro croissant.
- **Les liens se font par ID**, jamais par nom — un renommage n'importe où ne
  casse jamais rien.
- **Actif (O/N)** : on ne supprime jamais une ligne d'une liste de base — on la
  désactive. Elle disparaît des choix, mais garde ses liens avec ce qui s'y
  rattache encore.
- **Rien de figé** : secteurs, catégories, lieux, espaces sont des LIGNES ici,
  jamais du code.
- **Arbres (profondeur libre)** : une table qui pointe vers elle-même par un
  `ParentID` peut avoir autant de niveaux qu'on veut, branche par branche.

---

## LE CŒUR — 3 tables

### PRODUITS — la fiche d'un item
*Ni quantité, ni lieu ici : ça vit dans STOCK (un produit peut être à plusieurs
endroits en même temps).*

| Col | Nom | Sens |
|-----|-----|------|
| A | ID | date/heure de création |
| B | Nom | nom du produit |
| C | CategorieID | lien vers CATEGORIES (la sous-catégorie; peut rester vide = « fiche à terminer ») |
| D | Unite | unité de mesure (legacy, souvent vide — le Format le remplace à l'usage) |
| E | Actif | O / N |
| F | Marque | *(legacy — laissé vide : la marque vit sur STOCK, un produit peut en avoir plusieurs)* |
| G | Format | *(legacy — laissé vide : le format vit sur STOCK)* |
| H | MarqueCompte | O / N — la marque **sépare-t-elle les comptes** de ce produit ? (yogourt : O; lait : N). Demandé une fois, à la création |
| I | SaveurCompte | O / N — idem pour la saveur (yogourt fraise ≠ vanille). Demandé au même moment |
| J | OrdreEmp | ses endroits dans l'ordre choisi (ID d'EMPLACEMENTS séparés par des virgules) : le 1er = celui que Déplacer regarnit et la 1re carte à l'entrée. Vide = l'ordre d'apparition dans STOCK. Changé par les flèches de Gérer les bases → Aliments (2026-09-29) |

### EMPLACEMENTS — les rangements, en arbre (Meuble → Espace)

| Col | Nom | Sens |
|-----|-----|------|
| A | ID | date/heure de création |
| B | Nom | la **pièce** (« Cuisine »…), le **meuble** (« Frigo »…) ou l'**espace** (« Tablette 1 »…) |
| C | ParentID | = SecteurID → **pièce** · = une pièce → **meuble** · = un meuble → **espace**. (Vide = meuble pas encore rangé dans une pièce = legacy) |
| D | SecteurID | lien vers SECTEURS |
| E | Actif | O / N |
| F | Couleur | couleur distinctive du meuble (HEX). Sur le meuble; vide sur l'espace (il en hérite) |

> **L'ordre d'affichage = l'ordre des lignes** (décision 2026-09-22, pas de colonne « Ordre »).
> Les flèches ↑↓ de « Gérer les bases » font réordonner les lignes par le coffre-fort
> (action `ordonner`). Sans danger : tout se lie par ID, jamais par position de ligne.

### STOCK — LE cœur : qui est rangé où, et combien
*Une ligne par produit × place. Un même produit a autant de lignes que d'endroits.*

| Col | Nom | Sens |
|-----|-----|------|
| A | ID | date/heure de création |
| B | ProduitID | lien vers PRODUITS |
| C | EmplacementID | lien vers EMPLACEMENTS. **Vide = en transit** (entré, compté, pas encore rangé) |
| D | Quantite | en unités du produit |
| E | DateEntree | date d'entrée de ce lot = date du scan (automatique) |
| F | Marque | **ID** dans MARQUES (depuis le 2026-09-29; avant, du texte libre) — la marque de CE lot; un même produit peut en avoir plusieurs. Vide = sans marque |
| G | Format | format de CE lot (« 500 g », « unité »…) — idem |
| H | OpId | jeton anti-reclic de l'entrée (toutes les lignes d'un même envoi = même jeton). Un renvoi du même jeton n'écrit RIEN |
| I | CodeBarres | le code-barres scanné pour CE lot — **clé de recherche** (reconnaître le produit au prochain scan). Vide si entré à la main |
| J | Saveur | **ID** dans SAVEURS (depuis le 2026-09-29) — la saveur de CE lot. Vide si la saveur ne compte pas |
| K | QuiEntre | qui a entré l'article. Vient de l'appareil (Outils → Qui entre les articles), pas du mot de passe |
| L | Magasin | **ID** dans MAGASINS (depuis le 2026-09-29) — où l'article a été acheté |
| M | Prix | **facultatif** — ce que le lot a coûté, pour comparer les épiceries |

> **La quantité mesurable** se lit dans le **Format** : « 1 L », « 500 g », « 0,54 kg ».
> L'app additionne (un 4 L + deux 1 L = 6 L) quand les unités s'accordent; sinon elle
> compte les contenants. Un **paquet de viande = une ligne**, avec son propre poids.
>
> Le « total » d'un produit = la somme de ses lignes STOCK.
> Le « 2 sur 4 » et la ligne « en transit » de la fiche viennent d'ici.
> Consulter (points 3 et 4) = lire ces lignes. Sortir (point 2) = baisser une
> ligne. Déplacer (point 7) = transférer une quantité d'une ligne à une autre,
> **sans changer le total**.

---

## LES LISTES DE SUPPORT — 3 tables

### SECTEURS — le plus haut niveau (Épicerie, Quincaillerie…). Filtre tout le reste.

| Col | Nom | Sens |
|-----|-----|------|
| A | ID | date/heure de création |
| B | Nom | ex. « Épicerie » |
| C | Actif | O / N |

### CATEGORIES — l'arbre des catégories (profondeur libre), porte la durée de vie

| Col | Nom | Sens |
|-----|-----|------|
| A | ID | date/heure de création |
| B | Nom | ex. « Fromages », « Fromages frais » |
| C | ParentID | lien vers CATEGORIES. Vide = racine du secteur |
| D | SecteurID | lien vers SECTEURS |
| E | DureeVieJours | durée de conservation. Vide = hérite du parent le plus proche |
| F | Actif | O / N |

### COULEURS — la palette du site, par secteur (2026-09-22)
*Créé tout seul par le coffre-fort au premier enregistrement (Outils → Couleurs).
Une ligne par couleur changée; une couleur absente ou vide = celle d'origine du CSS.*

| Col | Nom | Sens |
|-----|-----|------|
| A | ID | date/heure de création |
| B | SecteurID | lien vers SECTEURS — chaque secteur a sa palette |
| C | Nom | la couleur de base du root : `blanc`, `creme`, `beige`, `beige-moyen`, `brun-clair`, `brun`, `brun-fonce`, `rouge`, `orange`, `vert`, `bleu`, `or`, `fond` |
| D | Valeur | code hex (`#6b4f3a`). Vide = revenir à la couleur d'origine |

> Les couleurs des **meubles** ne sont pas ici : elles restent dans EMPLACEMENTS, colonne F.

### SORTIES — la trace de ce qui a été consommé (2026-09-29)
*Créé tout seul par le coffre-fort à la première sortie (Consommer). Une ligne par geste.
Servira à prévoir le rachat (le rythme de chaque aliment).*

| Col | Nom | Sens |
|-----|-----|------|
| A | ID | date/heure de création |
| B | ProduitID | lien vers PRODUITS |
| C | Emp | lien vers EMPLACEMENTS — d'où c'est sorti. Vide = pas encore rangé |
| D | Qte | combien (à l'unité pour un pack : 1 pot d'un pack de 6 = 1) |
| E | Date | date de la sortie (heure du Québec) |
| F | Marque | du lot sorti (ID dans MARQUES) |
| G | Format | du lot sorti (« 6 unité », « 650 g »…) |
| H | Saveur | du lot sorti (ID dans SAVEURS) |
| I | Qui | qui a consommé (le nom de l'appareil, comme QuiEntre) |
| J | OpId | jeton anti-reclic : écrit **en dernier**, c'est lui qui dit « fait ». Un renvoi du même jeton n'écrit RIEN |

### PASAIMES — « Ne pas racheter », pour la maison (2026-09-29)
*Créé tout seul au premier « Ne pas racheter » coché. Vise exactement ce produit :
aliment + marque + saveur, tous formats. S'enlève dans Gérer les bases → Aliments.*

| Col | Nom | Sens |
|-----|-----|------|
| A | ID | date/heure de création |
| B | ProduitID | lien vers PRODUITS |
| C | Marque | la marque visée, ID dans MARQUES (vide = sans marque) |
| D | Saveur | la saveur visée, ID dans SAVEURS (vide = sans saveur) |

### MAGASINS · MARQUES · SAVEURS — les listes gérées (2026-09-29)
*Trois onglets pareils, créés tout seuls par le coffre-fort. MAGASINS naît avec Super C, Metro, IGA, Richelieu.
On choisit dans la fiche, « Nouveau… » au bout; on corrige au crayon dans Gérer les bases.*

| Col | Nom | Sens |
|-----|-----|------|
| A | ID | date/heure de création (un nom ajouté à la fiche reçoit son ID dans l'app, même forme) |
| B | Nom | « Super C », « Liberté », « fraise »… Deux noms qui ne diffèrent que par les accents, majuscules ou espaces sont LE MÊME (jamais de doublon) |
| C | Actif | O / N — N = réuni dans un autre (« Libertee » dans « Liberté ») : ses liens ont été repointés, la ligne reste |
| E | Date | quand c'est arrivé |
| F | Qui | qui l'a coché |

### CODES-BARRES — PAS de table séparée (décision 2026-09-20)

Le code-barres vit sur **STOCK, colonne I** (ci-dessus), comme la marque et le
format vivent sur le lot. Le serveur relit STOCK et renvoie un index
`{ codeBarres: produitId }` (1re association gagne) pour **reconnaître un
produit déjà à nous** au scan. Motivation : éviter un onglet de plus; un
code-barres est un attribut du lot au même titre que marque/format.

Un produit peut donc avoir **plusieurs codes** (ses lots l'ont porté), c'est
correct. Reporté à plus tard : le **multiplicateur par code** (« paquet de 12 »)
— si besoin, une colonne s'ajoutera au bout (après M), sans rien casser.

---

## CE QUI VIENDRA PLUS TARD (s'ajoutera au bout, sans rien casser)

- Sur **PRODUITS** : Marque, Photo, Notes, Seuil d'alerte (point 5),
  prix-mémoire (point 12).
- Nouvelles tables : **Magasins**, **Listes d'achats** (point 5),
  **Recettes** + **Ingrédients** (point 6), **Utilisateurs**.
