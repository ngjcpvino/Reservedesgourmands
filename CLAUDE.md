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
- **Contexte & perf** : souvent sur **iPad**, **VPN toujours actif**. La **vitesse est critique** — « un app lent, je m'en servirai pas » (dit textuellement). Sa référence de qualité/vitesse : son autre app **Dionysos** (section dédiée plus bas).

## L'essence du projet

Ce n'est PAS une app d'épicerie. C'est **UN moteur + UNE base de données pour tout ce qu'on possède** dans la maison (nourriture, quincaillerie, passe-temps…). Tout item vit le même cycle : **entre → quantité → rangé → sort → manque** (déclenche le rachat). Les **secteurs** ne se distinguent **qu'à l'affichage, jamais dans les données**. « La Réserve des Gourmands » = le secteur **Épicerie**, le premier construit; Bricoleurs/Jardiniers = d'autres secteurs du même moteur.

Principes structurels non négociables (détail dans `RdG-00`) : rien de fixe (listes gérées dans l'app) · IDs date/heure, liens par ID jamais par nom · colonnes lues par position exacte, jamais par nom d'en-tête · clé + Sheet cachés derrière un Apps Script « coffre-fort » · tout le style découle du root · logique entonnoir partout.

## Où on en est

**On CONSTRUIT** (bascule du 2026-09-12) : le point 1 (l'entrée), bâti et testé en vrai pour apprendre en voyant. Contrat : **ça marche** + **conçu pour évoluer**. J-C délègue la structure/le code à Claude; il valide les décisions et le comportement. (La règle « zéro code » ci-dessus vaut pour la RÉFLEXION d'un nouveau sujet, pas pour ce qu'on bâtit déjà.)

Brainstorm des 12 actions : **faits 1,2,3,4** · **partiel 8** · restent 5,6,7,11,12. (Point 4 « trouver » = même fiche que le 3 : où + quantité « X sur total », ligne « en transit », statut « déjà dans la liste »; peut lancer un déplacement = point 7.)

**L'app neuve — en ligne (GitHub Pages, dépôt public `ngjcpvino/Reservedesgourmands`)** :
- `index.html` (+`accueil.js`) — le **hub / page d'accueil** (racine du site) : hero photo + **4 blocs** + **5 accordéons** (Stock épuisé, Réserve vide, À consommer bientôt, En spécial, Listes en attente). **Bloc 1 (Entrée) → ouvre `reserve.html`**; les 3 autres (Trouver/Consommer/Listes) = avis « à venir ». Accordéons vides — à faire.
- `reserve.html` (+`entree.js`) — **la fiche d'entrée d'un article** : catégorie → sous-catégorie → produit (choisir un existant OU « + Nouveau ») → **marque** → **format** → **1 à N endroits** (meuble → espace + quantité; la carte d'endroit prend la **couleur du meuble**). Enregistrer = crée le produit + les lignes de stock placées.
- `base.css` = le style générique (voir Conventions). `coffre.js` = le client du coffre-fort (partagé).
- ⚠️ L'ancien `index.html` a été **remplacé** par le nouvel accueil (2026-09-13). L'ANCIENNE app survit dans le dépôt (`styles.css`, `scripts-*.js`, `quin.html`) mais n'est plus reliée — ne PAS s'en servir.

**Données (Sheet, 6 onglets — `RdG-structure-donnees.md`) — SEMÉES** :
- Secteur **Épicerie**; **Catégories** : 12 rayons / 48 sous-cat (taillées depuis Super C → `RdG-categories-superc.md`); **Emplacements** : 22 **meubles** / 74 espaces, chacun sa **Couleur** (col. F ajoutée); **Produits** : colonnes **Marque** (F) + **Format** (G) ajoutées.
- Scripts (dans `gas/`, jamais poussés) : `setup.gs` (montage), `semer.gs` (catégories), `semer-emplacements.gs`, `api.gs` (coffre-fort).
- Choix de J-C pour les catégories : **pas de plats préparés** (ils n'en achètent pas) · **surgelé = un lieu** (le congélo), pas un type (seule exception gardée : crème glacée) · non-alimentaire gardé = **Entretien ménager** seulement.

**⏳ EN ATTENTE — à faire par J-C (prévu demain)** : **redéployer le coffre-fort**. `gas/api.gs` a été refait en **mode « action »** (voir Vitesse). Coller le nouveau contenu dans le script `api`, puis **Déployer → Gérer les déploiements → crayon ✏️ → Nouvelle version** (GARDER la même URL, jamais « Nouveau déploiement »). Tant que ce n'est pas fait, l'app marche mais en **repli lent** (le client a un repli automatique).

**À suivre (parkings)** : rangement des « en transit »; le scan (rafale d'arrivée d'épicerie); brancher les 4 blocs + navigation accueil↔fiche; contenu des accordéons (manque, péremption, spéciaux, listes = pts 5/6/12); durée de vie sur les sous-catégories; **spinner** comme Dionysos; page de gestion des listes de base.

## Conventions de l'app (à respecter, ne pas régresser)

- **Style** : tout dans **`base.css`**, générique — une base + variantes (`bouton` + `bouton-vert` + `bouton-grand`), noms **français**, **toute valeur au root** (changer une fois = partout). On réutilise; on n'ajoute un style que si aucun existant ne fait la job. (L'ancien `styles.css` ne sert QUE l'ancienne app.)
- **Logique** : la communication avec le coffre-fort vit dans **`coffre.js`** (partagé : `Coffre.lire / ajouter / modifier / connexion`). **Aucun script inline** dans le HTML — chaque page = structure + `coffre.js` + son propre `.js`.
- **App en ligne** : `reserve.html` / `accueil.html` (GitHub Pages) parlent au coffre-fort par **mot de passe** (Propriété du script `MOT_DE_PASSE`). URL du coffre-fort dans `coffre.js`.
- **Vitesse (CRITIQUE)** : le coffre-fort répond en ~1 s/appel (mesuré) — c'est le NOMBRE d'appels qui tue, pas Apps Script. Règles : **jamais d'appels en parallèle** (le VPN de J-C les échappe → « Load failed ») → toujours **séquentiel**; **actions groupées côté serveur** (`references` = tout charger en 1 appel; `entrerArticle` = produit + stocks en 1 appel); **cache** des listes en `localStorage` (instantané ensuite); **login optimiste** (n'attend aucun appel réseau); **mot de passe en `localStorage`** (reste connecté). Modèle = Dionysos.

## Dionysos — l'app de référence de Jean-Claude

Son app d'inventaire de vin, **rapide et léchée** — LE modèle à imiter : `https://ngjcpvino.github.io/dionysos/index-v2.html` (GitHub Pages + même VPN que la Réserve → **prouve qu'Apps Script peut être rapide**; le problème n'était jamais Apps Script).
- Backend Apps Script en **mode « action »** : une fonction `appelBackend(action, data)` → un POST `{action, data, secret}`; chaque opération = **1 aller-retour**, tout le travail côté serveur (getConfig, getInventoryData, addBottle…). **C'est ce modèle qu'on copie** (`references`, `entrerArticle`…).
- Mot de passe (`vinoSecret`) en **localStorage** (reste connecté). **Spinner** de chargement + timeout (AbortController). Il ne cache PAS les données (nous, on le fait, en mieux).
- Fichiers : `scripts-socle-v2.js` (socle : constantes, `appelBackend`, spinner, init), `scripts-scanner-v2.js`, `scripts-fiche-v2.js`.

## Git — à ne jamais pousser

Le dépôt GitHub est **public**. Les fichiers **`.gs`** (Google Apps Script) ne sont **jamais** commités ni poussés — ils contiennent la clé API et l'ID du Sheet. Ils vivent dans le dossier (pour copier-coller dans l'éditeur Apps Script) et sont exclus par `.gitignore`.

## Les documents (source de vérité, à lire)

- **`RdG-00-le-projet-fondations.md`** — « Le Projet » : le pourquoi, les principes, l'ordre de construction.
- **`RdG-01-entree.md`** — brainstorm de juillet : la méthode complète + les 12 actions + l'entrée (point 1).
- **`RdG-02-sortie-2026-09-03.md`** — sortie / consommer (point 2).
- **`RdG-03-en-ai-je-deja-2026-09-03.md`** — « en ai-je déjà? » au magasin (point 3).
- **`RdG-structure-donnees.md`** — LA référence des colonnes (positions exactes) : les 6 tables du point 1, bâties pour évoluer.
- **`RdG-categories-superc.md`** — la liste finale des catégories Épicerie (12 rayons / 48 sous-cat), taillée avec J-C depuis Super C. Déjà semée.

⚠️ **`README.md`** décrit l'**ancienne** structure technique (Sheet + code, février 2026), **abandonnée**. Référence **visuelle** seulement (le look est gardé comme base) — ce n'est PAS la base de données ni la structure actuelle.
