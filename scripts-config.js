// ============================================================
//  CONFIGURATION GLOBALE
// ============================================================
var SHEET_ID = '1-BFJlOcyxipKqJZOglcdVzVnUNp8VYoOrcKRMwTR8bI';
var API_KEY  = 'AIzaSyBuennUE5SMN1YkV_38JObgGYj6_aAmTSc';
var API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets/';

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
