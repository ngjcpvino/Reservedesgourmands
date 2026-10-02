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
| G | Ordre | le rang choisi parmi ses frères (1, 2, 3…), avec les flèches de Gérer les bases → Catégories (2026-09-30). Vide = après les numérotées, dans l'ordre du Sheet. C'est l'ordre de la fiche |

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

### SPECIAUX et CIRCULAIRES — les circulaires (refait le 2026-10-01, RdG-05 section 8)
*Deux onglets aux mêmes colonnes, créés tout seuls par le coffre-fort. **SPECIAUX = la semaine en cours** : remplacé en
entier chaque jeudi (1 h, heure du Québec) par TOUS les articles des circulaires en cours des magasins à Oui (plus
seulement nos aliments); c'est de lui que l'app reçoit ses soldes. **CIRCULAIRES = l'archive** : la semaine s'y ajoute à
la fin de la lecture (un article déjà archivé — même circulaire, même article — est sauté), gardée **un an**, sauf la
dernière apparition de chaque genre d'article, qui reste toujours. Jamais envoyée à l'app. (Avant le 2026-10-01, SPECIAUX
avait 13 colonnes : ID · Magasin · ProduitID · Texte · Prix · Regulier · Unite · Description · Debut · Fin · Cle · Etat ·
FlippId — remplacé à la 1re lecture nouvelle.)*

| Col | Nom | Sens |
|-----|-----|------|
| A | ID | date/heure de la lecture |
| B | Magasin | ID dans MAGASINS |
| C | FlyerId | la circulaire chez Flipp |
| D | FlippId | l'article chez Flipp |
| E | Texte | le nom de l'article, en français (« bacon Maple Leaf ») |
| F | Description | format et précisions (« 375 g, choix varié ») — vient du détail. (La semaine lue le 2026-10-01 y a aussi l'histoire du rabais, collée au bout) |
| G | Prix | le prix en circulaire |
| H | Regulier | le prix régulier s'il est connu (le prix « original », sinon prix + économie, sinon « Rég. » de la description) |
| I | Unite | ce qui entoure le prix (« 2/ », « le 100 g », « /lb », « +tx ») |
| J | Debut | premier jour de l'offre |
| K | Fin | dernier jour |
| L | Categorie | **sa catégorie racine** (ID dans CATEGORIES), devinée d'après les mots de l'article — Flipp ne donne pas de rayon. Vide = « Autres » |
| M | Cle | le genre d'article, c'est lui qu'on trie : les deux premiers mots du nom **sans la marque**, + « \| » + la marque quand elle est écrite (une de MARQUES reconnue, sinon celle de Flipp) — « creme glacee \| coaticook »; sans marque : « lait chocolat » (J-C, 2026-10-02). La semaine lue le 2026-10-01 a encore l'ancienne clé (les deux premiers mots) : le coffre-fort la recalcule à la lecture |
| N | Marque | la marque telle que Flipp la donne (souvent vide; le texte la contient d'habitude) |
| O | CodeBarres | **IGA seulement** : le code-barres tiré de son « sku » (UPC, ou code PLU d'un fruit/légume) — celui d'UN produit de l'offre. En texte |
| P | DateLecture | le jeudi de la lecture |
| Q | Detail | O = le détail est lu · X = tenté, Flipp n'a pas répondu (le prix de la circulaire reste) · vide = pas encore |
| R | ProduitPropose | l'aliment proposé (lien vers PRODUITS) : tous ses mots dans l'article, le plus précis l'emporte |
| S | MarquePropose | une marque de MARQUES reconnue dans le texte |
| T | SaveurPropose | une saveur de SAVEURS reconnue dans le texte (« 2% » cherché tel quel) |
| U | Histoire | l'histoire du rabais (« 50% d'économie », « 100 Scène+ PTS à l'achat de 2 ») — vient du détail. Ajoutée le 2026-10-02 : le tri montre le format sans elle |

### TRI — les réponses de J-C aux circulaires (2026-10-01; repensé le 2026-10-02 : par épicerie)
*Vidé à la main par J-C le 2026-10-02 (repartir à neuf avec le tri par épicerie). Créé au 1er tri s'il manque; l'en-tête est
remis à jour à chaque tri (colonnes ajoutées au bout). **Une ligne par article** (sa clé, col. B) : une nouvelle réponse réécrit la
ligne (c'est aussi la correction). Écrit par l'action `trier`.*

| Col | Nom | Sens |
|-----|-----|------|
| A | ID | date/heure de création |
| B | Cle | l'article, TOUJOURS dans son épicerie : « IDmagasin ~ #code » (un code — IGA : code-barres ou PLU — = un produit précis, une ligne par code) ou « IDmagasin ~ genre ~ format » sans code (le genre = col. M de SPECIAUX recalculé; un nouveau format revient à trier) |
| C | Reponse | O = Oui · P = Peut-être · J = Jamais. **Un Jamais vaut dans toutes les épiceries** (par le genre, col. L) |
| D | ProduitID | l'aliment (Oui, Peut-être); vide pour J. **Une ligne à plusieurs produits** (« germes de haricot ou épinards ») : plusieurs ID séparés par des virgules |
| E | Marque | ID dans MARQUES (Oui, Peut-être) — plusieurs : séparés par des virgules, dans l'ordre de D |
| F | Saveur | ID dans SAVEURS (Oui, Peut-être) — idem |
| G | CodeBarres | le code de l'article : celui d'IGA (code-barres ou PLU), celui d'un article relié (« Serait-ce celui-ci ? », même format), un PLU de la liste officielle, ou un code d'Open Food Facts (12 chiffres pour un UPC). En texte. Sert aussi au scan à l'entrée (`codesTri` de `references`) |
| H | Date | quand J-C a répondu |
| I | Qui | qui a répondu |
| J | Texte | le nom de l'article au moment du tri (pour les barres de correction, même quand il n'est plus en circulaire) |
| K | Categorie | sa catégorie racine (celle du 1er aliment s'il y en a un, sinon celle devinée) |
| L | Genre | le même produit d'une épicerie à l'autre (les deux premiers mots sans la marque + la marque) : un Jamais vaut partout, et il propose son aliment à un nouveau format de la même épicerie |
| M | Format | les quantités de la description (« 2 l », « 12x200 ml »), pour comparer : le code d'un article relié ne suit que le même format |
| N | Magasin | l'épicerie de l'article (ID dans MAGASINS) |

### CORRESPONDANCES — les anciennes réponses Oui / Non (2026-09-29, remplacé par TRI le 2026-10-01)
*Plus écrit ni lu (ses Oui sont passés dans TRI le 2026-10-01; `repondreSpecial` retiré le 2026-10-02). Peut être effacé du Sheet à la main.*

| Col | Nom | Sens |
|-----|-----|------|
| A | ID | date/heure de création |
| B | Cle | le genre d'article |
| C | ProduitID | l'aliment proposé |
| D | Reponse | O / N |
| E | Date | quand J-C a répondu |
| F | Qui | qui a répondu |

### MAGASINS · MARQUES · SAVEURS — les listes gérées (2026-09-29)
*Trois onglets pareils, créés tout seuls par le coffre-fort. MAGASINS naît avec Super C, Metro, IGA, Richelieu.
On choisit dans la fiche, « Nouveau… » au bout; on corrige au crayon dans Gérer les bases.*

| Col | Nom | Sens |
|-----|-----|------|
| A | ID | date/heure de création (un nom ajouté à la fiche reçoit son ID dans l'app, même forme) |
| B | Nom | « Super C », « Liberté », « fraise »… Deux noms qui ne diffèrent que par les accents, majuscules ou espaces sont LE MÊME (jamais de doublon). Écrit en texte (« 0% » reste « 0% ») |
| C | Actif | O / N — N = réuni dans un autre (« Libertee » dans « Liberté ») ou retiré : ses liens ont été repointés, la ligne reste |
| D | Circulaire | **MAGASINS seulement** (2026-10-01) : O / N — sa circulaire est-elle lue le jeudi ? Vide = Oui (un magasin neuf part à Oui) |
| E | Trouvee | **MAGASINS seulement**, écrit par le coffre-fort après chaque lecture, pour les magasins à Oui : O = sa circulaire a été trouvée chez Flipp · N = non (l'app écrit « Pas de circulaire trouvée ») |

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
