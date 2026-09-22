# Ce qui reste à faire — conversation du 21-22 septembre 2026

> Séance de **look** sur `rdg.html`. Tout ce qui est marqué ✅ est poussé sur `main` et testable.
> Ce document ne liste que ce qui **reste**.

---

## 🔓 DÉBLOQUÉ (22 septembre) — en cours

### Réordonner les pièces, les meubles et les espaces

**Débloqué :** la conversation qui tourne sur l'ordi de J-C lit `gas/api.gs` directement. Plus rien à coller.

**Déjà décidé, à ne pas rediscuter :**
- **Des flèches ↑↓**, pas de glisser-déposer (capricieux sur iPad, beaucoup plus de code).
- On bouge les lignes **à l'écran** sans rien envoyer, puis **un seul bouton « Enregistrer l'ordre »**. Sinon chaque flèche = un aller-retour d'une seconde au coffre-fort.
- **Règle des symboles :** triangle plein ▼ = plier/déplier, et il tourne. Flèche à tige ↑↓ = déplacer. Jamais un triangle pour déplacer.

**Reste à trancher (quand `api.gs` sera visible) :** stocker l'ordre dans une **nouvelle colonne** de l'onglet Emplacements, ou réordonner les **lignes elles-mêmes**. La deuxième voie n'exige aucune colonne à ajouter, puisque l'affichage suit déjà l'ordre des lignes et que rien ne référence leur position — tout se lie par ID.

**Pourquoi c'est nécessaire :** le bouton « + un espace » ajoute toujours **à la fin**. Une tablette ajoutée après coup se colle en bas, même si dans la vraie vie elle est au milieu. Et la configuration change parfois.

**Le principe de J-C, à respecter :** on compte les tablettes **à partir de celle que la main touche en premier**. Au-dessus du comptoir, c'est celle du bas. Sous le comptoir, c'est celle du haut. Une seule règle, deux résultats.

---

## 👤 À faire par J-C (Claude ne peut pas)

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
