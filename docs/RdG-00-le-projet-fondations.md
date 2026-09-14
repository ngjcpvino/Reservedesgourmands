# La Réserve des Gourmands — Fondations du projet

## 1. Le concept

1.1. Une app qui donne, en tout temps et n'importe où, une photo fidèle de
tout ce qui est possédé à la maison — peu importe le type d'item (nourriture,
quincaillerie, passe-temps, etc.) — pour ne plus jamais se demander "en ai-je
déjà ?" en étant debout dans une allée de magasin.

1.2. Tout item suit la même dynamique, peu importe le secteur : il **entre**
(achat), il a une **quantité**, il est **rangé** quelque part, il **sort**
(consommation/usage), il peut **manquer** (déclenche le rachat).

1.3. Un seul moteur, une seule base de données pour tous les secteurs — pas
une app par secteur. La séparation (Épicerie, Quincaillerie, Passe-temps...)
n'existe qu'à l'affichage, jamais dans la structure des données.

## 2. Principe — rien de fixe

2.1. Secteurs, Catégories, Sous-catégories, Lieux, Espaces, Magasins : ce
sont toutes des listes gérées par l'utilisateur dans l'app, jamais codées
en dur.

2.2. Un futur secteur, une future catégorie, un futur lieu doivent pouvoir
être ajoutés par l'utilisateur, sans jamais retoucher au code.

## 3. Principe — identifiants stables

3.1. Chaque ligne de chaque onglet (Produits, Recettes, Ingredients, Listes,
Emplacements, Categories, Magasins, Utilisateurs) a un identifiant unique
basé sur la date/heure de création — jamais un simple numéro croissant.

3.2. Les liens entre onglets se font toujours par cet identifiant, jamais
par le nom — pour qu'un renommage n'importe où ne brise jamais rien.

## 4. Principe — colonnes par position

4.1. Chaque onglet a un ordre de colonnes fixe, documenté une seule fois,
dans un seul document de référence.

4.2. Le code lit et écrit TOUJOURS par position exacte (colonne A, B, C...),
JAMAIS en cherchant un nom d'en-tête. Aucune déduction, aucune traduction
improvisée.

4.3. Toute nouvelle donnée s'ajoute toujours au bout de l'onglet — jamais
insérée au milieu.

4.4. Ce principe s'applique à TOUS les onglets sans exception.

## 5. Sécurité

5.1. La clé d'API Google et l'identifiant du Sheet ne doivent jamais
apparaître visibles dans le code public (GitHub).

5.2. Un Google Apps Script sert de coffre-fort intermédiaire : lui seul
connaît la clé et l'ID du Sheet ; l'app publique ne fait que lui parler.

---

# Style et ligne visuelle

## 6. Principe central — tout découle du root

6.1. Aucune valeur (couleur, taille, espacement, coin arrondi, police)
n'est jamais écrite en dur — nulle part : ni dans le HTML, ni dans le JS,
ni même à l'intérieur d'un composant dans la feuille de style. Chaque
composant pointe toujours vers une variable du root.

6.2. Le root est la seule source de vérité. Changer une valeur = ça se
répercute automatiquement partout.

## 7. Principe — un composant est un composant

7.1. Regrouper par type d'élément d'abord (tous les boutons ensemble, tout
le texte ensemble), jamais par page ou par rôle.

7.2. Chaque type a une base, puis des variantes qui se combinent librement
par-dessus — jamais une nouvelle classe séparée inventée pour chaque cas.

7.3. Exemple — Bouton (la base) :
   - Forme : pleine largeur / ajusté au texte
   - Rôle : danger / neutre / confirmation
   - Taille : gros / moyen / petit

7.4. Exemple — Texte (la base) : H1, H2, H3, H4... — le texte est du texte,
les niveaux sont des variantes.

7.5. Avant de créer un nouveau composant, toujours vérifier si un composant
existant (base + variante) peut déjà couvrir le besoin.

## 8. Principe — nommage en français

8.1. Tous les noms de classes et de composants sont en français, cohérents
avec le reste du projet (accordéon, champ-texte, bouton).

8.2. Jamais de mélange anglais/français dans les noms de style.

## 9. Principe — ligne artistique par secteur

9.1. Chaque secteur (Épicerie, Quincaillerie, Passe-temps, et d'autres à
venir) peut avoir sa propre ligne artistique.

9.2. Ce qui peut varier : couleurs, formes, polices, et dans une certaine
mesure la mise en page — évalué au cas par cas (pour/contre).

9.3. Ce qui ne varie jamais : les types de composants et leur comportement
(un bouton reste un bouton, un accordéon s'ouvre de la même façon partout).

## 10. Méthode de travail — partir large, épurer ensuite

10.1. Commencer par un catalogue assez complet de tous les styles
envisageables pour un concept donné, puis retirer ce qui ne sert pas.

## 11. État actuel à valider

11.1. Une feuille de style (root) existe déjà dans le projet RdG, mais son
contenu exact n'a pas été révisé depuis plusieurs mois — à revoir avant de
bâtir dessus.

11.2. L'ancienne feuille avait déjà des variables pour couleurs/tailles/
espacements, mais les boutons étaient restés dispersés en plusieurs noms
distincts (bouton-principal, bouton-confirmer, bouton-secondaire) plutôt
qu'unifiés en une base + variantes.

## 12. Principe — logique en entonnoir

12.1. Toute navigation et toute gestion de données suit une logique
d'entonnoir : un premier choix réduit ce qui reste visible au choix
suivant, jusqu'à arriver à l'action précise.

12.2. Exemple concret : choisir un Secteur (Quincaillerie) filtre les
Lieux qui s'y rapportent ; choisir un Lieu (Rangement A) filtre les
Espaces qui s'y trouvent ; l'action (ajouter/modifier) se fait
directement à ce niveau précis, sans jamais parcourir une liste
mélangée de tous les secteurs ou lieux en même temps.

12.3. Ce principe s'applique autant à la navigation dans l'app (menu,
scanner) qu'à la gestion des listes de base (Secteurs, Catégories,
Emplacements, Magasins).

## 13. Page de gestion des listes de base

13.1. Une (ou plusieurs) page dédiée à gérer les listes de base
(Secteurs, Catégories, Sous-catégories, Emplacements, Espaces,
Magasins) — séparée de la gestion des produits eux-mêmes.

13.2. Actions permises : ajouter, modifier (renommer).

13.3. Aucune suppression réelle pour l'instant — remplacée par
désactiver/réactiver. Un élément désactivé disparaît des listes actives
mais n'est jamais effacé, pour ne jamais briser un lien existant avec
un produit qui s'y rattache encore. Une vraie suppression pourrait être
envisagée plus tard, mais n'est pas un objectif actuel.

13.4. Présentation : organisée en sections et sous-sections (jamais tout
sur un seul écran mélangé), suivant la logique d'entonnoir (12).

13.5. Design aéré — beaucoup d'espace, regroupements clairs, pas de
surcharge visuelle — cohérent avec l'usage généreux des variables
d'espacement du root (--espace-xs/s/m/l/xl).

## 14. Décision — abandon de l'ancien Sheet

14.1. L'ancien Sheet RdG n'est plus utilisé activement — pas besoin de
maintenir une transition en parallèle pendant la reconstruction.

14.2. Seules les données de l'ancien Sheet qui valent encore la peine
seront reprises dans le nouveau, sans obligation de tout transférer.

## 15. Ordre de construction du projet

15.1. Finir la réflexion (grands parcours, objets de base, structure
exacte des colonnes) avant de créer quoi que ce soit.

15.2. Construire le nouveau Sheet au complet.

15.3. Mettre en place la sécurité (Google Apps Script) avant de
reconnecter l'app aux données.

15.4. Coder un premier parcours complet avec le secteur Épicerie avant
d'élargir aux autres secteurs (Quincaillerie, Passe-temps).

15.5. Garder le look visuel actuel de RdG comme base pour la suite.
