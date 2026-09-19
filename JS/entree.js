/* ============================================================
   ENTRÉE D'UN ARTICLE — reserve.html. Utilise Coffre (coffre.js).
   Flux : catégorie → sous-catégorie → produit (choisir ou créer)
          → marque · format → 1 à N endroits (meuble → espace + qté).
   Chargement robuste : un appel à la fois (VPN-friendly), nouvel essai,
   et mémorisation locale pour un accès instantané ensuite.
============================================================ */
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));
const montrer = (id, ok) => { $(id).hidden = !ok; };

var RAYONS = [], SOUSCATS = {}, MEUBLES = [], ESPACES = {}, PRODUITS = [];
const CACHE = 'rdg_ref_v1';

/* ---------- Vues : connexion → page d'ouverture → formulaire ---------- */
function toutCacher() {
  $('vue-connexion').hidden = true;
  $('vue-accueil').hidden = true;
  $('vue-choix-quoi').hidden = true;
  $('vue-choix-comment').hidden = true;
  $('vue-app').hidden = true;
}
function montrerChoixQuoi()    { toutCacher(); $('vue-choix-quoi').hidden = false; fermerMenu(); }
function montrerChoixComment() { toutCacher(); $('vue-choix-comment').hidden = false; fermerMenu(); }
function montrerAccueil()    { toutCacher(); $('vue-accueil').hidden = false; fermerMenu(); }
function montrerFormulaire() { toutCacher(); $('vue-app').hidden = false; fermerMenu(); chargerReferences(); }
function revenirConnexion(msg) {
  toutCacher(); $('vue-connexion').hidden = false; fermerMenu();
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
  (d.cats || []).forEach(r => {                       // [ID,Nom,ParentID,SecteurID,DureeVie,Actif]
    if (String(r[5]) !== 'O') return;
    if (!r[2]) RAYONS.push({ id: r[0], nom: r[1] });
    else (SOUSCATS[r[2]] = SOUSCATS[r[2]] || []).push({ id: r[0], nom: r[1] });
  });
  MEUBLES = []; ESPACES = {};
  (d.emps || []).forEach(r => {                       // [ID,Nom,ParentID,SecteurID,Actif,Couleur]
    if (String(r[4]) !== 'O') return;
    if (!r[2]) MEUBLES.push({ id: r[0], nom: r[1], couleur: r[5] || '' });
    else (ESPACES[r[2]] = ESPACES[r[2]] || []).push({ id: r[0], nom: r[1] });
  });
  PRODUITS = (d.prods || [])                          // [ID,Nom,CategorieID,Unite,Actif,Marque,Format]
    .filter(r => String(r[4]) !== 'N')
    .map(r => ({ id: r[0], nom: r[1], catId: r[2], marque: r[5] || '', format: r[6] || '' }));
}

async function chargerReferences() {
  const cache = lireCache();
  if (cache) { appliquer(cache); remplirCategories(); statut(''); }   // instantané si déjà vu
  else statut('Chargement…');
  try {
    const data = await chargerData();
    appliquer(data); ecrireCache(data); remplirCategories(); statut('');
  } catch (e) {
    if (e.message === 'non autorisé') { Coffre.oublier(); revenirConnexion('Mot de passe refusé.'); }
    else if (!cache) statut('Réseau lent — patiente un instant ou recharge la page.', 'erreur');
  }
}

async function chargerData() {
  try {
    const r = await Coffre.references();          // chemin rapide : UN seul appel
    if (r && r.ok && r.categories !== undefined) return { cats: r.categories, emps: r.emplacements, prods: r.produits };
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

/* ---------- Entonnoir ---------- */
function remplirCategories() {
  const garde = $('cat').value;
  $('cat').innerHTML = options(RAYONS, '— Catégorie —');
  if (garde) $('cat').value = garde;
}
function resetSous() { montrer('bloc-souscat', false); resetProduit(); }
function resetProduit() {
  montrer('bloc-produit', false); montrer('bloc-nom', false);
  montrer('bloc-details', false); montrer('bloc-endroits', false);
  montrer('btn-enregistrer', false);
  $('endroits').innerHTML = '';
}

function surCategorie() {
  const rid = $('cat').value;
  $('souscat').innerHTML = options(SOUSCATS[rid] || [], '— Sous-catégorie —');
  montrer('bloc-souscat', !!rid);
  resetProduit();
}

function surSousCategorie() {
  const scid = $('souscat').value;
  const prods = PRODUITS.filter(p => p.catId === scid);
  $('produit').innerHTML = options(prods, '— Produit —') + '<option value="__nouveau">+ Nouveau produit</option>';
  montrer('bloc-produit', !!scid);
  montrer('bloc-nom', false); montrer('bloc-details', false);
  montrer('bloc-endroits', false); montrer('btn-enregistrer', false);
  $('endroits').innerHTML = '';
}

function surProduit() {
  const v = $('produit').value;
  if (!v) { montrer('bloc-details', false); montrer('bloc-endroits', false); montrer('btn-enregistrer', false); return; }
  if (v === '__nouveau') {
    montrer('bloc-nom', true); $('nom').value = ''; $('marque').value = ''; $('format').value = '';
  } else {
    montrer('bloc-nom', false);
    const p = PRODUITS.find(x => x.id === v);
    $('marque').value = p ? p.marque : ''; $('format').value = p ? p.format : '';
  }
  montrer('bloc-details', true);
  montrer('bloc-endroits', true);
  if (!$('endroits').children.length) ajouterEndroit();
  montrer('btn-enregistrer', true);
}

/* ---------- Endroits ---------- */
function ajouterEndroit() {
  const row = document.createElement('div');
  row.className = 'endroit carte';
  row.style.marginBottom = 'var(--espace-s)';
  row.innerHTML =
    '<div class="bloc"><div class="label">Meuble</div><select class="champ meuble"></select></div>' +
    '<div class="bloc"><div class="label">Espace</div><select class="champ espace"></select></div>' +
    '<div class="bloc"><div class="label">Quantité</div><input class="champ qte" type="number" min="0" value="1"></div>' +
    '<button class="bouton bouton-petit retirer" type="button">Retirer</button>';

  const meuble = row.querySelector('.meuble');
  const espace = row.querySelector('.espace');
  meuble.innerHTML = options(MEUBLES, '— Meuble —');
  espace.innerHTML = '<option value="">—</option>';

  meuble.onchange = () => {
    const mid = meuble.value;
    const esp = ESPACES[mid] || [];
    espace.innerHTML = esp.length ? options(esp, '— Espace —') : '<option value="">(directement sur le meuble)</option>';
    const m = MEUBLES.find(x => x.id === mid);
    row.style.borderLeft = (m && m.couleur) ? ('5px solid ' + m.couleur) : '';
  };
  row.querySelector('.retirer').onclick = () => { if ($('endroits').children.length > 1) row.remove(); };
  $('endroits').appendChild(row);
}

/* ---------- Enregistrer ---------- */
function statut(txt, type) {
  const m = $('msg');
  m.className = 'message' + (type ? ' message-' + type : '');
  m.textContent = txt;
}

async function enregistrer() {
  const scid = $('souscat').value;
  const pv = $('produit').value;
  let produitId = null, nouveau = false, nom = '';

  if (pv === '__nouveau') {
    nom = $('nom').value.trim();
    if (!nom) { statut('Donne un nom au produit.', 'erreur'); return; }
    nouveau = true;
  } else if (pv) { produitId = pv; }
  else { statut('Choisis ou crée un produit.', 'erreur'); return; }

  const endroits = [];
  [...$('endroits').children].forEach(row => {
    const mid = row.querySelector('.meuble').value;
    const eid = row.querySelector('.espace').value;
    const qte = parseInt(row.querySelector('.qte').value, 10) || 0;
    if (mid) endroits.push({ emp: eid || mid, qte: qte });
  });
  if (!endroits.length) { statut('Choisis au moins un endroit.', 'erreur'); return; }

  const marque = $('marque').value.trim(), format = $('format').value.trim();
  statut('Enregistrement…');
  $('btn-enregistrer').disabled = true;
  try {
    const charge = nouveau ? { produit: [nom, scid, marque, format], endroits: endroits }
                           : { produitId: produitId, endroits: endroits };
    const r = await Coffre.entrerArticle(charge);          // UN seul appel
    if (r && r.ok) { produitId = r.produitId || produitId; }
    else if (r && r.erreur === 'action inconnue') {        // repli si coffre-fort pas encore à jour
      if (nouveau) { const p = await Coffre.ajouter('Produits', ['', nom, scid, '', 'O', marque, format]); if (!p.ok) throw new Error(p.erreur || 'refus'); produitId = p.id; }
      const date = new Date().toISOString().slice(0, 10);
      for (const e of endroits) await Coffre.ajouter('Stock', ['', produitId, e.emp, e.qte, date]);
    } else { throw new Error((r && r.erreur) || 'refus'); }
    if (nouveau) {
      PRODUITS.push({ id: produitId, nom: nom, catId: scid, marque: marque, format: format });
      const c = lireCache(); if (c) { (c.prods = c.prods || []).push([produitId, nom, scid, '', 'O', marque, format]); ecrireCache(c); }
    }
    statut('Article ajouté ✓', 'succes');
    reinit();
  } catch (e) {
    statut('Échec : ' + e.message, 'erreur');
  } finally { $('btn-enregistrer').disabled = false; }
}

function reinit() { $('cat').value = ''; resetSous(); }

/* ---------- Branchements ---------- */
function initEntree() {
  // connexion
  $('btn-entrer').addEventListener('click', entrer);
  $('mdp').addEventListener('keydown', e => { if (e.key === 'Enter') entrer(); });
  // page d'ouverture : menu burger + items
  $('btn-burger').addEventListener('click', basculerMenu);
  $('menu-ouverture').addEventListener('click', montrerAccueil);   // 1er item = retour à l'ouverture
  $('menu-deco').addEventListener('click', deconnexion);
  // boutons de l'accueil : éteints pour l'instant (avis « à venir »)
  document.querySelectorAll('#vue-accueil .bouton[data-avenir]').forEach(b =>
    b.addEventListener('click', () => avis(b.dataset.avenir + ' — à venir')));
  document.querySelectorAll('#vue-accueil .accordeon-tete[data-toggle]').forEach(tete =>
    tete.addEventListener('click', () => {
      const ouvrir = !tete.classList.contains('ouvert');
      // un seul ouvert à la fois : on ferme tous les autres d'abord
      document.querySelectorAll('#vue-accueil .accordeon-tete[data-toggle]').forEach(t => {
        t.classList.remove('ouvert');
        if (t.nextElementSibling) t.nextElementSibling.hidden = true;
      });
      if (ouvrir) {
        tete.classList.add('ouvert');
        if (tete.nextElementSibling) tete.nextElementSibling.hidden = false;
      }
    }));
  // bouton 1 → choix « quoi » (un produit / toute l'épicerie) → choix « comment » (scanner / à la main)
  $('btn-entree').addEventListener('click', montrerChoixQuoi);
  $('choix-produit').addEventListener('click', montrerChoixComment);
  $('choix-epicerie').addEventListener('click', () => avis("Toute l'épicerie — à venir"));
  $('choix-scan').addEventListener('click', () => avis('Scanner — à venir'));
  $('choix-manuel').addEventListener('click', montrerFormulaire);
  $('retour-accueil-1').addEventListener('click', montrerAccueil);
  $('retour-quoi').addEventListener('click', montrerChoixQuoi);
  // formulaire d'entrée
  $('cat').addEventListener('change', surCategorie);
  $('souscat').addEventListener('change', surSousCategorie);
  $('produit').addEventListener('change', surProduit);
  $('btn-endroit').addEventListener('click', ajouterEndroit);
  $('btn-enregistrer').addEventListener('click', enregistrer);
  $('lien-deco').addEventListener('click', deconnexion);
  // reste connecté → page d'ouverture directement
  if (Coffre.motDePasse()) montrerAccueil();
}
document.addEventListener('DOMContentLoaded', initEntree);
