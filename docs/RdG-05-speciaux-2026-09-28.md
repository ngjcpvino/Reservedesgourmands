# RdG — Les spéciaux de la semaine
*Session du 28 septembre 2026. Réflexion FERMÉE, rien n'est bâti encore.*
*Se lit après RdG-03 (« en ai-je déjà? ») et RdG-04 (les données saisies).*

---

## 1. CE QUE C'EST

Jean-Claude se sert d'**Economilk** (economilk.ca), qui classe les rabais des
circulaires du Québec. Il veut que la Réserve fasse la même chose, mais **sur
ce que la maison achète vraiment**. Il y a deux besoins, et il veut **les deux** :

- voir **les spéciaux sur ce qu'on achète d'habitude** ;
- être **averti quand un aliment qui manque est en spécial**.

L'accordéon « En spécial cette semaine » de la page Listes existe déjà, vide.
C'est là que ça va.

---

## 2. LA SOURCE : FLIPP (vérifiée le 2026-09-28)

Economilk n'offre **aucun accès** pour qu'une autre app lise ses données.
La source retenue est **Flipp**, la compagnie canadienne derrière l'app de
circulaires reebee.

- Adresse publique, **sans clé ni compte** : `https://backflipp.wishabi.com/flipp/…`
- **Testée par J-C sur son iPad, avec son code postal** :
  - `…/flipp/flyers?locale=fr-ca&postal_code=…` (la liste des circulaires) :
    **Super C, Metro, IGA et Richelieu y sont tous**.
  - `…/flipp/items/search?locale=fr-ca&postal_code=…&q=cheerios` :
    les articles de circulaire sont dans `items` (en français), avec
    `merchant_name`, `name`, `current_price`, `valid_from`, `valid_to` et
    `flyer_id`. Il y a aussi `ecom_items`, les ventes **en ligne** (Walmart,
    London Drugs) : **à ignorer**.
- ⚠️ **Non officielle** : elle peut changer ou fermer sans avertissement.
  L'app doit survivre à une panne (rien affiché, mais rien de cassé).
- ⚠️ Les données sont **minces** : souvent ni le prix régulier ni le format.
  Un article peut en regrouper plusieurs (« GENERAL MILLS CHEERIOS ou céréales
  pour enfants »).
- ⚠️ **Pas vérifié** : comment lire **tous** les articles d'une circulaire
  (`…/flipp/flyers/<flyer_id>` ?). À tester avant de choisir entre « une
  recherche par aliment » et « lire les circulaires en entier ».
- Le **code postal** de J-C est une donnée privée et le dépôt est public :
  il ne va **jamais** dans le code poussé. Il est rangé dans les Propriétés
  du script (comme `MOT_DE_PASSE`).

---

## 3. LES DÉCISIONS DE JEAN-CLAUDE

**Les magasins : une liste gérée (choix B).** Ses quatre habituels sont
**Super C, Metro, IGA et Richelieu**. S'y ajoutent ceux qui sont **sur son
chemin**, par exemple **Pharmaprix** (« si les Cheerios sont en solde au
Pharmaprix, c'est à côté, j'irai en passant »). « Nouveau magasin… » au bout,
comme la catégorie. **Jamais Costco.** C'est **la même liste** que les
Magasins gérés décidés le 2026-09-27 (voir `CLAUDE.md`, « À BÂTIR —
Magasins, Marques, Saveurs ») : elle sert à l'entrée **et** aux spéciaux.
→ Les Magasins en liste gérée passent donc **avant** les spéciaux.

**Pas de commerces de l'autre côté du fleuve** (J-C : « je n'ai pas de bateau
ni d'hélicoptère »). Partout ailleurs, le code postal lui propose des
magasins de l'autre rive. Ici, le code postal sert **seulement** à demander à
Flipp les circulaires de la région. L'app ne garde ensuite **que les magasins
de sa liste**. Un seul cas peut rester : **la même bannière sur les deux
rives** (un Metro ici, un Metro en face). En général, une chaîne publie la
même circulaire pour toute une région, et ça ne change rien. ⚠️ **Pas
vérifié.** Si l'usage montre des circulaires différentes selon la rive, il
faudra choisir **la circulaire de sa succursale** (Flipp donne un `flyer_id`
par circulaire; qu'une succursale précise soit reliée à une circulaire reste
à vérifier).

**Reconnaître un aliment dans une circulaire : proposer, jamais deviner
(choix B).** Quand l'app croit qu'un spécial correspond à un aliment, elle
**le propose une fois** : « Ce spécial, ce sont tes Cheerios ? » **Oui / Non**.
Elle **retient la réponse**, et la semaine suivante ne redemande plus pour le
même genre d'article. C'est sa règle : faire choisir plutôt que faire taper
(J-C est dyslexique), et ne jamais deviner à sa place. Un spécial pas encore
confirmé ne s'affiche **qu'avec sa question**, jamais comme un fait.

**Où ça s'affiche (choix B), à deux endroits :**
- Listes → **« En spécial cette semaine »**, **groupé par magasin**.
- L'**écran de rayon** de la recherche (RdG-03, la loupe) : une ligne
  « En spécial chez Metro : 3,99 $ jusqu'au 2 octobre ». Ça sert au magasin.

**L'avertissement (choix A)** : **en tête** de « En spécial cette semaine »,
un groupe **« Il en manque — en spécial »**. Pas de notification iPad :
c'est trop lourd pour une app web (serveur d'envoi, permissions iOS), et ça
ralentirait le reste.

---

## 4. CE QUI DÉPEND D'AUTRE CHOSE

- **« Il en manque » dépend de Consommer (point 2).** Tant qu'un aliment
  n'est jamais sorti de l'app, rien n'y manque vraiment. D'ici là, le groupe
  ne verra que les aliments « plus en réserve » (quantité 0). Les spéciaux
  sur ce qu'on achète marchent, eux, dès le départ.
- **Les Magasins en liste gérée** (voir plus haut) : ✅ bâtie le 2026-09-29 (onglet Magasins, les quatre habituels semés d'avance).

---

## 5. COMMENT ÇA TOURNE (proposé, pour la vitesse)

- Les circulaires du Québec changent **le jeudi**. Le coffre-fort (`api.gs`)
  va chercher les spéciaux **tout seul, chaque jeudi matin** (déclencheur
  horaire d'Apps Script). Il ne garde que **les magasins suivis** et
  **les aliments de la maison**, puis range le résultat dans un onglet du
  Sheet.
- L'app les reçoit **dans `references`**, avec le reste : **aucun appel de
  plus**, la vitesse ne bouge pas. Côté serveur, Apps Script peut appeler
  Flipp sans passer par le VPN de J-C.
- Les réponses Oui / Non s'écrivent dans le Sheet (un onglet de
  correspondances : le texte de la circulaire, réduit à l'essentiel, → le
  produit, ou « non »), **à l'épreuve du reclic** comme le reste.
- Les colonnes exactes seront décidées au moment de bâtir et inscrites dans
  `RdG-structure-donnees.md`.
- **Partage du travail** : `api.gs` n'est visible que de la conversation sur
  l'ordi de J-C. Elle fait le serveur (la lecture de Flipp, le jeudi, les
  onglets, `references`). Les écrans (Listes, écran de rayon, Oui / Non)
  se font dans `rdg.html` / `entree.js`.

---

## 5 bis. BÂTI CÔTÉ SERVEUR (29 septembre 2026, conversation sur l'ordi)

- `lireSpeciaux()` dans `api.gs` : liste des circulaires en cours pour le code postal (Propriété du script
  `CODE_POSTAL`) → celles de **nos** magasins (nom de bannière comparé à la liste Magasins) → chaque circulaire
  **en entier** (`/flipp/flyers/<id>`) → les articles où l'on reconnaît **un de nos aliments** → le **détail** de
  ceux-là seulement (`/flipp/items/<id>` : format, économie) → onglet **Speciaux**, remplacé d'un coup.
- **Reconnaître** : tous les mots de l'aliment (sans accent, sans pluriel, sans petits mots) sont dans l'article,
  et le premier est **en tête** (« courge Ambercup orange » ne propose pas les oranges). C'est une **proposition** (« ? »).
- **Retenir la réponse** : onglet **Correspondances**, par « genre d'article » = les deux premiers mots
  (« lait au chocolat Québon » → « lait chocolat »). Un **Non** ne revient plus; un **Oui** s'affiche d'office.
- **Chaque jeudi, entre 1 h et 2 h du matin, heure du Québec** (7 h avant le 1er octobre : trop tard pour J-C) : déclencheur posé par `installerDeclencheur()` (J-C la lance une fois, depuis l'éditeur).
- **Panne** : l'erreur est notée (`SPECIAUX_ETAT`, renvoyé par `references`), la semaine d'avant reste.
- **Essai réel (24 sept., code postal générique d'Ormstown, 7 aliments d'essai)** : IGA (3 circulaires), Super C,
  Metro → 78 propositions, 59 avec prix régulier, ~35 s (appels un par un; Apps Script les fait en parallèle).
  Richelieu n'est **pas** sorti avec ce code postal : à revoir avec le vrai.
- **Qualité** : beaucoup de « ? » la première semaine (« Pommes » propose aussi les pommes de terre, « Lait » le
  lait de coco); chaque Non les efface pour de bon. À juger à l'usage.
- **Reste** : les écrans (section 3) — pas besoin de l'ordi.

---

## 5 ter. BÂTI DANS LA LISTE D'ACHATS (1er octobre 2026, décisions de J-C sur aperçus)

J-C : « faut que je sache si un aliment est en solde ». À l'écran, **« en circulaire »** (son mot : « plus parlant que en solde »).
- Sous l'aliment (le spécial vise l'aliment, pas la sorte) : **une ligne par magasin**, la moins chère en premier
  (« **Metro · 4,99 $** (rég. 6,49 $) · jusqu'au 7 oct. », dessous les mots de la circulaire).
- Proposé (« ? ») : **la question sous la ligne**, « C'est le bon aliment ? » **Oui / Non**, une par genre d'article.
- Un groupe **« En circulaire »** en tête de la liste, **par aliment** (pour comparer les magasins); rien sur les barres des
  catégories; « Mis de côté » montre aussi les soldes.
- C'est la forme qu'a prise « Il en manque — en spécial » (section 3) : **dans la Liste d'achats**, là où J-C en a besoin.
- Reste : Listes → « En spécial cette semaine » (par magasin) et l'écran de rayon.

## 5 quater. EN RÉFLEXION : LE VRAI RABAIS (1er octobre 2026, zéro code)

**Le déclencheur.** La version bâtie (5 ter), vue en vrai : « Oh boy, c'est pas fait pour les humains » — une question
Oui / Non sous presque chaque ligne, et des rapprochements faux (Pomme ← pommes de terre, purée de pommes). Elle a été
bâtie trop vite, sur un aperçu de 3 aliments. J-C : « Faut réfléchir avant de coder à tout vent. »

**Acquis :**
- Les questions quittent les lignes des catégories. **Le tri des circulaires se fait dans Gérer les bases** (J-C, 1er
  octobre : « je change d'idée, le tri des circulaires va passer dans Gérer les bases ») — d'abord prévu dans la barre
  « En circulaire » en tête de la liste d'achats (« l'onglet en haut de la liste »), abandonné le même jour.
- **C'est l'app qui juge si un rabais est vrai**, pas J-C (« L'app sera l'outil. Tout ça pour aider, ben il va aider »).
  Un prix « en circulaire » ne dit pas que c'est un vrai rabais.
- Pour juger, il faut **une mémoire** : aujourd'hui l'onglet Speciaux est **remplacé** chaque jeudi, rien n'est gardé.
- J-C penche pour garder **les circulaires complètes** (pas seulement ses aliments). Sa crainte, « une liste de 1000 km » :
  non — c'est une **archive en coulisse** dans le Sheet, jamais affichée, ni chargée à l'ouverture de l'app; elle sert
  seulement à juger. (Ordre de grandeur estimé : quelques centaines de lignes par semaine pour ses aliments, ~1 500 pour
  les circulaires complètes — à mesurer.)
- **L'archive s'ajoute chaque jeudi, rien n'est effacé — et elle garde UN AN** (J-C, 1er octobre : « Oui ») : le plus
  vieux s'efface au fur et à mesure. Un an suffit pour voir revenir les mêmes rabais d'une saison à l'autre. **Sauf** (J-C, même jour) : **un produit qui n'est jamais réapparu garde sa dernière apparition**, même vieille de plus
  d'un an — la mémoire d'un produit ne disparaît jamais tout à fait.
- **Une case « Circulaire » Oui / Non par magasin** sur la page Magasins (Gérer les bases) (J-C, 1er octobre : « j'ai
  besoin du magasin mais pas besoin de la circulaire »). Seuls les magasins à **Oui** sont lus le jeudi. Le look : aperçu
  d'abord. **Un magasin neuf part à Oui**, modifiable (J-C : « Oui de base mais modifiable »). Un magasin mis à Oui en pleine
  semaine **attend le jeudi** (J-C : « pas à ce point frustrant »). Mis à Non en pleine semaine : ses
  spéciaux **disparaissent tout de suite** de la liste, mais **son archive reste** (s'il revient à Oui, l'app n'a rien
  oublié) (J-C : « Ok »). Un magasin à Oui **sans circulaire dans Flipp** (la fruiterie du coin) : après la lecture du
  jeudi, la page Magasins le dit sous sa barre — « Pas de circulaire trouvée » (J-C : « Oui bonne idée »), **sans
  interrupteur** (J-C : rien à éteindre). **Look : choix A sur aperçu** (un interrupteur par barre, « Circulaire » écrit
  une fois en haut; rejetés : B le mot, C l'icône, D dans la barre ouverte). **✅ Bâti côté app le 1er octobre**
  (Magasins col. D `Circulaire`, col. E `Trouvee`); le coffre-fort (lire D, écrire E) : sur l'ordi, voir `CLAUDE.md`.

- **Le tri = TOUS les soldes** (J-C, 1er octobre — pas seulement ceux de sa
  liste, pas seulement les vrais rabais) : chaque article reçoit **Jamais / Peut-être / Oui** (« des articles que jamais
  j'achèterai, des peut-être et des oui »). C'est la première étape, faite par J-C; l'app retient ses réponses, donc
  **la liste à trier raccourcit de semaine en semaine** (« après 1 an, la liste va devenir de moins en moins longue à
  gérer »). Remplace les questions Oui / Non « C'est le bon aliment ? » sous les lignes (5 ter).
- **Trier aussi par paquet** (J-C : « il y a des sections qui ne m'intéressent pas ») : « Jamais » d'un coup à toute une
  section de la circulaire (nourriture pour animaux, couches). **Toujours réversible** (« à moins que j'adopte un chien
  l'an prochain! »). ⚠️ **À vérifier sur l'ordi** : Flipp donne-t-il la section (catégorie) de chaque article ? La
  session dans le nuage n'atteint pas Flipp (vérifié le 1er octobre : refusé par le réseau).
- **Les « Jamais » se défont dans Gérer les bases** (choix B de J-C : « pour moi c'est une correction de base ») — une
  liste de tous ses « Jamais » (articles et sections), pas au bas de la barre « En circulaire » (A, proposé, rejeté).
- **Un « Jamais » vise le même genre d'article**, pas l'article exact (choix B de J-C) : « Purina Dog Chow 8 kg » →
  tout ce qui commence par « Purina Dog Chow ». Les circulaires changent leurs mots d'une semaine à l'autre; sans ça, la
  liste ne raccourcirait pas. (Comment l'app reconnaît « le même genre » : la `Cle` d'aujourd'hui = les deux premiers
  mots — à revoir au moment de bâtir.)
- **Oui = retenu comme intéressant** : quand il revient en circulaire, il arrive déjà trié. **Il n'entre PAS tout seul
  dans la liste d'achats** (J-C, 1er octobre : « Oui » — d'abord choix C, « les deux », dépassé par « Il y a aussi
  ceci » plus bas) : il attend dans la barre « En circulaire », et un toucher l'ajoute à la liste. « Le but est que je puisse associer ma
  liste aux soldes. »
- **Le lien se fait avec l'ALIMENT, pas la marque** (J-C : « Oui ») : du Natrel en solde = du « Lait », un remplaçant
  possible du Québon habituel. **L'app propose l'aliment le plus proche, J-C confirme
  ou en choisit un autre** (choix A de J-C; B, choisir lui-même dans l'entonnoir, rejeté) — une seule fois par genre
  d'article, ensuite l'app s'en souvient. Une découverte jamais achetée : l'aliment se crée sur place.
- **Au tri, « Jamais » doit distinguer la marque de l'aliment** (J-C : « si je dis non à la marque XYZ, c'est pas parce
  que j'aime pas l'aliment, mais j'aime pas cette marque »). Voisin de « Pas aimé » (Consommer), déjà absent des spéciaux.
  **« Jamais cette marque » vaut pour CET aliment seulement** (choix A de J-C) : pas de lait Natrel, mais la crème
  Natrel reste possible. (B, toute la marque, rejeté.)
- **Peut-être = la porte ouverte** (J-C : « un item que j'ai pas, mais c'est pas que j'aime pas. Si je fais une recette
  et il y a du XYZ, ah oui je vais essayer ») : ni dans la liste (Oui), ni rejeté (Jamais) — le milieu qui manquait
  quand il n'y avait que Oui / Non. **Il ne revient pas au tri** (choix A de J-C) : il reste tranquille,
  et on le retrouve **quand on le cherche** (« y a-t-il du XYZ en spécial ? », pour une recette).
- **Où on le voit : dans la liste d'achats, sous l'aliment** (J-C : « dans ma liste d'achats j'ai du pain, avec des
  marques. J'aimerais voir s'il n'est pas en solde. Est-ce qu'il y en a d'autres ? ») — sous « Pain » : ses pains à lui
  s'ils sont en spécial, **et les autres pains en spécial triés Oui ou Peut-être**. **Les Jamais n'y paraissent pas**
  (« du pain blanc : je cocherais Jamais, donc je ne le verrais pas dans ma liste d'épicerie »). Le tri se fait
  dans Gérer les bases; le résultat se voit **sous l'aliment**. (Ni la loupe ni un champ de recherche
  dans la barre — A et B proposés, dépassés.) Parenthèse notée, pas creusée : un aliment qui n'est **pas** sur la liste
  (« y a-t-il du pain en solde ? » sans en manquer).
- **Le lien à l'aliment se fait aussi pour un Peut-être**, au tri (l'app propose « Pain », J-C confirme) — sinon il ne
  pourrait pas paraître sous « Pain » (J-C : « Oui »).
- **Un Peut-être essayé et pas aimé** : J-C le dit **en le consommant** — la case « Ne pas racheter » de Consommer
  (« Pas aimé », déjà bâtie, déjà absente des spéciaux). Pas besoin de passer par Gérer les bases.
- **Dans la liste d'achats** (J-C, 1er octobre) : les soldes **sous les aliments, dans les catégories** (ci-dessus),
  **plus une ligne « Il y a aussi ceci en circulaire cette semaine »** — ce qui est en circulaire, trié pour lui, sans
  être sur la liste. Remplace la question « un Oui qui revient entre-t-il tout seul dans la liste ? » (A / B, dépassée).
  **Elle ne contient que les Oui** (choix A de J-C; B, aussi les Peut-être, rejeté : un Peut-être reste tranquille).
  **La barre « En circulaire » passe du haut au BAS de la liste et ne contient QUE « Il y a aussi ceci »** (J-C : « au
  lieu d'avoir En circulaire en haut, ça serait en bas avec le il y a aussi »; « juste le il y a aussi ceci dans le En
  circulaire ») : les aliments de la liste en spécial n'y sont pas répétés — ils sont déjà sous leur aliment.
  **Un toucher sur un article de « Il y a aussi ceci » l'ajoute à la liste**, dans sa catégorie, comme la flèche de
  « Mis de côté » (J-C : « Oui, bonne idée »).

- **La page « Circulaires » dans Gérer les bases — UN seul bouton** (choix A de J-C, 1er octobre; B, deux boutons, rejeté) :
  **« À trier »** en haut, puis dessous ses **Jamais, Peut-être et Oui**, pour les corriger. ⚠️ Elle se nourrit des
  circulaires complètes : tant que l'archive n'est pas bâtie (sur l'ordi), elle sera presque vide.
- **« À trier » se range par SECTION de la circulaire** (choix A de J-C; B par magasin, C une seule liste, rejetés) : une
  section fermée se trie d'un coup (« Jamais »). Dépend de Flipp (la section de chaque article : à vérifier sur l'ordi).
  Un article annoncé chez plusieurs magasins = **une seule ligne** (le tri vise le genre d'article).
- ~~**À l'ouverture de la page** (choix B de J-C) : « À trier » déjà ouverte~~ — **changé par J-C après l'aperçu (1er
  octobre) : on entre, TOUT EST FERMÉ; on ouvre une barre, LES AUTRES SE CACHENT** (comme Listes, `.une-a-la-fois`).
  **La base de tout = la Liste d'achats** (J-C : « tout le travail déjà fait sur Achats, qui devait être la base de
  tout ») : les mêmes barres fermées, la même liste blanche dessous — pas un nouveau look. **Couleurs = les feux de
  circulation** : **Oui vert, Peut-être jaune, Jamais rouge**, **sans texte** (J-C : « j'ai pas besoin de textes »).
  **Les sections = SES catégories**, avec leurs couleurs fixes de l'Inventaire (J-C : « les couleurs pour les sections
  sont déjà fixes dans l'Inventaire »; « mes catégories ont une base de Super C, ça doit bien avoir un lien avec les
  circulaires »). Ce qui n'entre dans aucune (animaux, couches, pharmacie) : une dernière barre brune « Autres »
  (proposé). ⚠️ Le lien section de circulaire → sa catégorie : dépend de ce que Flipp donne (à vérifier sur l'ordi) et
  des noms de chaque bannière (Metro, IGA ≠ Super C). J-C : « quitte à modifier Gérer les catégories pour associer chaque
  catégorie aux leurs ». **Confirmé (J-C : « Oui »)** : (1) le coffre-fort fait la correspondance tout seul, une fois;
  (2) Gérer les bases → Catégories : une catégorie ouverte montre **ses sections des circulaires** (« Produits laitiers
  (Metro) », « Laitiers (IGA) »), qu'on peut changer de catégorie; (3) une section que le coffre-fort n'a pas su placer
  attend dans **« Sections sans catégorie »** (comme « Aliments sans catégorie »); sur la page de tri, ses articles vont
  dans **« Autres »** (barre brune).

  Dessous, les barres **Oui, Peut-être, Jamais**, pour corriger au besoin.
  **Après le 2e aperçu (J-C, 1er octobre)** : **en arrivant, QUATRE barres fermées — « À trier » d'abord**, puis Oui,
  Peut-être, Jamais (ses catégories sont DANS « À trier », pas au premier niveau : ça règle aussi le vert de Fruits et
  légumes / le rouge de Viandes qui se confondaient avec Oui / Jamais). **Les boutons : en forme de FEU DE CIRCULATION**
  (choix C sur aperçu : trois ronds dans un boîtier foncé), **dans l'ordre vert, jaune, rouge** (Oui, Peut-être,
  Jamais), sans texte. **Le point « du nouveau à trier » : rouge.** (Rejetés : A trois ronds seuls, B trois boutons
  pleins; le point doré, le point crème.)
  **Après le vert (ou le jaune), l'entonnoir montre aussi Marque et Saveur** (J-C : « Oui »), **déjà remplies quand l'app
  les reconnaît**, comme sur la fiche d'entrée; « Nouvelle marque… » pour une découverte. C'est ce qui permet de dire
  « ton Québon est en spécial », pas seulement « du lait ». Aujourd'hui le coffre-fort ne garde que le **texte** de
  l'article (« Natrel lait 2 %, 2 L ») : la marque et la saveur sont dedans. Deux pistes : Flipp donne peut-être la
  marque à part (⚠️ à vérifier sur l'ordi); sinon l'app reconnaît dans le texte les marques et saveurs déjà connues
  (Marques, Saveurs) — une marque jamais vue, elle ne la devine pas.
  **Comment tout se reconnaît** (expliqué à J-C le 1er octobre) : tes données au centre (liens par ID); le **code-barres**
  relie une boîte à tes données (retenu à l'entrée); **Open Food Facts** ne sert qu'à la 1re entrée d'un produit inconnu;
  **les circulaires n'ont PAS de code-barres** (J-C : « Flipp n'a pas de code-barres ») — le pont, c'est **le tri**
  (une fois par genre d'article, ensuite reconnu tout seul). Plus tard, le site de Super C donne le code-barres : pont
  direct pour comparer les prix (section 7).
  **Le code-barres comme pivot, quand même (idée de J-C, 1er octobre : « quand je dis oui à un solde, il pourrait faire
  la même chose [qu'au scan], car on peut chercher par nom sur Open Food Facts »)** : après le vert (ou le jaune), l'app
  **cherche le nom de l'article dans Open Food Facts**, propose ce qu'elle trouve (photo, nom, marque, format, code-barres),
  **J-C accepte ou corrige** — le même geste qu'au scan. Le code-barres se rattache alors au genre d'article. Un appel
  par Oui (pas 1 500), depuis l'app. Rien trouvé (fréquent au Canada, et jamais pour une pomme) : le tri continue sans
  code-barres, comme avant. (Claude avait proposé « deux pivots qui se tiennent par la main », jugé trop compliqué.)
  ⚠️ La recherche par nom d'Open Food Facts n'a pas pu être essayée d'ici (réseau refusé) : à essayer en vrai.
  **Effet (vu par J-C) : le même produit chez chaque magasin** — Natrel 2 %, 2 L chez Metro et chez IGA porte le même
  code-barres, donc toutes les listes deviennent plus justes (comparer le même produit d'un magasin à l'autre). Chaque
  magasin écrit ses circulaires à sa façon : sa formulation se trie une fois, ensuite elle pointe vers le même code.
  **Plusieurs produits possibles** (« variétés choisies » : 1 %, 2 %, 3,25 %) : **l'app montre les 3 ou 4 plus proches,
  avec leur photo, et J-C touche le bon** (J-C : « Oui »). Aucun n'est le bon : « Aucun », le tri continue sans
  code-barres — il s'attachera au premier scan de ce produit.

**L'IDÉE DES PRIX DE J-C (1er octobre)** — « Fallait régler le code-barres avant » (fait ci-dessus). « Si le code-barres
se retrouve dans la circulaire de la semaine avec le nom du magasin, le prix payé pourrait être ma première référence, au
lieu d'entrer tous les prix lors de l'arrivée de l'épicerie. » Autrement dit : à l'entrée, le produit scanné (son
code-barres) + le magasin choisi → s'il est dans la circulaire de la semaine de ce magasin (relié par le tri), **le prix
de la circulaire remplit le prix payé** (STOCK col. M). Fin de la saisie de tous les prix à l'arrivée.
**Mise de côté par J-C** (« on n'est pas rendu là », l'entrée de toute l'épicerie n'est pas encore pensée) — **notée en
détail dans `RdG-01`, section « Le prix payé — l'idée de J-C »**, à reprendre avec l'entrée de toute l'épicerie.

**COMMENT L'APP JUGE UN VRAI RABAIS (J-C, 1er octobre)** : « Pour ça, il faut avoir des prix. Mais je crois que la
logique serait **le dernier prix payé pour cet article**. Et ça, ça va avec l'entrée de l'épicerie. » — Le juge compare
le prix de la circulaire au **dernier prix payé** (STOCK col. M) pour cet article (sa sorte, son code-barres). Il dépend
donc lui aussi de l'entrée de toute l'épicerie (c'est là que le prix payé se remplit, par l'idée des prix). Pas encore de
prix payé (produit neuf, prix jamais entré) : le prix régulier annoncé par la circulaire (« rég. 6,49 $ ») en attendant
(proposé). **Le dernier prix payé, dans n'importe quel magasin** (J-C : « tous les magasins »). **Le même prix que la dernière
fois** (fréquent : « j'achète presque tout à rabais ») : **« on trouvera bien une façon »** — à régler à l'usage, pas
maintenant.
  **Aperçu final approuvé par J-C le 1er octobre** (4 barres; À trier → ses catégories → la liste blanche; le feu; le
  point rouge; + Marque et Saveur dans l'entonnoir). Le bouton : l'étiquette
  et son $, en rouge, juste après Magasins (bâti; la page, pas encore).
- **Une ligne d'article à trier = le nom seulement** (choix A de J-C : « Natrel lait 2 %, 2 L ») — ni prix ni magasin :
  on trie selon l'intérêt, c'est l'app qui juge le rabais. (B le prix le plus bas, C tous les magasins : rejetés.)
- **Trier un article = le toucher** (choix B de J-C) : il s'ouvre avec ses trois boutons **Jamais / Peut-être / Oui**,
  **un seul ouvert à la fois** (la règle des accordéons). (A, les trois boutons toujours visibles : rejeté, le mur.)
- **Oui (ou Peut-être) → l'entonnoir s'ouvre DÉJÀ REMPLI avec la proposition de l'app** (choix A de J-C) : Catégorie →
  Sous-catégorie → Aliment (Produits laitiers → Lait → Lait); on touche **« C'est ça »**, ou on change seulement le
  morceau fautif. L'app n'a aucune idée (une découverte) : l'entonnoir vide, « Nouvel aliment… » au bout. (B, la question
  « C'est du Lait ? » puis l'entonnoir vide sur Non : rejeté.) Confirmé : l'article quitte « À trier » pour sa barre.
- **Jamais → deux boutons** (choix A de J-C) : **« Tout ce genre »** (tout le Purina Dog Chow) ou **« Cette marque
  seulement »** (pas de Natrel pour le lait — l'entonnoir rempli paraît alors aussi, pour savoir de quel aliment).
  (B, quatre boutons dès l'ouverture : rejeté.)
- **Le tri par paquet : dans la section ouverte, en tête, une ligne « Jamais » pour toute la section** (choix B de J-C :
  « pour que je voie ce qu'il y a dedans »; A, sur la barre, rejeté). **Ce qu'il vise : tout ce qui s'y trouve LE JOUR DU
  TRI** (J-C : « jamais cette section… ça va dépendre; plutôt tout ce qui s'y retrouve la journée du tri ») — chaque
  article reçoit son « Jamais » (son genre), la section elle-même n'est jamais rejetée : un article nouveau la semaine
  suivante revient à trier. (Remplace « Jamais d'un coup à toute une section » du même jour.) Le prix, accepté par J-C :
  une section comme « Animaux » risque de revenir chaque semaine (un toucher). **À revoir à l'usage.**
- **Les barres de correction (Oui, Peut-être, Jamais) se rangent par section de la circulaire**, comme « À trier »
  (choix A de J-C; B, l'ordre alphabétique, rejeté). Corriger = toucher l'article : il se rouvre avec ses trois boutons,
  comme au tri.
- **Savoir qu'il y a du nouveau à trier : un petit point sur le chemin** (choix B de J-C) — sur Outils, puis sur Gérer
  les bases, puis sur l'étiquette rouge, tant que « À trier » n'est pas vide. (A rien, C une ligne dans la liste
  d'achats : rejetés.) Le look du point : aperçu d'abord.

**En suspens (une question à la fois) :**
1. **Ses interrogations sur le fonctionnement** — c'est par là qu'on reprend : lui demander la première.
2. Comment l'app juge : le prix régulier annoncé, le prix habituel du magasin (d'après l'archive), le prix payé
   (STOCK col. M). Fiable seulement après quelques semaines d'archive (voir section 7).
3. La présentation : la page de tri dans Gérer les bases, la ligne « Il y a aussi ceci » (aperçu d'abord).
4. Le rapprochement côté serveur : un article qui colle à un aliment **plus précis** (« Pommes de terre ») ne va pas à
   « Pomme » — proposé par Claude, **pas validé**.
5. « Le trou » (section 6) se règle peut-être du même coup : avec les circulaires complètes archivées, « y a-t-il du pain
   en solde ? » devient possible.

## 8. ⚠️ CONSIGNE POUR L'ORDI — LE COFFRE-FORT DES CIRCULAIRES (écrite le 1er octobre 2026, conversation du nuage)

*Pour la conversation qui tourne sur l'ordi de J-C (la seule qui voit `api.gs`). J-C : « Oublie rien, car l'ordi est
souvent occupé… pas par moi. Je passe le dernier! » — donc cette consigne doit se suffire à elle-même. Tout ce qui suit a
été **décidé par J-C** (section 5 quater) sauf ce qui est marqué **(proposé)** ou **(à toi de voir)**. Les règles du
projet valent : une question à la fois à J-C, réponses courtes, à l'épreuve du reclic, colonnes par position,
tout essayer à blanc avant de dire « à coller ». Une fois une partie faite : l'inscrire ici (✅), dans
`RdG-structure-donnees.md` (les colonnes, positions exactes) et dans `CLAUDE.md`; puis J-C colle → **Nouvelle version**.*

**L'ordre de travail (proposé)** : 1 → 2 → (le rapport à J-C) → 3 → 4 → 5 → 6. Les parties 1 et 2 sont petites et
débloquent tout; ne pas bâtir 3 à 5 avant d'avoir le rapport de la partie 2.

### Partie 1 — L'interrupteur « Circulaire » des Magasins (déjà côté app, bâti le 1er octobre) — ✅ FAIT sur l'ordi le 1er octobre, essayé à blanc, ⚠️ à coller
La consigne en 5 points est dans `CLAUDE.md`, « Gérer les bases → Magasins », paragraphe « ⚠️ À FAIRE SUR L'ORDI » :
`references` renvoie les col. D (`Circulaire`, O / N, vide = Oui) et E (`Trouvee`, O / N) de Magasins; en-têtes posés;
`lireSpeciaux()` saute les magasins à D = N; après chaque lecture, col. E = O / N pour chaque magasin à Oui (ne pas
toucher aux magasins à Non); `modifier` / `ajouter` acceptent la ligne de 5 colonnes.

### Partie 2 — Vérifier Flipp, puis FAIRE RAPPORT à J-C (avant de bâtir la suite)
Sur une vraie lecture (le code postal de J-C), répondre par écrit ici :
1. **La circulaire complète** : `/flipp/flyers/<id>` donne-t-il **tous** les articles, avec leur prix ? Combien
   d'articles par circulaire, et **au total par semaine** pour les magasins à Oui (estimé ~1 500 : à mesurer) ?
2. **La section** de chaque article (« Produits laitiers », « Animaux »…) : existe-t-elle ? En quelle langue ? Le même
   nom d'une semaine à l'autre ? C'est elle qui range la page de tri.
3. **La marque à part** du texte ? (sinon l'app la reconnaît dans le texte, d'après la liste Marques)
4. **Le prix** : prix, prix régulier ou économie, conditions (« 2 pour 7 $ », « avec la carte », « /lb »), dates
   (début, fin). Le **détail** (`/flipp/items/<id>`) est-il nécessaire pour chaque article, ou la circulaire suffit-elle ?
5. **Le temps** : une lecture complète tient-elle dans les **6 minutes** d'Apps Script (paquets de 10, une seconde entre
   deux) ? Sinon : lire en plusieurs passes (une suite qui se relance toute seule jusqu'à la fin), **(à toi de voir)**.
6. Confirmé par J-C : **Flipp n'a pas de code-barres**. (Le pont vers les codes-barres, c'est le tri, voir partie 5.)

**✅ RAPPORT (1er octobre 2026, conversation de l'ordi — vraie lecture, code postal générique d'Ormstown; le vrai code
de J-C reste dans les Propriétés du script) :**
1. **Circulaire complète : OUI.** `/flipp/flyers/<id>` donne **tous** les articles : nom (« français | english »),
   prix, marque (parfois), % d'économie, dates, photo. Mesuré : Super C 244 articles (234 avec prix) · IGA hebdo 409
   (379) + « Cahier Automne » 47 (26, valide 3 semaines) · Metro 365 (346) + une 2e circulaire 48 (31, dont 6 déjà dans
   la grande). **≈ 1 000 articles à prix par semaine** pour 3 magasins (Richelieu ne sort pas avec ce code postal; avec
   lui, ~1 200). La liste montre aussi les circulaires **à venir** (Pharmaprix du 3 octobre, déjà là le 1er) : la
   lecture ne garde que celles **en cours**.
2. **La section : NON.** `category` est vide sur **90 détails sur 90** (Super C, IGA, Metro); les pages s'appellent
   « Page 1 », « Page 2 »…; la circulaire ne dit que « Groceries ». La recherche de Flipp (`items/search`) donne un
   classement `_L1` / `_L2` (en anglais, très grossier : « Food, Beverages & Tobacco › Food Items », « › Beverages »,
   « Animals & Pet Supplies »), et seulement pour une recherche par mots, pas pour une circulaire entière.
   → **La partie 4 est à revoir avec J-C avant de bâtir.**
3. **La marque à part : en partie.** IGA 28 sur 30, Super C 11 sur 30, Metro 0 (vide). Elle est presque toujours dans
   le texte (« bacon Maple Leaf ») : l'app la reconnaîtra d'après la liste Marques.
4. **Le prix** : le prix est toujours là. Le régulier : `original_price` (Super C 4 / 30, IGA 11, Metro 14) ou
   `dollars_off` (12 à 17 / 30), sinon « Rég. 8,49$ à 9,49$ » dans la description (IGA). Les conditions :
   `pre_price_text` (« 2/ »), `price_text` (« le 100 g », « /lb », « +tx »), `sale_story` (« 50% d'économie »,
   « 100 Scène+ PTS à l'achat de 2 »). Les dates : sur chaque article. **Le format** (« 375 g, choix varié »), le
   régulier et les conditions ne sont **que dans le détail** (`/flipp/items/<id>`) : il faut le détail de chaque
   article, ~1 000 appels par semaine.
5. **Le temps** : sur l'ordi, 10 détails ≈ 0,4 s. Dans Apps Script, par paquets de 10 avec une seconde entre deux
   (la limite de Google, vue le 1er octobre), ~100 paquets ≈ 3 à 5 minutes : **trop près des 6 minutes**. **Décidé
   (à toi de voir)** : lire **en plusieurs passes** — une 1re passe lit la liste et les circulaires (≈ 10 appels) et
   écrit l'archive; le détail suit par passes de 4 minutes au plus, chacune relançant la suivante (déclencheur d'une
   minute) jusqu'à la fin. Le temps réel se mesurera à la 1re lecture.
6. **Le code-barres : Super C et Metro, non** (`sku` = un code interne, « E726-09 »). **IGA : OUI** — `sku` =
   le code-barres **sans son dernier chiffre** (« 00000_000000005889160231 » → 058891602315, la cassonade Lantic), ou le
   **code PLU** d'un fruit ou d'un légume (« 3320 »). Vérifié : **10 sur 12** retrouvés dans Open Food Facts. ⚠️ C'est
   le code d'**un** produit de l'offre (« choix varié » : le Yoplait crémeux donne le code d'un Oikos) — le bon
   fabricant, pas forcément la sorte de J-C. Un pont partiel, utile pour proposer l'aliment.

### Partie 3 — L'archive : les circulaires COMPLÈTES, gardées un an — ✅ FAIT (1er octobre, ordi; voir « Ce qui est bâti » plus bas)
- **Chaque jeudi** (le déclencheur de 1 h, heure du Québec, déjà posé), **tous** les articles des circulaires en cours
  des magasins à Oui — **plus seulement ceux qui ressemblent à ses aliments** (le filtre « nos aliments » de
  `lireSpeciaux` tombe). Ils **s'ajoutent** (rien n'est remplacé) dans un onglet d'archive (nom **(proposé)** :
  `Circulaires`).
- **Colonnes (proposé)** : ID · Magasin (ID) · FlyerId · FlippId · Texte · Description · Prix · Regulier · Unite
  (conditions) · Debut · Fin · Section (le nom Flipp, tel quel) · Cle (le genre, voir plus bas) · Marque (texte Flipp,
  si donnée) · DateLecture.
- **Rejouable** : relancer la lecture du même jeudi ne double rien (un article déjà archivé — même FlippId, même
  circulaire — est sauté).
- **Garder UN AN** : à chaque lecture, effacer ce qui a plus de 365 jours, **SAUF la dernière apparition d'un genre
  d'article qui n'est jamais revenu** — on garde toujours au moins sa dernière ligne (J-C : la mémoire d'un produit ne
  disparaît jamais tout à fait).
- **Jamais envoyée en entier à l'app** (trop gros; J-C : « jamais une liste de 1000 km »). L'app n'en reçoit que ce
  qu'il faut (partie 5).
- **Panne de Flipp** : comme aujourd'hui, l'erreur est notée et la semaine d'avant reste.
- **Le genre d'article (`Cle`)** — aujourd'hui « les deux premiers mots ». **Le but (décidé)** : un « Jamais » vise **le
  même genre** (« Purina Dog Chow », tous formats), et un genre trié une fois revient **déjà trié** les semaines
  suivantes. **(À toi de voir)** une meilleure clé : sans accents, sans petits mots, **sans format ni quantité**, peut-être
  les mots triés (pour que « Lait Natrel » et « Natrel lait » se rejoignent). L'essayer sur l'archive réelle et en parler
  à J-C avant de la changer : les réponses déjà données (Correspondances) sont rangées par l'ancienne clé.

### Partie 4 — Les sections des circulaires → SES catégories — ✅ FAIT AUTREMENT (Flipp ne donne pas de section : J-C a dit « oui » au rangement par mots, 1er octobre)
- Décidé : « À trier » est rangé par **ses** catégories (leurs couleurs), « Autres » (barre brune) pour le reste
  (animaux, couches, pharmacie…). La correspondance est **faite par le coffre-fort, tout seul, une fois**; J-C la voit et
  la corrige dans **Gérer les bases → Catégories** (sous chaque catégorie, ses sections; « Sections sans catégorie »
  pour l'inconnu). Ses catégories viennent de Super C (`RdG-categories-superc.md`) : les noms de Super C devraient se
  placer presque tout seuls; Metro, IGA, Richelieu nomment autrement.
- **Onglet (proposé)** `Sections` : ID · Magasin (ID) · Section (le nom Flipp, tel quel) · CategorieID (vide = sans
  catégorie) · Auto (O = placée par le coffre-fort, N = corrigée par J-C).
- Chaque jeudi : une section **nouvelle** reçoit une proposition (ou reste sans catégorie); une ligne **corrigée par
  J-C (Auto = N) n'est jamais réécrite**.
- `references` renvoie les lignes de `Sections` (petit). Corriger côté app = un geste « lignes » sur `Sections`
  (`Coffre.modifier`, déjà rejouable) : rien d'autre à faire.
- **Si Flipp ne donne pas de section** (partie 2) : en parler à J-C avant de bâtir (piste : ranger l'article d'après
  l'aliment proposé et sa sous-catégorie; sinon « Autres »).

### Partie 5 — Le tri : où ranger les réponses, et ce que l'app reçoit — ✅ FAIT (1er octobre, ordi)
- **Les réponses (décidé)** : par **genre d'article** — **Oui** (vert), **Peut-être** (jaune), **Jamais tout ce genre**
  (rouge), **Jamais cette marque, pour cet aliment** (rouge, puis « Cette marque seulement »). Oui et Peut-être portent
  **l'aliment** (ProduitID), **la marque et la saveur** (IDs, reconnues dans le texte ou choisies par J-C), et **le
  code-barres** si J-C a accepté un produit d'Open Food Facts (recherche par nom, faite **par l'app**, pas par toi).
  « Jamais cette marque » porte l'aliment et la marque.
- **Onglet (proposé)** `Tri` : ID · Cle · Reponse (O = Oui · P = Peut-être · J = Jamais ce genre · M = Jamais cette
  marque) · ProduitID · Marque (ID) · Saveur (ID) · CodeBarres · Date · Qui.
- **Action `trier` (proposé)** `{ cles: [...], reponse, produitId, marque, saveur, code, qui }` — **une liste de clés**,
  parce que la ligne « Jamais » en tête d'une section vise **tout ce qui s'y trouve ce jour-là** (chaque article reçoit
  son Jamais, la section elle-même n'est jamais rejetée) : **un seul appel**, pas un par article. **Rejouable** : une
  ligne par Cle (pour M : par Cle + ProduitID + Marque); la même réponse déjà là = rien d'écrit, `{ ok: true }`; une
  autre réponse = la ligne réécrite (c'est aussi **la correction**, depuis les barres Oui / Peut-être / Jamais). L'app
  l'enverra par sa file de gestes (`poserGeste`), donc dans l'ordre et en arrière-plan.
- **Les anciennes réponses** (`Correspondances`, `repondreSpecial`, les questions Oui / Non sous les lignes de la liste
  d'achats — jugées « pas faites pour les humains ») : un **O** devient une ligne `Tri` **Oui** (même Cle, même aliment);
  un **N** voulait dire « pas le bon aliment », **pas** Jamais → rien (le genre revient à trier). Garder
  `repondreSpecial` jusqu'à ce que l'app nouvelle soit en ligne, puis **le retirer** (ménage, même envoi que l'app).
- **Ce que l'app reçoit — la vitesse d'abord** (chaque appel compte, ~1 s) :
  - dans `references` (à chaque ouverture, donc **léger**) : `nbATrier` (le **point rouge** sur le chemin Outils →
    Gérer les bases → l'étiquette, tant que ce n'est pas 0); `sections`; et `speciaux` **redéfini** = les articles **en
    cours cette semaine** dont le genre est trié **Oui ou Peut-être** (pas les Jamais, ni une marque rejetée pour cet
    aliment), avec Magasin, Prix, Regulier, Unite, Debut, Fin, Texte, Cle, Reponse, ProduitID, Marque, Saveur,
    CodeBarres — c'est ce qui s'affiche **sous l'aliment** dans la liste d'achats et dans « Il y a aussi ceci » (Oui
    seulement). ⚠️ Rappel (leçon du 1er octobre) : un champ nouveau de `references` doit aussi entrer dans
    `chargerData()` côté app — c'est la conversation du nuage qui s'en charge.
  - **à la demande** (un appel, en ouvrant la page de tri — c'est dans Gérer les bases, pas tous les jours) : action
    **`lireTri` (proposé)** → `aTrier` (les articles de la semaine dont le genre n'est pas trié — **une seule ligne par
    genre, même s'il est annoncé chez trois magasins** (décidé) : Cle, Texte, la
    catégorie d'après `Sections`, l'aliment / la marque / la saveur **proposés** par le coffre-fort — c'est ce qui
    remplit l'entonnoir d'avance) et `tri` (les réponses déjà données, pour les barres Oui / Peut-être / Jamais).
- **La proposition d'aliment** (ce que `lireSpeciaux` fait déjà) : J-C confirme ou corrige au tri, donc elle n'a pas
  besoin d'être parfaite; mais mieux elle vise, moins il touche. Le défaut connu : « Pomme » proposé pour « pommes de
  terre » — un article qui colle à un aliment **plus précis** devrait aller à celui-là **(proposé)**.

### Partie 6 — Ménage et documents — ✅ FAIT pour l'ordi (reste : retirer `repondreSpecial` avec l'app nouvelle)
- Ce qui ne sert plus une fois l'app nouvelle en ligne : le filtre « nos aliments seulement », `repondreSpecial`,
  l'onglet `Correspondances` (après la conversion), l'état « ? » de `Speciaux`. L'onglet `Speciaux` lui-même : le garder
  comme « la semaine en cours » ou le remplacer par l'archive filtrée sur la semaine **(à toi de voir)** — le dire ici.
- Inscrire chaque onglet et ses colonnes (positions exactes) dans `RdG-structure-donnees.md`.

### ✅ CE QUI EST BÂTI DANS `api.gs` (1er octobre 2026, conversation de l'ordi — essayé à blanc sur les VRAIES circulaires de la semaine, ⚠️ à coller → Nouvelle version, puis lancer `installerDeclencheur`)

**Le jeudi, en passes.** `lireSpeciaux()` (le déclencheur de 1 h) lit la liste et chaque circulaire en entier (≈ 10 appels),
écrit **Speciaux** (la semaine, 20 colonnes, voir `RdG-structure-donnees.md`) et programme `suiteCirculaires()` une
minute plus tard : le détail de chaque article (~1 000 appels, paquets de 10), 3 min 30 par passe, chacune relançant la
suivante; à la fin, la semaine s'ajoute à **Circulaires** (l'archive) et l'archive garde un an. Essai : 1 016 articles,
2 passes; relancer la même lecture ne double rien. `SPECIAUX_ETAT` dit « en cours — … » pendant les passes, « ok — … » à
la fin. Au plus 12 passes (jamais de boucle sans fin).

**Le rangement par mots (partie 4, autrement).** Chaque article reçoit **sa catégorie racine** (col. L) : l'aliment
proposé s'il y en a un, sinon le premier mot reconnu (un dictionnaire dans `api.gs`, `RAYONS_MOTS` / `PAIRES_MOTS` /
`MOTS_AUTRES`, qui trouve chaque catégorie par un morceau de son nom : « legume » → « Fruits et légumes »). Essai sur
les 1 016 articles : **10 % en « Autres »** (repas prêts, pizza, quenelles, plantes, litière… — vous n'en achetez pas).
Les erreurs se corrigent au tri (l'entonnoir). **Il n'y a donc PAS d'onglet Sections, ni de « sections sous chaque
catégorie » dans Gérer les bases → Catégories** (ce qui était prévu tombe).

**Le genre d'article (`Cle`) : gardé tel quel** (les deux premiers mots) — sur l'essai, 96 genres se retrouvent déjà
chez plusieurs magasins (une seule ligne à trier). Une clé plus fine reste possible : à proposer à J-C à l'usage, pas
avant (les réponses sont rangées par cette clé). Corrigé en passant : « bœuf » se coupait en « b uf » (le « œ »).

**Ce que l'app reçoit — pour la conversation du nuage :**
- `references` (à chaque ouverture) :
  - `speciaux` = les articles **en cours cette semaine**, des magasins à Oui, dont le genre est trié **Oui ou Peut-être**
    (pas une marque rejetée pour cet aliment). **Même format qu'avant** (l'app d'aujourd'hui les lit déjà : plus aucune
    question « ? » n'arrive, les lignes sous les aliments ne montrent que ce qui est trié) + 5 colonnes au bout :
    `[0 ID, 1 Magasin, 2 ProduitID, 3 Texte, 4 Prix, 5 Regulier, 6 Unite, 7 Description, 8 Debut, 9 Fin, 10 Cle, 11 'O',
    12 FlippId, 13 Reponse (O / P), 14 Marque, 15 Saveur, 16 CodeBarres, 17 Categorie]`.
  - `nbATrier` = le nombre de genres de la semaine sans réponse → **le point rouge**. ⚠️ à ajouter dans `chargerData()`.
  - Un magasin mis à **Non** : ses soldes et ses articles à trier disparaissent **dès la relecture**; son archive reste.
- `lireTri` (une action de LECTURE, un appel en ouvrant la page de tri) → `{ ok, aTrier, tri }` :
  - `aTrier` = **une ligne par genre**, même annoncé chez trois magasins : `{ cle, texte, categorie (ID de la catégorie
    racine, '' = Autres), produitId, marque, saveur (proposés : ils remplissent l'entonnoir), code (IGA), magasins: [ID…] }`.
    Essai : **736 genres la 1re semaine** (rien n'est encore trié), 109 Ko.
  - `tri` = les lignes de l'onglet Tri (positions : voir `RdG-structure-donnees.md`), pour les barres Oui / Peut-être / Jamais.
- `trier` (écriture, à envoyer par la file des gestes) : `{ cles: [...], reponse: 'O' | 'P' | 'J' | 'M', produitId, marque,
  saveur, code, qui }` → `{ ok: true }`. Une **liste** de genres (la ligne « Jamais » d'une section = un seul appel). Oui,
  Peut-être et M **exigent l'aliment** (M exige aussi la marque) : sinon refus `definitif`. La même réponse renvoyée =
  rien d'écrit; une autre = la ligne réécrite (la correction). Un nouvel aliment créé au tri : l'envoyer **avant** (même
  file : `ajouter` accepte l'ID de l'app). ⚠️ `Coffre.lireTri()` et `Coffre.trier()` sont à ajouter dans `coffre.js`.
- `repondreSpecial` (l'ancienne question) : un Oui devient un Oui du tri, un Non n'écrit rien. **À retirer** quand l'app
  nouvelle est en ligne (avec `Coffre.repondreSpecial`, la question sous les lignes et son attente).

### Ce qui n'est PAS pour l'ordi (le nuage s'en charge, après toi)
**✅ La page de tri — BÂTIE côté app le 2 octobre 2026** (le nuage, d'après l'aperçu approuvé le 1er octobre; détail dans
`CLAUDE.md`, « Gérer les bases → Circulaires ») : 4 barres fermées, À trier rangé par ses catégories, le feu, l'entonnoir
rempli (marque et saveur comprises), « Tout ce genre » / « Cette marque seulement », « Tout ce qui est ici aujourd'hui »
(avec la question Oui / Non), la correction dans les barres, le point rouge (`nbATrier`), `Coffre.lireTri` et `Coffre.trier`.
L'ancienne question Oui / Non sous les lignes de la liste d'achats est **retirée** (avec `Coffre.repondreSpecial`).
**Pas encore** : l'étape Open Food Facts (aperçu d'abord); la liste d'achats (« Il y a aussi ceci » au bas, un magasin
mis à Non); le juge du vrai rabais. Quatre vérifications demandées à l'ordi : la note ❓ en tête de `CLAUDE.md`.

La page de tri (4 barres, le feu vert-jaune-rouge, l'entonnoir rempli avec marque et saveur, la recherche par nom dans
Open Food Facts avec les 3 ou 4 plus proches en photo), le point rouge, les sections sous chaque catégorie dans Gérer les
bases, la liste d'achats (soldes sous l'aliment, « Il y a aussi ceci » au bas, un magasin mis à Non qui disparaît tout de
suite, le retrait des questions Oui / Non), et **le juge du vrai rabais** (le dernier prix payé, tous magasins, lu dans
STOCK col. M — rien à faire côté coffre-fort). **L'idée des prix de J-C** (le prix de la circulaire remplit le prix payé
à l'entrée) attend l'entrée de toute l'épicerie (`RdG-01`).

---

## 6. PARENTHÈSES (à ne pas perdre)

- **Le trou (vu par J-C le 1er octobre)** : seuls ses aliments sont retenus, donc une nouveauté en circulaire ne paraît jamais (« y a-t-il du pain en solde ? »). Pistes : A tel quel · B circulaires complètes sur une page à part · C chercher à la demande dans la loupe (reco). **J-C y pense — ne pas relancer.** → Repris le 1er octobre dans la section 5 quater.

- La liste d'achats (point 5) pourra un jour dire « achète-le chez Metro
  cette semaine ».
- Le prix payé (STOCK, colonne Prix) permettra un jour de dire si un
  « spécial » en est vraiment un pour la maison.

---

## 7. PLUS LOIN : LE COMPARATEUR DE PRIX (29 septembre 2026)
*Réflexion ouverte, rien n'est bâti. Née d'un article de La Presse sur les
rabais en circulaire : « avec ce qu'on développe, on pourrait aller plus loin ».*

**L'idée** : connaître le prix de **tous les jours** (pas seulement les
spéciaux) de ce que la maison achète, dans chaque épicerie suivie, et
comparer. Ça **élargit** la section 2 : Flipp ne donne que la circulaire,
un comparateur a besoin des sites des épiceries.

**Les décisions de Jean-Claude :**
- **Avant de partir** : la liste d'achats (point 5) **en entier**, avec sur
  chaque ligne le prix dans chaque épicerie. L'app ne répartit rien à sa
  place.
- **Sur place, s'il le veut** : trier par épicerie (**choix A**) = toute la
  liste, avec **seulement le prix de ce magasin**.
- **En vert** : le prix le plus bas des épiceries, dans la liste complète
  comme dans le tri.
- **Les formats (choix C)** : le prix de la boîte, et **le prix au 100 g**
  (au litre, à l'unité) en petit dessous. **Le vert se décide sur le prix au
  100 g.**
- **Un spécial (choix C)** : le mot « spécial » + sa date de fin + **le prix
  régulier** du magasin + un **avis de l'app d'après l'historique** qu'elle
  garde semaine après semaine (« vrai rabais » / « prix habituel ici depuis
  2 mois »). L'avis n'est fiable qu'après quelques semaines d'historique.
- **Où (choix B)** : dans la **liste d'achats** et sur l'**écran de rayon**
  de la loupe. **Pas de page Prix à part** (un seul endroit à retenir; à
  ajouter plus tard seulement si l'usage la demande).

**Les sources (voir `RdG-sources-donnees.md`, source B) :**
- **Super C** : la **porte trouvée le 20 septembre** — la page de recherche
  par nom donne code-barres, format, prix et prix régulier. Le raccourci
  « code → prix en 1 appel » (`/produit/skus`) attend toujours un jeton.
- **Metro, Richelieu** : même compagnie (Metro inc.), **probablement la même
  porte. Pas vérifié.**
- **IGA** (Sobeys) : **jamais regardé.** ⚠️ La Presse (23 janv. 2023) : les
  prix de **Voilà** (l'épicerie en ligne d'IGA) diffèrent parfois de ceux du
  magasin, et les promotions ne s'y appliquent pas toujours. **Le prix d'un
  site n'est peut-être pas celui de la tablette** — à vérifier avec un vrai
  reçu, pour chaque bannière.
- Le **code-barres** est la clé : il permet de comparer **le même produit**
  d'un magasin à l'autre.
- Le **prix payé** (STOCK, col. M) reste une source à nous.

**⚠️ À VÉRIFIER SUR L'ORDI (la session dans le nuage n'atteint pas ces
sites : son réseau les bloque).** La conversation sur l'ordi de J-C :
1. `metro.ca` et le site de Richelieu : la même recherche par nom que Super C
   (`/recherche?freeText=true&filter=nutella`) donne-t-elle les mêmes tuiles
   (code-barres, format, prix, prix régulier) ?
2. `iga.net` : y a-t-il une recherche qui donne le prix, et le code-barres ?
3. Flipp : lire une circulaire **en entier** (section 2, toujours ouvert) — et chaque article dit-il **sa section**
   (catégorie) ? C'est ce qui permettrait de trier par paquet (section 5 quater). Et **la marque**, à part du texte ?
4. Le prix est-il celui **d'une succursale** (Ormstown ≠ une autre) ? Comment
   choisir la sienne ?
5. **Chercher une vraie porte, comme la SAQ dans Dionysos.** Dionysos lit la
   SAQ de deux façons, toutes deux dans Apps Script : le **grattage** des
   fiches produits (`testScrapingSAQ` → `lireFicheSAQ`, cache 5 min) et
   l'**API Adobe Commerce** que le site de la SAQ utilise lui-même
   (`catalog-service.adobe.io/graphql`, clé vue dans le trafic du navigateur,
   rangée dans les Propriétés du script : `SAQ_API_KEY`, `SAQ_ENV_ID`).
   Même démarche ici : dans les outils de développement du navigateur, sur
   superc.ca (puis metro.ca, iga.net), repérer les requêtes que la page fait
   en cherchant un produit (`/produit/skus` chez Super C, ou une adresse
   GraphQL), noter l'adresse, les en-têtes et la clé ou le jeton, et voir
   si la clé est fixe (comme à la SAQ) ou change à chaque visite. Une clé
   trouvée va dans les **Propriétés du script**, jamais dans le dépôt public.
Consigner les réponses ici, puis on reprend la réflexion.

**✅ RÉPONSES (29 septembre 2026, conversation sur l'ordi, lecture sans navigateur — comme le ferait Apps Script) :**
- **Metro et Super C** : la recherche répond par un **« captcha » Cloudflare** (403, « Just a moment… ») dès qu'on n'est pas un vrai
  navigateur. **IGA** : « Access Denied » (Akamai). Le test de Super C du 20 septembre marchait parce qu'il passait par un navigateur.
  → **Apps Script ne peut pas lire ces sites**, et contourner une protection anti-robots, **on ne le fait pas**. Le prix « de tous les
  jours » de ces épiceries n'a donc **pas de porte propre** pour l'instant (pas d'API publique connue). Richelieu : pas testé, même compagnie.
- **Flipp : ça marche sans navigateur.** La liste des circulaires par code postal donne Super C, Metro, IGA, Maxi, Jean Coutu,
  Pharmaprix… (celles de la semaine suivante sont déjà là le mardi). **Une circulaire se lit en entier** (`/flipp/flyers/<id>` :
  219 articles chez Super C cette semaine — nom français | anglais, prix, % de rabais, dates). **Le détail d'un article**
  (`/flipp/items/<id>`) ajoute le **format** (« env. 1,4 kg »), l'unité du prix (« /lb »), l'**économie en $** (donc le
  **prix régulier** = prix + économie) et la phrase de la circulaire. **Toujours aucun code-barres.** Un appel par article : à faire
  d'un coup côté serveur (`UrlFetchApp.fetchAll`), le jeudi.
- **Conséquence pour le comparateur** : les **spéciaux** (et leur prix régulier) sont à portée; le **prix courant de tout** ne l'est pas.
  Seule source à nous pour le reste : le **prix payé** (STOCK, col. M). La réflexion de la section 7 est à reprendre avec ça en main.

**Pas encore discuté** : un prix inconnu dans un magasin (case vide ?);
l'âge d'un prix (lu jeudi, affiché quand ?).
