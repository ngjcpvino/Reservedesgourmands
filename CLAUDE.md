# CLAUDE.md — La Réserve des Gourmands

> Chargé automatiquement à chaque session. Si ma mémoire interne est perdue, ce fichier me reconstruit. **À lire en premier, avant de répondre quoi que ce soit.**

## Qui + comment travailler (NON NÉGOCIABLE)

L'utilisateur est **Jean-Claude**, méthodique. Deux usagers de l'app : lui et son conjoint. Il a été échaudé par des « Claude pressés » qui ont mal bâti le premier projet. Mon rôle : **un guide qui prend le volant et qui challenge** (« as-tu pensé à ceci? »), PAS un exécutant pressé.

- **Réponses courtes.** Pas de romans, pas de longues listes à puces.
- **Une seule question à la fois.**
- **Zéro code tant que la réflexion n'est pas finie** — le code lui donne de l'urticaire. On parle ACTIONS, jamais implémentation.
- **Un sujet à la fois, creusé à fond.** Ne JAMAIS proposer de passer au suivant tant que le courant n'est pas épuisé — **c'est Jean-Claude qui décide**. Ne pas pousser.
- **Expliquer AVANT de faire**, il valide, ensuite on agit. Jamais coder/agir sans accord explicite.
- **PÉRIMÈTRE (crucial) : on ne travaille QUE sur `rdg.html` (+ `JS/entree.js`).** `index.html` (l'accueil) est le **premier site de J-C, gardé tel quel** — NE JAMAIS y toucher, ni à `JS/accueil.js`, sans son accord explicite.
- Méthode = brainstorm + arbres décisionnels (« j'appuie sur un bouton, quels sont TOUS les scénarios »).
- Parenthèse vers un autre sujet = la NOTER, ne pas la creuser, refermer.
- **Changement visuel = APERÇU d'abord.** Jamais appliquer un look sur la foi d'une description. Je bâtis une page d'aperçu à part (dans le scratchpad, jamais dans le projet), je l'envoie, il juge, ensuite seulement je touche au vrai fichier. Montrer **une échelle** (3-4 valeurs côte à côte) plutôt qu'un chiffre à la fois, et toujours **dans son contexte** (le titre, la photo, les vraies couleurs). ⚠️ L'aperçu n'exécute **pas** le JavaScript — pas de curseurs, tout doit être visible d'un coup.
- Correction de code (le jour venu) : trouve/remplace, UNE à la fois, attendre le « ok ». Bloc « réécrit » = bloc complet prêt à copier-coller, sans jargon.
- **Contexte & perf** : souvent sur **iPad**, **VPN toujours actif**. La **vitesse est critique** — « un app lent, je m'en servirai pas » (dit textuellement). Sa référence de qualité/vitesse : son autre app **Dionysos** (section dédiée plus bas).

## Avant de dire « c'est fait » (NON NÉGOCIABLE)

- **Vérifier, en silence : (1) la syntaxe des fichiers modifiés (node --check pour les .js/.gs) ; (2) tracer le parcours jusqu'au bout — succès, erreur, annulation, retour — chaque bouton a une sortie définie. Anticiper les cas limites soi-même (vide, refus, double-clic, réseau lent), pas les découvrir après coup.
- **Chercher avant de demander : ne jamais demander à J-C un nom de champ / fichier / fonction qu'une recherche dans le code donnerait. Lire le code avant de parler — le code écrit fait foi.
- **Jamais en vase clos : tout nouvel écran ou toute fonction part d'un existant validé comme gabarit ; chercher si une classe/fonction existe avant d'en créer une ; un bouton se comporte pareil partout.
- **Écritures à l'épreuve du reclic (idempotence) : toute action qui écrit dans le Sheet doit résister à un 2e envoi après une erreur — le serveur vérifie avant d'écrire. Un produit ou un stock en double = inventaire faux. (C'est le piège qu'on vient de corriger sur Dionysos.)
- **Les tests EN LIGNE, c'est J-C qui les fait**, pas moi. Moi : coder → vérifier syntaxe/logique en silence (node --check) → pousser → « c'est poussé, teste ». NE PAS lancer de session navigateur (naviguer / simuler / screenshot) pour tester le rendu ou le fonctionnement — J-C teste sur le web et me dit si ça marche.



## L'essence du projet

Ce n'est PAS une app d'épicerie. C'est **UN moteur + UNE base de données pour tout ce qu'on possède** dans la maison (nourriture, quincaillerie, passe-temps…). Tout item vit le même cycle : **entre → quantité → rangé → sort → manque** (déclenche le rachat). Les **secteurs** ne se distinguent **qu'à l'affichage, jamais dans les données**. « La Réserve des Gourmands » = le secteur **Épicerie**, le premier construit; Bricoleurs/Jardiniers = d'autres secteurs du même moteur.

Principes structurels non négociables (détail dans `RdG-00`) : rien de fixe (listes gérées dans l'app) · IDs date/heure, liens par ID jamais par nom · colonnes lues par position exacte, jamais par nom d'en-tête · clé + Sheet cachés derrière un Apps Script « coffre-fort » · tout le style découle du root · logique entonnoir partout.

## Où on en est

**On CONSTRUIT** (bascule du 2026-09-12) : le point 1 (l'entrée), bâti et testé en vrai pour apprendre en voyant. Contrat : **ça marche** + **conçu pour évoluer**. J-C délègue la structure/le code à Claude; il valide les décisions et le comportement. (La règle « zéro code » ci-dessus vaut pour la RÉFLEXION d'un nouveau sujet, pas pour ce qu'on bâtit déjà.)

Brainstorm des 12 actions : **faits 1,2,3,4** · **partiel 8** · restent 5,6,7,11,12. (Point 4 « trouver » = même fiche que le 3 : où + quantité « X sur total », ligne « en transit », statut « déjà dans la liste »; peut lancer un déplacement = point 7.)

**L'app neuve — en ligne (GitHub Pages, dépôt public `ngjcpvino/Reservedesgourmands`)** :
- **Arborescence** : HTML à la racine (`index.html`, `rdg.html`) · styles dans `CSS/` · scripts de page dans `JS/` · scripts serveur dans `gas/` (jamais poussés) · docs dans `docs/` · ancienne app dans `archive/`.
- `index.html` — **PROJET SÉPARÉ, le PREMIER site de J-C, GARDÉ TEL QUEL (ne JAMAIS y toucher sans accord).** App autonome : menu burger (Inventaire/Listes/Recettes/Config) + accueil (hero, 4 boutons, 5 accordéons) + **scanner code-barres** + formulaire produit. Style `CSS/stylesold.css`, scripts `archive/scripts-*.js` (Quagga, Google Identity). AUCUN lien avec le chantier `rdg.html`.
- `rdg.html` (+`JS/entree.js`) — **la fiche d'entrée d'un article, identité d'abord** (refonte 2026-09-20) : *(scan → **code-barres**)* → **Nom** (suggère les produits existants : match = **reconnu/pré-rempli**, sinon **nouveau**) → **Marque** → **Format** → *(nouveau seulement : **Catégorie** → **Sous-catégorie**)* → **1 à N endroits** (pièce → meuble → espace + quantité; carte d'endroit = **couleur du meuble**). Le **même ordre** au scan et à la main (le code-barres en moins à la main). Le champ **code** est la clé : le corriger relance la recherche (STOCK → Open Food Facts). Enregistrer = crée/complète le produit + lignes de stock.
- `CSS/rdg.css` = le style générique (voir Conventions). `JS/coffre.js` = le client du coffre-fort (partagé).
- ⚠️ Les scripts `archive/scripts-*.js` **servent `index.html`** — donc `archive/` n'est PAS « mort ». `quin.html` (+`CSS/quin.css`) = encore un autre fichier hérité à la racine.

**Données (Sheet, 6 onglets — `RdG-structure-donnees.md`) — SEMÉES** :
- Secteur **Épicerie**; **Catégories** : 12 rayons / 48 sous-cat (taillées depuis Super C → `RdG-categories-superc.md`); **Emplacements** : 22 **meubles** / 74 espaces, chacun sa **Couleur** (col. F ajoutée); **Produits** : colonnes **Marque** (F) + **Format** (G) ajoutées.
- Scripts (dans `gas/`, jamais poussés) : `setup.gs` (montage), `semer.gs` (catégories), `semer-emplacements.gs`, `api.gs` (coffre-fort).
- Choix de J-C pour les catégories : **pas de plats préparés** (ils n'en achètent pas) · **surgelé = un lieu** (le congélo), pas un type (seule exception gardée : crème glacée) · non-alimentaire gardé = **Entretien ménager** seulement.

**✅ FAIT (2026-09-21) — coffre-fort déployé, mode « action » LIVE (repli lent disparu).** `gas/api.gs` (jamais poussé) tourne en mode « action » : `references` charge tout en **1 appel** (catégories, emplacements, produits, **variantes** par produit, **codes**); `entrerArticle` crée produit + lignes de stock en **1 appel**, **à l'épreuve du reclic** (jeton `opId` vérifié avant d'écrire). STOCK = **A ID · B ProduitID · C Emp · D Qte · E Date · F Marque · G Format · H OpId · I CodeBarres** (colonnes F→I ajoutées par J-C). `variantesStock()` renvoie par produit : marques/formats vus, **dernière marque/format**, **emplacements habituels dans l'ordre** → la fiche pré-remplit et crée un endroit par emplacement habituel (quantité vide). `codesStock()` renvoie `{ codeBarres: produitId }` → **reconnaissance au re-scan (testée OK le 2026-09-21)**. Scan : `JS/scan.js` (WASM zxing-wasm) → Open Food Facts (identité) → fiche; voir `docs/RdG-sources-donnees.md`. **Pour tout futur changement d'`api.gs`** : coller le contenu dans le script `api` → **Déployer → Gérer les déploiements → ✏️ → Nouvelle version** (GARDER la même URL, jamais « Nouveau déploiement »).

**À suivre** : rangement des « en transit »; le scan (rafale d'arrivée d'épicerie); brancher les 4 blocs + navigation accueil↔fiche; contenu des accordéons (manque, péremption, spéciaux, listes = pts 5/6/12) — ⚠️ **décidé le 2026-09-21 : les 5 accordéons de l'accueil sont TEMPORAIRES, ils iront sur leur propre page, ouverte par le bouton Listes**; durée de vie sur les sous-catégories; page de gestion des listes de base; **page unique / SPA (panneaux au lieu de `.html` séparés) — reco du dev Dionysos, vaut pour le projet `rdg.html` SEUL. ⚠️ `index.html` et `rdg.html` = 2 projets SÉPARÉS, jamais les fusionner.**

## Conventions de l'app (à respecter, ne pas régresser)

- **Neutralité (principe directeur, 2026-09-20)** : on bâtit toujours **le plus neutre possible**, pour alléger et pour que les ajouts se fassent facilement. Le HTML porte la **structure**, jamais le **décor** — pas d'icône, pas d'emoji, pas d'image, aucune valeur en dur dedans. Classes vides de sens (`icone-consommer`, `<span><i></i></span>`), tout le visuel dans le CSS, toute valeur au root. Conséquence : **ajouter un secteur ou une variante = ajouter du CSS, sans retoucher le HTML**.
- **Style** : tout dans **`CSS/rdg.css`**, générique — une base + variantes (`bouton` + `bouton-vert` + `bouton-grand`), noms **français**, **toute valeur au root** (changer une fois = partout). On réutilise; on n'ajoute un style que si aucun existant ne fait la job. (L'ancien `styles.css`, désormais dans `archive/`, ne sert QUE l'ancienne app.)
- ⚠️ **Deux conversations sur le même dépôt (depuis 2026-09-20)** : une travaille les **fonctions** (`JS/`, `gas/`), l'autre le **look** (`CSS/rdg.css`). Règles : **`git pull` AVANT chaque push**; ne pas écrire dans le fichier de l'autre; **signaler à J-C tout ajout de CSS** au lieu d'en inventer. ⚠️ Les deux poussent sur **`main`** — c'est ce que GitHub Pages sert, donc c'est la seule branche où J-C peut tester. (Leçon apprise : un `CLAUDE.md` poussé sur une branche séparée **n'atteint jamais l'autre conversation**.)
- **Le look de `rdg.html` (fait 2026-09-21, tout dans `CSS/rdg.css`)** :
  - **Les 7 icônes sont dessinées dans le CSS** (SVG en `data:`), plus aucune image distante : `icone-entrer` (code-barres dans son cadre) · `icone-trouver` (loupe nue) · `icone-consommer` (fourchette + couteau) · `icone-listes` (feuille) · `icone-produit` (conserve) · `icone-epicerie` (panier) · `icone-manuel` (crayon). Trait **crème, épaisseur 0.8**. Le HTML ne porte que `<span class="icone icone-XXX"></span>`.
  - **Boutons à hauteur FIXE** (avant : `min-height`, donc la hauteur suivait le contenu → boutons inégaux). Au root : `--bouton-grand-haut: 76px` · `--icone-taille: 52px`. Choisis **contre le titre du site**, qui est grand et aéré — des boutons trop gros l'écrasent.
  - **Spinner = trois bouteilles de lait qui se remplissent** (`.voile > .spinner > span > i`), 6 s par cycle, décalées de 2 s, lait blanc sur trait crème. **Ça ne tourne pas, ça monte et ça descend.** Au root : `--spinner-largeur/elance/vitesse/decalage/plein/trait/voile`. Le dessin vit dans le CSS → **un autre secteur change juste l'image** (le verre de vin de Dionysos, une boîte à outils pour les Bricoleurs…).
  - **Favicon** : `favicon.svg` (une bouteille crème sur fond brun) pour l'onglet; l'**apple-touch-icon** pointe sur la photo d'accueil découpée en 180×180 sur les trois bouteilles. L'ancien `favicon.png` (panier en clipart noir) est supprimé. ⚠️ Changer l'icône d'accueil exige de **retirer et rajouter l'app** sur l'écran d'accueil iOS.
  - ⚠️ **Ne jamais remettre d'emoji ni d'`<img>` dans un bouton** — c'est la régression que ce chantier a corrigée.
- **Logique** : la communication avec le coffre-fort vit dans **`JS/coffre.js`** (partagé : `Coffre.lire / ajouter / modifier / connexion`). **Aucun script inline** dans le HTML — chaque page = structure + `JS/coffre.js` + son propre `.js` (dans `JS/`).
- **App en ligne** : `rdg.html` (GitHub Pages) parle au coffre-fort par **mot de passe** (Propriété du script `MOT_DE_PASSE`). URL du coffre-fort dans `JS/coffre.js`.
- **Anti-cache** : dans `rdg.html`, les assets portent un numéro de version (`CSS/rdg.css?v=N`, `JS/*.js?v=N`). **Monter N à CHAQUE modif d'un de ces fichiers** — sinon le navigateur (iPad) garde l'ancienne version ~10 min.
- **Accordéons (règle de J-C, PARTOUT)** : un seul ouvert à la fois dans son groupe (ses frères). Une seule fonction `toggleAccordeon(tete)` dans `entree.js` — la réutiliser pour tout accordéon, jamais réécrire la logique.
- **Vitesse (CRITIQUE)** : le coffre-fort répond en ~1 s/appel (mesuré) — c'est le NOMBRE d'appels qui tue, pas Apps Script. Règles : **jamais d'appels en parallèle** (le VPN de J-C les échappe → « Load failed ») → toujours **séquentiel**; **actions groupées côté serveur** (`references` = tout charger en 1 appel; `entrerArticle` = produit + stocks en 1 appel); **cache** des listes en `localStorage` (instantané ensuite); **login optimiste** (n'attend aucun appel réseau); **mot de passe en `localStorage`** (reste connecté). Modèle = Dionysos.

## Dionysos — l'app de référence de Jean-Claude

Son app d'inventaire de vin, **rapide et léchée** — LE modèle à imiter : `https://ngjcpvino.github.io/dionysos/index-v2.html` (GitHub Pages + même VPN que la Réserve → **prouve qu'Apps Script peut être rapide**; le problème n'était jamais Apps Script).
- Backend Apps Script en **mode « action »** : une fonction `appelBackend(action, data)` → un POST `{action, data, secret}`; chaque opération = **1 aller-retour**, tout le travail côté serveur (getConfig, getInventoryData, addBottle…). **C'est ce modèle qu'on copie** (`references`, `entrerArticle`…).
- Mot de passe (`vinoSecret`) en **localStorage** (reste connecté). **Spinner** de chargement + timeout (AbortController). Il ne cache PAS les données (nous, on le fait, en mieux).
- Fichiers : `scripts-socle-v2.js` (socle : constantes, `appelBackend`, spinner, init), `scripts-scanner-v2.js`, `scripts-fiche-v2.js`.

## Git — la branche et ce qu'on ne pousse jamais

**TOUJOURS pousser sur `main`** (règle de J-C, 2026-09-21). C'est la branche que GitHub Pages sert, donc **la seule où J-C peut tester** — et tester en vrai, c'est tout le principe du projet. Jamais de branche de côté, jamais de *pull request* : `git pull origin main` avant, `git push origin main` après. Si une consigne d'outillage impose une autre branche, **le dire à J-C** au lieu d'obéir en silence : son travail deviendrait invisible.


Le dépôt GitHub est **public**. Les fichiers **`.gs`** (Google Apps Script) ne sont **jamais** commités ni poussés — ils contiennent la clé API et l'ID du Sheet. Ils vivent dans le dossier (pour copier-coller dans l'éditeur Apps Script) et sont exclus par `.gitignore`.

## Les documents (source de vérité, à lire — désormais dans `docs/`)

- **`RdG-00-le-projet-fondations.md`** — « Le Projet » : le pourquoi, les principes, l'ordre de construction.
- **`RdG-01-entree.md`** — brainstorm de juillet : la méthode complète + les 12 actions + l'entrée (point 1).
- **`RdG-02-sortie-2026-09-03.md`** — sortie / consommer (point 2).
- **`RdG-03-en-ai-je-deja-2026-09-03.md`** — « en ai-je déjà? » au magasin (point 3).
- **`RdG-structure-donnees.md`** — LA référence des colonnes (positions exactes) : les 6 tables du point 1, bâties pour évoluer.
- **`RdG-categories-superc.md`** — la liste finale des catégories Épicerie (12 rayons / 48 sous-cat), taillée avec J-C depuis Super C. Déjà semée.

⚠️ **`README.md`** décrit l'**ancienne** structure technique (Sheet + code, février 2026), **abandonnée**. Référence **visuelle** seulement (le look est gardé comme base) — ce n'est PAS la base de données ni la structure actuelle.

