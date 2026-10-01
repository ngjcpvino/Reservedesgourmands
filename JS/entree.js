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
const ATTENTE_CATS = 'rdg_ordre_categories_attente';     // idem, l'ordre des catégories et sous-catégories (Categories col. G)
var ordreModifie = {};                 // groupes déplacés à l'écran, pas encore envoyés : 'p' · 'm:<pièce>' · 'e:<meuble>'
var envoiOrdre = false;                // un envoi d'ordre est en route
const DELAI_ORDRE = 2000;              // l'ordre part tout seul 2 s après la dernière flèche (J-C, 2026-09-30 : « comme les couleurs »)
var minuterieOrdre = null;

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
var ACHATS = [];                                    // onglet Achats : [ID, ProduitID, Marque, Saveur, Etat, Date, Qui, Actif] — la liste d'achats
const ATTENTE_ACHATS = 'rdg_achats_attente';        // ce qui a été coché, ajouté, mis de côté, pas encore confirmé
var envoiAchats = false;                            // la file de la liste d'achats est en route
var nomScanne = '';                                 // un code inconnu scanné pour la liste : son nom (Open Food Facts), prêt pour « Nouvel aliment… »
var couleursModif = { site: {}, meubles: {} };      // changées à l'écran, pas encore envoyées
var envoiCouleurs = false;                          // un envoi de couleurs est en route
var dernierChargement = 0;                          // quand les listes ont été relues (pour ne pas appeler pour rien)
const FRAICHEUR = 30000;                            // au retour dans l'app, on relit si ça date de plus de 30 s

/* ---------- Vues : connexion → page d'ouverture → formulaire ---------- */
function toutCacher() {
  requestAnimationFrame(placerTitre);   // la nouvelle feuille affichée : le titre du site se place au-dessus d'elle
  envoyerOrdre();                  // on quitte un écran : l'ordre bougé part tout de suite (rien de bougé = rien d'envoyé)
  if (!$('vue-couleurs').hidden) envoyerCouleurs();   // idem pour « Couleurs »
  $('vue-connexion').hidden = true;
  $('vue-couleurs').hidden = true;
  $('vue-qui').hidden = true;
  $('vue-accueil').hidden = true;
  $('vue-listes').hidden = true;
  $('vue-recherche').hidden = true;
  $('vue-choix-quoi').hidden = true;
  $('vue-app').hidden = true;
  $('vue-pieces').hidden = true;
  $('vue-meubles').hidden = true;
  $('vue-categories').hidden = true;
  $('vue-aliments').hidden = true;
  $('vue-noms').hidden = true;
  $('vue-achats').hidden = true;
  const vs = $('vue-scan'); if (vs) vs.hidden = true;
  if (window.stopScanner) window.stopScanner();   // coupe la caméra en quittant la vue scan
  $('btn-burger').hidden = true;   // burger caché par défaut ; ré-affiché sur accueil + choix + bases
  $('entete-photo').hidden = true; // l'en-tête photo est écrit UNE fois dans le HTML ; on le montre écran par écran
  fermerMenu();   // tout changement d'écran ferme le menu : personne d'autre n'a à le faire
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
function montrerChoixQuoi()    { toutCacher(); $('vue-choix-quoi').hidden = false; $('btn-burger').hidden = false; $('entete-photo').hidden = false; }
async function montrerListes() {
  toutCacher(); $('vue-listes').hidden = false; $('btn-burger').hidden = false;
  // À l'ouverture (J-C, 2026-10-01) : tout est fermé, toutes les listes paraissent; l'Inventaire s'ouvrira sur ses deux boutons, rien de choisi
  $('vue-listes').querySelectorAll('.contenu > .accordeon > .accordeon-tete').forEach(t => { t.classList.remove('ouvert'); t.nextElementSibling.hidden = true; });
  vueInventaire = '';
  remplirInventaire();                         // instantané : ce qu'on a déjà en mémoire
  if (!MEUBLES.length) await chargerReferences();
  remplirInventaire();                         // puis la version fraîche, quand elle arrive
}
function montrerAccueil()    { toutCacher(); $('vue-accueil').hidden = false; $('btn-burger').hidden = false; $('entete-photo').hidden = false; }
/* Le Retour final (J-C, 2026-10-01) : pas l'accueil nu, l'accueil avec le menu ouvert — la prochaine action est là. */
function retourAuMenu()      { montrerAccueil(); ouvrirMenu(); }
function montrerFormulaire(avecCode) {
  toutCacher(); $('vue-app').hidden = false;
  preparerFiche(avecCode);
  chargerReferences();                        // catégories + liste des produits
}
/* La fiche vierge, sur son chemin. Après une entrée, on revient à celle du départ (à la main) : un seul écran pour entrer. */
function preparerFiche(avecCode) {
  modeManuel = !avecCode;                    // à la main : on descend l'entonnoir; au scan : le code donne l'identité
  ordonnerFiche();
  reinitFiche();
  montrer('bloc-code', !!avecCode);          // le champ code n'apparaît qu'au scan
  montrer('fiche-scan', !avecCode);          // à la main : le scan reste à côté de la catégorie (plus d'écran « scan ou à la main »)
  $('codebarres').value = ''; codeScan = '';
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
    $('nom').value = d.nom || d.nomAutre || '';     // pas de nom français : l'anglais, que J-C corrige (2026-09-30)
    surNom();
    if (produitCourant === null) {                  // resté « nouveau » : on garde les infos OFF
      if (d.marque) choisirParNom('marque', d.marque);   // retrouvée dans la liste, sinon elle y entre : choisie dans les deux cas
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
  t.className = 'toast toast-' + (type || 'avis');   // sans « visible » : un message qui arrive par-dessus l'autre repart de zéro
  t.textContent = txt;
  void t.offsetWidth;                                 // le navigateur prend acte de l'arrêt…
  t.classList.add('visible');                         // …puis le message paraît au centre, --toast-duree (au root), et s'efface seul
}

/* ---------- Cache local des listes ---------- */
function lireCache() { try { return JSON.parse(localStorage.getItem(CACHE) || 'null'); } catch (e) { return null; } }
function ecrireCache(d) { try { localStorage.setItem(CACHE, JSON.stringify(d)); } catch (e) {} }

/* Construit les listes de travail à partir des lignes brutes. */
function appliquer(d) {
  RAYONS = []; SOUSCATS = {};
  SECTEUR_ID = '';
  (d.cats || []).forEach(r => {                       // [ID,Nom,ParentID,SecteurID,DureeVie,Actif,Ordre]
    if (!SECTEUR_ID && r[3]) SECTEUR_ID = String(r[3]);   // secteur de l'app (Épicerie)
    if (String(r[5]) !== 'O') return;
    const x = { id: r[0], nom: r[1], ordre: r[6] || '', couleur: r[7] || '' };   // col. H : la couleur (une catégorie; J-C, 2026-10-01)
    if (!r[2]) RAYONS.push(x);
    else (SOUSCATS[r[2]] = SOUSCATS[r[2]] || []).push(x);
  });
  // l'ordre choisi avec les flèches (col. G, 1, 2, 3…) passe devant; sans numéro, l'ordre du Sheet, au bout
  const rang = x => Number(x.ordre) || Infinity;
  const parOrdre = (a, b) => rang(a) === rang(b) ? 0 : rang(a) < rang(b) ? -1 : 1;
  RAYONS.sort(parOrdre); Object.values(SOUSCATS).forEach(l => l.sort(parOrdre));
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
  ACHATS = d.achats || [];
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
    poserOrdresCats(data.cats, lireAttenteCats());            // idem pour l'ordre des catégories
    data.stock = data.stock || []; data.pasAimes = data.pasAimes || [];
    lireAttenteGestes().forEach(e => appliquerGeste(e, data));   // idem : un geste en route reste fait
    data.achats = data.achats || [];
    lireAttenteAchats().forEach(e => poserLignesAchats(e.lignes, data.achats));   // idem pour la liste d'achats
    appliquer(data); ecrireCache(data); remplirListes(); statut('');
    expedierOrdre();                              // le réseau répond : on en profite pour renvoyer l'attente
    expedierCouleurs();                           // idem pour les couleurs (sinon un appareil garde les siennes)
    expedierGestes();                             // idem pour les consommations
    expedierAchats();                             // idem pour la liste d'achats
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
      if (r && r.ok && r.categories !== undefined) return { cats: r.categories, emps: r.emplacements, prods: r.produits, stock: r.stock, variantes: r.variantes, codes: r.codes, couleurs: r.couleurs, listes: r.listes, pasAimes: r.pasAimes, achats: r.achats };
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
  const prod = val ? trouverProduitParNom(val) : null;
  // toujours le même produit NOUVEAU (une lettre ajoutée ou corrigée) : on garde tout ce qui est déjà rempli —
  // la marque d'Open Food Facts, la catégorie, les endroits et leurs quantités (J-C, 2026-09-30 : corriger le nom
  // après avoir choisi la sous-catégorie faisait disparaître la quantité et le bouton)
  const memeNouveau = !!val && !prod && produitCourant === null;
  if (!memeNouveau) {
    $('endroits').innerHTML = '';
    montrer('bloc-endroits', false); montrer('btn-enregistrer', false);
    pasEncoreRange(false);
  }
  if (!val) {
    produitCourant = null;
    montrer('bloc-details', false); montrer('bloc-cat', false); montrer('bloc-souscat', false);
    return;
  }
  montrer('bloc-details', true);
  if (prod) {                                   // produit existant reconnu
    produitCourant = prod.id;
    montrer('bloc-cat', false); montrer('bloc-souscat', false);   // catégorie déjà connue
    montrer('bloc-doublons', false);
    prefillProduit(prod.id);                    // marque/format (dernières) + endroits habituels
    montrer('bloc-achat', true); montrer('bloc-endroits', true); montrer('btn-enregistrer', true);
  } else {                                      // nouveau produit
    if (!memeNouveau) remplirVariantes(null);   // il sort d'un produit reconnu : ses marques et formats ne valent plus
    produitCourant = null;
    proposerRessemblances(val);                 // ... mais peut-être un doublon d'un produit connu
    montrer('bloc-cat', true);                  // il choisit la catégorie
    montrer('bloc-souscat', !!$('cat').value);
    const scid = $('souscat').value;
    if ($('cat').value && scid && scid !== 'neuve') montrerSuiteFiche();   // sa sous-catégorie est déjà choisie : la suite reste là
  }
}
/* Nouveau produit au scan, sous-catégorie choisie : le magasin et le prix, les endroits (une carte vierge au besoin), Enregistrer. */
function montrerSuiteFiche() {
  montrer('bloc-achat', true); montrer('bloc-endroits', true); montrer('btn-enregistrer', true);
  if (!$('endroits').children.length) ajouterEndroit();
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
  montrerSuiteFiche();
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
/* Un nom venu d'ailleurs (Open Food Facts) : retrouvé dans la liste, sinon il y entre — choisi dans les deux cas, comme si on
   avait touché Ajouter (J-C, 2026-09-30 : « Nouvelle marque… » avec la marque écrite dessous, c'était de trop).
   Il n'est créé que si l'entrée le porte : changer d'idée ne laisse rien derrière (enregistrer). */
function choisirParNom(champ, nom) {
  nom = String(nom || '').split(',')[0].trim();         // OFF donne parfois « Liberté, Danone » : la première
  if (!nom) return;
  $(champ + '-neuve').value = nom;
  ajouterChoix(champ);
}
/* L'entrée est faite : un nom ajouté à la fiche qu'elle ne porte pas a été abandonné — on l'oublie. */
function oublierNeuves() {
  LISTES_NEUVES.forEach(x => { LISTES[x.liste] = LISTES[x.liste].filter(y => y.id !== x.id); delete NOMS_LISTES[x.id]; });
  LISTES_NEUVES = [];
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
  const nom = champ.value.trim();
  if (!nom) { champ.focus(); return null; }
  const freres = parentId ? (SOUSCATS[parentId] || []) : RAYONS;
  const deja = freres.find(x => String(x.nom).trim().toLowerCase() === nom.toLowerCase());
  if (deja) { champ.value = ''; return deja; }            // déjà là : on la réutilise
  bouton.disabled = true;
  montrerVoile(true);
  try {
    // Categories : ID · Nom · ParentID · SecteurID · DureeVieJours · Actif
    const rep = await Coffre.ajouter('Categories', ['', nom, parentId || '', SECTEUR_ID, '', 'O']);
    if (!rep || !rep.ok) throw new Error((rep && rep.erreur) || 'refus');
    const neuve = { id: rep.id, nom: nom, ordre: '' };          // sans numéro : au bout de ses frères
    if (parentId) (SOUSCATS[parentId] = SOUSCATS[parentId] || []).push(neuve); else RAYONS.push(neuve);
    const c = lireCache();
    if (c) { (c.cats = c.cats || []).push([rep.id, nom, parentId || '', SECTEUR_ID, '', 'O']); ecrireCache(c); }
    champ.value = '';
    return neuve;
  } catch (e) {
    statut('Échec : ' + e.message, 'erreur');
    return null;
  } finally { bouton.disabled = false; montrerVoile(false); }
}
async function ajouterCategorie() {
  const neuve = await creerCategorie('', $('cat-neuve'), $('btn-cat-neuve'));
  if (!neuve) return;
  remplirCategories();
  $('cat').value = neuve.id;
  montrer('bloc-cat-neuve', false);
  surCategorie();                               // la suite de l'entonnoir reprend son cours
}
async function ajouterSousCategorie() {
  const rid = $('cat').value;
  if (!rid || rid === 'neuve') return;
  const neuve = await creerCategorie(rid, $('souscat-neuve'), $('btn-souscat-neuve'));
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
    const u = uniteDe(l[6]);
    if (u && vues.indexOf(u) === -1) vues.push(u);
  });
  return vues;
}
/* « 2 L » -> « L » ; et l'inverse : le même nombre, une autre unité (« 2 Lt » -> « 2 L »). */
function uniteDe(format) { return String(format || '').trim().replace(/^[0-9]+([.,][0-9]+)?\s*/, ''); }
function formatAvec(format, unite) {
  const m = String(format || '').trim().match(/^([0-9]+(?:[.,][0-9]+)?)\s*/);
  return (m ? m[1] + ' ' : '') + unite;
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
  const nouveaux = LISTES_NEUVES.filter(x => [marque, saveur, magasin].indexOf(x.id) !== -1);   // les noms neufs que l'entrée porte : créés par le même appel
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
      oublierNeuves();                                    // ajoutés puis abandonnés (on a changé d'idée) : jamais créés
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
    if (code) {                                            // son code est à nous tout de suite : le scanner de Consommer le reconnaît sans relire
      CODES[String(code)] = produitId;
      const c3 = lireCache(); if (c3) { (c3.codes = c3.codes || {})[String(code)] = produitId; ecrireCache(c3); }
    }
    nettoyerAchats(produitId, marque, saveur);           // entré : il quitte la liste d'achats
    opCourant = null;                                      // succès : le prochain article aura un nouveau jeton
    preparerFiche(false);                                  // le même écran qu'au départ, prêt pour le suivant (J-C : « 2 pages pour entrer un produit »)
    window.scrollTo(0, 0);
    avis('Ajouté', 'succes');                              // comme Consommé, Déplacé (le message de la fiche s'effaçait avec elle)
  } catch (e) {
    statut('Échec : ' + e.message, 'erreur');
  } finally { $('btn-enregistrer').disabled = false; montrerVoile(false); }
}

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
    remplirMeubles(true);                            // il passe sous sa nouvelle pièce, qu'on ouvre : on le suit des yeux
    const g = $('liste-meubles').querySelector(pieceId ? '.accordeon[data-type="p"][data-id="' + esc(pieceId) + '"]' : '.accordeon[data-type="r"]');
    if (g && !g.firstElementChild.classList.contains('ouvert')) toggleAccordeon(g.firstElementChild);
  } catch (e) {
    sel.value = m.pieceId || '';   // échec : on remet l'ancienne valeur
  } finally { sel.disabled = false; montrerVoile(false); }
}

/* Le choix de la pièce d'un meuble (page Meubles). */
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
/* La poubelle d'un meuble ('m') ou d'un espace ('e'). */
function poubelle(type, id) {
  return '<button class="retirer" type="button" data-retirer="' + type + '|' + esc(id) + '" aria-label="Retirer"></button>';
}
/* Un espace = une ligne : son crayon, ses flèches, sa poubelle. i = sa place parmi les espaces du meuble (groupe). */
function htmlEspace(e, i, groupe) {
  return '<div class="accordeon-item" data-type="e" data-id="' + esc(e.id) + '">' +
    '<span>' + esc(e.nom) + '</span>' + crayon('e:' + e.id) + fleches('e', e.id, i, groupe.length) + poubelle('e', e.id) + '</div>';
}
/* Un meuble = sa barre, à sa couleur (crayon, flèches, poubelle) → dedans : sa pièce, sa couleur, ses espaces, « Nouvel espace… ». */
function htmlMeuble(m, i, groupe) {
  const t = teinteBarre(m);
  return '<div class="accordeon" data-type="m" data-id="' + esc(m.id) + '">' +
    '<div class="accordeon-tete' + t.pale + '"' + t.style + '><span>' + esc(m.nom) + '</span>' + crayon('e:' + m.id) + fleches('m', m.id, i, groupe.length) + poubelle('m', m.id) + '</div>' +
    '<div class="accordeon-corps" hidden>' +
      '<div class="bloc accordeon-bloc"><div class="label">Pièce</div>' +
        '<select class="champ choix-piece" data-meuble="' + esc(m.id) + '">' + optionsPieces(m.pieceId) + '</select></div>' +
      '<div class="bloc accordeon-bloc"><div class="label">Couleur</div><div class="palette">' + htmlPalette(numeroCouleur(m.couleur)) + '</div></div>' +
      (ESPACES[m.id] || []).map(htmlEspace).join('') +
      htmlAjout('espace-nouveau', 'Nouvel espace…', 'ajout-espace', 'data-meuble', m.id) +
    '</div>' +
  '</div>';
}
/* Une ligne « Nouveau… » : le champ + Ajouter (Entrée fait pareil). */
function htmlAjout(classeChamp, invite, classeBouton, attr, id) {
  return '<div class="accordeon-item accordeon-item-saisie">' +
    '<input class="champ ' + classeChamp + '" autocomplete="off" enterkeyhint="done" placeholder="' + invite + '">' +
    '<button class="bouton bouton-petit bouton-vert ' + classeBouton + '" ' + attr + '="' + esc(id) + '" type="button">Ajouter</button></div>';
}
/* La barre d'une pièce ou d'un meuble prend sa couleur (une DONNÉE); sans couleur, elle reste brune.
   Posée sur la TÊTE seulement (--c) : jamais --meuble, qui descendrait jusqu'à ce qu'elle contient. */
function teinteBarre(p) {
  const teinte = p ? couleurDe(p.couleur) : '';
  return { style: teinte ? ' style="--c:' + esc(teinte) + '"' : '', pale: (teinte && couleurPale(teinte)) ? ' tete-pale' : '' };
}
/* La couleur d'une catégorie (J-C, 2026-10-01, sur aperçu : choisie selon le sens, la MÊME partout — Inventaire, Liste d'achats,
   Gérer les bases). Categories col. H, un numéro de la palette. Posée sur l'accordéon (--meuble) : la tête et les bandeaux de ses
   sous-catégories la suivent. Sans couleur : brune, comme un meuble neuf. */
function teinteCategorie(rid) {
  const r = RAYONS.find(x => String(x.id) === String(rid)), t = r ? couleurDe(r.couleur) : '';
  return { style: t ? ' style="--meuble:' + esc(t) + '"' : '', pale: (t && couleurPale(t)) ? ' tete-pale' : '' };
}
/* Une pastille touchée (Gérer les bases → Catégories) = la couleur de la catégorie, partout tout de suite;
   envoyée en arrière-plan (geste « lignes » : la ligne de Categories réécrite, col. H). */
function choisirCouleurCategorie(id, num) {
  const r = RAYONS.find(x => String(x.id) === String(id)), c = lireCache();
  const row = c && (c.cats || []).find(x => String(x[0]) === String(id));
  if (!r || !row) { avis('Couleur pas enregistrée — réessaie', 'erreur'); return; }
  r.couleur = num;
  const l = row.slice(); while (l.length < 8) l.push(''); l[7] = num;
  poserGeste({ action: 'lignes', table: 'Categories', opId: 'coulc-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8), lignes: [l] });
  remplirPageCategories(true);
}

/* ---------- Gérer les bases → Pièces (la porte) — décisions de J-C, 2026-09-30, sur aperçu ----------
   Une barre par pièce, à sa couleur : le crayon (renommer), les flèches (l'ordre), et, touchée, sa palette dessous.
   Une pastille touchée = la couleur, enregistrée tout de suite en arrière-plan (pas de bouton).
   On ne retire pas de pièce (J-C). Ajouter : au bas, sur la page même. */
function remplirPieces() {
  const ouverte = $('liste-pieces').querySelector('.accordeon-tete.ouvert');
  const idOuvert = ouverte ? ouverte.parentElement.dataset.id : '';
  $('liste-pieces').innerHTML = PIECES.map((p, i) => {
    const t = teinteBarre(p), ouvert = String(p.id) === idOuvert;
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
/* Une pastille touchée (pièce ou meuble) : la barre change tout de suite, l'envoi part en arrière-plan, sans bouton. */
function choisirCouleurLieu(id, num) {
  const x = PIECES.concat(MEUBLES).find(y => String(y.id) === String(id));
  if (!x) return;
  x.couleur = num;
  couleursModif.meubles[id] = num;                 // pièces et meubles : la même colonne Couleur d'Emplacements
  envoyerCouleurs();
  if (!$('vue-pieces').hidden) remplirPieces();
  if (!$('vue-meubles').hidden) remplirMeubles(true);
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

/* ---------- Gérer les bases → Meubles (l'armoire) — décisions de J-C, 2026-09-30, sur aperçu ----------
   Les meubles rangés sous leur pièce (barres à la couleur de la pièce; « Meubles sans pièce » en tête s'il y en a).
   Au bas de chaque pièce : « Nouveau meuble… ». garderOuverts : après un changement, ce qui était ouvert le reste. */
function remplirMeubles(garderOuverts) {
  const liste = $('liste-meubles');
  const ouverts = garderOuverts
    ? [...liste.querySelectorAll('.accordeon-tete.ouvert')].map(t => t.parentElement.dataset.type + ':' + t.parentElement.dataset.id)
    : [];
  let html = '';
  const sansPiece = MEUBLES.filter(m => !m.pieceId);
  if (sansPiece.length) html += '<div class="accordeon" data-type="r" data-id=""><div class="accordeon-tete">Meubles sans pièce (' + sansPiece.length + ')</div>' +
    '<div class="accordeon-corps" hidden>' + sansPiece.map(htmlMeuble).join('') + '</div></div>';
  html += PIECES.map(p => {
    const t = teinteBarre(p);
    return '<div class="accordeon" data-type="p" data-id="' + esc(p.id) + '"><div class="accordeon-tete' + t.pale + '"' + t.style + '>' + esc(p.nom) + '</div>' +
      '<div class="accordeon-corps" hidden>' + MEUBLES.filter(m => String(m.pieceId) === String(p.id)).map(htmlMeuble).join('') +
        htmlAjout('meuble-nouveau', 'Nouveau meuble…', 'ajout-meuble', 'data-piece', p.id) + '</div></div>';
  }).join('');
  liste.innerHTML = html || '<div class="accordeon-item"><span class="texte-petit texte-pale">Aucune pièce : ajoute-la d\'abord dans Pièces.</span></div>';
  liste.querySelectorAll('.accordeon').forEach(a => {
    if (ouverts.indexOf(a.dataset.type + ':' + a.dataset.id) === -1) return;
    a.firstElementChild.classList.add('ouvert');
    a.children[1].hidden = false;
  });
}
async function montrerMeubles() {
  toutCacher(); $('vue-meubles').hidden = false; $('btn-burger').hidden = false;
  $('liste-meubles').innerHTML = '';               // on arrive : tout fermé
  if (!PIECES.length && !MEUBLES.length) {         // pas encore chargé → on charge (même patron que les bases)
    $('liste-meubles').innerHTML = '<div class="texte-petit texte-pale">Chargement…</div>';
    await chargerReferences();
    $('liste-meubles').innerHTML = '';
  }
  remplirMeubles();
  expedierOrdre(); expedierCouleurs();             // ce qui attendait repart
}
/* Le meuble ou l'espace dont on parle, et ce qu'il emporte : ses espaces (un meuble), les aliments qui y sont. */
function lieuARetirer(type, id) {
  id = String(id);
  let nom = '', espaces = [];
  if (type === 'm') {
    const m = MEUBLES.find(x => String(x.id) === id);
    nom = m ? m.nom : ''; espaces = (ESPACES[id] || []).map(e => String(e.id));
  } else for (const mid in ESPACES) { const e = ESPACES[mid].find(x => String(x.id) === id); if (e) nom = e.nom; }
  const ids = [id].concat(espaces);
  const lignes = STOCK.filter(r => ids.indexOf(String(r[2])) !== -1 && (Number(r[3]) || 0) > 0);
  const aliments = lignes.map(r => String(r[1])).filter((p, k, t) => t.indexOf(p) === k);
  return { nom: nom, ids: ids, espaces: espaces.length, lignes: lignes, aliments: aliments.length };
}
/* La poubelle touchée : la question, avec Oui / Non. Un meuble : sous sa barre (il se referme). Un espace : à la place de sa ligne.
   Rien ne bouge avant Oui. */
function demanderRetrait(type, id) {
  remplirMeubles(true);                            // une seule question à la fois : celle d'avant s'efface
  const L = lieuARetirer(type, id);
  let q = 'Retirer ' + L.nom + (L.espaces ? ' et ' + (L.espaces === 1 ? 'son espace' : 'ses ' + L.espaces + ' espaces') : '') + ' ?';
  if (L.aliments) q += ' ' + (L.aliments === 1 ? 'Son aliment passera' : 'Ses ' + L.aliments + ' aliments passeront') + ' dans « Escale ».';
  const ligne = '<div class="accordeon-item accordeon-item-saisie" data-confirme><span>' + esc(q) + '</span>' + ouiNon(type, id) + '</div>';
  const cible = $('liste-meubles').querySelector((type === 'm' ? '.accordeon' : '.accordeon-item') + '[data-type="' + type + '"][data-id="' + esc(id) + '"]');
  if (!cible) return;
  if (type === 'e') { cible.outerHTML = ligne; return; }
  if (cible.firstElementChild.classList.contains('ouvert')) toggleAccordeon(cible.firstElementChild);
  cible.insertAdjacentHTML('afterend', ligne);
}
/* Les deux réponses d'un retrait : Oui (rouge) / Non. */
function ouiNon(type, id) {
  return '<button class="bouton bouton-petit bouton-rouge" type="button" data-retirer-oui="' + type + '|' + esc(id) + '">Oui</button>' +
    '<button class="bouton bouton-petit" type="button" data-retirer-non>Non</button>';
}
/* Oui : retirer. Ce qu'il contient passe dans « Pas encore rangé » (choix B de J-C). Instantané, comme Déplacer :
   la mémoire change tout de suite, l'envoi part dans la file des gestes. Rien n'est effacé du Sheet :
   les lignes d'Emplacements passent à Actif = N (l'historique garde ses endroits). */
function retirerLieu(type, id) {
  const L = lieuARetirer(type, id), c = lireCache();
  if (!c || !c.emps) { avis('Pas retiré — réessaie', 'erreur'); return; }
  const op = 'ret-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  const modifs = L.lignes.filter(r => r[0]).map(r => { const l = r.slice(); l[2] = ''; l[4] = dateCourte(l[4]); return { id: String(r[0]), ligne: l }; });
  if (modifs.length) poserGeste({ action: 'deplacer', opId: op, modifs: modifs, ajouts: [] });
  const emps = c.emps.filter(r => L.ids.indexOf(String(r[0])) !== -1).map(r => { const l = r.slice(); l[4] = 'N'; return l; });
  if (emps.length) poserGeste({ action: 'lignes', table: 'Emplacements', opId: op + '-e', lignes: emps });
  if (type === 'm') { const k = MEUBLES.findIndex(m => String(m.id) === String(id)); if (k !== -1) MEUBLES.splice(k, 1); delete ESPACES[id]; }
  else for (const mid in ESPACES) { const k = ESPACES[mid].findIndex(e => String(e.id) === String(id)); if (k !== -1) ESPACES[mid].splice(k, 1); }
  remplirMeubles(true);
  avis('Retiré : ' + L.nom, 'succes');
}
/* Ajouter un meuble dans sa pièce : le nom, Ajouter (ou Entrée). Même nom dans la même pièce = rien de créé.
   Le meuble s'ouvre tout de suite : sa couleur, ses espaces. Un échec relit la réserve (un 2e essai ne le double pas). */
async function ajouterMeuble(pieceId, btn) {
  const input = btn.parentElement.querySelector('.meuble-nouveau'), nom = input.value.trim();
  if (!nom) { input.focus(); return; }
  if (btn.disabled) return;
  const deja = MEUBLES.find(m => String(m.pieceId || '') === String(pieceId) && cleNom(m.nom) === cleNom(nom));
  if (deja) { avis('« ' + deja.nom + ' » existe déjà dans cette pièce', 'erreur'); return; }
  btn.disabled = true; montrerVoile(true);
  try {
    // Emplacements : ID · Nom · ParentID (la pièce) · SecteurID · Actif · Couleur (vide = brun, choisie ensuite)
    const r = await Coffre.ajouter('Emplacements', ['', nom, pieceId, SECTEUR_ID, 'O', '']);
    if (!r || !r.ok) throw new Error((r && r.erreur) || 'refus');
    MEUBLES.push({ id: r.id, nom: nom, couleur: '', pieceId: pieceId });
    const c = lireCache(); if (c) { (c.emps = c.emps || []).push([r.id, nom, pieceId, SECTEUR_ID, 'O', '']); ecrireCache(c); }
    remplirMeubles(true);
    const tete = $('liste-meubles').querySelector('.accordeon[data-type="m"][data-id="' + esc(r.id) + '"] > .accordeon-tete');
    if (tete) toggleAccordeon(tete);
  } catch (e) {
    avis('Meuble pas ajouté — réessaie', 'erreur');
    chargerReferences().then(() => {
      if (!$('vue-meubles').hidden && MEUBLES.some(m => String(m.pieceId || '') === String(pieceId) && cleNom(m.nom) === cleNom(nom))) remplirMeubles(true);
    });
  } finally { btn.disabled = false; montrerVoile(false); }
}

/* ---------- Gérer les bases → Catégories (quatre cases) — décisions de J-C, 2026-09-30, sur aperçu ----------
   Les catégories en barres, chacune à SA couleur (teinteCategorie; la palette en tête de son corps, comme un meuble),
   leurs sous-catégories dessous : crayon, flèches, poubelle.
   L'ordre choisi (col. G) est celui de la fiche. Une catégorie ne se retire que VIDE (choix A); une sous-catégorie retirée
   envoie ses aliments là où on le dit (choix C). « Nouvelle catégorie… » au bout, « Nouvelle sous-catégorie… » dans chacune. */
function remplirPageCategories(garderOuverts) {
  const liste = $('liste-categories');
  const ouverte = garderOuverts && liste.querySelector('.accordeon-tete.ouvert');
  const idOuvert = ouverte ? ouverte.parentElement.dataset.id : '';
  liste.innerHTML = RAYONS.map((r, i) => {
    const scs = SOUSCATS[r.id] || [], o = String(r.id) === idOuvert, t = teinteCategorie(r.id);
    return '<div class="accordeon" data-type="c" data-id="' + esc(r.id) + '"' + t.style + '>' +
      '<div class="accordeon-tete' + t.pale + (o ? ' ouvert' : '') + '"><span>' + esc(r.nom) + '</span>' + crayon('c:' + r.id) +
        fleches('c', r.id, i, RAYONS.length) + (scs.length ? '' : poubelle('c', r.id)) + '</div>' +
      '<div class="accordeon-corps"' + (o ? '' : ' hidden') + '>' +
        '<div class="bloc accordeon-bloc"><div class="label">Couleur</div><div class="palette">' + htmlPalette(numeroCouleur(r.couleur)) + '</div></div>' +
        scs.map((sc, j) => '<div class="accordeon-item" data-type="s" data-id="' + esc(sc.id) + '"><span>' + esc(sc.nom) + '</span>' +
          crayon('c:' + sc.id) + fleches('s', sc.id, j, scs.length) + poubelle('s', sc.id) + '</div>').join('') +
        htmlAjout('souscat-nouvelle', 'Nouvelle sous-catégorie…', 'ajout-categorie', 'data-rayon', r.id) +
      '</div></div>';
  }).join('') + htmlAjout('categorie-nouvelle', 'Nouvelle catégorie…', 'ajout-categorie', 'data-rayon', '');
}
async function montrerPageCategories() {
  toutCacher(); $('vue-categories').hidden = false; $('btn-burger').hidden = false;
  $('liste-categories').innerHTML = '';            // on arrive : tout fermé
  if (!RAYONS.length) {                            // pas encore chargé → on charge (même patron que les bases)
    $('liste-categories').innerHTML = '<div class="texte-petit texte-pale">Chargement…</div>';
    await chargerReferences();
    $('liste-categories').innerHTML = '';
  }
  remplirPageCategories();
  expedierOrdre();                                 // un ordre resté en attente repart
}
/* Ajouter une catégorie (rid vide) ou une sous-catégorie : le nom, Ajouter (ou Entrée). Même nom chez les frères = rien de créé.
   Une catégorie neuve s'ouvre (pour y mettre ses sous-catégories); après une sous-catégorie, le champ reste prêt pour la suivante. */
async function ajouterCategoriePage(rid, btn) {
  const champ = btn.parentElement.querySelector('.champ'), nom = champ.value.trim();
  if (!nom) { champ.focus(); return; }
  if (btn.disabled) return;
  const freres = () => rid ? (SOUSCATS[rid] || []) : RAYONS;
  const deja = freres().find(x => cleNom(x.nom) === cleNom(nom));
  if (deja) { avis('« ' + deja.nom + ' » existe déjà', 'erreur'); return; }
  const neuve = await creerCategorie(rid, champ, btn);
  if (!neuve) {                                    // un échec relit la réserve : si elle a été créée quand même, elle paraît
    avis((rid ? 'Sous-catégorie' : 'Catégorie') + ' pas ajoutée — réessaie', 'erreur');
    chargerReferences().then(() => { if (!$('vue-categories').hidden && freres().some(x => cleNom(x.nom) === cleNom(nom))) remplirPageCategories(true); });
    return;
  }
  remplirPageCategories(true);
  remplirCategories();                             // la fiche la propose tout de suite
  const liste = $('liste-categories');
  if (!rid) { const t = liste.querySelector('.accordeon[data-id="' + esc(neuve.id) + '"] > .accordeon-tete'); if (t) toggleAccordeon(t); }
  else { const b = liste.querySelector('.ajout-categorie[data-rayon="' + esc(rid) + '"]'); if (b) b.parentElement.querySelector('.champ').focus(); }
}
/* La poubelle touchée. Une catégorie (vide) : la question en tête de son corps. Une sous-catégorie : à la place de sa ligne;
   si des aliments y sont classés, un menu demande où ils vont (rien ne bouge avant Oui). */
function demanderRetraitCat(type, id) {
  remplirPageCategories(true);                     // une seule question à la fois
  const liste = $('liste-categories');
  if (type === 'c') {
    const r = RAYONS.find(x => String(x.id) === String(id));
    const acc = liste.querySelector('.accordeon[data-type="c"][data-id="' + esc(id) + '"]');
    if (!r || !acc) return;
    if (!acc.firstElementChild.classList.contains('ouvert')) toggleAccordeon(acc.firstElementChild);
    acc.children[1].insertAdjacentHTML('afterbegin', '<div class="accordeon-item accordeon-item-saisie" data-confirme><span>' + esc('Retirer ' + r.nom + ' ?') + '</span>' + ouiNon('c', id) + '</div>');
    return;
  }
  let sc = null;
  for (const k in SOUSCATS) sc = sc || SOUSCATS[k].find(x => String(x.id) === String(id));
  const ligne = liste.querySelector('.accordeon-item[data-type="s"][data-id="' + esc(id) + '"]');
  if (!sc || !ligne) return;
  const n = PRODUITS.filter(p => String(p.catId) === String(id)).length;
  if (!n) { ligne.outerHTML = '<div class="accordeon-item accordeon-item-saisie" data-confirme><span>' + esc('Retirer ' + sc.nom + ' ?') + '</span>' + ouiNon('s', id) + '</div>'; return; }
  const choix = '<select class="champ destination"><option value="">— Choisir —</option>' + groupesSousCats('', id) + '</select>';
  ligne.outerHTML = '<div class="accordeon-item question-choix" data-confirme><span>' +
    esc('Retirer ' + sc.nom + ' ? ' + (n === 1 ? 'Son aliment ira' : 'Ses ' + n + ' aliments iront') + ' dans :') + '</span>' + choix + ouiNon('s', id) + '</div>';
}
/* Oui : retirer. Instantané (la file des gestes) : les aliments passent à leur nouvelle sous-catégorie (Produits col. C),
   puis la catégorie passe à Actif = N — rien n'est effacé du Sheet. */
function retirerCategorie(type, id, dest) {
  const c = lireCache();
  if (!c || !c.cats) { avis('Pas retiré — réessaie', 'erreur'); return; }
  const aliments = type === 's' ? PRODUITS.filter(p => String(p.catId) === String(id)) : [];
  if (aliments.length && !dest) { avis('Choisis où vont ses aliments', 'erreur'); return; }
  const op = 'retc-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  const ids = aliments.map(p => String(p.id));
  const prods = (c.prods || []).filter(r => ids.indexOf(String(r[0])) !== -1).map(r => { const l = r.slice(); l[2] = dest; return l; });
  if (prods.length) poserGeste({ action: 'lignes', table: 'Produits', opId: op + '-p', lignes: prods });
  aliments.forEach(p => { p.catId = dest; });
  const row = c.cats.find(r => String(r[0]) === String(id));
  if (row) { const l = row.slice(); l[5] = 'N'; poserGeste({ action: 'lignes', table: 'Categories', opId: op + '-c', lignes: [l] }); }
  const retire = x => String(x.id) === String(id);
  const nom = ((RAYONS.find(retire) || Object.values(SOUSCATS).flat().find(retire)) || {}).nom || '';
  if (type === 'c') { const k = RAYONS.findIndex(retire); if (k !== -1) RAYONS.splice(k, 1); delete SOUSCATS[id]; }
  else for (const rid in SOUSCATS) { const k = SOUSCATS[rid].findIndex(retire); if (k !== -1) SOUSCATS[rid].splice(k, 1); }
  remplirPageCategories(true);
  remplirCategories();
  avis('Retiré : ' + nom, 'succes');
}
/* Les sous-catégories en menu, groupées par catégorie (sans celle qu'on retire, s'il le faut). */
function groupesSousCats(choisie, sauf) {
  return RAYONS.map(r => {
    const scs = (SOUSCATS[r.id] || []).filter(x => String(x.id) !== String(sauf));
    return scs.length ? '<optgroup label="' + esc(r.nom) + '">' + scs.map(x => '<option value="' + esc(x.id) + '"' +
      (String(x.id) === String(choisie) ? ' selected' : '') + '>' + esc(x.nom) + '</option>').join('') + '</optgroup>' : '';
  }).join('');
}
/* La catégorie d'une sous-catégorie ('' si elle n'existe plus). */
function rayonDe(scid) {
  for (const rid in SOUSCATS) if (SOUSCATS[rid].some(x => String(x.id) === String(scid))) return rid;
  return '';
}

/* ---------- Gérer les bases → Aliments (la pomme) — décisions de J-C, 2026-09-30, sur aperçu ----------
   Les catégories en barres (la suite); dedans, chaque sous-catégorie en bandeau de sa couleur, pâlie, ses aliments dessous,
   par ordre alphabétique comme dans la fiche (pas de flèches). Un aliment ouvert : sa sous-catégorie (menu), ses endroits 1-2-3,
   ses « Pas aimé ». Le crayon renomme — ou propose de RÉUNIR deux aliments; la poubelle ne paraît que sur un aliment dont
   il ne reste rien (choix A). Pas de « Nouvel aliment… » : un aliment naît à l'entrée.
   ouvrir = { cat, pid } : ce qui doit être ouvert (sinon, avec garderOuverts, ce qui l'était). */
function remplirPageAliments(garderOuverts, ouvrir) {
  const liste = $('liste-aliments');
  let cat = '', pid = '';
  if (ouvrir) { cat = String(ouvrir.cat); pid = String(ouvrir.pid); }
  else if (garderOuverts) {
    const t = liste.querySelector(':scope > .accordeon > .accordeon-tete.ouvert'), a = liste.querySelector('.aliment-tete.ouvert');
    cat = t ? t.parentElement.dataset.id : ''; pid = a ? a.parentElement.dataset.id : '';
  }
  const alpha = (a, b) => String(a.nom).localeCompare(String(b.nom), 'fr');
  const enReserve = {};                                 // un aliment dont il reste quelque chose (rangé ou pas) : pas de poubelle
  STOCK.forEach(l => { if ((Number(l[3]) || 0) > 0) enReserve[String(l[1])] = true; });
  const aliment = p => {
    const o = String(p.id) === pid;
    return '<div class="accordeon aliment" data-id="' + esc(p.id) + '">' +
      '<div class="accordeon-item aliment-tete' + (o ? ' ouvert' : '') + '"><span class="item-nom">' + esc(p.nom) + '</span>' +
        crayon('a:' + p.id) + (enReserve[p.id] ? '' : poubelle('a', p.id)) + '</div>' +
      '<div class="accordeon-corps"' + (o ? '' : ' hidden') + '>' + (o ? htmlCorpsAliment(p) : '') + '</div></div>';   // bâti à l'ouverture
  };
  const groupe = (id, nom, corps) => { const t = teinteCategorie(id); return '<div class="accordeon" data-id="' + esc(id) + '"' + t.style + '>' +
    '<div class="accordeon-tete' + t.pale + (String(id) === cat ? ' ouvert' : '') + '"><span>' + esc(nom) + '</span></div>' +
    '<div class="accordeon-corps"' + (String(id) === cat ? '' : ' hidden') + '>' + corps + '</div></div>'; };
  const classes = {};                                   // les aliments rangés sous une sous-catégorie qui existe
  const cats = RAYONS.map(r => {
    const corps = (SOUSCATS[r.id] || []).map(sc => {
      const ps = PRODUITS.filter(p => String(p.catId) === String(sc.id)).sort(alpha);
      ps.forEach(p => { classes[p.id] = true; });
      return ps.length ? '<div class="espace-bandeau">' + esc(sc.nom) + '</div>' + ps.map(aliment).join('') : '';
    }).join('');
    return corps ? groupe(r.id, r.nom, corps) : '';
  }).join('');
  const seuls = PRODUITS.filter(p => !classes[p.id]).sort(alpha);
  const sans = seuls.length ? groupe('sans', 'Aliments sans catégorie (' + seuls.length + ')', seuls.map(aliment).join('')) : '';
  liste.innerHTML = (sans + cats) || '<div class="accordeon-item"><span class="texte-petit texte-pale">Aucun aliment.</span></div>';
}
/* Ce que contient un aliment se bâtit quand on l'ouvre : des centaines d'aliments, la page reste légère. */
function remplirCorpsAliment(tete) {
  const corps = tete.nextElementSibling, p = PRODUITS.find(x => String(x.id) === String(tete.parentElement.dataset.id));
  if (corps && p && !corps.firstChild) corps.innerHTML = htmlCorpsAliment(p);
}
/* Un aliment ouvert : sa sous-catégorie, ses endroits 1-2-3 (flèches), ses « Pas aimé » (Enlever). */
function htmlCorpsAliment(p) {
  const titre = t => '<div class="bloc accordeon-bloc"><div class="label">' + t + '</div></div>';
  const ok = rayonDe(p.catId) !== '';
  const ends = htmlOrdreEndroits(p.id);
  const pas = PAS_AIMES.filter(r => String(r[1]) === String(p.id)).map(r => {
    const m = String(r[2] || '').trim(), sv = String(r[3] || '').trim();
    return '<div class="accordeon-item"><span>' + esc([nomListe(m), nomListe(sv)].filter(Boolean).join(' ') || p.nom) + '</span>' +
      '<button class="bouton bouton-petit" type="button" data-pas-aime="' + esc(p.id + '|' + m + '|' + sv) + '">Enlever</button></div>';
  }).join('');
  return '<div class="bloc accordeon-bloc"><div class="label">Sous-catégorie</div>' +
      '<select class="champ choix-souscat" data-aliment="' + esc(p.id) + '">' + (ok ? '' : '<option value="">— Choisir —</option>') +
      groupesSousCats(p.catId, '') + '</select></div>' +
    (ends ? titre('Ses endroits') + ends : '') + (pas ? titre('Pas aimé') + pas : '');
}
async function montrerPageAliments() {
  toutCacher(); $('vue-aliments').hidden = false; $('btn-burger').hidden = false;
  $('liste-aliments').innerHTML = '';              // on arrive : tout fermé
  if (!RAYONS.length) {                            // pas encore chargé → on charge (même patron que les bases)
    $('liste-aliments').innerHTML = '<div class="texte-petit texte-pale">Chargement…</div>';
    await chargerReferences();
    $('liste-aliments').innerHTML = '';
  }
  remplirPageAliments();
  expedierOrdre();                                 // un ordre d'endroits resté en attente repart
}
/* Une autre sous-catégorie choisie : instantané (la file des gestes, Produits col. C). La catégorie qui le reçoit s'ouvre : on le suit. */
function assignerSousCat(pid, scid) {
  const p = PRODUITS.find(x => String(x.id) === String(pid)), c = lireCache();
  const row = c && (c.prods || []).find(r => String(r[0]) === String(pid));
  if (!p || !row || !scid || String(p.catId) === String(scid)) { remplirPageAliments(true); return; }
  const l = row.slice(); l[2] = scid;
  poserGeste({ action: 'lignes', table: 'Produits', opId: 'scat-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8), lignes: [l] });
  p.catId = scid;
  remplirPageAliments(false, { cat: rayonDe(scid), pid: pid });
}
/* La poubelle (un aliment dont il ne reste rien) : la question à la place de sa ligne. Rien ne bouge avant Oui. */
function demanderRetraitAliment(pid) {
  remplirPageAliments(true);                       // une seule question à la fois
  const p = PRODUITS.find(x => String(x.id) === String(pid));
  const acc = $('liste-aliments').querySelector('.aliment[data-id="' + esc(pid) + '"]');
  if (!p || !acc) return;
  acc.outerHTML = '<div class="accordeon-item accordeon-item-saisie" data-confirme><span>' + esc('Retirer ' + p.nom + ' ?') + '</span>' + ouiNon('a', pid) + '</div>';
}
/* Oui : Actif = N (Produits col. E), par la file des gestes — rien n'est effacé : l'historique (Sorties) le garde.
   Il en est entré entre-temps (l'autre appareil) : on ne retire pas. */
function retirerAliment(pid) {
  const p = PRODUITS.find(x => String(x.id) === String(pid)), c = lireCache();
  const row = c && (c.prods || []).find(r => String(r[0]) === String(pid));
  if (!p || !row) { avis('Pas retiré — réessaie', 'erreur'); remplirPageAliments(true); return; }
  if (STOCK.some(l => String(l[1]) === String(pid) && (Number(l[3]) || 0) > 0)) { avis('Il en reste : pas retiré', 'erreur'); remplirPageAliments(true); return; }
  const l = row.slice(); l[4] = 'N';
  poserGeste({ action: 'lignes', table: 'Produits', opId: 'reta-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8), lignes: [l] });
  PRODUITS.splice(PRODUITS.indexOf(p), 1);
  remplirPageAliments(true);
  avis('Retiré : ' + p.nom, 'succes');
}

/* ---------- Gérer les bases → Magasins, Marques, Saveurs : UNE page pour les trois listes gérées ----------
   Décisions de J-C, 2026-09-30, sur aperçu (look A). Une barre par nom (la suite), en ordre alphabétique comme dans la fiche;
   rien à ouvrir : un nom, c'est tout. Le crayon corrige le nom (un nom qui existe déjà : les réunir ?).
   Magasins seulement (gere) : la poubelle (Actif = N : plus proposé à l'entrée, les anciennes entrées gardent son nom) et
   « Nouveau magasin… » au bas, pour suivre les spéciaux d'une épicerie où l'on n'a encore rien acheté.
   Marques et saveurs naissent à l'entrée et restent collées aux lots : le crayon seulement (J-C). */
const PAGES_NOMS = {
  magasins: { titre: 'Magasins', choix: 'magasin', aucun: 'Aucun magasin.', gere: true },   // choix -> CHOIX_FICHE (la liste, « Nouveau… »)
  marques:  { titre: 'Marques',  choix: 'marque',  aucun: 'Aucune marque.' },
  saveurs:  { titre: 'Saveurs',  choix: 'saveur',  aucun: 'Aucune saveur.' },
  unites:   { titre: 'Unités',   unites: true }                             // pas une liste du Sheet : le texte des formats
};
var pageNoms = PAGES_NOMS.magasins;                // la liste que la page montre
const listeNoms = () => CHOIX_FICHE[pageNoms.choix].liste;                                      // 'Magasins', 'Marques', 'Saveurs'
const typeNoms = () => Object.keys(TABLES_NOM).find(k => TABLES_NOM[k][0] === listeNoms());   // la lettre du crayon : g, q, v
function remplirPageNoms() {
  if (pageNoms.unites) { remplirPageUnites(); return; }
  const xs = LISTES[listeNoms()].slice().sort((a, b) => a.nom.localeCompare(b.nom, 'fr')), t = typeNoms();
  $('liste-noms').innerHTML = xs.map(x => '<div class="accordeon" data-id="' + esc(x.id) + '"><div class="accordeon-tete"><span>' + esc(x.nom) + '</span>' +
    crayon(t + ':' + x.id) + (pageNoms.gere ? poubelle(t, x.id) : '') + '</div></div>').join('') ||
    '<div class="accordeon-item"><span class="texte-petit texte-pale">' + pageNoms.aucun + '</span></div>';
}
async function montrerPageNoms(cle) {
  pageNoms = PAGES_NOMS[cle];
  toutCacher(); $('vue-noms').hidden = false; $('btn-burger').hidden = false;
  $('noms-titre').textContent = pageNoms.titre;
  $('noms-ajout').hidden = !pageNoms.gere;
  $('nom-nouveau').value = ''; if (pageNoms.gere) $('nom-nouveau').placeholder = CHOIX_FICHE[pageNoms.choix].neuve;
  $('noms-msg').className = 'message message-repli'; $('noms-msg').textContent = '';
  if (!RAYONS.length) {                            // pas encore chargé → on charge (même patron que les bases)
    $('liste-noms').innerHTML = '<div class="texte-petit texte-pale">Chargement…</div>';
    await chargerReferences();
  }
  remplirPageNoms();
}
/* Ajouter (Magasins) : le nom, puis Ajouter (ou Entrée). Un nom déjà dans la liste ne crée rien; un nom retiré
   revient (Actif = O) au lieu d'être doublé. Un échec relit la réserve : si le nom a été créé quand même,
   il paraît, et le 2e essai ne le double pas. */
async function ajouterNom() {
  const champ = $('nom-nouveau'), msg = $('noms-msg'), btn = $('btn-nom-ajouter'), L = listeNoms();
  const nom = champ.value.trim();
  msg.className = 'message message-repli'; msg.textContent = '';
  if (!nom || btn.disabled || !pageNoms.gere) return;
  const deja = LISTES[L].find(m => cleNom(m.nom) === cleNom(nom));
  if (deja) { msg.className = 'message message-repli message-erreur'; msg.textContent = '« ' + deja.nom + ' » existe déjà.'; return; }
  const c = lireCache(), rows = c && c.listes && c.listes[L];
  const ancien = rows && rows.find(r => String(r[2]) === 'N' && cleNom(r[1]) === cleNom(nom));
  btn.disabled = true; montrerVoile(true);
  try {
    // Magasins, Marques, Saveurs : ID · Nom · Actif
    const ligne = ancien ? [ancien[0], nom, 'O'] : ['', nom, 'O'];
    const r = ancien ? await Coffre.modifier(L, ancien[0], ligne) : await Coffre.ajouter(L, ligne);
    if (!r || !r.ok) throw new Error((r && r.erreur) || 'refus');
    const id = ancien ? String(ancien[0]) : String(r.id);
    ligne[0] = id;
    LISTES[L].push({ id: id, nom: nom }); NOMS_LISTES[id] = nom;
    if (c) {
      c.listes = c.listes || {}; c.listes[L] = (c.listes[L] || []).filter(x => String(x[0]) !== id).concat([ligne]);
      ecrireCache(c);
    }
    champ.value = '';
    remplirPageNoms();
  } catch (e) {
    msg.className = 'message message-repli message-erreur'; msg.textContent = 'Pas ajouté — réessaie.';
    chargerReferences().then(() => { if (!$('vue-noms').hidden) remplirPageNoms(); });
  } finally { btn.disabled = false; montrerVoile(false); }
}
/* La poubelle (Magasins) : la question à la place de sa barre. Rien ne bouge avant Oui. */
function demanderRetraitNom(id) {
  remplirPageNoms();                               // une seule question à la fois
  const x = LISTES[listeNoms()].find(y => String(y.id) === String(id));
  const acc = $('liste-noms').querySelector('.accordeon[data-id="' + esc(id) + '"]');
  if (!x || !acc) return;
  acc.outerHTML = '<div class="accordeon-item accordeon-item-saisie" data-confirme><span>' + esc('Retirer ' + x.nom + ' ?') + '</span>' + ouiNon(typeNoms(), id) + '</div>';
}
/* Oui : Actif = N, par la file des gestes (instantané). Son nom reste lisible sur les anciennes entrées (NOMS_LISTES). */
function retirerNom(id) {
  const L = listeNoms(), x = LISTES[L].find(y => String(y.id) === String(id)), c = lireCache();
  const row = c && c.listes && (c.listes[L] || []).find(r => String(r[0]) === String(id));
  if (!x || !row) { avis('Pas retiré — réessaie', 'erreur'); remplirPageNoms(); return; }
  const l = row.slice(); l[2] = 'N';
  poserGeste({ action: 'lignes', table: L, opId: 'retn-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8), lignes: [l] });
  LISTES[L].splice(LISTES[L].indexOf(x), 1);
  remplirPageNoms();
  avis('Retiré : ' + x.nom, 'succes');
}

/* ---------- Gérer les bases → Unités (la balance) — décisions de J-C, 2026-09-30 ----------
   Une unité n'est pas une liste du Sheet : c'est le texte après le nombre, dans le format (« 2 L »). La page montre
   celles de la fiche (les 5 de base, puis tout ce que « Autre… » a ajouté), avec le look des Magasins.
   Les 5 de base, SANS crayon : fixes, c'est grâce à elles que l'app additionne (4 L + deux 1 L = 6 L).
   Les autres, avec le crayon : corriger une faute (« Lt » -> « L ») réécrit tous les lots qui s'en servent, et l'ancienne
   disparaît de la fiche; un nom qui existe déjà -> « les réunir ? ». Pas d'Ajouter ni de poubelle : une unité naît
   à l'entrée et existe tant qu'un lot s'en sert. */
function remplirPageUnites() {
  $('liste-noms').innerHTML = unitesConnues().map(u => '<div class="accordeon" data-id="' + esc(u) + '"><div class="accordeon-tete"><span>' + esc(u) + '</span>' +
    (UNITES_BASE.indexOf(u) === -1 ? crayon('u:' + u) : '') + '</div></div>').join('');
}
/* Le crayon d'une unité : un nom qui existe déjà (sans accent ni majuscule) -> la question; sinon, on la change partout. */
function renommerUnite(ancienne, nom) {
  nom = String(nom || '').trim();
  if (!nom || nom === ancienne) { rafraichirBases(); return; }
  const autre = unitesConnues().find(u => u !== ancienne && cleNom(u) === cleNom(nom));
  if (autre) { demanderReunion('u:' + ancienne, { id: autre, nom: autre }); return; }
  changerUnite(ancienne, nom);
}
/* Tous les lots dans l'ancienne unité passent à la nouvelle (le nombre reste). INSTANTANÉ : les lignes de STOCK réécrites
   partent dans la file des gestes (action deplacer : des lignes de STOCK réécrites au complet, rejouable).
   L'historique (Sorties) garde le format d'alors. */
async function changerUnite(ancienne, nouvelle) {
  const lignes = () => STOCK.filter(l => uniteDe(l[6]) === ancienne);
  if (lignes().some(l => !l[0])) {                     // filet : une ligne sans ID (ne devrait plus arriver) -> on relit d'abord
    montrerVoile(true);
    const lu = await chargerReferences();
    montrerVoile(false);
    if (!lu || lignes().some(l => !l[0])) { avis('Unité pas corrigée — réessaie', 'erreur'); rafraichirBases(); return; }
  }
  const modifs = lignes().map(l => { const ligne = l.slice(); ligne[4] = dateCourte(ligne[4]); ligne[6] = formatAvec(l[6], nouvelle); return { id: String(l[0]), ligne: ligne }; });
  if (modifs.length) poserGeste({ action: 'deplacer', opId: 'unite-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8), modifs: modifs, ajouts: [] });
  const suivre = vr => {                               // la fiche pré-remplit d'après les formats déjà vus : ils suivent
    if (!vr) return;
    vr.formats = (vr.formats || []).map(f => uniteDe(f) === ancienne ? formatAvec(f, nouvelle) : f).filter((f, k, t) => t.indexOf(f) === k);
    if (vr.dernierFormat && uniteDe(vr.dernierFormat) === ancienne) vr.dernierFormat = formatAvec(vr.dernierFormat, nouvelle);
  };
  Object.values(VARIANTES).forEach(suivre);
  const c = lireCache(); if (c && c.variantes) { Object.values(c.variantes).forEach(suivre); ecrireCache(c); }
  rafraichirBases();
  avis('« ' + ancienne + ' » devient « ' + nouvelle + ' »', 'succes');
}

/* Entrée dans une ligne « Nouveau… » (meuble, espace, catégorie, sous-catégorie) = son bouton Ajouter. */
function entreeAjoute(ev) {
  if (ev.key !== 'Enter' || ev.target.tagName !== 'INPUT' || !ev.target.closest('.accordeon-item-saisie')) return;
  ev.preventDefault();
  const b = ev.target.parentElement.querySelector('.bouton');
  if (b) b.click();
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
function rafraichirBases() {
  remplirMeubles(true);
  if (!$('vue-pieces').hidden) remplirPieces();
  if (!$('vue-categories').hidden) remplirPageCategories(true);
  if (!$('vue-aliments').hidden) remplirPageAliments(true);
  if (!$('vue-noms').hidden) remplirPageNoms();
}
/* Une flèche touchée : l'ordre partira tout seul, DELAI_ORDRE après la dernière (cinq flèches de suite = un seul envoi).
   Quitter la page ou mettre l'app en veille l'envoie aussi, sans attendre. */
function planifierOrdre() { clearTimeout(minuterieOrdre); minuterieOrdre = setTimeout(envoyerOrdre, DELAI_ORDRE); }
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
  if (cle.charAt(0) === 'u') { renommerUnite(cle.slice(2), nom); return; }   // une unité : le texte des formats, pas une ligne du Sheet
  const type = cle.charAt(0), id = cle.slice(2), T = TABLES_NOM[type];
  nom = String(nom || '').trim();
  const c = lireCache();
  const rows = c && T[1](c), row = rows && rows.find(r => String(r[0]) === String(id));
  if (!nom || !row || String(row[1]) === nom) { rafraichirBases(); return; }   // vide ou inchangé : rien à faire
  const liste = LISTES[T[0]];
  const autre = (type === 'a' ? PRODUITS : liste || []).find(y => String(y.id) !== String(id) && cleNom(y.nom) === cleNom(nom));
  if (autre) { demanderReunion(cle, autre); return; }   // ce nom existe déjà (liste gérée ou aliment) : les réunir ?
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
/* Un magasin, une marque, une saveur ou un aliment renommé comme un autre qui existe déjà (« Libertee » -> « Liberté ») :
   on propose de les RÉUNIR. Oui : tout ce qui était sous l'un passe sous l'autre (coffre-fort, action reunir). Non : rien ne change.
   La question prend la place de tout l'aliment (page Aliments), de toute la barre (Magasins, Marques, Saveurs). */
function demanderReunion(cle, autre) {
  const btn = [...document.querySelectorAll('.crayon')].find(b => b.dataset.renommer === cle && !b.closest('[id^="vue-"][hidden]'));   // celui de la page qu'on voit
  const item = btn && (btn.closest('.aliment') || btn.closest('.liste-suite > .accordeon'));
  if (!item) { rafraichirBases(); return; }
  item.outerHTML = '<div class="accordeon-item accordeon-item-saisie" data-confirme><span>« ' + esc(autre.nom) + ' » existe déjà : les réunir ?</span>' +
    '<button class="bouton bouton-petit bouton-vert" type="button" data-reunir="' + esc(cle + '|' + autre.id) + '">Oui</button>' +
    '<button class="bouton bouton-petit" type="button" data-reunir-non>Non</button></div>';
}
async function reunirNoms(val) {
  const k = String(val).split('|'), cle = k[0], garde = k[1], T = TABLES_NOM[cle.charAt(0)], perdu = cle.slice(2);
  if (cle.charAt(0) === 'u') { changerUnite(perdu, garde); return; }   // deux unités : les lots de l'une passent à l'autre
  montrerVoile(true);
  try {
    const r = cle.charAt(0) === 'a' ? await Coffre.reunirProduits({ garde: garde, perdu: perdu })   // ses lots, ses sorties, ses « Pas aimé »
                                    : await Coffre.reunir({ liste: T[0], garde: garde, perdu: perdu });
    if (!r || !r.ok) throw new Error((r && r.erreur) || 'refus');
    await chargerReferences();                          // l'inventaire, les « Pas aimé », les listes : on relit, c'est plus sûr
    avis('Réunis', 'succes');
  } catch (e) {
    avis('Pas réunis — réessaie', 'erreur');
  } finally { montrerVoile(false); rafraichirBases(); }
}
/* ---------- Ranger ce qui est en Escale ----------
   Un lot = ce que l'Inventaire montre sur une ligne : aliment + marque + saveur, à un endroit.
   En Escale (endroit vide, « en transit ») : les deux flèches RANGENT, avec une quantité -> le reste attend.
   Déplacer un lot déjà rangé (ou corriger son endroit) : le bouton Déplacer du menu (ouvrirDeplacement), qui passe aussi par deplacerLot(). */
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
/* « Cuisine · Frigo · Tablette 2 ». */
function libelleEndroit(emp) {
  if (!emp) return 'Escale';
  const r = resoudreEmp(emp);
  if (!r) return 'Endroit disparu';
  const nom = (liste, id) => { const x = liste.find(y => String(y.id) === String(id)); return x ? x.nom : ''; };
  const esp = r.espaceId ? nom(ESPACES[r.meubleId] || [], r.espaceId) : '';
  return [nom(PIECES, r.pieceId), nom(MEUBLES, r.meubleId), esp].filter(Boolean).join(' · ');
}
/* Une ligne de l'Escale avec ses deux flèches « ranger » (le dessin de Déplacer — J-C, 2026-10-01, choix B sur aperçu :
   le crayon ne veut plus dire que « corriger un nom »). titre = le nom de l'aliment.
   sorte : une sorte sous l'accordéon de son aliment, du même trait que les sortes des meubles, les flèches en plus. */
function detailLot(l) { return [nomListe(l.marque), nomListe(l.saveur), l.formats.join(' + ')].filter(Boolean).join(' · '); }
function htmlLot(pid, i, l, titre, sorte) {
  const detail = detailLot(l);
  const ranger = '<button class="ranger" type="button" data-lot="' + esc(pid) + '|' + i + '" aria-label="Ranger"></button>';   // AVANT la quantité (J-C) : les nombres restent au bout, sous le total
  if (sorte) return '<div class="item sorte"><div class="item-info"><div class="item-detail">' + esc(detail || titre) + '</div></div>' +
    ranger + '<span class="sorte-quantite">' + esc(l.qte) + '</span></div>';
  return '<div class="item"><div class="item-info"><div class="item-nom">' + esc(titre) + '</div>' +
    (detail ? '<div class="item-detail">' + esc(detail) + '</div>' : '') + '</div>' +
    ranger + '<span class="item-quantite">' + esc(l.qte) + '</span></div>';
}
/* « Pas encore rangé », à la fin de l'Inventaire par meuble : n'apparaît que s'il y a quelque chose.
   À l'écran, il s'appelle « Escale » (J-C, 2026-10-01 : un mot, du côté du transit — ça passe, ça ne s'installe pas).
   Comme les meubles au-dessus d'elle (J-C, 2026-10-01) : un aliment à plusieurs sortes = l'accordéon (le nom et le total,
   on touche pour voir les sortes), chaque sorte avec ses deux flèches pour ranger. */
function htmlPasEncoreRange() {
  const lignes = [];
  PRODUITS.forEach(p => {
    const ici = (LOTS[p.id] || []).map((l, i) => ({ l: l, i: i })).filter(x => !x.l.emp);
    if (ici.length === 1) lignes.push({ nom: p.nom, html: htmlLot(p.id, ici[0].i, ici[0].l, p.nom) });
    else if (ici.length) {
      ici.sort((a, b) => detailLot(a.l).localeCompare(detailLot(b.l), 'fr'));
      lignes.push({ nom: p.nom, html: '<div class="accordeon aliment" data-aliment="' + esc(p.id) + '"><div class="item aliment-tete"><div class="item-info">' +
        '<div class="item-nom">' + esc(p.nom) + '</div></div><span class="item-quantite">' + totalLots(ici.map(x => x.l)) + '</span></div>' +
        '<div class="aliment-sortes" hidden>' + ici.map(x => htmlLot(p.id, x.i, x.l, p.nom, true)).join('') + '</div></div>' });
    }
  });
  if (!lignes.length) return '';
  lignes.sort((a, b) => String(a.nom).localeCompare(String(b.nom), 'fr'));
  return '<div class="accordeon" data-transit><div class="accordeon-tete">Escale</div>' +
    '<div class="accordeon-corps" hidden>' + lignes.map(x => x.html).join('') + '</div></div>';
}
/* Les deux flèches d'un lot en Escale : la ligne devient la carte d'endroit de la fiche, vierge, avec la quantité (le total d'avance).
   Un endroit choisi -> la question; Oui fait le geste, Non laisse tout tel quel. */
function ouvrirLot(btn) {
  const k = btn.dataset.lot.split('|'), lot = (LOTS[k[0]] || [])[Number(k[1])];
  if (!lot) return;
  const carte = document.createElement('div');
  carte.className = 'endroit carte';
  carte.innerHTML = htmlChoixEndroit() +
    '<div class="bloc"><div class="label">Quantité</div><input class="champ qte" type="text" inputmode="numeric" pattern="[0-9]*" value="' + esc(lot.qte) + '"></div>' +
    '<div class="message"></div>' +
    '<div class="grille"><button class="bouton bouton-petit bouton-vert lot-oui" type="button" hidden>Oui</button>' +
    '<button class="bouton bouton-petit lot-non" type="button">Non</button></div>';
  btn.closest('.item').replaceWith(carte);
  brancherEndroit(carte);
  const cible = () => carte.querySelector('.espace').value || carte.querySelector('.meuble').value;
  const combien = () => parseInt(carte.querySelector('.qte').value, 10) || 0;
  const question = () => {
    const emp = cible(), q = combien(), m = carte.querySelector('.message'), oui = carte.querySelector('.lot-oui');
    const ok = !!emp && q > 0 && q <= lot.qte;
    const les = q > 1 ? 'les ' + q : 'le ' + q;
    m.className = 'message';
    if (q > lot.qte) { m.className = 'message message-erreur'; m.textContent = 'Il y en a ' + lot.qte + ' à ranger.'; }
    else if (!ok) m.textContent = '';
    else m.textContent = 'Ranger ' + les + ' à ' + libelleEndroit(emp) + ' ?' + (q < lot.qte ? ' (' + (lot.qte - q) + ' attendront)' : '');
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
  const rate = (parDeplacer ? 'Pas déplacé' : 'Pas rangé') + ' — réessaie';
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
    if (!liste[cle]) liste[cle] = { pid: String(prod.id), nom: prod.nom, marque: cleMarque, saveur: cleSaveur, formats: [], qte: 0 };
    const x = liste[cle];
    x.qte += qte;
    if (format && x.formats.indexOf(format) === -1) x.formats.push(format);
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
  const detailDe = x => [nomListe(x.marque), nomListe(x.saveur), x.formats.join(' + ')].filter(Boolean).join(' · ');   // plus de « total 0,454 kg » (J-C, 2026-10-01 : pas besoin)
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
/* L'Inventaire : UNE liste, deux vues (J-C, 2026-09-30, piste 2 sur aperçu : « l'inventaire mélange l'inventaire et les meubles »).
   En haut, « Par catégorie » (ce que j'ai) et « Par meuble » (ce qu'il y a dans ce meuble). À l'ouverture : les deux boutons
   seulement, rien de choisi; un bouton touché ouvre sa liste (J-C, 2026-10-01). */
var vueInventaire = '';                          // '' (rien de choisi) | 'categorie' | 'meuble'
function remplirInventaire() {
  const cible = $('liste-inventaire');
  if (!cible) return;
  const transitOuvert = !!cible.querySelector('[data-transit] > .ouvert');   // on range l'un après l'autre : il reste ouvert
  const a = cible.querySelector('[data-transit] .aliment-tete.ouvert'), alimentOuvert = a ? a.parentElement.dataset.aliment : '';   // ses sortes aussi
  LOTS = lotsParProduit();
  const html = vueInventaire === 'meuble' ? htmlInventaireMeubles() : vueInventaire === 'categorie' ? htmlInventaireCategories() : '';
  const choix = '<div class="grille choix-vue">' + [['categorie', 'Par catégorie'], ['meuble', 'Par meuble']].map(v =>
    '<button class="bouton bouton-petit ' + (v[0] === vueInventaire ? 'bouton-brun' : 'choix-eteint') + '" type="button" data-vue="' + v[0] + '">' + v[1] + '</button>').join('') + '</div>';
  const vide = t => '<div class="accordeon-item"><span class="texte-petit texte-pale">' + t + '</span></div>';
  cible.innerHTML = !Object.keys(LOTS).length ? vide('Rien d\'entré pour le moment.')
                  : choix + (!vueInventaire ? '' : html || vide('Rien à montrer ici.'));   // le choix reste là : on peut toujours changer de vue
  const transit = cible.querySelector('[data-transit] > .accordeon-tete');
  if (transitOuvert && transit) toggleAccordeon(transit);
  const aliment = [...cible.querySelectorAll('[data-transit] [data-aliment] > .aliment-tete')].find(t => alimentOuvert && t.parentElement.dataset.aliment === alimentOuvert);
  if (aliment) toggleAccordeon(aliment);
}
/* Par meuble : pièce -> meuble -> espace -> produits, « Pas encore rangé » à la fin des meubles (J-C, 2026-10-01).
   Les endroits vides ne paraissent pas. */
function htmlInventaireMeubles() {
  const par = stockParEndroit();                 // calculé UNE fois pour toute la liste
  let html = '';
  const groupe = (titre, meubles, piece) => {
    const dedans = meubles.map(m => htmlMeubleInventaire(m, par)).join(''), t = teinteBarre(piece);
    return dedans ? '<div class="accordeon"><div class="accordeon-tete' + t.pale + '"' + t.style + '>' + esc(titre) + '</div>' +
      '<div class="accordeon-corps" hidden>' + dedans + '</div></div>' : '';
  };
  PIECES.forEach(p => { html += groupe(p.nom, MEUBLES.filter(m => String(m.pieceId) === String(p.id)), p); });
  return html + groupe('Meubles sans pièce', MEUBLES.filter(m => !m.pieceId)) + htmlPasEncoreRange();   // au bout : ce qui attend d'être rangé
}
/* Par catégorie : les catégories en barres, chacune à sa couleur, une liste blanche d'aliments dessous (comme la Liste d'achats),
   dans l'ordre des sous-catégories puis par nom. Sous chaque aliment, en petit : OÙ il est. Plusieurs sortes : l'accordéon
   de l'Inventaire (le nom, où, le total; on touche pour voir les sortes). Les catégories vides ne paraissent pas. */
function htmlInventaireCategories() {
  const ligne = p => {
    const lots = LOTS[p.id] || [];
    if (!lots.length) return '';
    const sortes = [];
    lots.forEach(l => {
      let x = sortes.find(y => y.marque === l.marque && y.saveur === l.saveur);
      if (!x) sortes.push(x = { marque: l.marque, saveur: l.saveur, formats: [], qte: 0, lots: [] });
      x.qte += l.qte; x.lots.push(l);
      l.formats.forEach(f => { if (x.formats.indexOf(f) === -1) x.formats.push(f); });
    });
    const detail = x => [nomListe(x.marque), nomListe(x.saveur), x.formats.join(' + ')].filter(Boolean).join(' · ');
    const ou = ouSontLots(p.id, lots), total = totalLots(lots);
    if (sortes.length === 1) {
      const d = detail(sortes[0]);
      return '<div class="item"><div class="item-info"><div class="item-nom">' + esc(p.nom) + '</div>' +
        (d ? '<div class="item-detail">' + esc(d) + '</div>' : '') + '<div class="item-detail">' + esc(ou) + '</div></div>' +
        '<span class="item-quantite">' + total + '</span></div>';
    }
    const plusieursEndroits = new Set(lots.map(l => endroitMeuble(l.emp))).size > 1;   // les sortes disent où, seulement s'il y a à choisir
    sortes.sort((a, b) => detail(a).localeCompare(detail(b), 'fr'));
    return '<div class="accordeon aliment"><div class="item aliment-tete"><div class="item-info"><div class="item-nom">' + esc(p.nom) + '</div>' +
      '<div class="item-detail">' + esc(ou) + '</div></div><span class="item-quantite">' + total + '</span></div>' +
      '<div class="aliment-sortes" hidden>' + sortes.map(x => '<div class="item sorte"><div class="item-info"><div class="item-detail">' + esc(detail(x) || p.nom) + '</div>' +
        (plusieursEndroits ? '<div class="item-detail">' + esc(ouSontLots(p.id, x.lots)) + '</div>' : '') + '</div>' +
        '<span class="sorte-quantite">' + x.qte + '</span></div>').join('') + '</div></div>';
  };
  const alpha = (a, b) => String(a.nom).localeCompare(String(b.nom), 'fr');
  const groupe = (nom, prods, rid) => {
    const dedans = prods.map(ligne).join(''), t = teinteCategorie(rid);
    return dedans ? '<div class="accordeon"' + t.style + '><div class="accordeon-tete' + t.pale + '">' + esc(nom) + '</div>' +
      '<div class="accordeon-corps" hidden><div class="liste-blanche">' + dedans + '</div></div></div>' : '';
  };
  const places = {};
  let html = RAYONS.map(r => groupe(r.nom, [].concat(...(SOUSCATS[r.id] || []).map(sc => {
    const ici = PRODUITS.filter(p => String(p.catId) === String(sc.id)).sort(alpha);
    ici.forEach(p => { places[p.id] = true; });
    return ici;
  })), r.id)).join('');
  return html + groupe('Sans catégorie', PRODUITS.filter(p => !places[p.id]).sort(alpha), '');
}
/* « Frigo, Porte » : le meuble et l'espace (par catégorie, la pièce se devine). Rien = « Pas encore rangé ». */
function endroitMeuble(emp) {
  if (!emp) return 'Escale';
  const r = resoudreEmp(emp);
  if (!r) return 'Endroit disparu';
  const m = MEUBLES.find(x => String(x.id) === String(r.meubleId));
  const e = r.espaceId ? (ESPACES[r.meubleId] || []).find(x => String(x.id) === String(r.espaceId)) : null;
  return [m ? m.nom : '', e ? e.nom : ''].filter(Boolean).join(', ');
}
/* Où sont ces lots : « Frigo, Porte (1) · Congélateur, Haut (2) » — ses endroits habituels d'abord, « Pas encore rangé » au bout.
   Un seul endroit : sans le nombre (il est déjà à droite). */
function ouSontLots(pid, lots) {
  const rang = endroitsHabituels(pid), ends = [];
  lots.forEach(l => {
    const k = endroitMeuble(l.emp), x = ends.find(y => y.k === k);
    if (x) x.q += l.qte;
    else ends.push({ k: k, q: l.qte, r: !l.emp ? Infinity : (rang.indexOf(String(l.emp)) + 1 || rang.length + 1) });
  });
  ends.sort((a, b) => (a.r - b.r) || a.k.localeCompare(b.k, 'fr'));
  return ends.length === 1 ? ends[0].k : ends.map(x => x.k + ' (' + x.q + ')').join(' · ');
}

/* ---------- Rechercher (la loupe) : par le texte ou par le scan ----------
   Tout vient de ce que l'app a déjà en mémoire : aucun appel réseau, la réponse est instantanée.
   Le texte cherche dans le nom, la marque et la saveur (sans accent, sans pluriel, une faute permise).
   Un aliment touché ouvre son ÉCRAN DE RAYON (RdG-03) : lui en gros, ses voisins de sous-catégorie dessous. */
var retourRecherche = retourAuMenu;     // où ramène le Retour : l'écran d'où l'on a touché la loupe (l'accueil : avec le menu ouvert)
var rechercheJeton = 0;                 // un scan plus ancien qui répond en retard ne remplace pas l'écran
var modeRecherche = '';                 // '' = Rechercher · 'deplacer' · 'consommer' : le même écran, le lot touché fait le geste
var sorteScannee = null;                // Consommer, Déplacer : la boîte scannée { pid, sortes: [{ marque, saveur, format }] } — elle seule à l'écran
const TITRES_RECHERCHE = { '': 'Rechercher', deplacer: 'Déplacer', consommer: 'Consommer' };
const RETOURS = { 'vue-accueil': () => retourAuMenu(), 'vue-choix-quoi': () => montrerChoixQuoi(),
                  'vue-listes': () => montrerListes(), 'vue-couleurs': () => montrerCouleurs() };
/* depuis : true = on arrive de la loupe ou du menu (on retient d'où); false = on revient d'ailleurs (scan, rayon) */
function montrerRecherche(depuis) {
  if (depuis) {
    const ici = Object.keys(RETOURS).find(id => !$(id).hidden);
    if ($('vue-recherche').hidden) retourRecherche = ici ? RETOURS[ici] : retourAuMenu;   // la fiche en cours ne se rouvre pas vide : l'accueil
    $('recherche-texte').value = '';
  }
  sorteScannee = null;                             // le champ revient : la prochaine recherche part de tout l'aliment
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
/* Une ligne à toucher : le nom, en petit ce qui l'a fait trouver (ou « (plus en réserve) »), la quantité.
   Une précision s'écrit entre parenthèses, jamais en italique (la règle des listes). */
function htmlLigneAliment(p, total, detail) {
  const d = [detail, total ? '' : '(plus en réserve)'].filter(Boolean).join(' ');
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
/* ---------- Le scan dans Consommer et Déplacer : la sorte qu'on tient ----------
   Une sorte = même marque, même saveur, même format (J-C, 2026-09-30 : deux boîtes de café, deux codes).
   Les sortes d'un code : les lignes de STOCK qui le portent (même vides : un pack entamé change de format, pas de code).
   Un format en unités (« 6 unité », le reste « 5 unité ») est la même sorte, quel que soit le nombre.
   Aucune ligne ne porte le code (ne devrait pas arriver) : la sorte est inconnue, tout l'aliment s'affiche. */
function codeNu(c) { return String(c || '').trim().replace(/^0+/, ''); }   // le 0 du début : mangé par le Sheet, remis ou pas
function sortesDuCode(code) {
  const nu = codeNu(code), sortes = [];
  if (!nu) return sortes;
  STOCK.forEach(l => {
    if (codeNu(l[8]) !== nu) return;
    const s = { marque: String(l[5] || '').trim(), saveur: String(l[9] || '').trim(), format: String(l[6] || '').trim() };
    if (!sortes.some(x => x.marque === s.marque && x.saveur === s.saveur && memeFormat(x.format, s.format))) sortes.push(s);
  });
  return sortes;
}
function memeFormat(a, b) { return a === b || (nbUnites(a) > 0 && nbUnites(b) > 0); }
function sorteColle(marque, saveur, format) {
  return !!sorteScannee && sorteScannee.sortes.some(s => s.marque === marque && s.saveur === saveur && memeFormat(s.format, format));
}
/* Les lots à montrer pour la boîte scannée (les autres deviennent des trous : l'index d'un lot reste le sien), et leur total.
   Plus rien de cette sorte : « Tu n'en as plus » (J-C : les autres sortes, pas utile). null = pas de filtre (pas scanné, un autre aliment). */
function filtreSorte(prod, lots) {
  if (!sorteScannee || !modeRecherche || sorteScannee.pid !== String(prod.id) || !sorteScannee.sortes.length) return null;
  let total = 0;
  const garde = lots.map(l => {
    const q = lignesDuLot(l).filter(r => sorteColle(l.marque, l.saveur, String(r[6] || '').trim()))
                            .reduce((s, r) => s + (Number(r[3]) || 0), 0);
    total += q;
    return q > 0 ? l : null;
  });
  return { lots: garde, total: total };
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
  let lots = par[prod.id] || [], total = totalLots(lots);
  const sorte = filtreSorte(prod, lots);           // scanné dans Consommer ou Déplacer : la boîte qu'on tient, seule
  if (sorte) { lots = sorte.lots; total = sorte.total; }
  let corps;
  if (!total) corps = htmlVide('Tu n\'en as plus', '', modeRecherche ? '' : 'data-ajouter-produit="' + esc(prod.id) + '"');
  else if (modeRecherche === 'deplacer') corps = htmlLotsParEndroit(prod, lots, true, (l, i) => htmlLigneLot(prod, l, 'data-bouger="' + esc(prod.id) + '|' + i + '"'))
                                            || htmlVide('Rien à déplacer', 'Tout est en escale', '');
  else if (modeRecherche === 'consommer') corps = htmlLotsParEndroit(prod, lots, false, (l, i) => htmlPartsConsommer(prod, l, i, !!sorte));
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
    if (!l || (sansTransit && !l.emp)) return;     // un trou : un lot écarté par le scan garde la place de son index
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
  const detail = [l.formats.join(' + '), estPasAime(prod.id, l.marque, l.saveur) ? '(pas aimé)' : ''].filter(Boolean).join(' ');
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
function htmlPartsConsommer(prod, l, i, scanne) {
  const nom = [nomListe(l.marque), nomListe(l.saveur)].filter(Boolean).join(' ') || prod.nom;
  const pas = estPasAime(prod.id, l.marque, l.saveur);
  return partsDuLot(l).filter(p => !scanne || sorteColle(l.marque, l.saveur, p.format)).map(p => {
    const detail = [libellePart(p), pas ? '(pas aimé)' : ''].filter(Boolean).join(' ');
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
  appliquerGeste(envoi, { stock: STOCK, pasAimes: PAS_AIMES });   // la mémoire des lieux et des catégories : changée par qui pose le geste
  const c = lireCache();
  if (c) { c.stock = c.stock || []; c.pasAimes = c.pasAimes || []; appliquerGeste(envoi, c); ecrireCache(c); }
  expedierGestes();
}
/* Pose un geste sur des lignes (d = le cache, ou des données fraîchement relues : stock, pasAimes, emps, prods, cats, listes).
   Par ID, en valeurs finales : le poser deux fois ne change rien. Un geste « lignes » réécrit des lignes d'une table
   (retirer un meuble, une catégorie, un aliment, un magasin; changer la catégorie d'aliments). Sans table : Emplacements
   (les premiers, 2026-09-30). Chaque table : où sont ses lignes dans d. */
const TABLES_GESTE = { Emplacements: d => d.emps, Produits: d => d.prods, Categories: d => d.cats,
                       Magasins: d => (d.listes || {}).Magasins, Marques: d => (d.listes || {}).Marques, Saveurs: d => (d.listes || {}).Saveurs };
function appliquerGeste(e, d) {
  if (e.lignes) {
    const rows = (TABLES_GESTE[e.table || 'Emplacements'] || (() => []))(d) || [];
    e.lignes.forEach(l => { const row = rows.find(x => String(x[0]) === String(l[0])); if (row) row.splice(0, l.length, ...l); });
    return;
  }
  const stock = d.stock, pasAimes = d.pasAimes;
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
      try { r = await envoyerGeste(e); } catch (x) {}
      const definitif = r && !r.ok && (r.definitif || /introuvable|jeton manquant/.test(r.erreur || ''));   // (ou un coffre-fort pas encore à jour)
      if (r && r.ok || definitif) ecrireAttenteGestes(lireAttenteGestes().filter(x => x.opId !== e.opId));
      if (definitif) { relire = true; avis('Un changement a été refusé — la réserve est relue', 'erreur'); }
      else if (!(r && r.ok)) { avis('Pas encore enregistré — ça repartira tout seul', 'erreur'); break; }
      file = lireAttenteGestes();
    }
  } finally { envoiGestes = false; }
  if (relire) chargerReferences();
}
/* Un geste part au coffre-fort. Déplacer et Consommer : un appel. Un geste « lignes » : ses lignes réécrites une à la fois
   (Actif = N, une autre catégorie…) — les renvoyer ne change rien; une ligne disparue est sautée. */
async function envoyerGeste(e) {
  if (e.action === 'deplacer') return Coffre.deplacer(e);
  if (e.action === 'consommer') return Coffre.consommer(e);
  for (const l of e.lignes || []) {
    const r = await Coffre.modifier(e.table || 'Emplacements', l[0], l);
    if (!(r && r.ok) && !(r && r.erreur === 'ID introuvable')) return r;
  }
  return { ok: true };
}
/* Un ID fait ici, de la même forme que ceux du coffre-fort (date/heure du Québec) + un tirage : unique sans lui demander. */
function idLocal() {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  const v = t => (p.find(x => x.type === t) || {}).value || '';
  return v('year') + v('month') + v('day') + v('hour') + v('minute') + v('second') +
    String(Date.now() % 1000).padStart(3, '0') + '-' + Math.random().toString(36).slice(2, 7);
}
/* ---------- LA LISTE D'ACHATS (point 5) — décisions de J-C, 2026-09-30 (docs/RdG-06) ----------
   Ce qui MANQUE se calcule tout seul depuis STOCK, par aliment + marque + saveur :
   · il n'en reste plus (zéro partout, rangé ou pas);
   · « pour réserve » : l'aliment a au moins 2 endroits habituels, et tout ce qui reste est à l'emplacement 1 (la réserve est vide).
   Un « Pas aimé » à zéro : la ligne dit seulement l'aliment — s'il n'en reste plus du tout, et si aucune autre sorte n'y est déjà.
   Ce qui S'ÉCRIT (onglet Achats, ID donné ici, jamais effacé : Actif = N) : « coche » (dans le panier), « main » (ajouté à la main,
   l'aliment seul), « plustard » (la poubelle d'un aliment venu tout seul : il ne revient qu'au prochain passage à zéro).
   Une ENTRÉE nettoie tout ça (nettoyerAchats) : l'aliment quitte la liste quand on l'entre, jamais quand on le coche. */
const cleAchat = (pid, m, s) => [pid, m, s].map(v => String(v == null ? '' : v).trim()).join('|');
const achatActif = r => String(r[7]) !== 'N';
const ligneAchat = (pid, m, s, etat) => [idLocal(), String(pid), m || '', s || '', etat, dateDuJour(), localStorage.getItem(QUI) || '', 'O'];
/* Ce qui est sur la liste : [{ cle, pid, marque, saveur, auto: '' | 'zero' | 'pas', main, coche }].
   cote : ce que la poubelle a mis de côté (« plustard ») et qui manquerait encore — le groupe « Mis de côté » (J-C, 2026-10-01, choix C). */
function lignesAchats(cote) {
  const actifs = ACHATS.filter(achatActif);
  const a = (k, etat) => actifs.some(r => r[4] === etat && cleAchat(r[1], r[2], r[3]) === k);
  const existe = pid => PRODUITS.some(p => String(p.id) === String(pid));   // un aliment retiré : plus rien à racheter
  const combos = {}, totalAliment = {};
  STOCK.forEach(l => {
    const pid = String(l[1]), m = String(l[5] || '').trim(), sv = String(l[9] || '').trim(), k = cleAchat(pid, m, sv);
    const x = combos[k] = combos[k] || { pid: pid, marque: m, saveur: sv, total: 0, emps: {} };
    const q = Number(l[3]) || 0;
    if (q > 0) { x.total += q; x.emps[String(l[2] || '')] = true; }
    totalAliment[pid] = (totalAliment[pid] || 0) + Math.max(q, 0);
  });
  const items = {}, ecartes = {}, pasAimes = {};
  const mettre = (pid, m, sv, quoi) => {
    const k = cleAchat(pid, m, sv), ou = quoi !== 'main' && a(k, 'plustard') ? ecartes : items;
    const it = ou[k] = ou[k] || { cle: k, pid: String(pid), marque: m, saveur: sv, auto: '', main: false };
    if (quoi === 'main') it.main = true; else it.auto = quoi;
  };
  Object.values(combos).forEach(x => {
    if (!existe(x.pid)) return;
    if (estPasAime(x.pid, x.marque, x.saveur)) { pasAimes[x.pid] = true; return; }   // vu après les autres sortes

    let quoi = '';
    if (!x.total) quoi = 'zero';
    else {
      const hab = endroitsHabituels(x.pid).filter(e => resoudreEmp(e));
      if (hab.length >= 2 && Object.keys(x.emps).every(e => e === String(hab[0]))) quoi = 'pas';
    }
    if (quoi) mettre(x.pid, x.marque, x.saveur, quoi);
  });
  // un « Pas aimé » : « il manque du yogourt », sans la marque ni la saveur — s'il n'en reste plus du tout,
  // et si aucune autre sorte de cet aliment n'est déjà sur la liste (elle le dit déjà)
  Object.keys(pasAimes).forEach(pid => {
    if (!totalAliment[pid] && !Object.values(items).some(it => it.pid === pid)) mettre(pid, '', '', 'zero');
  });
  actifs.forEach(r => { if (r[4] === 'main' && existe(r[1])) mettre(r[1], '', '', 'main'); });
  if (cote) return Object.values(ecartes).filter(it => !items[it.cle]);   // rajouté à la main entre-temps : il est déjà sur la liste
  return Object.values(items).map(it => Object.assign(it, { coche: a(it.cle, 'coche') }));
}
/* La page : dans l'ordre des catégories (comme J-C les a classées), puis des sous-catégories; les aliments par nom.
   « Sans catégorie » au bout (brune). Puis « Mis de côté » (sans compteur : J-C) : ce que la poubelle a écarté, chacun avec
   la flèche « revenir » (J-C, 2026-10-01 : une poubelle touchée par erreur se répare).
   TOUT FERMÉ à l'ouverture de la page (J-C, 2026-10-01 : « une vraie épicerie, je vais trop scroller »), une barre ouverte à la fois.
   ouvrir : le groupe à ouvrir (data-groupe : l'ID de la catégorie, 'sans' ou 'cote'); sinon celui qui l'était reste ouvert. */
function remplirAchats(ouvrir) {
  const cible = $('liste-achats');
  const ouverte = cible.querySelector(':scope > .accordeon > .accordeon-tete.ouvert');   // on coche l'un après l'autre : elle reste ouverte
  ouvrir = ouvrir || (ouverte ? ouverte.parentElement.dataset.groupe : '');
  const items = lignesAchats(), cote = lignesAchats(true);
  const nomDe = pid => (PRODUITS.find(p => String(p.id) === String(pid)) || {}).nom || '';
  const detail = it => [nomListe(it.marque), nomListe(it.saveur)].filter(Boolean).join(' ');
  const tri = (x, y) => nomDe(x.pid).localeCompare(nomDe(y.pid), 'fr') || detail(x).localeCompare(detail(y), 'fr');
  // sorte : la ligne d'une sorte sous le nom de son aliment (la règle des listes) — marque et saveur en guise de nom
  const ligne = (it, sorte) => {
    const nom = sorte ? (detail(it) || nomDe(it.pid)) : nomDe(it.pid);
    const d = [!sorte ? detail(it) : '', it.auto === 'pas' && !it.main ? '(pour réserve)' : ''].filter(Boolean).join(' ');
    return '<div class="item achat' + (sorte ? ' item-sorte' : '') + (it.coche ? ' achat-coche' : '') + '" data-achat="' + esc(it.cle) + '">' +
      '<input class="case" type="checkbox" tabindex="-1"' + (it.coche ? ' checked' : '') + '>' +
      '<div class="item-info"><div class="item-nom">' + esc(nom) + '</div>' + (d ? '<div class="item-detail">' + esc(d) + '</div>' : '') + '</div>' +
      '<button class="retirer" type="button" data-achat-retirer="' + esc(it.cle) + '" aria-label="Enlever de la liste"></button></div>';
  };
  // une ligne de « Mis de côté » : pas de case (on ne coche pas ce qui est écarté), la flèche « revenir » au bout
  const ligneCote = (it, sorte) => {
    const nom = sorte ? (detail(it) || nomDe(it.pid)) : nomDe(it.pid);
    const d = [!sorte ? detail(it) : '', it.auto === 'pas' ? '(pour réserve)' : ''].filter(Boolean).join(' ');
    return '<div class="item' + (sorte ? ' item-sorte' : '') + '"><div class="item-info"><div class="item-nom">' + esc(nom) + '</div>' +
      (d ? '<div class="item-detail">' + esc(d) + '</div>' : '') + '</div>' +
      '<button class="remettre" type="button" data-achat-remettre="' + esc(it.cle) + '" aria-label="Remettre sur la liste"></button></div>';
  };
  // LA RÈGLE DES LISTES (J-C, 2026-09-30, choix B1) : un aliment à plusieurs sortes = son nom UNE fois, en bandeau pâle en retrait,
  // ses sortes dessous au même retrait; une seule sorte = une ligne complète. Les lignes arrivent triées par aliment.
  const lignesHtml = (lignes, fait) => {
    fait = fait || ligne;
    let html = '';
    for (let i = 0; i < lignes.length; ) {
      let j = i; while (j < lignes.length && lignes[j].pid === lignes[i].pid) j++;
      const memes = lignes.slice(i, j);
      html += memes.length > 1 ? '<div class="espace-bandeau bandeau-aliment">' + esc(nomDe(memes[0].pid)) + '</div>' + memes.map(it => fait(it, true)).join('')
                               : fait(memes[0], false);
      i = j;
    }
    return html;
  };
  const groupe = (nom, lignes, rid) => { const t = teinteCategorie(rid); return lignes.length ? '<div class="accordeon" data-groupe="' + esc(rid || 'sans') + '"' + t.style + '>' +
    '<div class="accordeon-tete' + t.pale + '"><span>' + esc(nom) + '</span></div>' +
    '<div class="liste-blanche achats-groupe" hidden>' + lignesHtml(lignes) + '</div></div>' : ''; };
  const places = {};
  let html = RAYONS.map(r => {
    const lignes = [];
    (SOUSCATS[r.id] || []).forEach(sc => {
      const ici = items.filter(it => String((PRODUITS.find(p => String(p.id) === it.pid) || {}).catId) === String(sc.id)).sort(tri);
      ici.forEach(it => { places[it.cle] = true; lignes.push(it); });
    });
    return groupe(r.nom, lignes, r.id);
  }).join('');
  html += groupe('Sans catégorie', items.filter(it => !places[it.cle]).sort(tri), '');
  html = html || '<div class="accordeon-item"><span class="texte-petit texte-pale">Rien à acheter.</span></div>';
  if (cote.length) html += '<div class="accordeon" data-groupe="cote"><div class="accordeon-tete">Mis de côté</div>' +
    '<div class="liste-blanche achats-groupe" hidden>' + lignesHtml(cote.sort(tri), ligneCote) + '</div></div>';
  cible.innerHTML = html;
  const acc = [...cible.querySelectorAll(':scope > .accordeon')].find(a => ouvrir && a.dataset.groupe === ouvrir);
  if (acc) toggleAccordeon(acc.firstElementChild);
}
async function montrerAchats() {
  toutCacher(); $('vue-achats').hidden = false; $('btn-burger').hidden = false;
  fermerAjoutAchat();
  $('liste-achats').innerHTML = '';                // une nouvelle visite : tout repart fermé
  if (!RAYONS.length) {                            // pas encore chargé → on charge (même patron que les bases)
    $('liste-achats').innerHTML = '<div class="texte-petit texte-pale">Chargement…</div>';
    await chargerReferences();
  }
  remplirAchats();
  expedierAchats();                                // ce qui attendait repart
}
/* Toucher une ligne : dans le panier (grise et barrée) — ou l'inverse. Instantané. */
function cocherAchat(k) {
  const it = lignesAchats().find(x => x.cle === k);
  if (!it) return;
  const coches = ACHATS.filter(r => achatActif(r) && r[4] === 'coche' && cleAchat(r[1], r[2], r[3]) === k);
  poserAchats(coches.length ? coches.map(r => { const l = r.slice(); l[7] = 'N'; return l; }) : [ligneAchat(it.pid, it.marque, it.saveur, 'coche')]);
  remplirAchats();
}
/* La poubelle : ajouté à la main -> il s'en va; venu tout seul -> « pas pour l'instant » : il passe dans « Mis de côté ».
   Sa coche s'en va avec lui. */
function enleverAchat(k) {
  const it = lignesAchats().find(x => x.cle === k);
  if (!it) return;
  const lignes = ACHATS.filter(r => achatActif(r) && (r[4] === 'coche' || r[4] === 'main') && cleAchat(r[1], r[2], r[3]) === k)
    .map(r => { const l = r.slice(); l[7] = 'N'; return l; });
  if (it.auto) lignes.push(ligneAchat(it.pid, it.marque, it.saveur, 'plustard'));
  poserAchats(lignes);
  remplirAchats();
}
/* La flèche « revenir » (Mis de côté) : il revient sur la liste. Instantané; un 2e toucher ne trouve plus rien à défaire. */
function remettreAchat(k) {
  poserAchats(ACHATS.filter(r => achatActif(r) && r[4] === 'plustard' && cleAchat(r[1], r[2], r[3]) === k)
    .map(r => { const l = r.slice(); l[7] = 'N'; return l; }));
  remplirAchats();
}
/* Une entrée réussie : l'aliment quitte la liste — son ajout à la main, et la coche ou le « pas pour l'instant »
   de ce qui a été entré (et de l'aliment seul, sans marque ni saveur). Le prochain passage à zéro repart de rien. */
function nettoyerAchats(pid, marque, saveur) {
  const k = cleAchat(pid, marque, saveur);
  poserAchats(ACHATS.filter(r => achatActif(r) && String(r[1]) === String(pid) &&
      (r[4] === 'main' || cleAchat(r[1], r[2], r[3]) === k || (!String(r[2] || '').trim() && !String(r[3] || '').trim())))
    .map(r => { const l = r.slice(); l[7] = 'N'; return l; }));
}
/* ---- Ce qui s'écrit : SA PROPRE FILE, à part de Consommer/Déplacer (rien n'y dépend de STOCK, et un coffre-fort pas encore
   à jour — « action inconnue » — ne doit pas bloquer les consommations). La mémoire change tout de suite; l'envoi, un à la fois;
   un échec reste en attente, sans bruit, et repart au prochain geste ou au prochain chargement. ---- */
function lireAttenteAchats() { try { return JSON.parse(localStorage.getItem(ATTENTE_ACHATS) || '[]') || []; } catch (e) { return []; } }
function ecrireAttenteAchats(a) { try { localStorage.setItem(ATTENTE_ACHATS, JSON.stringify(a)); } catch (e) {} }
function poserLignesAchats(lignes, rows) {             // par ID, en valeurs finales : poser deux fois ne change rien
  lignes.forEach(l => { const row = rows.find(x => String(x[0]) === String(l[0])); if (row) row.splice(0, l.length, ...l); else rows.push(l.slice()); });
}
function poserAchats(lignes) {
  if (!lignes.length) return;
  ecrireAttenteAchats(lireAttenteAchats().concat([{ lignes: lignes }]));   // gardé AVANT tout : un appareil éteint en route ne perd rien
  poserLignesAchats(lignes, ACHATS);
  const c = lireCache(); if (c) { poserLignesAchats(lignes, c.achats = c.achats || []); ecrireCache(c); }
  expedierAchats();
}
async function expedierAchats() {
  if (envoiAchats) return;
  envoiAchats = true;
  try {
    while (lireAttenteAchats().length) {
      let r = null;
      try { r = await Coffre.achats({ lignes: lireAttenteAchats()[0].lignes }); } catch (x) {}
      if (!(r && r.ok)) break;                          // réseau, ou coffre-fort pas encore à jour : tout reste, ça repartira
      ecrireAttenteAchats(lireAttenteAchats().slice(1));
    }
  } finally { envoiAchats = false; }
}
/* ---- « Ajouter à la liste » : l'entonnoir (catégorie → sous-catégorie → aliment, « Nouvel aliment… » au bout) et le scan,
   à la place de la liste. L'aliment seul (sans marque ni saveur). ---- */
function ouvrirAjoutAchat() {
  montrer('achats-page', false); montrer('achats-ajout', true);
  $('achat-cat').innerHTML = options(RAYONS, '— Catégorie —');
  montrer('bloc-achat-souscat', false); montrer('bloc-achat-aliment', false); montrer('bloc-achat-nom', false);
  $('achat-nom').value = '';
  msgAchat(nomScanne ? 'Nouveau : « ' + nomScanne + ' ». Choisis sa catégorie et sa sous-catégorie.' : '');
}
function fermerAjoutAchat() { montrer('achats-ajout', false); montrer('achats-page', true); nomScanne = ''; msgAchat(''); }
function msgAchat(txt, erreur) { $('achats-msg').className = 'message message-repli' + (erreur ? ' message-erreur' : ''); $('achats-msg').textContent = txt; }
function surAchatCat() {
  $('achat-souscat').innerHTML = options(SOUSCATS[$('achat-cat').value] || [], '— Sous-catégorie —');
  montrer('bloc-achat-souscat', !!$('achat-cat').value); montrer('bloc-achat-aliment', false); montrer('bloc-achat-nom', false);
}
function surAchatSousCat() {
  const scid = $('achat-souscat').value;
  const ps = PRODUITS.filter(p => String(p.catId) === String(scid)).sort((a, b) => String(a.nom).localeCompare(String(b.nom), 'fr'));
  $('achat-aliment').innerHTML = options(ps, '— Aliment —') + '<option value="neuf">Nouvel aliment…</option>';
  montrer('bloc-achat-aliment', !!scid);
  if (scid && nomScanne) { $('achat-aliment').value = 'neuf'; $('achat-nom').value = nomScanne; }   // le nom lu au scan, prêt
  surAchatAliment();
}
function surAchatAliment() {
  const neuf = $('achat-aliment').value === 'neuf';
  montrer('bloc-achat-nom', neuf);
  if (neuf && !$('achat-nom').value) $('achat-nom').focus();
}
/* « Mettre sur la liste » : un aliment choisi, ou nouveau (créé dans sa sous-catégorie; un nom qui existe déjà est repris). */
async function validerAjoutAchat() {
  const btn = $('achat-ok');
  if (btn.disabled) return;
  let pid = $('achat-aliment').value;
  if (!pid || !$('achat-souscat').value) { msgAchat('Choisis une catégorie, une sous-catégorie et un aliment.', true); return; }
  if (pid === 'neuf') {
    const nom = $('achat-nom').value.trim(), scid = $('achat-souscat').value;
    if (!nom) { msgAchat('Donne un nom au nouvel aliment.', true); $('achat-nom').focus(); return; }
    const deja = PRODUITS.find(p => cleNom(p.nom) === cleNom(nom));
    if (deja) pid = deja.id;
    else {
      btn.disabled = true; montrerVoile(true);
      try {
        // Produits : ID · Nom · CategorieID · Unite · Actif · Marque · Format
        const r = await Coffre.ajouter('Produits', ['', nom, scid, '', 'O', '', '']);
        if (!r || !r.ok) throw new Error((r && r.erreur) || 'refus');
        pid = r.id;
        PRODUITS.push({ id: pid, nom: nom, catId: scid, ordre: '' });
        const c = lireCache(); if (c) { (c.prods = c.prods || []).push([pid, nom, scid, '', 'O', '', '']); ecrireCache(c); }
        remplirProduitsDatalist();
      } catch (e) {
        msgAchat('Aliment pas créé — réessaie.', true);
        chargerReferences();                          // s'il a été créé quand même, le 2e essai le reprendra par son nom
        return;
      } finally { btn.disabled = false; montrerVoile(false); }
    }
  }
  mettreSurListe(pid);
}
function mettreSurListe(pid) {
  const p = PRODUITS.find(x => String(x.id) === String(pid)) || {}, nom = p.nom || '';
  fermerAjoutAchat();
  if (lignesAchats().some(it => it.pid === String(pid))) avis('Déjà sur la liste : ' + nom);
  else { poserAchats([ligneAchat(pid, '', '', 'main')]); avis('Sur la liste : ' + nom, 'succes'); }
  const r = RAYONS.find(x => (SOUSCATS[x.id] || []).some(sc => String(sc.id) === String(p.catId)));
  remplirAchats(r ? String(r.id) : 'sans');        // sa catégorie s'ouvre : on le voit sur la liste
}
/* Le scan : un code à nous -> sur la liste; sinon le nom d'Open Food Facts, pour « Nouvel aliment… » (sa catégorie à choisir). */
function scannerPourAchat() {
  if (typeof montrerScanner !== 'function') return;
  montrerScanner({ lu: achatParCode, retour: montrerPageAchatsAjout });
}
function montrerPageAchatsAjout() {                    // revenir du scan sur l'entonnoir, tel quel
  toutCacher(); $('vue-achats').hidden = false; $('btn-burger').hidden = false;
  ouvrirAjoutAchat();
}
async function achatParCode(code) {
  code = String(code || '').trim();
  const pid = CODES[code];
  toutCacher(); $('vue-achats').hidden = false; $('btn-burger').hidden = false;
  if (pid && PRODUITS.some(p => String(p.id) === String(pid))) { mettreSurListe(pid); return; }
  ouvrirAjoutAchat(); msgAchat('Recherche du produit…');
  let d = null;
  if (typeof window.chercherOFF === 'function') { try { d = await window.chercherOFF(code); } catch (e) {} }
  if ($('vue-achats').hidden || $('achats-ajout').hidden) return;    // il est passé à autre chose entre-temps
  const nomLu = (d && d.trouve && (d.nom || d.nomAutre)) || '';   // pas de nom français : l'anglais, à corriger (comme la fiche)
  const connu = nomLu && trouverProduitParNom(nomLu);             // le code n'est pas noté, mais le nom est à nous
  if (connu) { mettreSurListe(connu.id); return; }
  nomScanne = nomLu;
  ouvrirAjoutAchat();
  if (!nomScanne) msgAchat('Produit inconnu — choisis-le à la main.', true);
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
    montrerVoile(false); remplirPageAliments(true);
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
  if (pid && PRODUITS.some(p => String(p.id) === String(pid))) {
    if (modeRecherche) sorteScannee = { pid: String(pid), sortes: sortesDuCode(code) };   // Consommer, Déplacer : la boîte qu'on tient
    montrerRayon(pid); return;
  }
  const jeton = ++rechercheJeton;
  $('recherche-resultats').innerHTML = htmlVide('', 'Recherche du produit…');
  let d = null;
  if (typeof window.chercherOFF === 'function') { try { d = await window.chercherOFF(code); } catch (e) {} }
  if (jeton !== rechercheJeton || $('vue-recherche').hidden) return;   // il est passé à autre chose entre-temps
  const nomOFF = d && (d.nom || d.nomAutre);
  const connu = nomOFF && trouverProduitParNom(nomOFF);                // le code n'est pas noté, mais le nom est à nous
  if (connu) { montrerRayon(connu.id); return; }
  const trouve = !!(d && d.trouve);
  const nomLu = trouve ? (d.nom || d.nomAutre || '') : '';   // pas de nom français : l'anglais (comme la fiche, qui le fait corriger)
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
  if (type === 'c') return { liste: RAYONS, groupe: RAYONS, cle: 'c' };
  if (type === 's') {
    for (const rid in SOUSCATS) if (SOUSCATS[rid].some(x => String(x.id) === id)) return { liste: SOUSCATS[rid], groupe: SOUSCATS[rid], cle: 's:' + rid };
  }
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
  if (type === 'c' || type === 's') { remplirPageCategories(true); remplirCategories(); }   // la fiche suit le nouvel ordre
  planifierOrdre();
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
/* L'ordre des catégories pas encore confirmé : { categorieId: rang } (survit à une fermeture). */
function lireAttenteCats()   { try { return JSON.parse(localStorage.getItem(ATTENTE_CATS) || '{}') || {}; } catch (e) { return {}; } }
function ecrireAttenteCats(a){ try { localStorage.setItem(ATTENTE_CATS, JSON.stringify(a)); } catch (e) {} }
/* Pose ces rangs dans des lignes de Categories (le cache, ou des données fraîchement relues) : colonne G. */
function poserOrdresCats(cats, ordres) {
  (cats || []).forEach(r => {
    const o = ordres[String(r[0])];
    if (o === undefined) return;
    while (r.length < 7) r.push('');
    r[6] = o;
  });
}
/* Pose ces ordres dans des lignes de Produits (le cache, ou des données fraîchement relues) : colonne J. */
function poserOrdresAliments(prods, ordres) {
  (prods || []).forEach(r => {
    const o = ordres[String(r[0])];
    if (o === undefined) return;
    while (r.length < 10) r.push('');
    r[9] = o;
  });
}

/* L'ordre part (2 s après la dernière flèche, ou on quitte l'écran) : gardé ici, puis envoyé sans rien bloquer. */
function envoyerOrdre() {
  const cles = Object.keys(ordreModifie);
  const groupes = cles.map(idsDuGroupe).filter(g => g.length > 1);
  const aliments = {};                                     // l'ordre des endroits des aliments touchés
  cles.filter(k => k.indexOf('a:') === 0).forEach(k => {
    const p = PRODUITS.find(x => String(x.id) === k.slice(2));
    if (p) aliments[String(p.id)] = p.ordre;
  });
  const cats = {};                                         // catégories : le rang (1, 2, 3…) de celles qui ont bougé
  cles.filter(k => k === 'c' || k.indexOf('s:') === 0).forEach(k => {
    (k === 'c' ? RAYONS : SOUSCATS[k.slice(2)] || []).forEach((x, i) => {
      if (Number(x.ordre) !== i + 1) { x.ordre = i + 1; cats[String(x.id)] = i + 1; }
    });
  });
  clearTimeout(minuterieOrdre);
  ordreModifie = {};
  if (!groupes.length && !Object.keys(aliments).length && !Object.keys(cats).length) return;
  const c = lireCache(); if (c) { reordonnerLignes(c.emps, groupes); poserOrdresAliments(c.prods, aliments); poserOrdresCats(c.cats, cats); ecrireCache(c); }
  if (groupes.length) ecrireAttente(lireAttente().concat(groupes));
  ecrireAttenteAliments(Object.assign(lireAttenteAliments(), aliments));
  ecrireAttenteCats(Object.assign(lireAttenteCats(), cats));
  expedierOrdre();
}
/* Envoie l'attente au coffre-fort, en arrière-plan (la file de coffre.js garde un appel à la fois).
   Succès : l'attente se vide. Échec : elle reste, et repart au prochain passage.
   Un aliment = sa ligne de Produits réécrite, colonne J comprise (valeur finale : la renvoyer ne change rien). */
async function expedierOrdre() {
  const groupes = lireAttente(), aliments = lireAttenteAliments(), cats = lireAttenteCats();
  if ((!groupes.length && !Object.keys(aliments).length && !Object.keys(cats).length) || envoiOrdre) return;
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
    for (const id of Object.keys(cats)) {                    // une catégorie = sa ligne réécrite, rang en col. G (le renvoyer ne change rien)
      const row = c && (c.cats || []).find(x => String(x[0]) === id);
      if (row) {
        const ligne = row.slice(); while (ligne.length < 7) ligne.push(''); ligne[6] = cats[id];
        const r = await Coffre.modifier('Categories', id, ligne);
        if ((!r || !r.ok) && !(r && r.erreur === 'ID introuvable')) throw new Error((r && r.erreur) || 'refus');
      }
      const reste = lireAttenteCats();
      if (reste[id] === cats[id]) { delete reste[id]; ecrireAttenteCats(reste); }
    }
    ok = true;
    avis('Ordre enregistré ✓', 'succes');
  } catch (e) {
    avis("Ordre pas encore enregistré — il repartira tout seul", 'erreur');
  } finally {
    envoiOrdre = false;
    if (ok && (lireAttente().length || Object.keys(lireAttenteAliments()).length || Object.keys(lireAttenteCats()).length)) expedierOrdre();   // ce qui s'est ajouté pendant l'envoi
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
/* Une flèche : l'endroit échange sa place avec son voisin. Instantané, envoyé tout seul (planifierOrdre). */
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
  remplirPageAliments(true);
  planifierOrdre();
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
/* L'écran Couleurs : la palette du site, famille par famille (les pièces et les meubles choisissent la leur sur leur page). */
function remplirCouleurs() {
  const accordeon = (titre, corps) => '<div class="accordeon"><div class="accordeon-tete">' + esc(titre) + '</div><div class="accordeon-corps" hidden>' + corps + '</div></div>';
  $('liste-couleurs').innerHTML = FAMILLES.map(([f, titre]) => accordeon(titre,
    COULEURS_SITE.filter(([nom]) => nom.charAt(8) === f)
      .map(([nom, libelle, usage]) => htmlLigneCouleur('data-site', nom, libelle, usageCouleur(nom.slice(8), usage), couleurActuelle(nom))).join(''))).join('');
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

/* Ajouter un espace (tablette…) à un meuble : même geste que le meuble. Même nom dans le même meuble = rien de créé.
   Ensuite, le champ est prêt pour le suivant (Tablette 1, 2, 3…). */
async function ajouterEspace(meubleId, btn) {
  const input = btn.parentElement.querySelector('.espace-nouveau'), nom = input.value.trim();
  if (!nom) { input.focus(); return; }
  if (btn.disabled) return;
  const deja = (ESPACES[meubleId] || []).find(e => cleNom(e.nom) === cleNom(nom));
  if (deja) { avis('« ' + deja.nom + ' » existe déjà dans ce meuble', 'erreur'); return; }
  btn.disabled = true; montrerVoile(true);
  try {
    // Emplacements : ID · Nom · ParentID (le meuble) · SecteurID · Actif · Couleur (vide : un espace suit son meuble)
    const r = await Coffre.ajouter('Emplacements', ['', nom, meubleId, SECTEUR_ID, 'O', '']);
    if (!r || !r.ok) throw new Error((r && r.erreur) || 'refus');
    (ESPACES[meubleId] = ESPACES[meubleId] || []).push({ id: r.id, nom: nom });
    const c = lireCache(); if (c) { (c.emps = c.emps || []).push([r.id, nom, meubleId, SECTEUR_ID, 'O', '']); ecrireCache(c); }
    remplirMeubles(true);
    const champ = $('liste-meubles').querySelector('.ajout-espace[data-meuble="' + esc(meubleId) + '"]');
    if (champ) champ.parentElement.querySelector('.espace-nouveau').focus();
  } catch (e) {
    avis('Espace pas ajouté — réessaie', 'erreur');
    chargerReferences().then(() => {
      if (!$('vue-meubles').hidden && (ESPACES[meubleId] || []).some(x => cleNom(x.nom) === cleNom(nom))) remplirMeubles(true);
    });
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
  // les 8 bases : chacune ouvre sa page
  const PAGES_BASES = { pieces: montrerPieces, meubles: montrerMeubles, categories: montrerPageCategories, aliments: montrerPageAliments,
                        magasins: () => montrerPageNoms('magasins'), marques: () => montrerPageNoms('marques'), saveurs: () => montrerPageNoms('saveurs'),
                        unites: () => montrerPageNoms('unites') };
  document.querySelectorAll('[data-base]').forEach(b => b.addEventListener('click', PAGES_BASES[b.dataset.base]));
  $('menu-couleurs').addEventListener('click', montrerCouleurs);
  // le menu mène exactement où mènent les 4 boutons de l'accueil
  $('menu-ajouter').addEventListener('click', montrerChoixQuoi);
  $('menu-deplacer').addEventListener('click', montrerDeplacer);
  $('menu-consommer').addEventListener('click', montrerConsommer);
  $('menu-listes').addEventListener('click', montrerListes);
  $('menu-achats').addEventListener('click', montrerAchats);
  $('menu-rechercher').addEventListener('click', ouvrirRecherche);   // la loupe : le 8e bouton du menu (J-C, 2026-10-01; plus de loupe dans le coin)
  // la liste d'achats : toucher une ligne la coche; la poubelle la met de côté; la flèche « revenir » la remet;
  // « Ajouter à la liste » ouvre l'entonnoir
  $('liste-achats').addEventListener('click', function (ev) {
    const pb = ev.target.closest('[data-achat-retirer]');
    if (pb) { enleverAchat(pb.dataset.achatRetirer); return; }
    const rv = ev.target.closest('[data-achat-remettre]');
    if (rv) { remettreAchat(rv.dataset.achatRemettre); return; }
    const tete = ev.target.closest('.accordeon-tete');     // une catégorie, ou « Mis de côté » : une seule ouverte à la fois
    if (tete) { toggleAccordeon(tete); return; }
    const l = ev.target.closest('[data-achat]');
    if (l) cocherAchat(l.dataset.achat);
  });
  $('achats-retour').addEventListener('click', retourAuMenu);
  $('btn-achat-ajouter').addEventListener('click', () => { nomScanne = ''; ouvrirAjoutAchat(); });
  $('achat-annuler').addEventListener('click', () => { fermerAjoutAchat(); remplirAchats(); });
  $('achat-cat').addEventListener('change', surAchatCat);
  $('achat-souscat').addEventListener('change', surAchatSousCat);
  $('achat-aliment').addEventListener('change', surAchatAliment);
  $('achat-ok').addEventListener('click', validerAjoutAchat);
  $('achat-nom').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); validerAjoutAchat(); } });
  $('achat-scan').addEventListener('click', scannerPourAchat);
  // Outils → Couleurs
  $('liste-couleurs').addEventListener('input', surHex);
  $('liste-couleurs').addEventListener('click', function (ev) {
    const tete = ev.target.closest('.accordeon-tete');
    if (tete) toggleAccordeon(tete);
  });
  $('btn-couleurs').addEventListener('click', envoyerCouleurs);
  $('menu-deco').addEventListener('click', deconnexion);
  // Gérer les bases → Pièces
  $('btn-piece-ajouter').addEventListener('click', ajouterPiece);
  $('piece-nouvelle').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); ajouterPiece(); } });
  $('pieces-retour').addEventListener('click', () => { ouvrirMenu(); montrerGrilleMenu('bases'); });   // le menu, sur la grille des 8 bases
  $('liste-pieces').addEventListener('click', function (ev) {
    const cr = ev.target.closest('.crayon');               // avant la tête : le crayon n'ouvre ni ne ferme rien
    if (cr) { ouvrirRenommer(cr); return; }
    const fl = ev.target.closest('.fleche');               // idem pour une flèche
    if (fl) { if (!fl.classList.contains('fleche-eteinte')) deplacer(fl.dataset.type, fl.dataset.id, Number(fl.dataset.sens)); return; }
    const pa = ev.target.closest('.pastille-choix');
    if (pa) { choisirCouleurLieu(pa.closest('.accordeon').dataset.id, pa.dataset.num); return; }
    const tete = ev.target.closest('.accordeon-tete');
    if (tete) toggleAccordeon(tete);
  });
  // l'app passe en arrière-plan (onglet fermé, iPad verrouillé) : l'ordre bougé part quand même
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { envoyerOrdre(); envoyerCouleurs(); return; }
    retourDansApp();   // on revient dans l'app : les entrées de l'autre appareil arrivent toutes seules
  });
  // Gérer les bases → Meubles
  $('meubles-retour').addEventListener('click', () => { ouvrirMenu(); montrerGrilleMenu('bases'); });   // le menu, sur la grille des 8 bases
  // changer la pièce d'un meuble (menu déroulant généré)
  $('liste-meubles').addEventListener('change', function (ev) {
    const sel = ev.target.closest('.choix-piece');
    if (sel) assignerPiece(sel.getAttribute('data-meuble'), sel.value, sel);
  });
  // liste des meubles (éléments générés) : retirer, renommer, l'ordre, la couleur, ajouter, ouvrir/fermer
  $('liste-meubles').addEventListener('click', function (ev) {
    const oui = ev.target.closest('[data-retirer-oui]');   // « Retirer … ? » Oui
    if (oui) { const k = oui.dataset.retirerOui.split('|'); retirerLieu(k[0], k[1]); return; }
    if (ev.target.closest('[data-retirer-non]')) { remplirMeubles(true); return; }
    const pb = ev.target.closest('.retirer');              // avant la tête : la poubelle n'ouvre ni ne ferme rien
    if (pb) { const k = pb.dataset.retirer.split('|'); demanderRetrait(k[0], k[1]); return; }
    const cr = ev.target.closest('.crayon');               // idem pour le crayon
    if (cr) { ouvrirRenommer(cr); return; }
    const fl = ev.target.closest('.fleche');               // idem pour une flèche
    if (fl) { if (!fl.classList.contains('fleche-eteinte')) deplacer(fl.dataset.type, fl.dataset.id, Number(fl.dataset.sens)); return; }
    const pa = ev.target.closest('.pastille-choix');       // la couleur du meuble
    if (pa) { choisirCouleurLieu(pa.closest('.accordeon').dataset.id, pa.dataset.num); return; }
    const bEsp = ev.target.closest('.ajout-espace');
    if (bEsp) { ajouterEspace(bEsp.dataset.meuble, bEsp); return; }
    const bMeu = ev.target.closest('.ajout-meuble');
    if (bMeu) { ajouterMeuble(bMeu.dataset.piece, bMeu); return; }
    const tete = ev.target.closest('.accordeon-tete');
    if (tete) toggleAccordeon(tete);
  });
  $('liste-meubles').addEventListener('keydown', entreeAjoute);
  // Gérer les bases → Catégories
  $('categories-retour').addEventListener('click', () => { ouvrirMenu(); montrerGrilleMenu('bases'); });   // le menu, sur la grille des 8 bases
  $('liste-categories').addEventListener('keydown', entreeAjoute);
  $('liste-categories').addEventListener('click', function (ev) {
    const oui = ev.target.closest('[data-retirer-oui]');   // « Retirer … ? » Oui (avec, s'il le faut, où vont ses aliments)
    if (oui) { const k = oui.dataset.retirerOui.split('|'), sel = oui.parentElement.querySelector('.destination'); retirerCategorie(k[0], k[1], sel ? sel.value : ''); return; }
    if (ev.target.closest('[data-retirer-non]')) { remplirPageCategories(true); return; }
    const pb = ev.target.closest('.retirer');              // avant la tête : la poubelle n'ouvre ni ne ferme rien
    if (pb) { const k = pb.dataset.retirer.split('|'); demanderRetraitCat(k[0], k[1]); return; }
    const cr = ev.target.closest('.crayon');               // idem pour le crayon
    if (cr) { ouvrirRenommer(cr); return; }
    const fl = ev.target.closest('.fleche');               // idem pour une flèche
    if (fl) { if (!fl.classList.contains('fleche-eteinte')) deplacer(fl.dataset.type, fl.dataset.id, Number(fl.dataset.sens)); return; }
    const b = ev.target.closest('.ajout-categorie');
    if (b) { ajouterCategoriePage(b.dataset.rayon, b); return; }
    const pa = ev.target.closest('.pastille-choix');       // la couleur de la catégorie
    if (pa) { choisirCouleurCategorie(pa.closest('.accordeon').dataset.id, pa.dataset.num); return; }
    const tete = ev.target.closest('.accordeon-tete');
    if (tete) toggleAccordeon(tete);
  });
  // Gérer les bases → Aliments
  $('aliments-retour').addEventListener('click', () => { ouvrirMenu(); montrerGrilleMenu('bases'); });   // le menu, sur la grille des 8 bases
  $('liste-aliments').addEventListener('change', function (ev) {   // une autre sous-catégorie
    const sel = ev.target.closest('.choix-souscat');
    if (sel) assignerSousCat(sel.dataset.aliment, sel.value);
  });
  $('liste-aliments').addEventListener('click', function (ev) {
    const oui = ev.target.closest('[data-retirer-oui]');   // « Retirer … ? » Oui
    if (oui) { retirerAliment(oui.dataset.retirerOui.split('|')[1]); return; }
    const ru = ev.target.closest('[data-reunir]');         // « … existe déjà : les réunir ? » Oui
    if (ru) { reunirNoms(ru.dataset.reunir); return; }
    if (ev.target.closest('[data-retirer-non], [data-reunir-non]')) { remplirPageAliments(true); return; }
    const pas = ev.target.closest('[data-pas-aime]');      // « Pas aimé » : Enlever
    if (pas) { enleverPasAime(pas); return; }
    const pb = ev.target.closest('.retirer');              // avant la tête : la poubelle, le crayon et les flèches n'ouvrent ni ne ferment rien
    if (pb) { demanderRetraitAliment(pb.dataset.retirer.split('|')[1]); return; }
    const cr = ev.target.closest('.crayon');
    if (cr) { ouvrirRenommer(cr); return; }
    const fl = ev.target.closest('.fleche');               // l'ordre des endroits d'un aliment
    if (fl) { if (!fl.classList.contains('fleche-eteinte')) monterEndroit(fl.dataset.id, Number(fl.dataset.sens)); return; }
    const tete = ev.target.closest('.aliment-tete, .accordeon-tete');
    if (!tete) return;
    if (tete.classList.contains('aliment-tete')) remplirCorpsAliment(tete);
    toggleAccordeon(tete);
  });
  // Gérer les bases → Magasins, Marques, Saveurs (une seule page)
  $('noms-retour').addEventListener('click', () => { ouvrirMenu(); montrerGrilleMenu('bases'); });   // le menu, sur la grille des 8 bases
  $('btn-nom-ajouter').addEventListener('click', ajouterNom);
  $('nom-nouveau').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); ajouterNom(); } });
  $('liste-noms').addEventListener('click', function (ev) {
    const oui = ev.target.closest('[data-retirer-oui]');   // « Retirer … ? » Oui
    if (oui) { retirerNom(oui.dataset.retirerOui.split('|')[1]); return; }
    const ru = ev.target.closest('[data-reunir]');         // « … existe déjà : les réunir ? » Oui
    if (ru) { reunirNoms(ru.dataset.reunir); return; }
    if (ev.target.closest('[data-retirer-non], [data-reunir-non]')) { remplirPageNoms(); return; }
    const pb = ev.target.closest('.retirer');
    if (pb) { demanderRetraitNom(pb.dataset.retirer.split('|')[1]); return; }
    const cr = ev.target.closest('.crayon');
    if (cr) ouvrirRenommer(cr);                            // la barre elle-même n'ouvre rien : un nom, c'est tout
  });
  document.querySelectorAll('.accordeon-tete[data-toggle]').forEach(tete =>
    tete.addEventListener('click', () => toggleAccordeon(tete)));
  $('liste-inventaire').previousElementSibling.addEventListener('click', function () {   // l'Inventaire s'ouvre toujours sur ses deux boutons, rien de choisi
    if (this.classList.contains('ouvert')) { vueInventaire = ''; remplirInventaire(); }
  });
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
    const vue = ev.target.closest('[data-vue]');           // « Par catégorie » / « Par meuble »
    if (vue) { if (vue.dataset.vue !== vueInventaire) { vueInventaire = vue.dataset.vue; remplirInventaire(); } return; }
    const lot = ev.target.closest('.ranger[data-lot]');    // l'Escale : les deux flèches rangent
    if (lot) { ouvrirLot(lot); return; }
    if (ev.target.closest('.endroit')) return;             // toucher la carte ouverte ne plie pas l'accordéon
    const aliment = ev.target.closest('.aliment-tete');    // un aliment à plusieurs sortes : on les montre
    if (aliment) { toggleAccordeon(aliment); return; }
    const tete = ev.target.closest('.accordeon-tete');
    if (tete) toggleAccordeon(tete);
  });            // bouton bleu → la page des listes
  $('btn-retour-listes').addEventListener('click', () => {   // Retour recule d'un pas (J-C, 2026-10-01) : une liste ouverte se referme; sinon, le menu
    const ouverte = $('vue-listes').querySelector('.contenu > .accordeon > .accordeon-tete.ouvert');
    if (ouverte) { toggleAccordeon(ouverte); window.scrollTo(0, 0); } else retourAuMenu();
  });
  $('choix-produit').addEventListener('click', () => montrerFormulaire(false));   // l'entonnoir, et le scan à côté
  $('choix-epicerie').addEventListener('click', () => avis("Toute l'épicerie — à venir"));
  $('fiche-scan').addEventListener('click', () => {
    if (typeof montrerScanner === 'function') montrerScanner({ lu: ouvrirFicheScan, retour: () => montrerFormulaire(false) });
  });
  $('btn-retour-quoi').addEventListener('click', retourAuMenu);         // retour : choix « quoi » → le menu
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
  if (!$('vue-app').hidden) return;   // une saisie en cours : on ne touche à rien
  await chargerReferences();
  if (!$('vue-listes').hidden && !document.querySelector('#liste-inventaire .endroit')) remplirInventaire();   // pas pendant un rangement
  if (!$('vue-pieces').hidden && !Object.keys(ordreModifie).length && !document.querySelector('.champ-renommer')) remplirPieces();
  const saisieMeubles = [...$('liste-meubles').querySelectorAll('input')].some(i => i.value) || $('liste-meubles').querySelector('.champ-renommer, [data-confirme]');
  if (!$('vue-meubles').hidden && !Object.keys(ordreModifie).length && !saisieMeubles) remplirMeubles(true);   // pas pendant une saisie ni une question
  const saisieCats = [...$('liste-categories').querySelectorAll('input')].some(i => i.value) || $('liste-categories').querySelector('.champ-renommer, [data-confirme]');
  if (!$('vue-categories').hidden && !Object.keys(ordreModifie).length && !saisieCats) remplirPageCategories(true);
  const saisieAliments = $('liste-aliments').querySelector('.champ-renommer, [data-confirme]');
  if (!$('vue-aliments').hidden && !Object.keys(ordreModifie).length && !saisieAliments) remplirPageAliments(true);   // pas pendant un nom ni une question
  const saisieNoms = $('nom-nouveau').value || $('liste-noms').querySelector('.champ-renommer, [data-confirme]');
  if (!$('vue-noms').hidden && !saisieNoms) remplirPageNoms();
  if (!$('vue-achats').hidden && $('achats-ajout').hidden) remplirAchats();   // pas pendant « Ajouter à la liste »
}

document.addEventListener('DOMContentLoaded', initEntree);

/* Dès que ce script est lu, AVANT l'affichage : la dernière palette connue (cache) est posée,
   pour ne jamais voir un éclair des anciennes couleurs. */
(function () { const c = lireCache(); if (c) appliquer(c); })();
