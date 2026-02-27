// ============================================================
  //  ACCORDÉONS ACCUEIL — logique show/hide
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
  //  ACCORDÉONS MENU — logique show/hide
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

  // ============================================================
  //  MENU BURGER
  // ============================================================
  function toggleMenu() {
    var menu = document.getElementById('menu-principal');
    menu.classList.toggle('ouvert');
  }

  document.addEventListener('click', function(e) {
    var menu = document.getElementById('menu-principal');
    var burger = document.getElementById('btn-burger');
    if (menu.classList.contains('ouvert') &&
        !menu.contains(e.target) &&
        !burger.contains(e.target)) {
      menu.classList.remove('ouvert');
    }
  });

  // ============================================================
  //  ACCORDÉONS ACCUEIL — affichage
  // ============================================================
  function chargerAccueil() {
    // Connexion aux données — à brancher plus tard
    // Pour l'instant on affiche vide proprement
    afficherAccueil({
      stockEpuise:   [],
      reserveVide:   [],
      aConsommer:    [],
      listesAttente: []
    });
  }

  function afficherAccueil(data) {
    remplirAccordeon('accordeon-stock',     data.stockEpuise,   afficherItemStock);
    remplirAccordeon('accordeon-reserve',   data.reserveVide,   afficherItemReserve);
    remplirAccordeon('accordeon-consommer', data.aConsommer,    afficherItemConsommer);
    remplirAccordeon('accordeon-listes',    data.listesAttente, afficherItemListe);
  }

  function remplirAccordeon(id, items, fnItem) {
    var conteneur = document.getElementById(id);
    if (!conteneur) return;
    conteneur.innerHTML = '';
    if (items.length === 0) {
      conteneur.innerHTML = '<div class="accordeon-item" style="color:var(--couleur-brun-clair); font-style:italic;">Aucun élément</div>';
      return;
    }
    items.forEach(function(item) {
      conteneur.innerHTML += fnItem(item);
    });
  }

  function afficherItemStock(item) {
    return '<div class="accordeon-item">' +
      '<span>' + item.nom + (item.marque ? ' <small style="color:var(--couleur-brun-clair);">' + item.marque + '</small>' : '') + '</span>' +
      '<span class="badge badge-priorite-haute">URGENT</span>' +
    '</div>';
  }

  function afficherItemReserve(item) {
    return '<div class="accordeon-item">' +
      '<span>' + item.nom + (item.marque ? ' <small style="color:var(--couleur-brun-clair);">' + item.marque + '</small>' : '') + '</span>' +
      '<span class="badge badge-priorite-moyenne">MOYEN</span>' +
    '</div>';
  }

  function afficherItemConsommer(item) {
    var label = item.jours <= 0 ? 'Aujourd\'hui' : item.jours + ' jour' + (item.jours > 1 ? 's' : '');
    return '<div class="accordeon-item">' +
      '<span>' + item.nom + (item.marque ? ' <small style="color:var(--couleur-brun-clair);">' + item.marque + '</small>' : '') + '</span>' +
      '<span class="badge badge-info">' + label + '</span>' +
    '</div>';
  }

  function afficherItemListe(item) {
    return '<div class="accordeon-item">' +
      '<span>' + item.nom + '</span>' +
      '<span class="badge badge-info">' + (item.type || '') + '</span>' +
    '</div>';
  }

  // ============================================================
  //  DÉMARRAGE
  // ============================================================
  window.addEventListener('load', function() {
    initialiserAccordeons();
    initialiserMenuAccordeons();
    chargerAccueil();
  });
