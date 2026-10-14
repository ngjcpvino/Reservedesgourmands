# RdG-10 — Contribuer à Open Food Facts (2026-10-14)

> Le point 50 de la liste numérotée de `CLAUDE.md`. J-C : « Je peux contribuer. Et j'aimerais le faire. » — « aider le plus
> possible, tant qu'à entrer des codes-barres lors d'un achat ». **Réflexion finie le 2026-10-14** (seize décisions, section 2,
> aperçus vus et tranchés). **✅ L'app BÂTIE le même jour** (J-C : « Bâtis l'app, je ferai api.gs à l'ordi »), **pas encore
> testée en ligne** (tests T55 à T60 de `RdG-tests-2026-10-07.md`). **Le coffre-fort : section 4, ✅ ÉCRIT À L'ORDI le 2026-10-14, à coller.**

## 1. Ce qui était déjà dit

- `RdG-sources-donnees.md` : Open Food Facts identifie un produit par son code-barres (le nom, la marque, le format, la photo);
  « en prime » : les allergènes, le Nutri-Score… (point 22, pas touché ici).
- Le 2026-09-27 : le nom en français seulement; le 2026-09-30 : faute de nom français, la fiche prend le nom principal (que J-C corrige).
- Le nouveau service de recherche d'Open Food Facts refuse les appels d'une page web : le tri passe par le coffre-fort
  (`chercherOFF` d'`api.gs`). La fiche d'un produit (`/api/v2/product/CODE.json`), elle, se lit directement de l'app.

## 2. Décidé le 2026-10-14

1. **À l'épicerie, rien** (J-C : « à l'épicerie on scanne pour voir si on achète, on n'entre pas de données ») : Rechercher n'y
   touche pas.
2. **À la maison, à l'entrée (le sac seul, les deux sacs), l'app propose les photos** quand Open Food Facts n'a pas le produit ou
   pas ses photos — **toujours avec « Plus tard »**.
3. **« Plus tard » → une liste des produits pas complétés pour Open Food Facts**, faite à temps perdu…
4. … **ou quand on consomme le produit** (le produit en main) : **à Consommer et Ouvrir, un rappel qu'on peut ignorer** (J-C : « Yes »).
5. **La liste vit dans Listes, la 4e** (J-C : « Oui »), une barre à son nom comme les autres.
6. **J-C a un compte Open Food Facts** — son nom et son mot de passe vont dans les **Propriétés du script**, à l'ordi, jamais dans
   le dépôt ni la conversation.
7. **On envoie les 3 photos (le devant, les ingrédients, la valeur nutritive), le nom français, la marque, le format — pas ses
   catégories** (celles d'Open Food Facts ne sont pas les siennes). **Avant d'envoyer, un écran « très convivial et visuel »** qui montre tout.
8. **L'écran avant d'envoyer = B** (sur aperçu, parmi A la fiche, B les trois photos puis le texte, C comme chez eux) : les 3 photos
   côte à côte, leur nom dessous; le nom, la marque, le format dans une liste blanche, chacun son crayon; « Tout est beau ? Merci
   pour ton aide ! »; « Envoyer à Open Food Facts » (vert), « Plus tard ».
9. **Le même écran sert à PRENDRE les photos** (J-C : « Oh oui ») : une case vide = on la touche, l'appareil photo de l'iPhone
   s'ouvre, la photo se pose dans sa case.
10. **Les deux sacs ne s'arrêtent pas** (J-C : « Si j'ai pas le temps, oui ») : sur la carte d'un produit qu'Open Food Facts ne
    connaît pas (ou sans ses photos), son logo paraît; touché = l'écran des photos; OK sans le toucher = sur la liste, tout seul.
11. **Le sac seul, pareil** (J-C : « Oui, pareil partout ») : le logo sur la fiche; Enregistrer sans le toucher = sur la liste.
12. ~~L'icône = A, l'appareil photo simple~~ — **remplacée par 15**.
13. **La liste = Y, toute la liste** (sur aperçu, contre X par catégorie) : une seule liste blanche, le plus vieux en premier;
    chaque ligne : le nom, marque · format, « Il manque : … », « Entré le 3 oct. », le logo.
14. **Le rappel = R1, sur la ligne** (sur aperçu, contre R2 une question) : dans Consommer et Ouvrir, la ligne d'un produit de la
    liste porte le logo (avant la conserve dans Ouvrir); touché = l'écran des photos; ignoré = rien.
15. **Le logo d'Open Food Facts** (l'image envoyée par J-C) : **L1, en couleurs sur une pastille blanche**, partout — la carte des
    deux sacs, la fiche, les lignes de la liste, de Consommer et d'Ouvrir, et en grand dans une case vide; **L2, sa forme brune sur la
    pastille beige, sur la barre « Pour Open Food Facts » de Listes** (J-C : « L1 dans ces pages mais L2 dans le bouton de la
    liste » — « La barre dans Listes »).
16. **L'aperçu final de la barre : « Oui »** — la forme à gauche du nom, la barre pas plus haute que les autres.

**Mis de côté** : Open Prices, le volet prix d'Open Food Facts (J-C : « plus compliqué… tellement variable par région, même au Québec »).

**Choisi par Claude, pas demandé** (à revoir à l'usage) : l'app ne demande que ce qui manque à Open Food Facts; un produit quitte la
liste quand ses 3 photos sont parties (un texte laissé vide — du vrac, sans marque — n'a rien à dire : il n'est plus redemandé
après un envoi); le même compte pour les deux usagers; les photos réduites sur l'appareil avant l'envoi (1600 px, JPEG 0,85 : le
VPN); une photo par envoi; l'écran relit Open Food Facts en s'ouvrant (quelqu'un l'a peut-être complété entre-temps : il quitte
alors la liste, « Open Food Facts l'a déjà. Merci quand même ! »); les photos prises restent **en mémoire le temps de la visite**
(trop lourdes pour l'appareil) — « Plus tard » les garde jusqu'à ce que l'app se ferme; le logo n'est proposé qu'au **premier** scan
d'un code (un code déjà entré ici ne l'est plus, sauf s'il est déjà sur la liste).

## 3. Ce qui est bâti (l'app, 2026-10-14)

`JS/off.js` (nouveau, chargé après `epicerie.js`), `vue-off` et la 4e barre de Listes dans `rdg.html`, le logo au root de
`CSS/rdg.css` (`--off-logo`, `--off-forme` : tirés de l'image de J-C).

- **Ce qui manque à Open Food Facts** : `chercherOFF(code, frais)` (`scan.js`) donne maintenant `manque` (devant, ingredients,
  nutrition, nom, marque, format), ses `photos` (petites) et `erreur` (pas de réponse : on ne sait rien, ce n'est pas « inconnu »);
  la même réponse sert 2 minutes (l'entrée la demande deux fois : le nom, puis ce qui manque).
- **Le sac seul** : le logo à côté du code (`#fiche-off`, `offFiche()` après la recherche du code); touché → `enregistrer()`, puis
  l'écran (`offApresFiche()`), Plus tard → le menu.
- **Les deux sacs** : le logo sur la carte (`offCarte()`); touché → OK, puis l'écran (`offApresCarte()`), Plus tard → le scan; une
  carte qui pose sa question (« L'associer à ce produit ? ») : le logo touché s'entoure de vert, la réponse fera le reste.
- **Consommer, Ouvrir** : `boutonOff()` sur la ligne d'une part dont un code est sur la liste.
- **La liste** (`remplirOff()`) et **l'écran** (`montrerOff()`, `remplirVueOff()`, `envoyerOff()`) : comme décidé.
- **La liste vit dans l'onglet `OFF`** (section 4), écrite par **sa propre file** (`rdg_off_attente` : `ajouter` une ligne neuve avec
  l'ID de l'app, `modifier` ensuite) — jamais la file des gestes : un coffre-fort qui ne connaît pas encore l'onglet n'y bloque rien.
  D'ici le collage, la liste vit sur l'appareil (`rdg_off`), et **Envoyer répond « Pas envoyé : le coffre-fort ne sait pas encore
  parler à Open Food Facts (api.gs, à l'ordi) »** (les photos restent prises).
- Essai dans le faux navigateur : 53 vérifications.

## 4. Pour le coffre-fort (`api.gs`, à l'ordi)

**L'onglet `OFF`** — connu d'`ajouter` et de `modifier` (`ENTETES.OFF`), créé tout seul avec ses en-têtes, **chaque cellule en
texte** (`TOUT_TEXTE`, comme `Erreurs` : un code-barres garde son 0 du début) :

| Col | Nom | Sens |
|-----|-----|------|
| A | ID | donné par l'app (`idLocal()`) — `ajouter` avec un ID déjà là = `dejaFait`, rien d'écrit (déjà le cas) |
| B | Code | le code-barres scanné (8 à 14 chiffres), en texte |
| C | ProduitID | l'aliment (lien par ID) |
| D | Manque | ce qui manque encore à Open Food Facts, séparé par des virgules : `devant`, `ingredients`, `nutrition`, `nom`, `marque`, `format` |
| E | Date | le jour de l'entrée (AAAA-MM-JJ) |
| F | Qui | Outils → Qui entre les articles |
| G | Envoye | le jour où tout est parti (vide = encore sur la liste) |

**`references` renvoie `off`** : les lignes A → G dont **G est vide**, telles quelles (en texte). Pas d'onglet : `[]`. (L'app :
absent = « le coffre-fort ne connaît pas encore l'onglet », elle garde sa liste; présent = celle du Sheet, ce qui attend encore dans
sa file reposé par-dessus.) **Aucun appel de plus au Sheet si `references` lit déjà tout l'onglet d'un coup.**

**L'action `envoyerOFF`** (une écriture, sous verrou pour la ligne; l'appel à Open Food Facts peut se faire hors verrou) :

```
{ action: 'envoyerOFF', code, ligne: [A..G],
  photo: 'devant' | 'ingredients' | 'nutrition', image: '<JPEG en base64, sans « data:… , »>'   ← une photo
  — ou —
  champs: { nom?, marque?, format? } }                                                          ← le texte qui manque
→ { ok: true, manque: '<la col. D après l'envoi>' }   ou   { ok: false, erreur: '<court>' }
```

1. **La ligne** : si son ID (ligne[0]) n'est pas dans l'onglet, l'ajouter d'abord telle quelle (sa création attendait peut-être
   encore dans la file de l'appareil).
2. **Le compte** : Propriétés du script **`OFF_UTILISATEUR`** et **`OFF_MOT_DE_PASSE`** (J-C les entre lui-même, à l'ordi : Paramètres
   du projet → Propriétés du script). Absents → `{ ok: false, erreur: 'compte Open Food Facts absent (Propriétés du script)' }`.
3. **Une photo** : `UrlFetchApp.fetch('https://world.openfoodfacts.org/cgi/product_image_upload.pl', { method: 'post', payload: {
   code, user_id, password, imagefield: 'front_fr' | 'ingredients_fr' | 'nutrition_fr', ['imgupload_' + imagefield]:
   Utilities.newBlob(Utilities.base64Decode(image), 'image/jpeg', code + '-' + photo + '.jpg') }, muteHttpExceptions: true })` (un
   objet qui porte un Blob part en multipart). Réponse JSON `status: 'status ok'` → réussi; **« already been sent » (la même photo
   déjà reçue) → réussi aussi** (un 2e envoi après une coupure ne fait rien de mal). Le reste : `{ ok: false, erreur: <son message> }`.
4. **Le texte** : `UrlFetchApp.fetch('https://world.openfoodfacts.org/cgi/product_jqm2.pl', { method: 'post', payload: { code,
   user_id, password, lang: 'fr', product_name_fr: champs.nom, brands: champs.marque, quantity: champs.format } })` — **seulement
   les champs reçus** (jamais vider ce qu'Open Food Facts a déjà). Réponse `status: 1` → réussi (un produit inconnu d'eux est créé).
   Les catégories : jamais.
5. **Réussi** : retirer de la col. D ce que l'envoi portait (la photo, ou les champs envoyés); D vide → G = aujourd'hui (heure du
   Québec); réécrire la ligne; rendre `{ ok: true, manque: D }`.
6. Open Food Facts demande qu'une app se nomme : si `UrlFetchApp` le permet, un en-tête `User-Agent: ReserveDesGourmands/1.0`;
   sinon, au moins `comment: 'La Réserve des Gourmands'` dans le payload.
7. **Essayer d'abord sur leur serveur d'essai** (`world.openfoodfacts.net`, qui demande en plus l'authentification de base
   `off` / `off`), puis la vraie adresse. **Un envoi pèse 300 à 500 Ko** (une photo de 1600 px en base64) : `doPost` le reçoit.

Une fois écrit et essayé : l'inscrire ici et dans `CLAUDE.md` (« écrit, à coller »); J-C colle → **Nouvelle version** (même URL).

**✅ ÉCRIT À L'ORDI le 2026-10-14 — à coller par J-C, puis ses deux Propriétés du script.** **`envoyerOFF`** (dispatché AVANT le verrou de `doPost` : la ligne s'écrit sous verrou, `sousVerrou()`, l'appel à Open Food Facts hors verrou), **`references.off`** (`lignesOff()` : G vide, en texte; pas d'onglet = `[]`; 3 appels au Sheet de plus) et **l'onglet `OFF`** (`ENTETES.OFF`, `TOUT_TEXTE` : le 0 d'un code reste). **Lu dans leur code** (`cgi/product_image_upload.pl`, `cgi/product_jqm_multilingual.pl`) **et sondé sur leur serveur d'essai sans compte** (rien ne s'y écrit : refusé avant) : une photo réussie = « status ok »; **la même photo déjà reçue = imgid −3**, réussi aussi; un texte sans compte valable = status 0 « no user credentials » (→ « Open Food Facts a refusé le compte (le nom ou le mot de passe ?) », comme leur page de connexion en HTML); **le même texte déjà là = « not modified »**, réussi aussi. **Changé de la consigne** : **`lc: 'fr'` et `cc: 'ca'` au lieu de `lang: 'fr'`** (`lang` changerait la langue principale d'un produit qu'ils ont déjà; sans `cc`, un produit neuf créé depuis les serveurs de Google serait dit vendu aux États-Unis). **Leur serveur d'essai** : la Propriété `OFF_ESSAI` = O (world.openfoodfacts.net, off / off) — il demande un compte à lui, pas celui de J-C. Essai à blanc : 39 vérifications (un faux Open Food Facts qui répond comme leur code).

## 5. À voir à l'usage

- Retirer un produit de la liste sans l'envoyer (un produit qu'on ne veut pas photographier) : pas prévu.
- Un produit tout consommé reste sur la liste (plus de produit en main pour les photos).
- Les photos prises puis « Plus tard » se perdent quand l'app se ferme.
- Le logo n'est pas dans l'Inventaire ni dans Déplacer (pas demandé).
