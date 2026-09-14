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
