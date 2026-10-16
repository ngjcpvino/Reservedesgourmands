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

## 3. Ouvert

- **L'iPhone** : les boutons du menu y sont déjà au plancher (`--bouton-grand-haut`, 50 px) : les niveaux 2 et 3 y seront
  presque de la même taille que le menu (44 px, au plus petit).
- Le 607 de Catégories est doré, près de l'or du Retour.
- Les autres sortes : les barres, Oui / Non (deux façons), les boutons à texte (Annuler, C'est ça…), les pastilles…
