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

var RAYONS = [], SOUSCATS = {}, MEUBLES = [], ESPACES = {}, PRODUITS = [], VARIANTES = {};
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
  $('btn-burger').hidden = true;   // burger caché par défaut ; ré-affiché sur accueil + choix + bases
  fermerMenu();
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
function montrerChoixQuoi()    { toutCacher(); $('vue-choix-quoi').hidden = false; $('btn-burger').hidden = false; }
function montrerChoixComment() { toutCacher(); $('vue-choix-comment').hidden = false; $('btn-burger').hidden = false; }
function montrerAccueil()    { toutCacher(); $('vue-accueil').hidden = false; $('btn-burger').hidden = false; }
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
function montrerVoile(on){ $('voile').hidden = !on; }   // voile bloquant + fourchette qui tourne
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
  MEUBLES = []; ESPACES = {};
  (d.emps || []).forEach(r => {                       // [ID,Nom,ParentID,SecteurID,Actif,Couleur]
    if (String(r[4]) !== 'O') return;
    if (!r[2]) MEUBLES.push({ id: r[0], nom: r[1], couleur: r[5] || '' });
    else (ESPACES[r[2]] = ESPACES[r[2]] || []).push({ id: r[0], nom: r[1] });
  });
  PRODUITS = (d.prods || [])                          // [ID,Nom,CategorieID,Unite,Actif,Marque,Format]
    .filter(r => String(r[4]) !== 'N')
    .map(r => ({ id: r[0], nom: r[1], catId: r[2] }));
  VARIANTES = d.variantes || {};                      // { produitId: { marques:[], formats:[] } }
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
    if (r && r.ok && r.categories !== undefined) return { cats: r.categories, emps: r.emplacements, prods: r.produits, variantes: r.variantes };
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

/* Remplit les suggestions (datalist) de marque/format pour un produit. */
function remplirVariantes(pid) {
  const vr = (pid && VARIANTES[pid]) || { marques: [], formats: [] };
  $('dl-marques').innerHTML = (vr.marques || []).map(x => '<option value="' + esc(x) + '"></option>').join('');
  $('dl-formats').innerHTML = (vr.formats || []).map(x => '<option value="' + esc(x) + '"></option>').join('');
}

/* Retient localement une marque/format pour un produit (suggestions immédiates + cache). */
function memoriserVariante(pid, marque, format) {
  if (!pid || (!marque && !format)) return;
  const vr = VARIANTES[pid] || (VARIANTES[pid] = { marques: [], formats: [] });
  if (marque && vr.marques.indexOf(marque) === -1) vr.marques.push(marque);
  if (format && vr.formats.indexOf(format) === -1) vr.formats.push(format);
  const c = lireCache(); if (c) { (c.variantes = c.variantes || {})[pid] = vr; ecrireCache(c); }
}

function surProduit() {
  const v = $('produit').value;
  if (!v) { montrer('bloc-details', false); montrer('bloc-endroits', false); montrer('btn-enregistrer', false); return; }
  if (v === '__nouveau') {
    montrer('bloc-nom', true); $('nom').value = '';
    remplirVariantes(null);                 // nouveau produit : aucune suggestion
  } else {
    montrer('bloc-nom', false);
    remplirVariantes(v);                     // suggestions = marques/formats déjà vus pour ce produit
  }
  $('marque').value = ''; $('format').value = '';   // ne se pré-remplit plus (marque/format changent d'une fois à l'autre)
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
  if (!opCourant) opCourant = 'op-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  statut('Enregistrement…');
  $('btn-enregistrer').disabled = true;
  montrerVoile(true);
  try {
    const charge = nouveau ? { produit: [nom, scid], marque: marque, format: format, endroits: endroits, opId: opCourant }
                           : { produitId: produitId, marque: marque, format: format, endroits: endroits, opId: opCourant };
    const r = await Coffre.entrerArticle(charge);          // UN seul appel
    if (r && r.ok) { produitId = r.produitId || produitId; }
    else if (r && r.erreur === 'action inconnue') {        // repli si coffre-fort pas encore à jour
      if (nouveau) { const p = await Coffre.ajouter('Produits', ['', nom, scid, '', 'O', '', '']); if (!p.ok) throw new Error(p.erreur || 'refus'); produitId = p.id; }
      const date = new Date().toISOString().slice(0, 10);
      for (const e of endroits) await Coffre.ajouter('Stock', ['', produitId, e.emp, e.qte, date, marque, format, opCourant]);
    } else { throw new Error((r && r.erreur) || 'refus'); }
    if (nouveau) {
      PRODUITS.push({ id: produitId, nom: nom, catId: scid });
      const c = lireCache(); if (c) { (c.prods = c.prods || []).push([produitId, nom, scid, '', 'O', '', '']); ecrireCache(c); }
    }
    memoriserVariante(produitId, marque, format);          // suggestions à jour tout de suite
    opCourant = null;                                      // succès : le prochain article aura un nouveau jeton
    statut('Article ajouté ✓', 'succes');
    reinit();
  } catch (e) {
    statut('Échec : ' + e.message, 'erreur');
  } finally { $('btn-enregistrer').disabled = false; montrerVoile(false); }
}

function reinit() { $('cat').value = ''; resetSous(); }

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

/* Liste des meubles (accordéons, à leur couleur) + leurs espaces, dans « Gérer les bases ». */
function remplirMeubles() {
  const html = MEUBLES.map(function (m) {
    const espaces = (ESPACES[m.id] || []).map(function (e) {
      return '<div class="accordeon-item">' + esc(e.nom) + '</div>';
    }).join('');
    const style = m.couleur ? ' style="background:' + esc(m.couleur) + '"' : '';
    return '<div class="accordeon">' +
      '<div class="accordeon-tete"' + style + '>' + esc(m.nom) + ' <span class="accordeon-fleche">▼</span></div>' +
      '<div class="accordeon-corps" hidden>' +
        espaces +
        '<div class="accordeon-item" style="gap: var(--espace-s)">' +
          '<input class="champ espace-nouveau" placeholder="Nouvel espace…">' +
          '<button class="bouton bouton-petit ajout-espace" data-meuble="' + esc(m.id) + '" type="button">+</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
  $('liste-meubles').innerHTML = html || '<div class="texte-petit texte-pale">Aucun meuble encore.</div>';
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
  $('menu-outils').addEventListener('click', () => { $('menu-bases').hidden = !$('menu-bases').hidden; });
  $('menu-bases').addEventListener('click', montrerBases);
  $('menu-deco').addEventListener('click', deconnexion);
  // Outils → gérer les bases → ajouter un meuble
  $('btn-ajout-meuble').addEventListener('click', montrerMeuble);
  $('btn-meuble-enr').addEventListener('click', enregistrerMeuble);
  $('meuble-annuler').addEventListener('click', montrerBases);
  // liste des meubles (éléments générés) : ouvrir/fermer un accordéon, ajouter un espace
  $('liste-meubles').addEventListener('click', function (ev) {
    const bAjout = ev.target.closest('.ajout-espace');
    if (bAjout) { ajouterEspace(bAjout.getAttribute('data-meuble'), bAjout); return; }
    const tete = ev.target.closest('.accordeon-tete');
    if (tete) {
      tete.classList.toggle('ouvert');
      const corps = tete.nextElementSibling;
      if (corps) corps.hidden = !tete.classList.contains('ouvert');
    }
  });
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
  // formulaire d'entrée
  $('cat').addEventListener('change', surCategorie);
  $('souscat').addEventListener('change', surSousCategorie);
  $('produit').addEventListener('change', surProduit);
  $('btn-endroit').addEventListener('click', ajouterEndroit);
  $('btn-enregistrer').addEventListener('click', enregistrer);
  $('btn-annuler').addEventListener('click', montrerChoixComment);
  // reste connecté → page d'ouverture directement
  if (Coffre.motDePasse()) montrerAccueil();
}
document.addEventListener('DOMContentLoaded', initEntree);
