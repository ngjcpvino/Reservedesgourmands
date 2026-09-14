/* ============================================================
   ACCUEIL (index.html) — le hub. Utilise Coffre (coffre.js).
   - PORTE mot de passe d'abord (mode « attendre » : on vérifie
     vraiment le mot de passe avant d'ouvrir, petit spinner).
   - Déjà connecté (mot de passe en mémoire) -> hub direct, instantané.
   - bloc data-page  -> ouvre cette page (bloc 1 = reserve.html, l'ajout)
   - bloc data-avenir -> petit avis « à venir » (pas encore branché)
   - accordéons : ouvrir/fermer (contenu à venir)
============================================================ */
const $ = id => document.getElementById(id);

/* ---------- Petit avis flottant ---------- */
function avis(txt) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast toast-avis'; document.body.appendChild(t); }
  t.textContent = txt;
  requestAnimationFrame(function () { t.classList.add('visible'); });
  clearTimeout(t._h);
  t._h = setTimeout(function () { t.classList.remove('visible'); }, 1600);
}

/* ---------- Porte / hub ---------- */
function montrerApp() {
  $('vue-connexion').hidden = true;
  $('vue-app').hidden = false;
}

function resetBouton() {
  const btn = $('btn-entrer');
  btn.disabled = false;
  btn.textContent = 'Entrer';
}

function montrerPorte(msg) {
  $('vue-app').hidden = true;
  $('vue-connexion').hidden = false;
  resetBouton();
  $('msg-connexion').textContent = msg || '';
}

/* Mode « attendre » : on confirme le mot de passe avant d'ouvrir. */
async function entrer() {
  const pw = $('mdp').value.trim();
  if (!pw) return;
  const btn = $('btn-entrer');
  $('msg-connexion').textContent = '';
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner spinner-clair"></span>';
  try {
    if (await Coffre.connexion(pw)) { montrerApp(); return; }   // bon -> hub
    $('msg-connexion').textContent = 'Mot de passe incorrect.';  // refusé
  } catch (e) {
    $('msg-connexion').textContent = 'Réseau lent — réessaie.';   // pas de réponse
  }
  resetBouton();
  $('mdp').focus();
}

function deconnexion() {
  Coffre.oublier();
  $('mdp').value = '';
  montrerPorte();
}

/* ---------- Branchements ---------- */
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.bouton[data-page]').forEach(function (b) {
    b.addEventListener('click', function () { window.location.href = b.dataset.page; });
  });
  document.querySelectorAll('.bouton[data-avenir]').forEach(function (b) {
    b.addEventListener('click', function () { avis(b.dataset.avenir + ' — à venir'); });
  });
  document.querySelectorAll('.accordeon-tete[data-toggle]').forEach(function (tete) {
    tete.addEventListener('click', function () {
      tete.classList.toggle('ouvert');
      var corps = tete.nextElementSibling;
      if (corps) corps.hidden = !tete.classList.contains('ouvert');
    });
  });

  $('btn-entrer').addEventListener('click', entrer);
  $('mdp').addEventListener('keydown', function (e) { if (e.key === 'Enter') entrer(); });
  $('lien-deco').addEventListener('click', deconnexion);

  if (Coffre.motDePasse()) montrerApp();   // reste connecté -> hub direct
});
