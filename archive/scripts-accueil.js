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
