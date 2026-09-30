/* ============================================================
   ENTRÉE D'UN ARTICLE — reserve.html. Utilise Coffre (coffre.js).
   Flux : catégorie → sous-catégorie → produit (choisir ou créer)
          → marque · format → 1 à N endroits (pièce → meuble → espace + qté).
   Chargement robuste : un appel à la fois (VPN-friendly), nouvel essai,
   et mémorisation locale pour un accès instantané ensuite.
============================================================ */
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));
const montrer = (id, ok) => { $(id).hidden = !ok; };

var RAYONS = [], SOUSCATS = {}, MEUBLES = [], ESPACES = {}, PRODUITS = [], VARIANTES = {}, PIECES = [];
var codeScan = '';          // code-barres de l'entrée en cours (le champ #codebarres fait foi)
var CODES = {};             // { codeBarres: produitId } — reconnaître un produit déjà à nous
var produitCourant = null;  // id du produit reconnu (existant) ; null = nouveau produit
var modeManuel = false;     // entrée À LA MAIN : entonnoir catégorie -> sous-catégorie -> produit
var LISTES = { Magasins: [], Marques: [], Saveurs: [] };   // les listes gérées : [{ id, nom }], actifs seulement
var NOMS_LISTES = {};        // { id: nom } des trois listes : STOCK retient l'ID, on lit le nom
var LISTES_NEUVES = [];      // noms ajoutés à la fiche, pas encore au coffre-fort : partent avec la prochaine entrée
const UNITES_BASE = ['unité', 'g', 'kg', 'ml', 'L'];   // le départ; toute unité déjà utilisée s'y ajoute
const QUI = 'rdg_qui';      // qui se sert de l'app sur CET appareil
var opCourant = null;                                   // jeton anti-reclic de l'article en cours
var SECTEUR_ID = '';                                    // secteur de cette app (Épicerie), déduit des données
const CACHE = 'rdg_ref_v2';
const ATTENTE = 'rdg_ordre_attente';   // ordres pas encore confirmés par le coffre-fort (survit à une fermeture)
const ATTENTE_ALIMENTS = 'rdg_ordre_aliments_attente';   // idem, l'ordre des endroits d'un aliment
var ordreModifie = {};                 // groupes déplacés à l'écran, pas encore envoyés : 'p' · 'm:<pièce>' · 'e:<meuble>'
var envoiOrdre = false;                // un envoi d'ordre est en route

/* LA PALETTE du root, numérotée par famille, modifiable dans Outils → Couleurs : [variable, nom, à quoi elle sert].
   Les teintes dérivées (menu, ombres…) en découlent dans le CSS : elles suivent toutes seules.
   Les pièces et meubles qui l'utilisent s'ajoutent à l'usage, à l'écran. */
const COULEURS_SITE = [
  ['couleur-101', 'Couleur 101', 'fond du cadre, champs, texte des boutons de couleur'],
  ['couleur-102', 'Couleur 102', 'autour du cadre, sur les grands écrans'],
  ['couleur-103', 'Couleur 103', ''],
  ['couleur-104', 'Couleur 104', ''],
  ['couleur-105', 'Couleur 105', 'icônes, texte des boutons bruns et du menu, bouteilles'],
  ['couleur-106', 'Couleur 106', ''],
  ['couleur-201', 'Couleur 201', 'étiquettes de quantité'],
  ['couleur-202', 'Couleur 202', ''],
  ['couleur-203', 'Couleur 203', ''],
  ['couleur-204', 'Couleur 204', ''],
  ['couleur-205', 'Couleur 205', 'bord des champs, trait sous les titres'],
  ['couleur-206', 'Couleur 206', ''],
  ['couleur-301', 'Couleur 301', ''],
  ['couleur-302', 'Couleur 302', 'petits intitulés, texte pâle'],
  ['couleur-303', 'Couleur 303', 'suite n° 7'],
  ['couleur-304', 'Couleur 304', 'suite n° 5'],
  ['couleur-305', 'Couleur 305', "boutons bruns, têtes d'accordéon, burger, loupe"],
  ['couleur-306', 'Couleur 306', 'texte, menu, ombres'],
  ['couleur-401', 'Couleur 401', 'suite n° 4'],
  ['couleur-402', 'Couleur 402', 'erreurs'],
  ['couleur-403', 'Couleur 403', 'suite n° 9'],
  ['couleur-404', 'Couleur 404', ''],
  ['couleur-501', 'Couleur 501', ''],
  ['couleur-502', 'Couleur 502', ''],
  ['couleur-503', 'Couleur 503', ''],
  ['couleur-504', 'Couleur 504', ''],
  ['couleur-505', 'Couleur 505', 'suite n° 1 (grilles, Listes)'],
  ['couleur-506', 'Couleur 506', ''],
  ['couleur-507', 'Couleur 507', ''],
  ['couleur-601', 'Couleur 601', ''],
  ['couleur-602', 'Couleur 602', ''],
  ['couleur-603', 'Couleur 603', ''],
  ['couleur-604', 'Couleur 604', 'boutons Retour'],
  ['couleur-605', 'Couleur 605', ''],
  ['couleur-606', 'Couleur 606', ''],
  ['couleur-607', 'Couleur 607', ''],
  ['couleur-701', 'Couleur 701', ''],
  ['couleur-702', 'Couleur 702', 'suite n° 3'],
  ['couleur-703', 'Couleur 703', 'boutons verts, succès, suite n° 8'],
  ['couleur-704', 'Couleur 704', 'suite n° 10'],
  ['couleur-801', 'Couleur 801', ''],
  ['couleur-802', 'Couleur 802', 'suite n° 6'],
  ['couleur-803', 'Couleur 803', 'suite n° 2'],
  ['couleur-901', 'Couleur 901', ''],
  ['couleur-902', 'Couleur 902', ''],
  ['couleur-903', 'Couleur 903', 'bas foncé des boutons, fond du scan']
];
const FAMILLES = [['1', 'Blancs et crèmes'], ['2', 'Beiges et sables'], ['3', 'Bruns'], ['4', 'Rouges'], ['5', 'Oranges'], ['6', 'Jaunes et ors'], ['7', 'Verts'], ['8', 'Bleus'], ['9', 'Gris et noirs']];   // le chiffre des centaines
const ATTENTE_COULEURS = 'rdg_couleurs_attente';   // couleurs pas encore confirmées par le coffre-fort
var STOCK = [];                                     // lignes de STOCK : ce qu'on possède, pour la liste « Inventaire »
var COULEURS = [];                                  // lignes de l'onglet Couleurs : [ID, SecteurID, Nom, Valeur]
var PAS_AIMES = [];                                 // onglet PasAimes : [ID, ProduitID, Marque, Saveur, Date, Qui] — « Ne pas racheter », pour la maison
const ATTENTE_GESTES = 'rdg_consos_attente';        // consommations et déplacements pas encore confirmés, dans l'ordre (le nom date de Consommer seul)
var envoiGestes = false;                            // la file des gestes est en route
var couleursModif = { site: {}, meubles: {} };      // changées à l'écran, pas encore envoyées
var envoiCouleurs = false;
var couleurNouveau = '305';                         // « Ajouter un meuble » : le numéro choisi                          // un envoi de couleurs est en route
var dernierChargement = 0;                          // quand les listes ont été relues (pour ne pas appeler pour rien)
const FRAICHEUR = 30000;                            // au retour dans l'app, on relit si ça date de plus de 30 s

/* ---------- Vues : connexion → page d'ouverture → formulaire ---------- */
function toutCacher() {
  requestAnimationFrame(placerTitre);   // la nouvelle feuille affichée : le titre du site se place au-dessus d'elle
  if (!$('vue-bases').hidden || !$('vue-pieces').hidden) envoyerOrdre();   // on quitte « Gérer les bases » ou « Pièces » : l'ordre part tout seul
  if (!$('vue-couleurs').hidden) envoyerCouleurs();   // idem pour « Couleurs »
  $('vue-connexion').hidden = true;
  $('vue-couleurs').hidden = true;
  $('vue-qui').hidden = true;
  $('vue-accueil').hidden = true;
  $('vue-listes').hidden = true;
  $('vue-recherche').hidden = true;
  $('vue-choix-quoi').hidden = true;
  $('vue-app').hidden = true;
  $('vue-bases').hidden = true;
  $('vue-pieces').hidden = true;
  $('vue-meuble').hidden = true;
  const vs = $('vue-scan'); if (vs) vs.hidden = true;
  if (window.stopScanner) window.stopScanner();   // coupe la caméra en quittant la vue scan
  $('btn-burger').hidden = true;   // burger caché par défaut ; ré-affiché sur accueil + choix + bases
  $('btn-rechercher').hidden = true;   // la loupe : sur les écrans à photo seulement (ailleurs elle couvrirait le titre)
  $('entete-photo').hidden = true; // l'en-tête photo est écrit UNE fois dans le HTML ; on le montre écran par écran
  fermerMenu();   // tout changement d'écran ferme le menu : personne d'autre n'a à le faire
}
async function montrerBases() {
  toutCacher(); $('vue-bases').hidden = false; $('btn-burger').hidden = false;
  if (!MEUBLES.length) {                       // pas encore chargé (on n'est pas passé par l'entrée) → on charge
    $('liste-meubles').innerHTML = '<div class="texte-petit texte-pale">Chargement…</div>';
    await chargerReferences();
  }
  remplirMeubles();
  remplirNoms();
  expedierOrdre();                             // un ordre resté en attente (échec, fermeture) repart
}
async function montrerCouleurs() {
  toutCacher(); $('vue-couleurs').hidden = false; $('btn-burger').hidden = false;
  if (!MEUBLES.length) {                       // pas encore chargé → on charge (même patron que les bases)
    $('liste-couleurs').innerHTML = '<div class="texte-petit texte-pale">Chargement…</div>';
    await chargerReferences();
  }
  remplirCouleurs();
  expedierCouleurs();                          // des couleurs restées en attente repartent
}
function montrerQui() {
  toutCacher(); $('vue-qui').hidden = false; $('btn-burger').hidden = false; $('entete-photo').hidden = false;
  $('qui-nom').value = localStorage.getItem(QUI) || '';
  $('qui-msg').className = 'message message-repli';
  $('qui-msg').textContent = '';
}
function enregistrerQui() {
  const nom = $('qui-nom').value.trim();
  const msg = $('qui-msg');
  if (!nom) {                                   // un nom vide ne règle rien : on insiste
    msg.className = 'message message-repli message-erreur';
    msg.textContent = 'Écris ton nom.';
    return;
  }
  try { localStorage.setItem(QUI, nom); } catch (e) {}
  montrerAccueil();                             // le nom est posé : on passe à la suite
}
function montrerMeuble() {
  toutCacher(); $('vue-meuble').hidden = false; $('meuble-msg').textContent = '';
  couleurNouveau = '305';                      // la couleur de départ : le brun
  $('meuble-piece').innerHTML = optionsPieces('');   // chaque meuble part sans pièce choisie (J-C : la pièce d'avant ne reste pas)
  $('meuble-palette').innerHTML = htmlPalette(couleurNouveau);
}
function montrerChoixQuoi()    { toutCacher(); $('vue-choix-quoi').hidden = false; $('btn-burger').hidden = false; $('btn-rechercher').hidden = false; $('entete-photo').hidden = false; }
async function montrerListes() {
  toutCacher(); $('vue-listes').hidden = false; $('btn-burger').hidden = false;
  remplirInventaire();                         // instantané : ce qu'on a déjà en mémoire
  if (!MEUBLES.length) await chargerReferences();
  remplirInventaire();                         // puis la version fraîche, quand elle arrive
}
function montrerAccueil()    { toutCacher(); $('vue-accueil').hidden = false; $('btn-burger').hidden = false; $('btn-rechercher').hidden = false; $('entete-photo').hidden = false; }
function montrerFormulaire(avecCode) {
  toutCacher(); $('vue-app').hidden = false;
  modeManuel = !avecCode;                    // à la main : on descend l'entonnoir; au scan : le code donne l'identité
  ordonnerFiche();
  reinitFiche();
  montrer('bloc-code', !!avecCode);          // le champ code n'apparaît qu'au scan
  montrer('fiche-scan', !avecCode);          // à la main : le scan reste à côté de la catégorie (plus d'écran « scan ou à la main »)
  $('codebarres').value = ''; codeScan = '';
  chargerReferences();                        // catégories + liste des produits
}

/* Les mêmes blocs, dans l'ordre du chemin suivi :
   à la main -> Catégorie, Sous-catégorie, Produit, (Nom si nouveau), Marque/Format, Endroits
   au scan   -> Nom, Marque/Format, (Catégorie/Sous-catégorie si nouveau), Endroits */
function ordonnerFiche() {
  const parent = $('vue-app').querySelector('.contenu');
  const ordre = modeManuel
    ? ['bloc-code', 'bloc-cat', 'bloc-souscat', 'bloc-produit', 'bloc-nom', 'bloc-details', 'bloc-achat', 'bloc-endroits']
    : ['bloc-code', 'bloc-nom', 'bloc-details', 'bloc-achat', 'bloc-cat', 'bloc-souscat', 'bloc-produit', 'bloc-endroits'];   // magasin + prix : juste sous le format
  ordre.forEach(id => parent.insertBefore($(id), $('btn-enregistrer')));
}

/* Arrivée par le SCAN : ouvre la fiche en mode code, pose le code, lance la recherche. */
function ouvrirFicheScan(code) {
  montrerFormulaire(true);
  $('codebarres').value = String(code || '');
  surCode();
}

/* Le code-barres est la clé : STOCK d'abord (reconnu ?), sinon Open Food Facts. */
async function surCode() {
  const code = $('codebarres').value.trim();
  codeScan = code;
  if (!code) return;
  const pid = CODES[String(code)];
  if (pid) {                                        // déjà à nous
    const prod = PRODUITS.find(p => String(p.id) === String(pid));
    if (prod) { $('nom').value = prod.nom; surNom(); return; }
  }
  statut('Recherche du produit…');
  let d = null;
  if (typeof window.chercherOFF === 'function') { try { d = await window.chercherOFF(code); } catch (e) {} }
  statut('');
  if (d && d.trouve) {                              // trouvé chez Open Food Facts -> nouveau produit
    $('nom').value = d.nom || '';
    surNom();
    if (produitCourant === null) {                  // resté « nouveau » : on garde les infos OFF
      if (d.marque) choisirParNom('marque', d.marque);   // retrouvée dans la liste, sinon proposée en « Nouvelle marque… »
      if (d.format) poserFormat(d.format);   // Open Food Facts donne « 2 L » : on le répartit dans les deux champs
    }
  }                                                 // sinon : on laisse; il remplit le nom à la main
}
function revenirConnexion(msg) {
  toutCacher(); $('vue-connexion').hidden = false; $('entete-photo').hidden = false;
  if (msg) $('mdp').value = '';   // refusé : le champ se vide, on retape
  $('msg-connexion').textContent = msg || '';
}

async function entrer() {
  const pw = $('mdp').value.trim();
  if (!pw) return;
  Coffre.definirMotDePasse(pw);
  const ok = await chargerAvecChariot();   // on entre avec TOUTES les données (et un mauvais mot de passe se voit)
  if (ok === false) return;                // refusé : on est déjà revenu au mot de passe
  if (!localStorage.getItem(QUI)) montrerQui();   // personne de nommé ici : on demande AVANT la 1re entrée
  else montrerAccueil();
}
/* À l'entrée dans l'app, le chariot tourne tant que tout n'est pas là (J-C, 2026-09-29) :
   jamais une réserve à moitié chargée. Rien ne passe (3 essais) : on garde ce qu'on avait. */
async function chargerAvecChariot() {
  montrerVoile(true);
  try { return await chargerReferences(); } finally { montrerVoile(false); }
}

function deconnexion() {
  Coffre.oublier();
  $('mdp').value = ''; $('msg-connexion').textContent = '';
  revenirConnexion();
}

/* ---------- Menu burger ---------- */
/* Le menu : la page glisse vers le haut, la grille d'icônes apparaît, le burger devient un X. */
function fermerMenu() {                 // la page redescend ; Outils se replie avec elle
  $('menu').classList.remove('ouvert');
  document.body.classList.remove('menu-ouvert');
  $('btn-burger').classList.remove('ouvert');
  montrerGrilleMenu('principal');
  placerTitre();
}
function ouvrirMenu() {
  $('menu').scrollTop = 0;
  $('menu').classList.add('ouvert');
  document.body.classList.add('menu-ouvert');
  $('btn-burger').classList.add('ouvert');
  placerTitre();
}
/* Menu ouvert : le titre du site monte juste au-dessus des icônes, pour ne pas être caché dessous. */
function placerTitre() {
  const titre = document.querySelector('.entete-titre');
  if (!titre.offsetParent) return;                    // pas de photo sur cet écran : rien à déplacer
  const bas = titre.offsetParent.getBoundingClientRect().top + titre.offsetTop + titre.offsetHeight;   // sa place d'origine (sans le décalage)
  let haut = window.innerHeight;                      // rien par-dessus la photo : le titre reste en place
  if ($('menu').classList.contains('ouvert')) haut -= document.querySelector('.menu-contenu').offsetHeight;
  else {
    const feuille = document.querySelector('.sur-photo:not([hidden])');
    if (feuille && feuille.offsetHeight) haut = feuille.getBoundingClientRect().top -
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--espace-xl'));   // le même écart qu'au-dessus des icônes
  }
  document.documentElement.style.setProperty('--titre-monte', Math.max(0, bas - haut) + 'px');
}
/* Le menu a trois grilles, une seule visible : la principale (6), Outils (4), Gérer les bases (8).
   Chaque Retour remonte d'un cran. */
window.addEventListener('resize', () => placerTitre());
const GRILLES_MENU = { principal: 'menu-principal', outils: 'menu-outils-grille', bases: 'menu-bases-grille' };
function montrerGrilleMenu(nom) {
  Object.keys(GRILLES_MENU).forEach(k => { $(GRILLES_MENU[k]).hidden = k !== nom; });
  if ($('menu').classList.contains('ouvert')) placerTitre();   // la grille change de hauteur : le titre suit
}
/* Glisser le doigt vers le bas sur le menu le ferme (comme retoucher le X). */
const GLISSER = 60;                     // en pixels : un vrai geste, pas un frôlement
var glisserDepart = null;
function surToucheDebut(ev) { glisserDepart = $('menu').scrollTop === 0 ? ev.touches[0].clientY : null; }
function surToucheFin(ev) {
  if (glisserDepart === null) return;
  if (ev.changedTouches[0].clientY - glisserDepart > GLISSER) fermerMenu();
  glisserDepart = null;
}
function montrerVoile(on){ $('voile').hidden = !on; }   // voile bloquant + les trois bouteilles de lait

/* Ouvre/ferme un accordéon — UN SEUL ouvert à la fois dans son groupe (ses frères). Partout. */
function toggleAccordeon(tete) {
  const acc = tete.closest('.accordeon');
  if (!acc || !acc.parentElement) return;
  const ouvrir = !tete.classList.contains('ouvert');
  [...acc.parentElement.children].forEach(function (el) {   // fermer les frères
    if (el.classList && el.classList.contains('accordeon')) {
      if (el.firstElementChild) el.firstElementChild.classList.remove('ouvert');
      if (el.children[1]) el.children[1].hidden = true;
      // ce qui se ferme ferme aussi tout ce qu'il contient : rien ne reste ouvert en cachette
      el.querySelectorAll('.accordeon > .ouvert:first-child').forEach(function (t) {
        t.classList.remove('ouvert');
        if (t.nextElementSibling) t.nextElementSibling.hidden = true;
      });
    }
  });
  if (ouvrir) {
    tete.classList.add('ouvert');
    if (tete.nextElementSibling) tete.nextElementSibling.hidden = false;
  }
}
function basculerMenu() {                // ouvrir, ou fermer par le seul chemin qui replie tout
  if ($('menu').classList.contains('ouvert')) fermerMenu();
  else ouvrirMenu();
}

/* ---------- Toast « à venir » ---------- */
function avis(txt, type) {                 // type : 'avis' (défaut) · 'succes' · 'erreur'
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); document.body.appendChild(t); }
  t.className = 'toast toast-' + (type || 'avis');
  t.textContent = txt;
  requestAnimationFrame(() => t.classList.add('visible'));
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('visible'), 1600);
}

/* ---------- Cache local des listes ---------- */
function lireCache() { try { return JSON.parse(localStorage.getItem(CACHE) || 'null'); } catch (e) { return null; } }
function ecrireCache(d) { try { localStorage.setItem(CACHE, JSON.stringify(d)); } catch (e) {} }

/* Construit les listes de travail à partir des lignes brutes. */
function appliquer(d) {
  RAYONS = []; SOUSCATS = {};
  SECTEUR_ID = '';
  (d.cats || []).forEach(r => {                       // [ID,Nom,ParentID,SecteurID,DureeVie,Actif]
    if (!SECTEUR_ID && r[3]) SECTEUR_ID = String(r[3]);   // secteur de l'app (Épicerie)
    if (String(r[5]) !== 'O') return;
    if (!r[2]) RAYONS.push({ id: r[0], nom: r[1] });
    else (SOUSCATS[r[2]] = SOUSCATS[r[2]] || []).push({ id: r[0], nom: r[1] });
  });
  MEUBLES = []; ESPACES = {}; PIECES = [];
  const emps = (d.emps || []).filter(r => String(r[4]) === 'O');   // [ID,Nom,ParentID,SecteurID,Actif,Couleur]
  const estPiece = {};                                             // pièce = enfant direct du SECTEUR
  emps.forEach(r => { if (SECTEUR_ID && String(r[2]) === SECTEUR_ID) { PIECES.push({ id: r[0], nom: r[1], couleur: r[5] || '' }); estPiece[r[0]] = true; } });
  const estMeuble = {};                                            // meuble = enfant d'une pièce, OU pas encore rangé (ParentID vide)
  emps.forEach(r => {
    const p = String(r[2] || '');
    if (!p || estPiece[p]) { MEUBLES.push({ id: r[0], nom: r[1], couleur: r[5] || '', pieceId: estPiece[p] ? p : '' }); estMeuble[r[0]] = true; }
  });
  emps.forEach(r => {                                              // espace = enfant d'un meuble
    const p = String(r[2] || '');
    if (p && estMeuble[p]) (ESPACES[p] = ESPACES[p] || []).push({ id: r[0], nom: r[1] });
  });
  PRODUITS = (d.prods || [])              // [ID,Nom,CategorieID,Unite,Actif,Marque,Format,MarqueCompte,SaveurCompte,OrdreEmp]
    .filter(r => String(r[4]) !== 'N')
    .map(r => ({ id: r[0], nom: r[1], catId: r[2], ordre: String(r[9] || '') }));   // ordre = ses endroits, le 1er d'abord (J-C, flèches)
  LISTES = { Magasins: [], Marques: [], Saveurs: [] }; NOMS_LISTES = {};
  const L = d.listes || {};
  Object.keys(LISTES).forEach(n => (L[n] || []).forEach(r => {   // [ID, Nom, Actif]
    NOMS_LISTES[String(r[0])] = String(r[1] || '');          // même réuni (désactivé) : une vieille ligne garde son nom
    if (String(r[2]) !== 'N') LISTES[n].push({ id: String(r[0]), nom: String(r[1] || '') });
  }));
  LISTES_NEUVES.forEach(x => { if (!NOMS_LISTES[x.id]) { NOMS_LISTES[x.id] = x.nom; LISTES[x.liste].push({ id: x.id, nom: x.nom }); } });   // pas encore envoyés : gardés
  Object.keys(LISTES).forEach(n => LISTES[n].sort((a, b) => a.nom.localeCompare(b.nom, 'fr')));
  VARIANTES = d.variantes || {};                      // { produitId: { marques:[], formats:[] } }
  CODES = d.codes || {};                              // { codeBarres: produitId }
  STOCK = d.stock || [];
  COULEURS = d.couleurs || [];                        // [ID, SecteurID, Nom, Valeur]
  PAS_AIMES = d.pasAimes || [];
  // une couleur pas encore confirmée (attente) ou en cours d'essai (écran) l'emporte sur le Sheet
  const cm = Object.assign({}, lireAttenteCouleurs().meubles, couleursModif.meubles);
  PIECES.concat(MEUBLES).forEach(m => { if (cm[m.id] !== undefined) m.couleur = cm[m.id]; });
  appliquerCouleursSite();
}

/* Rend true (chargé), false (mot de passe refusé) ou null (réseau). */
async function chargerReferences() {
  const cache = lireCache();
  if (cache) { appliquer(cache); remplirListes(); statut(''); }   // instantané si déjà vu
  else statut('Chargement…');
  dernierChargement = Date.now();
  try {
    const data = await chargerData();
    if (Object.keys(ordreModifie).length) envoyerOrdre();   // des flèches touchées pendant le chargement : on les garde
    reordonnerLignes(data.emps, lireAttente());   // un ordre pas encore confirmé l'emporte sur l'ancien
    poserOrdresAliments(data.prods, lireAttenteAliments());   // idem pour l'ordre des endroits d'un aliment
    data.stock = data.stock || []; data.pasAimes = data.pasAimes || [];
    lireAttenteGestes().forEach(e => appliquerGeste(e, data.stock, data.pasAimes));   // idem : une consommation en route reste faite
    appliquer(data); ecrireCache(data); remplirListes(); statut('');
    expedierOrdre();                              // le réseau répond : on en profite pour renvoyer l'attente
    expedierCouleurs();                           // idem pour les couleurs (sinon un appareil garde les siennes)
    expedierGestes();                             // idem pour les consommations
    return true;
  } catch (e) {
    if (e.message === 'non autorisé') { Coffre.oublier(); revenirConnexion('Mot de passe refusé.'); return false; }
    if (!cache) statut('Réseau lent — patiente un instant ou recharge la page.', 'erreur');
    avis('Réserve pas relue' + (e.refus ? ' (' + e.message + ')' : '') + ' — recharge dans un instant', 'erreur');
    return null;
  }
}

/* Tout, en UN appel, réessayé jusqu'à 3 fois (le VPN a ses hoquets).
   Jamais de demi-chargement : sans le stock, l'app croirait la réserve vide — et l'écrirait dans sa mémoire.
   Si rien ne passe, on garde ce qu'on avait. */
async function chargerData() {
  let err;
  for (let i = 0; i < 3; i++) {
    try {
      const r = await Coffre.references();
      if (r && r.ok && r.categories !== undefined) return { cats: r.categories, emps: r.emplacements, prods: r.produits, stock: r.stock, variantes: r.variantes, codes: r.codes, couleurs: r.couleurs, listes: r.listes, pasAimes: r.pasAimes };
      if (r && r.erreur === 'non autorisé') throw new Error('non autorisé');   // inutile de réessayer
      err = new Error((r && r.erreur) || 'refus'); err.refus = true;          // le coffre-fort a répondu, mais pas oui
    } catch (e) { if (e.message === 'non autorisé') throw e; err = e; }
    if (i < 2) await new Promise(res => setTimeout(res, 500 * (i + 1)));
  }
  throw err;
}

function options(liste, vide) {
  return '<option value="">' + vide + '</option>' +
    liste.map(x => '<option value="' + x.id + '">' + esc(x.nom) + '</option>').join('');
}

/* ---------- Fiche : Nom -> (reconnu / nouveau) -> catégorie -> endroits ---------- */
function remplirCategories() {
  const garde = $('cat').value;
  $('cat').innerHTML = options(RAYONS, '— Catégorie —') + '<option value="neuve">Nouvelle catégorie…</option>';
  if (garde) $('cat').value = garde;
}
/* Les sous-catégories d'un rayon, plus « Nouvelle sous-catégorie… ». */
function remplirSousCategories(rid) {
  $('souscat').innerHTML = options(SOUSCATS[rid] || [], '— Sous-catégorie —') +
    (rid ? '<option value="neuve">Nouvelle sous-catégorie…</option>' : '');
}
function remplirProduitsDatalist() {
  $('dl-produits').innerHTML = PRODUITS.map(p => '<option value="' + esc(p.nom) + '"></option>').join('');
}
function remplirListes() { remplirCategories(); remplirProduitsDatalist(); }

function trouverProduitParNom(nom) {
  const n = String(nom || '').trim().toLowerCase();
  if (!n) return null;
  return PRODUITS.find(p => String(p.nom).trim().toLowerCase() === n) || null;
}

/* Remet la fiche à l'état de départ (champs vides, blocs cachés). */
function reinitFiche() {
  $('nom').value = '';
  remplirChoix('marque', []); remplirChoix('saveur', []); remplirChoix('magasin', LISTES.Magasins.map(x => x.id));
  Object.keys(CHOIX_FICHE).forEach(ch => { $(ch + '-neuve').value = ''; });
  poserFormat('');
  $('prix').value = '';
  $('cat').value = ''; $('souscat').innerHTML = ''; $('produit').innerHTML = ''; $('endroits').innerHTML = '';
  produitCourant = null;
  montrer('bloc-details', false); montrer('bloc-souscat', false); montrer('bloc-produit', false);
  montrer('bloc-doublons', false); montrer('bloc-achat', false);
  montrer('bloc-cat-neuve', false); montrer('bloc-souscat-neuve', false);
  $('cat-neuve').value = ''; $('souscat-neuve').value = '';
  montrer('bloc-endroits', false); montrer('btn-enregistrer', false);
  pasEncoreRange(false);
  montrer('bloc-cat', modeManuel);      // à la main, l'entonnoir part de la catégorie
  montrer('bloc-nom', !modeManuel);     // le nom ne sert qu'au scan, ou à un nouveau produit
  statut('');
}

/* Le Nom pilote : match un produit existant = reconnu; sinon = nouveau. */
function surNom() {
  const val = $('nom').value.trim();
  if (modeManuel) {                             // à la main : la catégorie est déjà choisie, le nom ne pilote rien
    proposerRessemblances(val);                 // un nom qui ressemble à un produit déjà là ?
    montrer('bloc-achat', !!val); montrer('bloc-endroits', !!val); montrer('btn-enregistrer', !!val);
    if (val && !$('endroits').children.length) ajouterEndroit();
    return;
  }
  $('endroits').innerHTML = '';
  montrer('bloc-endroits', false); montrer('btn-enregistrer', false);
  pasEncoreRange(false);
  if (!val) {
    produitCourant = null;
    montrer('bloc-details', false); montrer('bloc-cat', false); montrer('bloc-souscat', false);
    return;
  }
  montrer('bloc-details', true);
  const prod = trouverProduitParNom(val);
  if (prod) {                                   // produit existant reconnu
    produitCourant = prod.id;
    montrer('bloc-cat', false); montrer('bloc-souscat', false);   // catégorie déjà connue
    montrer('bloc-doublons', false);
    prefillProduit(prod.id);                    // marque/format (dernières) + endroits habituels
    montrer('bloc-achat', true); montrer('bloc-endroits', true); montrer('btn-enregistrer', true);
  } else {                                      // nouveau produit
    produitCourant = null;
    remplirVariantes(null);                     // aucune suggestion marque/format
    proposerRessemblances(val);                 // ... mais peut-être un doublon d'un produit connu
    montrer('bloc-cat', true);                  // il choisit la catégorie
    montrer('bloc-souscat', !!$('cat').value);
  }
}

function surCategorie() {
  const rid = $('cat').value;
  if (rid === 'neuve') {                        // il veut une catégorie qui n'existe pas encore
    montrer('bloc-cat-neuve', true); montrer('bloc-souscat', false); montrer('bloc-produit', false);
    $('cat-neuve').focus();
    return;
  }
  montrer('bloc-cat-neuve', false); montrer('bloc-souscat-neuve', false);
  remplirSousCategories(rid);
  montrer('bloc-souscat', !!rid);
  montrer('bloc-produit', false); montrer('bloc-endroits', false); montrer('btn-enregistrer', false);
  $('endroits').innerHTML = '';
  if (modeManuel) { produitCourant = null; $('nom').value = ''; montrer('bloc-nom', false); montrer('bloc-details', false); }
}

function surSousCategorie() {
  const scid = $('souscat').value;
  if (scid === 'neuve') {                       // idem pour la sous-catégorie
    montrer('bloc-souscat-neuve', true); montrer('bloc-produit', false);
    montrer('bloc-endroits', false); montrer('btn-enregistrer', false);
  pasEncoreRange(false);
    $('souscat-neuve').focus();
    return;
  }
  montrer('bloc-souscat-neuve', false);
  if (modeManuel) {                             // à la main : la sous-catégorie donne la liste des produits
    produitCourant = null;
    $('nom').value = '';
    montrer('bloc-nom', false); montrer('bloc-details', false);
    montrer('bloc-endroits', false); montrer('btn-enregistrer', false);
  pasEncoreRange(false);
    $('endroits').innerHTML = '';
    if (!scid) { montrer('bloc-produit', false); return; }
    remplirProduits(scid);
    montrer('bloc-produit', true);
    return;
  }
  if (!scid) { montrer('bloc-endroits', false); montrer('btn-enregistrer', false); return; }
  montrer('bloc-endroits', true); montrer('btn-enregistrer', true);
  if (!$('endroits').children.length) ajouterEndroit();
}

/* La liste des produits d'une sous-catégorie, par ordre alphabétique, + « Nouveau produit… ». */
function remplirProduits(scid) {
  const liste = PRODUITS.filter(p => String(p.catId) === String(scid))
                        .sort((a, b) => String(a.nom).localeCompare(String(b.nom), 'fr'));
  $('produit').innerHTML = options(liste, '— Produit —') + '<option value="nouveau">Nouveau produit…</option>';
}

/* Un produit choisi dans la liste (ou « Nouveau produit… »). */
function surProduit() {
  const v = $('produit').value;
  $('endroits').innerHTML = '';
  montrer('bloc-endroits', false); montrer('btn-enregistrer', false);
  pasEncoreRange(false);
  if (!v) { produitCourant = null; montrer('bloc-nom', false); montrer('bloc-details', false); return; }
  if (v === 'nouveau') {                        // il le nomme; la catégorie, elle, est déjà choisie
    produitCourant = null;
    $('nom').value = '';
    remplirVariantes(null);
    montrer('bloc-nom', true); montrer('bloc-details', true);
    $('nom').focus();
    return;
  }
  const prod = PRODUITS.find(p => String(p.id) === String(v));
  if (!prod) return;
  produitCourant = prod.id;
  $('nom').value = prod.nom;                    // le nom sert à l'enregistrement; inutile de le montrer
  montrer('bloc-nom', false); montrer('bloc-doublons', false);
  montrer('bloc-details', true);
  prefillProduit(prod.id);                      // marque/format + endroits habituels
  montrer('bloc-achat', true); montrer('bloc-endroits', true); montrer('btn-enregistrer', true);
}

/* Les choix de la fiche pour un produit : ses marques et ses saveurs déjà vues, tous les magasins, les unités. */
function remplirVariantes(pid) {
  const vr = (pid && VARIANTES[pid]) || { marques: [], formats: [], saveurs: [] };
  remplirChoix('marque', vr.marques);
  remplirChoix('saveur', vr.saveurs);
  remplirUnites();
  remplirChoix('magasin', LISTES.Magasins.map(x => x.id), $('magasin').value !== 'neuve' ? $('magasin').value : '');
}


/* Un emplacement (id stocké dans STOCK) -> { pieceId, meubleId, espaceId }.
   L'id est soit un espace (enfant d'un meuble), soit un meuble (rangé directement dessus). */
function resoudreEmp(empId) {
  empId = String(empId);
  for (const mid in ESPACES) {
    if ((ESPACES[mid] || []).some(e => String(e.id) === empId)) {
      const m = MEUBLES.find(x => String(x.id) === String(mid));
      return { pieceId: (m && m.pieceId) || '', meubleId: mid, espaceId: empId };
    }
  }
  const m = MEUBLES.find(x => String(x.id) === empId);
  if (m) return { pieceId: m.pieceId || '', meubleId: empId, espaceId: '' };
  return null;   // emplacement disparu (meuble/espace supprimé)
}

/* Produit déjà connu : pré-remplir marque/format (dernières utilisées) + un endroit
   par emplacement habituel (dans l'ordre), quantité vide. Tout reste modifiable. */
function prefillProduit(pid) {
  const vr = (pid && VARIANTES[pid]) || null;
  remplirVariantes(pid);                                   // ses marques et saveurs déjà vues
  $('marque').value = (vr && vr.derniereMarque) || '';
  poserFormat((vr && vr.dernierFormat) || '');
  $('endroits').innerHTML = '';
  let n = 0;
  endroitsHabituels(pid).forEach(empId => {
    const e = resoudreEmp(empId);
    if (e) { ajouterEndroit({ pieceId: e.pieceId, meubleId: e.meubleId, espaceId: e.espaceId, qte: '' }); n++; }
  });
  if (!n) ajouterEndroit();                                // aucun emplacement connu -> une carte vierge
}

/* Retient localement marque/format/emplacements d'un produit (suggestions immédiates + cache). */
function memoriserVariante(pid, marque, format, endroits, saveur) {
  if (!pid) return;
  const vr = VARIANTES[pid] || (VARIANTES[pid] = { marques: [], formats: [], emplacements: [], derniereMarque: '', dernierFormat: '' });
  vr.marques = vr.marques || []; vr.formats = vr.formats || []; vr.emplacements = vr.emplacements || []; vr.saveurs = vr.saveurs || [];
  if (saveur && vr.saveurs.indexOf(saveur) === -1) vr.saveurs.push(saveur);
  if (marque) { if (vr.marques.indexOf(marque) === -1) vr.marques.push(marque); vr.derniereMarque = marque; }
  if (format) { if (vr.formats.indexOf(format) === -1) vr.formats.push(format); vr.dernierFormat = format; }
  (endroits || []).forEach(e => { if (e.emp && vr.emplacements.indexOf(e.emp) === -1) vr.emplacements.push(e.emp); });
  const c = lireCache(); if (c) { (c.variantes = c.variantes || {})[pid] = vr; ecrireCache(c); }
}


/* ---------- Marque, Saveur, Magasin : des listes gérées dans la fiche (2026-09-29) ----------
   Comme la Catégorie : on choisit, « Nouvelle… » au bout, jamais de texte libre. Marque et saveur : seulement celles
   déjà vues avec CE produit (choix A de J-C : la liste reste courte); « Nouvelle… » retrouve un nom qui existe ailleurs.
   Un nom neuf reçoit son ID ici et part avec l'entrée (aucun appel de plus). STOCK retient l'ID. */
const CHOIX_FICHE = {
  marque:  { liste: 'Marques',  vide: '— Aucune marque —', neuve: 'Nouvelle marque…' },
  saveur:  { liste: 'Saveurs',  vide: '— Aucune saveur —', neuve: 'Nouvelle saveur…' },
  magasin: { liste: 'Magasins', vide: '— Magasin —',       neuve: 'Nouveau magasin…' }
};
/* Ce que STOCK retient (un ID) -> ce qu'on lit. Une vieille valeur écrite en texte se lit telle quelle. */
function nomListe(v) { const k = String(v == null ? '' : v).trim(); return NOMS_LISTES[k] || k; }
/* Deux noms « pareils » : sans accent, sans majuscule, sans espace ni ponctuation (« Super C » = « SuperC »). Même règle que le coffre-fort. */
function cleNom(n) { return String(n || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
/* Les options d'un choix : les ID proposés (par nom), celui qui est choisi, puis « Nouvelle… ». */
function remplirChoix(champ, ids, choisi) {
  const C = CHOIX_FICHE[champ], vus = [];
  (ids || []).concat(choisi ? [choisi] : []).forEach(v => { v = String(v || ''); if (v && vus.indexOf(v) === -1) vus.push(v); });
  vus.sort((a, b) => nomListe(a).localeCompare(nomListe(b), 'fr'));
  $(champ).innerHTML = '<option value="">' + C.vide + '</option>' +
    vus.map(v => '<option value="' + esc(v) + '">' + esc(nomListe(v)) + '</option>').join('') +
    '<option value="neuve">' + C.neuve + '</option>';
  $(champ).value = choisi ? String(choisi) : '';
  montrer('bloc-' + champ + '-neuve', false);
}
function idsProposes(champ) { return [...$(champ).options].map(o => o.value).filter(v => v && v !== 'neuve'); }
/* « Nouvelle… » choisi : le champ pour la nommer apparaît. */
function surChoix(champ) {
  const neuve = $(champ).value === 'neuve';
  montrer('bloc-' + champ + '-neuve', neuve);
  if (neuve) $(champ + '-neuve').focus();
}
/* « Ajouter » : un nom déjà dans la liste (même ailleurs) est REPRIS, jamais doublé; sinon il naît ici. */
function ajouterChoix(champ) {
  const C = CHOIX_FICHE[champ], nom = $(champ + '-neuve').value.trim();
  if (!nom) { $(champ + '-neuve').focus(); return false; }
  let x = LISTES[C.liste].find(y => cleNom(y.nom) === cleNom(nom));
  if (!x) {
    x = { id: idLocal(), nom: nom };
    LISTES[C.liste].push(x); NOMS_LISTES[x.id] = nom;
    LISTES_NEUVES.push({ liste: C.liste, id: x.id, nom: nom });
  }
  remplirChoix(champ, idsProposes(champ), x.id);
  $(champ + '-neuve').value = '';
  return true;
}
/* Un nom venu d'ailleurs (Open Food Facts) : retrouvé dans la liste, sinon proposé en « Nouvelle… », prêt à Ajouter. */
function choisirParNom(champ, nom) {
  nom = String(nom || '').split(',')[0].trim();         // OFF donne parfois « Liberté, Danone » : la première
  if (!nom) return;
  const x = LISTES[CHOIX_FICHE[champ].liste].find(y => cleNom(y.nom) === cleNom(nom));
  if (x) { remplirChoix(champ, idsProposes(champ), x.id); return; }
  $(champ).value = 'neuve'; montrer('bloc-' + champ + '-neuve', true); $(champ + '-neuve').value = nom;
}
/* L'entrée a réussi : les noms neufs sont au coffre-fort. S'il en avait déjà un pareil, on prend SON ID partout.
   Rend la fonction qui traduit un ID de l'app en ID final. */
function confirmerNeuves(envoyes, finals) {
  const fin = v => finals[String(v || '')] || v;
  const c = lireCache();
  envoyes.forEach(n => {
    const f = String(fin(n.id));
    LISTES_NEUVES = LISTES_NEUVES.filter(x => x.id !== n.id);
    if (f !== n.id) {                                   // un pareil existait : on oublie le nôtre
      LISTES[n.liste] = LISTES[n.liste].filter(x => x.id !== n.id); delete NOMS_LISTES[n.id];
      if (!NOMS_LISTES[f]) { NOMS_LISTES[f] = n.nom; LISTES[n.liste].push({ id: f, nom: n.nom }); }   // pas encore relu ici : on le connaît déjà
      Object.values(VARIANTES).forEach(vr => ['marques', 'saveurs'].forEach(k => { vr[k] = (vr[k] || []).map(v => v === n.id ? f : v); }));
    }
    if (c) {
      c.listes = c.listes || {}; const rows = (c.listes[n.liste] = c.listes[n.liste] || []);
      if (!rows.some(r => String(r[0]) === f)) rows.push([f, n.nom, 'O']);
    }
  });
  if (c) ecrireCache(c);
  return fin;
}

/* ---------- Ajouter une catégorie ou une sous-catégorie sans quitter la fiche ----------
   Un nom déjà pris (chez les mêmes frères) ne crée RIEN : on reprend celui qui existe. */
async function creerCategorie(parentId, champ, bouton) {
  const nom = $(champ).value.trim();
  if (!nom) { $(champ).focus(); return null; }
  const freres = parentId ? (SOUSCATS[parentId] || []) : RAYONS;
  const deja = freres.find(x => String(x.nom).trim().toLowerCase() === nom.toLowerCase());
  if (deja) { $(champ).value = ''; return deja; }          // déjà là : on la réutilise
  $(bouton).disabled = true;
  montrerVoile(true);
  try {
    // Categories : ID · Nom · ParentID · SecteurID · DureeVieJours · Actif
    const rep = await Coffre.ajouter('Categories', ['', nom, parentId || '', SECTEUR_ID, '', 'O']);
    if (!rep || !rep.ok) throw new Error((rep && rep.erreur) || 'refus');
    const neuve = { id: rep.id, nom: nom };
    if (parentId) (SOUSCATS[parentId] = SOUSCATS[parentId] || []).push(neuve); else RAYONS.push(neuve);
    const c = lireCache();
    if (c) { (c.cats = c.cats || []).push([rep.id, nom, parentId || '', SECTEUR_ID, '', 'O']); ecrireCache(c); }
    $(champ).value = '';
    return neuve;
  } catch (e) {
    statut('Échec : ' + e.message, 'erreur');
    return null;
  } finally { $(bouton).disabled = false; montrerVoile(false); }
}
async function ajouterCategorie() {
  const neuve = await creerCategorie('', 'cat-neuve', 'btn-cat-neuve');
  if (!neuve) return;
  remplirCategories();
  $('cat').value = neuve.id;
  montrer('bloc-cat-neuve', false);
  surCategorie();                               // la suite de l'entonnoir reprend son cours
}
async function ajouterSousCategorie() {
  const rid = $('cat').value;
  if (!rid || rid === 'neuve') return;
  const neuve = await creerCategorie(rid, 'souscat-neuve', 'btn-souscat-neuve');
  if (!neuve) return;
  remplirSousCategories(rid);
  $('souscat').value = neuve.id;
  montrer('bloc-souscat-neuve', false);
  surSousCategorie();
}

/* ---------- Doublons : proposer, jamais deviner ---------- */
/* Un nom réduit à l'essentiel : sans accent, sans majuscule, sans ponctuation, sans pluriel. */
function nomNu(nom) {
  return String(nom || '').toLowerCase().replace(/\u0153/g, 'oe').replace(/\u00e6/g, 'ae')   // \u00ab \u0152ufs \u00bb = \u00ab oeufs \u00bb
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ').replace(/s\b/g, '').replace(/\s+/g, ' ').trim();
}
/* Distance entre deux mots : combien de lettres il faut changer pour passer de l'un à l'autre. */
function distance(a, b) {
  const m = a.length, n = b.length;
  if (!m || !n) return Math.max(m, n);
  let ligne = Array.from({ length: n + 1 }, (_, k) => k);
  for (let i = 1; i <= m; i++) {
    let prec = ligne[0]; ligne[0] = i;
    for (let k = 1; k <= n; k++) {
      const tmp = ligne[k];
      ligne[k] = Math.min(ligne[k] + 1, ligne[k - 1] + 1, prec + (a[i - 1] === b[k - 1] ? 0 : 1));
      prec = tmp;
    }
  }
  return ligne[n];
}
/* Les produits qui ressemblent à ce nom : l'un contient l'autre, ou deux lettres d'écart. */
function ressemblances(nom) {
  const n = nomNu(nom);
  if (n.length < 3) return [];
  const tel = String(nom || '').trim().toLowerCase();
  return PRODUITS.filter(p => {
    const q = nomNu(p.nom);
    if (!q) return false;
    if (String(p.nom).trim().toLowerCase() === tel) return false;   // déjà reconnu : inutile de le proposer
    if (q === n) return true;                                       // « Lait 2% » et « Lait 2 % » : le même
    return q.indexOf(n) === 0 || n.indexOf(q) === 0 || distance(n, q) <= 2;
  }).slice(0, 6);
}
/* On les montre, il touche le bon — ou il continue, et c'est un nouveau produit. */
function proposerRessemblances(nom) {
  if (produitCourant) { montrer('bloc-doublons', false); return; }
  const proches = ressemblances(nom);
  $('liste-doublons').innerHTML = proches.map(p =>
    '<button class="bouton bouton-petit bouton-suite" data-doublon="' + esc(p.id) + '" type="button">' + esc(p.nom) + '</button>').join('');
  montrer('bloc-doublons', proches.length > 0);
}
/* Il touche un produit proposé : on bascule dessus, comme s'il l'avait choisi dans la liste. */
function adopterProduit(pid) {
  const prod = PRODUITS.find(p => String(p.id) === String(pid));
  if (!prod) return;
  produitCourant = prod.id;
  $('nom').value = prod.nom;
  montrer('bloc-doublons', false);
  montrer('bloc-cat', false); montrer('bloc-souscat', false);
  montrer('bloc-details', true);
  prefillProduit(prod.id);
  montrer('bloc-achat', true); montrer('bloc-endroits', true); montrer('btn-enregistrer', true);
}

/* ---------- Le format : un nombre + une unité ----------
   Écrit toujours pareil, donc les quantités s'additionnent. La liste d'unités part de
   UNITES_BASE et s'enrichit de tout ce qui a déjà servi; « Autre… » en ajoute une. */
function unitesConnues() {
  const vues = UNITES_BASE.slice();
  STOCK.forEach(l => {
    const u = String(l[6] || '').trim().replace(/^[0-9]+([.,][0-9]+)?\s*/, '');
    if (u && vues.indexOf(u) === -1) vues.push(u);
  });
  return vues;
}
function remplirUnites() {
  const garde = $('format-unite').value;
  $('format-unite').innerHTML = '<option value="">— Choisir —</option>' +
    unitesConnues().map(u => '<option value="' + esc(u) + '">' + esc(u) + '</option>').join('') +
    '<option value="autre">Autre…</option>';
  if (garde) $('format-unite').value = garde;
}
/* Ce que valent les deux champs, mis ensemble : « 2 L ». */
function formatSaisi() {
  const nb = $('format-nb').value.trim().replace('.', ',');
  const u = uniteSaisie();
  if (!nb && !u) return '';
  return (nb ? nb + ' ' : '') + u;
}
function uniteSaisie() {
  const u = $('format-unite').value;
  return u === 'autre' ? $('unite-autre').value.trim() : u;
}
/* L'inverse : « 2 L » revient dans les deux champs (produit déjà connu). */
function poserFormat(txt) {
  const m = String(txt || '').trim().match(/^([0-9]+(?:[.,][0-9]+)?)?\s*(.*)$/);
  $('format-nb').value = (m && m[1]) ? m[1].replace('.', ',') : '';
  const u = (m && m[2]) ? m[2].trim() : '';
  remplirUnites();
  if (u && !unitesConnues().includes(u)) {                       // une unité jamais vue : on l'ajoute au vol
    $('format-unite').insertAdjacentHTML('beforeend', '<option value="' + esc(u) + '">' + esc(u) + '</option>');
  }
  $('format-unite').value = u;
  montrer('bloc-unite-autre', false); $('unite-autre').value = '';
}

/* ---------- La quantité mesurable : « 2 x 1 L » se lit « 2 L » ---------- */
/* Un format écrit à la main -> { valeur, unite } ; null si ce n'est pas mesurable. */
function mesure(format) {
  const t = String(format || '').toLowerCase().replace(',', '.').trim();
  const m = t.match(/^([0-9]+(?:\.[0-9]+)?)\s*(kg|g|mg|l|ml|cl)\b/);
  if (!m) return null;
  const v = parseFloat(m[1]);
  if (m[2] === 'kg') return { valeur: v, unite: 'kg' };
  if (m[2] === 'g')  return { valeur: v / 1000, unite: 'kg' };
  if (m[2] === 'mg') return { valeur: v / 1000000, unite: 'kg' };
  if (m[2] === 'l')  return { valeur: v, unite: 'L' };
  if (m[2] === 'ml') return { valeur: v / 1000, unite: 'L' };
  if (m[2] === 'cl') return { valeur: v / 100, unite: 'L' };
  return null;
}
/* Un total propre : 0,5 kg, 6 L, 1,25 kg. */
function ecrireMesure(valeur, unite) {
  const arrondi = Math.round(valeur * 1000) / 1000;
  return String(arrondi).replace('.', ',') + ' ' + unite;
}

/* ---------- Endroits ---------- */
/* « Pas encore rangé » (on) : les endroits font place à la seule quantité. « Choisir un endroit » (off) : l'inverse. */
function pasEncoreRange(on) {
  montrer('bloc-ranger', !on); montrer('bloc-transit', on);
  if (on) { $('qte-transit').value = '1'; $('qte-transit').focus(); }
}
/* Pièce -> Meuble -> Espace : les trois listes d'un endroit. Les mêmes partout (fiche, corriger un endroit). */
function htmlChoixEndroit() {
  return '<div class="bloc"><div class="label">Pièce</div><select class="champ piece"></select></div>' +
    '<div class="bloc"><div class="label">Meuble</div><select class="champ meuble"></select></div>' +
    '<div class="bloc"><div class="label">Espace</div><select class="champ espace"></select></div>';
}
/* Branche les trois listes d'une carte d'endroit (row) et les place sur pref s'il y en a un. */
function brancherEndroit(row, pref) {
  const piece = row.querySelector('.piece');
  const meuble = row.querySelector('.meuble');
  const espace = row.querySelector('.espace');
  piece.innerHTML = options(PIECES, '— Pièce —');
  meuble.innerHTML = '<option value="">—</option>';
  espace.innerHTML = '<option value="">—</option>';

  piece.onchange = () => {
    const mbs = MEUBLES.filter(m => String(m.pieceId) === String(piece.value));
    meuble.innerHTML = mbs.length ? options(mbs, '— Meuble —') : '<option value="">(aucun meuble)</option>';
    espace.innerHTML = '<option value="">—</option>';
    row.classList.remove('endroit-meuble'); row.style.borderLeftColor = '';
  };

  meuble.onchange = () => {
    const mid = meuble.value;
    const esp = ESPACES[mid] || [];
    espace.innerHTML = esp.length ? options(esp, '— Espace —') : '<option value="">(directement sur le meuble)</option>';
    const m = MEUBLES.find(x => x.id === mid);
    const couleur = m ? couleurDe(m.couleur) : '';   // la couleur est une DONNÉE ; l'épaisseur du filet vit dans le CSS
    row.classList.toggle('endroit-meuble', !!couleur);
    row.style.borderLeftColor = couleur;
  };

  if (pref) {                                  // pré-remplir un endroit (tout reste modifiable)
    if (pref.pieceId)  { piece.value  = String(pref.pieceId);  piece.onchange(); }
    if (pref.meubleId) { meuble.value = String(pref.meubleId); meuble.onchange(); }
    if (pref.espaceId) { espace.value = String(pref.espaceId); }
  }
}
function ajouterEndroit(pref) {
  const row = document.createElement('div');
  row.className = 'endroit carte';
  row.innerHTML = htmlChoixEndroit() +
    '<div class="bloc"><div class="label">Quantité</div><input class="champ qte" type="text" inputmode="numeric" pattern="[0-9]*" value="1"></div>' +
    '<button class="bouton bouton-petit retirer" type="button">Retirer</button>';
  row.querySelector('.retirer').onclick = () => { if ($('endroits').children.length > 1) row.remove(); };
  $('endroits').appendChild(row);
  brancherEndroit(row, pref);
  if (pref && pref.qte !== undefined) row.querySelector('.qte').value = pref.qte;
}

/* La date d'AUJOURD'HUI, ici (Québec). Surtout pas toISOString() : elle donne l'heure de
   Londres, donc le lendemain pour toute entrée faite après 20 h chez nous. */
function dateDuJour() {
  const d = new Date(), deuxChiffres = n => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + deuxChiffres(d.getMonth() + 1) + '-' + deuxChiffres(d.getDate());
}

/* ---------- Enregistrer ---------- */
function statut(txt, type) {
  const m = $('msg');
  m.className = 'message' + (type ? ' message-' + type : '');
  m.textContent = txt;
}

async function enregistrer() {
  const nom = $('nom').value.trim();
  if (!nom) { statut('Donne un nom au produit.', 'erreur'); return; }
  const existant = trouverProduitParNom(nom);
  let produitId = produitCourant || (existant ? existant.id : null);   // le produit choisi dans la liste fait foi
  const nouveau = !produitId;
  let scid = '';
  if (nouveau) {
    scid = $('souscat').value;
    if (scid === 'neuve') { statut('Nomme la nouvelle sous-catégorie, puis touche Ajouter.', 'erreur'); return; }
    if (!scid) { statut('Choisis une catégorie et une sous-catégorie.', 'erreur'); return; }
  }

  const endroits = [];
  if (!$('bloc-transit').hidden) {                     // « Pas encore rangé » : compté, sans endroit (en transit)
    const qte = parseInt($('qte-transit').value, 10) || 0;
    if (qte <= 0) { statut('Mets une quantité.', 'erreur'); return; }
    endroits.push({ emp: '', qte: qte });
  } else {
    [...$('endroits').children].forEach(row => {
      const mid = row.querySelector('.meuble').value;
      const eid = row.querySelector('.espace').value;
      const qte = parseInt(row.querySelector('.qte').value, 10) || 0;
      if (mid && qte > 0) endroits.push({ emp: eid || mid, qte: qte });   // qté vide/0 = pas rangé ici
    });
    if (!endroits.length) { statut('Mets une quantité sur au moins un endroit.', 'erreur'); return; }
  }

  Object.keys(CHOIX_FICHE).forEach(ch => { if ($(ch).value === 'neuve' && !ajouterChoix(ch)) $(ch).value = ''; });   // un nom tapé sans toucher Ajouter compte quand même
  let marque = $('marque').value, saveur = $('saveur').value, magasin = $('magasin').value;   // des ID des listes gérées
  const format = formatSaisi(), code = $('codebarres').value.trim(), prix = $('prix').value.trim();
  const nouveaux = LISTES_NEUVES.slice();              // les noms ajoutés à la fiche : créés par le même appel
  const qui = localStorage.getItem(QUI) || '';        // posé une fois dans Outils, gardé sur l'appareil
  if (!opCourant) opCourant = 'op-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  statut('Enregistrement…');
  $('btn-enregistrer').disabled = true;
  montrerVoile(true);
  try {
    const commun = { marque: marque, format: format, saveur: saveur, code: code, magasin: magasin, prix: prix,
                     qui: qui, endroits: endroits, opId: opCourant, nouveaux: nouveaux };
    const charge = nouveau
      ? Object.assign({ produit: [nom, scid] }, commun)
      : Object.assign({ produitId: produitId }, commun);
    const r = await Coffre.entrerArticle(charge);          // UN seul appel
    let ids = [];                                          // les ID des lignes créées : on peut les consommer sans relire
    if (r && r.ok) {
      produitId = r.produitId || produitId; ids = r.ids || [];
      const fin = confirmerNeuves(nouveaux, r.listes || {});   // un nom qui existait déjà (l'autre appareil) : son ID à lui
      marque = fin(marque); saveur = fin(saveur); magasin = fin(magasin);
    }
    else if (r && r.erreur === 'action inconnue') {        // repli si coffre-fort pas encore à jour
      if (nouveau) { const p = await Coffre.ajouter('Produits', ['', nom, scid, '', 'O', '', '']); if (!p.ok) throw new Error(p.erreur || 'refus'); produitId = p.id; }
      const date = dateDuJour();
      for (const e of endroits) await Coffre.ajouter('Stock', ['', produitId, e.emp, e.qte, date, marque, e.format || format, opCourant, code, saveur, qui, magasin, prix]);
    } else { throw new Error((r && r.erreur) || 'refus'); }
    if (nouveau) {
      PRODUITS.push({ id: produitId, nom: nom, catId: scid });
      const c = lireCache(); if (c) { (c.prods = c.prods || []).push([produitId, nom, scid, '', 'O', '', '']); ecrireCache(c); }
      remplirProduitsDatalist();                          // le nouveau nom devient suggérable tout de suite
    }
    const dateJour = dateDuJour();
    endroits.forEach((x, i) => {                              // l'inventaire est à jour sans recharger
      const ligne = [ids[i] || '', produitId, x.emp, x.qte, dateJour, marque, x.format || format, opCourant, code, saveur, qui, magasin, prix];
      STOCK.push(ligne);
      const c2 = lireCache(); if (c2) { (c2.stock = c2.stock || []).push(ligne.slice()); ecrireCache(c2); }
    });
    memoriserVariante(produitId, marque, format, endroits, saveur);   // marque/saveur/format/emplacements à jour tout de suite
    opCourant = null;                                      // succès : le prochain article aura un nouveau jeton
    statut('Article ajouté ✓', 'succes');
    reinit();
  } catch (e) {
    statut('Échec : ' + e.message, 'erreur');
  } finally { $('btn-enregistrer').disabled = false; montrerVoile(false); }
}

function reinit() { reinitFiche(); $('codebarres').value = ''; codeScan = ''; }

/* ---------- Ajouter un meuble (Outils → Gérer les bases) ---------- */
async function enregistrerMeuble() {
  const nom = $('meuble-nom').value.trim();
  const msg = $('meuble-msg');
  if (!nom) { msg.className = 'message message-erreur'; msg.textContent = 'Donne un nom au meuble.'; return; }
  const couleur = couleurNouveau;               // un numéro de la palette
  const pieceId = $('meuble-piece').value;   // vide = « Meubles sans pièce »
  msg.className = 'message'; msg.textContent = 'Enregistrement…';
  $('btn-meuble-enr').disabled = true;
  montrerVoile(true);
  try {
    // Emplacements : ID · Nom · ParentID (la pièce; vide = sans pièce) · SecteurID · Actif · Couleur
    const r = await Coffre.ajouter('Emplacements', ['', nom, pieceId, SECTEUR_ID, 'O', couleur]);
    if (!r || !r.ok) throw new Error((r && r.erreur) || 'refus');
    MEUBLES.push({ id: r.id, nom: nom, couleur: couleur, pieceId: pieceId });   // dispo tout de suite dans l'entrée
    const c = lireCache(); if (c) { (c.emps = c.emps || []).push([r.id, nom, pieceId, SECTEUR_ID, 'O', couleur]); ecrireCache(c); }
    msg.className = 'message message-succes'; msg.textContent = 'Meuble ajouté ✓';
    $('meuble-nom').value = ''; $('meuble-piece').value = '';   // le suivant repart à zéro
  } catch (e) {
    msg.className = 'message message-erreur'; msg.textContent = 'Échec : ' + e.message;
  } finally { $('btn-meuble-enr').disabled = false; montrerVoile(false); }
}

/* Assigner (ou retirer) la pièce d'un meuble = changer son ParentID. */
async function assignerPiece(meubleId, pieceId, sel) {
  const m = MEUBLES.find(x => String(x.id) === String(meubleId));
  if (!m) return;
  sel.disabled = true;
  montrerVoile(true);
  try {
    const r = await Coffre.modifier('Emplacements', meubleId, [meubleId, m.nom, pieceId || '', SECTEUR_ID, 'O', m.couleur || '']);
    if (!r || !r.ok) throw new Error((r && r.erreur) || 'refus');
    m.pieceId = pieceId || '';
    const c = lireCache(); if (c && c.emps) { const row = c.emps.find(x => String(x[0]) === String(meubleId)); if (row) row[2] = pieceId || ''; ecrireCache(c); }
  } catch (e) {
    sel.value = m.pieceId || '';   // échec : on remet l'ancienne valeur
  } finally { sel.disabled = false; montrerVoile(false); }
}

/* Liste des meubles (accordéons, à leur couleur) + leurs espaces, dans « Gérer les bases ». */
function optionsPieces(sel) {
  return '<option value="">— Sans pièce —</option>' + PIECES.map(function (p) {
    return '<option value="' + esc(p.id) + '"' + (String(p.id) === String(sel) ? ' selected' : '') + '>' + esc(p.nom) + '</option>';
  }).join('');
}
/* La couleur d'une pièce ou d'un meuble : un NUMÉRO de la palette (« 305 »). Autre chose -> ''. */
function numeroCouleur(v) {
  const s = String(v == null ? '' : v).trim();
  return /^\d{3}$/.test(s) ? s : '';
}
/* La teinte à peindre, en code hex (celle de la palette en ce moment). */
function couleurDe(v) {
  const n = numeroCouleur(v);
  return n ? couleurActuelle('couleur-' + n) : '';   // plus aucun code hex dans le Sheet (converti le 2026-09-30)
}
/* Une couleur de meuble est-elle PÂLE ? Sert à choisir la couleur du texte par-dessus :
   du crème sur un fond foncé, du brun foncé sur un fond pâle. Sans ça, un meuble
   pâle (Hotte, Frigo…) affiche du crème sur du crème — le nom disparaît.
   On pèse le vert plus que le rouge et le bleu, parce que l'œil y est plus sensible. */
function couleurPale(couleur) {
  const h = String(couleur || '').trim().replace('#', '');
  if (h.length !== 3 && h.length !== 6) return false;     // couleur illisible : on garde le crème
  const plein = h.length === 3 ? h[0] + h[0] + h[1] + h[1] + h[2] + h[2] : h;
  const r = parseInt(plein.slice(0, 2), 16);
  const v = parseInt(plein.slice(2, 4), 16);
  const b = parseInt(plein.slice(4, 6), 16);
  if (isNaN(r) || isNaN(v) || isNaN(b)) return false;
  return (0.299 * r + 0.587 * v + 0.114 * b) > 150;       // 150 sur 255 : le seuil à ajuster
}

/* Les flèches ↑↓ d'une ligne (dessinées dans le CSS). La 1re ne monte pas, la dernière ne descend pas. */
function fleches(type, id, i, n) {
  const b = (sens, cls, eteinte, nom) => '<button class="fleche ' + cls + (eteinte ? ' fleche-eteinte' : '') +
    '" type="button" data-type="' + type + '" data-id="' + esc(id) + '" data-sens="' + sens + '" aria-label="' + nom + '"></button>';
  return '<span class="fleches">' + b(-1, 'fleche-haut', i === 0, 'Monter') + b(1, 'fleche-bas', i === n - 1, 'Descendre') + '</span>';
}
/* Un espace = une ligne, avec ses flèches. i = sa place parmi les espaces du meuble (groupe). */
function htmlEspace(e, i, groupe) {
  return '<div class="accordeon-item" data-type="e" data-id="' + esc(e.id) + '">' +
    '<span>' + esc(e.nom) + '</span>' + crayon('e:' + e.id) + fleches('e', e.id, i, groupe.length) + '</div>';
}
/* Un meuble = accordéon (à sa couleur) : menu Pièce + ses espaces + « + un espace ». */
function htmlMeuble(m, i, groupe) {
  const liste = ESPACES[m.id] || [];
  const espaces = liste.map(htmlEspace).join('');
  const teinte = couleurDe(m.couleur);
  const style = teinte ? ' style="--c:' + esc(teinte) + '"' : '';   // la couleur est une DONNÉE ; le relief la suit
  const pale = (teinte && couleurPale(teinte)) ? ' tete-pale' : '';
  return '<div class="accordeon" data-type="m" data-id="' + esc(m.id) + '">' +
    '<div class="accordeon-tete' + pale + '"' + style + '><span>' + esc(m.nom) + '</span>' + crayon('e:' + m.id) + fleches('m', m.id, i, groupe.length) + '</div>' +
    '<div class="accordeon-corps" hidden>' +
      '<div class="bloc accordeon-bloc"><div class="label">Pièce</div>' +
        '<select class="champ choix-piece" data-meuble="' + esc(m.id) + '">' + optionsPieces(m.pieceId) + '</select></div>' +
      espaces +
      '<div class="accordeon-item accordeon-item-saisie">' +
        '<input class="champ espace-nouveau" placeholder="Nouvel espace…">' +
        '<button class="bouton bouton-petit ajout-espace" data-meuble="' + esc(m.id) + '" type="button">+</button>' +
      '</div>' +
    '</div>' +
  '</div>';
}
/* La barre d'une pièce prend sa couleur (une DONNÉE, comme celle d'un meuble); sans couleur, elle reste brune.
   Posée sur la TÊTE seulement (--c) : jamais --meuble, qui descendrait jusqu'aux meubles de la pièce. */
function teintePiece(p) {
  const teinte = p ? couleurDe(p.couleur) : '';
  return { style: teinte ? ' style="--c:' + esc(teinte) + '"' : '', pale: (teinte && couleurPale(teinte)) ? ' tete-pale' : '' };
}

/* ---------- Gérer les bases → Pièces (la porte) — décisions de J-C, 2026-09-30, sur aperçu ----------
   Une barre par pièce, à sa couleur : le crayon (renommer), les flèches (l'ordre), et, touchée, sa palette dessous.
   Une pastille touchée = la couleur, enregistrée tout de suite en arrière-plan (pas de bouton).
   On ne retire pas de pièce (J-C). Ajouter : au bas, sur la page même. */
function remplirPieces() {
  const ouverte = $('liste-pieces').querySelector('.accordeon-tete.ouvert');
  const idOuvert = ouverte ? ouverte.parentElement.dataset.id : '';
  $('liste-pieces').innerHTML = PIECES.map((p, i) => {
    const t = teintePiece(p), ouvert = String(p.id) === idOuvert;
    return '<div class="accordeon" data-type="p" data-id="' + esc(p.id) + '">' +
      '<div class="accordeon-tete' + t.pale + (ouvert ? ' ouvert' : '') + '"' + t.style + '><span>' + esc(p.nom) + '</span>' +
        crayon('e:' + p.id) + fleches('p', p.id, i, PIECES.length) + '</div>' +
      '<div class="accordeon-corps"' + (ouvert ? '' : ' hidden') + '><div class="palette">' + htmlPalette(numeroCouleur(p.couleur)) + '</div></div></div>';
  }).join('') || '<div class="accordeon-item"><span class="texte-petit texte-pale">Aucune pièce.</span></div>';
}
async function montrerPieces() {
  toutCacher(); $('vue-pieces').hidden = false; $('btn-burger').hidden = false;
  $('liste-pieces').innerHTML = '';                // on arrive : tout fermé
  $('piece-nouvelle').value = ''; $('pieces-msg').className = 'message message-repli'; $('pieces-msg').textContent = '';
  if (!PIECES.length && !MEUBLES.length) {         // pas encore chargé → on charge (même patron que les bases)
    $('liste-pieces').innerHTML = '<div class="texte-petit texte-pale">Chargement…</div>';
    await chargerReferences();
    $('liste-pieces').innerHTML = '';
  }
  remplirPieces();
  expedierOrdre(); expedierCouleurs();             // ce qui attendait repart
}
/* Une pastille touchée : la barre change tout de suite, l'envoi part en arrière-plan (même chemin que la page Couleurs). */
function choisirCouleurPiece(id, num) {
  const p = PIECES.find(x => String(x.id) === String(id));
  if (!p) return;
  p.couleur = num;
  couleursModif.meubles[id] = num;                 // pièces et meubles : la même colonne Couleur d'Emplacements
  envoyerCouleurs();
  remplirPieces();
}
/* Ajouter une pièce : le nom, puis Ajouter (ou Entrée). Un nom déjà pris ne crée rien.
   Un échec relit la réserve : si la pièce a été créée quand même, elle paraît, et le 2e essai ne la double pas. */
async function ajouterPiece() {
  const champ = $('piece-nouvelle'), msg = $('pieces-msg'), btn = $('btn-piece-ajouter');
  const nom = champ.value.trim();
  msg.className = 'message message-repli'; msg.textContent = '';
  if (!nom || btn.disabled) return;
  const deja = PIECES.find(p => cleNom(p.nom) === cleNom(nom));
  if (deja) { msg.className = 'message message-repli message-erreur'; msg.textContent = '« ' + deja.nom + ' » existe déjà.'; return; }
  btn.disabled = true; montrerVoile(true);
  try {
    // Emplacements : ID · Nom · ParentID (le SECTEUR : c'est une pièce) · SecteurID · Actif · Couleur
    const r = await Coffre.ajouter('Emplacements', ['', nom, SECTEUR_ID, SECTEUR_ID, 'O', '']);
    if (!r || !r.ok) throw new Error((r && r.erreur) || 'refus');
    PIECES.push({ id: r.id, nom: nom, couleur: '' });
    const c = lireCache(); if (c) { (c.emps = c.emps || []).push([r.id, nom, SECTEUR_ID, SECTEUR_ID, 'O', '']); ecrireCache(c); }
    champ.value = '';
    remplirPieces();
  } catch (e) {
    msg.className = 'message message-repli message-erreur'; msg.textContent = 'Pièce pas ajoutée — réessaie.';
    chargerReferences().then(() => { if (!$('vue-pieces').hidden) remplirPieces(); });
  } finally { btn.disabled = false; montrerVoile(false); }
}

/* « Gérer les bases » : les pièces en accordéon → leurs meubles (accordéon) → espaces.
   garderOuverts : après un déplacement, les accordéons ouverts le restent. */
function remplirMeubles(garderOuverts) {
  const ouverts = garderOuverts
    ? [...$('liste-meubles').querySelectorAll('.accordeon-tete.ouvert')].map(t => t.parentElement.dataset.type + ':' + t.parentElement.dataset.id)
    : [];
  let html = '';
  const nonRanges = MEUBLES.filter(function (m) { return !m.pieceId; });
  if (nonRanges.length) {
    html += '<div class="accordeon" data-type="r" data-id=""><div class="accordeon-tete">Meubles sans pièce (' + nonRanges.length + ')</div>' +
      '<div class="accordeon-corps" hidden>' + nonRanges.map(htmlMeuble).join('') + '</div></div>';
  }
  html += PIECES.map(function (p, i) {
    const meubles = MEUBLES.filter(function (m) { return String(m.pieceId) === String(p.id); });
    const contenu = meubles.length ? meubles.map(htmlMeuble).join('')
                                   : '<div class="accordeon-item"><span class="texte-petit texte-pale">Aucun meuble</span></div>';
    const t = teintePiece(p);
    return '<div class="accordeon" data-type="p" data-id="' + esc(p.id) + '"><div class="accordeon-tete' + t.pale + '"' + t.style + '><span>' + esc(p.nom) + '</span>' + crayon('e:' + p.id) +
      fleches('p', p.id, i, PIECES.length) + '</div>' +
      '<div class="accordeon-corps" hidden>' + contenu + '</div></div>';
  }).join('');
  $('liste-meubles').innerHTML = html || '<div class="texte-petit texte-pale">Aucune pièce ni meuble.</div>';
  $('liste-meubles').querySelectorAll('.accordeon').forEach(function (a) {
    if (ouverts.indexOf(a.dataset.type + ':' + a.dataset.id) === -1) return;
    a.firstElementChild.classList.add('ouvert');
    a.children[1].hidden = false;
  });
}

/* ---------- Corriger un nom (Gérer les bases) : le crayon ----------
   Tout est relié par identifiant : corriger un nom ici le corrige partout (inventaire, anciennes entrées, listes).
   Clé = type + id : « e » pièce/meuble/espace (Emplacements) · « c » catégorie · « a » aliment (Produits)
   · « g » magasin · « q » marque · « v » saveur (les listes gérées). Chaque type : [onglet, ses lignes dans le cache]. */
const TABLES_NOM = { e: ['Emplacements', c => c.emps], c: ['Categories', c => c.cats], a: ['Produits', c => c.prods],
                     g: ['Magasins', c => (c.listes || {}).Magasins], q: ['Marques', c => (c.listes || {}).Marques], v: ['Saveurs', c => (c.listes || {}).Saveurs] };
function crayon(cle) {
  return '<button class="crayon" type="button" data-renommer="' + esc(cle) + '" aria-label="Corriger le nom"></button>';
}
/* Les objets en mémoire qui portent ce nom (pour que tout l'écran suive tout de suite). */
function objetsNommes(type) {
  if (type === 'e') return PIECES.concat(MEUBLES, ...Object.values(ESPACES));
  if (type === 'c') return RAYONS.concat(...Object.values(SOUSCATS));
  if (type === 'a') return PRODUITS;
  return LISTES[TABLES_NOM[type][0]] || [];
}
function rafraichirBases() { remplirMeubles(true); remplirNoms(true); if (!$('vue-pieces').hidden) remplirPieces(); }
/* « Enregistrer l'ordre » : un bouton sur Gérer les bases, un sur Pièces — le même geste. */
function montrerOrdre(on) { montrer('btn-ordre', on); montrer('btn-ordre-pieces', on); }
/* Le crayon touché : le nom devient un champ. Entrée ou toucher ailleurs = enregistrer; Échap = laisser tel quel. */
function ouvrirRenommer(btn) {
  const span = btn.previousElementSibling;
  const input = document.createElement('input');
  input.className = 'champ champ-renommer';
  input.value = span.textContent;
  input.setAttribute('autocomplete', 'off');
  span.replaceWith(input);
  btn.hidden = true;
  input.focus(); input.select();
  let fini = false;
  const finir = ok => { if (fini) return; fini = true; if (ok) renommer(btn.dataset.renommer, input.value); else rafraichirBases(); };
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); finir(true); } else if (e.key === 'Escape') finir(false); });
  input.addEventListener('blur', () => finir(true));
  input.addEventListener('click', e => e.stopPropagation());   // toucher le champ ne plie pas l'accordéon
}
async function renommer(cle, nom) {
  const type = cle.charAt(0), id = cle.slice(2), T = TABLES_NOM[type];
  nom = String(nom || '').trim();
  const c = lireCache();
  const rows = c && T[1](c), row = rows && rows.find(r => String(r[0]) === String(id));
  if (!nom || !row || String(row[1]) === nom) { rafraichirBases(); return; }   // vide ou inchangé : rien à faire
  const liste = LISTES[T[0]];
  const autre = liste && liste.find(y => String(y.id) !== String(id) && cleNom(y.nom) === cleNom(nom));
  if (autre) { demanderReunion(cle, autre); return; }   // ce nom existe déjà dans la liste : les réunir ?
  const ligne = row.slice(); ligne[1] = nom;
  montrerVoile(true);
  try {
    const r = await Coffre.modifier(T[0], id, ligne);          // réécrit la même ligne : un 2e envoi ne change rien
    if (!r || !r.ok) throw new Error((r && r.erreur) || 'refus');
    row[1] = nom; ecrireCache(c);
    objetsNommes(type).forEach(x => { if (String(x.id) === String(id)) x.nom = nom; });
    if (liste) NOMS_LISTES[String(id)] = nom;
    remplirListes();
  } catch (e) {
    avis('Nom pas corrigé — réessaie', 'erreur');
  } finally { montrerVoile(false); rafraichirBases(); }
}
/* Un magasin, une marque ou une saveur renommé comme un autre qui existe déjà (« Libertee » -> « Liberté ») :
   on propose de les RÉUNIR. Oui : tout ce qui était sous l'un passe sous l'autre (coffre-fort, action reunir). Non : rien ne change. */
function demanderReunion(cle, autre) {
  const btn = [...$('liste-noms').querySelectorAll('.crayon')].find(b => b.dataset.renommer === cle);
  const item = btn && btn.closest('.accordeon-item');
  if (!item) { rafraichirBases(); return; }
  item.innerHTML = '<span>« ' + esc(autre.nom) + ' » existe déjà : les réunir ?</span>' +
    '<button class="bouton bouton-petit bouton-vert" type="button" data-reunir="' + esc(cle + '|' + autre.id) + '">Oui</button>' +
    '<button class="bouton bouton-petit" type="button" data-reunir-non>Non</button>';
}
async function reunirNoms(val) {
  const k = String(val).split('|'), cle = k[0], garde = k[1], T = TABLES_NOM[cle.charAt(0)], perdu = cle.slice(2);
  montrerVoile(true);
  try {
    const r = await Coffre.reunir({ liste: T[0], garde: garde, perdu: perdu });
    if (!r || !r.ok) throw new Error((r && r.erreur) || 'refus');
    await chargerReferences();                          // l'inventaire, les « Pas aimé », les listes : on relit, c'est plus sûr
    avis('Réunis', 'succes');
  } catch (e) {
    avis('Pas réunis — réessaie', 'erreur');
  } finally { montrerVoile(false); rafraichirBases(); }
}
/* ---------- Corriger l'endroit d'un lot, ou ranger ce qui n'est pas encore rangé ----------
   Un lot = ce que l'Inventaire montre sur une ligne : aliment + marque + saveur, à un endroit.
   Déjà rangé : le crayon CORRIGE une erreur de saisie (tablette 2 au lieu de 3) -> TOUT le lot bouge.
   Pas encore rangé (endroit vide, « en transit ») : le crayon RANGE, avec une quantité -> le reste attend.
   Déplacer une partie d'un lot déjà rangé : le bouton Déplacer du menu (ouvrirDeplacement), qui passe aussi par deplacerLot(). */
var LOTS = {};                                        // { produitId: [lot…] }, refait à chaque dessin d'une liste
function lotsParProduit() {
  const par = {};
  STOCK.forEach(l => {
    const emp = String(l[2] || ''), qte = Number(l[3]) || 0;
    if (qte <= 0) return;                             // vide : rien à montrer
    const pid = String(l[1]);
    const marque = String(l[5] || '').trim(), saveur = String(l[9] || '').trim(), format = String(l[6] || '').trim();
    const lots = (par[pid] = par[pid] || []);
    let lot = lots.find(x => x.emp === emp && x.marque === marque && x.saveur === saveur);
    if (!lot) lots.push(lot = { pid: pid, emp: emp, marque: marque, saveur: saveur, formats: [], qte: 0, lignes: [] });
    lot.qte += qte;
    if (format && lot.formats.indexOf(format) === -1) lot.formats.push(format);
    lot.lignes.push(String(l[0]));                    // les lignes de STOCK du lot, par ID
  });
  Object.keys(par).forEach(pid => par[pid].sort((a, b) => libelleEndroit(a.emp).localeCompare(libelleEndroit(b.emp), 'fr')));
  return par;
}
/* « Cuisine · Frigo · Tablette 2 » — le dernier mot seul si on le veut court. */
function libelleEndroit(emp, court) {
  if (!emp) return 'Pas encore rangé';
  const r = resoudreEmp(emp);
  if (!r) return 'Endroit disparu';
  const nom = (liste, id) => { const x = liste.find(y => String(y.id) === String(id)); return x ? x.nom : ''; };
  const esp = r.espaceId ? nom(ESPACES[r.meubleId] || [], r.espaceId) : '';
  if (court) return esp || nom(MEUBLES, r.meubleId);
  return [nom(PIECES, r.pieceId), nom(MEUBLES, r.meubleId), esp].filter(Boolean).join(' · ');
}
/* Une ligne de lot avec son crayon. titre = ce qui s'écrit en gros (l'endroit sous un aliment, l'aliment dans « Pas encore rangé »). */
function htmlLot(pid, i, l, titre) {
  const detail = [nomListe(l.marque), nomListe(l.saveur), l.formats.join(' + ')].filter(Boolean).join(' · ');
  const nom = l.emp ? 'Corriger l\'endroit' : 'Ranger';
  return '<div class="item"><div class="item-info"><div class="item-nom">' + esc(titre || libelleEndroit(l.emp)) + '</div>' +
    (detail ? '<div class="item-detail">' + esc(detail) + '</div>' : '') + '</div>' +
    '<span class="item-quantite">' + esc(l.qte) + '</span>' +
    '<button class="crayon" type="button" data-lot="' + esc(pid) + '|' + i + '" aria-label="' + nom + '"></button></div>';
}
/* « Pas encore rangé », en tête de l'Inventaire : n'apparaît que s'il y a quelque chose. */
function htmlPasEncoreRange() {
  const lignes = [];
  PRODUITS.forEach(p => (LOTS[p.id] || []).forEach((l, i) => { if (!l.emp) lignes.push({ nom: p.nom, html: htmlLot(p.id, i, l, p.nom) }); }));
  if (!lignes.length) return '';
  lignes.sort((a, b) => String(a.nom).localeCompare(String(b.nom), 'fr'));
  return '<div class="accordeon" data-transit><div class="accordeon-tete">Pas encore rangé</div>' +
    '<div class="accordeon-corps" hidden>' + lignes.map(x => x.html).join('') + '</div></div>';
}
/* Le crayon d'un lot : la ligne devient la carte d'endroit de la fiche.
   Déjà rangé : placée sur l'endroit actuel. Pas encore rangé : vierge, avec la quantité (le total d'avance).
   Un autre endroit choisi -> la question; Oui fait le geste, Non laisse tout tel quel. */
function ouvrirLot(btn) {
  const k = btn.dataset.lot.split('|'), lot = (LOTS[k[0]] || [])[Number(k[1])];
  if (!lot) return;
  const ranger = !lot.emp;
  const carte = document.createElement('div');
  carte.className = 'endroit carte';
  carte.innerHTML = htmlChoixEndroit() +
    (ranger ? '<div class="bloc"><div class="label">Quantité</div><input class="champ qte" type="text" inputmode="numeric" pattern="[0-9]*" value="' + esc(lot.qte) + '"></div>' : '') +
    '<div class="message"></div>' +
    '<div class="grille"><button class="bouton bouton-petit bouton-vert lot-oui" type="button" hidden>Oui</button>' +
    '<button class="bouton bouton-petit lot-non" type="button">Non</button></div>';
  btn.closest('.item').replaceWith(carte);
  brancherEndroit(carte, resoudreEmp(lot.emp));
  const cible = () => carte.querySelector('.espace').value || carte.querySelector('.meuble').value;
  const combien = () => ranger ? (parseInt(carte.querySelector('.qte').value, 10) || 0) : lot.qte;
  const question = () => {
    const emp = cible(), q = combien(), m = carte.querySelector('.message'), oui = carte.querySelector('.lot-oui');
    const ok = !!emp && emp !== lot.emp && q > 0 && q <= lot.qte;
    const a = resoudreEmp(lot.emp), b = resoudreEmp(emp);
    const court = !!(a && b && a.meubleId === b.meubleId);   // même meuble : « Tablette 2 vers Tablette 3 » suffit
    const les = q > 1 ? 'les ' + q : 'le ' + q;
    m.className = 'message';
    if (ranger && q > lot.qte) { m.className = 'message message-erreur'; m.textContent = 'Il y en a ' + lot.qte + ' à ranger.'; }
    else if (!ok) m.textContent = '';
    else if (ranger) m.textContent = 'Ranger ' + les + ' à ' + libelleEndroit(emp) + ' ?' + (q < lot.qte ? ' (' + (lot.qte - q) + ' attendront)' : '');
    else m.textContent = 'Déplacer ' + les + ' de ' + libelleEndroit(lot.emp, court) + ' vers ' + libelleEndroit(emp, court) + ' ?';
    oui.hidden = !ok;
  };
  carte.addEventListener('change', question);
  carte.addEventListener('input', question);           // la quantité : la question suit pendant la saisie
  carte.querySelector('.lot-non').onclick = redessinerLots;
  carte.querySelector('.lot-oui').onclick = () => deplacerLot(lot, cible(), combien());
  question();
}
function redessinerLots() { rafraichirBases(); remplirInventaire(); }
/* Une date lue du Sheet peut revenir en format long (2026-09-23T04:00:00.000Z) : on la réécrit comme à l'entrée. */
function dateCourte(v) {
  const t = String(v || '');
  if (!/^\d{4}-\d{2}-\d{2}T/.test(t)) return v;
  return new Date(t).toLocaleDateString('en-CA', { timeZone: 'America/Toronto' });   // AAAA-MM-JJ, heure du Québec
}
/* Porte q du lot vers emp — INSTANTANÉ (J-C) : la mémoire change tout de suite, l'envoi part dans la file des gestes.
   Une ligne qui entre au complet : on réécrit son endroit. Une ligne coupée en deux (déplacer ou ranger une partie) :
   la ligne d'origine garde le reste, la part qui part devient une ligne neuve (ID donné ici) qui GARDE sa date
   d'entrée — un aliment ne rajeunit pas en changeant de tablette (« le plus vieux d'abord » reste juste). */
async function deplacerLot(lot, emp, q, fin) {
  const parDeplacer = !!fin;                          // Déplacer (menu) décide lui-même de la suite
  fin = fin || redessinerLots;
  if (!emp || emp === lot.emp || !(q > 0)) { fin(false); return; }
  const rate = (parDeplacer ? 'Pas déplacé' : !lot.emp ? 'Pas rangé' : 'Endroit pas corrigé') + ' — réessaie';
  if (lot.lignes.some(id => !id)) {                   // filet : une ligne sans ID (ne devrait plus arriver) -> on relit d'abord
    montrerVoile(true);
    const lu = await chargerReferences();
    montrerVoile(false);
    lot = lu ? (lotsParProduit()[lot.pid] || []).find(x => x.emp === lot.emp && x.marque === lot.marque && x.saveur === lot.saveur) : null;
    if (!lot || lot.lignes.some(id => !id)) { avis(rate, 'erreur'); fin(false); return; }
    q = Math.min(q, lot.qte);
  }
  const op = 'dep-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  const modifs = [], ajouts = [];
  let reste = q;
  for (const id of lot.lignes) {
    if (reste <= 0) break;
    const row = STOCK.find(r => String(r[0]) === id);
    if (!row || String(row[2]) === emp) continue;
    const qte = Number(row[3]) || 0;
    if (qte <= 0) continue;
    const ligne = row.slice(); ligne[4] = dateCourte(ligne[4]);
    if (qte <= reste) { ligne[2] = emp; reste -= qte; }   // toute la ligne va à l'endroit
    else {                                             // la ligne se coupe : « reste » part, le reste attend
      ligne[3] = qte - reste;
      ajouts.push([idLocal(), row[1], emp, reste, ligne[4], row[5], row[6], op, row[8], row[9], row[10], row[11], row[12]]);
      reste = 0;
    }
    modifs.push({ id: id, ligne: ligne });
  }
  if (modifs.length) poserGeste({ action: 'deplacer', opId: op, modifs: modifs, ajouts: ajouts });
  fin(true);
}
/* Catégories et Aliments, sous les pièces : chaque nom avec son crayon. */
function remplirNoms(garderOuverts) {
  const liste = $('liste-noms');
  const ouverts = garderOuverts ? [...liste.querySelectorAll('.accordeon-tete.ouvert')].map(t => t.parentElement.dataset.cle) : [];
  const acc = (cle, tete, corps) => '<div class="accordeon" data-cle="' + esc(cle) + '"><div class="accordeon-tete">' + tete + '</div><div class="accordeon-corps" hidden>' + corps + '</div></div>';
  const ligne = (cle, nom) => '<div class="accordeon-item"><span>' + esc(nom) + '</span>' + crayon(cle) + '</div>';
  const pasAime = p => PAS_AIMES.filter(r => String(r[1]) === String(p.id)).map(r => {
    const m = String(r[2] || '').trim(), sv = String(r[3] || '').trim();
    return '<div class="accordeon-item"><span>Pas aimé : ' + esc([nomListe(m), nomListe(sv)].filter(Boolean).join(' ') || p.nom) + '</span>' +
      '<button class="bouton bouton-petit" type="button" data-pas-aime="' + esc(p.id + '|' + m + '|' + sv) + '">Enlever</button></div>';
  }).join('');
  const aliment = p => ligne('a:' + p.id, p.nom) + htmlOrdreEndroits(p.id) + pasAime(p);
  const vide = t => '<div class="accordeon-item"><span class="texte-petit texte-pale">' + t + '</span></div>';
  const cats = RAYONS.map(r => acc('c:' + r.id, '<span>' + esc(r.nom) + '</span>' + crayon('c:' + r.id),
    (SOUSCATS[r.id] || []).map(sc => ligne('c:' + sc.id, sc.nom)).join('') || vide('Aucune sous-catégorie'))).join('');
  const classes = {};                                   // les aliments déjà rangés sous une sous-catégorie
  let alim = RAYONS.map(r => {
    const corps = (SOUSCATS[r.id] || []).map(sc => {
      const ps = PRODUITS.filter(p => String(p.catId) === String(sc.id));
      ps.forEach(p => { classes[p.id] = true; });
      return ps.length ? '<div class="accordeon-item"><span class="texte-fort">' + esc(sc.nom) + '</span></div>' + ps.map(aliment).join('') : '';
    }).join('');
    return corps ? acc('a:' + r.id, esc(r.nom), corps) : '';
  }).join('');
  const seuls = PRODUITS.filter(p => !classes[p.id]);
  if (seuls.length) alim += acc('a:', 'Sans catégorie', seuls.map(aliment).join(''));
  const noms = (type, n) => LISTES[n].map(x => ligne(type + ':' + x.id, x.nom)).join('');   // magasins, marques, saveurs : un crayon chacun
  liste.innerHTML = acc('cats', 'Catégories', cats || vide('Aucune catégorie')) + acc('alim', 'Aliments', alim || vide('Aucun aliment')) +
    acc('mag', 'Magasins', noms('g', 'Magasins') || vide('Aucun magasin')) +
    acc('mar', 'Marques', noms('q', 'Marques') || vide('Aucune marque')) +
    acc('sav', 'Saveurs', noms('v', 'Saveurs') || vide('Aucune saveur'));
  liste.querySelectorAll('.accordeon').forEach(a => {
    if (ouverts.indexOf(a.dataset.cle) === -1) return;
    a.firstElementChild.classList.add('ouvert');
    a.children[1].hidden = false;
  });
}

/* ---------- Inventaire : ce qu'on a, pièce par pièce, meuble par meuble ---------- */
/* Les lignes de STOCK regroupées par emplacement, puis par produit + marque + format
   (deux lots identiques au même endroit s'additionnent). */
function stockParEndroit() {
  const par = {};
  STOCK.forEach(l => {
    const emp = String(l[2] || '');
    const qte = Number(l[3]) || 0;
    if (!emp || qte <= 0) return;              // sans endroit (en transit) ou vide : pas ici
    const prod = PRODUITS.find(p => String(p.id) === String(l[1]));
    if (!prod) return;                         // produit disparu : on n'invente rien
    const marque = String(l[5] || '').trim(), format = String(l[6] || '').trim(), saveur = String(l[9] || '').trim();
    // ce qui est écrit sépare : une marque ou une saveur notée fait sa propre ligne;
    // laissées vides (le lait, la poudre à pâte), tout se regroupe sous le produit.
    const cleMarque = marque, cleSaveur = saveur;
    const cle = prod.id + '|' + cleMarque + '|' + cleSaveur;
    const liste = (par[emp] = par[emp] || {});
    const m = mesure(format);
    if (!liste[cle]) liste[cle] = { pid: String(prod.id), nom: prod.nom, marque: cleMarque, saveur: cleSaveur, formats: [], qte: 0, total: 0, unite: '' };
    const x = liste[cle];
    x.qte += qte;
    if (format && x.formats.indexOf(format) === -1) x.formats.push(format);
    if (m && (!x.unite || x.unite === m.unite)) { x.unite = m.unite; x.total += m.valeur * qte; }
    else if (m) x.unite = '';                    // des unités mélangées : on ne totalise pas
  });
  return par;
}
/* Les lignes d'un endroit, triées par nom. '' si l'endroit est vide. */
/* Un aliment = UNE ligne à son endroit (J-C, choix C sur aperçu : « imagine le tiroir à fromage, au moins 10 différents »).
   Une seule sorte : la ligne complète, comme avant. Plusieurs : le nom et le total (« 3 sortes » retiré par J-C); on touche pour les voir
   dessous (un accordéon : une seule ouverte à la fois, toggleAccordeon). */
function htmlLignesEndroit(par, empId) {
  const dedans = par[empId];
  if (!dedans) return '';
  const detailDe = x => {
    const mesureTotale = (x.unite && x.total) ? ecrireMesure(x.total, x.unite) : '';
    const format = x.formats.length > 1 ? x.formats.join(' + ') : x.formats[0];
    return [nomListe(x.marque), nomListe(x.saveur), format, mesureTotale ? 'total ' + mesureTotale : ''].filter(Boolean).join(' · ');
  };
  const groupes = {};
  Object.keys(dedans).forEach(k => { const x = dedans[k]; (groupes[x.pid] = groupes[x.pid] || []).push(x); });
  return Object.keys(groupes).map(pid => groupes[pid])
    .sort((a, b) => String(a[0].nom).localeCompare(String(b[0].nom), 'fr'))
    .map(sortes => {
      if (sortes.length === 1) {
        const x = sortes[0], detail = detailDe(x);
        return '<div class="item"><div class="item-info"><div class="item-nom">' + esc(x.nom) + '</div>' +
          (detail ? '<div class="item-detail">' + esc(detail) + '</div>' : '') + '</div>' +
          '<span class="item-quantite">' + esc(x.qte) + '</span></div>';
      }
      sortes.sort((a, b) => detailDe(a).localeCompare(detailDe(b), 'fr'));
      const total = sortes.reduce((s, x) => s + (Number(x.qte) || 0), 0);
      return '<div class="accordeon aliment"><div class="item aliment-tete"><div class="item-info"><div class="item-nom">' + esc(sortes[0].nom) + '</div>' +
        '</div><span class="item-quantite">' + total + '</span></div>' +
        '<div class="aliment-sortes" hidden>' + sortes.map(x => '<div class="item sorte"><div class="item-info"><div class="item-detail">' +
          esc(detailDe(x) || x.nom) + '</div></div><span class="sorte-quantite">' + esc(x.qte) + '</span></div>').join('') + '</div></div>';
    }).join('');
}
/* Un meuble : ce qui est posé dessus directement, puis chaque espace qui contient quelque chose.
   Rien dedans -> on renvoie '' et le meuble ne s'affiche pas (règle de J-C : on cache les vides). */
function htmlMeubleInventaire(m, par) {
  let corps = htmlLignesEndroit(par, m.id);    // posé sur le meuble, sans espace précis
  (ESPACES[m.id] || []).forEach(esp => {
    const lignes = htmlLignesEndroit(par, esp.id);
    if (lignes) corps += '<div class="espace-bandeau">' + esc(esp.nom) + '</div>' + lignes;
  });
  if (!corps) return '';
  const teinte = couleurDe(m.couleur);
  const style = teinte ? ' style="--meuble:' + esc(teinte) + '"' : '';   // la couleur est une DONNÉE ; la tête et les bandeaux des espaces la suivent
  const pale = (teinte && couleurPale(teinte)) ? ' tete-pale' : '';
  return '<div class="accordeon"' + style + '><div class="accordeon-tete' + pale + '">' + esc(m.nom) + '</div>' +
    '<div class="accordeon-corps" hidden>' + corps + '</div></div>';
}
/* La liste complète : pièce -> meuble -> espace -> produits. Les endroits vides ne paraissent pas. */
function remplirInventaire() {
  const cible = $('liste-inventaire');
  if (!cible) return;
  let html = '';
  const transitOuvert = !!cible.querySelector('[data-transit] > .ouvert');   // on range l'un après l'autre : il reste ouvert
  const par = stockParEndroit();                 // calculé UNE fois pour toute la liste
  LOTS = lotsParProduit();
  html += htmlPasEncoreRange();                  // en tête : ce qui attend d'être rangé
  const groupe = (titre, meubles, piece) => {
    const dedans = meubles.map(m => htmlMeubleInventaire(m, par)).join(''), t = teintePiece(piece);
    return dedans ? '<div class="accordeon"><div class="accordeon-tete' + t.pale + '"' + t.style + '>' + esc(titre) + '</div>' +
      '<div class="accordeon-corps" hidden>' + dedans + '</div></div>' : '';
  };
  PIECES.forEach(p => { html += groupe(p.nom, MEUBLES.filter(m => String(m.pieceId) === String(p.id)), p); });
  html += groupe('Meubles sans pièce', MEUBLES.filter(m => !m.pieceId));
  cible.innerHTML = html || '<div class="accordeon-item"><span class="texte-petit texte-pale">Rien d\'entré pour le moment.</span></div>';
  const transit = cible.querySelector('[data-transit] > .accordeon-tete');
  if (transitOuvert && transit) toggleAccordeon(transit);
}

/* ---------- Rechercher (la loupe) : par le texte ou par le scan ----------
   Tout vient de ce que l'app a déjà en mémoire : aucun appel réseau, la réponse est instantanée.
   Le texte cherche dans le nom, la marque et la saveur (sans accent, sans pluriel, une faute permise).
   Un aliment touché ouvre son ÉCRAN DE RAYON (RdG-03) : lui en gros, ses voisins de sous-catégorie dessous. */
var retourRecherche = montrerAccueil;   // où ramène le Retour : l'écran d'où l'on a touché la loupe
var rechercheJeton = 0;                 // un scan plus ancien qui répond en retard ne remplace pas l'écran
var modeRecherche = '';                 // '' = Rechercher · 'deplacer' · 'consommer' : le même écran, le lot touché fait le geste
const TITRES_RECHERCHE = { '': 'Rechercher', deplacer: 'Déplacer', consommer: 'Consommer' };
const RETOURS = { 'vue-accueil': () => montrerAccueil(), 'vue-choix-quoi': () => montrerChoixQuoi(),
                  'vue-listes': () => montrerListes(), 'vue-bases': () => montrerBases(), 'vue-couleurs': () => montrerCouleurs() };
/* depuis : true = on arrive de la loupe ou du menu (on retient d'où); false = on revient d'ailleurs (scan, rayon) */
function montrerRecherche(depuis) {
  if (depuis) {
    const ici = Object.keys(RETOURS).find(id => !$(id).hidden);
    if ($('vue-recherche').hidden) retourRecherche = ici ? RETOURS[ici] : montrerAccueil;   // la fiche en cours ne se rouvre pas vide : l'accueil
    $('recherche-texte').value = '';
  }
  toutCacher(); $('vue-recherche').hidden = false; $('btn-burger').hidden = false;
  montrer('recherche-saisie', true); montrer('recherche-rayon', false);
  $('recherche-titre').textContent = TITRES_RECHERCHE[modeRecherche];
  surRecherche();
  if (depuis) $('recherche-texte').focus();   // prêt à taper : le clavier s'ouvre
}
/* Déplacer : la même recherche (nom ou scan). Un lot touché change d'endroit; ensuite, on revient au champ vide. */
function montrerDeplacer() { modeRecherche = 'deplacer'; montrerRecherche(true); }
function montrerConsommer() { modeRecherche = 'consommer'; montrerRecherche(true); }
function ouvrirRecherche() { modeRecherche = ''; montrerRecherche(true); }
/* Un mot tapé colle-t-il à un mot de l'aliment ? Le début suffit (« fra » → fraise); une faute permise dès 4 lettres. */
function motColle(q, mot) {
  if (mot.indexOf(q) === 0) return true;
  if (q.length >= 4 && distance(q, mot.slice(0, q.length)) <= 1) return true;
  return q.length >= 5 && distance(q, mot) <= 2;
}
function texteColle(requete, texte) {
  const mots = nomNu(texte).split(' ').filter(Boolean);
  return requete.every(q => mots.some(m => motColle(q, m)));
}
/* Le total d'un aliment, tous endroits confondus. */
function totalLots(lots) { return (lots || []).reduce((s, l) => s + l.qte, 0); }
/* Les marques + saveurs déjà entrées, par aliment : { produitId: ['Liberté fraise', …] }. Lu UNE fois par recherche. */
function variantesParProduit() {
  const par = {};
  STOCK.forEach(l => {
    const v = [nomListe(l[5]), nomListe(l[9])].filter(Boolean).join(' ');
    if (!v) return;
    const liste = (par[String(l[1])] = par[String(l[1])] || []);
    if (liste.indexOf(v) === -1) liste.push(v);
  });
  return par;
}
/* avant / apres : du HTML déjà fait (la photo au-dessus, le code-barres dessous) */
function htmlVide(titre, texte, ajouter, avant, apres) {
  return '<div class="vide">' + (avant || '') + (titre ? '<div class="vide-titre">' + esc(titre) + '</div>' : '') +
    (texte ? '<div class="texte texte-pale">' + esc(texte) + '</div>' : '') + (apres || '') + '</div>' +
    (ajouter ? '<button class="bouton bouton-vert bouton-pleine bouton-suite" type="button" ' + ajouter + '>L\'ajouter</button>' : '');
}
/* Une ligne par aliment. Le nom d'abord (ceux dont le NOM colle), puis ceux trouvés par marque ou saveur. */
function surRecherche() {
  rechercheJeton++;
  const brut = $('recherche-texte').value.trim();
  const requete = nomNu(brut).split(' ').filter(Boolean);
  const cible = $('recherche-resultats');
  if (!requete.length || nomNu(brut).length < 2) { cible.innerHTML = ''; return; }
  const par = lotsParProduit(), variantes = variantesParProduit();
  const parNom = [], parVariante = [];
  PRODUITS.forEach(p => {
    if (texteColle(requete, p.nom)) { parNom.push({ p: p, detail: [] }); return; }
    const v = (variantes[String(p.id)] || []).filter(x => texteColle(requete, x));   // ce qui l'a fait trouver : « Liberté fraise »
    if (v.length) parVariante.push({ p: p, detail: v });
  });
  const alpha = (a, b) => String(a.p.nom).localeCompare(String(b.p.nom), 'fr');
  const trouves = parNom.sort(alpha).concat(parVariante.sort(alpha));
  if (!trouves.length) { cible.innerHTML = htmlVide('', 'Aucun aliment ne correspond', modeRecherche ? '' : 'data-ajouter-nom'); return; }
  cible.innerHTML = '<div class="liste-blanche">' + trouves.map(x => htmlLigneAliment(x.p, totalLots(par[x.p.id]), x.detail.join(' · '))).join('') + '</div>';
}
/* Une ligne à toucher : le nom, en petit ce qui l'a fait trouver (ou « plus en réserve »), la quantité. */
function htmlLigneAliment(p, total, detail) {
  const d = [detail, total ? '' : 'plus en réserve'].filter(Boolean).join(' · ');
  return '<div class="item' + (total ? '' : ' item-eteint') + '" data-pid="' + esc(p.id) + '"><div class="item-info"><div class="item-nom">' + esc(p.nom) + '</div>' +
    (d ? '<div class="item-detail">' + esc(d) + '</div>' : '') + '</div>' +
    (total ? '<span class="item-quantite">' + esc(total) + '</span>' : '') + '</div>';
}
/* Le nom d'une catégorie ou sous-catégorie, d'après son id. */
function nomCategorie(id) {
  const toutes = RAYONS.concat(...Object.values(SOUSCATS));
  const c = toutes.find(x => String(x.id) === String(id));
  return c ? c.nom : '';
}
/* L'écran de rayon : l'aliment en gros (où, combien, ce qui n'est pas encore rangé), puis ses voisins.
   Toucher un voisin le fait passer en gros, sur le même écran. */
function montrerRayon(pid, sansDefiler) {
  const prod = PRODUITS.find(p => String(p.id) === String(pid));
  if (!prod) return;
  rechercheJeton++;
  if ($('vue-recherche').hidden) { toutCacher(); $('vue-recherche').hidden = false; $('btn-burger').hidden = false; }
  $('recherche-texte').blur();                     // le clavier se ferme : on regarde
  const par = lotsParProduit();
  const lots = par[prod.id] || [], total = totalLots(lots);
  let corps;
  if (!total) corps = htmlVide('Tu n\'en as plus', '', modeRecherche ? '' : 'data-ajouter-produit="' + esc(prod.id) + '"');
  else if (modeRecherche === 'deplacer') corps = htmlLotsParEndroit(prod, lots, true, (l, i) => htmlLigneLot(prod, l, 'data-bouger="' + esc(prod.id) + '|' + i + '"'))
                                            || htmlVide('Rien à déplacer', 'Tout est encore à ranger', '');
  else if (modeRecherche === 'consommer') corps = htmlLotsParEndroit(prod, lots, false, (l, i) => htmlPartsConsommer(prod, l, i));
  else corps = htmlLotsParEndroit(prod, lots, false, l => htmlLigneLot(prod, l, ''));
  if (!modeRecherche) corps += htmlPasAimes(prod);   // au magasin : ce qu'on n'a pas aimé, même quand on n'en a plus
  let html = '<div class="vedette"><div class="vedette-tete"><span>' + esc(prod.nom) + '</span><span>' + esc(total) + '</span></div>' +
    '<div class="vedette-corps">' + corps + '</div></div>';
  const cat = nomCategorie(prod.catId);
  const voisins = (prod.catId && !modeRecherche) ? PRODUITS.filter(p => String(p.catId) === String(prod.catId) && String(p.id) !== String(prod.id))
                                       .sort((a, b) => String(a.nom).localeCompare(String(b.nom), 'fr')) : [];
  if (voisins.length) html += '<div class="label">' + (cat ? 'Aussi dans « ' + esc(cat) + ' »' : 'Aussi dans la même catégorie') + '</div>' +
    '<div class="liste-blanche">' + voisins.map(p => htmlLigneAliment(p, totalLots(par[p.id]), '')).join('') + '</div>';
  $('recherche-rayon').innerHTML = html;
  $('recherche-titre').textContent = modeRecherche ? TITRES_RECHERCHE[modeRecherche] : (cat || 'Rechercher');
  montrer('recherche-saisie', false); montrer('recherche-rayon', true);
  if (!sansDefiler) window.scrollTo(0, 0);
}
/* Les lots d'un aliment, regroupés par endroit sous le bandeau de la couleur du meuble; « Pas encore rangé » à la fin.
   sansTransit (Déplacer) : ce qui n'est pas encore rangé ne paraît pas. ligne(lot, i) écrit les lignes d'un lot. '' s'il ne reste rien. */
function htmlLotsParEndroit(prod, lots, sansTransit, ligne) {
  const endroits = [];
  lots.forEach((l, i) => {
    if (sansTransit && !l.emp) return;
    let e = endroits.find(x => x.emp === l.emp);
    if (!e) endroits.push(e = { emp: l.emp, lots: [] });
    e.lots.push({ l: l, i: i });
  });
  endroits.sort((a, b) => (a.emp ? 0 : 1) - (b.emp ? 0 : 1));
  return endroits.map(e => {
    const r = e.emp ? resoudreEmp(e.emp) : null;
    const m = r && MEUBLES.find(x => String(x.id) === String(r.meubleId));
    const teinte = m ? couleurDe(m.couleur) : '';
    const style = teinte ? ' style="--meuble:' + esc(teinte) + '"' : '';   // la couleur du meuble est une DONNÉE
    return '<div class="espace-bandeau"' + style + '>' + esc(libelleEndroit(e.emp)) + '</div>' + e.lots.map(x => ligne(x.l, x.i)).join('');
  }).join('');
}
/* Une ligne de lot : marque + saveur (ou l'aliment), ses formats, sa quantité. attr : de quoi la rendre touchable. */
function htmlLigneLot(prod, l, attr) {
  const nom = [nomListe(l.marque), nomListe(l.saveur)].filter(Boolean).join(' ') || prod.nom;
  const detail = [l.formats.join(' + '), estPasAime(prod.id, l.marque, l.saveur) ? 'Pas aimé' : ''].filter(Boolean).join(' · ');
  return '<div class="item"' + (attr ? ' ' + attr : '') + '><div class="item-info"><div class="item-nom">' + esc(nom) + '</div>' +
    (detail ? '<div class="item-detail">' + esc(detail) + '</div>' : '') + '</div>' +
    '<span class="item-quantite">' + esc(l.qte) + '</span></div>';
}
/* La quantité d'une carte (Déplacer, Consommer) : 1 d'office, entre un − et un +. */
function htmlQuantite() {
  return '<div class="bloc"><div class="label">Quantité</div><div class="plus-moins">' +
    '<button class="bouton bouton-brun moins" type="button" aria-label="Moins"></button>' +
    '<input class="champ qte" type="text" inputmode="numeric" pattern="[0-9]*" value="1">' +
    '<button class="bouton bouton-brun plus" type="button" aria-label="Plus"></button></div></div>';
}
/* − et + : jamais sous 1 ni au-delà de ce qu'il y a (max). La carte réagit comme si on avait tapé. */
function brancherPlusMoins(carte, max) {
  const champ = carte.querySelector('.qte');
  const pas = d => {
    const q = Math.min(Math.max((parseInt(champ.value, 10) || 0) + d, 1), Math.max(max, 1));
    champ.value = q;
    champ.dispatchEvent(new Event('input', { bubbles: true }));
  };
  carte.querySelector('.moins').onclick = () => pas(-1);
  carte.querySelector('.plus').onclick = () => pas(1);
}
/* Déplacer : le lot touché devient la carte d'endroit. D'office : l'emplacement 1 de l'aliment
   (le 2 si le lot y est déjà) et la quantité 1. Rien ne bouge avant le bouton « Déplacer ». */
function ouvrirDeplacement(cle) {
  const k = cle.split('|'), lot = (lotsParProduit()[k[0]] || [])[Number(k[1])];
  if (!lot || !lot.emp) return;
  if ($('recherche-rayon').querySelector('.endroit')) montrerRayon(lot.pid, true);   // une seule carte ouverte à la fois
  const item = [...$('recherche-rayon').querySelectorAll('[data-bouger]')].find(x => x.dataset.bouger === cle);
  if (!item) return;
  const habituels = endroitsHabituels(lot.pid);
  const vers = habituels[0] === lot.emp ? habituels[1] : habituels[0];
  const carte = document.createElement('div');
  carte.className = 'endroit carte';
  carte.innerHTML = htmlChoixEndroit() +
    htmlQuantite() +
    '<div class="message"></div>' +
    '<div class="grille"><button class="bouton bouton-petit bouton-vert bouger-oui" type="button" hidden>Déplacer</button>' +
    '<button class="bouton bouton-petit bouger-non" type="button">Annuler</button></div>';
  item.after(carte);                                  // la ligne reste visible : on voit combien il y en a
  brancherEndroit(carte, vers ? resoudreEmp(vers) : null);
  brancherPlusMoins(carte, lot.qte);
  const cible = () => carte.querySelector('.espace').value || carte.querySelector('.meuble').value;
  const combien = () => parseInt(carte.querySelector('.qte').value, 10) || 0;
  const verifier = () => {
    const emp = cible(), q = combien(), m = carte.querySelector('.message');
    const ok = !!emp && emp !== lot.emp && q > 0 && q <= lot.qte;
    m.className = 'message';
    if (q > lot.qte) { m.className = 'message message-erreur'; m.textContent = 'Il y en a ' + lot.qte + ' ici.'; }
    else if (!emp || emp !== lot.emp) m.textContent = '';
    else m.textContent = 'C\'est déjà ici : choisis un autre endroit.';
    carte.querySelector('.bouger-oui').hidden = !ok;
  };
  carte.addEventListener('change', verifier);
  carte.addEventListener('input', verifier);
  carte.querySelector('.bouger-non').onclick = () => montrerRayon(lot.pid, true);
  carte.querySelector('.bouger-oui').onclick = () => deplacerLot(lot, cible(), combien(), ok => {
    if (!ok) { montrerRayon(lot.pid, true); return; }
    avis('Déplacé', 'succes');
    $('recherche-texte').value = '';
    montrerRecherche(false);                          // le champ vide : on enchaîne avec le suivant
    $('recherche-texte').focus();
  });
  verifier();
}
/* ---------- Consommer ----------
   Le même écran que Rechercher. Chaque lot montre une ligne par FORMAT (le gros pot ≠ le pack) : on touche ce qu'on consomme.
   Un format en unités (« 6 unité ») se compte à l'unité : les packs du lot ne font qu'une ligne, la quantité = le nombre de pots.
   Un contenant sort quand il est fini. On sort le plus vieux d'abord (à l'unité : le pack entamé d'abord). */
function nbUnites(format) { const m = String(format || '').trim().match(/^([0-9]+)\s*unit/i); return m ? parseInt(m[1], 10) : 0; }
function estPasAime(pid, marque, saveur) {
  return PAS_AIMES.some(r => String(r[1]) === String(pid) && String(r[2] || '').trim() === marque && String(r[3] || '').trim() === saveur);
}
/* Les lignes de STOCK d'un lot (les objets eux-mêmes : une entrée toute fraîche n'a pas encore d'ID). */
function lignesDuLot(lot) {
  return STOCK.filter(l => String(l[1]) === lot.pid && String(l[2] || '') === lot.emp && String(l[5] || '').trim() === lot.marque &&
                           String(l[9] || '').trim() === lot.saveur && (Number(l[3]) || 0) > 0);
}
function partsDuLot(lot) {
  const parts = [];
  lignesDuLot(lot).forEach(row => {
    const f = String(row[6] || '').trim(), n = nbUnites(f), cle = n ? 'unite' : f;
    let p = parts.find(x => x.cle === cle);
    if (!p) parts.push(p = { cle: cle, unites: !!n, format: f, pack: 0, qte: 0, rows: [] });
    p.rows.push(row);
    p.qte += (Number(row[3]) || 0) * (n || 1);
    if (n > p.pack) { p.pack = n; p.format = f; }
  });
  return parts;
}
function libellePart(p) { return p.unites ? (p.pack > 1 ? 'à l\'unité · pack de ' + p.pack : 'à l\'unité') : p.format; }
function htmlPartsConsommer(prod, l, i) {
  const nom = [nomListe(l.marque), nomListe(l.saveur)].filter(Boolean).join(' ') || prod.nom;
  const pas = estPasAime(prod.id, l.marque, l.saveur);
  return partsDuLot(l).map(p => {
    const detail = [libellePart(p), pas ? 'Pas aimé' : ''].filter(Boolean).join(' · ');
    return '<div class="item" data-consommer="' + esc(prod.id + '|' + i + '|' + p.cle) + '"><div class="item-info"><div class="item-nom">' + esc(nom) + '</div>' +
      (detail ? '<div class="item-detail">' + esc(detail) + '</div>' : '') + '</div><span class="item-quantite">' + esc(p.qte) + '</span></div>';
  }).join('');
}
/* Rechercher : ce qu'on n'a pas aimé de cet aliment (pour la maison), sous ce qu'on a. */
function htmlPasAimes(prod) {
  const noms = PAS_AIMES.filter(r => String(r[1]) === String(prod.id))
    .map(r => [nomListe(r[2]), nomListe(r[3])].filter(Boolean).join(' ') || prod.nom);
  if (!noms.length) return '';
  return '<div class="espace-bandeau">Pas aimé</div>' + noms.map(n => '<div class="item"><div class="item-info"><div class="item-nom">' + esc(n) + '</div>' +
    '<div class="item-detail">Ne pas racheter</div></div></div>').join('');
}
/* Ce que devient STOCK quand on sort k de la part p : les lignes réécrites, et un reste de pack s'il faut une ligne de plus. */
function planSortie(p, k) {
  const date = r => String(dateCourte(r[4]) || '');
  const rows = p.rows.slice().sort((a, b) => (p.unites ? nbUnites(a[6]) - nbUnites(b[6]) : 0) || date(a).localeCompare(date(b)));
  const modifs = [], ajouts = [];
  let reste = k;
  for (const row of rows) {
    if (reste <= 0) break;
    const n = p.unites ? nbUnites(row[6]) : 1, total = (Number(row[3]) || 0) * n;
    const pris = Math.min(reste, total), r = total - pris, pleins = Math.floor(r / n), bout = r % n;
    reste -= pris;
    const ligne = row.slice(); ligne[4] = dateCourte(ligne[4]);
    if (!bout) ligne[3] = pleins;                                            // des contenants entiers (ou plus rien : 0)
    else if (!pleins) { ligne[3] = 1; ligne[6] = bout + ' unité'; }          // un seul pack, entamé
    else { ligne[3] = pleins; ajouts.push(['', row[1], row[2], 1, ligne[4], row[5], bout + ' unité', '', row[8], row[9], row[10], row[11], row[12]]); }
    modifs.push({ row: row, ligne: ligne });
  }
  return { modifs: modifs, ajouts: ajouts };
}
/* La ligne touchée ouvre sa carte, juste dessous : la quantité (1), « Ne pas racheter », Consommer / Annuler. */
function ouvrirConsommation(cle) {
  const k = cle.split('|'), lot = (lotsParProduit()[k[0]] || [])[Number(k[1])];
  const p = lot && partsDuLot(lot).find(x => x.cle === k.slice(2).join('|'));
  if (!p) return;
  if ($('recherche-rayon').querySelector('.carte')) montrerRayon(lot.pid, true);   // une seule carte ouverte à la fois
  const item = [...$('recherche-rayon').querySelectorAll('[data-consommer]')].find(x => x.dataset.consommer === cle);
  if (!item) return;
  const pas = estPasAime(lot.pid, lot.marque, lot.saveur);
  const carte = document.createElement('div');
  carte.className = 'endroit carte';
  carte.innerHTML = htmlQuantite() +
    (pas ? '' : '<label class="case-ligne"><input class="case pas-aime" type="checkbox"><span>Ne pas racheter</span></label>') +
    '<div class="message"></div>' +
    '<div class="grille"><button class="bouton bouton-petit bouton-vert conso-oui" type="button">Consommer</button>' +
    '<button class="bouton bouton-petit conso-non" type="button">Annuler</button></div>';
  item.after(carte);
  brancherPlusMoins(carte, p.qte);
  const combien = () => parseInt(carte.querySelector('.qte').value, 10) || 0;
  const verifier = () => {
    const q = combien(), m = carte.querySelector('.message');
    const ok = q > 0 && q <= p.qte;
    m.className = ok ? 'message' : 'message message-erreur';
    m.textContent = ok || !q ? '' : 'Il y en a ' + p.qte + '.';
    carte.querySelector('.conso-oui').hidden = !ok;
  };
  carte.addEventListener('input', verifier);
  carte.querySelector('.conso-non').onclick = () => montrerRayon(lot.pid, true);
  carte.querySelector('.conso-oui').onclick = () => {
    const case_ = carte.querySelector('.pas-aime');
    consommerPart(lot, p.cle, combien(), !!(case_ && case_.checked));
  };
  verifier();
}
/* La sortie est INSTANTANÉE à l'écran (J-C : « si j'attends pour chaque aliment d'une recette… ») :
   la mémoire et le cache changent tout de suite, et l'envoi part en arrière-plan, gardé en attente (localStorage)
   jusqu'à ce que le coffre-fort dise oui — un échec repart tout seul, comme l'ordre et les couleurs.
   Un envoi = les lignes de STOCK réécrites (+ un reste de pack), la trace dans Sorties, et « Pas aimé » s'il est coché.
   Le jeton (opId) voyage avec l'envoi : renvoyé après une coupure, le coffre-fort le trouve dans Sorties et n'écrit rien deux fois.
   Le reste d'un pack reçoit son ID ICI (idLocal) : une 2e sortie du même pack le vise sans attendre le coffre-fort. */
async function consommerPart(lot, cleP, q, pasAime) {
  let p = partsDuLot(lot).find(x => x.cle === cleP);
  if (p && p.rows.some(r => !r[0])) {                  // filet : une ligne sans ID (ne devrait plus arriver) -> on relit d'abord
    montrerVoile(true);
    const lu = await chargerReferences();
    montrerVoile(false);
    p = lu ? partsDuLot(lot).find(x => x.cle === cleP) : null;
    if (p && p.rows.some(r => !r[0])) p = null;
  }
  if (!p || !(q > 0) || q > p.qte) { avis('Pas consommé — réessaie', 'erreur'); montrerRayon(lot.pid, true); return; }
  const op = 'conso-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  const plan = planSortie(p, q);
  const qui = localStorage.getItem(QUI) || '', date = dateDuJour();
  plan.ajouts.forEach(a => { a[0] = idLocal(); a[7] = op + '-reste'; });
  poserGeste({
    action: 'consommer',
    opId: op,
    sortie: ['', lot.pid, lot.emp, q, date, lot.marque, p.format, lot.saveur, qui, op],
    modifs: plan.modifs.map(m => ({ id: String(m.row[0]), ligne: m.ligne })),
    ajouts: plan.ajouts,
    pasAime: pasAime && !estPasAime(lot.pid, lot.marque, lot.saveur) ? ['', lot.pid, lot.marque, lot.saveur, date, qui] : null
  });
  avis('Consommé', 'succes');
  $('recherche-texte').value = '';
  montrerRecherche(false);                             // le champ vide : on enchaîne avec le suivant
  $('recherche-texte').focus();
}
/* ---------- LES GESTES INSTANTANÉS (Consommer, Déplacer) ----------
   Un geste change la mémoire et le cache TOUT DE SUITE, puis part en arrière-plan, gardé en attente jusqu'au oui du coffre-fort.
   UNE seule file pour les deux, dans l'ordre où on les a faits : un yogourt déplacé au frigo puis mangé = la consommation
   vise la ligne que le déplacement a créée, elle doit partir après lui. */
function poserGeste(envoi) {
  ecrireAttenteGestes(lireAttenteGestes().concat([envoi]));   // gardé AVANT tout : un appareil éteint en route ne perd rien
  appliquerGeste(envoi, STOCK, PAS_AIMES);
  const c = lireCache();
  if (c) { appliquerGeste(envoi, c.stock = c.stock || [], c.pasAimes = c.pasAimes || []); ecrireCache(c); }
  expedierGestes();
}
/* Pose un geste sur des lignes (la mémoire, le cache, ou des données fraîchement relues). Par ID, en valeurs finales :
   le poser deux fois ne change rien. */
function appliquerGeste(e, stock, pasAimes) {
  (e.modifs || []).forEach(m => {
    const row = stock.find(x => String(x[0]) === String(m.id));
    if (row) row.splice(0, m.ligne.length, ...m.ligne);
  });
  (e.ajouts || []).forEach(a => { if (!stock.some(x => String(x[0]) === String(a[0]))) stock.push(a.slice()); });
  const pa = e.pasAime;
  if (pa && !pasAimes.some(r => String(r[1]) === String(pa[1]) && String(r[2] || '').trim() === pa[2] && String(r[3] || '').trim() === pa[3])) pasAimes.push(pa.slice());
}
function lireAttenteGestes() { try { return JSON.parse(localStorage.getItem(ATTENTE_GESTES) || '[]') || []; } catch (e) { return []; } }
function ecrireAttenteGestes(a) { try { localStorage.setItem(ATTENTE_GESTES, JSON.stringify(a)); } catch (e) {} }
/* Envoie l'attente, un geste à la fois, dans l'ordre (le 2e peut viser une ligne créée par le 1er).
   Oui : retiré. Refus définitif (ligne disparue…) : retiré, et on relit la réserve pour que l'écran dise vrai.
   Réseau : on s'arrête, tout reste, et repart au prochain chargement ou au prochain geste. */
async function expedierGestes() {
  if (envoiGestes) return;
  envoiGestes = true;
  let relire = false;
  try {
    let file = lireAttenteGestes();
    while (file.length) {
      const e = file[0];
      let r = null;
      try { r = await (e.action === 'deplacer' ? Coffre.deplacer(e) : Coffre.consommer(e)); } catch (x) {}
      const definitif = r && !r.ok && (r.definitif || /introuvable|jeton manquant/.test(r.erreur || ''));   // (ou un coffre-fort pas encore à jour)
      if (r && r.ok || definitif) ecrireAttenteGestes(lireAttenteGestes().filter(x => x.opId !== e.opId));
      if (definitif) { relire = true; avis('Un changement a été refusé — la réserve est relue', 'erreur'); }
      else if (!(r && r.ok)) { avis('Pas encore enregistré — ça repartira tout seul', 'erreur'); break; }
      file = lireAttenteGestes();
    }
  } finally { envoiGestes = false; }
  if (relire) chargerReferences();
}
/* Un ID fait ici, de la même forme que ceux du coffre-fort (date/heure du Québec) + un tirage : unique sans lui demander. */
function idLocal() {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  const v = t => (p.find(x => x.type === t) || {}).value || '';
  return v('year') + v('month') + v('day') + v('hour') + v('minute') + v('second') +
    String(Date.now() % 1000).padStart(3, '0') + '-' + Math.random().toString(36).slice(2, 7);
}
/* Gérer les bases → Aliments : « Enlever » retire un « Pas aimé ». */
async function enleverPasAime(btn) {
  const k = btn.dataset.pasAime.split('|');
  const pid = k[0], marque = k[1] || '', saveur = k.slice(2).join('|');
  montrerVoile(true);
  let c = null;
  try {
    const r = await Coffre.pasAime({ retirer: true, produitId: pid, marque: marque, saveur: saveur });
    if (!r || !r.ok) throw new Error((r && r.erreur) || 'refus');
    const garder = x => !(String(x[1]) === pid && String(x[2] || '').trim() === marque && String(x[3] || '').trim() === saveur);
    PAS_AIMES = PAS_AIMES.filter(garder);
    c = lireCache(); if (c) c.pasAimes = (c.pasAimes || []).filter(garder);
  } catch (e) {
    avis('Pas enlevé — réessaie', 'erreur');
  } finally {
    if (c) ecrireCache(c);
    montrerVoile(false); remplirNoms(true);
  }
}
/* Le scan de la recherche : un code à nous -> son écran de rayon; sinon « Tu n'en as pas », avec le nom d'Open Food Facts. */
function scannerPourChercher() {
  if (typeof montrerScanner !== 'function') return;
  montrerScanner({ lu: chercherParCode, retour: () => montrerRecherche(false) });
}
async function chercherParCode(code) {
  code = String(code || '').trim();
  $('recherche-texte').value = '';
  montrerRecherche(false);
  const pid = CODES[code];
  if (pid && PRODUITS.some(p => String(p.id) === String(pid))) { montrerRayon(pid); return; }
  const jeton = ++rechercheJeton;
  $('recherche-resultats').innerHTML = htmlVide('', 'Recherche du produit…');
  let d = null;
  if (typeof window.chercherOFF === 'function') { try { d = await window.chercherOFF(code); } catch (e) {} }
  if (jeton !== rechercheJeton || $('vue-recherche').hidden) return;   // il est passé à autre chose entre-temps
  const connu = d && d.nom && trouverProduitParNom(d.nom);             // le code n'est pas noté, mais le nom est à nous
  if (connu) { montrerRayon(connu.id); return; }
  const trouve = !!(d && d.trouve);
  const nomLu = trouve ? (d.nom || d.nomAutre || '') : '';   // pas de nom français : l'anglais, à lire ici seulement
  const qui = trouve ? [[nomLu, d.marque].filter(Boolean).join(' — '), d.format].filter(Boolean).join(' · ') : '';
  const photo = trouve && /^https:\/\//.test(d.photo || '') ? '<img class="photo-produit" src="' + esc(d.photo) + '" alt="">' : '';
  $('recherche-resultats').innerHTML = htmlVide('Tu n\'en as pas', qui || 'Produit inconnu', modeRecherche ? '' : 'data-ajouter-code="' + esc(code) + '"',
    photo, '<div class="code-barres">Code ' + esc(code) + '</div>');
  const img = $('recherche-resultats').querySelector('.photo-produit');
  if (img) img.addEventListener('error', () => img.remove());   // photo introuvable : rien à sa place, pas de case vide
}
/* « L'ajouter » : la fiche d'entrée, déjà remplie — le code scanné, ou le nom (tapé, ou l'aliment qu'on n'a plus). */
function ouvrirFicheNom(nom) {
  montrerFormulaire(true);                 // le chemin « identité d'abord », comme au scan…
  montrer('bloc-code', false);             // … sans code-barres
  $('nom').value = nom || '';
  surNom();
}
function surClicRecherche(ev) {
  const b = ev.target.closest('[data-ajouter-code], [data-ajouter-nom], [data-ajouter-produit], [data-pid], [data-bouger], [data-consommer]');
  if (!b) return;
  if (b.hasAttribute('data-bouger')) { ouvrirDeplacement(b.dataset.bouger); return; }
  if (b.hasAttribute('data-consommer')) { ouvrirConsommation(b.dataset.consommer); return; }
  if (b.hasAttribute('data-pid')) { montrerRayon(b.dataset.pid); return; }
  if (b.hasAttribute('data-ajouter-code')) { ouvrirFicheScan(b.dataset.ajouterCode); return; }
  if (b.hasAttribute('data-ajouter-produit')) {
    const p = PRODUITS.find(x => String(x.id) === String(b.dataset.ajouterProduit));
    ouvrirFicheNom(p ? p.nom : ''); return;
  }
  ouvrirFicheNom($('recherche-texte').value.trim());
}
/* Retour : de l'écran de rayon, on revient à la recherche (le texte tapé est gardé); de la recherche, d'où l'on vient. */
function retourDeRecherche() {
  if (!$('recherche-rayon').hidden) { montrerRecherche(false); return; }
  retourRecherche();
}

/* ---------- Réordonner (flèches ↑↓) — instantané à l'écran, envoyé en arrière-plan ---------- */
/* Les frères d'une ligne : la liste qui la porte, le groupe où elle bouge, et le nom du groupe. */
function freres(type, id) {
  id = String(id);
  if (type === 'p') return { liste: PIECES, groupe: PIECES, cle: 'p' };
  if (type === 'm') {
    const m = MEUBLES.find(x => String(x.id) === id);
    if (!m) return null;
    const piece = String(m.pieceId || '');
    return { liste: MEUBLES, groupe: MEUBLES.filter(x => String(x.pieceId || '') === piece), cle: 'm:' + piece };
  }
  if (type === 'e') {
    for (const mid in ESPACES) if (ESPACES[mid].some(e => String(e.id) === id)) return { liste: ESPACES[mid], groupe: ESPACES[mid], cle: 'e:' + mid };
  }
  return null;
}
/* Échange une ligne avec sa voisine (sens -1 = monter, 1 = descendre). Aucun appel réseau. */
function deplacer(type, id, sens) {
  const f = freres(type, id);
  if (!f) return;
  const j = f.groupe.findIndex(x => String(x.id) === String(id));
  const voisin = f.groupe[j + sens];
  if (j < 0 || !voisin) return;
  // on retient la ligne AVANT d'écrire : pour les pièces et les espaces, groupe et liste
  // sont le MÊME tableau — écrire d'abord ferait perdre la ligne qu'on déplace.
  const ligne = f.groupe[j];
  const a = f.liste.indexOf(ligne), b = f.liste.indexOf(voisin);
  if (a < 0 || b < 0) return;
  f.liste[a] = voisin; f.liste[b] = ligne;
  ordreModifie[f.cle] = true;
  remplirMeubles(true);
  if (!$('vue-pieces').hidden) remplirPieces();
  montrerOrdre(true);
}
/* Les ids d'un groupe, dans l'ordre affiché. */
function idsDuGroupe(cle) {
  if (cle === 'p') return PIECES.map(p => String(p.id));
  if (cle.indexOf('m:') === 0) { const piece = cle.slice(2); return MEUBLES.filter(m => String(m.pieceId || '') === piece).map(m => String(m.id)); }
  if (cle.indexOf('e:') === 0) return (ESPACES[cle.slice(2)] || []).map(e => String(e.id));
  return [];
}
/* Même règle que le coffre-fort : les lignes d'un groupe s'échangent entre les places
   qu'elles occupent déjà. Sert au cache local et à l'ordre encore en attente. */
function reordonnerLignes(lignes, groupes) {
  if (!lignes) return;
  (groupes || []).forEach(function (ids) {
    const ou = {};
    lignes.forEach((r, i) => { ou[String(r[0])] = i; });
    const trouves = [];
    ids.forEach(id => { const i = ou[String(id)]; if (i !== undefined && trouves.indexOf(i) === -1) trouves.push(i); });
    const places = trouves.slice().sort((a, b) => a - b);
    const copies = trouves.map(i => lignes[i]);
    places.forEach((p, k) => { lignes[p] = copies[k]; });
  });
}
function lireAttente()   { try { return JSON.parse(localStorage.getItem(ATTENTE) || '[]'); } catch (e) { return []; } }
function ecrireAttente(g){ try { localStorage.setItem(ATTENTE, JSON.stringify(g)); } catch (e) {} }

/* L'ordre des endroits d'un aliment pas encore confirmé : { produitId: 'emp1,emp2,…' } (survit à une fermeture). */
function lireAttenteAliments()   { try { return JSON.parse(localStorage.getItem(ATTENTE_ALIMENTS) || '{}') || {}; } catch (e) { return {}; } }
function ecrireAttenteAliments(a){ try { localStorage.setItem(ATTENTE_ALIMENTS, JSON.stringify(a)); } catch (e) {} }
/* Pose ces ordres dans des lignes de Produits (le cache, ou des données fraîchement relues) : colonne J. */
function poserOrdresAliments(prods, ordres) {
  (prods || []).forEach(r => {
    const o = ordres[String(r[0])];
    if (o === undefined) return;
    while (r.length < 10) r.push('');
    r[9] = o;
  });
}

/* « Enregistrer l'ordre » (ou on quitte l'écran) : l'ordre est gardé ici, puis part sans rien bloquer. */
function envoyerOrdre() {
  const cles = Object.keys(ordreModifie);
  const groupes = cles.map(idsDuGroupe).filter(g => g.length > 1);
  const aliments = {};                                     // l'ordre des endroits des aliments touchés
  cles.filter(k => k.indexOf('a:') === 0).forEach(k => {
    const p = PRODUITS.find(x => String(x.id) === k.slice(2));
    if (p) aliments[String(p.id)] = p.ordre;
  });
  ordreModifie = {};
  montrerOrdre(false);
  if (!groupes.length && !Object.keys(aliments).length) return;
  const c = lireCache(); if (c) { reordonnerLignes(c.emps, groupes); poserOrdresAliments(c.prods, aliments); ecrireCache(c); }
  if (groupes.length) ecrireAttente(lireAttente().concat(groupes));
  ecrireAttenteAliments(Object.assign(lireAttenteAliments(), aliments));
  expedierOrdre();
}
/* Envoie l'attente au coffre-fort, en arrière-plan (la file de coffre.js garde un appel à la fois).
   Succès : l'attente se vide. Échec : elle reste, et repart au prochain passage.
   Un aliment = sa ligne de Produits réécrite, colonne J comprise (valeur finale : la renvoyer ne change rien). */
async function expedierOrdre() {
  const groupes = lireAttente(), aliments = lireAttenteAliments();
  if ((!groupes.length && !Object.keys(aliments).length) || envoiOrdre) return;
  envoiOrdre = true;
  let ok = false;
  try {
    if (groupes.length) {
      const r = await Coffre.ordonner(groupes);
      if (!r || !r.ok) throw new Error((r && r.erreur) || 'refus');
      ecrireAttente(lireAttente().slice(groupes.length));   // d'autres ont pu s'ajouter pendant l'envoi
    }
    const c = lireCache();
    for (const pid of Object.keys(aliments)) {
      const row = c && (c.prods || []).find(x => String(x[0]) === pid);
      if (row) {
        const ligne = row.slice(); while (ligne.length < 10) ligne.push(''); ligne[9] = aliments[pid];
        const r = await Coffre.modifier('Produits', pid, ligne);
        if ((!r || !r.ok) && !(r && r.erreur === 'ID introuvable')) throw new Error((r && r.erreur) || 'refus');   // aliment disparu : rien à garder
      }
      const reste = lireAttenteAliments();
      if (reste[pid] === aliments[pid]) { delete reste[pid]; ecrireAttenteAliments(reste); }   // rechangé pendant l'envoi : il repart
    }
    ok = true;
    avis('Ordre enregistré ✓', 'succes');
  } catch (e) {
    avis("Ordre pas encore enregistré — il repartira tout seul", 'erreur');
  } finally {
    envoiOrdre = false;
    if (ok && (lireAttente().length || Object.keys(lireAttenteAliments()).length)) expedierOrdre();   // ce qui s'est ajouté pendant l'envoi
  }
}

/* ---------- L'ordre des endroits d'un aliment (Gérer les bases → Aliments, J-C 2026-09-29) ----------
   Le 1er = celui que Déplacer regarnit, et la 1re carte d'endroit à l'entrée. L'ordre choisi (Produits, col. J)
   passe devant; un endroit où l'aliment est allé depuis s'ajoute au bout. */
function endroitsHabituels(pid) {
  const p = PRODUITS.find(x => String(x.id) === String(pid));
  const choisis = p && p.ordre ? p.ordre.split(',').filter(Boolean) : [];
  const vus = ((VARIANTES[pid] || {}).emplacements || []).map(String);
  return choisis.concat(vus.filter(e => choisis.indexOf(e) === -1));
}
/* Sous le nom de l'aliment : 1. 2. 3., chacun avec ses flèches. Un endroit disparu ne paraît pas. */
function htmlOrdreEndroits(pid) {
  const ends = endroitsHabituels(pid).filter(e => resoudreEmp(e));
  return ends.map((e, i) => '<div class="accordeon-item"><span>' + (i + 1) + '. ' + esc(libelleEndroit(e)) + '</span>' +
    fleches('o', pid + '|' + e, i, ends.length) + '</div>').join('');
}
/* Une flèche : l'endroit échange sa place avec son voisin. Instantané, envoyé avec « Enregistrer l'ordre ». */
function monterEndroit(cle, sens) {
  const k = String(cle).split('|'), pid = k[0], emp = k[1];
  const p = PRODUITS.find(x => String(x.id) === pid);
  if (!p) return;
  const ends = endroitsHabituels(pid).filter(e => resoudreEmp(e));
  const j = ends.indexOf(emp);
  if (j < 0 || !ends[j + sens]) return;
  ends[j] = ends[j + sens]; ends[j + sens] = emp;
  p.ordre = ends.join(',');
  ordreModifie['a:' + pid] = true;
  remplirNoms(true);
  montrerOrdre(true);
}

/* ---------- Couleurs (Outils → Couleurs) — en direct à l'écran, envoyées en arrière-plan ---------- */
/* Un code hex tapé -> '#rrggbb' en minuscules, ou '' s'il est incomplet ou mal tapé.
   Le # est facultatif; #abc vaut #aabbcc. */
function hexValide(v) {
  let h = String(v || '').trim().toLowerCase().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/.test(h)) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  return /^[0-9a-f]{6}$/.test(h) ? '#' + h : '';
}
function lireAttenteCouleurs() {
  try { const a = JSON.parse(localStorage.getItem(ATTENTE_COULEURS) || 'null'); if (a) return { site: a.site || {}, meubles: a.meubles || {} }; } catch (e) {}
  return { site: {}, meubles: {} };
}
function ecrireAttenteCouleurs(a) { try { localStorage.setItem(ATTENTE_COULEURS, JSON.stringify(a)); } catch (e) {} }

/* La palette du secteur : le Sheet, puis l'attente, puis l'essai en cours à l'écran (le plus récent gagne). */
function paletteSite() {
  const p = {};
  COULEURS.forEach(r => { if (!SECTEUR_ID || String(r[1]) === SECTEUR_ID) p[String(r[2])] = String(r[3] || ''); });
  return Object.assign(p, lireAttenteCouleurs().site, couleursModif.site);
}
/* Pose la palette sur le root. Une valeur vide ou illisible = la couleur d'origine du CSS. */
function appliquerCouleursSite() {
  const p = paletteSite(), root = document.documentElement.style;
  COULEURS_SITE.forEach(([nom]) => {
    const v = hexValide(p[nom]);
    if (v) root.setProperty('--' + nom, v); else root.removeProperty('--' + nom);
  });
}
/* La couleur affichée en ce moment pour une variable du root (d'origine ou changée). */
function couleurActuelle(nom) {
  return hexValide(getComputedStyle(document.documentElement).getPropertyValue('--' + nom)) || '';
}

/* Une ligne de la palette : pastille + « Couleur 305 » (+ où elle sert) + champ hex. La couleur de la pastille est une DONNÉE. */
function htmlLigneCouleur(attr, id, nom, usage, valeur) {
  return '<div class="accordeon-item accordeon-item-saisie">' +
    '<span class="pastille"' + (valeur ? ' style="background:' + esc(valeur) + '"' : '') + '></span>' +
    '<span class="couleur-nom">' + esc(nom) + (usage ? '<span class="couleur-usage">' + esc(usage) + '</span>' : '') + '</span>' +
    '<input class="champ champ-hex" ' + attr + '="' + esc(id) + '" value="' + esc(valeur) + '" maxlength="7" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="#rrggbb">' +
  '</div>';
}
/* Où sert une couleur : son usage dans le site, puis les pièces et meubles qui l'ont choisie. */
function usageCouleur(num, usage) {
  const qui = PIECES.concat(MEUBLES).filter(x => numeroCouleur(x.couleur) === num).map(x => x.nom);
  return [usage].concat(qui).filter(Boolean).join(' · ') || 'pas encore utilisée';
}
/* Les pastilles de la palette, à toucher. La choisie est cerclée. */
function htmlPalette(choisi) {
  return COULEURS_SITE.map(([nom, libelle]) => {
    const n = nom.slice(8);
    return '<button class="pastille pastille-choix' + (n === choisi ? ' pastille-choisie' : '') + '" type="button" data-num="' + n +
      '" style="background:var(--' + nom + ')" aria-label="' + esc(libelle) + '"></button>';
  }).join('');
}
/* Un meuble : pastille + nom + son numéro. La toucher ouvre la palette juste dessous. */
function htmlLigneChoix(x) {
  const n = numeroCouleur(x.couleur), teinte = couleurDe(x.couleur);
  return '<div class="accordeon-item accordeon-item-saisie couleur-choix" data-choix="' + esc(x.id) + '">' +
    '<span class="pastille"' + (teinte ? ' style="background:' + esc(teinte) + '"' : '') + '></span>' +
    '<span class="couleur-nom">' + esc(x.nom) +
      '<span class="couleur-usage">' + (n ? 'Couleur ' + n : 'aucune couleur') + '</span></span>' +
  '</div><div class="palette" data-palette="' + esc(x.id) + '" hidden></div>';
}
/* L'écran : « Palette » (par famille) puis « Pièces et meubles » (par pièce, comme Gérer les bases).
   garderOuverts : après un changement, les accordéons ouverts le restent. */
function remplirCouleurs(garderOuverts) {
  const liste = $('liste-couleurs');
  const ouverts = garderOuverts ? [...liste.querySelectorAll('.accordeon-tete.ouvert')].map(t => t.parentElement.dataset.cle) : [];
  const accordeon = (cle, titre, corps, piece) => { const t = teintePiece(piece);
    return '<div class="accordeon" data-cle="' + esc(cle) + '"><div class="accordeon-tete' + t.pale + '"' + t.style + '>' + esc(titre) + '</div><div class="accordeon-corps" hidden>' + corps + '</div></div>'; };
  const site = FAMILLES.map(([f, titre]) => accordeon('f:' + f, titre,
    COULEURS_SITE.filter(([nom]) => nom.charAt(8) === f)
      .map(([nom, libelle, usage]) => htmlLigneCouleur('data-site', nom, libelle, usageCouleur(nom.slice(8), usage), couleurActuelle(nom))).join(''))).join('');
  let lieux = '';
  const aRanger = MEUBLES.filter(m => !m.pieceId);
  if (aRanger.length) lieux += accordeon('r', 'Meubles sans pièce', aRanger.map(m => htmlLigneChoix(m)).join(''));
  // la couleur d'une PIÈCE se choisit sur la page Pièces (J-C, 2026-09-30) : ici, ses meubles seulement
  lieux += PIECES.map(p => accordeon('p:' + p.id, p.nom,
    MEUBLES.filter(m => String(m.pieceId) === String(p.id)).map(m => htmlLigneChoix(m)).join('') ||
      '<div class="accordeon-item"><span class="texte-petit texte-pale">Aucun meuble</span></div>', p)).join('');
  liste.innerHTML = accordeon('site', 'Palette', site) +
    accordeon('meubles', 'Meubles', lieux || '<div class="accordeon-item"><span class="texte-petit texte-pale">Aucun meuble</span></div>');
  liste.querySelectorAll('.accordeon').forEach(a => {
    if (ouverts.indexOf(a.dataset.cle) === -1) return;
    a.firstElementChild.classList.add('ouvert');
    a.children[1].hidden = false;
  });
}
/* Toucher un meuble ouvre sa palette (une seule à la fois); toucher une pastille la choisit. */
function surChoixCouleur(ev) {
  const ligne = ev.target.closest('[data-choix]');
  if (ligne) {
    const pal = ligne.nextElementSibling, ouvrir = pal.hidden;
    $('liste-couleurs').querySelectorAll('.palette').forEach(p => { p.hidden = true; p.innerHTML = ''; });
    if (ouvrir) {
      const x = MEUBLES.find(y => String(y.id) === ligne.dataset.choix);
      pal.innerHTML = htmlPalette(x ? numeroCouleur(x.couleur) : '');
      pal.hidden = false;
    }
    return;
  }
  const b = ev.target.closest('.pastille-choix');
  if (!b) return;
  const id = b.closest('[data-palette]').dataset.palette;
  const x = MEUBLES.find(y => String(y.id) === id);
  if (x) x.couleur = b.dataset.num;
  couleursModif.meubles[id] = b.dataset.num;          // pièces et meubles : la même colonne Couleur d'Emplacements
  remplirCouleurs(true);
  montrer('btn-couleurs', true);
}

/* On tape un code : complet et bon -> tout change en direct; sinon le champ se marque en rouge et rien ne bouge. */
function surHex(ev) {
  const inp = ev.target.closest('.champ-hex');
  if (!inp) return;
  const v = hexValide(inp.value);
  inp.classList.toggle('champ-erreur', !v);
  if (!v) return;
  inp.parentElement.querySelector('.pastille').style.background = v;
  couleursModif.site[inp.dataset.site] = v;
  document.documentElement.style.setProperty('--' + inp.dataset.site, v);   // les pièces et meubles de ce numéro suivent
  montrer('btn-couleurs', true);
}

/* « Enregistrer les couleurs » (ou on quitte l'écran) : gardées ici, puis envoyées sans rien bloquer. */
function envoyerCouleurs() {
  const site = couleursModif.site, meubles = couleursModif.meubles;
  couleursModif = { site: {}, meubles: {} };
  montrer('btn-couleurs', false);
  if (!Object.keys(site).length && !Object.keys(meubles).length) return;
  const a = lireAttenteCouleurs();
  Object.assign(a.site, site); Object.assign(a.meubles, meubles);
  ecrireAttenteCouleurs(a);
  const c = lireCache();                                   // le cache suit : la palette tient au prochain démarrage
  if (c) {
    c.couleurs = c.couleurs || [];
    Object.keys(site).forEach(nom => {
      const r = c.couleurs.find(x => String(x[1]) === SECTEUR_ID && String(x[2]) === nom);
      if (r) r[3] = site[nom]; else c.couleurs.push(['', SECTEUR_ID, nom, site[nom]]);
    });
    (c.emps || []).forEach(r => { if (meubles[r[0]] !== undefined) r[5] = meubles[r[0]]; });
    ecrireCache(c);
    COULEURS = c.couleurs;
  }
  expedierCouleurs();
}
/* Envoie l'attente, en arrière-plan (la file de coffre.js garde un appel à la fois).
   Succès : on retire ce qui a été confirmé. Échec : tout reste, et repart au prochain passage. */
async function expedierCouleurs() {
  const a = lireAttenteCouleurs();
  if ((!Object.keys(a.site).length && !Object.keys(a.meubles).length) || envoiCouleurs) return;
  envoiCouleurs = true;
  let ok = false;
  try {
    const r = await Coffre.couleurs({ secteurId: SECTEUR_ID, site: a.site, meubles: a.meubles });
    if (!r || !r.ok) throw new Error((r && r.erreur) || 'refus');
    const reste = lireAttenteCouleurs();                   // retirer seulement ce qui n'a pas rechangé entre-temps
    Object.keys(a.site).forEach(k => { if (reste.site[k] === a.site[k]) delete reste.site[k]; });
    Object.keys(a.meubles).forEach(k => { if (reste.meubles[k] === a.meubles[k]) delete reste.meubles[k]; });
    ecrireAttenteCouleurs(reste);
    ok = true;
    avis('Couleurs enregistrées ✓', 'succes');
  } catch (e) {
    avis('Couleurs pas encore enregistrées — elles repartiront toutes seules', 'erreur');
  } finally {
    envoiCouleurs = false;
    const reste = lireAttenteCouleurs();
    if (ok && (Object.keys(reste.site).length || Object.keys(reste.meubles).length)) expedierCouleurs();
  }
}

/* Ajouter un meuble : on touche une pastille de la palette. */
function surPaletteMeuble(ev) {
  const b = ev.target.closest('.pastille-choix');
  if (!b) return;
  couleurNouveau = b.dataset.num;
  $('meuble-palette').innerHTML = htmlPalette(couleurNouveau);
}

/* Ajoute un espace (tablette…) à un meuble, sans quitter la liste ni fermer l'accordéon. */
async function ajouterEspace(meubleId, btn) {
  const corps = btn.closest('.accordeon-corps');
  const input = corps.querySelector('.espace-nouveau');
  const nom = input.value.trim();
  if (!nom) { input.focus(); return; }
  btn.disabled = true;
  montrerVoile(true);
  try {
    // Emplacements : ID · Nom · ParentID(=meuble) · SecteurID · Actif · Couleur (vide pour un espace)
    const r = await Coffre.ajouter('Emplacements', ['', nom, meubleId, SECTEUR_ID, 'O', '']);
    if (!r || !r.ok) throw new Error((r && r.erreur) || 'refus');
    const liste = (ESPACES[meubleId] = ESPACES[meubleId] || []);
    liste.push({ id: r.id, nom: nom });
    const c = lireCache(); if (c) { (c.emps = c.emps || []).push([r.id, nom, meubleId, SECTEUR_ID, 'O', '']); ecrireCache(c); }
    const saisie = corps.lastElementChild;               // la ligne d'ajout
    const avant = saisie.previousElementSibling;         // l'ancien dernier espace : sa ↓ se rallume
    if (avant && avant.dataset.type === 'e') avant.querySelector('.fleche-bas').classList.remove('fleche-eteinte');
    saisie.insertAdjacentHTML('beforebegin', htmlEspace(liste[liste.length - 1], liste.length - 1, liste));
    input.value = '';
  } catch (e) {
    input.placeholder = 'Échec — réessaie';
  } finally { btn.disabled = false; montrerVoile(false); }
}

/* ---------- Branchements ---------- */
function initEntree() {
  requestAnimationFrame(placerTitre);   // dès l'ouverture : le titre au-dessus de ce qui est posé sur la photo
  // connexion
  $('btn-entrer').addEventListener('click', entrer);
  $('mdp').addEventListener('keydown', e => { if (e.key === 'Enter') entrer(); });
  // page d'ouverture : menu burger + items
  $('btn-burger').addEventListener('click', basculerMenu);
  $('menu-ouverture').addEventListener('click', montrerAccueil);   // 1er item = retour à l'ouverture
  $('menu-outils').addEventListener('click', () => montrerGrilleMenu('outils'));
  $('menu-outils-retour').addEventListener('click', () => montrerGrilleMenu('principal'));
  $('menu').addEventListener('touchstart', surToucheDebut, { passive: true });
  $('menu').addEventListener('touchend', surToucheFin);
  $('menu-bases').addEventListener('click', () => montrerGrilleMenu('bases'));
  $('menu-bases-retour').addEventListener('click', () => montrerGrilleMenu('outils'));
  // les 8 bases : chacune ouvrira sa propre page; d'ici là, toutes ouvrent Gérer les bases au complet (accord de J-C)
  document.querySelectorAll('[data-base]').forEach(b => b.addEventListener('click', b.dataset.base === 'pieces' ? montrerPieces : montrerBases));
  $('menu-couleurs').addEventListener('click', montrerCouleurs);
  // le menu mène exactement où mènent les 4 boutons de l'accueil
  $('menu-ajouter').addEventListener('click', montrerChoixQuoi);
  $('menu-deplacer').addEventListener('click', montrerDeplacer);   // Rechercher reste la loupe, en haut à gauche
  $('menu-consommer').addEventListener('click', montrerConsommer);
  $('menu-listes').addEventListener('click', montrerListes);
  // Outils → Couleurs
  $('liste-couleurs').addEventListener('input', surHex);
  $('liste-couleurs').addEventListener('click', function (ev) {
    const tete = ev.target.closest('.accordeon-tete');
    if (tete) toggleAccordeon(tete); else surChoixCouleur(ev);
  });
  $('btn-couleurs').addEventListener('click', envoyerCouleurs);
  $('meuble-palette').addEventListener('click', surPaletteMeuble);
  $('menu-deco').addEventListener('click', deconnexion);
  // Outils → gérer les bases → ajouter un meuble
  $('btn-ajout-meuble').addEventListener('click', montrerMeuble);
  $('btn-ordre').addEventListener('click', envoyerOrdre);
  // Gérer les bases → Pièces
  $('btn-ordre-pieces').addEventListener('click', envoyerOrdre);
  $('btn-piece-ajouter').addEventListener('click', ajouterPiece);
  $('piece-nouvelle').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); ajouterPiece(); } });
  $('pieces-retour').addEventListener('click', () => { ouvrirMenu(); montrerGrilleMenu('bases'); });   // le menu, sur la grille des 8 bases
  $('liste-pieces').addEventListener('click', function (ev) {
    const cr = ev.target.closest('.crayon');               // avant la tête : le crayon n'ouvre ni ne ferme rien
    if (cr) { ouvrirRenommer(cr); return; }
    const fl = ev.target.closest('.fleche');               // idem pour une flèche
    if (fl) { if (!fl.classList.contains('fleche-eteinte')) deplacer(fl.dataset.type, fl.dataset.id, Number(fl.dataset.sens)); return; }
    const pa = ev.target.closest('.pastille-choix');
    if (pa) { choisirCouleurPiece(pa.closest('.accordeon').dataset.id, pa.dataset.num); return; }
    const tete = ev.target.closest('.accordeon-tete');
    if (tete) toggleAccordeon(tete);
  });
  // l'app passe en arrière-plan (onglet fermé, iPad verrouillé) : l'ordre bougé part quand même
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { envoyerOrdre(); envoyerCouleurs(); return; }
    retourDansApp();   // on revient dans l'app : les entrées de l'autre appareil arrivent toutes seules
  });
  $('btn-meuble-enr').addEventListener('click', enregistrerMeuble);
  $('meuble-annuler').addEventListener('click', montrerBases);
  // changer la pièce d'un meuble (menu déroulant généré)
  $('liste-meubles').addEventListener('change', function (ev) {
    const sel = ev.target.closest('.choix-piece');
    if (sel) assignerPiece(sel.getAttribute('data-meuble'), sel.value, sel);
  });
  // liste des meubles (éléments générés) : ouvrir/fermer un accordéon, ajouter un espace
  $('liste-meubles').addEventListener('click', function (ev) {
    const cr = ev.target.closest('.crayon');               // avant la tête : le crayon n'ouvre ni ne ferme rien
    if (cr) { ouvrirRenommer(cr); return; }
    const fl = ev.target.closest('.fleche');               // avant la tête : une flèche n'ouvre ni ne ferme rien
    if (fl) { if (!fl.classList.contains('fleche-eteinte')) deplacer(fl.dataset.type, fl.dataset.id, Number(fl.dataset.sens)); return; }
    const bAjout = ev.target.closest('.ajout-espace');
    if (bAjout) { ajouterEspace(bAjout.getAttribute('data-meuble'), bAjout); return; }
    const tete = ev.target.closest('.accordeon-tete');
    if (tete) toggleAccordeon(tete);
  });
  $('liste-noms').addEventListener('click', function (ev) {   // catégories et aliments : le crayon, ou plier/déplier
    const fl = ev.target.closest('.fleche');               // l'ordre des endroits d'un aliment
    if (fl) { if (!fl.classList.contains('fleche-eteinte')) monterEndroit(fl.dataset.id, Number(fl.dataset.sens)); return; }
    const ru = ev.target.closest('[data-reunir]');         // « … existe déjà : les réunir ? » Oui
    if (ru) { reunirNoms(ru.dataset.reunir); return; }
    if (ev.target.closest('[data-reunir-non]')) { rafraichirBases(); return; }
    const pas = ev.target.closest('[data-pas-aime]');      // « Pas aimé » : Enlever
    if (pas) { enleverPasAime(pas); return; }
    const cr = ev.target.closest('.crayon');
    if (cr) { ouvrirRenommer(cr); return; }
    const tete = ev.target.closest('.accordeon-tete');
    if (tete) toggleAccordeon(tete);
  });
  document.querySelectorAll('.accordeon-tete[data-toggle]').forEach(tete =>
    tete.addEventListener('click', () => toggleAccordeon(tete)));
  $('btn-rechercher').addEventListener('click', ouvrirRecherche);   // la loupe, en haut à gauche
  // Rechercher : chaque lettre tapée relance la recherche (en mémoire, instantané)
  $('recherche-texte').addEventListener('input', surRecherche);
  $('recherche-texte').addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const seul = $('recherche-resultats').querySelectorAll('[data-pid]');
    if (seul.length === 1) montrerRayon(seul[0].dataset.pid); else $('recherche-texte').blur();   // un seul trouvé : on l'ouvre; sinon le clavier se ferme
  });
  $('recherche-scan').addEventListener('click', scannerPourChercher);
  $('recherche-retour').addEventListener('click', retourDeRecherche);
  $('vue-recherche').addEventListener('click', surClicRecherche);
  $('liste-inventaire').addEventListener('click', function (ev) {   // pièces et meubles de l'inventaire
    const lot = ev.target.closest('.crayon[data-lot]');    // « Pas encore rangé » : le crayon range
    if (lot) { ouvrirLot(lot); return; }
    if (ev.target.closest('.endroit')) return;             // toucher la carte ouverte ne plie pas l'accordéon
    const aliment = ev.target.closest('.aliment-tete');    // un aliment à plusieurs sortes : on les montre
    if (aliment) { toggleAccordeon(aliment); return; }
    const tete = ev.target.closest('.accordeon-tete');
    if (tete) toggleAccordeon(tete);
  });            // bouton bleu → la page des listes
  $('btn-retour-listes').addEventListener('click', montrerAccueil);
  $('choix-produit').addEventListener('click', () => montrerFormulaire(false));   // l'entonnoir, et le scan à côté
  $('choix-epicerie').addEventListener('click', () => avis("Toute l'épicerie — à venir"));
  $('fiche-scan').addEventListener('click', () => {
    if (typeof montrerScanner === 'function') montrerScanner({ lu: ouvrirFicheScan, retour: () => montrerFormulaire(false) });
  });
  $('btn-retour-quoi').addEventListener('click', montrerAccueil);        // retour : choix « quoi » → accueil
  // formulaire d'entrée
  $('codebarres').addEventListener('change', surCode);
  $('nom').addEventListener('input', surNom);    // réagit pendant la saisie : plus besoin de fermer le clavier
  $('nom').addEventListener('change', surNom);
  $('produit').addEventListener('change', surProduit);

  // un produit proposé parce qu'il ressemble : on le prend
  $('liste-doublons').addEventListener('click', function (ev) {
    const b = ev.target.closest('[data-doublon]');
    if (b) adopterProduit(b.dataset.doublon);
  });
  // le format : « Autre… » ouvre le champ d'une nouvelle unité
  $('format-unite').addEventListener('change', function () {
    const autre = $('format-unite').value === 'autre';
    montrer('bloc-unite-autre', autre);
    if (autre) $('unite-autre').focus();
  });
  // Outils -> qui entre les articles
  $('menu-qui').addEventListener('click', montrerQui);
  $('btn-qui-enr').addEventListener('click', enregistrerQui);
  $('qui-nom').addEventListener('keydown', e => { if (e.key === 'Enter') enregistrerQui(); });   // comme le mot de passe
  $('cat').addEventListener('change', surCategorie);
  $('btn-cat-neuve').addEventListener('click', ajouterCategorie);
  $('btn-souscat-neuve').addEventListener('click', ajouterSousCategorie);
  $('cat-neuve').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); ajouterCategorie(); } });
  $('souscat-neuve').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); ajouterSousCategorie(); } });
  $('souscat').addEventListener('change', surSousCategorie);
  Object.keys(CHOIX_FICHE).forEach(ch => {             // marque, saveur, magasin : « Nouvelle… » puis Ajouter (ou Entrée)
    $(ch).addEventListener('change', () => surChoix(ch));
    $('btn-' + ch + '-neuve').addEventListener('click', () => ajouterChoix(ch));
    $(ch + '-neuve').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); ajouterChoix(ch); } });
  });
  $('btn-endroit').addEventListener('click', () => ajouterEndroit());
  $('btn-transit').addEventListener('click', () => pasEncoreRange(true));
  $('btn-ranger').addEventListener('click', () => pasEncoreRange(false));
  $('btn-enregistrer').addEventListener('click', enregistrer);
  $('btn-annuler').addEventListener('click', montrerChoixQuoi);
  // reste connecté → page d'ouverture, le chariot par-dessus jusqu'à ce que tout soit là
  if (Coffre.motDePasse()) { if (localStorage.getItem(QUI)) montrerAccueil(); else montrerQui(); chargerAvecChariot(); }
}
/* On revient dans l'app (retour d'arrière-plan, réveil de l'iPad) : on relit les listes
   en arrière-plan, sans rien bloquer, et on redessine l'inventaire s'il est à l'écran.
   On ne rappelle pas si ça vient d'être fait, ni si l'on est en train d'écrire quelque part. */
async function retourDansApp() {
  if (!Coffre.motDePasse()) return;
  if (Date.now() - dernierChargement < FRAICHEUR) return;
  if (!$('vue-app').hidden || !$('vue-meuble').hidden) return;   // une saisie en cours : on ne touche à rien
  await chargerReferences();
  if (!$('vue-listes').hidden && !document.querySelector('#liste-inventaire .endroit')) remplirInventaire();   // pas pendant un rangement
  if (!$('vue-bases').hidden && !Object.keys(ordreModifie).length && !document.querySelector('.champ-renommer, #liste-noms .endroit')) rafraichirBases();   // pas pendant une correction de nom ou d'endroit
  if (!$('vue-pieces').hidden && !Object.keys(ordreModifie).length && !document.querySelector('.champ-renommer')) remplirPieces();
}

document.addEventListener('DOMContentLoaded', initEntree);

/* Dès que ce script est lu, AVANT l'affichage : la dernière palette connue (cache) est posée,
   pour ne jamais voir un éclair des anciennes couleurs. */
(function () { const c = lireCache(); if (c) appliquer(c); })();
