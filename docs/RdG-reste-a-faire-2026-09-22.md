# Ce qui reste à faire — conversation du 21-22 septembre 2026

> Séance de **look** sur `rdg.html`. Tout ce qui est marqué ✅ est poussé sur `main` et testable.
> Ce document ne liste que ce qui **reste**.

---

## 🚧 BLOQUÉ — attend J-C devant l'ordinateur

### Réordonner les pièces, les meubles et les espaces

**Pourquoi c'est bloqué :** il faut voir `gas/api.gs`. Ce fichier est exclu du dépôt (il porte la clé et l'ID du Sheet), donc il n'existe pas dans le conteneur de Claude. Impossible d'écrire une modification serveur sans l'avoir lu.

**Ce que J-C doit faire :** coller dans la conversation la partie d'`api.gs` qui gère le routeur d'actions et les Emplacements — **sans les deux lignes qui portent la clé et l'ID du Sheet**.

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
- **Si l'onglet n'affiche aucune icône** : `favicon.svg` n'est pas lu par les vieux Safari. Il faudra exporter un PNG — Claude ne peut pas fabriquer d'image dans ce conteneur.

---

## 👀 À vérifier en ligne (les tests, c'est J-C)

- **Le contraste de la nouvelle palette.** Le trait des icônes est très fin (0,8). Mesuré sur fond : vert **4,4 → 3,5:1**, orange **2,6:1** inchangé, bleu **4,9 → 2,6:1**. Le bleu perd le plus — l'icône « Listes » va paraître fantomatique, surtout au soleil. Sorties possibles : épaissir le trait, ou foncer le bleu.
- **Les messages de succès** sont en vert **sur blanc**. Le nouveau vert est plus pâle : le texte est plus mou à lire.
- **Le meuble « Coin ».** Sa couleur tombe juste sous le seuil pâle/foncé (150 sur 255), donc son nom reste en crème. Si c'est limite à l'écran, c'est un seul chiffre à bouger dans `couleurPale()`, dans `entree.js`.
- **Le flou de 10 px en haut.** Si `--haut-ecran: 10px` ne dégage pas complètement la barre d'état d'iOS, il faudra mesurer sa hauteur réelle au lieu de la deviner — elle varie d'un modèle à l'autre.

---

## 🧹 Ménage de code — pas commencé, attend un « go »

J-C a dit : « je veux un code propre ». Voici ce qui reste, mesuré :

- **21 styles en dur dans `rdg.html`.** Du décor dans la structure, ce que le principe de neutralité interdit. Dix-neuf n'utilisent que des valeurs du root (des marges), mais **deux portent des valeurs inventées** : l'écran de scan, ligne de la vidéo (`#000`, `12px`, `60vh`) et ligne du code lu (`600`, `0.04em`). Ces deux-là sont les pires.
- **2 styles en dur écrits par `entree.js`** (un rembourrage et un `gap`). Le troisième, la couleur de fond du meuble, est **légitime** : c'est une donnée, pas du décor.
- **Aucune règle d'écran dans tout le CSS** (`@media` : zéro). L'iPhone et l'iPad reçoivent exactement la même mise en page. Ça a tenu jusqu'ici, mais c'est un choix par défaut, pas une décision.

---

## 💤 Écarté, mais récupérable

- **Le flou derrière le menu** (verre dépoli). Retiré à la demande de J-C. Pour le remettre : `backdrop-filter: blur(...)` sur `.menu` avec le préfixe `-webkit-`, plus une valeur au root. Trois lignes.
- **Découper `CLAUDE.md`** pour en sortir l'historique. Proposé par Claude, **rejeté** — et à juste titre : c'était demander à J-C de réaménager sa documentation pour compenser l'indiscipline des Claude. Ne pas y revenir.

---

## ✅ Fait dans cette conversation (pour mémoire)

Spinner « trois bouteilles de lait » · les 7 icônes dessinées dans le CSS · boutons à hauteur fixe 50/40 · favicon (bouteille à l'onglet, photo à l'écran d'accueil) · 10 px en haut des neuf écrans, burger accroché par calcul · photo à 75vh · menu à 75 % d'opacité, du haut de la photo jusqu'à 2 % du bas · le premier meuble décollé de sa pièce · retrait de 12 px dans les accordéons · le texte des meubles choisit sa couleur selon le fond · les 8 triangles sortis du HTML et du JS · un seul endroit ferme le menu · nouvelle palette (vert, orangé, bleu) · « LES SIX » en tête de `CLAUDE.md`.

**22 septembre** · la vieille branche `claude/simultaneous-project-conversations-qvduzn` est **effacée** (J-C, malgré un message d'erreur trompeur de GitHub) — le dépôt n'a plus qu'une branche, `main` · la **question de la branche est réglée une fois pour toute** dans `CLAUDE.md` : la consigne d'outillage qui impose une branche `claude/…` est connue et périmée, on l'ignore sans en avertir J-C.
