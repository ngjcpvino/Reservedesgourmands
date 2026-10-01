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
- Les questions quittent les lignes des catégories : elles vont dans la barre **« En circulaire » en tête de la liste**
  (« l'onglet en haut de la liste »), **présentées autrement** — comment : pas décidé. Pas de page Circulaire à part.
- **C'est l'app qui juge si un rabais est vrai**, pas J-C (« L'app sera l'outil. Tout ça pour aider, ben il va aider »).
  Un prix « en circulaire » ne dit pas que c'est un vrai rabais.
- Pour juger, il faut **une mémoire** : aujourd'hui l'onglet Speciaux est **remplacé** chaque jeudi, rien n'est gardé.
- J-C penche pour garder **les circulaires complètes** (pas seulement ses aliments). Sa crainte, « une liste de 1000 km » :
  non — c'est une **archive en coulisse** dans le Sheet, jamais affichée, ni chargée à l'ouverture de l'app; elle sert
  seulement à juger. (Ordre de grandeur estimé : quelques centaines de lignes par semaine pour ses aliments, ~1 500 pour
  les circulaires complètes — à mesurer.)
- **L'archive s'ajoute chaque jeudi, rien n'est effacé — et elle garde UN AN** (J-C, 1er octobre : « Oui ») : le plus
  vieux s'efface au fur et à mesure. Un an suffit pour voir revenir les mêmes rabais d'une saison à l'autre.
- **Une case « Circulaire » Oui / Non par magasin** sur la page Magasins (Gérer les bases) (J-C, 1er octobre : « j'ai
  besoin du magasin mais pas besoin de la circulaire »). Seuls les magasins à **Oui** sont lus le jeudi. Le look : aperçu
  d'abord. **Un magasin neuf part à Oui**, modifiable (J-C : « Oui de base mais modifiable »). Un magasin mis à Oui en pleine
  semaine **attend le jeudi** (J-C : « pas à ce point frustrant »). Mis à Non en pleine semaine : ses
  spéciaux **disparaissent tout de suite** de la liste, mais **son archive reste** (s'il revient à Oui, l'app n'a rien
  oublié) (J-C : « Ok »). Un magasin à Oui **sans circulaire dans Flipp** (la fruiterie du coin) : après la lecture du
  jeudi, la page Magasins le dit à côté de son nom — « Pas de circulaire trouvée » (J-C : « Oui bonne idée »).

- **La barre « En circulaire » = TOUS les soldes, pour un premier tri** (J-C, 1er octobre — pas seulement ceux de sa
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

**En suspens (une question à la fois) :**
1. **Ses interrogations sur le fonctionnement** — c'est par là qu'on reprend : lui demander la première.
2. Comment l'app juge : le prix régulier annoncé, le prix habituel du magasin (d'après l'archive), le prix payé
   (STOCK col. M). Fiable seulement après quelques semaines d'archive (voir section 7).
3. La présentation dans la barre « En circulaire ».
4. Le rapprochement côté serveur : un article qui colle à un aliment **plus précis** (« Pommes de terre ») ne va pas à
   « Pomme » — proposé par Claude, **pas validé**.
5. « Le trou » (section 6) se règle peut-être du même coup : avec les circulaires complètes archivées, « y a-t-il du pain
   en solde ? » devient possible.

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
   (catégorie) ? C'est ce qui permettrait de trier par paquet (section 5 quater).
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
