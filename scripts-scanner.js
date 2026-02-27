// ============================================================
//  SCANNER — VARIABLES
// ============================================================
var actionCourante     = null;
var estEnScan          = false;
var confirmations      = {};
var SEUIL_CONFIRMATION = 3;
var produitCourant     = null;

// ============================================================
//  CHOIX ACTION
// ============================================================
function choisirAction(action) {
  actionCourante = action;
  document.getElementById('scanner-choix').style.display    = 'none';
  document.getElementById('scanner-camera').style.display   = 'block';
  document.getElementById('scanner-resultat').style.display = 'none';
  demarrerQuagga();
}

function arreterScan() {
  arreterQuagga();
  document.getElementById('scanner-choix').style.display    = 'grid';
  document.getElementById('scanner-camera').style.display   = 'none';
  document.getElementById('scanner-resultat').style.display = 'none';
  document.getElementById('saisie-manuelle').style.display  = 'none';
}

function recommencerScan() {
  produitCourant = null;
  document.getElementById('scanner-resultat').style.display = 'none';
  document.getElementById('scanner-choix').style.display    = 'grid';
}

function toggleSaisieManuelle() {
  var zone = document.getElementById('saisie-manuelle');
  zone.style.display = zone.style.display === 'none' ? 'block' : 'none';
  if (zone.style.display === 'block') {
    document.getElementById('input-code-manuel').focus();
  }
}

function soumettreCodeManuel() {
  var input = document.getElementById('input-code-manuel');
  var code  = input.value.replace(/\D/g, '').trim();
  if (!code || code.length < 8) {
    afficherToast('Code-barres invalide — minimum 8 chiffres', 'erreur');
    return;
  }
  input.value = '';
  arreterQuagga();
  traiterCode(code);
}

// ============================================================
//  QUAGGA
// ============================================================
function demarrerQuagga() {
  estEnScan     = true;
  confirmations = {};

  Quagga.init({
    numOfWorkers: 0,
    inputStream: {
      name: 'Live',
      type: 'LiveStream',
      target: document.getElementById('interactive'),
      constraints: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
    },
    locator: { patchSize: 'medium', halfSample: true },
    decoder: { readers: ['ean_reader', 'code_128_reader', 'upc_reader'] }
  }, function(err) {
    if (err) {
      afficherToast('Caméra inaccessible — vérifiez les permissions', 'erreur');
      arreterScan();
      return;
    }
    Quagga.start();
  });

  Quagga.onDetected(function(result) {
    if (!estEnScan) return;
    var code = result.codeResult.code;
    if (!code || !/^\d{8,13}$/.test(code)) return;

    if (!confirmations[code]) confirmations[code] = 0;
    confirmations[code]++;

    var feedback = document.getElementById('scanner-feedback');
    if (feedback) {
      feedback.textContent = 'Code détecté : ' + code + ' (' + confirmations[code] + '/' + SEUIL_CONFIRMATION + ')';
    }

    if (confirmations[code] >= SEUIL_CONFIRMATION) {
      arreterQuagga();
      traiterCode(code);
    }
  });
}

function arreterQuagga() {
  estEnScan = false;
  if (typeof Quagga !== 'undefined' && Quagga.stop) {
    try { Quagga.stop(); } catch(e) {}
  }
  var feedback = document.getElementById('scanner-feedback');
  if (feedback) feedback.textContent = 'Alignez le code-barres avec le cadre';
}

// ============================================================
//  TRAITEMENT DU CODE
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
      produitCourant = trouve;
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
        produitCourant = produit;
        afficherResultat(produit, code, true);
      } else {
        afficherResultatInconnu(code);
      }
    })
    .catch(function() { afficherResultatInconnu(code); });
}

// ============================================================
//  AFFICHAGE RÉSULTAT
// ============================================================
function afficherResultat(produit, code, estNouveau) {
  document.getElementById('scanner-camera').style.display   = 'none';
  document.getElementById('scanner-resultat').style.display = 'block';

  document.getElementById('resultat-titre').textContent = estNouveau ? 'Nouveau produit trouvé' : 'Produit connu';

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

  var labels = { ajouter: 'Ajouter', consommer: 'Consommer', trouver: 'Voir emplacement' };
  document.getElementById('resultat-btn-action').textContent = labels[actionCourante] || 'Confirmer';
}

function afficherResultatInconnu(code) {
  document.getElementById('scanner-camera').style.display   = 'none';
  document.getElementById('scanner-resultat').style.display = 'block';
  document.getElementById('resultat-titre').textContent     = 'Produit inconnu';
  document.getElementById('resultat-contenu').innerHTML =
    '<div style="font-size:var(--taille-item-liste); color:var(--couleur-brun-clair);">Code : ' + code + '</div>' +
    '<div style="font-size:var(--taille-micro); color:var(--couleur-brun-clair); margin-top:var(--espace-xs);">Introuvable dans votre inventaire et dans Open Food Facts.</div>';
  document.getElementById('resultat-btn-action').textContent = 'Saisir manuellement';
  produitCourant = { 'CodeBarre': code, 'Nom': '', 'Marque': '' };
}
