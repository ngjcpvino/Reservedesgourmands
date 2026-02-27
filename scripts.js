// ============================================================
  //  CONFIGURATION
  // ============================================================
  var SHEET_ID  = '1-BFJlOcyxipKqJZOglcdVzVnUNp8VYoOrcKRMwTR8bI';
  var API_KEY   = 'AIzaSyBuennUE5SMN1YkV_38JObgGYj6_aAmTSc';
  var API_BASE  = 'https://sheets.googleapis.com/v4/spreadsheets/';

  function lireOnglet(nomOnglet, callback) {
    var url = API_BASE + SHEET_ID + '/values/' + encodeURIComponent(nomOnglet) + '?key=' + API_KEY;
    fetch(url)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var lignes = data.values || [];
        if (lignes.length < 2) { callback([]); return; }
        var entetes = lignes[0];
        var objets  = lignes.slice(1).map(function(ligne) {
          var obj = {};
          entetes.forEach(function(col, i) { obj[col] = ligne[i] || ''; });
          return obj;
        });
        callback(objets);
      })
      .catch(function(err) { console.error('Erreur lecture ' + nomOnglet, err); callback([]); });
  }

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
    var menu   = document.getElementById('menu-principal');
    var burger = document.getElementById('btn-burger');
    if (menu.classList.contains('ouvert') &&
        !menu.contains(e.target) &&
        !burger.contains(e.target)) {
      menu.classList.remove('ouvert');
    }
  });

  // ============================================================
  //  CHARGEMENT DONNÉES ACCUEIL
  // ============================================================
  function chargerAccueil() {
    var aujourd = new Date();
    aujourd.setHours(0,0,0,0);

    lireOnglet('Produits', function(produits) {
      var actifs       = produits.filter(function(p) { return p['Actif'] !== 'FALSE'; });
      var stockEpuise  = actifs.filter(function(p) { return parseInt(p['QteStock']   || 0) <= 0; });
      var reserveVide  = actifs.filter(function(p) {
        return parseInt(p['QteStock'] || 0) > 0 && parseInt(p['QteReserve'] || 0) <= 0;
      });
      var aConsommer   = actifs.filter(function(p) {
        if (!p['DateExpiration']) return false;
        var exp = new Date(p['DateExpiration']);
        var diff = Math.round((exp - aujourd) / 86400000);
        p._jours = diff;
        return diff <= 7 && diff >= 0;
      });

      remplirAccordeon('accordeon-stock',     stockEpuise, afficherItemStock);
      remplirAccordeon('accordeon-reserve',   reserveVide, afficherItemReserve);
      remplirAccordeon('accordeon-consommer', aConsommer,  afficherItemConsommer);
    });

    lireOnglet('Listes', function(listes) {
      var enAttente = listes.filter(function(l) { return l['Statut'] === 'En attente'; });
      remplirAccordeon('accordeon-listes', enAttente, afficherItemListe);
    });

    // En spécial — réservé pour flippscrape (section 7 du cahier)
    remplirAccordeon('accordeon-special', [], afficherItemListe);
  }

  // ============================================================
  //  REMPLISSAGE ACCORDÉONS
  // ============================================================
  function remplirAccordeon(id, items, fnItem) {
    var conteneur = document.getElementById(id);
    if (!conteneur) return;
    conteneur.innerHTML = '';
    if (!items || items.length === 0) {
      conteneur.innerHTML = '<div class="accordeon-item" style="color:var(--couleur-brun-clair); font-style:italic;">Aucun élément</div>';
      return;
    }
    items.forEach(function(item) { conteneur.innerHTML += fnItem(item); });
  }

  function afficherItemStock(item) {
    return '<div class="accordeon-item">' +
      '<span>' + item['Nom'] + (item['Marque'] ? ' <small style="color:var(--couleur-brun-clair);">' + item['Marque'] + '</small>' : '') + '</span>' +
      '<span class="badge badge-priorite-haute">URGENT</span>' +
    '</div>';
  }

  function afficherItemReserve(item) {
    return '<div class="accordeon-item">' +
      '<span>' + item['Nom'] + (item['Marque'] ? ' <small style="color:var(--couleur-brun-clair);">' + item['Marque'] + '</small>' : '') + '</span>' +
      '<span class="badge badge-priorite-moyenne">MOYEN</span>' +
    '</div>';
  }

  function afficherItemConsommer(item) {
    var j     = item._jours;
    var label = j <= 0 ? "Aujourd'hui" : j + ' jour' + (j > 1 ? 's' : '');
    return '<div class="accordeon-item">' +
      '<span>' + item['Nom'] + (item['Marque'] ? ' <small style="color:var(--couleur-brun-clair);">' + item['Marque'] + '</small>' : '') + '</span>' +
      '<span class="badge badge-info">' + label + '</span>' +
    '</div>';
  }

  function afficherItemListe(item) {
    return '<div class="accordeon-item">' +
      '<span>' + (item['Nom'] || '') + '</span>' +
      '<span class="badge badge-info">' + (item['Type'] || '') + '</span>' +
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
