/* ============================================================
   ENTRÉE — logique propre à la page reserve.html.
   Utilise Coffre (coffre.js) pour tout ce qui touche aux données.
============================================================ */
const $ = id => document.getElementById(id);

/* ---- Connexion ---- */
async function entrer() {
  const pw = $('mdp').value.trim();
  if (!pw) return;
  $('msg-connexion').textContent = 'Vérification…';
  try {
    if (await Coffre.connexion(pw)) montrerApp();
    else $('msg-connexion').textContent = 'Mot de passe refusé.';
  } catch (e) {
    $('msg-connexion').textContent = 'Connexion impossible.';
  }
}

function montrerApp() {
  $('vue-connexion').hidden = true;
  $('vue-app').hidden = false;
  chargerTransit();
}

function deconnexion() {
  Coffre.oublier();
  $('vue-app').hidden = true;
  $('vue-connexion').hidden = false;
  $('mdp').value = '';
  $('msg-connexion').textContent = '';
}

/* ---- Compteur de quantité ---- */
function majQte(delta) {
  const el = $('qte');
  el.textContent = Math.max(0, (parseInt(el.textContent, 10) || 0) + delta);
}

/* ---- Ajouter un produit (crée le produit + une ligne de stock « en transit ») ---- */
async function ajouter() {
  const nom = $('nom').value.trim();
  const unite = $('unite').value.trim();
  const qte = parseInt($('qte').textContent, 10) || 0;
  const msg = $('msg-ajout');
  if (!nom) { msg.className = 'message message-erreur'; msg.textContent = 'Donne un nom.'; return; }
  msg.className = 'message'; msg.textContent = 'Enregistrement…';
  $('btn-ajouter').disabled = true;
  try {
    const p = await Coffre.ajouter('Produits', ['', nom, '', unite, 'O']);
    if (!p.ok) throw new Error(p.erreur || 'refus');
    const dateEntree = new Date().toISOString().slice(0, 10);
    await Coffre.ajouter('Stock', ['', p.id, '', qte, dateEntree]);
    msg.className = 'message message-succes'; msg.textContent = nom + ' ajouté.';
    $('nom').value = ''; $('unite').value = ''; $('qte').textContent = '1'; $('nom').focus();
    chargerTransit();
  } catch (e) {
    msg.className = 'message message-erreur'; msg.textContent = 'Échec : ' + e.message;
  } finally {
    $('btn-ajouter').disabled = false;
  }
}

/* ---- Liste « en transit » (lignes de stock sans emplacement) ---- */
async function chargerTransit() {
  const cont = $('liste-transit');
  cont.innerHTML = '<div class="accordeon-item"><span class="texte-petit texte-pale">Chargement…</span></div>';
  try {
    const [rp, rs] = await Promise.all([ Coffre.lire('Produits'), Coffre.lire('Stock') ]);
    const noms = {}, unites = {};
    (rp.lignes || []).forEach(r => { noms[r[0]] = r[1]; unites[r[0]] = r[3]; });
    const transit = (rs.lignes || []).filter(r => !r[2]);
    if (!transit.length) {
      cont.innerHTML = '<div class="accordeon-item"><span class="texte-petit texte-pale">Rien en transit.</span></div>';
      return;
    }
    cont.innerHTML = '';
    transit.forEach(r => {
      const row = document.createElement('div'); row.className = 'item';
      const info = document.createElement('div'); info.className = 'item-info';
      const nom = document.createElement('div'); nom.className = 'item-nom';
      nom.textContent = noms[r[1]] || '(produit ?)';
      info.appendChild(nom);
      const q = document.createElement('div'); q.className = 'item-quantite';
      q.textContent = r[3] + ' ' + (unites[r[1]] || '');
      row.appendChild(info); row.appendChild(q); cont.appendChild(row);
    });
  } catch (e) {
    cont.innerHTML = '<div class="accordeon-item"><span class="texte-petit texte-pale">Erreur de chargement.</span></div>';
  }
}

/* ---- Branchements ---- */
function initEntree() {
  $('btn-entrer').addEventListener('click', entrer);
  $('mdp').addEventListener('keydown', e => { if (e.key === 'Enter') entrer(); });
  $('btn-ajouter').addEventListener('click', ajouter);
  $('q-moins').addEventListener('click', () => majQte(-1));
  $('q-plus').addEventListener('click', () => majQte(1));
  $('lien-deco').addEventListener('click', deconnexion);
  $('tete-transit').addEventListener('click', function () {
    this.classList.toggle('ouvert');
    $('liste-transit').style.display = this.classList.contains('ouvert') ? 'block' : 'none';
  });
  if (Coffre.motDePasse()) montrerApp();
}

document.addEventListener('DOMContentLoaded', initEntree);
