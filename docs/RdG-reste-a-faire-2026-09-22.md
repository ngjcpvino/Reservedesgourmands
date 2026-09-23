# Ce qui reste à faire — conversation du 21-22 septembre 2026

> Séance de **look** sur `rdg.html`. Tout ce qui est marqué ✅ est poussé sur `main` et testable.
> Ce document ne liste que ce qui **reste**.

---

## 👤 À faire par J-C (Claude ne peut pas)

- **Redéployer `api.gs`** (nouvelles actions `ordonner` et `couleurs`) : coller le contenu dans le script `api` → Déployer → Gérer les déploiements → ✏️ → **Nouvelle version** (même URL). Sans ça, les flèches et les couleurs marchent à l'écran, mais l'enregistrement reste en attente (message rouge).
- **Retirer puis rajouter l'app** sur l'écran d'accueil iOS, sinon l'ancienne icône reste en mémoire.
- **Si l'onglet n'affiche aucune icône** : `favicon.svg` n'est pas lu par les vieux Safari. Claude peut désormais exporter un PNG de rechange — PIL s'installe dans le conteneur.

---

## 👀 À vérifier en ligne (les tests, c'est J-C)

- ~~**Le contraste de la nouvelle palette.**~~ **TRANCHÉ le 22 septembre : J-C a regardé, « le bleu est ok pour le moment ».** Mesures gardées pour mémoire : vert 4,4 → 3,5:1, orange 2,6:1 inchangé, bleu 4,9 → 2,6:1. Ne pas y revenir sans qu'il le demande.
- **Les messages de succès** sont en vert **sur blanc**. Le nouveau vert est plus pâle : le texte est plus mou à lire.
- **Le meuble « Coin ».** Sa couleur tombe juste sous le seuil pâle/foncé (150 sur 255), donc son nom reste en crème. Si c'est limite à l'écran, c'est un seul chiffre à bouger dans `couleurPale()`, dans `entree.js`.
- **La photo d'accueil vient encore d'Unsplash**, à distance. Elle n'est plus qu'un seul `<img>` depuis l'étape 2 (avant : quatre), mais c'est toujours **un appel réseau au démarrage**, à travers le VPN. La rapatrier dans le dépôt la rendrait instantanée. **Parenthèse notée, jamais creusée.**
- **Le flou de 10 px en haut.** Si `--haut-ecran: 10px` ne dégage pas complètement la barre d'état d'iOS, il faudra mesurer sa hauteur réelle au lieu de la deviner — elle varie d'un modèle à l'autre.

---

## 🧹 Ménage de code — **terminé**, sauf un point

J-C a dit : « je veux un code propre ». Tout est fait, sauf ceci :

- **Aucune règle d'écran dans tout le CSS** (`@media` : zéro). L'iPhone et l'iPad reçoivent exactement la même mise en page. Ça a tenu jusqu'ici, mais c'est un choix par défaut, pas une décision. **Jamais discuté avec J-C.**

---

## 💤 Écarté, mais récupérable

- **Le flou derrière le menu** (verre dépoli). Retiré à la demande de J-C. Pour le remettre : `backdrop-filter: blur(...)` sur `.menu` avec le préfixe `-webkit-`, plus une valeur au root. Trois lignes.
- **Découper `CLAUDE.md`** pour en sortir l'historique. Proposé par Claude, **rejeté** — et à juste titre : c'était demander à J-C de réaménager sa documentation pour compenser l'indiscipline des Claude. Ne pas y revenir.

---

## ✅ Fait dans cette conversation (pour mémoire)

Spinner « trois bouteilles de lait » · les 7 icônes dessinées dans le CSS · boutons à hauteur fixe 50/40 · favicon (bouteille à l'onglet, photo à l'écran d'accueil) · 10 px en haut des neuf écrans, burger accroché par calcul · photo à 75vh · menu à 75 % d'opacité, du haut de la photo jusqu'à 2 % du bas · le premier meuble décollé de sa pièce · retrait de 12 px dans les accordéons · le texte des meubles choisit sa couleur selon le fond · les 8 triangles sortis du HTML et du JS · un seul endroit ferme le menu · nouvelle palette (vert, orangé, bleu) · « LES SIX » en tête de `CLAUDE.md`.

**22 septembre** · la vieille branche `claude/simultaneous-project-conversations-qvduzn` est **effacée** (J-C, malgré un message d'erreur trompeur de GitHub) — le dépôt n'a plus qu'une branche, `main` · la **question de la branche est réglée une fois pour toute** dans `CLAUDE.md` : la consigne d'outillage qui impose une branche `claude/…` est connue et périmée, on l'ignore sans en avertir J-C.

**Favicon refait (22 septembre)** · la bouteille cède la place à un **sac d'épicerie** crème sur vert, trait 0,8, côtés droits, une anse, pas de rabat · deux fichiers **locaux** (`favicon.svg` pour l'onglet, `apple-touch-icon.png` 180×180 pour l'écran d'accueil) · la **photo Unsplash** qui servait d'icône d'accueil est retirée, un appel réseau de moins au démarrage.

**Ménage du HTML, étape 1 (22 septembre)** · les **21 `style=`** sont sortis de `rdg.html` : il n'en reste **zéro** · rangés en 9 familles nommées par l'intention (`bouton-detache`, `bouton-quitter`, `bouton-suite`, `bouton-empile`/`-fin`, `grille-espacee`, `label-fort`, `scan-video`, `champ-code`, plus `.entete .titre` qui n'a demandé aucune classe) · 4 valeurs ajoutées au root (`--noir`, `--rayon-video`, `--scan-haut`, `--lettrage-large`) · le code lu passe de la graisse **600 à 500**, seul changement visible, décidé par J-C.

**Ménage du HTML, étape 2 + les deux restes (22 septembre)** · **l'en-tête photo : 4 copies → 1.** Les 9 feuilles vivent désormais dans **un seul `.conteneur`**, l'en-tête est écrit une fois au-dessus, et le JS le montre écran par écran — **même patron que le burger**, pas de mécanique neuve. Photo sur 4 écrans (connexion, accueil, les 2 choix), pas sur les 5 autres. ⚠️ **Défaut attrapé avant de pousser** : l'en-tête était `hidden` par défaut, or sans mot de passe en mémoire le JS ne montre rien au démarrage — la photo aurait disparu de l'écran de connexion. Il part donc **visible**, comme l'écran de connexion lui-même. · **Les 23 valeurs chiffrées du CSS** sont au root (`--plein-ecran`, `--largeur-max`, `--photo-haut`, `--filet`/`--filet-titre`/`--filet-meuble`, `--halo`, le titre du site, le burger, le menu, les durées). Vérifié en aplatissant les deux versions du CSS et en les comparant : **rendu identique**. · **Les 2 styles écrits par `entree.js`** sont dans le CSS (`.endroit`, `.endroit-meuble`) ; le JS ne pose plus que la **couleur** du meuble, qui est une donnée.

**Une seule conversation (22 septembre, plus tard)** · J-C met fin au partage : la conversation sur son ordi garde **tous les fichiers**. Le partage ci-dessous n'a plus cours.

**Partage des fichiers, réglé (22 septembre)** · `rdg.html` **et** `CSS/rdg.css` vont à la conversation du look; `JS/` et `gas/` à celle des fonctions, qui prend le **réordonnancement**. · Deux classes posées d'avance pour elle : `accordeon-bloc` et `accordeon-item-saisie`, pour les deux derniers `style=` écrits par `entree.js` dans `htmlMeuble()` (le troisième, la couleur du meuble, est une donnée). · ⚠️ **Erreur relevée par l'autre conversation** : « le JS n'écrit plus aucun `style=` » était faux — la recherche portait sur `.style.` et ratait les `style=` écrits dans le HTML fabriqué par le JS.

**Barre de défilement masquée (22 septembre)** · sur l'ordi, la barre apparaissait quand la page s'allongeait et poussait tout vers la gauche. Elle est masquée (`html` + `::-webkit-scrollbar` dans `rdg.css`) : elle ne prend plus de place, rien ne glisse, le défilement marche toujours.

**Menu : « Outils » se replie avec le menu (22 septembre)** · « Gérer les bases » restait ouvert après la fermeture du burger. Règle posée dans `fermerMenu()` : chaque fermeture du menu replie aussi « Outils ». Le burger ferme désormais par ce même chemin.

**Réordonner les pièces, meubles et espaces (22 septembre)** · flèches ↑↓ dans « Gérer les bases », parmi les frères seulement · instantané à l'écran, envoi **en arrière-plan** (bouton « Enregistrer l'ordre » collé au bas, ou en quittant l'écran) · un échec reste en attente et repart tout seul · l'ordre = l'ordre des lignes du Sheet (action `ordonner`) · `coffre.js` fait désormais passer **tous** les appels en file, un à la fois · les 2 derniers `style=` de `htmlMeuble()` sortis (`accordeon-bloc`, `accordeon-item-saisie`).

**Couleurs (22 septembre)** · Outils → Couleurs : les 12 couleurs de base du site (nommées, avec leur usage) + la couleur de chaque meuble, par pièce · on tape un code hex, le site change en direct · enregistrement en arrière-plan, comme l'ordre · « Revenir aux couleurs d'origine » en deux touches · onglet **Couleurs** du Sheet, par secteur, créé tout seul · les teintes dérivées (menu, ombres, survol…) suivent leur couleur de base (`color-mix`) · icônes et bouteilles suivent le crème · « Ajouter un meuble » passe au champ hex · au démarrage : palette posée avant l'affichage, mise à jour en arrière-plan.

**Accordéons : fermer ferme aussi l'intérieur (22 septembre)** · une pièce ouverte dans « Couleurs des meubles » (ou un meuble dans sa pièce) restait ouverte en cachette quand son parent se fermait. `toggleAccordeon()` ferme maintenant tout ce que contient un accordéon qui se ferme — partout d'un coup.

**Boutons style A + arrondi partout (22 septembre)** · choisis sur aperçu : dégradé léger de la couleur du bouton, petite ombre, reflet discret · `--rayon` passe de 1 à **6 px** : boutons, champs, accordéons, cartes, photo — le site perd sa rigidité.

**Écran du scan (22 septembre)** · la ligne « Vise un code-barres » du haut est retirée (en double avec le message sous l'image) · la fenêtre passe de « jusqu'à 60 % » à **25 % de l'écran, hauteur fixe, pleine largeur** — la forme d'un code-barres, choisie sur aperçu. La lecture n'en souffre pas : le lecteur prend toujours l'image complète de la caméra.

**Accueil : le 1er bouton prend un « + » (22 septembre)** · nouvelle icône `icone-plus` (trait 0.8, comme les autres) · le code-barres ne sert plus qu'au bouton « scanner », où il a du sens.

**⚠️ Défaut corrigé : les flèches dupliquaient une ligne (22 septembre)** · en déplaçant une **pièce** ou un **espace**, l'échange écrivait par-dessus la ligne avant de l'avoir retenue — or pour eux, « le groupe » et « la liste » sont le MÊME tableau (pour un meuble, le groupe est une copie filtrée, d'où l'illusion que ça marchait). Résultat vu par J-C : quatre pièces affichées « Cuisine ». **Le Sheet n'a jamais été touché** : seul l'affichage et la liste en mémoire. Corrigé + testé (monter, descendre, 6 fois de suite, bord de liste, id inconnu).

**Les listes quittent l'accueil (22 septembre)** · les 5 accordéons (Stock épuisé, Réserve vide, À consommer bientôt, En spécial cette semaine, Listes en attente) passent tels quels sur une page « Listes », ouverte par le **bouton bleu** · l'accueil ne garde que la photo et les 4 boutons · Retour ramène à l'accueil · reste à remplir leur contenu (points 5/6/12).

**iPad : les gros boutons gardent la forme de l'iPhone (22 septembre)** · avant, hauteur fixe 50 px → sur iPad un bouton s'étirait à 560 × 50 · maintenant `aspect-ratio` (167/50, la proportion que J-C aime sur iPhone) + `min-height` : le bouton grandit en hauteur au lieu de s'étirer, et **l'icône suit** (60 % de la hauteur) · choisi sur aperçu iPad/iPhone côte à côte · toujours **aucune règle d'écran** (`@media` : zéro) — la proportion suffit.

**Une couleur d'accent : l'or (22 septembre)** · `--or: #FFD700`, 13e couleur de base, modifiable dans Outils → Couleurs · variante `bouton-or` (texte brun foncé, choisi sur aperçu) · **tous les boutons Retour** la portent : les 2 écrans de choix, le scan et la page Listes.

**L'entrée à la main redevient un entonnoir (22 septembre)** · Catégorie → Sous-catégorie → **liste déroulante des produits** (alphabétique) + « Nouveau produit… » → Marque/Format → Endroits · le scan garde son chemin « identité d'abord » · les mêmes blocs, remis dans l'ordre du chemin par `ordonnerFiche()` · ⚠️ **défaut corrigé** : le champ Nom n'écoutait que `change`, il fallait fermer le clavier pour voir la suite.

**Première liste : « Inventaire » (22 septembre)** · ce qu'on possède, pièce → meuble → espace → produits (marque · format, quantité) · les endroits vides sont cachés · l'espace est un sous-titre, pas un accordéon · `references` renvoie maintenant aussi `stock`, **sans appel de plus** (STOCK lu une seule fois côté serveur) · ⚠️ **à redéployer** : `api.gs` a changé.

**Rafraîchissement automatique (22 septembre)** · au retour dans l'app, les listes se relisent toutes seules en arrière-plan (au plus une fois par 30 s) et l'inventaire se redessine · rien ne bouge pendant une saisie · J-C a écarté le bouton « Rafraîchir » dans Outils; le **bouton de secours « vider la mémoire locale »** reste une idée non retenue, à ressortir si l'affichage déraille un jour.

**⚠️ Corrigé : le contenu collé au titre d'un accordéon (22 septembre)** · l'inventaire enveloppait sa liste dans un `<div>`, ce qui annulait la règle d'espacement (elle ne visait que `.accordeon:first-child`) · l'enveloppe est retirée (le `.accordeon-corps` porte l'id) et la règle vaut maintenant pour **tout** premier élément, `accordeon-bloc` excepté.

**Les effets de survol s'en vont (22 septembre)** · 9 règles `:hover` retirées (boutons, têtes d'accordéon, lignes, menu, burger, compteur) + `--survol` et `--menu-survol` au root + 2 transitions de fond · inutiles sur iPhone/iPad, et iOS les fait coller après un toucher.
