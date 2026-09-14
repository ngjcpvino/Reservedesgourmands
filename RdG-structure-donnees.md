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
| F | Marque | marque du produit (optionnel) |
| G | Format | format / grosseur, ex. « 500 g », « 2 L » (optionnel) |

### EMPLACEMENTS — les rangements, en arbre (Meuble → Espace)

| Col | Nom | Sens |
|-----|-----|------|
| A | ID | date/heure de création |
| B | Nom | le **meuble** (« Frigo », « Congélateur ») ou l'**espace** (« Tablette 1 », « Bac ») |
| C | ParentID | vide = un **meuble**; rempli = un **espace** dans ce meuble |
| D | SecteurID | lien vers SECTEURS |
| E | Actif | O / N |
| F | Couleur | couleur distinctive du meuble (HEX). Sur le meuble; vide sur l'espace (il en hérite) |

### STOCK — LE cœur : qui est rangé où, et combien
*Une ligne par produit × place. Un même produit a autant de lignes que d'endroits.*

| Col | Nom | Sens |
|-----|-----|------|
| A | ID | date/heure de création |
| B | ProduitID | lien vers PRODUITS |
| C | EmplacementID | lien vers EMPLACEMENTS. **Vide = en transit** (entré, compté, pas encore rangé) |
| D | Quantite | en unités du produit |
| E | DateEntree | date d'entrée de ce lot = date du scan (automatique) |

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

### CODES — les codes-barres (plusieurs par produit), chacun son multiplicateur

| Col | Nom | Sens |
|-----|-----|------|
| A | ID | date/heure de création |
| B | CodeBarres | le code lu — **clé de recherche**, jamais l'identifiant du produit |
| C | ProduitID | lien vers PRODUITS |
| D | Multiplicateur | 1 par défaut; un code « paquet de 12 » = 12 |
| E | Actif | O / N |

---

## CE QUI VIENDRA PLUS TARD (s'ajoutera au bout, sans rien casser)

- Sur **PRODUITS** : Marque, Photo, Notes, Seuil d'alerte (point 5),
  prix-mémoire (point 12).
- Nouvelles tables : **Magasins**, **Listes d'achats** (point 5),
  **Recettes** + **Ingrédients** (point 6), **Utilisateurs**.
