/* ============================================================
   ACCUEIL — pour l'instant : ouvrir/fermer les accordéons.
   Les fonctions des 4 blocs et le contenu des accordéons
   se brancheront plus tard.
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.accordeon-tete[data-toggle]').forEach(tete => {
    tete.addEventListener('click', () => {
      tete.classList.toggle('ouvert');
      const corps = tete.nextElementSibling;
      if (corps) corps.hidden = !tete.classList.contains('ouvert');
    });
  });
});
