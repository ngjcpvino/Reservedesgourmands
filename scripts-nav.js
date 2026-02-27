// ============================================================
//  NAVIGATION ENTRE PAGES
// ============================================================
function afficherPage(id) {
  document.querySelectorAll('.app-conteneur').forEach(function(p) {
    p.style.display = 'none';
  });
  document.getElementById(id).style.display = 'block';
}

// ============================================================
//  MENU BURGER
// ============================================================
function toggleMenu() {
  var menu = document.getElementById('menu-principal');
  menu.classList.toggle('ouvert');
}

document.addEventListener('click', function(e) {
  var menu   = document.getElementById('menu-principal');
  var burger = document.getElementById('btn-burger');
  if (menu.classList.contains('ouvert') &&
      !menu.contains(e.target) &&
      !burger.contains(e.target)) {
    menu.classList.remove('ouvert');
  }
});

// ============================================================
//  ACCORDÉONS ACCUEIL
// ============================================================
function toggleAccordeon(header) {
  var estOuvert = header.classList.contains('ouvert');
  document.querySelectorAll('.accordeon-header').forEach(function(h) {
    h.classList.remove('ouvert');
    var c = h.nextElementSibling;
    if (c) c.style.display = 'none';
  });
  if (!estOuvert) {
    header.classList.add('ouvert');
    var conteneur = header.nextElementSibling;
    if (conteneur) conteneur.style.display = 'block';
  }
}

function initialiserAccordeons() {
  document.querySelectorAll('.accordeon-header').forEach(function(header) {
    var conteneur = header.nextElementSibling;
    if (!conteneur) return;
    conteneur.style.display = header.classList.contains('ouvert') ? 'block' : 'none';
  });
}

// ============================================================
//  ACCORDÉONS MENU
// ============================================================
function toggleMenuAccordeon(header) {
  var estOuvert = header.classList.contains('ouvert');
  document.querySelectorAll('.menu-accordeon-header').forEach(function(h) {
    h.classList.remove('ouvert');
    var c = h.nextElementSibling;
    if (c) c.style.display = 'none';
  });
  if (!estOuvert) {
    header.classList.add('ouvert');
    var conteneur = header.nextElementSibling;
    if (conteneur) conteneur.style.display = 'block';
  }
}

function initialiserMenuAccordeons() {
  document.querySelectorAll('.menu-accordeon-header').forEach(function(header) {
    var conteneur = header.nextElementSibling;
    if (!conteneur) return;
    conteneur.style.display = header.classList.contains('ouvert') ? 'block' : 'none';
  });
}
