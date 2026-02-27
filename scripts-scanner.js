// ============================================================
//  SCANNER — VARIABLES
// ============================================================
var actionCourante     = null;
var estEnScan          = false;
var confirmations      = {};
var SEUIL_CONFIRMATION = 3;
var produitCourant     = null;
var estNouveauProduit  = false;

// ============================================================
//  CHOIX ACTION
// ============================================================
function choisirAction(action) {
  actionCourante = action;
  document.getElementById('scanner-choix').style.display      = 'none';
  document.getElementById('scanner-camera').style.display     = 'block';
  document.getElementById('scanner-resultat').style.display   = 'none';
  document.getElementById('scanner-formulaire').style.display = 'none';
  demarrerQuagga();
}

function arreterScan() {
  arreterQuagga();
  document.getElementById('scanner-choix').style.display      = 'grid';
  document.getElementById('scanner-camera').style.display     = 'none';
  document.getElementById('scanner-resultat').style.display   = 'none';
  document.getElementById('scanner-formulaire').style.display = 'none';
  document.getElementById('saisie-manuelle').style.display    = 'none';
}

function recommencerScan() {
  produitCourant = null;
  document.getElementById('scanner-resultat').style.display   = 'none';
  document.getElementById('scanner-formulaire').style.display = 'none';
  document.getElementById('scanner-choix').style.display      = 'grid';
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
      produitCourant   = trouve;
      estNouveauProduit = false;
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
        produitCourant    = produit;
        estNouveauProduit = true;
        afficherResultat(produit, code, true);
      } else {
        estNouveauProduit = true;
        produitCourant    = { 'CodeBarre': code, 'Nom': '', 'Marque': '', 'Photo': '' };
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
  document.getElementById('resultat-btn-action').onclick = function() { actionConfirmer(); };
}

function afficherResultatInconnu(code) {
  document.getElementById('scanner-camera').style.display   = 'none';
  document.getElementById('scanner-resultat').style.display = 'block';
  document.getElementById('resultat-titre').textContent     = 'Produit inconnu';
  document.getElementById('resultat-contenu').innerHTML =
    '<div style="font-size:var(--taille-item-liste); color:var(--couleur-brun-clair);">Code : ' + code + '</div>' +
    '<div style="font-size:var(--taille-micro); color:var(--couleur-brun-clair); margin-top:var(--espace-xs);">Introuvable dans votre inventaire et dans Open Food Facts.</div>';
  document.getElementById('resultat-btn-action').textContent = 'Saisir manuellement';
  document.getElementById('resultat-btn-action').onclick     = function() { actionConfirmer(); };
}

// ============================================================
//  ACTION CONFIRMER
// ============================================================
function actionConfirmer() {
  if (actionCourante === 'ajouter') {
    ouvrirFormulaireAjouter();
  } else if (actionCourante === 'consommer') {
    ouvrirFormulaireConsommer();
  } else if (actionCourante === 'trouver') {
    afficherEmplacement();
  } else {
    ouvrirFormulaireAjouter();
  }
}

// ============================================================
//  FORMULAIRE AJOUTER
// ============================================================
function ouvrirFormulaireAjouter() {
  document.getElementById('scanner-resultat').style.display   = 'none';
  document.getElementById('scanner-formulaire').style.display = 'block';
  document.getElementById('form-titre').textContent           = estNouveauProduit ? 'Nouveau produit' : 'Modifier produit';

  document.getElementById('form-nom').value    = produitCourant['Nom']    || '';
  document.getElementById('form-marque').value = produitCourant['Marque'] || '';
  document.getElementById('form-code').value   = produitCourant['CodeBarre'] || '';

  var photoZone = document.getElementById('form-photo-preview');
  if (produitCourant['Photo']) {
    photoZone.innerHTML = '<img src="' + produitCourant['Photo'] + '" style="width:80px; height:80px; object-fit:contain; border-radius:var(--rayon);">';
  } else {
    photoZone.innerHTML = '';
  }

  document.getElementById('form-stock').textContent   = '1';
  document.getElementById('form-reserve').textContent = '0';
  document.getElementById('form-seuil').textContent   = '1';

  chargerCategories();
  chargerEmplacements();
}

function chargerCategories() {
  lireOnglet('Categories', function(cats) {
    var select = document.getElementById('form-categorie');
    select.innerHTML = '<option value="">-- Choisir --</option>';
    cats.forEach(function(c) {
      if (c['Actif'] !== 'FALSE') {
        select.innerHTML += '<option value="' + c['Nom'] + '">' + c['Nom'] + '</option>';
      }
    });
    if (produitCourant['Categorie']) select.value = produitCourant['Categorie'];
  });
}

function chargerEmplacements() {
  lireOnglet('Emplacements', function(emps) {
    var select = document.getElementById('form-emplacement');
    select.innerHTML = '<option value="">-- Choisir --</option>';
    emps.forEach(function(e) {
      if (e['Actif'] !== 'FALSE') {
        select.innerHTML += '<option value="' + e['Nom'] + '">' + e['Nom'] + '</option>';
      }
    });
    if (produitCourant['Emplacement']) select.value = produitCourant['Emplacement'];
  });
}

function changerCompteur(id, delta) {
  var el  = document.getElementById(id);
  var val = parseInt(el.textContent || '0') + delta;
  if (val < 0) val = 0;
  el.textContent = val;
}

function sauvegarderProduit() {
  var nom = document.getElementById('form-nom').value.trim();
  if (!nom) { afficherToast('Le nom est obligatoire', 'erreur'); return; }

  var valeurs = [
    '',                                                          // ID — auto
    nom,                                                         // Nom
    document.getElementById('form-marque').value.trim(),        // Marque
    document.getElementById('form-code').value.trim(),          // CodeBarre
    document.getElementById('form-categorie').value,            // Categorie
    document.getElementById('form-emplacement').value,          // Emplacement
    document.getElementById('form-stock').textContent,          // QteStock
    document.getElementById('form-reserve').textContent,        // QteReserve
    document.getElementById('form-seuil').textContent,          // QteMinimum
    document.getElementById('form-expiration').value,           // DateExpiration
    document.getElementById('form-notes').value.trim(),         // Notes
    produitCourant['Photo'] || '',                               // Photo
    'TRUE'                                                       // Actif
  ];

  var btnSave = document.getElementById('btn-sauvegarder');
  btnSave.textContent = 'Sauvegarde...';
  btnSave.disabled    = true;

  ecrireOnglet('Produits', valeurs, function() {
    afficherToast(nom + ' ajouté !', 'succes');
    btnSave.textContent = 'Sauvegarder';
    btnSave.disabled    = false;
    recommencerScan();
  });
}
