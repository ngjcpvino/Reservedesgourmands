# RdG — Réflexion sur les données saisies
*Session du 23 septembre 2026 — réflexion, aucun code touché*
*Question de départ de Jean-Claude : « Je ne veux pas entrer 100 aliments et
m'apercevoir ensuite qu'il manque une info pour nourrir ce que je voulais faire. »*

---

## ✅ RÉGLÉ (23 septembre) — la date était à l'heure de Londres

La date d'entrée est désormais celle **d'ici**, aux deux endroits où elle se calcule :
- **Dans l'app** (`JS/entree.js`) : une seule fonction, `dateDuJour()`, qui lit la date
  de l'appareil. Les deux `toISOString()` sont partis; il n'en reste aucun dans `JS/`.
- **Dans le coffre-fort** (`gas/api.gs`) : c'est **lui** qui écrit la vraie date dans STOCK.
  Il ne devine plus le fuseau du projet Apps Script (souvent laissé à Londres) : il est
  écrit noir sur blanc, `var FUSEAU = 'America/Toronto'`. Sert aussi aux **identifiants**,
  qui portent la date et l'heure.

⚠️ **Demande un redéploiement d'`api.gs`.** Les lignes déjà entrées après 20 h gardent
leur date de lendemain : à corriger à la main dans le Sheet si ça compte.

---
## 1. LA MÉTHODE

On trie chaque information en deux piles :
- **Rattrapable plus tard.** Ce qui se pose sur le produit ou la catégorie
  (sous-catégorie, durée de vie, section du magasin, seuil). Se complète au
  café, même après 100 entrées.
- **Perdue pour toujours.** Ce qui n'existe qu'au moment de l'entrée (quel
  lot, quand, combien, où acheté, à quel prix). Si ce n'est pas saisi ce
  jour-là, c'est fini.

Seule la deuxième pile doit être réglée **avant** de commencer à entrer.

---

## 2. UN PRODUIT OU DEUX? — les cas concrets tranchés

| Cas | Décision de J-C |
|---|---|
| Cheerios | un produit à lui seul |
| Lait 2 % / lait 3,25 % | **deux** produits |
| Lait 2 % en 1 L / en 4 L | **un** produit, le format est noté sur le lot |
| Lait Natrel / Québon | la marque **ne compte pas** |
| Poudre à pâte | la marque ne compte pas |
| Yogourt | **marque + saveur** comptent : chacune a son compte (moi une marque, mon conjoint une autre) |
| Yogourt, ma marque : plus de fraise, reste de la vanille | il **manque** de la fraise |
| Céréales | même modèle que le yogourt (Cheerios nature ≠ Cheerios miel et noix) |

**Pas de liste à faire d'avance** (« il y en a des dizaines »). Comme décidé au
point 2 : **ça se décide à la création du produit, une fois, produit par
produit**. La première fois qu'on crée un yogourt, l'app demande si la marque
et la saveur comptent. Confirmé le 23 septembre.

---

## 3. COMMENT ÇA SE COMPTE

- **Lait** : un 4 L + deux 1 L = on veut lire **6 litres**, pas 3 contenants.
- **Bananes** : un **nombre** de bananes (déjà possible aujourd'hui).
- **Bœuf haché** : le **poids total**. Chaque paquet a son propre poids
  (étiquette du magasin); J-C accepte de **taper le poids de chaque paquet**.
  À la sortie, l'app demande **lequel** des paquets sort → chaque paquet est
  enregistré **à part**.
- **Yogourt en paquet de 12** : on veut lire **12** (déjà possible : on tape 12;
  le multiplicateur automatique au scan reste pour plus tard).
- **Péremption du yogourt** : pas de date à taper. La durée de vie de la
  catégorie + la date d'entrée suffisent (décision de juillet maintenue).

---

## 4. CE QUI MANQUAIT À L'ENTRÉE — ✅ **BÂTI le 23 septembre**

1. **La quantité mesurable** (litres, poids), pas seulement le nombre de
   contenants. Condition : le format doit être écrit **toujours pareil**
   (« 1 L », « 4 L ») pour que l'app additionne. Sert aussi aux **recettes**
   (« 500 g de farine », point 6).
2. **Le poids de chaque paquet** de viande, un paquet = une ligne. Aujourd'hui,
   la fiche n'accepte qu'un seul format par entrée, et la quantité n'accepte
   que des nombres entiers.
3. **La saveur** (yogourt, céréales…) : notée nulle part.
4. **Qui** a entré l'article (J-C ou son conjoint). Aujourd'hui, les deux
   utilisent le même mot de passe : l'app ne le sait pas.
5. **Le magasin** où l'article a été acheté.
6. **Le prix**, **facultatif**, seulement si on veut, pour comparer les
   épiceries. *(Change la décision de juillet « jamais de prix tapé » :
   le prix devient possible, jamais obligatoire.)*
7. **« La marque et la saveur comptent-elles? »**, un choix par produit, posé à
   sa création (section 2).

---

**Comment chacun a été réglé :**

1. **Quantité mesurable** : le **Format** est devenu **deux champs — un nombre + une unité**
   (liste : unité · g · kg · ml · L, plus « Autre… » pour en ajouter). Écrit toujours pareil,
   donc additionnable.
   L'inventaire additionne quand les unités s'accordent — *un 4 L + deux 1 L = 6 L* —
   et se contente de compter les contenants sinon.
2. **Poids par paquet** : bouton **« Chaque paquet a son poids »**. On tape les nombres l'un
   après l'autre, **dans l'unité choisie juste au-dessus**; **chaque paquet devient sa propre
   ligne** de stock. Toucher un poids déjà noté le retire.
3. **Saveur** : champ propre (STOCK col. J), **toujours offert**.
4. **Qui entre** : **demandé dès le premier usage** sur un appareil (juste après le mot de passe),
   et modifiable ensuite dans Outils → **Qui entre les articles**. Le nom est gardé **sur l'appareil**
   (pas dans le Sheet) et inscrit sur chaque ligne (col. K). Chacun le pose une fois sur le sien.
5. **Magasin** : champ avec les magasins déjà utilisés en suggestion (col. L).
6. **Prix** : champ **facultatif** (col. M).
7. **Ce qui sépare les comptes** : essayé en deux questions **Oui / Non** à la création,
   **retiré le 23 septembre** à la demande de J-C. Règle retenue, plus simple : **la marque et
   la saveur sont toujours offertes**, on les remplit **s'il y a lieu**, et **ce qui est écrit
   sépare** (yogourt Liberté fraise ≠ Yoplait fraise; lait sans marque = un seul compte).
   Les colonnes H et I de PRODUITS restent, inutilisées.

⚠️ Rien à rattraper sur les produits déjà créés : la règle ne dépend plus d'un réglage,
seulement de ce qui est écrit sur chaque lot.

---

## 5. LA QUALITÉ DE LA SAISIE — éviter les doublons et les erreurs

- **Nom au scan** : on garde le nom d'Open Food Facts **tel quel**.
- **Doublon au scan** : le grand format de Cheerios a un autre code-barres et
  Open Food Facts renvoie un nom un peu différent (« Cheerios Multigrains »).
  C'est **le même produit**. Quand le nom ne correspond exactement à aucun
  produit, l'app **montre ceux qui ressemblent**; J-C touche le bon, ou
  confirme que c'est un nouveau produit.
- **Doublon à la main** : même vérification quand on tape « Nouveau produit… »
  (ex. « Cheerio multigrain » sans le « s »).
- **Fusion** : si un doublon passe quand même, pouvoir **fusionner** deux
  produits en un seul, en additionnant leurs stocks.
- **Correction** : pouvoir corriger **tout** ce qui a été entré (quantité,
  endroit, marque, format, poids, prix…) **après** l'enregistrement.
- **Pas de résumé à confirmer avant d'enregistrer** (refusé : une touche de
  plus à chaque entrée). La correction après coup suffit.

**État au 23 septembre :**
- ✅ **Doublons proposés** : dès qu'un nom ressemble à un produit connu (accents, pluriel,
  espaces, deux lettres d'écart), l'app affiche **« Serait-ce plutôt celui-ci ? »**. Toucher
  un nom bascule dessus. Vaut au scan **et** à la main.
- ✅ **Fusion** : le coffre-fort sait fusionner deux produits (les lignes de stock passent au
  gardé, le doublon est désactivé, jamais supprimé). **L'écran reste à bâtir.**
- ⛔ **Correction après coup** (quantité, endroit, marque, format, poids, prix…) : **pas encore
  bâtie**. C'est le prochain chantier, et le dernier avant les 100 entrées.

**Principe pour toute l'app — J-C est dyslexique** (ex. 21 tapé au lieu de 12) :
**faire choisir plutôt que faire taper**, chaque fois qu'on le peut, et
**toujours permettre de corriger**.

---

## 6. VÉRIFICATION CROISÉE AVEC TOUS LES DOCUMENTS

Relus : fondations (00), entrée (01), sortie (02), « en ai-je déjà? » (03),
structure, sources de données. Pour chaque désir : l'information est-elle
notée, ou rattrapable plus tard?

**Rattrapable plus tard, rien ne se perd** : section du magasin (point 3),
durée de vie, seuil d'alerte, liste d'achats (point 5), recettes (point 6,
sauf le trou n° 1 ci-dessus), inventaire annuel (point 11), infos Open Food
Facts (allergènes, etc. — le code-barres est gardé).

**Deux trous, tous deux à la SORTIE (point 2, pas encore bâtie)** :
1. **L'historique des sorties.** Les « populaires » (point 3) et le rythme de
   consommation (point 5 : « il en manque bientôt ») exigent de savoir
   **quand** chaque chose est sortie. Si la sortie ne fait que baisser un
   chiffre, c'est perdu.
2. **La quantité d'origine du lot.** Si la sortie baisse le chiffre du lot
   entré, on perd combien on en avait acheté → plus de prix à l'unité pour
   comparer les épiceries.

→ À régler **quand on bâtira la sortie**. Ne bloque pas le début des entrées.

**La date d'entrée** est bien inscrite automatiquement (STOCK, colonne E) et
servira à la sortie, une fois corrigé le défaut de Londres (en tête de ce
document).

---

## 7. EN CLAIR

**Fait le 23 septembre** : le défaut de l'heure, les 7 points de la section 4, et la
proposition des doublons (section 5).

**Reste avant les 100 entrées** : l'écran de **correction** de ce qui a été entré, et
l'écran de **fusion** de deux produits (le coffre-fort est prêt, il manque l'écran).

**Reste pour plus tard, avec la sortie** : les deux trous de la section 6 (l'historique
des sorties et la quantité d'origine du lot).

**Ajouté le 23 septembre (test de J-C)** · on peut créer une **catégorie** et une **sous-catégorie** sans quitter la fiche d'entrée (« Nouvelle… » au bout de la liste). Un nom déjà pris est réutilisé au lieu d'être recréé.
