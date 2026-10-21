# RdG-13 — Les épices d'Épices de Cru : un code QR, leur numéro (2026-10-18)

> Le point 93 de la liste numérotée (`CLAUDE.md`). **Réflexion finie, l'app bâtie le 2026-10-18** (J-C : « oui »), pas encore testée en
> ligne (T127 à T132). Reste au coffre-fort : la section 4, à l'ordi. **La date du lot (le point 94, section 5) : bâtie le 2026-10-19**
> (J-C : « Ok »), pas encore testée en ligne (T133 à T137); au coffre-fort : la section 6, à l'ordi.

## 1. Ce qu'on a vu

- J-C : « quand tu as plus de 50 cas… ça vaut la peine de regarder les possibilités. Ce sont des épices. Je les utilise beaucoup. »
  Plus de 50 pots de métal d'**Épices de Cru** (Montréal, marché Jean-Talon), sans code-barres.
- Sous chaque pot, une étiquette ronde : le nom et le format (« Curcuma Lakadong moulu (Inde 40 g) », « Sept épices d'Alep (50 g) »),
  **« Lot: 10262 - 081123 »** et un **code QR**.
- **Le code QR contient le Lot, tel quel** : « 10262 - 081123 » (décodé dans la photo de J-C). Rien d'autre : ni nom, ni lien.
- **Les 5 premiers chiffres = l'épice** (J-C : « Chaque épice a ses 5 propres premiers chiffres »; ses deux pots de Sept épices
  d'Alep : « 10722 - 070619 » et « 10722 - 201025 »). **La fin = la date de mise en pot, JJMMAA** (7 juin 2019, 20 octobre 2025).
- **Leur site trouve l'épice par son numéro** (la capture de J-C : epicesdecru.com, la recherche « 10722 » → « 1 résultat »,
  **Sept-épices d'Alep**, 50 g / 1.76 oz · 200 g / 7.05 oz, 13,75 $ — le prix du format choisi, 50 g).
- **Lu dans le code de l'app** : la caméra lit déjà les codes QR (`readBarcodes` de `JS/scan.js`, sans `formats` : tous les genres).
  Aujourd'hui, elle prendrait « 10262 - 081123 » entier pour un code : un pot racheté (une autre date) serait un code neuf, pas
  reconnu (`CODES` : le code exact). Et un autre code QR (souvent un lien vers un site, sur bien des boîtes) pourrait passer pour un
  code-barres.
- ⚠️ Le conteneur du nuage ne joint pas epicesdecru.com (la règle réseau de la session : 403). La conversation de l'ordi, oui
  (sans doute) — c'est elle qui essaie (section 4).

## 2. Décidé

1. **Une épice d'Épices de Cru se reconnaît par ses 5 premiers chiffres**, la date ignorée : un pot racheté est la même épice,
   partout (entrer, consommer, ouvrir, déplacer, rechercher, la Liste d'épicerie). (Proposé par Claude, après la confirmation de J-C.)
2. **Nommer sans taper : A** (J-C : « Oui ») — au premier scan d'un numéro inconnu, **le coffre-fort demande le numéro à leur site**
   et l'app écrit le nom et le format elle-même. **B en secours** si leur site refuse Google (comme Super C) : « Voir chez Épices de
   Cru », Copier pour la Réserve, Coller la page — le chemin de Super C dans Compléter.
3. **Les autres codes QR sont ignorés** (proposé par Claude, avec la direction) : la caméra continue de chercher le code-barres.
4. **Le nom de leur site devient l'aliment**, chaque épice la sienne (« Sept-épices d'Alep », « Curcuma Lakadong »), **Épices de Cru la marque** (J-C : « Oui »). Le curcuma Lakadong fini va sur la Liste d'épicerie, même s'il reste un curcuma ordinaire.
5. **Classée d'office dans Garde-manger → Fines herbes, épices** (J-C : « Oui »), même pour les 50 premiers pots; elle se change ensuite dans Gérer les bases → Aliments. (Le nom de sa sous-catégorie chez J-C : « Fines herbes, épices » — pas « … et sauces » de la liste semée : J-C l'a corrigé.)
6. ~~**Le format sur la carte du scan**~~ (**remplacé le même soir : chaque format a son numéro** — vu à l'ordi, 10722 le 50 g, 30722 le 200 g —, donc le format se sait au scan, rien à choisir : la condition de la décision elle-même) (J-C : « Oui ») : les formats de leur site côte à côte (50 g · 200 g), **le dernier acheté de cette épice déjà choisi** (la première fois : le plus petit, le pot), un toucher pour changer; un seul format = rien à choisir. Si chaque format a son propre numéro sur leur site (l'essai le dira), l'app le sait sans demander. Le look : aperçu d'abord.
7. **Le prix de leur site remplit le prix payé**, comme la circulaire (J-C : « Ok »); il suit le format choisi sur la carte.
8. **La place, la première fois : Cuisine → Porte d'épices** (J-C : « Toujours cuisine, meuble = porte d'épices »). Ensuite, l'endroit habituel de l'épice, comme tout aliment.
9. **Posée directement sur la Porte d'épices, jamais sur une tablette** (J-C : « comme elles sont en ordre alphabétique, si j'ajoute, ça décale. Donc pas de tablettes nommées »). Lu dans le code : une carte d'endroit sans espace choisi pose le lot sur le meuble lui-même (`emp: eid || mid`), même si le meuble a des espaces; l'Inventaire le montre « posé sur le meuble ».
10. ~~**Le format sur la carte = A, deux cases, la case dans le coin**~~ (sans objet depuis la décision 6 remplacée : bâties, puis retirées le même soir) (comme le + de la Liste d'épicerie), **sans photo** (J-C : « A. Sans photo » — compris : pas la photo de l'épice de leur site sur la carte; tous ses pots se ressemblent, la photo d'un tas d'épices n'aide pas). — **Demandé à J-C : je bâtis ?** — **« oui »** (section 3 bis).

## 3. Questions ouvertes, dans l'ordre (une à la fois)

1. **Le nom de leur site devient-il l'aliment** (« Sept-épices d'Alep », « Curcuma Lakadong » : chaque épice la sienne), Épices de
   Cru la marque ? Conséquence : le curcuma Lakadong fini va sur la Liste d'épicerie, même s'il reste un curcuma ordinaire.
   (Reco de Claude : oui.) — ✅ **J-C : « Oui »** (décision 4).
2. **La catégorie posée d'office** : Garde-manger → Fines herbes, épices ? — ✅ **J-C : « Oui »** (décision 5).
3. **Le format** : leur site en donne deux (50 g, 200 g), le code QR aucun. Le plus petit (le pot) d'office ? La recharge en sachet
   a-t-elle le même code QR ? — **demandé à J-C le 2026-10-18** : achète-t-il seulement les pots, ou aussi les 200 g ? — **J-C : « Aussi »**. **Demandé ensuite** : le 200 g porte-t-il le même code QR, avec le même numéro (10722) ? (leur recherche « 10722 » rend un seul produit pour les deux formats : sans doute le même numéro — alors l'app ne peut pas savoir lequel au scan.)
   — **J-C : « J'en ai pas en main »**. **Proposé par Claude** (marche dans les deux cas) : sur la carte du scan, **les formats de leur site côte à côte** (50 g · 200 g), **le dernier acheté de cette épice déjà choisi** (la première fois : le plus petit, le pot), un toucher pour changer; une seule offerte = rien à choisir. Le look : aperçu d'abord. — ✅ **J-C : « Oui »** (décision 6).
4. **Le prix** : celui de leur site remplit-il le prix payé (comme la circulaire) ? — ✅ **J-C : « Ok »** (décision 7).
5. **Où il est rangé** la première fois : l'Escale, ou l'endroit habituel des épices ? — **demandé à J-C le 2026-10-18.** Proposé par Claude : l'endroit où la plupart de ses autres « Fines herbes, épices » sont rangées (leur endroit 1); aucune encore : l'Escale. — ✅ **J-C : « Toujours cuisine, meuble = porte d'épices »** (décision 8). **Demandé ensuite** : dans l'app, la Porte d'épices a-t-elle des espaces (des tablettes) ? Sinon, l'épice est posée sur le meuble. — ✅ décision 9 : sur le meuble, sans tablette.
6. **Noté, pas creusé** : la date du lot dit l'âge de l'épice — « À consommer bientôt » pourrait compter de là.
7. ~~**Le look du format sur la carte**~~ (sans objet : chaque format a son numéro, décision 6) — aperçu envoyé le 2026-10-18 (`scratchpad/apercu-epices/fait.py`) : A deux cases, la case dans le coin · B deux boutons, le choisi brun, l'autre blanc · C un menu déroulant · D une ligne par format, le rond vert. Reco de Claude : B (un toucher, de gros doigts, se lit d'un coup d'œil pendant la rafale). — ✅ **J-C : « A. Sans photo »** (décision 10).

## 3 bis. Ce qui est bâti (l'app, 2026-10-18; pas encore testé en ligne, T127 à T132)

- **La caméra** (`JS/scan.js`) : lit jusqu'à 3 codes dans l'image et garde **le premier qui sert** (`codeUtile()`) — des chiffres (un
  code-barres) ou **le Lot d'un pot** (« 10722 - 201025 », `estLotEpice()`); tout autre code (un code QR qui mène à un site) est ignoré,
  la lecture continue. Le Lot devient **la clé « EDC-10722 »** (`lireEpice()`, comme `lirePese()` pour la viande) : partout où un code
  entre (la caméra, la fiche, les deux sacs). Open Food Facts n'est jamais appelé pour une épice (`chercherOFF`; `codeOffOk` la refuse).
- **Leur site, par le coffre-fort** (`Coffre.epiceDeCru`, `chercherEpice()` d'`entree.js`) : le nom (adouci), le format et le prix de ce
  numéro (`format`, `prix`, `solde` de la réponse, sinon de sa ligne dans `formats`); **retenu sur l'appareil** (`rdg_epices`, `EPICES_CRU`). Pas trouvé, « action inconnue », pas de réseau : rien
  de retenu, l'épice prend son numéro pour nom (`nomCode()` le reconnaît : Compléter ne le propose pas comme nom).
- **Les deux sacs** (`epicerie.js`) : `identifierCode()` passe par `chercherEpice()` (jamais IGA ni Open Food Facts); `articleNouveau()`
  rend son nom, la marque Épices de Cru (retrouvée, sinon créée); **pas de case photo** (ni à la correction). **La carte** : son nom,
  « Épices de Cru · 50 g » — **le format de CE numéro** (chaque format a le sien : 10722 le 50 g, 30722 le 200 g, deux clés pour le même
  aliment, comme deux codes-barres), rien à choisir; **« Prix payé : 13,75 $ »** (`poserPrixEpice()` : le prix de leur site pour ce
  numéro — en solde à ce scan-là : le solde; pas encore lu sur cet appareil : le dernier payé pour ce numéro, et leur site est relu en
  arrière-plan). Le crochet : **la sous-catégorie
  « Fines herbes, épices »** pour un aliment neuf (`sousCatEpices()`, par son nom), **posée sur le meuble « Porte d'épices »** quand
  l'épice n'a pas d'endroit habituel (`meubleEpices()`, par son nom; pas d'espace), le prix.
- **Le sac seul** (`entree.js`, `remplirEpiceFiche()`) : le nom, la marque, le format et le prix de ce numéro, la catégorie et la
  sous-catégorie, une carte d'endroit sur la Porte d'épices (l'espace vide); une épice déjà à nous : son prix (`poserPrixEpiceFiche()`).
- **Rechercher et le +** (`chercherNomCode()`) : un pot pas à nous dit son nom de leur site (« Tu n'en as pas — Sept-épices d'Alep »).
  Consommer, Ouvrir, Déplacer : la sorte du pot scanné, comme un code-barres.
- Essai dans le faux navigateur (jsdom, le vrai `rdg.html`, un faux coffre-fort qui répond comme leur site vu à l'ordi) : 53 vérifications.
- **Taper le code chez Épices de Cru** (J-C, 2026-10-20 : « si j'inscris le code de l'épice, ça devrait aller chercher l'épice. Là ça
  fait PLU non reconnu ») : à la tuile Épices de Cru (les deux sacs, le sac seul), « Taper le code » prend **leur numéro, 5 chiffres** =
  l'épice (« EDC-10722 »), et **le Lot au complet, 11 chiffres** (sans le tiret) = l'épice et sa date (`codeTapeEpice()` d'`epicerie.js`,
  l'épicerie reconnue par son nom : `estEpicesDeCru()`). Ailleurs, 4 ou 5 chiffres restent un PLU. Pas encore testé en ligne, T138.
  Essai dans le faux navigateur : 12 vérifications.

## 4. Pour le coffre-fort (`api.gs`, à l'ordi)

**D'abord l'essai, avant d'écrire l'action** : leur site répond-il à Google ?

1. Trouver comment leur site cherche un numéro (le formulaire de recherche de epicesdecru.com; la capture montre « 1 résultat pour
   10722 » et les onglets Tous · Produits · Recettes · Articles). **Piste, pas vérifiée** : si c'est un WooCommerce, son API publique
   (`/wp-json/wc/store/v1/products?search=10722`, ou `?sku=10722`) rend du JSON — le nom, les variations (les formats et leurs prix),
   la photo — sans lire de HTML.
2. Depuis Apps Script (`UrlFetchApp`, pas le navigateur de l'ordi : c'est Google qui doit passer), chercher **10722** et **10262**.
   Attendu : « Sept-épices d'Alep » (50 g, 13,75 $; 200 g) et un curcuma Lakadong (40 g ?).
3. **Le site refuse** (403, une page anti-robot, une page vide) : arrêter, l'inscrire ici et dans `CLAUDE.md` (point 93) — on passe à B.
   **Il répond** : écrire l'action ci-dessous, l'essayer à blanc, J-C colle (Nouvelle version, la même URL).

**L'action `epiceDeCru`** (une lecture, sans verrou, dispatchée avant le verrou de `doPost` comme `envoyerOFF` : l'appel à leur site
peut prendre quelques secondes) :

```
{ action: 'epiceDeCru', numero: '10722' }
→ { ok: true, trouve: true, numero: '10722', nom: 'Sept-épices d\'Alep',
    formats: [{ format: '50 g', prix: 13.75 }, { format: '200 g', prix: … }], photo: '<URL>', lien: '<la page du produit>' }
· pas trouvé : { ok: true, trouve: false }
· leur site ne répond pas : { ok: false, erreur: '<court>' }   (l'app réessaiera plus tard; jamais definitif)
```

- `numero` : exactement 5 chiffres → sinon `{ ok: false, erreur: 'numero', definitif: true }`.
- **Jamais deviné** : `trouve: true` seulement si le produit rendu porte **ce numéro** (son SKU, ou le numéro sur sa page) — une
  recherche qui rend un produit qui contient « 10722 » ailleurs (une description) ne compte pas. Plusieurs produits pour un numéro :
  `trouve: false`.
- **Le nom en français, tel que leur site l'écrit dans sa page** (« Sept-épices d'Alep ») — leur page l'affiche en majuscules, sans doute
  par le CSS : rendre le texte d'origine. Un nom tout en majuscules, l'app l'adoucit, mais « ALEP » deviendrait « alep » (vu à l'essai).
  Leur site est sans doute bilingue : la page française.
- `formats` : chaque format vendu, « 50 g » (un nombre, une espace, l'unité — la forme de la Réserve), son prix en nombre. Le plus
  petit d'abord.
- **À regarder pendant l'essai** : chaque format a-t-il **son propre numéro** sur leur site (le SKU d'une variation : « 10722 » le 50 g, un autre le 200 g ?) — si oui, le noter : l'app saurait le format au scan, sans le demander. Le noter aussi s'ils partagent le même.
- Rien n'est écrit dans le Sheet (une lecture). Pas de mémoire non plus : l'app ne demande qu'au premier scan d'un numéro.

**Essayer à blanc** : 10722, 10262, un numéro qui n'existe pas (99999), un numéro mal formé, leur site qui ne répond pas (un faux
`UrlFetchApp` qui lance une erreur).

**✅ ESSAYÉ DEPUIS GOOGLE par J-C le 2026-10-18 à 18 h 01 (`essayerEpicesDeCru`) : leur site répond à Google** — 10722 Sept-épices d'Alep 50 g 13,75 $, 30722 le même 200 g 41,25 $, 10262 Curcuma Lakadong moulu 40 g 13 $, 99999 rien : exactement ce que l'essai à blanc attendait. **Le plan A tient** (pas de copier-coller). 

**✅ `api.gs` ÉCRIT À L'ORDI le 2026-10-18, essayé à blanc (20 vérifications, sur les vraies réponses de leur site) — ⚠️ À COLLER par J-C, PUIS `essayerEpicesDeCru()` lancée une fois depuis l'éditeur** (le journal dit si leur site répond à Google) : **leur site répond (depuis l'ordi)**, et sans lire de HTML — ce n'est pas un WooCommerce mais une API publique en JSON, **`epicesdecru.com/api/search?query=10722`** (la page française par défaut; derrière **Cloudflare** : qu'il laisse passer les serveurs de Google, seul l'essai depuis l'éditeur le dira). **Chaque format a son propre numéro** : **10722 = Sept-épices d'Alep 50 g, 13,75 $ · 30722 = le même en 200 g, 41,25 $** (le 1er chiffre change, les 4 derniers restent) · 10262 = Curcuma Lakadong moulu 40 g, 13 $ · 99999 : rien — **l'app saura le format au scan, sans le demander**. L'action **`epiceDeCru`** { numero } → { trouve, nom, format et prix de CE numéro, formats (chacun son numéro, le plus petit d'abord, `solde` s'il y en a un), photo, lien }; trouvé seulement si UN produit porte ce numéro sur un de ses formats; leur site qui refuse (403, « Just a moment… ») ou ne répond pas = `ok: false`, jamais définitif.

**À vérifier aussi** : la clé d'une épice s'écrit **« EDC-10722 »** dans STOCK col. I (`entrerArticle`, en texte). `texteCode()` (et ce
qui rend `references.codes` et `stock`) doit la rendre **telle quelle** — elle n'est pas un nombre : ni 0 remis, ni chiffres seuls.

**L'app attend déjà cette action** (bâtie le 2026-10-18) : tant que le coffre-fort répond « action inconnue », une épice d'Épices de Cru
entre quand même — nommée par son numéro (« 10722 »), Épices de Cru, dans Fines herbes, épices, sur la Porte d'épices; Compléter la
nommera. Une épice trouvée une fois est retenue sur l'appareil : le même pot rescanné n'appelle plus personne.

## 5. La date du lot (le point 94) — réflexion finie, ✅ BÂTIE le 2026-10-19 (pas encore testée en ligne, T133 à T137)

- La fin du Lot = **la date de mise en pot, JJMMAA** (« 10722 - 070619 » = le 7 juin 2019; « 10722 - 201025 » = le 20 octobre 2025).
  Aujourd'hui l'app ne la garde pas : la clé ne retient que les 5 premiers chiffres.
- J-C, 2026-10-18 : **« oui on va se servir de la date »**.
- Lu dans le code : « À consommer bientôt » compte de l'entrée (STOCK col. E, ou le dernier passage congélo ↔ frais, col. P); une épice
  y a **un an** (Garde-manger, 365 jours : la proposée « Fines herbes, épices et sauces » ne s'applique pas à son nom à lui, « Fines
  herbes, épices »). **À penser** : comptée de la mise en pot, sa Sept-épices de 2019 serait « date passée », en rouge — et sans doute
  bien de ses 50 pots : la liste pourrait s'en remplir.
- **Demandé à J-C (2026-10-18)** : que doit dire la date ? À consommer bientôt, comme le lait (même si la liste s'allonge) · son âge
  sous son nom (« mis en pot en juin 2019 »), sans alerte · quel pot prendre d'abord quand il y en a deux (le plus vieux) — un ou
  plusieurs. — ✅ **J-C : « c »** : **quel pot prendre d'abord, le plus vieux** — ni alerte dans À consommer bientôt, ni âge sous le nom.
- Ce que ça demande (Claude) : **chaque pot garde sa date** (une ligne de STOCK par pot, sa date de mise en pot à côté — une colonne de
  plus, `api.gs` à l'ordi), lue dans le code QR au scan; deux pots de la même épice ont la même clé (« EDC-10722 »), seule la date les
  distingue.
- **Proposé par Claude, demandé à J-C** : c'est dans **Ouvrir** que ça sert (ouvrir le prochain pot) — tu scannes celui que tu tiens;
  s'il y en a un plus vieux : « Il y en a un plus vieux : mis en pot le 7 juin 2019 » (tu prends l'autre, ou tu ouvres celui-ci
  quand même); sans scanner, le nom tapé : la ligne dit la date du plus vieux, celui qu'Ouvrir ouvrira. — sa réponse : il demande
  « quelle est la formule des 5 chiffres pour une date ? » (expliqué : les 5 premiers = l'épice et son format, la date = les 6 après le
  tiret, JJMMAA — une déduction, pas dite par Épices de Cru), puis **« ouin, ça me surprendrait que ce soit une date alors »**.
- **Pas vérifié que c'est une date.** Les trois lus (070619, 201025, 081123) sont des dates valides en JJMMAA (et en AAMMJJ aussi :
  2007, 2020, 2008 — moins plausible). Un numéro de lot qui ne serait pas une date reste utile pour montrer QUEL pot prendre (« prends
  celui du lot 070619 » : il le lit sous le pot), mais pas pour dire lequel est le plus vieux quand deux pots entrent le même jour
  (ses 50 pots, entrés d'un coup). **Demandé à J-C** : un pot acheté il y a peu — ses 6 derniers chiffres donnent-ils une date juste
  avant l'achat ? — ✅ **J-C : « oui, c'est bien une date »** (vérifié sur un pot acheté il y a peu) : **la fin du Lot = la date de mise
  en pot, JJMMAA.**
- **Redemandé à J-C** : c'est dans Ouvrir que ça sert (le scan d'un pot : « Il y en a un plus vieux : mis en pot le 7 juin 2019 ») ? —
  **J-C : « je vais aller chercher le plus vieux afin de faire une rotation. Les épices sont à la même place, mais quelques-unes ont
  des réserves »** : une rotation (le plus vieux d'abord); tous les pots au même endroit (la Porte d'épices) — seule la date dit lequel
  prendre. **Demandé ensuite (Claude)** : le moment = le pot fini, dans Consommer — l'app dit aussitôt « Le prochain : mis en pot le
  7 juin 2019 » (seulement s'il en reste un autre de cette épice) ? — ✅ **J-C : « Oui »**.
- **Proposé ensuite (Claude), demandé à J-C : je bâtis ?** — (1) chaque pot garde sa date (lue dans son code QR à l'entrée; une
  colonne de plus à STOCK, `api.gs` à l'ordi); (2) **Consommer au scan sort CE pot** (sa date le désigne); par le nom tapé : le plus
  vieux; (3) puis, s'il reste un pot de cette épice (le 200 g compris) : « Le prochain : mis en pot le 7 juin 2019 »; (4) **Ouvrir**,
  au scan d'un pot alors qu'un plus vieux attend : « Il y en a un plus vieux : mis en pot le 7 juin 2019 » (il ouvre quand même celui
  qu'il tient). Les pots entrés sans date : comptés du jour de leur entrée. — ✅ **J-C : « Ok »**.

**Ce qui est bâti (2026-10-19)** :
- **Chaque pot garde son Lot** : la caméra le lit (`lireEpice()` le retient à côté de la clé, `LOT_LU`, pris une fois : `prendreLot()`),
  la ligne de STOCK le porte en **col. R**, tel qu'écrit sous le pot (« 10722 - 070619 » : du texte, le Sheet n'y voit ni nombre ni
  date) — les deux sacs (`validerCarte()`) et le sac seul (`enregistrer()`); sa date : `dateLot()` (JJMMAA; pas une vraie date : rien).
  Un pot tapé à la main (sa clé) ou choisi parmi les habituels : pas de Lot, compté du jour de son entrée (`agePot()`).
- **D'ici le collage** (section 6) : le coffre-fort n'écrit pas la col. R à l'entrée — sans « lot » dans sa réponse, l'app lui renvoie
  la ligne entière, réécrite (`entrerAvecLot()`, et un geste `deplacer` au sac seul) : `deplacer` écrit déjà la ligne telle qu'elle
  arrive. Un appel de plus par pot, seulement pour un pot à Lot; après le collage, plus rien de plus.
- **Le plus vieux d'abord** (`plusVieuxDabord()`) : le pot scanné avant tous (`lotVise()` : son Lot, dans Consommer et Ouvrir), puis la
  mise en pot, sinon l'entrée — Consommer (`planSortie()`), Ouvrir (`ouvrirPart()`), la conserve de l'Inventaire (`ouvrirDeLaLigne()`).
  Un aliment sans Lot : comme avant (l'entrée).
- **Consommer** (aussi la fourchette de l'Inventaire), un pot fini, consommé ou jeté : « **Consommé. Le prochain : mis en pot le 7 juin
  2019** » (`texteSortie()`) — s'il en reste un (le 200 g compris), le déjà ouvert d'abord, sinon le plus vieux; « (200 g) » si ce
  n'est pas le même format, « , Garde-manger » s'il est ailleurs (la réserve); sans Lot : « entré le … ». Le dernier : « Consommé » seul.
- **Ouvrir**, au scan d'un pot alors qu'un plus vieux attend, fermé : « **Il y en a un plus vieux : mis en pot le 7 juin 2019** »
  (`avertirPlusVieux()`); la conserve ouvre quand même celui qu'il tient. **Sans scanner** (le nom tapé, l'Inventaire) : le plus vieux
  s'ouvre, et le message dit lequel, s'il en reste d'autres fermés : « **Ouvert : celui mis en pot le 7 juin 2019** » (`texteOuvert()`).
- Essai dans le faux navigateur : 34 vérifications (et les 53 des épices, toujours bonnes).

## 6. Pour le coffre-fort (`api.gs`, à l'ordi) — la date du lot (le point 94)

Une colonne au bout, rien ne bouge (comme Q `Ouvert`, `RdG-09`, section 4) :

1. **STOCK col. R `Lot`** : l'en-tête (`assurerEntetes()` / `poserEntetes()`), **la colonne en texte** (`@`, comme `TOUT_TEXTE` :
   « 10722 - 070619 » doit rester tel quel — jamais un nombre, jamais une date).
2. **`entrerArticle`** : chaque endroit peut porter **`lot`** (`endroits: [{ id, emp, qte, lot: '10722 - 070619' }]`, les deux sacs et le
   sac seul) → l'écrire en col. R de sa ligne (vide sinon); **répondre `lot: true`** quand il sait l'écrire (l'app ne renvoie plus la
   ligne : `entrerAvecLot()`). Rejouable comme avant (le même jeton : rien d'écrit, `lot: true` quand même).
3. **`references.stock` et `lire('Stock')`** rendent la col. R telle quelle (du texte). `deplacer`, `consommer`, `modifier` : rien à
   changer (ils écrivent la ligne telle qu'elle arrive; `assurerLargeur()` élargit l'onglet).
4. `reunirProduits` : rien (la col. R suit sa ligne).

**Essayer à blanc** : une entrée avec un `lot` (col. R écrite, en texte), sans `lot` (vide), le même jeton renvoyé; une ligne de 18
colonnes réécrite par `deplacer` (le Lot reste du texte).

**✅ `api.gs` ÉCRIT À L'ORDI le 2026-10-19, essayé à blanc (18 vérifications) — ⚠️ À COLLER par J-C (Nouvelle version), à l'ordi** : STOCK col. R `Lot` (l'en-tête, à la prochaine entrée : `assurerEntetes`); `entrerArticle` écrit `endroits[i].lot` en col. R, **la case au format texte avant d'écrire** (« 070619 » garde son 0), O, P, Q vides; sans lot, la ligne est **identique à celle d'avant**, à la cellule près; il répond **`lot: true`** (aussi au jeton rejoué, rien d'écrit); `deplacer` / `consommer` : une ligne de 18 colonnes garde son Lot en texte (réécrite, ou ajoutée au bout : sa case en texte d'abord), une ligne plus courte réécrite ne l'efface pas; `references.stock` et `lire('Stock')` le rendent. **Après le collage, l'app n'envoie plus l'appel de plus** (`entrerAvecLot()` voit `lot: true`).

**L'app est bâtie** : d'ici là, le Lot arrive quand même au Sheet (la ligne réécrite par `deplacer`, voir plus haut) — le collage
retire seulement cet appel de plus.
