// ============================================================
  //  CONFIGURATION
  // ============================================================
  var SHEET_ID = '1-BFJlOcyxipKqJZOglcdVzVnUNp8VYoOrcKRMwTR8bI';
  var API_KEY  = 'AIzaSyBuennUE5SMN1YkV_38JObgGYj6_aAmTSc';
  var API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets/';

  var actionCourante = null;

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
  //  NAVIGATION ENTRE PAGES
  // ============================================================
  function afficherPage(id) {
    document.querySelectorAll('.app-conteneur').forEach(function(p) {
      p.style.display = 'none';
    });
    document.getElementById(id).style.display = 'block';
  }

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
  //  SCANNER — CHOIX ACTION
  // ============================================================
  function choisirAction(action) {
    actionCourante = action;
    document.getElementById('scanner-choix').style.display  = 'none';
    document.getElementById('scanner-camera').style.display = 'block';
    document.getElementById('scanner-resultat').style.display = 'none';
    demarrerCamera();
  }

  function arreterScan() {
    arreterCamera();
    document.getElementById('scanner-choix').style.display  = 'grid';
    document.getElementById('scanner-camera').style.display = 'none';
    document.getElementById('scanner-resultat').style.display = 'none';
  }

  function recommencerScan() {
    document.getElementById('scanner-resultat').style.display = 'none';
    document.getElementById('scanner-choix').style.display   = 'grid';
  }

  // ============================================================
  //  SCANNER — CAMÉRA
  // ============================================================
  var streamCamera = null;
  var intervalScan = null;

  function demarrerCamera() {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(function(stream) {
        streamCamera = stream;
        var video = document.getElementById('scanner-video');
        video.srcObject = stream;
        video.play();
        intervalScan = setInterval(function() { analyserImage(); }, 300);
      })
      .catch(function(err) {
        console.error('Caméra inaccessible', err);
        afficherToast('Caméra inaccessible — vérifiez les permissions', 'erreur');
        arreterScan();
      });
  }

  function arreterCamera() {
    clearInterval(intervalScan);
    intervalScan = null;
    if (streamCamera) {
      streamCamera.getTracks().forEach(function(t) { t.stop(); });
      streamCamera = null;
    }
  }

  // ============================================================
  //  SCANNER — ANALYSE IMAGE (BarcodeDetector)
  // ============================================================
  function analyserImage() {
    if (!streamCamera) return;
    var video = document.getElementById('scanner-video');
    if (video.readyState !== video.HAVE_ENOUGH_DATA) return;

    if (!('BarcodeDetector' in window)) {
      clearInterval(intervalScan);
      afficherToast('Scan non supporté sur ce navigateur', 'erreur');
      return;
    }

    var detector = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39'] });
    detector.detect(video)
      .then(function(codes) {
        if (codes.length > 0) {
          var code = codes[0].rawValue;
          arreterCamera();
          traiterCode(code);
        }
      })
      .catch(function() {});
  }

  // ============================================================
  //  SCANNER — TRAITEMENT DU CODE
  // ============================================================
  function traiterCode(code) {
    lireOnglet('Produits', function(produits) {
      var trouve = null;
      for (var i = 0; i < produits.length; i++) {
        if (produits[i]['CodeBarre'] && produits[i]['CodeBarre'].toString().trim() === code.toString().trim()) {
          trouve = produits[i];
          break;
        }
      }

      if (trouve) {
        afficherResultat(trouve, code, false);
      } else {
        interrogerOpenFoodFacts(code);
      }
    });
  }

  // ============================================================
  //  OPEN FOOD FACTS
  // ============================================================
  function interrogerOpenFoodFacts(code) {
    var url = 'https://world.openfoodfacts.org/api/v0/product/' + code + '.json';
    fetch(url)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.status === 1 && data.product) {
          var p = data.product;
          var produit = {
            'Nom':       p.product_name_fr || p.product_name || '',
            'Marque':    p.brands || '',
            'CodeBarre': code,
            'Photo':     p.image_front_small_url || p.image_url || ''
          };
          afficherResultat(produit, code, true);
        } else {
          afficherResultatInconnu(code);
        }
      })
      .catch(function() { afficherResultatInconnu(code); });
  }

  // ============================================================
  //  SCANNER — AFFICHAGE RÉSULTAT
  // ============================================================
  function afficherResultat(produit, code, estNouveau) {
    document.getElementById('scanner-camera').style.display   = 'none';
    document.getElementById('scanner-resultat').style.display = 'block';

    var titre = estNouveau ? 'Nouveau produit trouvé' : 'Produit connu';
    document.getElementById('resultat-titre').textContent = titre;

    var html = '';
    if (produit['Photo']) {
      html += '<img src="' + produit['Photo'] + '" style="width:80px; height:80px; object-fit:contain; border-radius:var(--rayon); margin-bottom:var(--espace-m);">';
    }
    html += '<div style="font-size:var(--taille-item-liste); font-weight:400; margin-bottom:var(--espace-xs);">' + (produit['Nom'] || 'Nom inconnu') + '</div>';
    if (produit['Marque']) {
      html += '<div style="font-size:var(--taille-micro); color:var(--couleur-brun-clair);">' + produit['Marque'] + '</div>';
    }
    html += '<div style="font-size:var(--taille-micro); color:var(--couleur-brun-clair); margin-top:var(--espace-xs);">Code : ' + code + '</div>';

    document.getElementById('resultat-contenu').innerHTML = html;

    var labels = { ajouter: 'Ajouter', consommer: 'Consommer', trouver: 'Emplacement' };
    document.getElementById('resultat-btn-action').textContent = labels[actionCourante] || 'Confirmer';
  }

  function afficherResultatInconnu(code) {
    document.getElementById('scanner-camera').style.display   = 'none';
    document.getElementById('scanner-resultat').style.display = 'block';
    document.getElementById('resultat-titre').textContent     = 'Produit inconnu';
    document.getElementById('resultat-contenu').innerHTML     =
      '<div style="font-size:var(--taille-item-liste); color:var(--couleur-brun-clair);">Code : ' + code + '</div>' +
      '<div style="font-size:var(--taille-micro); color:var(--couleur-brun-clair); margin-top:var(--espace-xs);">Ce produit n\'existe pas dans votre inventaire ni dans Open Food Facts.</div>';
    document.getElementById('resultat-btn-action').textContent = 'Saisir manuellement';
  }

  // ============================================================
  //  TOAST
  // ============================================================
  function afficherToast(msg, type) {
    var toast = document.createElement('div');
    toast.className = 'toast-confirmation toast-' + (type || 'succes');
    toast.textContent = msg;
    toast.style.cssText = 'position:fixed; bottom:var(--espace-xl); left:var(--espace-l); right:var(--espace-l); z-index:200;';
    document.body.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 3000);
  }

  // ============================================================
  //  CHARGEMENT DONNÉES ACCUEIL
  // ============================================================
  function chargerAccueil() {
    var aujourd = new Date();
    aujourd.setHours(0,0,0,0);

    lireOnglet('Produits', function(produits) {
      var actifs      = produits.filter(function(p) { return p['Actif'] !== 'FALSE'; });
      var stockEpuise = actifs.filter(function(p) { return parseInt(p['QteStock']   || 0) <= 0; });
      var reserveVide = actifs.filter(function(p) {
        return parseInt(p['QteStock'] || 0) > 0 && parseInt(p['QteReserve'] || 0) <= 0;
      });
      var aConsommer  = actifs.filter(function(p) {
        if (!p['DateExpiration']) return false;
        var exp  = new Date(p['DateExpiration']);
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

    remplirAccordeon('accordeon-special', [], afficherItemListe);
  }

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

    // Bouton Scanner sur l'accueil
    document.querySelectorAll('.bouton-principal-brun')[0].addEventListener('click', function() {
      afficherPage('page-scanner');
    });
  });
