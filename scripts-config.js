// ============================================================
//  CONFIGURATION GLOBALE
// ============================================================
var SHEET_ID   = '1-BFJlOcyxipKqJZOglcdVzVnUNp8VYoOrcKRMwTR8bI';
var API_KEY    = 'AIzaSyBuennUE5SMN1YkV_38JObgGYj6_aAmTSc';
var API_BASE   = 'https://sheets.googleapis.com/v4/spreadsheets/';
var CLIENT_ID  = '1052424777819-vipdir50gal3d6ht1ob4bd1tmbk6v5hv.apps.googleusercontent.com';
var SCOPE      = 'https://www.googleapis.com/auth/spreadsheets';
var tokenAcces = null;

// ============================================================
//  LECTURE GOOGLE SHEETS
// ============================================================
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
//  ÉCRITURE GOOGLE SHEETS
// ============================================================
function ecrireOnglet(nomOnglet, valeurs, callback) {
  if (!tokenAcces) {
    demanderConnexion(function() { ecrireOnglet(nomOnglet, valeurs, callback); });
    return;
  }
  var url = API_BASE + SHEET_ID + '/values/' + encodeURIComponent(nomOnglet) + ':append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS';
  fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + tokenAcces,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ values: [valeurs] })
  })
  .then(function(r) { return r.json(); })
  .then(function(data) {
    if (data.error) {
      if (data.error.code === 401) {
        tokenAcces = null;
        demanderConnexion(function() { ecrireOnglet(nomOnglet, valeurs, callback); });
      } else {
        afficherToast('Erreur sauvegarde : ' + data.error.message, 'erreur');
      }
    } else {
      if (callback) callback();
    }
  })
  .catch(function(err) {
    console.error('Erreur écriture', err);
    afficherToast('Erreur de connexion', 'erreur');
  });
}

function mettreAJourLigne(nomOnglet, ligne, valeurs, callback) {
  if (!tokenAcces) {
    demanderConnexion(function() { mettreAJourLigne(nomOnglet, ligne, valeurs, callback); });
    return;
  }
  var plage = nomOnglet + '!A' + ligne;
  var url   = API_BASE + SHEET_ID + '/values/' + encodeURIComponent(plage) + '?valueInputOption=USER_ENTERED';
  fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': 'Bearer ' + tokenAcces,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ values: [valeurs] })
  })
  .then(function(r) { return r.json(); })
  .then(function(data) {
    if (data.error) {
      afficherToast('Erreur mise à jour : ' + data.error.message, 'erreur');
    } else {
      if (callback) callback();
    }
  })
  .catch(function(err) { console.error('Erreur update', err); });
}

// ============================================================
//  AUTHENTIFICATION GOOGLE
// ============================================================
function demanderConnexion(callback) {
  google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPE,
    callback: function(reponse) {
      if (reponse.error) {
        afficherToast('Connexion annulée', 'erreur');
        return;
      }
      tokenAcces = reponse.access_token;
      if (callback) callback();
    }
  }).requestAccessToken();
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
