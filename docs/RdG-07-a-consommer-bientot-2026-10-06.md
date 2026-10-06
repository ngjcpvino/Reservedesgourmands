# RdG-07 — À consommer bientôt (2026-10-06)

> La 2e liste de la page Listes (l'accordéon « À consommer bientôt », vide jusqu'ici).
> **EN RÉFLEXION — ZÉRO CODE.** Une question à la fois; c'est J-C qui décide.

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

## 3. Questions ouvertes (dans l'ordre, une à la fois)

1. **Une date passée cachée dans une catégorie fermée : un point rouge sur le chemin** (l'icône Listes
   du menu, la barre « À consommer bientôt », la catégorie), comme pour les circulaires ?
2. Où la date paraît ailleurs (Inventaire, écran de rayon ?).
