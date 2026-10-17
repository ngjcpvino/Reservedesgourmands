# RdG-12 — Au scan des deux sacs : la carte à la place de la caméra, et le produit pas reconnu (2026-10-17)

> Les points 78 et 79 de la liste numérotée de `CLAUDE.md`. J-C, au retour de l'épicerie, sur l'iPhone (2026-10-16 au soir) :
> « les questions doivent prendre la place de la caméra »; « si le produit n'est pas reconnu, j'ai juste un inconnu avec des
> chiffres. Quand je fais la suite après, je ne sais pas c'est quoi ». **Réflexion finie le 2026-10-17** (section 2, aperçu vu et
> tranché : B). **L'app : section 3. Le coffre-fort : section 4, À ÉCRIRE À L'ORDI** (la session du nuage ne voit pas `gas/`).

## 1. Ce qu'on a vu

- Un code lu, la carte se posait **sous** la caméra : l'image restait vivante (alors que rien n'est lu tant qu'on n'a pas répondu),
  les boutons « Taper le code » (bleu) et « Sans code » (orange) restaient là.
- Le logo d'Open Food Facts sur la carte : J-C n'a pas le temps de faire des photos au moment des scans.
- Un code que personne ne connaît (ni le Stock, ni le tri, ni les circulaires d'IGA, ni Open Food Facts) entrait sous le nom
  « Inconnu 0059749940146 » : impossible ensuite, dans Compléter, de savoir quel produit c'était.

## 2. Décidé (J-C, 2026-10-16 au soir et 2026-10-17)

1. **Le code lu, la carte prend la place de la caméra.** Les deux boutons (bleu, orange) ne sont pas là tant que la carte attend sa
   réponse; la caméra revient pour l'article suivant.
2. **Pas de logo d'Open Food Facts sur la carte des deux sacs.** Le produit qui lui manque va tout seul sur la liste « Pour Open Food
   Facts » (comme avant quand on ne touchait pas le logo); les photos se font plus tard, depuis la liste, Consommer ou Ouvrir.
3. **Un produit pas reconnu s'appelle par son code, sans « Inconnu » devant** (J-C : « ça fuck le mot inconnu dans ça »).
4. **Un bouton pour photographier l'emballage, seulement quand le produit n'est pas reconnu.** (L'image de la caméra au moment du
   code : non — « ce n'est que le code-barres, pas utile ».)
5. **Cette photo sert aussi de photo du devant pour Open Food Facts** (J-C : « Oui »).
6. **Elle se garde dans son Google Drive, privée** (J-C : « Oui », contre : partir tout de suite chez Open Food Facts, publique) —
   par le coffre-fort. **Elle ne part à Open Food Facts que par l'écran des photos et son Envoyer** (rien ne part tout seul,
   `RdG-10`, décision 7).
7. **On la revoit à trois endroits** (J-C : « Oui ») : la liste du jour sous la caméra, à côté du code; Compléter, à côté du code;
   l'écran Open Food Facts, déjà posée comme photo du devant.
8. **Le bouton = B** (aperçu à 375, parmi A l'appareil photo en pastille au bout de la ligne · B une case photo en tête de la
   carte · C un 3e bouton à côté du crochet et du X) : **une case de la forme de la caméra, à sa place** (la fenêtre ne change pas
   de forme), pointillée, l'appareil photo dessiné au centre; touchée, l'appareil photo de l'iPhone s'ouvre; la photo prise remplit
   la case (le petit appareil photo dans le coin : la toucher la reprend).

**Choisi par Claude** (à revoir à l'usage) : la photo réduite sur l'appareil comme celles d'Open Food Facts (1600 px, JPEG 0,85 :
assez fine pour leur robot); une par code (la reprendre la remplace); gardée sur l'appareil qui l'a prise tout de suite, envoyée au
coffre-fort en arrière-plan; l'autre appareil la demande au coffre-fort quand il en a besoin, puis la garde. **Le sac seul n'a pas la
case** : le produit y est nommé et classé sur-le-champ (la photo ne sert pas à le retrouver), et le logo d'Open Food Facts y prend
déjà la photo du devant.

## 3. Ce qui est bâti (l'app, 2026-10-17)

Voir « ⭐ LA CARTE À LA PLACE DE LA CAMÉRA, ET LE PRODUIT PAS RECONNU » dans les Conventions de `CLAUDE.md`.

## 4. Pour le coffre-fort (`api.gs`, à l'ordi)

**L'onglet `Photos`** — connu d'`ajouter`/`modifier` comme les autres (`ENTETES.Photos`), créé tout seul avec ses en-têtes par le
premier `garderPhoto`, **chaque cellule en texte** (`TOUT_TEXTE`, comme `OFF` et `Erreurs` : un code garde son 0 du début) :

| Col | Nom | Sens |
|-----|-----|------|
| A | Code | le code scanné, tel que l'app l'envoie (des chiffres, 4 à 14), en texte — **une ligne par code** |
| B | Fichier | l'ID du fichier dans Google Drive |
| C | Date | le moment de l'envoi, « AAAA-MM-JJ HH:MM », heure du Québec (`FUSEAU`) |
| D | Qui | Outils → Qui entre les articles |

**Le dossier** : la Propriété du script **`DOSSIER_PHOTOS`** (l'ID d'un dossier). Absente, ou le dossier à la corbeille / introuvable →
créer à la racine du Drive de J-C un dossier **« Réserve des Gourmands — photos »**, noter son ID dans la Propriété. **Jamais partagé**
(privé, comme tout ce que le script crée). Une fonction **`dossierPhotos()`** le rend (sert aux deux actions).

**L'action `garderPhoto`** (une écriture) :

```
{ action: 'garderPhoto', code, image: '<JPEG en base64, sans « data:…, »>', qui }
→ { ok: true, fichier: '<ID Drive>' }   ou   { ok: false, erreur: '<court>', definitif?: true }
```

1. `code` : les chiffres seuls (enlever espaces et tirets), 4 à 14 → sinon `{ ok: false, erreur: 'code', definitif: true }`.
   `image` vide, ou plus de 6 000 000 caractères → `{ ok: false, erreur: 'image', definitif: true }`.
2. **Le fichier, hors verrou** (Drive est lent) : `dossierPhotos().createFile(Utilities.newBlob(Utilities.base64Decode(image),
   'image/jpeg', code + '.jpg'))`.
3. **La ligne, sous verrou** (`sousVerrou()`, comme `envoyerOFF`) : la ligne de ce code dans `Photos` (col. A, comparée en texte) —
   absente : l'ajouter `[code, idNeuf, maintenant, qui]`; présente : la réécrire avec le nouvel ID, et **mettre l'ancien fichier à la
   corbeille** (`DriveApp.getFileById(ancien).setTrashed(true)`, dans un try : déjà parti = rien).
4. **Rejouable** : un 2e envoi (après une coupure) refait un fichier et jette le précédent — jamais deux lignes pour un code, jamais
   deux fichiers vivants. Rendre `{ ok: true, fichier: idNeuf }`.
5. Dispatché **avant le verrou de `doPost`** (comme `envoyerOFF` : l'écriture du fichier dans Drive peut prendre quelques secondes, le
   Sheet n'est verrouillé que pour la ligne). Un envoi pèse 300 à 600 Ko (une photo de 1600 px en base64) : `doPost` le reçoit.

**L'action `photo`** (une lecture, sans verrou) :

```
{ action: 'photo', code }
→ { ok: true, image: '<base64>', fichier: '<ID>' }   ·   pas de photo : { ok: true, image: '' }
```

La ligne du code dans `Photos` → `DriveApp.getFileById(id).getBlob().getBytes()` → `Utilities.base64Encode(…)`. Le fichier disparu
(à la corbeille, effacé à la main) : `{ ok: true, image: '' }`.

**`references` renvoie `photos`** : `{ "<code>": "<ID du fichier>" }`, tiré de l'onglet `Photos` (col. A et B, en texte — `getDisplayValues`
ou `TOUT_TEXTE` : le 0 du début reste). Pas d'onglet : `{}`. Compact (quelques dizaines de codes). **Un seul aller-retour de plus au
Sheet** (deux colonnes).

**La permission Drive** : `DriveApp` demande une permission que le script n'a pas encore. Le manifeste n'a pas d'`oauthScopes`
(détection automatique) : ne pas en ajouter. **Après le collage, J-C lance une fois depuis l'éditeur une petite fonction
`autoriserPhotos()`** (elle appelle `dossierPhotos()` et écrit dans le journal l'ID du dossier) : Google demande la permission
« Voir, modifier, créer et supprimer vos fichiers Google Drive », J-C accepte; le dossier paraît dans son Drive. **Puis Déployer →
Gérer les déploiements → ✏️ → Nouvelle version** (la même URL), comme toujours.

**Essayer à blanc** (un faux Sheet, un faux DriveApp) : un 1er envoi (le dossier créé, une ligne, un fichier); le même code renvoyé
(une seule ligne, l'ancien fichier à la corbeille); un code en « 0… » (gardé tel quel); `photo` d'un code connu, d'un code sans photo,
d'un fichier disparu; `references.photos` avec et sans onglet; un code ou une image refusés.

**L'app attend déjà ces trois choses** (bâtie le 2026-10-17) : tant que le coffre-fort répond « action inconnue », la photo reste sur
l'appareil qui l'a prise, dans sa file (`rdg_photos_attente`), et repart à chaque ouverture de l'app; `references.photos` absent = rien
à aller chercher.

Une fois écrit et essayé : l'inscrire ici et dans `CLAUDE.md` (« écrit, à coller »); J-C colle → `autoriserPhotos()` → **Nouvelle
version** (même URL).

## 5. À voir à l'usage

- Reprendre la photo après le crochet (une fois l'article entré) : pas prévu — elle se reprend sur l'écran Open Food Facts (le devant).
- Les photos restent dans le Drive (et sur l'appareil) même une fois le produit complété : quelques centaines de Ko chacune.
