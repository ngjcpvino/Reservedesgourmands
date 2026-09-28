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
- **Les Magasins en liste gérée** (voir plus haut) : à bâtir avant.

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

## 6. PARENTHÈSES (à ne pas perdre)

- La liste d'achats (point 5) pourra un jour dire « achète-le chez Metro
  cette semaine ».
- Le prix payé (STOCK, colonne Prix) permettra un jour de dire si un
  « spécial » en est vraiment un pour la maison.
