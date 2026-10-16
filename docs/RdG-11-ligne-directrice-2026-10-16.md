# RdG-11 — Une ligne directrice pour toutes les pages (2026-10-16)

> Le point 65 de la liste numérotée de `CLAUDE.md`. Né du 2e « On se refait une beauté ? » de J-C, devant sa capture de la Liste
> d'achats : « Ouf. Pas de ligne directrice dans ces pages. » — « Oui, une ligne directrice pour toutes les pages. Oui et épurer. »
> **EN RÉFLEXION — ZÉRO CODE.** Une question à la fois; un aperçu avant tout changement. Rien n'est appliqué tant que la ligne n'est
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
7. **Oui / Non = D, en icônes** (l'aperçu « Oui et Non », `scratchpad/apercu-ouinon/fait.py`, parmi A petits à droite, B le Oui
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

## 3. Ouvert

- **L'iPhone** : les boutons du menu y sont déjà au plancher (`--bouton-grand-haut`, 50 px) : les niveaux 2 et 3 y seront
  presque de la même taille que le menu (44 px, au plus petit).
- Le 607 de Catégories est doré, près de l'or du Retour.
- **Oui / Non** — aujourd'hui **trois façons** : petits, le Oui rouge au milieu de la ligne (retirer : `ouiNon()`); petits, le Oui
  vert (réunir : `demanderReunion()`; un lot, en deux demis); normaux, Oui vert et Non brun, en deux demis dessous (« L'associer à ce
  produit ? » : le scan, Compléter). **Aperçu envoyé le 2026-10-16** (`scratchpad/apercu-ouinon/fait.py`) : **A** petits, à droite de
  la question, Oui vert / Non blanc, partout · **B** comme A, le Oui qui retire en rouge · **C** deux demi-boutons sous la question, à
  la taille du niveau 3, Oui vert / Non blanc · **D** en icônes, le crochet vert / le X blanc, petits, à droite. **J-C : « D »** — décision 7 ci-dessus.
- Suivant / Sans la page (la même flèche) : à revoir à l'usage (décision 11).
- Les autres sortes : les barres, les pastilles, la case, l'interrupteur, les ronds et le feu, moins / plus, le scanner, la vignette, la tuile.
