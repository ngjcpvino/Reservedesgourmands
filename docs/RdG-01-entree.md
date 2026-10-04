# RdG — Document de continuité — Brainstorm
*Juillet 2026 — À partager à chaque nouvelle session*
*Complément au document « Le Projet » (fondations) — les deux se lisent ensemble*

---

## 1. COMMENT TRAVAILLER AVEC JEAN-CLAUDE — À LIRE EN PREMIER

**Qui :** Jean-Claude. Méthodique. Deux utilisateurs de l'app : lui et son conjoint.

**Le rôle de Claude :** un guide qui prend le volant, qui challenge, qui dit
« mais as-tu pensé à ceci? ». PAS un exécutant pressé d'arriver à quelque chose.
Le premier projet a été mal construit par des Claude pressés — c'est exactement
ce qu'on ne refait pas.

**Les règles — non négociables :**
- **Réponses courtes.** Pas de romans. Pas de longues listes à puces.
- **Zéro code** tant que la réflexion n'est pas finie. Le code donne de
  l'urticaire à Jean-Claude. On parle ACTIONS, jamais implémentation.
- **Ne jamais parler de l'ancien projet/l'ancienne structure.** Elle n'existait
  que pour montrer l'intention. Elle est morte.
- **Un sujet à la fois, creusé à fond.** Ne JAMAIS proposer de passer au point
  suivant tant que le point courant n'est pas épuisé. Jean-Claude décide quand
  on change de sujet. (Erreur commise deux fois en début de session — chaque
  fois rappelé à l'ordre.)
- **Poser UNE question à la fois.** Pas trois scénarios d'un coup.
- **Méthode = brainstorm + arbres décisionnels.** « J'appuie sur un bouton,
  quels sont TOUS les scénarios possibles, qu'est-ce qui en découle. »
- Quand une correction de code arrivera un jour : trouve/remplace, UNE
  correction à la fois, attendre le « ok » entre chaque (voir préférences).
- Jean-Claude ouvre parfois des parenthèses vers d'autres sujets — les NOTER
  pour plus tard, ne pas les creuser tout de suite, refermer la parenthèse.

**Où on en est :** on bâtit la carte complète des actions AVANT toute
structure, tout Sheet, tout code. On a listé 12 actions possibles. On a
creusé la #1 (l'entrée). Il reste tout le reste.

---

## 2. LES 12 ACTIONS (liste de départ du brainstorm)

1. **Entrer des achats** (arrivée d'épicerie) — CREUSÉE, voir section 3
2. Sortir/consommer (le lait fini)
3. « En ai-je déjà? » (debout au magasin)
4. Trouver — où est rangé un item
5. Préparer la liste d'achats
6. Cuisiner — ai-je tout pour cette recette?
7. Déplacer un item d'un lieu à un autre
8. Sortie temporaire (prêt de la sableuse)
9. Sortir sans consommer (brisé/périmé)
10. Entrer sans achat (cadeau, retour de prêt) — réglé : même chemin que #1
11. Inventaire annuel — vérifier que les données disent vrai
12. Spéciaux de la semaine — acheter d'avance

Note : la raison de sortie (consommé/brisé/prêté/donné/périmé) est utile
« oui et non, ça dépend pourquoi » — à trancher au point 2.

---

## 3. ACTION 1 — L'ENTRÉE — DÉCISIONS PRISES

### Le flux réel de la maison (référence : Nielsen Homescan, qu'ils utilisent déjà)
Deux personnes, deux rôles, deux moments :
- **Lui** : scan en rafale à l'arrivée de l'épicerie (quoi, combien)
- **Jean-Claude** : range physiquement et confirme le placement (où)

**⚠️ Revu par J-C le 2026-10-02 (« ouin, pas vraiment ») : voir la section 3 bis, « TOUTE L'ÉPICERIE », qui remplace
cette section-ci là où elles diffèrent** (le panel abandonné, le rangement pendant le scan, Entrer / Compléter…).

### La session d'entrée (côté scan)
- La rafale ouvre une **session** : tout ce qui est scanné s'accumule dans
  une liste visible (« ai-je scanné le lait? » = un coup d'œil)
- **Confirmation à chaque scan** (comme Homescan), écran modifiable avant
  d'accepter (quantité, etc.) — c'est le poste de contrôle
- Correction possible dans la session tant qu'elle est ouverte
- **Fermer la session** = remet le compteur à zéro ET envoie la liste de
  placement à Jean-Claude

### Deux portes d'entrée
- **Scan code-barres** : le code est une CLÉ DE RECHERCHE, jamais
  l'identifiant du produit (ça c'est l'ID date/heure)
- **Sans code (vrac)** : bouton toujours visible → liste à deux vitesses :
  fréquents/récents en accès direct en haut, entonnoir par catégorie pour le
  reste. Jamais de clavier pour les habitués. *(Marqué « je crois » — au
  crayon, à valider à l'usage)*

### Multi-paquets et codes multiples
- Un code-barres porte un **multiplicateur** appris à la création
  (paquet de 12 yogourts : scan = +12)
- Un produit peut avoir **plusieurs codes-barres** (format 4 et format 12
  → même produit, stock unifié en unités)
- **Parenthèse notée pour le point 2 (sortie)** : entrée au paquet,
  sortie à l'unité. Le stock vit toujours en unités.

### Produit inconnu de partout (ni sheet, ni Open Food Facts)
- Le scan bloque juste le temps de taper un **nom** (obligatoire), puis la
  rafale repart. Le reste se règle au placement.

### Quantités et unités
- L'**unité de mesure appartient au produit** (banane à l'unité, farine au
  sac, viande à la livre) — définie une fois à la création
- Le compte exact se tient, même pour le vrac (Jean-Claude est méthodique).
  La mécanique de sortie facile → point 2. Cas d'usage clé : le conjoint à
  l'épicerie consulte l'app au lieu de texter « il reste combien de bananes? »

### Dates et durées de vie
- **Date d'achat = automatique** (date du scan). Personne ne tape de date.
- **Durée de vie = propriété héritée** : catégories en arbre à niveaux
  variables (Fromages → frais / en pot / vieillis), la durée se pose au bon
  étage, le produit hérite de la sous-catégorie la plus précise, sinon
  remonte. Nombre de niveaux libre par branche (principe : rien de figé).
- Sert aux alertes intelligentes : « 2 fromages périment bientôt → pense au
  macaroni au fromage » (pont avec les recettes, à creuser au point 6)
- Pas de suivi unité par unité (le vieux lait vs le neuf) : la rotation se
  fait par logique humaine. La date d'achat fait le travail.

### Le placement (côté Jean-Claude)
- Il reçoit la liste **groupée par endroit** (tout le frigo ensemble, tout
  le congélo ensemble) → une tournée par zone
- Chaque produit connu : **place(s) habituelle(s) proposées en une tape**
  + place de débordement connue (ex. : porte du frigo pleine → tablette
  inférieure) + option « Ailleurs » (entonnoir) TOUJOURS présente
- Exception vs habitude : placer ailleurs = exception par défaut (option
  discrète « ajouter comme place habituelle »)
- **Un même produit peut vivre à plusieurs endroits en même temps, chacun
  avec sa quantité** (céréales : 2 au garde-manger, 4 à la réserve)
- Statut **« en transit »** : entré mais pas encore placé — le compte est
  bon, l'emplacement pas encore confirmé. Rien ne ment.

### Le prix payé — L'IDÉE DE J-C (2026-10-01), à prévoir pour l'entrée de toute l'épicerie
*Notée pendant la réflexion sur les circulaires (`RdG-05`, « L'idée des prix de J-C »). J-C : « comme ce n'est pas
encore écrit, le scan d'une épicerie, faut prévoir. Mais on n'est pas rendu là. Mais l'idée doit être notée comme il
faut, sinon moi, ma mémoire… » — **à reprendre quand on bâtira l'entrée de toute l'épicerie (les deux sacs).***
  - **Le chemin** : je scanne (code-barres) → je choisis le magasin → si ce code-barres est relié (par le tri des
    circulaires) à un article de la circulaire **de ce magasin, en cours cette semaine** (Début ≤ aujourd'hui ≤ Fin),
    **le prix de la circulaire s'écrit tout seul** dans le prix payé (STOCK col. M).
  - **Ce que ça change** : plus besoin de taper tous les prix à l'arrivée de l'épicerie; le prix payé devient la
    **première référence** de l'app pour juger un vrai rabais.
  - **À régler quand on y sera (rien de décidé)** : le prix arrive écrit avec, en petit, « circulaire Metro », et J-C le
    corrige seulement s'il est faux (proposé par Claude, pas répondu); les prix conditionnels (« 2 pour 7 $ » → 3,50 $
    l'unité ?, « avec la carte », le prix au kilo de la viande); ce qui n'est pas en circulaire (prix vide, ou tapé);
    le magasin doit être choisi **avant** le prix (dans la fiche, magasin et prix sont à la fin : l'ordre décidé le
    2026-09-30 convient).
  - **Le juge du vrai rabais en dépend aussi** (J-C, même jour) : l'app compare le prix d'une circulaire au **dernier
    prix payé pour cet article** — le prix payé est donc la mémoire des prix de la maison. Voir `RdG-05`, « Comment
    l'app juge un vrai rabais ».

### Les nouveaux produits — séparation tête/bras
- **Au placement (mode bras)** : l'emplacement se choisit TOUT DE SUITE,
  la boîte dans les mains
- **Plus tard (mode tête)** : liste « fiches à terminer » (catégorie, durée,
  détails) — se vide tranquillement, au café. L'app vit très bien avec des
  fiches incomplètes entre-temps.

### Produits fabriqués maison
- La sauce à spag du conjoint (en quantité industrielle) : entre comme un
  produit normal par la liste sans code (12 pots → congélo)
- **Noté pour le point 6 (recettes)** : un jour, fabriquer 12 pots devrait
  faire SORTIR les ingrédients utilisés

### Entrées sans achat
- Cadeau, retour de prêt, confiture de maman : **même chemin**. L'app suit
  des objets, pas de l'argent.

### Les prix — tranché pour l'instant
- Prix-comptabilité : NON, pas l'optique du projet
- Prix-mémoire (« le spécial vaut-tu la peine? ») : idée retenue, mais
  JAMAIS de saisie manuelle (tue la rafale). La place est réservée dans la
  structure, saisie à zéro. À revoir au point 12 (spéciaux/circulaires) —
  peut-être alimenté automatiquement.

---

## 3 bis. TOUTE L'ÉPICERIE (LES DEUX SACS) — RÉFLEXION DU 2026-10-02, LE SOIR

*Remplace la section 3 là où elles diffèrent. **Zéro code : rien de bâti.** Tout ce qui se voit passera par un aperçu
d'abord (l'écran du scan, la confirmation de Terminé, Compléter).*

### Le scénario de la maison
- **Aujourd'hui**, avec le panel d'achat (Homescan) : on choisit l'épicerie, on scanne en rafale en disant si chaque
  article est en solde. Le conjoint scanne, le plus souvent. J-C range **pendant** le scan ce qui va près de la cuisine,
  **les mains pleines** (il ne touche pas à l'app). Le reste (réserve, congélo…) attend sur le comptoir : **une tournée
  à la fin**.
- **Le panel est abandonné** (J-C : « on va lâcher le panel ») : un seul scan par article, l'app prend sa place.

### Le bouton des deux sacs : deux choix
- **Entrer** (le conjoint, qui scanne) · **Compléter** (J-C, sa liste).
- **Un point rouge** sur le chemin (menu → Ajouter → Compléter) tant qu'une liste attend.

### Entrer (le scan)
1. **Choisir l'épicerie.** Chaque article scanné retient ce magasin.
2. **Scanner.** L'app cherche le code dans cet ordre :
   **Stock** (déjà entré : tout est rempli, la place proposée) → **Tri** (appris au tri : aliment, marque, saveur) →
   **les circulaires d'IGA** (Speciaux, puis l'archive Circulaires : nom, marque, format, aliment proposé — même produit,
   même code, donc IGA aide aussi un achat fait ailleurs; **à bâtir** : aujourd'hui l'app ne reçoit que les codes
   triés, `codesTri`) → **Open Food Facts** → **rien** : la quantité et OK, le reste se fera dans Compléter.
3. **Quantité 1 d'office, − et +** (ceux de Déplacer et Consommer), **OK à chaque article**. Le même code rescanné =
   la même ligne, +1.
4. **« En circulaire ? »** (J-C : oui) — seulement si l'article ressemble à une ligne de la circulaire **de cette
   épicerie, cette semaine** (nom, marque, format) : « En circulaire : 4,99 ». **Oui** (le « en solde ? » du panel) :
   - le code se colle à cette ligne de la circulaire, **avec certitude** (la boîte est dans les mains) — c'est ainsi que
     Super C et Metro, dont les circulaires n'ont aucun code, en reçoivent;
   - le **prix payé** se remplit (l'idée des prix, section 3);
   - les semaines suivantes, cet article est déjà trié : « À trier » rapetisse.

   **Non** = rien de relié, le prix reste vide. Une ligne à plusieurs produits (« 1 % ou 2 % ») : chaque code scanné s'y
   colle. Pas en circulaire : le prix reste vide (juillet : jamais de prix à taper pendant la rafale).
   - **Les prix à conditions** : « 2 pour 7 $ » = **3,50 chacun** (J-C : oui). **Le prix membre compte** (ils ont
     Scène+ et moi; la semaine du 1er octobre : 37 prix membres, 15 chez IGA, 21 chez Metro, 1 chez Super C). Les
     **points** (« 100 Scène+ PTS ») ne changent pas le prix. **La viande au kilo : en attente** — J-C envoie la photo
     d'une étiquette de viande du magasin (prévu le 2026-10-03). Le code d'un paquet emballé au magasin change d'un
     paquet à l'autre, et le prix y est souvent caché : le piège (jamais reconnu deux fois), la chance (le prix payé lu
     dans le code). À vérifier sur la vraie étiquette.
   - **Noté** : un achat scanné le lendemain du changement de circulaire (acheté mercredi, scanné jeudi) prendrait la
     mauvaise semaine. Rare.
5. **Sans code** : taper le **PLU** (l'app montre le nom officiel pour vérifier — existe déjà au scan). **Sans PLU** :
   une liste, **les habituels sans code en haut** (ce qu'on entre souvent sans code-barres, rempli tout seul par l'app,
   vide au début) et **l'entonnoir dessous** (J-C : ok). Pas un champ à taper.
6. **Terminé**, **avec une confirmation** dont le **Oui n'est jamais là où l'on touche pendant le scan** (OK, −, +) —
   J-C : « un bouton est vite accroché ». Placé sur aperçu. Un Terminé par erreur ne perd rien (on continue, ça s'ajoute
   à la même liste). **Pour une autre épicerie : Terminé, puis Entrer** → l'autre épicerie.

### Les listes : une par épicerie
- « IGA », « Super C »… **Tant que J-C ne l'a pas close, tout ce qui vient de la même épicerie s'y ajoute** (le sac
  oublié dans l'auto, une 2e visite); une fois close, la visite suivante fait une nouvelle liste.
- Exemple : Entrer → IGA → Terminé · Entrer → Super C → Terminé · un article d'IGA retrouvé : Entrer → IGA → il
  s'ajoute à la liste d'IGA. Deux listes dans Compléter, le point rouge tant que l'une attend.

### Compléter (J-C)
- La liste **groupée par meuble**, **chaque article déjà inscrit à sa place habituelle** (son endroit 1), donc compté
  dans l'Inventaire dès le scan. Un produit nouveau n'a pas de place : à lui en donner une.
- J-C **corrige** ce qui n'est pas à la bonne place, **répartit** au besoin (6 boîtes : 2 au garde-manger, 4 à la
  réserve — J-C : « prévoir »), puis **OK**.
- **Ce qui n'est pas complété demeure dans la liste**, avec le point rouge, jusqu'à ce qu'il revienne le terminer
  (« quand j'aurai trouvé un espace disponible »).
- **La séparation de juillet, confirmée** : **les places tout de suite**, en rangeant, les boîtes sous les yeux (J-C n'a
  « aucune mémoire » pour ça le soir); **l'identité d'un produit inconnu plus tard** — le soir, au lit, sans les boîtes.

### Le produit inconnu : le copier-coller de la page web (l'idée de J-C)
- **Le coffre-fort ne voit rien** des sites de Super C et de Metro : un gardien anti-robot (Cloudflare) refuse la
  recherche **et** la page directe à une simple requête (vérifié le 2026-10-02). On ne le contourne pas. **Un humain,
  dans son navigateur, passe.**
- **Vérifié le 2026-10-02** : la page d'un produit s'ouvre **directement avec son code** —
  `superc.ca/allees/x/p/064420010117` → « Lait 2 % Finement Filtré Natrel »;
  `metro.ca/epicerie-en-ligne/allees/x/p/059749961967` → « Fromage Gouda Selection » — et elle montre « Numéro de
  produit : … » = **le vrai code-barres** (Open Food Facts le confirme : Lait Natrel). Leur recherche, elle, ne trouve
  rien avec un code.
- **Le chemin** : sur la ligne d'un produit inconnu, un bouton **ouvre sa page** — **Super C d'abord, même pour un achat
  fait ailleurs** (un produit de grande marque a le même code partout, et les rayons de Super C sont ses catégories;
  sauf les marques maison d'IGA, Compliments); pas de page = une recherche du code sur le web. J-C **sélectionne le
  texte de la page** (du chemin du rayon jusqu'au numéro de produit), le **copie**, revient dans l'app et le **colle
  dans un champ** : l'app propose tout, il confirme.
- **Essayé par J-C** sur deux pages (Tarte à la citrouille Irrésistible 900 g; Sucre granulé spécial fin Redpath 2 kg).
  Le texte se lit bien : **le chemin du rayon** (« Garde-manger → Ingrédients pour cuisson et préparation → … » = **mot
  pour mot sa catégorie et sa sous-catégorie**, taillées sur Super C), **la marque** (en majuscules, 1re ligne du bloc),
  **le nom**, **le format** (« 2 kg »), **le prix** (« Prix régulier 2,99 $ · 2,49 $ · En spécial jusqu'au 7 octobre »),
  **le numéro de produit** (vérifié avec le code scanné). **Reste à J-C : confirmer l'aliment** (proposé s'il en existe
  un qui ressemble, sinon l'entonnoir). Une catégorie renommée depuis : pas trouvée → l'entonnoir.
- **Le prix de la page = le prix payé** (J-C : « je vais faire ça dans la semaine, avant le mercredi »), deux garde-fous :
  le prix de la circulaire donné au scan reste (la page ne l'écrase pas); **si un jeudi est passé** entre l'achat et le
  collage, le prix de la page n'est pas pris (vide).
- Sur un autre site, le collage marche moins bien : la marque et le format oui, le nom pas toujours, la catégorie
  presque jamais.
- Écartés en chemin : rescanner la boîte en main (J-C complète le soir, sans les boîtes); une photo prise au scan; une
  capture d'écran lue par Google (possible, mais une attente et un service à activer — le copier-coller fait mieux).
- **IGA** : son site renvoie à Voilà (son épicerie en ligne), qui demande une adresse avant de montrer un produit — pas
  vérifié plus loin. IGA en a moins besoin : ses codes viennent de sa circulaire.
- **L'horizon** (J-C) : « une fois le code-barres associé, ça va rouler presque tout seul dans X mois » — une maison a
  quelques centaines de produits, chacun s'apprend une fois. Le travail de J-C : trouver sur le web.

### Les codes de Super C et de Metro — le tour complet (2026-10-02)
1. **Flipp** : non. Leurs « codes du magasin » (FL873-132) sont des cases de la circulaire (feuille de J-C de la
   semaine du 1er octobre : IGA 411 codes-barres, Super C et Metro 0).
2. **Leur site** : fermé au robot, ouvert à J-C (le copier-coller, plus haut).
3. **IGA** : même produit, même code (« Serait-ce celui-ci ? » au tri).
4. **Les marques maison** Selection et Irrésistible (Metro et Super C, même compagnie) : un code trouvé une fois vaut
   dans les deux.
5. **Open Food Facts par le nom** : marche (déjà dans le tri), environ 10 recherches par minute.
6. **Leurs propres scans** : le plus sûr — « En circulaire ? » au scan (plus haut).
7. D'autres bases de codes sur le web : pas vérifiées.
- **Précisé par J-C** : le code-barres est le pivot; le Oui / Peut-être / Jamais du tri sert à éviter de relier ce qui
  ne l'intéresse pas.
- **À savoir** : chaque article des trois épiceries a une **photo** dans Flipp (colonne « Photo » de sa feuille).

### L'écran du scan — aperçus vus et tranchés (2026-10-02, le soir)
*Celui qui scanne : l'un ou l'autre (J-C : « pas juste le conjoint qui a la belle tâche »).*
- **En haut**, le nom de l'épicerie en titre (« IGA »). La caméra, et **« Sans code » juste dessous** (l'autre porte
  d'entrée, loin du OK).
- **La carte de l'article scanné** : sa petite photo, son nom, marque · format; la quantité (1, − +); **OK**.
- **La circulaire — chez Super C et Metro seulement** (chez IGA, le code-barres de la circulaire suffit : **pas de
  question**, le prix se remplit tout seul) : sous le produit scanné, « Dans la circulaire de Super C » et **la ligne au
  complet** (sa photo de Flipp, son nom, son format, son prix et le régulier) — J-C : « sinon je peux pas répondre ».
  La question, dans ses mots : **« L'associer à ce produit ? » Oui / Non, sans OK : répondre accepte l'article**
  (choix C). Rejetés : A (une case à cocher, puis OK), B (Oui / Non, puis OK), et la première version qui ne montrait
  que le prix.
- **Dessous, « Déjà scanné (13) »** : le plus récent en haut, chacun sa quantité.
- **Terminé au bas** (choix E), après la liste, juste avant Retour; touché, il devient la question « Terminer IGA ?
  (14 articles) » Oui / Non, à sa place. Rejeté : D (en haut à droite).
- **Retour** sort sans terminer : la liste reste ouverte.
- **Rien trouvé** : « Produit inconnu » et son code; la quantité et OK, rien à taper.
- **Sans code** touché : la caméra laisse sa place au **PLU** (le nom officiel paraît dessous pour vérifier), aux
  **habituels sans code**, puis à **l'entonnoir**; « Revenir au scan ». Un PLU tapé ou un habituel touché ouvre la carte
  de l'article, comme au scan (J-C : « oui »). **Les habituels : une barre FERMÉE** (J-C : « Non. Fermé. » — proposé : ouverte et
  limitée à 8), les plus fréquents en haut.
- À ajouter au CSS en bâtissant : la ligne d'article posée dans une carte (sans trait ni retrait); les boutons Oui / Non
  d'une question qui ne se tassent pas quand la question est longue.

### ✅ ENTRER — BÂTI le 2026-10-02, le soir (J-C : « que tout ça soit codé et testé un peu… avant que j'intervienne pour la phase
Compléter ») — ⚠️ `api.gs` à coller, puis à essayer en ligne
- **Le bouton des deux sacs** mène tout droit au **choix de l'épicerie** (une barre par magasin, comme la page Magasins; sous la
  barre d'une liste pas close : « En cours (12 articles) » ou « À compléter (12 articles) »). Le choix **Entrer / Compléter** viendra
  avec Compléter : d'ici là, il n'y a qu'Entrer.
- **L'épicerie touchée** : sa liste pas close (reprise), sinon une neuve (onglet Epiceries, instantanée); **sa circulaire de la
  semaine est lue une fois** (un appel, le chariot; gardée pour la journée).
- **L'écran du scan** : tel que les aperçus. La caméra reste ouverte entre deux articles; après OK, le même code encore sous la
  caméra ne compte pas pendant 2,5 s (sinon un +1 de trop).
- **Le code** : Stock → Tri (instantané) → un appel au coffre-fort (`identifier` : la semaine d'IGA, puis son archive, puis Open
  Food Facts) → rien. Un coffre-fort pas encore à jour : Open Food Facts directement.
- **Chaque article entre tout de suite** dans STOCK (instantané, par la file des gestes : action `entrer`, l'ID donné par l'app,
  rejouable), à **sa place habituelle** (son endroit 1), **l'Escale** s'il n'en a pas, avec l'épicerie (col. N), qui, le magasin, et
  **le prix payé** quand la circulaire le donne. Il quitte la liste d'achats. Son code est reconnu tout de suite au scan suivant.
- **Un produit neuf** (trouvé dans une circulaire d'IGA ou dans Open Food Facts) entre **sous son propre nom, sans catégorie**
  (« Sucre granulé Redpath »), sa marque créée au besoin : c'est **Compléter** qui le reliera à ton aliment (d'ici là : Gérer les
  bases → Aliments, le crayon réunit). Un nom identique à un aliment existant = cet aliment. **Inconnu partout** : un aliment
  « Inconnu 0597… » (le code), à compléter. *Choix de Claude : ne pas deviner l'aliment pendant la rafale (« Pommes de terre »
  n'est pas « Pomme »).*
- **La circulaire** : le même code dans la circulaire de cette épicerie (IGA), ou une ligne déjà reliée à cet aliment (même marque,
  même format : une ligne « choix varié » couvre ses saveurs) → **« En circulaire : 4,99 », OK, pas de question**. Sinon la ligne du
  même aliment (ou, pour un produit neuf, ses mots), une marque et un format qui ne disent pas autre chose → **la ligne au complet**
  et « L'associer à ce produit ? » **Oui / Non** (sans OK). Oui : onglet Tri (Oui, l'aliment, le code scanné : les semaines
  suivantes, l'article est déjà trié, le point rouge baisse) + le prix payé. Non : rien, et elle n'est plus proposée pour ce produit
  pendant cette épicerie. **Le prix** : « 2/ » = le prix divisé; au poids (« /lb », « le 100 g ») : vide (on attend l'étiquette).
- **Sans code** : le PLU (le nom officiel dessous; l'aliment à qui ce PLU a déjà servi, sinon celui qui porte le même nom —
  « Pommes Fuji » → Pomme —, sinon un aliment neuf au nom officiel), **les habituels dans une barre fermée** (12 au plus, le plus
  fréquent en haut), l'entonnoir (« Nouveau produit… » au bout). Après OK, on **reste** dans Sans code (les fruits viennent
  ensemble); « Revenir au scan » ramène la caméra.
- **Un « Annuler »** sous OK (comme la fiche) : un mauvais scan n'entre pas. *Ajouté par Claude : sinon un mauvais scan ne
  pouvait pas être défait.*
- **Terminé** (au bas) → « Terminer Super C ? (6 articles) » Oui / Non → la liste passe à **T** et on revient au choix de
  l'épicerie (une autre épicerie : Terminé, puis Entrer). **Retour** : le choix de l'épicerie, la liste reste ouverte.
- **`api.gs`** (à coller) : `entrerArticle` (l'ID de l'app, col. N `Epicerie`, le code en texte); l'onglet **Epiceries** créé au
  premier besoin (`ajouter` / `modifier` créent un onglet connu); `references` renvoie `epiceries`; deux lectures neuves,
  **`identifier`** et **`circulaireMagasin`**; Speciaux et Circulaires gagnent la col. V **Photo** (Flipp) — vide jusqu'à la prochaine
  lecture (jeudi), ou plus tôt si J-C relance `lireSpeciaux`.
- Essais à blanc : l'app dans un faux navigateur (44 vérifications : Super C avec la question, le même produit relié ensuite sans
  question, un produit neuf d'IGA, un inconnu annulé, Sans code — habituels, PLU, entonnoir —, « 2 pour 9 $ » = 4,50, Terminé, la
  même liste reprise, IGA sans question); `api.gs` sur un faux Sheet (17 vérifications); les essais d'avant (PLU, liste d'achats,
  tri) passent encore.

### ✅ COMPLÉTER — BÂTI le 2026-10-04 (J-C : « Je mettrais ce bouton dans le bouton + »; aperçu : icône D, la feuille cochée; la page :
« je vais voir à l'usage »)
- **Son bouton est dans le +** (le 3e, à côté des deux sacs) — remplace « le bouton des deux sacs a deux choix, Entrer / Compléter » :
  les deux sacs mènent tout droit à Entrer. **Le point rouge** sur le + et sur Compléter tant qu'une épicerie a un article à compléter.
- Une seule épicerie à compléter : elle s'ouvre tout de suite; plusieurs : une barre par épicerie (« 4 octobre (12 articles) »).
- **La page** : groupée par meuble, comme l'Inventaire par meuble — **« À placer »** d'abord (ouvert : ce qui n'a pas de place),
  puis les meubles dans leur ordre, fermés, leurs espaces en bandeaux. Un produit sans catégorie dit « (sans catégorie) ».
- **Les deux flèches** d'un article : la carte de l'Escale (pièce, meuble, espace, quantité) — placer, corriger, **répartir** (une
  partie : le reste reste où il est). Instantané (`deplacerLot`). La place choisie devient connue : la prochaine fois, il y va tout seul.
- **OK** : ce qui est **placé et a sa catégorie** quitte la liste (STOCK col. O = le jour); le reste attend, avec le point rouge.
  Plus rien : la liste est **close** (C), retour au +.
- **Pas encore** : donner l'identité d'un produit neuf ici (la catégorie, le copier-coller de la page Super C) — **aperçu d'abord**.
  D'ici là : Gérer les bases → Aliments → « Aliments sans catégorie ».
- Essai dans le faux navigateur : 21 vérifications (le point rouge, « Rien à compléter », la page, OK partiel, répartir, la liste
  close); les essais d'avant passent encore.

### Parenthèse notée (pas creusée)
- Le même copier-coller pourrait servir **au tri** : un article de la circulaire de Super C ou de Metro sans code (on a
  le nom, il manque le code — l'inverse de Compléter).

### En attente
- La photo de l'étiquette de viande (J-C, 2026-10-03).

---

## 4. PARENTHÈSES OUVERTES (à ne pas perdre)

- **Point 2 (sortie)** : sortie à l'unité des multi-paquets; mécanique de
  sortie ultra-rapide pour tenir le compte exact (bananes); raison de
  sortie oui/non selon le cas
- **Point 6 (recettes)** : alerte péremption → suggestion de recette;
  fabrication maison → sortie des ingrédients
- **Point 12 (spéciaux)** : prix automatiques par circulaires
- **Structure (plus tard, quand les actions seront finies)** : un produit a
  plusieurs emplacements avec quantités séparées; plusieurs codes-barres
  avec multiplicateurs; ID date/heure généré où? (question jamais tranchée)

---

## 5. PROCHAINE SESSION

Jean-Claude décante. Le point 1 est solide mais pas déclaré fini — les
autres points vont l'éclairer. C'est LUI qui choisit le prochain sujet.
Ne pas pousser. Poser une question, écouter, creuser.
