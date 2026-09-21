# RdG — Sources de données externes (scan + prix)

> Note du 2026-09-20. Pour ne pas reperdre la recherche (comme la fois où
> « on avait déjà regardé ça » dormait dans le vieux `README.md`).
> Deux besoins DIFFÉRENTS, à ne pas confondre : **identifier** un produit
> (le scan) et **connaître son prix / ses spéciaux** (point 12).

## LA CLÉ DE VOÛTE — un seul code fait tout

Le **code-barres (UPC)** est la **clé universelle**. Vérifié avec Jean-Claude :
le Nutella canadien porte le code **062020000743**, et ce **même** numéro se
retrouve à trois endroits :

- **ce qu'on scanne** (le code-barres sur l'emballage),
- le **« Numéro de produit »** affiché sur **superc.ca**,
- le **code** dans **Open Food Facts**.

Conséquence : l'association produit ↔ prix se fait **par le code, précise** —
plus besoin de matcher du texte flou. Un seul code :
1. → **Open Food Facts** donne l'**identité** (nom, marque, format, photo)
2. → le **site du magasin** donne le **prix / le spécial**

⚠️ Tient pour l'**emballé de marque**. **Marques maison** (Sélection,
Compliments, privées) et **vrac/frais** (pommes, bananes — pas de code réel)
restent des **zones grises**.

## SOURCE A — Open Food Facts (IDENTITÉ, pour le scan) — utilisée

- Gratuit, sans clé. Il faut juste un **User-Agent** propre
  (`ReserveDesGourmands/1.0 (courriel)`). Licence **ODbL** → créditer
  « données © Open Food Facts contributeurs ».
- Par code : `GET https://world.openfoodfacts.org/api/v2/product/{code}.json`
- Recherche texte : `GET https://world.openfoodfacts.org/api/v2/search?...`
- **`?fields=`** limite la réponse (ex. `fields=product_name_fr,brands,quantity,image_front_url`)
  → plus léger, plus rapide.
- Limites de débit : ~**15 lectures/min** par code, ~**10/min** en recherche
  (par IP). Amplement suffisant (un scan = 1 appel).
- `status` : **1 = trouvé** (fiche pré-remplie) · **0 = inconnu** → repli
  entrée manuelle (« tape un nom », déjà prévu).

**Champs utiles** (l'objet en a ~200) :

| Champ fiche | Champ OFF |
|---|---|
| Nom | `product_name_fr` (repli `product_name` en, `generic_name`) |
| Marque | `brands` (prendre la 1re) |
| Format | `quantity` (« 375 g » — nettoyer le « e » de fin s'il y a) |
| Indice sous-catégorie | `categories_tags` (`en:spreads`…) |
| Photo | `image_front_url` |

Bonus gratuits (pour plus tard) : `nutriscore_grade`, `nova_group`,
`ecoscore_grade`, `nutriments{}`, `ingredients_text_fr`, **`allergens`**,
`labels` (végé, sans gluten).

**Exemple réel** — code `062020000743` (Nutella CA) :
`product_name_fr` « Nutella » · `brands` « Nutella » · `quantity` « 375 g » ·
`countries` « Canada » · `image_front_url` ✔. (Le zéro de tête est normalisé :
`0062020000743`.)

## SOURCE B — Site du magasin (PRIX / SPÉCIAUX) — point 12, à brancher

- Le **plus riche** : **code + prix + format + circulaire**. Jointure **par
  code** (le « Numéro de produit » = l'UPC).
- Deux plateformes : **Metro inc.** (Super C, Metro, Marché Richelieu →
  superc.ca / metro.ca) vs **Sobeys** (IGA → iga.net).
- **Pas d'API publique documentée**, MAIS un **endpoint interne** existe
  presque sûrement (comme la SAQ pour Dionysos). Fragile (casse quand le
  site change), par magasin, zone grise côté conditions d'utilisation.
- **PIÈCE MANQUANTE = tâche de Jean-Claude (sur ordi)** : inspecter le réseau
  de superc.ca/metro.ca, trouver l'endpoint qui prend le numéro de produit
  et renvoie **produit + prix + dates du spécial**. Rapporter **URL + exemple
  de réponse** → Claude branche.

## SOURCE C — Flipp (plan B pour les spéciaux)

- Semi-ouvert : `https://backflipp.wishabi.com/flipp/items/search?locale=fr-ca&postal_code=XXX&q=YYY`
- Couvre **tous les magasins par code postal**, mais **spéciaux seulement**
  (ce qui est dans la circulaire) et **AUCUN code-barres**.
- Champs : `name` (texte libre), `current_price`, `original_price`,
  `pre_price_text` / `post_price_text` / `sale_story`, `valid_from`,
  `valid_to`, `merchant_name`, `brand_ids`, `clean_image_url`.
- Sans code → association **par texte** (flou). D'où : **plan B**, si le site
  du magasin ne se laisse pas interroger.

## SOURCE D — API code-barres payantes (dernier recours)

- Go-UPC, Barcode Lookup : code → infos produit, **parfois** prix. **Coûte**.
  À garder en réserve seulement.

## EN CLAIR

- **Maintenant (point 1, scan)** : Open Food Facts pour l'identité. Prêt à brancher.
- **Plus tard (point 12, prix)** : site du magasin par code (idéal), Flipp en
  repli. En attente que Jean-Claude débusque l'endpoint du magasin.
