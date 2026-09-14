/* ============================================================
   ACCUEIL (index.html) — le hub.
   - bloc avec data-page  -> ouvre cette page (bloc 1 = reserve.html, l'ajout)
   - bloc avec data-avenir -> petit avis « à venir » (pas encore branché)
   - accordéons : ouvrir/fermer (contenu à venir)
============================================================ */

function avis(txt) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast toast-avis'; document.body.appendChild(t); }
  t.textContent = txt;
  requestAnimationFrame(function () { t.classList.add('visible'); });
  clearTimeout(t._h);
  t._h = setTimeout(function () { t.classList.remove('visible'); }, 1600);
}

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
});
