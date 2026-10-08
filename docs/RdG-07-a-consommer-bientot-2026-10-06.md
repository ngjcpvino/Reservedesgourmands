# RdG-07 — À consommer bientôt (2026-10-06)

> La 2e liste de la page Listes (l'accordéon « À consommer bientôt », vide jusqu'ici).
> **Réflexion finie le 2026-10-06** (onze décisions, section 2). **✅ BÂTI le même soir** (section 3), le menu de la durée
> d'une sous-catégorie compris (2026-10-07, choix A); le coffre-fort : section 4, écrit, ✅ collé par J-C le 2026-10-07. ⚠️ Pas encore testé en ligne.

## 1. Ce qui était déjà décidé (juillet, redit le 23 septembre — `RdG-01`, `RdG-04`)

- **Aucune date à taper.** La date d'entrée est automatique (STOCK col. E).
- **La durée de vie vit sur la catégorie** (Categories col. E `DureeVieJours`, vide = hérite du parent).
  La colonne existe, **vide, lue par rien** au 2026-10-06.
- L'app calcule : date d'entrée + durée de vie = « à consommer avant ».

## 2. Décidé le 2026-10-06

1. **Le congélateur (choix B)** — J-C : « B, pour le congélo, 4 mois ».
   Au congélo, le temps ne s'arrête pas : un aliment y a **sa propre durée**, sinon tout le congélo
   paraîtrait « bientôt » après 2 jours (le bœuf haché). **Au congélo : 4 mois, pour tout**
   (une seule durée, pas une par sous-catégorie — compris ainsi, à corriger si J-C dit autrement).
   Au frais (frigo, garde-manger…) : la durée de la sous-catégorie.
   Rejeté : A (au congélo, le temps s'arrête : le steak oublié depuis un an ne paraîtrait jamais).

2. **Un meuble est un congélateur par un interrupteur (choix B)** — « Congélateur » sur chaque meuble,
   dans Gérer les bases → Meubles, comme l'interrupteur « Circulaire » des magasins; J-C l'allume une fois
   par congélo. Rejeté : A (deviner par le nom : un « Coffre du sous-sol » ne serait pas reconnu).
   Il faudra une colonne de plus à Emplacements (G).

3. **La durée au frais : la sous-catégorie, et l'aliment quand ça ne colle pas (choix B, avec les
   propositions de Claude)** — J-C : « Oui ». Certaines sous-catégories mélangent (Fruits : framboises
   3 jours, pommes 1 mois; Légumes : laitue, patates; Fromages fins). La sous-catégorie donne la durée
   de départ (Categories col. E, déjà là); un aliment peut avoir **la sienne**, qui l'emporte (Produits :
   une colonne de plus, K). **J-C ne tape rien** : Claude propose une durée pour chaque sous-catégorie
   et pour chaque aliment des sous-catégories mélangées; J-C corrige seulement ce qui ne colle pas
   (l'aliment : Gérer les bases → Aliments, là où sont ses endroits). Un aliment ajouté plus tard prend
   la durée de sa sous-catégorie. Une sous-catégorie sans durée (l'eau, l'entretien ménager) : jamais
   dans la liste. Rejeté : A (la sous-catégorie seulement : approximatif).

4. **« Bientôt » = le dernier quart de sa durée (choix B)** — J-C : « B ». Les framboises (3 jours) paraissent
   le dernier jour, le yogourt (3 semaines) la dernière semaine, la viande au congélo (4 mois) le dernier
   mois — le temps de la planifier. Rejeté : A (un nombre de jours fixe : les framboises dès l'épicerie,
   la viande du congélo 3 jours avant seulement).

5. **La date passée : il reste dans la liste, en tête, « date passée » en rouge (choix A)** — J-C : « A ».
   Jusqu'à ce qu'il sorte de la réserve; la date est une estimation, J-C juge (le manger ou le jeter).
   Rejeté : B (il quitte la liste comme s'il n'existait plus).

6. **Jeter : un choix « Jeté » sur la carte de Consommer (choix B)** — J-C : « B ». À côté de « Ne pas
   racheter »; l'aliment sort pareil, mais la trace dit la vérité (un yogourt jeté compté comme mangé
   fausserait la prévision du rachat). Revient sur « une seule raison : consommé » du 2026-09-29.
   Il faudra une colonne de plus à Sorties (K, la raison) — `api.gs`, à l'ordi.
   Rejeté : A (jeter = consommer : la trace faussée).

7. **L'horloge repart à chaque passage congélo ↔ frais (choix A)** — J-C : « A ». Le steak acheté il y a
   un mois, congelé, sorti aujourd'hui pour dégeler : ses 3 jours au frais partent d'aujourd'hui (sinon il
   paraîtrait « date passée » en arrivant au frigo); congelé aujourd'hui : ses 4 mois partent d'aujourd'hui.
   La date d'entrée (STOCK col. E) ne change pas (elle suit un lot déplacé depuis le 2026-09-29) : il faudra
   une date de plus à STOCK (P, le départ de l'horloge, vide = la date d'entrée), posée par Déplacer quand
   un lot passe d'un meuble « Congélateur » à un autre, ou l'inverse. Rejeté : B (toujours la date d'achat).

8. **Une durée se choisit dans un menu (choix A)** — J-C : « A ». 1 jour · 2 jours · 3 jours · 5 jours ·
   1 semaine · 2 semaines · 3 semaines · 1 mois · 2 mois · 3 mois · 6 mois · 1 an · 2 ans · Aucune
   (« Aucune » = jamais dans la liste). La sous-catégorie : Gérer les bases → Catégories; l'aliment :
   Gérer les bases → Aliments. Rejeté : B (taper un nombre de jours).

9. **La liste par catégorie (choix C, sur aperçu)** — J-C : « C ». Comme l'Inventaire par catégorie : les
   catégories en barres à leur couleur, une liste blanche dessous, la plus pressée en tête; chaque ligne :
   le nom, marque · saveur, où il est (« Frigo, Porte »), le temps qui reste (« Encore 3 jours », « Date
   passée » en rouge), la fourchette (Consommer, Jeté) et les deux flèches (Déplacer), la quantité.
   Rejetés : A (une seule liste, la plus pressée en tête — la reco de Claude), B (par meuble).
   L'aperçu : `scratchpad/apercu-bientot.html` (des aliments d'exemple).

10. **Pas de point rouge** — J-C : « la liste, c'est ce que je dois consommer bientôt, point »; « je regarde ».
    L'app ne fait pas signe (ni sur l'icône Listes, ni sur la barre, ni sur la catégorie) : J-C va voir la liste
    de lui-même.

11. **Le temps qui reste : seulement dans « À consommer bientôt » (choix A)** — J-C : « A ». Ni dans
    l'Inventaire, ni sur l'écran de rayon. Rejeté : B (aussi dans l'Inventaire).

**✅ RÉFLEXION FINIE le 2026-10-06.**

## 3. Ce qui est bâti (2026-10-06 au soir) — `JS/bientot.js` (chargé après `entree.js`)

1. ✅ **Gérer les bases → Meubles** : l'interrupteur « Congélateur » dans un meuble ouvert, sous sa couleur
   (`basculerCongelo()`, geste « lignes » Emplacements, la ligne réécrite avec la couleur que l'app montre;
   `MEUBLES[].congelo`; `.bloc .interrupteur` : le rond se creuse sur le blanc).
2. ✅ **Gérer les bases → Catégories** (2026-10-07, J-C : « Ça sera A », sur aperçu parmi A sous le nom / B sur la ligne /
   C un bloc à part / D on touche le nom) : le menu de la durée **sous le nom de chaque sous-catégorie** (`.nom-duree`,
   `htmlDureeSousCat()`, `choisirDureeSousCat()`, Categories col. E). En tête : « Proposée : 3 semaines » — aussi quand elle vient de sa catégorie (J-C, 2026-10-07 : « Proposée », pas « Comme sa catégorie »). Le crayon renomme le nom seulement (`ouvrirRenommer()` le trouve au-dessus de la durée).
3. ✅ **Gérer les bases → Aliments** : « Durée » dans un aliment ouvert, sous sa sous-catégorie (`htmlDureeAliment()`,
   `choisirDureeAliment()`, Produits col. K). En tête du menu, ce qui vaut sans choix : « Proposée : 3 jours » — aussi quand elle vient de sa sous-catégorie (J-C, 2026-10-07 : « Proposée »).
4. ✅ **Listes → À consommer bientôt** (`#liste-bientot`, `remplirBientot()`, `lignesBientot()`) : par catégorie,
   fermées à l'ouverture (refaite chaque fois qu'on l'ouvre), la plus pressée en tête; une ligne = aliment + endroit +
   marque + saveur + jours qui restent; « Encore 3 jours » / « Encore 2 semaines » / « Encore 3 mois » / « Date passée »
   (`.date-passee`, rouge). La fourchette et les flèches : la carte de l'Inventaire (`ouvrirActionInventaire()` sert les
   deux listes); ce qui était ouvert le reste après un geste. « Rien à consommer bientôt. » quand c'est vide.
5. ✅ **« Jeté »** sur la carte de Consommer (l'écran Consommer et la carte de l'Inventaire / de la liste) : coché, le
   bouton dit « Jeter », le message « Jeté »; `consommerPart(…, jete)` → Sorties col. K = J.
6. ✅ **Déplacer** (`deplacerLot()`) : un lot qui entre au congélo ou en sort → STOCK col. P = aujourd'hui
   (`poserHorloge()`); la part qui reste garde la sienne. Le reste d'un pack (Consommer) garde maintenant toutes les
   colonnes de sa ligne (son épicerie, son horloge) — avant : 13 colonnes.

**Un changement de façon, pas de décision** : les durées proposées **ne sont pas écrites dans le Sheet**, l'app les
calcule (`PROPOSEES_CATS`, `PROPOSEES_ALIMENTS`, `SOUSCATS_MELANGEES`). Ce que J-C choisit s'écrit (col. E, col. K) et
l'emporte. Gain : **un fruit ou un légume ajouté plus tard prend aussi sa durée** (les framboises : 3 jours, pas les 7 de
« Fruits »), et rien à écrire d'un coup. Le nom : le mot qui vient le plus tôt, le plus long d'abord (« Pommes de terre »
n'est pas une pomme, « Courge orange » est une courge, « Fromage cheddar » un cheddar). Le calcul : l'horloge (col. P,
sinon E) + la durée (congélo : 120 jours; sinon `dureeAliment()`); dans la liste quand il reste ≤ max(1, ⌈durée ÷ 4⌉) jours.
Essai dans le faux navigateur : 36 vérifications (heure du Québec).

## 4. Pour le coffre-fort (`api.gs`, à l'ordi — un seul collage)

Des colonnes au bout, rien ne bouge; l'app les envoie dans les lignes qu'elle écrit déjà :
- **Emplacements G `Congelateur`** (O / vide) — `modifier` réécrit la ligne de 7 colonnes.
- **Produits K `DureeVieJours`** (vide = celle de la sous-catégorie; 0 = Aucune) — `modifier` / `ajouter` : 11 colonnes.
- **Categories E `DureeVieJours`** : déjà là (vide = hérite; 0 = Aucune) — rien à faire.
- **STOCK P `Horloge`** (AAAA-MM-JJ, vide = la date d'entrée) — `deplacer` réécrit la ligne au complet,
  P comprise; à relire en date comme E (`texteDates`).
- **Sorties K `Raison`** (vide = consommé, `J` = jeté) — `consommer` écrit la 11e colonne de `sortie`.
Vérifier que chaque action écrit bien la ligne telle que l'app l'envoie (sans la couper), poser les
en-têtes, essayer à blanc, l'inscrire ici.

**✅ ÉCRIT le 2026-10-06 (à l'ordi), essayé à blanc (22 vérifications) — ✅ COLLÉ par J-C le 2026-10-07.** Vérifié : `modifier`,
`ajouter`, `deplacer` (modifs et ajouts), `consommer` (la sortie) écrivent la ligne **telle que l'app l'envoie**, sans
la couper; `texteDates` relit toute colonne en date (P comprise). Ajouté : les en-têtes (Produits K, Stock P,
Emplacements G, Sorties K) posés par `assurerEntetes()` à la prochaine entrée — une ligne d'en-tête lue d'un coup par
onglet (`poserEntetes()`, moins d'appels qu'avant), un onglet trop étroit élargi d'abord; `ENTETES.Sorties` gagne
`Raison`; `reunirProduits` passe aussi **la durée** (col. K) du perdu au gardé s'il n'en a pas, comme l'ordre des endroits.
