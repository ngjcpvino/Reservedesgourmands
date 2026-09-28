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
var MAGASINS = [];          // les magasins déjà utilisés (on propose au lieu de faire taper)
const UNITES_BASE = ['unité', 'g', 'kg', 'ml', 'L'];   // le départ; toute unité déjà utilisée s'y ajoute
const QUI = 'rdg_qui';      // qui se sert de l'app sur CET appareil
var opCourant = null;                                   // jeton anti-reclic de l'article en cours
var SECTEUR_ID = '';                                    // secteur de cette app (Épicerie), déduit des données
const CACHE = 'rdg_ref_v2';
const ATTENTE = 'rdg_ordre_attente';   // ordres pas encore confirmés par le coffre-fort (survit à une fermeture)
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
/* Les codes hex d'avant les numéros (2026-09-25) : un meuble qui porte encore un code hex
   est relié au numéro qui avait cette teinte à l'origine, et suit ensuite la palette. */
const ANCIENS_HEX = {
  '#ffffff': '101', '#fff9ec': '103', '#fff2d6': '104', '#f5efe6': '105', '#f5f0e6': '106', '#e8ddd0': '201',
  '#ffe0b2': '202', '#ffd9a8': '203', '#f2d7a0': '204', '#d4c4b0': '205', '#c4b896': '206', '#a1887f': '301',
  '#a08060': '302', '#c77d4b': '303', '#8d4b20': '304', '#6b4f3a': '305', '#3d2b1f': '306', '#c9372d': '401',
  '#c0392b': '402', '#6b1e25': '403', '#5c1d20': '404', '#ffcc80': '501', '#f39c12': '502', '#ff8f00': '503',
  '#e08a00': '504', '#ef6c00': '505', '#c76a1f': '506', '#b85c00': '507', '#fff3c0': '601', '#ffe8b0': '602',
  '#f2ebbf': '603', '#ffc400': '604', '#ffb300': '605', '#f9a825': '606', '#c9952e': '607', '#afc5af': '701',
  '#6baf2e': '702', '#5a8a65': '703', '#5a6b3c': '704', '#a5c4de': '801', '#2a4566': '802', '#2c3e6b': '803',
  '#8f939d': '901', '#3e4042': '902', '#000000': '903'
};
const ATTENTE_COULEURS = 'rdg_couleurs_attente';   // couleurs pas encore confirmées par le coffre-fort
var STOCK = [];                                     // lignes de STOCK : ce qu'on possède, pour la liste « Inventaire »
var COULEURS = [];                                  // lignes de l'onglet Couleurs : [ID, SecteurID, Nom, Valeur]
var couleursModif = { site: {}, meubles: {} };      // changées à l'écran, pas encore envoyées
var envoiCouleurs = false;
var couleurNouveau = '305';                         // « Ajouter un meuble » : le numéro choisi                          // un envoi de couleurs est en route
var dernierChargement = 0;                          // quand les listes ont été relues (pour ne pas appeler pour rien)
const FRAICHEUR = 30000;                            // au retour dans l'app, on relit si ça date de plus de 30 s

/* ---------- Vues : connexion → page d'ouverture → formulaire ---------- */
function toutCacher() {
  requestAnimationFrame(placerTitre);   // la nouvelle feuille affichée : le titre du site se place au-dessus d'elle
  if (!$('vue-bases').hidden) envoyerOrdre();   // on quitte « Gérer les bases » : l'ordre part tout seul
  if (!$('vue-couleurs').hidden) envoyerCouleurs();   // idem pour « Couleurs »
  $('vue-connexion').hidden = true;
  $('vue-couleurs').hidden = true;
  $('vue-qui').hidden = true;
  $('vue-accueil').hidden = true;
  $('vue-listes').hidden = true;
  $('vue-recherche').hidden = true;
  $('vue-choix-quoi').hidden = true;
  $('vue-choix-comment').hidden = true;
  $('vue-app').hidden = true;
  $('vue-bases').hidden = true;
  $('vue-meuble').hidden = true;
  $('vue-piece').hidden = true;
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
  $('meuble-palette').innerHTML = htmlPalette(couleurNouveau);
}
function montrerPiece()  { toutCacher(); $('vue-piece').hidden = false; $('piece-msg').textContent = ''; }
function montrerChoixQuoi()    { toutCacher(); $('vue-choix-quoi').hidden = false; $('btn-burger').hidden = false; $('btn-rechercher').hidden = false; $('entete-photo').hidden = false; }
function montrerChoixComment() { toutCacher(); $('vue-choix-comment').hidden = false; $('btn-burger').hidden = false; $('btn-rechercher').hidden = false; $('entete-photo').hidden = false; }
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
      if (d.marque) $('marque').value = d.marque;
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
  if (!localStorage.getItem(QUI)) {  // 1re fois sur cet appareil : on VÉRIFIE avant de demander le nom (une seule attente)
    montrerVoile(true);
    const ok = await chargerReferences();
    montrerVoile(false);
    if (ok === false) return;        // refusé : on est déjà revenu au mot de passe
    montrerQui();                    // personne de nommé ici : on demande AVANT la 1re entrée
    return;
  }
  montrerAccueil();                  // login optimiste : aucun appel bloquant
  chargerReferences();               // en arrière-plan : les couleurs à jour (et un mauvais mot de passe se voit)
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
  montrerOutils(false);
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
/* Outils : ses 4 icônes prennent la place des 6; Retour les rend. */
window.addEventListener('resize', () => placerTitre());
function montrerOutils(on) {
  $('menu-principal').hidden = on;
  $('menu-outils-grille').hidden = !on;
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
      el.querySelectorAll('.accordeon-tete.ouvert').forEach(function (t) {
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

/* Un appel, réessayé jusqu'à 3 fois. Retourne les lignes. */
async function lireRetry(table) {
  let err;
  for (let i = 0; i < 3; i++) {
    try {
      const r = await Coffre.lire(table);
      if (r && r.ok) return r.lignes || [];
      if (r && r.erreur === 'non autorisé') throw new Error('non autorisé'); // inutile de réessayer
      err = new Error((r && r.erreur) || 'refus');
    } catch (e) { if (e.message === 'non autorisé') throw e; err = e; }
    await new Promise(res => setTimeout(res, 500 * (i + 1)));
  }
  throw err;
}

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
  PRODUITS = (d.prods || [])              // [ID,Nom,CategorieID,Unite,Actif,Marque,Format,MarqueCompte,SaveurCompte]
    .filter(r => String(r[4]) !== 'N')
    .map(r => ({ id: r[0], nom: r[1], catId: r[2]
               }));
  MAGASINS = d.magasins || [];
  VARIANTES = d.variantes || {};                      // { produitId: { marques:[], formats:[] } }
  CODES = d.codes || {};                              // { codeBarres: produitId }
  STOCK = d.stock || [];
  COULEURS = d.couleurs || [];                        // [ID, SecteurID, Nom, Valeur]
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
    appliquer(data); ecrireCache(data); remplirListes(); statut('');
    expedierOrdre();                              // le réseau répond : on en profite pour renvoyer l'attente
    expedierCouleurs();                           // idem pour les couleurs (sinon un appareil garde les siennes)
    return true;
  } catch (e) {
    if (e.message === 'non autorisé') { Coffre.oublier(); revenirConnexion('Mot de passe refusé.'); return false; }
    if (!cache) statut('Réseau lent — patiente un instant ou recharge la page.', 'erreur');
    return null;
  }
}

async function chargerData() {
  try {
    const r = await Coffre.references();          // chemin rapide : UN seul appel
    if (r && r.ok && r.categories !== undefined) return { cats: r.categories, emps: r.emplacements, prods: r.produits, stock: r.stock, variantes: r.variantes, codes: r.codes, couleurs: r.couleurs, magasins: r.magasins };
    if (r && r.erreur === 'non autorisé') throw new Error('non autorisé');
  } catch (e) { if (e.message === 'non autorisé') throw e; }   // sinon on tente le repli
  const cats = await lireRetry('Categories');     // repli : 3 appels un à la fois
  const emps = await lireRetry('Emplacements');
  const prods = await lireRetry('Produits');
  return { cats: cats, emps: emps, prods: prods };
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
  $('nom').value = ''; $('marque').value = ''; $('saveur').value = '';
  poserFormat('');
  $('magasin').value = ''; $('prix').value = '';
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

/* Remplit les suggestions (datalist) de marque/format pour un produit. */
function remplirVariantes(pid) {
  const vr = (pid && VARIANTES[pid]) || { marques: [], formats: [], saveurs: [] };
  const opts = liste => (liste || []).map(x => '<option value="' + esc(x) + '"></option>').join('');
  $('dl-marques').innerHTML = opts(vr.marques);
  $('dl-saveurs').innerHTML = opts(vr.saveurs);
  remplirUnites();
  $('dl-magasins').innerHTML = opts(MAGASINS);
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
  remplirVariantes(pid);                                   // choix déjà inscrits (datalists)
  $('marque').value = (vr && vr.derniereMarque) || '';
  poserFormat((vr && vr.dernierFormat) || '');
  $('endroits').innerHTML = '';
  let n = 0;
  ((vr && vr.emplacements) || []).forEach(empId => {
    const e = resoudreEmp(empId);
    if (e) { ajouterEndroit({ pieceId: e.pieceId, meubleId: e.meubleId, espaceId: e.espaceId, qte: '' }); n++; }
  });
  if (!n) ajouterEndroit();                                // aucun emplacement connu -> une carte vierge
}

/* Retient localement marque/format/emplacements d'un produit (suggestions immédiates + cache). */
function memoriserVariante(pid, marque, format, endroits) {
  if (!pid) return;
  const vr = VARIANTES[pid] || (VARIANTES[pid] = { marques: [], formats: [], emplacements: [], derniereMarque: '', dernierFormat: '' });
  vr.marques = vr.marques || []; vr.formats = vr.formats || []; vr.emplacements = vr.emplacements || [];
  if (marque) { if (vr.marques.indexOf(marque) === -1) vr.marques.push(marque); vr.derniereMarque = marque; }
  if (format) { if (vr.formats.indexOf(format) === -1) vr.formats.push(format); vr.dernierFormat = format; }
  (endroits || []).forEach(e => { if (e.emp && vr.emplacements.indexOf(e.emp) === -1) vr.emplacements.push(e.emp); });
  const c = lireCache(); if (c) { (c.variantes = c.variantes || {})[pid] = vr; ecrireCache(c); }
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

  const marque = $('marque').value.trim(), format = formatSaisi(), code = $('codebarres').value.trim();
  const saveur = $('saveur').value.trim(), magasin = $('magasin').value.trim(), prix = $('prix').value.trim();
  const qui = localStorage.getItem(QUI) || '';        // posé une fois dans Outils, gardé sur l'appareil
  if (!opCourant) opCourant = 'op-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  statut('Enregistrement…');
  $('btn-enregistrer').disabled = true;
  montrerVoile(true);
  try {
    const commun = { marque: marque, format: format, saveur: saveur, code: code, magasin: magasin, prix: prix,
                     qui: qui, endroits: endroits, opId: opCourant };
    const charge = nouveau
      ? Object.assign({ produit: [nom, scid] }, commun)
      : Object.assign({ produitId: produitId }, commun);
    const r = await Coffre.entrerArticle(charge);          // UN seul appel
    if (r && r.ok) { produitId = r.produitId || produitId; }
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
    endroits.forEach(x => {                                   // l'inventaire est à jour sans recharger
      const ligne = ['', produitId, x.emp, x.qte, dateJour, marque, x.format || format, opCourant, code, saveur, qui, magasin, prix];
      STOCK.push(ligne);
      const c2 = lireCache(); if (c2) { (c2.stock = c2.stock || []).push(ligne.slice()); ecrireCache(c2); }
    });
    if (magasin && MAGASINS.indexOf(magasin) === -1) MAGASINS.push(magasin);
    memoriserVariante(produitId, marque, format, endroits);   // marque/format/emplacements à jour tout de suite
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
  msg.className = 'message'; msg.textContent = 'Enregistrement…';
  $('btn-meuble-enr').disabled = true;
  montrerVoile(true);
  try {
    // Emplacements : ID · Nom · ParentID(vide = meuble) · SecteurID · Actif · Couleur
    const r = await Coffre.ajouter('Emplacements', ['', nom, '', SECTEUR_ID, 'O', couleur]);
    if (!r || !r.ok) throw new Error((r && r.erreur) || 'refus');
    MEUBLES.push({ id: r.id, nom: nom, couleur: couleur });   // dispo tout de suite dans l'entrée
    const c = lireCache(); if (c) { (c.emps = c.emps || []).push([r.id, nom, '', SECTEUR_ID, 'O', couleur]); ecrireCache(c); }
    msg.className = 'message message-succes'; msg.textContent = 'Meuble ajouté ✓';
    $('meuble-nom').value = '';
  } catch (e) {
    msg.className = 'message message-erreur'; msg.textContent = 'Échec : ' + e.message;
  } finally { $('btn-meuble-enr').disabled = false; montrerVoile(false); }
}

/* Ajouter une pièce (= un emplacement dont le parent est le SECTEUR). */
async function enregistrerPiece() {
  const nom = $('piece-nom').value.trim();
  const msg = $('piece-msg');
  if (!nom) { msg.className = 'message message-erreur'; msg.textContent = 'Donne un nom à la pièce.'; return; }
  msg.className = 'message'; msg.textContent = 'Enregistrement…';
  $('btn-piece-enr').disabled = true;
  montrerVoile(true);
  try {
    const r = await Coffre.ajouter('Emplacements', ['', nom, SECTEUR_ID, SECTEUR_ID, 'O', '']);
    if (!r || !r.ok) throw new Error((r && r.erreur) || 'refus');
    PIECES.push({ id: r.id, nom: nom });
    const c = lireCache(); if (c) { (c.emps = c.emps || []).push([r.id, nom, SECTEUR_ID, SECTEUR_ID, 'O', '']); ecrireCache(c); }
    msg.className = 'message message-succes'; msg.textContent = 'Pièce ajoutée ✓';
    $('piece-nom').value = '';
  } catch (e) {
    msg.className = 'message message-erreur'; msg.textContent = 'Échec : ' + e.message;
  } finally { $('btn-piece-enr').disabled = false; montrerVoile(false); }
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
  return '<option value="">— à ranger —</option>' + PIECES.map(function (p) {
    return '<option value="' + esc(p.id) + '"' + (String(p.id) === String(sel) ? ' selected' : '') + '>' + esc(p.nom) + '</option>';
  }).join('');
}
/* La couleur d'une pièce ou d'un meuble : un NUMÉRO de la palette (« 305 »).
   Un ancien code hex est relié au numéro qui avait cette teinte (ANCIENS_HEX). */
function numeroCouleur(v) {
  const s = String(v == null ? '' : v).trim();
  if (/^\d{3}$/.test(s)) return s;
  const h = hexValide(s);
  return (h && ANCIENS_HEX[h]) || '';
}
/* La teinte à peindre, en code hex (celle de la palette en ce moment). */
function couleurDe(v) {
  const n = numeroCouleur(v);
  return n ? couleurActuelle('couleur-' + n) : hexValide(v);
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
    return '<div class="accordeon" data-type="p" data-id="' + esc(p.id) + '"><div class="accordeon-tete"><span>' + esc(p.nom) + '</span>' + crayon('e:' + p.id) +
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
   Clé = type + id : « e » pièce/meuble/espace (Emplacements) · « c » catégorie · « a » aliment (Produits). */
const TABLES_NOM = { e: ['Emplacements', 'emps'], c: ['Categories', 'cats'], a: ['Produits', 'prods'] };
function crayon(cle) {
  return '<button class="crayon" type="button" data-renommer="' + esc(cle) + '" aria-label="Corriger le nom"></button>';
}
/* Les objets en mémoire qui portent ce nom (pour que tout l'écran suive tout de suite). */
function objetsNommes(type) {
  if (type === 'e') return PIECES.concat(MEUBLES, ...Object.values(ESPACES));
  if (type === 'c') return RAYONS.concat(...Object.values(SOUSCATS));
  return PRODUITS;
}
function rafraichirBases() { remplirMeubles(true); remplirNoms(true); }
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
  const row = c && c[T[1]] && c[T[1]].find(r => String(r[0]) === String(id));
  if (!nom || !row || String(row[1]) === nom) { rafraichirBases(); return; }   // vide ou inchangé : rien à faire
  const ligne = row.slice(); ligne[1] = nom;
  montrerVoile(true);
  try {
    const r = await Coffre.modifier(T[0], id, ligne);          // réécrit la même ligne : un 2e envoi ne change rien
    if (!r || !r.ok) throw new Error((r && r.erreur) || 'refus');
    row[1] = nom; ecrireCache(c);
    objetsNommes(type).forEach(x => { if (String(x.id) === String(id)) x.nom = nom; });
    remplirListes();
  } catch (e) {
    avis('Nom pas corrigé — réessaie', 'erreur');
  } finally { montrerVoile(false); rafraichirBases(); }
}
/* ---------- Corriger l'endroit d'un lot, ou ranger ce qui n'est pas encore rangé ----------
   Un lot = ce que l'Inventaire montre sur une ligne : aliment + marque + saveur, à un endroit.
   Déjà rangé : le crayon CORRIGE une erreur de saisie (tablette 2 au lieu de 3) -> TOUT le lot bouge.
   Pas encore rangé (endroit vide, « en transit ») : le crayon RANGE, avec une quantité -> le reste attend.
   Déplacer une partie d'un lot déjà rangé, c'est autre chose (plus tard, avec Consommer). */
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
  const detail = [l.marque, l.saveur, l.formats.join(' + ')].filter(Boolean).join(' · ');
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
/* Porte q du lot vers emp, ligne de STOCK par ligne, une à la fois (jamais en parallèle).
   Une ligne qui entre au complet : on réécrit son endroit. Une ligne coupée en deux (ranger une partie) :
   la part rangée devient une nouvelle entrée (entrerArticle, jeton anti-reclic), puis la ligne d'origine
   garde le reste. Le jeton est fait de la ligne, de sa quantité, de l'endroit et de la part :
   un 2e appui après une erreur renvoie le même jeton, et le coffre-fort n'écrit rien deux fois. */
async function deplacerLot(lot, emp, q) {
  if (!emp || emp === lot.emp || !(q > 0)) { redessinerLots(); return; }
  montrerVoile(true);
  let c = null;
  try {
    if (lot.lignes.some(id => !id)) {                 // une entrée toute fraîche n'a pas encore son ID : on relit STOCK d'abord
      if (!await chargerReferences()) throw new Error('réseau');
      lot = (lotsParProduit()[lot.pid] || []).find(x => x.emp === lot.emp && x.marque === lot.marque && x.saveur === lot.saveur);
      if (!lot || lot.lignes.some(id => !id)) throw new Error('introuvable');
      q = Math.min(q, lot.qte);
    }
    c = lireCache();
    const enCache = id => c && (c.stock || []).find(x => String(x[0]) === id);
    let reste = q;
    for (const id of lot.lignes) {
      if (reste <= 0) break;
      const row = STOCK.find(r => String(r[0]) === id);
      if (!row || String(row[2]) === emp) continue;   // déjà faite (2e appui après une erreur) : rien à refaire
      const qte = Number(row[3]) || 0;
      if (qte <= 0) continue;
      if (qte <= reste) {                             // toute la ligne va à l'endroit
        const ligne = row.slice(); ligne[2] = emp; ligne[4] = dateCourte(ligne[4]);
        const r = await Coffre.modifier('Stock', id, ligne);   // réécrit la même ligne : un 2e envoi ne change rien
        if (!r || !r.ok) throw new Error((r && r.erreur) || 'refus');
        row[2] = emp; const rc = enCache(id); if (rc) rc[2] = emp;
        reste -= qte;
      } else {                                        // la ligne se coupe : « reste » part, le reste attend
        const part = reste, op = 'ranger-' + id + '-' + qte + '-' + emp + '-' + part;
        const r1 = await Coffre.entrerArticle({ produitId: row[1], marque: row[5], format: row[6], saveur: row[9], code: row[8],
          magasin: row[11], prix: row[12], qui: row[10], endroits: [{ emp: emp, qte: part }], opId: op });
        if (!r1 || !r1.ok) throw new Error((r1 && r1.erreur) || 'refus');
        const ligne = row.slice(); ligne[3] = qte - part; ligne[4] = dateCourte(ligne[4]);
        const r2 = await Coffre.modifier('Stock', id, ligne);
        if (!r2 || !r2.ok) throw new Error((r2 && r2.erreur) || 'refus');
        row[3] = qte - part; const rc = enCache(id); if (rc) rc[3] = qte - part;
        const neuve = ['', row[1], emp, part, dateDuJour(), row[5], row[6], op, row[8], row[9], row[10], row[11], row[12]];
        STOCK.push(neuve); if (c) (c.stock = c.stock || []).push(neuve.slice());
        reste = 0;
      }
    }
  } catch (e) {
    avis((lot && !lot.emp ? 'Pas rangé' : 'Endroit pas corrigé') + ' — réessaie', 'erreur');
  } finally {
    if (c) ecrireCache(c);
    montrerVoile(false); redessinerLots();
  }
}
/* Catégories et Aliments, sous les pièces : chaque nom avec son crayon. */
function remplirNoms(garderOuverts) {
  const liste = $('liste-noms');
  const ouverts = garderOuverts ? [...liste.querySelectorAll('.accordeon-tete.ouvert')].map(t => t.parentElement.dataset.cle) : [];
  const acc = (cle, tete, corps) => '<div class="accordeon" data-cle="' + esc(cle) + '"><div class="accordeon-tete">' + tete + '</div><div class="accordeon-corps" hidden>' + corps + '</div></div>';
  const ligne = (cle, nom) => '<div class="accordeon-item"><span>' + esc(nom) + '</span>' + crayon(cle) + '</div>';
  LOTS = lotsParProduit();                              // les lots de chaque aliment, sous son nom (corriger l'endroit)
  const aliment = p => ligne('a:' + p.id, p.nom) + (LOTS[p.id] || []).map((l, i) => htmlLot(p.id, i, l)).join('');
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
  liste.innerHTML = acc('cats', 'Catégories', cats || vide('Aucune catégorie')) + acc('alim', 'Aliments', alim || vide('Aucun aliment'));
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
    if (!liste[cle]) liste[cle] = { nom: prod.nom, marque: cleMarque, saveur: cleSaveur, formats: [], qte: 0, total: 0, unite: '' };
    const x = liste[cle];
    x.qte += qte;
    if (format && x.formats.indexOf(format) === -1) x.formats.push(format);
    if (m && (!x.unite || x.unite === m.unite)) { x.unite = m.unite; x.total += m.valeur * qte; }
    else if (m) x.unite = '';                    // des unités mélangées : on ne totalise pas
  });
  return par;
}
/* Les lignes d'un endroit, triées par nom. '' si l'endroit est vide. */
function htmlLignesEndroit(par, empId) {
  const dedans = par[empId];
  if (!dedans) return '';
  return Object.keys(dedans).map(k => dedans[k])
    .sort((a, b) => String(a.nom).localeCompare(String(b.nom), 'fr'))
    .map(x => {
      const mesureTotale = (x.unite && x.total) ? ecrireMesure(x.total, x.unite) : '';
      const format = x.formats.length > 1 ? x.formats.join(' + ') : x.formats[0];
      const detail = [x.marque, x.saveur, format, mesureTotale ? 'total ' + mesureTotale : ''].filter(Boolean).join(' · ');
      return '<div class="item"><div class="item-info"><div class="item-nom">' + esc(x.nom) + '</div>' +
        (detail ? '<div class="item-detail">' + esc(detail) + '</div>' : '') + '</div>' +
        '<span class="item-quantite">' + esc(x.qte) + '</span></div>';
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
  const groupe = (titre, meubles) => {
    const dedans = meubles.map(m => htmlMeubleInventaire(m, par)).join('');
    return dedans ? '<div class="accordeon"><div class="accordeon-tete">' + esc(titre) + '</div>' +
      '<div class="accordeon-corps" hidden>' + dedans + '</div></div>' : '';
  };
  PIECES.forEach(p => { html += groupe(p.nom, MEUBLES.filter(m => String(m.pieceId) === String(p.id))); });
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
const RETOURS = { 'vue-accueil': () => montrerAccueil(), 'vue-choix-quoi': () => montrerChoixQuoi(), 'vue-choix-comment': () => montrerChoixComment(),
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
  $('recherche-titre').textContent = 'Rechercher';
  surRecherche();
  if (depuis) $('recherche-texte').focus();   // prêt à taper : le clavier s'ouvre
}
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
    const v = [String(l[5] || '').trim(), String(l[9] || '').trim()].filter(Boolean).join(' ');
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
  if (!trouves.length) { cible.innerHTML = htmlVide('', 'Aucun aliment ne correspond', 'data-ajouter-nom'); return; }
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
function montrerRayon(pid) {
  const prod = PRODUITS.find(p => String(p.id) === String(pid));
  if (!prod) return;
  rechercheJeton++;
  if ($('vue-recherche').hidden) { toutCacher(); $('vue-recherche').hidden = false; $('btn-burger').hidden = false; }
  $('recherche-texte').blur();                     // le clavier se ferme : on regarde
  const par = lotsParProduit();
  const lots = par[prod.id] || [], total = totalLots(lots);
  let corps;
  if (!total) corps = htmlVide('Tu n\'en as plus', '', 'data-ajouter-produit="' + esc(prod.id) + '"');
  else {
    const endroits = [];                             // les lots, regroupés par endroit; « Pas encore rangé » à la fin
    lots.forEach(l => { let e = endroits.find(x => x.emp === l.emp); if (!e) endroits.push(e = { emp: l.emp, lots: [] }); e.lots.push(l); });
    endroits.sort((a, b) => (a.emp ? 0 : 1) - (b.emp ? 0 : 1));
    corps = endroits.map(e => {
      const r = e.emp ? resoudreEmp(e.emp) : null;
      const m = r && MEUBLES.find(x => String(x.id) === String(r.meubleId));
      const teinte = m ? couleurDe(m.couleur) : '';
      const style = teinte ? ' style="--meuble:' + esc(teinte) + '"' : '';   // la couleur du meuble est une DONNÉE
      return '<div class="espace-bandeau"' + style + '>' + esc(libelleEndroit(e.emp)) + '</div>' + e.lots.map(l => {
        const nom = [l.marque, l.saveur].filter(Boolean).join(' ') || prod.nom;
        const format = l.formats.join(' + ');
        return '<div class="item"><div class="item-info"><div class="item-nom">' + esc(nom) + '</div>' +
          (format ? '<div class="item-detail">' + esc(format) + '</div>' : '') + '</div>' +
          '<span class="item-quantite">' + esc(l.qte) + '</span></div>';
      }).join('');
    }).join('');
  }
  let html = '<div class="vedette"><div class="vedette-tete"><span>' + esc(prod.nom) + '</span><span>' + esc(total) + '</span></div>' +
    '<div class="vedette-corps">' + corps + '</div></div>';
  const cat = nomCategorie(prod.catId);
  const voisins = prod.catId ? PRODUITS.filter(p => String(p.catId) === String(prod.catId) && String(p.id) !== String(prod.id))
                                       .sort((a, b) => String(a.nom).localeCompare(String(b.nom), 'fr')) : [];
  if (voisins.length) html += '<div class="label">' + (cat ? 'Aussi dans « ' + esc(cat) + ' »' : 'Aussi dans la même catégorie') + '</div>' +
    '<div class="liste-blanche">' + voisins.map(p => htmlLigneAliment(p, totalLots(par[p.id]), '')).join('') + '</div>';
  $('recherche-rayon').innerHTML = html;
  $('recherche-titre').textContent = cat || 'Rechercher';
  montrer('recherche-saisie', false); montrer('recherche-rayon', true);
  window.scrollTo(0, 0);
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
  const qui = trouve ? [[d.nom, d.marque].filter(Boolean).join(' — '), d.format].filter(Boolean).join(' · ') : '';
  const photo = trouve && /^https:\/\//.test(d.photo || '') ? '<img class="photo-produit" src="' + esc(d.photo) + '" alt="">' : '';
  $('recherche-resultats').innerHTML = htmlVide('Tu n\'en as pas', qui || 'Produit inconnu', 'data-ajouter-code="' + esc(code) + '"',
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
  const b = ev.target.closest('[data-ajouter-code], [data-ajouter-nom], [data-ajouter-produit], [data-pid]');
  if (!b) return;
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
  montrer('btn-ordre', true);
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

/* « Enregistrer l'ordre » (ou on quitte l'écran) : l'ordre est gardé ici, puis part sans rien bloquer. */
function envoyerOrdre() {
  const groupes = Object.keys(ordreModifie).map(idsDuGroupe).filter(g => g.length > 1);
  ordreModifie = {};
  montrer('btn-ordre', false);
  if (!groupes.length) return;
  const c = lireCache(); if (c) { reordonnerLignes(c.emps, groupes); ecrireCache(c); }
  ecrireAttente(lireAttente().concat(groupes));
  expedierOrdre();
}
/* Envoie l'attente au coffre-fort, en arrière-plan (la file de coffre.js garde un appel à la fois).
   Succès : l'attente se vide. Échec : elle reste, et repart au prochain passage. */
async function expedierOrdre() {
  const groupes = lireAttente();
  if (!groupes.length || envoiOrdre) return;
  envoiOrdre = true;
  let ok = false;
  try {
    const r = await Coffre.ordonner(groupes);
    if (!r || !r.ok) throw new Error((r && r.erreur) || 'refus');
    ecrireAttente(lireAttente().slice(groupes.length));   // d'autres ont pu s'ajouter pendant l'envoi
    ok = true;
    avis('Ordre enregistré ✓', 'succes');
  } catch (e) {
    avis("Ordre pas encore enregistré — il repartira tout seul", 'erreur');
  } finally {
    envoiOrdre = false;
    if (ok && lireAttente().length) expedierOrdre();       // ce qui s'est ajouté pendant l'envoi
  }
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
/* Une pièce ou un meuble : pastille + nom + son numéro. La toucher ouvre la palette juste dessous. */
function htmlLigneChoix(x, fort) {
  const n = numeroCouleur(x.couleur), teinte = couleurDe(x.couleur);
  return '<div class="accordeon-item accordeon-item-saisie couleur-choix" data-choix="' + esc(x.id) + '">' +
    '<span class="pastille"' + (teinte ? ' style="background:' + esc(teinte) + '"' : '') + '></span>' +
    '<span class="couleur-nom' + (fort ? ' texte-fort' : '') + '">' + esc(x.nom) +
      '<span class="couleur-usage">' + (n ? 'Couleur ' + n : 'aucune couleur') + '</span></span>' +
  '</div><div class="palette" data-palette="' + esc(x.id) + '" hidden></div>';
}
/* L'écran : « Palette » (par famille) puis « Pièces et meubles » (par pièce, comme Gérer les bases).
   garderOuverts : après un changement, les accordéons ouverts le restent. */
function remplirCouleurs(garderOuverts) {
  const liste = $('liste-couleurs');
  const ouverts = garderOuverts ? [...liste.querySelectorAll('.accordeon-tete.ouvert')].map(t => t.parentElement.dataset.cle) : [];
  const accordeon = (cle, titre, corps) => '<div class="accordeon" data-cle="' + esc(cle) + '"><div class="accordeon-tete">' + esc(titre) + '</div><div class="accordeon-corps" hidden>' + corps + '</div></div>';
  const site = FAMILLES.map(([f, titre]) => accordeon('f:' + f, titre,
    COULEURS_SITE.filter(([nom]) => nom.charAt(8) === f)
      .map(([nom, libelle, usage]) => htmlLigneCouleur('data-site', nom, libelle, usageCouleur(nom.slice(8), usage), couleurActuelle(nom))).join(''))).join('');
  let lieux = '';
  const aRanger = MEUBLES.filter(m => !m.pieceId);
  if (aRanger.length) lieux += accordeon('r', 'Meubles sans pièce', aRanger.map(m => htmlLigneChoix(m)).join(''));
  lieux += PIECES.map(p => accordeon('p:' + p.id, p.nom,
    htmlLigneChoix(p, true) + MEUBLES.filter(m => String(m.pieceId) === String(p.id)).map(m => htmlLigneChoix(m)).join(''))).join('');
  liste.innerHTML = accordeon('site', 'Palette', site) +
    accordeon('meubles', 'Pièces et meubles', lieux || '<div class="accordeon-item"><span class="texte-petit texte-pale">Aucune pièce</span></div>');
  liste.querySelectorAll('.accordeon').forEach(a => {
    if (ouverts.indexOf(a.dataset.cle) === -1) return;
    a.firstElementChild.classList.add('ouvert');
    a.children[1].hidden = false;
  });
}
/* Toucher une pièce ou un meuble ouvre sa palette (une seule à la fois); toucher une pastille la choisit. */
function surChoixCouleur(ev) {
  const ligne = ev.target.closest('[data-choix]');
  if (ligne) {
    const pal = ligne.nextElementSibling, ouvrir = pal.hidden;
    $('liste-couleurs').querySelectorAll('.palette').forEach(p => { p.hidden = true; p.innerHTML = ''; });
    if (ouvrir) {
      const x = PIECES.concat(MEUBLES).find(y => String(y.id) === ligne.dataset.choix);
      pal.innerHTML = htmlPalette(x ? numeroCouleur(x.couleur) : '');
      pal.hidden = false;
    }
    return;
  }
  const b = ev.target.closest('.pastille-choix');
  if (!b) return;
  const id = b.closest('[data-palette]').dataset.palette;
  const x = PIECES.concat(MEUBLES).find(y => String(y.id) === id);
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
  $('menu-outils').addEventListener('click', () => montrerOutils(true));
  $('menu-outils-retour').addEventListener('click', () => montrerOutils(false));
  $('menu').addEventListener('touchstart', surToucheDebut, { passive: true });
  $('menu').addEventListener('touchend', surToucheFin);
  $('menu-bases').addEventListener('click', montrerBases);
  $('menu-couleurs').addEventListener('click', montrerCouleurs);
  // le menu mène exactement où mènent les 4 boutons de l'accueil
  $('menu-ajouter').addEventListener('click', montrerChoixQuoi);
  // « à venir » : le menu se referme quand même, comme s'il avait mené quelque part
  $('menu-rechercher').addEventListener('click', () => montrerRecherche(true));
  $('menu-consommer').addEventListener('click', () => { fermerMenu(); avis('Consommer — à venir'); });
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
  // l'app passe en arrière-plan (onglet fermé, iPad verrouillé) : l'ordre bougé part quand même
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { envoyerOrdre(); envoyerCouleurs(); return; }
    retourDansApp();   // on revient dans l'app : les entrées de l'autre appareil arrivent toutes seules
  });
  $('btn-meuble-enr').addEventListener('click', enregistrerMeuble);
  $('meuble-annuler').addEventListener('click', montrerBases);
  $('btn-ajout-piece').addEventListener('click', montrerPiece);
  $('btn-piece-enr').addEventListener('click', enregistrerPiece);
  $('piece-annuler').addEventListener('click', montrerBases);
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
    const lot = ev.target.closest('.crayon[data-lot]');    // le crayon d'un lot : corriger son endroit
    if (lot) { ouvrirLot(lot); return; }
    if (ev.target.closest('.endroit')) return;             // toucher la carte ouverte ne plie pas l'accordéon
    const cr = ev.target.closest('.crayon');
    if (cr) { ouvrirRenommer(cr); return; }
    const tete = ev.target.closest('.accordeon-tete');
    if (tete) toggleAccordeon(tete);
  });
  document.querySelectorAll('.accordeon-tete[data-toggle]').forEach(tete =>
    tete.addEventListener('click', () => toggleAccordeon(tete)));
  $('btn-rechercher').addEventListener('click', () => montrerRecherche(true));   // la loupe, en haut à gauche
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
    const tete = ev.target.closest('.accordeon-tete');
    if (tete) toggleAccordeon(tete);
  });            // bouton bleu → la page des listes
  $('btn-retour-listes').addEventListener('click', montrerAccueil);
  $('choix-produit').addEventListener('click', montrerChoixComment);
  $('choix-epicerie').addEventListener('click', () => avis("Toute l'épicerie — à venir"));
  $('choix-scan').addEventListener('click', () => { if (typeof montrerScanner === 'function') montrerScanner(); });
  $('choix-manuel').addEventListener('click', () => montrerFormulaire(false));
  $('btn-retour-quoi').addEventListener('click', montrerAccueil);        // retour : choix « quoi » → accueil
  $('btn-retour-comment').addEventListener('click', montrerChoixQuoi);   // retour : choix « comment » → choix « quoi »
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
  $('btn-endroit').addEventListener('click', () => ajouterEndroit());
  $('btn-transit').addEventListener('click', () => pasEncoreRange(true));
  $('btn-ranger').addEventListener('click', () => pasEncoreRange(false));
  $('btn-enregistrer').addEventListener('click', enregistrer);
  $('btn-annuler').addEventListener('click', montrerChoixComment);
  // reste connecté → page d'ouverture directement, puis mise à jour en arrière-plan
  // (les couleurs changées sur l'autre appareil arrivent ainsi, sans rien attendre)
  if (Coffre.motDePasse()) { if (localStorage.getItem(QUI)) montrerAccueil(); else montrerQui(); chargerReferences(); }
}
/* On revient dans l'app (retour d'arrière-plan, réveil de l'iPad) : on relit les listes
   en arrière-plan, sans rien bloquer, et on redessine l'inventaire s'il est à l'écran.
   On ne rappelle pas si ça vient d'être fait, ni si l'on est en train d'écrire quelque part. */
async function retourDansApp() {
  if (!Coffre.motDePasse()) return;
  if (Date.now() - dernierChargement < FRAICHEUR) return;
  if (!$('vue-app').hidden || !$('vue-meuble').hidden || !$('vue-piece').hidden) return;   // une saisie en cours : on ne touche à rien
  await chargerReferences();
  if (!$('vue-listes').hidden && !document.querySelector('#liste-inventaire .endroit')) remplirInventaire();   // pas pendant un rangement
  if (!$('vue-bases').hidden && !Object.keys(ordreModifie).length && !document.querySelector('.champ-renommer, #liste-noms .endroit')) rafraichirBases();   // pas pendant une correction de nom ou d'endroit
}

document.addEventListener('DOMContentLoaded', initEntree);

/* Dès que ce script est lu, AVANT l'affichage : la dernière palette connue (cache) est posée,
   pour ne jamais voir un éclair des anciennes couleurs. */
(function () { const c = lireCache(); if (c) appliquer(c); })();
