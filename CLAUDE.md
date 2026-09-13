# CLAUDE.md — La Réserve des Gourmands

> Chargé automatiquement à chaque session. Si ma mémoire interne est perdue, ce fichier me reconstruit. **À lire en premier, avant de répondre quoi que ce soit.**

## Qui + comment travailler (NON NÉGOCIABLE)

L'utilisateur est **Jean-Claude**, méthodique. Deux usagers de l'app : lui et son conjoint. Il a été échaudé par des « Claude pressés » qui ont mal bâti le premier projet. Mon rôle : **un guide qui prend le volant et qui challenge** (« as-tu pensé à ceci? »), PAS un exécutant pressé.

- **Réponses courtes.** Pas de romans, pas de longues listes à puces.
- **Une seule question à la fois.**
- **Zéro code tant que la réflexion n'est pas finie** — le code lui donne de l'urticaire. On parle ACTIONS, jamais implémentation.
- **Un sujet à la fois, creusé à fond.** Ne JAMAIS proposer de passer au suivant tant que le courant n'est pas épuisé — **c'est Jean-Claude qui décide**. Ne pas pousser.
- **Expliquer AVANT de faire**, il valide, ensuite on agit. Jamais coder/agir sans accord explicite.
- Méthode = brainstorm + arbres décisionnels (« j'appuie sur un bouton, quels sont TOUS les scénarios »).
- Parenthèse vers un autre sujet = la NOTER, ne pas la creuser, refermer.
- Correction de code (le jour venu) : trouve/remplace, UNE à la fois, attendre le « ok ». Bloc « réécrit » = bloc complet prêt à copier-coller, sans jargon.

## L'essence du projet

Ce n'est PAS une app d'épicerie. C'est **UN moteur + UNE base de données pour tout ce qu'on possède** dans la maison (nourriture, quincaillerie, passe-temps…). Tout item vit le même cycle : **entre → quantité → rangé → sort → manque** (déclenche le rachat). Les **secteurs** ne se distinguent **qu'à l'affichage, jamais dans les données**. « La Réserve des Gourmands » = le secteur **Épicerie**, le premier construit; Bricoleurs/Jardiniers = d'autres secteurs du même moteur.

Principes structurels non négociables (détail dans `RdG-00`) : rien de fixe (listes gérées dans l'app) · IDs date/heure, liens par ID jamais par nom · colonnes lues par position exacte, jamais par nom d'en-tête · clé + Sheet cachés derrière un Apps Script « coffre-fort » · tout le style découle du root · logique entonnoir partout.

## Où on en est

**Bascule (2026-09-12) : de la réflexion à la construction.** Jean-Claude a décidé de **bâtir et tester le point 1 (l'entrée)** pour apprendre en voyant, plutôt qu'imaginer d'avance toutes les situations. Son contrat : **ça marche** + **conçu pour évoluer**. Il délègue les décisions de structure à Claude (pas de revue colonne par colonne).

Brainstorm des 12 actions : **faits 1, 2, 3, 4** · **partiel 8** · restent 5, 6, 7, 11, 12.
- Point 4 « trouver » = la MÊME fiche-consultation que le point 3, appelée de la maison. La fiche montre *où + quantité* en « X sur total », une ligne « en transit » à part, le statut « déjà dans la liste d'achats » (le rachat est automatique au manque). Depuis la fiche on peut lancer un **déplacement** (point 7 : change la place, jamais le total).

**Construction du point 1** — structure dans **`RdG-structure-donnees.md`** (6 tables : cœur Produits / Emplacements / Stock · support Secteurs / Catégories / Codes). Nouveau Sheet propre + coffre-fort Apps Script remplacent l'ancien OAuth/clé API.

Fait ✅ (testé de bout en bout le 2026-09-13) : (1) Sheet monté, 6 onglets (`gas/setup.gs`); (2) **coffre-fort déployé et en ligne** — accès par **mot de passe** gardé dans les Propriétés du script, coffre-fort lié à la Sheet donc aucun ID, aucune clé/mot de passe dans le code public (`gas/api.gs`); (3) **`reserve.html` en ligne** (GitHub Pages) : connexion + ajout d'un produit → arrive « en transit » dans la Sheet. Prochain morceau naturel : le **rangement** (donner une place aux « en transit »).

## Conventions de l'app (à respecter, ne pas régresser)

- **Style** : tout dans **`base.css`**, générique — une base + variantes (`bouton` + `bouton-vert` + `bouton-grand`), noms **français**, **toute valeur au root** (changer une fois = partout). On réutilise; on n'ajoute un style que si aucun existant ne fait la job. (L'ancien `styles.css` ne sert QUE l'ancienne app.)
- **Logique** : la communication avec le coffre-fort vit dans **`coffre.js`** (partagé : `Coffre.lire / ajouter / modifier / connexion`). **Aucun script inline** dans le HTML — chaque page = structure + `coffre.js` + son propre `.js`.
- **App en ligne** : `reserve.html` (GitHub Pages) parle au coffre-fort par **mot de passe** (Propriété du script `MOT_DE_PASSE`). URL du coffre-fort dans `coffre.js`.

## Git — à ne jamais pousser

Le dépôt GitHub est **public**. Les fichiers **`.gs`** (Google Apps Script) ne sont **jamais** commités ni poussés — ils contiennent la clé API et l'ID du Sheet. Ils vivent dans le dossier (pour copier-coller dans l'éditeur Apps Script) et sont exclus par `.gitignore`.

## Les documents (source de vérité, à lire)

- **`RdG-00-le-projet-fondations.md`** — « Le Projet » : le pourquoi, les principes, l'ordre de construction.
- **`RdG-01-entree.md`** — brainstorm de juillet : la méthode complète + les 12 actions + l'entrée (point 1).
- **`RdG-02-sortie-2026-09-03.md`** — sortie / consommer (point 2).
- **`RdG-03-en-ai-je-deja-2026-09-03.md`** — « en ai-je déjà? » au magasin (point 3).
- **`RdG-structure-donnees.md`** — LA référence des colonnes (positions exactes) : les 6 tables du point 1, bâties pour évoluer.

⚠️ **`README.md`** décrit l'**ancienne** structure technique (Sheet + code, février 2026), **abandonnée**. Référence **visuelle** seulement (le look est gardé comme base) — ce n'est PAS la base de données ni la structure actuelle.
