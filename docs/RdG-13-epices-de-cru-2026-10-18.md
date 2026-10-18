# RdG-13 — Les épices d'Épices de Cru : un code QR, leur numéro (2026-10-18)

> Le point 93 de la liste numérotée (`CLAUDE.md`). **En réflexion** : la direction est choisie (A), les questions de la section 3
> se posent une à la fois. Zéro code dans l'app tant qu'elles ne sont pas tranchées.

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

## 3. Questions ouvertes, dans l'ordre (une à la fois)

1. **Le nom de leur site devient-il l'aliment** (« Sept-épices d'Alep », « Curcuma Lakadong » : chaque épice la sienne), Épices de
   Cru la marque ? Conséquence : le curcuma Lakadong fini va sur la Liste d'épicerie, même s'il reste un curcuma ordinaire.
   (Reco de Claude : oui.) — ✅ **J-C : « Oui »** (décision 4).
2. **La catégorie posée d'office** : Garde-manger → Fines herbes, épices ? — ✅ **J-C : « Oui »** (décision 5).
3. **Le format** : leur site en donne deux (50 g, 200 g), le code QR aucun. Le plus petit (le pot) d'office ? La recharge en sachet
   a-t-elle le même code QR ? — **demandé à J-C le 2026-10-18** : achète-t-il seulement les pots, ou aussi les 200 g ? — **J-C : « Aussi »**. **Demandé ensuite** : le 200 g porte-t-il le même code QR, avec le même numéro (10722) ? (leur recherche « 10722 » rend un seul produit pour les deux formats : sans doute le même numéro — alors l'app ne peut pas savoir lequel au scan.)
4. **Le prix** : celui de leur site remplit-il le prix payé (comme la circulaire) ?
5. **Où il est rangé** la première fois : l'Escale, ou l'endroit habituel des épices ?
6. **Noté, pas creusé** : la date du lot dit l'âge de l'épice — « À consommer bientôt » pourrait compter de là.

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
- **Le nom en français**, tel que leur site l'écrit (l'app l'adoucit : « SEPT-ÉPICES D'ALEP » → « Sept-épices d'Alep »). Leur site est
  sans doute bilingue : la page française.
- `formats` : chaque format vendu, « 50 g » (un nombre, une espace, l'unité — la forme de la Réserve), son prix en nombre. Le plus
  petit d'abord.
- Rien n'est écrit dans le Sheet (une lecture). Pas de mémoire non plus : l'app ne demande qu'au premier scan d'un numéro.

**Essayer à blanc** : 10722, 10262, un numéro qui n'existe pas (99999), un numéro mal formé, leur site qui ne répond pas (un faux
`UrlFetchApp` qui lance une erreur).

**L'app n'attend pas encore cette action** : elle se bâtira quand les questions de la section 3 seront tranchées. Tant que le
coffre-fort répond « action inconnue », une épice d'Épices de Cru sera un produit pas reconnu, nommé par son numéro.
