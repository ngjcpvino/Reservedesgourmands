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
var opCourant = null;                                   // jeton anti-reclic de l'article en cours
var SECTEUR_ID = '';                                    // secteur de cette app (Épicerie), déduit des données
const CACHE = 'rdg_ref_v2';

/* ---------- Vues : connexion → page d'ouverture → formulaire ---------- */
function toutCacher() {
  $('vue-connexion').hidden = true;
  $('vue-accueil').hidden = true;
  $('vue-choix-quoi').hidden = true;
  $('vue-choix-comment').hidden = true;
  $('vue-app').hidden = true;
  $('vue-bases').hidden = true;
  $('vue-meuble').hidden = true;
  $('vue-piece').hidden = true;
  const vs = $('vue-scan'); if (vs) vs.hidden = true;
  if (window.stopScanner) window.stopScanner();   // coupe la caméra en quittant la vue scan
  $('btn-burger').hidden = true;   // burger caché par défaut ; ré-affiché sur accueil + choix + bases
  fermerMenu();   // tout changement d'écran ferme le menu : personne d'autre n'a à le faire
}
async function montrerBases() {
  toutCacher(); $('vue-bases').hidden = false; $('btn-burger').hidden = false;
  if (!MEUBLES.length) {                       // pas encore chargé (on n'est pas passé par l'entrée) → on charge
    $('liste-meubles').innerHTML = '<div class="texte-petit texte-pale">Chargement…</div>';
    await chargerReferences();
  }
  remplirMeubles();
}
function montrerMeuble() { toutCacher(); $('vue-meuble').hidden = false; $('meuble-msg').textContent = ''; }
function montrerPiece()  { toutCacher(); $('vue-piece').hidden = false; $('piece-msg').textContent = ''; }
function montrerChoixQuoi()    { toutCacher(); $('vue-choix-quoi').hidden = false; $('btn-burger').hidden = false; }
function montrerChoixComment() { toutCacher(); $('vue-choix-comment').hidden = false; $('btn-burger').hidden = false; }
function montrerAccueil()    { toutCacher(); $('vue-accueil').hidden = false; $('btn-burger').hidden = false; }
function montrerFormulaire(avecCode) {
  toutCacher(); $('vue-app').hidden = false;
  reinitFiche();
  montrer('bloc-code', !!avecCode);          // le champ code n'apparaît qu'au scan
  $('codebarres').value = ''; codeScan = '';
  chargerReferences();                        // catégories + liste des noms de produits
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
      if (d.format) $('format').value = d.format;
    }
  }                                                 // sinon : on laisse; il remplit le nom à la main
}
function revenirConnexion(msg) {
  toutCacher(); $('vue-connexion').hidden = false;
  $('msg-connexion').textContent = msg || '';
}

function entrer() {
  const pw = $('mdp').value.trim();
  if (!pw) return;
  Coffre.definirMotDePasse(pw);   // login optimiste : aucun appel bloquant
  montrerAccueil();                // → la page d'ouverture
}

function deconnexion() {
  Coffre.oublier();
  $('mdp').value = ''; $('msg-connexion').textContent = '';
  revenirConnexion();
}

/* ---------- Menu burger ---------- */
function fermerMenu()   { $('menu').classList.remove('ouvert'); }
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
    }
  });
  if (ouvrir) {
    tete.classList.add('ouvert');
    if (tete.nextElementSibling) tete.nextElementSibling.hidden = false;
  }
}
function basculerMenu() { $('menu').classList.toggle('ouvert'); }

/* ---------- Toast « à venir » ---------- */
function avis(txt) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast toast-avis'; document.body.appendChild(t); }
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
  emps.forEach(r => { if (SECTEUR_ID && String(r[2]) === SECTEUR_ID) { PIECES.push({ id: r[0], nom: r[1] }); estPiece[r[0]] = true; } });
  const estMeuble = {};                                            // meuble = enfant d'une pièce, OU pas encore rangé (ParentID vide)
  emps.forEach(r => {
    const p = String(r[2] || '');
    if (!p || estPiece[p]) { MEUBLES.push({ id: r[0], nom: r[1], couleur: r[5] || '', pieceId: estPiece[p] ? p : '' }); estMeuble[r[0]] = true; }
  });
  emps.forEach(r => {                                              // espace = enfant d'un meuble
    const p = String(r[2] || '');
    if (p && estMeuble[p]) (ESPACES[p] = ESPACES[p] || []).push({ id: r[0], nom: r[1] });
  });
  PRODUITS = (d.prods || [])                          // [ID,Nom,CategorieID,Unite,Actif,Marque,Format]
    .filter(r => String(r[4]) !== 'N')
    .map(r => ({ id: r[0], nom: r[1], catId: r[2] }));
  VARIANTES = d.variantes || {};                      // { produitId: { marques:[], formats:[] } }
  CODES = d.codes || {};                              // { codeBarres: produitId }
}

async function chargerReferences() {
  const cache = lireCache();
  if (cache) { appliquer(cache); remplirListes(); statut(''); }   // instantané si déjà vu
  else statut('Chargement…');
  try {
    const data = await chargerData();
    appliquer(data); ecrireCache(data); remplirListes(); statut('');
  } catch (e) {
    if (e.message === 'non autorisé') { Coffre.oublier(); revenirConnexion('Mot de passe refusé.'); }
    else if (!cache) statut('Réseau lent — patiente un instant ou recharge la page.', 'erreur');
  }
}

async function chargerData() {
  try {
    const r = await Coffre.references();          // chemin rapide : UN seul appel
    if (r && r.ok && r.categories !== undefined) return { cats: r.categories, emps: r.emplacements, prods: r.produits, variantes: r.variantes, codes: r.codes };
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
  $('cat').innerHTML = options(RAYONS, '— Catégorie —');
  if (garde) $('cat').value = garde;
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
  $('nom').value = ''; $('marque').value = ''; $('format').value = '';
  $('cat').value = ''; $('endroits').innerHTML = '';
  produitCourant = null;
  montrer('bloc-details', false); montrer('bloc-cat', false); montrer('bloc-souscat', false);
  montrer('bloc-endroits', false); montrer('btn-enregistrer', false);
  statut('');
}

/* Le Nom pilote : match un produit existant = reconnu; sinon = nouveau. */
function surNom() {
  const val = $('nom').value.trim();
  $('endroits').innerHTML = '';
  montrer('bloc-endroits', false); montrer('btn-enregistrer', false);
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
    prefillProduit(prod.id);                    // marque/format (dernières) + endroits habituels
    montrer('bloc-endroits', true); montrer('btn-enregistrer', true);
  } else {                                      // nouveau produit
    produitCourant = null;
    remplirVariantes(null);                     // aucune suggestion marque/format
    montrer('bloc-cat', true);                  // il choisit la catégorie
    montrer('bloc-souscat', !!$('cat').value);
  }
}

function surCategorie() {
  const rid = $('cat').value;
  $('souscat').innerHTML = options(SOUSCATS[rid] || [], '— Sous-catégorie —');
  montrer('bloc-souscat', !!rid);
  montrer('bloc-endroits', false); montrer('btn-enregistrer', false);
  $('endroits').innerHTML = '';
}

function surSousCategorie() {
  const scid = $('souscat').value;
  if (!scid) { montrer('bloc-endroits', false); montrer('btn-enregistrer', false); return; }
  montrer('bloc-endroits', true); montrer('btn-enregistrer', true);
  if (!$('endroits').children.length) ajouterEndroit();
}

/* Remplit les suggestions (datalist) de marque/format pour un produit. */
function remplirVariantes(pid) {
  const vr = (pid && VARIANTES[pid]) || { marques: [], formats: [] };
  $('dl-marques').innerHTML = (vr.marques || []).map(x => '<option value="' + esc(x) + '"></option>').join('');
  $('dl-formats').innerHTML = (vr.formats || []).map(x => '<option value="' + esc(x) + '"></option>').join('');
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
  $('format').value = (vr && vr.dernierFormat) || '';
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

/* ---------- Endroits ---------- */
function ajouterEndroit(pref) {
  const row = document.createElement('div');
  row.className = 'endroit carte';
  row.style.marginBottom = 'var(--espace-s)';
  row.innerHTML =
    '<div class="bloc"><div class="label">Pièce</div><select class="champ piece"></select></div>' +
    '<div class="bloc"><div class="label">Meuble</div><select class="champ meuble"></select></div>' +
    '<div class="bloc"><div class="label">Espace</div><select class="champ espace"></select></div>' +
    '<div class="bloc"><div class="label">Quantité</div><input class="champ qte" type="text" inputmode="numeric" pattern="[0-9]*" value="1"></div>' +
    '<button class="bouton bouton-petit retirer" type="button">Retirer</button>';

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
    row.style.borderLeft = '';
  };

  meuble.onchange = () => {
    const mid = meuble.value;
    const esp = ESPACES[mid] || [];
    espace.innerHTML = esp.length ? options(esp, '— Espace —') : '<option value="">(directement sur le meuble)</option>';
    const m = MEUBLES.find(x => x.id === mid);
    row.style.borderLeft = (m && m.couleur) ? ('5px solid ' + m.couleur) : '';
  };
  row.querySelector('.retirer').onclick = () => { if ($('endroits').children.length > 1) row.remove(); };
  $('endroits').appendChild(row);

  if (pref) {                                  // pré-remplir un endroit habituel (tout reste modifiable)
    if (pref.pieceId)  { piece.value  = String(pref.pieceId);  piece.onchange(); }
    if (pref.meubleId) { meuble.value = String(pref.meubleId); meuble.onchange(); }
    if (pref.espaceId) { espace.value = String(pref.espaceId); }
    if (pref.qte !== undefined) row.querySelector('.qte').value = pref.qte;
  }
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
  let produitId = existant ? existant.id : null;
  const nouveau = !produitId;
  let scid = '';
  if (nouveau) {
    scid = $('souscat').value;
    if (!scid) { statut('Choisis une catégorie et une sous-catégorie.', 'erreur'); return; }
  }

  const endroits = [];
  [...$('endroits').children].forEach(row => {
    const mid = row.querySelector('.meuble').value;
    const eid = row.querySelector('.espace').value;
    const qte = parseInt(row.querySelector('.qte').value, 10) || 0;
    if (mid && qte > 0) endroits.push({ emp: eid || mid, qte: qte });   // qté vide/0 = pas rangé ici
  });
  if (!endroits.length) { statut('Mets une quantité sur au moins un endroit.', 'erreur'); return; }

  const marque = $('marque').value.trim(), format = $('format').value.trim(), code = $('codebarres').value.trim();
  if (!opCourant) opCourant = 'op-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  statut('Enregistrement…');
  $('btn-enregistrer').disabled = true;
  montrerVoile(true);
  try {
    const charge = nouveau ? { produit: [nom, scid], marque: marque, format: format, code: code, endroits: endroits, opId: opCourant }
                           : { produitId: produitId, marque: marque, format: format, code: code, endroits: endroits, opId: opCourant };
    const r = await Coffre.entrerArticle(charge);          // UN seul appel
    if (r && r.ok) { produitId = r.produitId || produitId; }
    else if (r && r.erreur === 'action inconnue') {        // repli si coffre-fort pas encore à jour
      if (nouveau) { const p = await Coffre.ajouter('Produits', ['', nom, scid, '', 'O', '', '']); if (!p.ok) throw new Error(p.erreur || 'refus'); produitId = p.id; }
      const date = new Date().toISOString().slice(0, 10);
      for (const e of endroits) await Coffre.ajouter('Stock', ['', produitId, e.emp, e.qte, date, marque, format, opCourant, code]);
    } else { throw new Error((r && r.erreur) || 'refus'); }
    if (nouveau) {
      PRODUITS.push({ id: produitId, nom: nom, catId: scid });
      const c = lireCache(); if (c) { (c.prods = c.prods || []).push([produitId, nom, scid, '', 'O', '', '']); ecrireCache(c); }
      remplirProduitsDatalist();                          // le nouveau nom devient suggérable tout de suite
    }
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
  const couleur = $('meuble-couleur').value || '';
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

/* Un meuble = accordéon (à sa couleur) : menu Pièce + ses espaces + « + un espace ». */
function htmlMeuble(m) {
  const espaces = (ESPACES[m.id] || []).map(function (e) {
    return '<div class="accordeon-item">' + esc(e.nom) + '</div>';
  }).join('');
  const style = m.couleur ? ' style="background:' + esc(m.couleur) + '"' : '';
  const pale = (m.couleur && couleurPale(m.couleur)) ? ' tete-pale' : '';
  return '<div class="accordeon">' +
    '<div class="accordeon-tete' + pale + '"' + style + '>' + esc(m.nom) + '</div>' +
    '<div class="accordeon-corps" hidden>' +
      '<div class="bloc" style="padding: var(--espace-m) var(--espace-l) 0"><div class="label">Pièce</div>' +
        '<select class="champ choix-piece" data-meuble="' + esc(m.id) + '">' + optionsPieces(m.pieceId) + '</select></div>' +
      espaces +
      '<div class="accordeon-item" style="gap: var(--espace-s)">' +
        '<input class="champ espace-nouveau" placeholder="Nouvel espace…">' +
        '<button class="bouton bouton-petit ajout-espace" data-meuble="' + esc(m.id) + '" type="button">+</button>' +
      '</div>' +
    '</div>' +
  '</div>';
}
/* « Gérer les bases » : les pièces en accordéon → leurs meubles (accordéon) → espaces. */
function remplirMeubles() {
  let html = '';
  const nonRanges = MEUBLES.filter(function (m) { return !m.pieceId; });
  if (nonRanges.length) {
    html += '<div class="accordeon"><div class="accordeon-tete">À ranger (' + nonRanges.length + ')</div>' +
      '<div class="accordeon-corps" hidden>' + nonRanges.map(htmlMeuble).join('') + '</div></div>';
  }
  html += PIECES.map(function (p) {
    const meubles = MEUBLES.filter(function (m) { return String(m.pieceId) === String(p.id); });
    const contenu = meubles.length ? meubles.map(htmlMeuble).join('')
                                   : '<div class="accordeon-item"><span class="texte-petit texte-pale">Aucun meuble</span></div>';
    return '<div class="accordeon"><div class="accordeon-tete">' + esc(p.nom) + '</div>' +
      '<div class="accordeon-corps" hidden>' + contenu + '</div></div>';
  }).join('');
  $('liste-meubles').innerHTML = html || '<div class="texte-petit texte-pale">Aucune pièce ni meuble.</div>';
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
    (ESPACES[meubleId] = ESPACES[meubleId] || []).push({ id: r.id, nom: nom });
    const c = lireCache(); if (c) { (c.emps = c.emps || []).push([r.id, nom, meubleId, SECTEUR_ID, 'O', '']); ecrireCache(c); }
    const div = document.createElement('div'); div.className = 'accordeon-item'; div.textContent = nom;
    corps.insertBefore(div, corps.lastElementChild);   // avant la ligne d'ajout
    input.value = '';
  } catch (e) {
    input.placeholder = 'Échec — réessaie';
  } finally { btn.disabled = false; montrerVoile(false); }
}

/* ---------- Branchements ---------- */
function initEntree() {
  // connexion
  $('btn-entrer').addEventListener('click', entrer);
  $('mdp').addEventListener('keydown', e => { if (e.key === 'Enter') entrer(); });
  // page d'ouverture : menu burger + items
  $('btn-burger').addEventListener('click', basculerMenu);
  $('menu-ouverture').addEventListener('click', montrerAccueil);   // 1er item = retour à l'ouverture
  $('menu-outils').addEventListener('click', function () {   // le triangle doit dire où on en est
    const ouvrir = $('menu-bases').hidden;
    $('menu-bases').hidden = !ouvrir;
    $('menu-outils').classList.toggle('ouvert', ouvrir);
  });
  $('menu-bases').addEventListener('click', montrerBases);
  $('menu-deco').addEventListener('click', deconnexion);
  // Outils → gérer les bases → ajouter un meuble
  $('btn-ajout-meuble').addEventListener('click', montrerMeuble);
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
    const bAjout = ev.target.closest('.ajout-espace');
    if (bAjout) { ajouterEspace(bAjout.getAttribute('data-meuble'), bAjout); return; }
    const tete = ev.target.closest('.accordeon-tete');
    if (tete) toggleAccordeon(tete);
  });
  // boutons de l'accueil : éteints pour l'instant (avis « à venir »)
  document.querySelectorAll('#vue-accueil .bouton[data-avenir]').forEach(b =>
    b.addEventListener('click', () => avis(b.dataset.avenir + ' — à venir')));
  document.querySelectorAll('#vue-accueil .accordeon-tete[data-toggle]').forEach(tete =>
    tete.addEventListener('click', () => toggleAccordeon(tete)));
  // bouton 1 → choix « quoi » (un produit / toute l'épicerie) → choix « comment » (scanner / à la main)
  $('btn-entree').addEventListener('click', montrerChoixQuoi);
  $('choix-produit').addEventListener('click', montrerChoixComment);
  $('choix-epicerie').addEventListener('click', () => avis("Toute l'épicerie — à venir"));
  $('choix-scan').addEventListener('click', () => { if (typeof montrerScanner === 'function') montrerScanner(); });
  $('choix-manuel').addEventListener('click', () => montrerFormulaire(false));
  $('btn-retour-quoi').addEventListener('click', montrerAccueil);        // retour : choix « quoi » → accueil
  $('btn-retour-comment').addEventListener('click', montrerChoixQuoi);   // retour : choix « comment » → choix « quoi »
  // formulaire d'entrée
  $('codebarres').addEventListener('change', surCode);
  $('nom').addEventListener('change', surNom);
  $('cat').addEventListener('change', surCategorie);
  $('souscat').addEventListener('change', surSousCategorie);
  $('btn-endroit').addEventListener('click', () => ajouterEndroit());
  $('btn-enregistrer').addEventListener('click', enregistrer);
  $('btn-annuler').addEventListener('click', montrerChoixComment);
  // reste connecté → page d'ouverture directement
  if (Coffre.motDePasse()) montrerAccueil();
}
document.addEventListener('DOMContentLoaded', initEntree);
