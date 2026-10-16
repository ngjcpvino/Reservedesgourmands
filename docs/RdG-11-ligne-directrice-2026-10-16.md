# RdG-11 — Une ligne directrice pour toutes les pages (2026-10-16)

> Le point 65 de la liste numérotée de `CLAUDE.md`. Né du 2e « On se refait une beauté ? » de J-C, devant sa capture de la Liste
> d'achats : « Ouf. Pas de ligne directrice dans ces pages. » — « Oui, une ligne directrice pour toutes les pages. Oui et épurer. »
> **Décidée le 2026-10-16; appliquée à la Liste d'achats le même jour, les autres pages à venir.** Une question à la fois; un aperçu avant tout changement. Rien n'est appliqué tant que la ligne n'est
> pas finie (« à confirmer au final »).

## 1. Ce qu'on a vu (2026-10-16)

- Sur la Liste d'achats, **4 sortes de boutons** : les deux petits (Par catégorie / Par épicerie), les barres des catégories
  (accordéons), « Ajouter à la liste » (un bouton à texte, presque aussi haut qu'une barre), la maison dorée (deux fois plus haute).
- Sur tout le site, **14 sortes** (l'aperçu « Les boutons », `scratchpad/apercu-boutons/fait.py`) : 1 Gros bouton · 2 Tuile ·
  3 Retour (**trois tailles** : sous une liste, sous une grille, un demi dans les étapes) · 4 Bouton texte (vert, brun, blanc) ·
  5 Barre · 6 Choix · 7 Oui / Non (**deux façons**) · 8 Pastille · 9 Case à cocher · 10 Interrupteur · 11 Ronds et feu ·
  12 Moins / plus · 13 Scanner · 14 Vignette.

## 2. Décidé le 2026-10-16

1. **La forme d'une page, en trois parties** (l'aperçu « La forme des pages », `scratchpad/apercu-forme/fait.py`; J-C : « Oui, ça
   me va dans la logistique, ça apparaît quand il faut ») : **1. les actions en haut — rien d'autre tant qu'on n'a rien touché**
   (« tant que j'ai pas touché un bouton d'action, on ne devrait pas voir les accordéons ») · **2. ce que l'action ouvre** (les
   barres), sous les actions · **3. le Retour, toujours au bas.** Remplace « la Liste d'achats s'ouvre toujours sur Par catégorie »
   (`RdG-08`, choix B du 2026-10-07 — J-C : « C'était le 7 octobre… on évolue »).
2. **Un seul genre : le bouton d'action** — Par catégorie, Par épicerie, Ajouter à la liste et le Retour sont de la même famille
   que les boutons du menu (J-C : « par catégorie ou par épicerie, c'est un bouton d'action comme le Retour »).
3. **Sa taille dit le niveau** (J-C : « les boutons d'action 1, 2, 3 toujours un peu plus petits ») : niveau 1, le menu (le plus
   gros); niveau 2, une page ouverte du menu; niveau 3, la suivante. **Sur une page, tous de la même taille, le Retour compris.**
   **Le niveau 2 = B, 70 % de la hauteur du menu** (l'aperçu « Les niveaux », `scratchpad/apercu-niveaux/fait.py`, parmi 85 / 70 / 55 %).
   **Le niveau 3 = 50 %** (J-C : « Oui, 50 % pour le niveau 3 » — le même pas). **Sur l'iPhone, rien sous 44 px** (`--tactile`, la
   taille d'un doigt : proposé avec le niveau 3, pas contredit).
4. **Le moins de texte possible** : des icônes. Par catégorie et Par épicerie **reprennent les icônes de Gérer les bases** (les
   quatre cases, la devanture). Ajouter à la liste = le + (proposé par Claude).
5. **Une action garde son icône et sa couleur, partout** (J-C : « un Ajouter, c'est toujours la même couleur, par catégorie aussi,
   etc. ») : le + toujours le bleu du bouton Ajouter du menu (803), Par catégorie le 607 de Gérer les bases, Par épicerie le 802…
6. **Un choix touché, l'autre disparaît; la flèche du Retour ramène les deux** — comme Sans code des deux sacs (2026-10-15).
   Un choix pas pris ne pâlit donc plus. **À confirmer au final** (J-C).
7. **Oui / Non = D, en icônes** (avant : trois façons — petits, le Oui rouge au milieu de la ligne pour retirer; petits, le Oui vert
   pour réunir; normaux, Oui vert et Non brun dessous, au scan) (l'aperçu « Oui et Non », `scratchpad/apercu-ouinon/fait.py`, parmi A petits à droite, B le Oui
   rouge pour retirer, C deux demis dessous, D en icônes) : **le crochet vert = Oui, le X blanc = Non, petits, à droite de la
   question**, partout — la même couleur toujours (pas de rouge pour retirer : décision 5).
8. **Le crochet et le X, aussi hors des questions** (proposé par Claude, J-C : « Oui ») : **le crochet = je confirme** — OK, C'est ça,
   Oui c'est ça, C'est fait, Enregistrer, Enregistrer les couleurs, Mettre sur la liste; **le X = je laisse tomber** — Annuler.
   **À regarder à part** (une chose précise) : Voir chez Super C, Chercher chez…, Coller la page, Sans la page, Plus tard, Corriger,
   Suivant, Réessayer, Envoyer à Open Food Facts, L'ajouter, Scanner un autre, Un autre aliment, + un autre endroit, Choisir un
   endroit, Escale, Retirer, Enlever, Entrer, et les gestes du menu écrits en mots sur une carte : Consommer, Déplacer, Jeter, Ouvrir.
9. **Les gestes du menu, sur une carte, prennent leur icône et leur couleur du menu** (J-C : « Oui ») : Consommer = la fourchette et
   le couteau, rouge (401); Déplacer = les deux flèches, vert (702); Ouvrir = le biscuit croqué, bleu pâle (801); **Jeter = la
   poubelle** (beige, la couleur des petites actions sans bouton au menu).
10. **Ceux qui ont déjà une icône qui dit la même chose la prennent** (J-C : « Oui ») : **le +** — L'ajouter (Rechercher), + un autre
   endroit, Un autre aliment; **la poubelle** — Retirer (un endroit de la fiche), Enlever (un « Pas aimé »); **le crayon** — Corriger;
   **le code-barres** — Scanner un autre; **le logo d'Open Food Facts** — Envoyer à Open Food Facts.
11. **Les boutons écrits qui restent deviennent des icônes** (l'aperçu « Les autres boutons », `scratchpad/apercu-autres/fait.py`;
   J-C : « Icône ») : Coller la page = le presse-papiers · Suivant, Sans la page = la flèche du Retour tournée vers l'avant · Plus tard
   = l'horloge · Réessayer = la flèche qui tourne · Voir chez Super C, Chercher chez… = le logo de l'épicerie · Escale = le sac,
   Choisir un endroit = l'armoire · Entrer = la flèche qui entre par la porte. ⚠️ **Suivant et Sans la page** : la même flèche, seule la
   couleur change — J-C : « pas clair, mais je déciderai à l'utilisation ».
12. **Les autres sortes restent telles quelles** (l'aperçu « Les autres sortes », `scratchpad/apercu-sortes/fait.py` : la barre, la
   pastille, la case, l'interrupteur, les ronds et le feu, moins / plus, le scanner, la vignette, la tuile), **sauf la case à cocher :
   verte partout** (J-C : « La case verte partout ») — avant : verte dans la Liste d'achats (703), rouge sur la carte de Consommer
   (Ne pas racheter, Jeté : `.case`, 402).
13. **Moins / plus : plus étroit** (J-C : « Le + et −, trop large pour rien ») — aujourd'hui le champ du nombre prend toute la largeur
   entre les deux carrés.
14. **La carte de Consommer : Jeter et Consommer sur une même ligne** (J-C) — aujourd'hui une case « Jeté » change le mot du bouton
   Consommer; deux boutons côte à côte, la poubelle et la fourchette (décision 9). **Aperçu envoyé** (`scratchpad/apercu-conso/fait.py`) :
   A la poubelle et la fourchette côte à côte, le X seul dessous · B les trois sur une ligne — **J-C : « B »** : la poubelle (Jeter),
   la fourchette (Consommer) et le X (Annuler), en tiers, sur une même ligne; la case « Jeté » disparaît.
15. **Le titre d'une page, plus évident; la ligne dessous, toujours** (J-C : « Le titre de ces pages, pas assez évident. Garder toujours
   la ligne sous le titre de la page ») — aujourd'hui : en capitales, 22, léger, la ligne beige fine. **Aperçu envoyé**
   (`scratchpad/apercu-titre/fait.py`, la page Consommer) : A 28 léger · B 28 gras, la ligne brune · C 34 gras, la ligne brune plus
   épaisse · D 28 gras, l'icône et la couleur de son bouton du menu (la fourchette rouge, la ligne rouge) — **J-C : « D »** : chaque
   page porte, devant son titre, l'icône du bouton qui l'ouvre, dans sa couleur, et la ligne dessous prend cette couleur (la Liste
   d'achats : le chariot 303; Listes : la feuille 304; Rechercher : la loupe 703; Pièces, Meubles… : leur icône de Gérer les bases;
   Circulaires : l'étiquette 401…). ⚠️ À voir à l'application : une couleur pâle (Ouvrir et Pièces 801, Saveurs 701) se lira-t-elle
   en icône et en ligne sur le blanc ?
   **Le texte à 20, l'icône à 34** (J-C, le même soir, devant ses pages : « le titre est trop gros par rapport à l'icône qui est
   devant »; sur aperçu, A 28 · B 24 · C 22 · D 20, l'icône à 34, et E le texte à 28, l'icône à 46 — **« D »**).

## 3. Ouvert

- **L'iPhone** : les boutons du menu y sont déjà au plancher (`--bouton-grand-haut`, 50 px) : les niveaux 2 et 3 y seront
  presque de la même taille que le menu (44 px, au plus petit).
- Le 607 de Catégories est doré, près de l'or du Retour.
- Suivant / Sans la page (la même flèche) : à revoir à l'usage (décision 11).
- **L'aperçu final de la Liste d'achats, envoyé le 2026-10-16** (`scratchpad/apercu-final/fait.py`), en cinq moments : 1 en arrivant
  (le titre D, les trois actions au niveau 2, la maison de la même hauteur, aucune barre) · 2 après Par catégorie (Par épicerie
  disparaît, les catégories, la flèche) · 3 une catégorie ouverte · 4 après Par épicerie (les tuiles, elles aussi au niveau 2 :
  proposé par Claude) · 5 Ajouter à la liste (niveau 3 : le crochet et le X sur une ligne). **Son avis à venir.** ⚠️ Vu sur
  l'aperçu : **Par épicerie (802) et le + (803) sont deux bleus presque pareils, côte à côte** — J-C : « Effectivement, les 2 bleus… ».
  Proposé : **Magasins (donc Par épicerie) change de couleur, le + garde la sienne** (le bleu du bouton Ajouter, partout). **Aperçu envoyé**
  (`scratchpad/apercu-bleus/fait.py`, la Liste d'achats et la grille de Gérer les bases sur la photo nette) : A anthracite 902 · B olive
  704 · C vert sapin 703 (déjà Rechercher au menu) — **J-C : « Olive. Ça donne faim »** : Magasins (Gérer les bases) et Par épicerie
  passent au **704** (`--base-magasins`), le + garde le 803.
- **✅ APPLIQUÉE À LA LISTE D'ACHATS le 2026-10-16** (J-C : « Oui, applique-la »), pas encore testée en ligne (T87). Ce qui sert
  désormais à toutes les pages (`CSS/rdg.css`) : **le niveau** (`--niveau` au root = 1; `.niveau-2` / `.niveau-3` sur le bloc d'une page
  posent 0,7 / 0,5; un `.bouton-grand`, un `.bouton-large` et le Retour sous une grille suivent, jamais sous `--tactile`; les vieux
  `--bouton-grand-forme` / `--bouton-large-forme` retirés); **la couleur par l'action** (`data-action` sur un gros bouton : `categories`,
  `magasins`, `ajouter`, `oui`, `non` — `--action-oui` 703, `--action-non` 101); **le titre** (`.titre-action`, l'icône devant, `--t` posée
  par la page : `#vue-achats { --t: var(--menu-achats) }`); **le crochet et le X** (`icone-oui`, `icone-non`). La Liste d'achats :
  `CHOIX_ACHATS`, `vueAchats` = '' à l'ouverture, le + dans la grille (`data-achat-ajout`; « Ajouter à la liste » écrit retiré).
  Essai dans le faux navigateur : 21 vérifications.
- **Les autres pages, en quatre lots** (J-C : « Et déjà appliquer ces bases aux pages existantes ? Faire le ménage du CSS ? » — proposé par
  Claude : quatre lots, chacun poussé puis testé; « Go 1 »). Le ménage suit chaque lot (le CSS n'avait aucun reste inutile le 2026-10-16).
  - **✅ Lot 1, le 2026-10-16 (partout, les petites choses; pas encore testé, T88)** : **la case verte partout** (`.case` : `--action-oui`;
    avant : rouge hors de la Liste d'achats); **moins / plus plus étroit** (`.plus-moins > .champ` : `--qte-large`, 1,5 × `--tactile`);
    **Oui / Non = le crochet et le X, petits, à droite de la question** (`ouiNon()` — fini le Oui rouge —, la réunion, les cartes d'un lot
    de l'Escale et de Compléter : `.question`; `[data-confirme] > :first-child` prend la place, le Oui ne se pose plus au milieu);
    **le crochet** = Enregistrer (la fiche), Enregistrer les couleurs, OK (Compléter); **le X** = Annuler (la fiche). Pièces communes :
    `data-action` vaut désormais pour tout `.bouton` (`:is(.grille > .bouton-grand, .bouton)`), `--icone-reponse` (22) et `--icone-pleine` (28).
    **Laissés à leur lot, pour ne pas mêler mots et icônes sur une même ligne** : les étapes du tri (lot 3) et de Compléter (lot 4), les cartes
    de Consommer / Déplacer / l'Inventaire (lot 2, la carte B), la carte des deux sacs (lot 4 : ⚠️ « L'associer à ce produit ? » Non et
    Annuler y deviendraient deux X — à trancher avec J-C).
  - **✅ Lot 2, le 2026-10-16 (les pages du menu; pas encore testé, T89)** (J-C : « Go »; sur l'aperçu, `scratchpad/apercu-lot2/fait.py` :
    **A pour Ouvrir** — le biscuit et la ligne bleu pâle 801, parmi B le biscuit brun) : **chaque titre à l'icône et la couleur de son
    bouton du menu** — Listes (la feuille), Rechercher (la loupe, aussi sur l'écran de rayon), Consommer (la fourchette), Déplacer (les
    flèches), Ouvrir (le biscuit) : `titreRecherche()` pose `data-mode` sur `vue-recherche`, le CSS en tire `--t`; **les pages au niveau 2,
    les cartes au niveau 3**; **la carte de Consommer = B** (`htmlBoutonsConso()` : la poubelle — Jeter, beige, `data-action="jeter"`,
    `icone-poubelle` —, la fourchette, le X sur une ligne, `.grille-trois`), **la case « Jeté » retirée** (la poubelle la remplace), la
    même carte pour la fourchette d'une ligne de l'Inventaire et d'À consommer bientôt; **la carte de Déplacer** (`htmlBoutonsDeplacer()` :
    les flèches, cachées tant que l'endroit n'est pas choisi, le X); **L'ajouter = le +** (« Tu n'en as pas »); **l'Inventaire** : les
    quatre cases (Par catégorie) et l'armoire (Par meuble), un choix touché, l'autre disparaît, retouché ou la flèche du Retour : les deux
    (la flèche, encore : l'Inventaire se referme, puis le menu). Ménage : `.choix-eteint` retiré. Essai dans le faux navigateur : 30
    vérifications. Sur l'aperçu, J-C a vu « le produit trouvé collé sur le champ de recherche » : une erreur de l'aperçu seulement (dans
    l'app, le champ disparaît sur l'écran de rayon, et les résultats ont leur espace). Pas dans ce lot : les barres de Listes elles-mêmes
    (le point 52).
  - **✅ Lot 3, le 2026-10-16 (Outils, Gérer les bases, Couleurs, Circulaires, Qui entre; pas encore testé, T90)** (J-C : « On y va »; sur
    l'aperçu, `scratchpad/apercu-lot3/fait.py` : **A pour Outils**) : **Outils a ses couleurs, figées** (le point 25 : chacun garde la sienne,
    comme le menu — Gérer les bases 505, Couleurs 803, Qui entre 702 —, **Se déconnecter quitte le rouge pour l'anthracite 902**; `--outil-…`
    au root, `data-outil`); **les titres D** (Pièces, Meubles, Catégories, Aliments, Magasins, Marques, Saveurs, Unités, Circulaires : l'icône et
    la couleur de leur bouton de Gérer les bases; Couleurs : celle de son bouton d'Outils; la page des noms pose `data-page`); **ces pages au
    niveau 2** (le Retour, les tuiles de Circulaires); **Couleurs gagne son Retour** (la flèche → Outils; avant : on n'en sortait que par le
    menu); **Aliments : « Enlever » (Pas aimé) = la poubelle**, et sa question « Enlever … des Pas aimé ? » avec le crochet et le X
    (`demanderEnleverPasAime()`); **le tri, ses étapes en icônes, au niveau 3** (le panneau) — Son code-barres : **le logo de l'épicerie =
    Chercher** (`tuileMagasin()`, « Chercher chez Super C » pour le lecteur d'écran), **le presse-papiers vert = Coller la page**, la flèche,
    **la flèche vers l'avant blanche = Sans la page**; Ce que l'app a lu et Ton aliment : **la flèche, le X, le crochet sur une ligne**
    (`.grille-trois`); **Un autre aliment = le +**; **Suivant = la flèche vers l'avant verte** (le crochet change de dessin, `majTeteTri()`);
    **Entrer** (le mot de passe, Qui entre) **= la flèche qui entre par la porte**, brune, aussi haute qu'un bouton du menu. Pièces communes
    ajoutées : `icone-avant`, `icone-coller`, `icone-porte`; `data-action` `coller`, `suivant`, `sans`, `entrer`; une flèche dorée dans une grille
    garde l'or (`.grille > .bouton-grand.bouton-or`). Essai dans le faux navigateur : 34 vérifications.
  - Lot 4 : le + — le sac seul, les deux sacs, Compléter, la fiche, Open Food Facts.
    **À trancher d'abord (J-C : « Ouin… »)** : la carte des deux sacs, où « L'associer à ce produit ? » Non (= l'entrer sans l'associer) et
    Annuler (= oublier l'article) deviendraient deux X. **Aperçu envoyé le 2026-10-16** (`scratchpad/apercu-carte/fait.py`) : **A** comme au
    tri, « est-ce lui ? » — la quantité d'abord, puis la ligne de la circulaire et « Aucun », à toucher (la ligne = entrer et associer, Aucun =
    entrer sans), seul le X (Annuler) au bas · **B** la question, le crochet et le X à sa droite, le X d'Annuler au bas (deux X, deux sens) ·
    **C** une case « C'est lui : l'associer » sur la ligne, puis le crochet et le X, comme une carte sans circulaire (risque : oublier de
    cocher). Reco de Claude : A. **J-C : « A »** — la carte des deux sacs suivra le geste du tri.
    **Aperçu du lot 4 envoyé le 2026-10-16** (`scratchpad/apercu-lot4/fait.py`) : 1 le choix du + figé (le sac seul 505, les deux sacs 803,
    Compléter 702, comme aujourd'hui), leurs pages en prennent le titre; 2 le scan du sac seul (le sac orange au titre, niveau 2); 3 la fiche
    (Retirer un endroit = la poubelle, + un autre endroit = le +, Escale = le sac, Choisir un endroit = l'armoire, le crochet et le X sur une
    ligne); 4 les deux sacs (les deux sacs bleus et le nom de l'épicerie au titre; la carte A; sans circulaire : le crochet et le X); 5 Compléter
    (la feuille cochée verte; 1 le logo de Super C, le presse-papiers, Sans la page = la flèche vers l'avant blanche, le X; 2 la flèche, le
    crayon = Corriger, le crochet; 3 « L'associer ? » comme la carte A, Suivant = la flèche vers l'avant verte; 4 le +, la flèche, le X, le
    crochet); 6 Open Food Facts (leur logo au titre; Envoyer = leur logo sur blanc, Plus tard = l'horloge); 7 Réessayer = la flèche qui
    tourne. « Scanner un autre » (la page du scan) : jamais montré (le filet d'une fiche pas branchée) — à retirer au ménage. **J-C : « Go »**
  - **✅ Lot 4, le 2026-10-16 (le +; pas encore testé, T91)** : tel que l'aperçu. **Le choix du + figé** (`--quoi-…`, `data-quoi` : 505 · 803 ·
    702); **les titres D** — le scan (l'icône et la couleur de la page d'où l'on vient : `montrerScanner({ titre, icone, page })`, `data-page`;
    le sac seul par défaut), la fiche (le sac), les deux sacs et Compléter (`titreEpicerie()`, `data-quoi`), Open Food Facts (leur logo,
    `.logo-off`); **ces pages au niveau 2, leurs cartes au niveau 3**; **la fiche** : la poubelle d'un endroit (`.retirer.endroit-retirer`, au
    bout de sa carte), le + (un autre endroit), le sac (Escale, beige), l'armoire (Choisir un endroit), **le crochet et le X sur une ligne**
    (`ordonnerFiche()` range les blocs avant le message); **la carte des deux sacs = A** (sous la quantité, « Dans la circulaire de … : est-ce
    lui ? », la ligne et Aucun à toucher, `htmlLigneCirc(l, attr)` + `ligneAucun()`, le X seul au bas; sans circulaire : le crochet et le X;
    « Recherche du produit… » : le X); **Compléter** (`htmlPanneau()` : le logo de Super C = Voir — `tuileMagasin()` —, le presse-papiers,
    Sans la page = la flèche vers l'avant blanche, le crayon = Corriger, Suivant = la flèche vers l'avant verte, le crochet = Oui c'est ça et
    C'est fait, le + = un autre endroit; « L'associer ? » comme la carte A); **Open Food Facts** (Envoyer = leur logo sur blanc, Plus tard =
    l'horloge); **Réessayer** = la flèche qui tourne. Pièces ajoutées : `icone-crayon`, `icone-horloge`, `icone-reessayer`; `data-action`
    `escale`, `corriger`, `tard`, `off`. **Ménage** : « Scanner un autre » et le code lu (`scan-resultat`, `scan-code`, `scan-encore`,
    `.champ-code` — jamais montrés), `.bouton-quitter`; **la suite des couleurs ne colore plus aucune grille** (chaque bouton dit son action),
    avec elle la règle de l'or dans une grille. Essai dans le faux navigateur : 34 vérifications (et les 92 des lots d'avant, refaites).
  - **La ligne directrice est appliquée partout** (les quatre lots). Reste à confirmer au final : « un choix touché, l'autre disparaît »
    (décision 6), et à revoir à l'usage : Suivant / Sans la page (décision 11).
