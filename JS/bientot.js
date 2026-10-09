/* ============================================================
   À CONSOMMER BIENTÔT — la 2e liste de Listes (J-C, 2026-10-06 : décisions dans docs/RdG-07)
   Aucune date à taper. L'horloge part de la date d'entrée (STOCK col. E), ou du dernier passage entre un congélateur
   et le frais (STOCK col. P : Déplacer la pose). La durée : au congélo, 4 mois pour tout; au frais, celle de l'aliment
   (Produits col. K), sinon celle que l'app propose pour lui (un fruit, un légume, un fromage qu'elle connaît), sinon celle
   de sa sous-catégorie (Categories col. E, sinon la proposée), sinon celle de sa catégorie. 0 = Aucune : jamais dans la liste.
   « Bientôt » = le dernier quart de sa durée; la date passée reste en tête, en rouge, jusqu'à ce qu'il sorte.
   La liste : par catégorie, comme l'Inventaire par catégorie; sur chaque ligne, la fourchette et les deux flèches.
============================================================ */
const DUREES = [1, 2, 3, 5, 7, 14, 21, 30, 60, 90, 180, 365, 730];   // le menu (en jours) — J-C, choix A; 0 = Aucune
const DUREE_CONGELO = 120;                                           // au congélo : 4 mois, pour tout (J-C, choix B)

/* Les durées que l'app propose (J-C : « Oui » — il corrige seulement ce qui ne colle pas). Au frais : le frigo pour ce
   qui s'y garde, le garde-manger pour le reste. Par le nom de la catégorie ou de la sous-catégorie (cleNom). */
const PROPOSEES_CATS = [
  ['Fruits et légumes', 7], ['Fruits', 7], ['Légumes', 7], ['Fines herbes fraîches', 5],
  ['Produits laitiers et œufs', 14], ['Laits, crèmes et beurres', 14], ['Œufs', 30], ['Yogourts', 21], ['Fromages emballés', 30], ['Fromages fins', 14],
  ['Garde-manger', 365], ['Ingrédients pour cuisson et préparation', 365], ['Aliments en conserve et en pot', 730],
  ['Céréales, tartinades et sirops', 180], ['Condiments et garnitures', 180], ['Fines herbes, épices et sauces', 365],
  ['Huiles et vinaigres', 365], ['Pâtes, riz et fèves', 365], ['Gastronomie internationale', 365],
  ['Boissons', 180], ['Café', 180], ['Thés et boissons chaudes', 365], ['Jus et boissons', 30], ['Boissons gazeuses', 180], ['Eau', 0],
  ['Boissons au soja, riz et amandes', 30],
  ['Bières et vins', 180], ['Bières et cidres', 180],
  ['Viandes et volailles', 3], ['Bœuf et veau', 3], ['Poulet et dinde', 2], ['Porc', 3], ['Agneau et gibier', 3], ['Saucisses et bacon', 7], ['Viandes surgelées', 2],
  ['Collations', 60], ['Collations salées', 60], ['Collations sucrées et bonbons', 90], ['Noix, graines et fruits', 90],
  ['Produits surgelés', 7], ['Crème glacée et friandises', 7],
  ['Pains et pâtisseries', 5], ['Pains frais et baguettes', 3], ['Pains emballés', 7], ['Pains à hamburger et petits pains', 7],
  ['Tortillas et pains plats', 14], ['Viennoiseries, muffins et bagels', 5], ['Desserts et pâtisseries', 3],
  ['Charcuteries et plats préparés', 7], ['Charcuteries', 7],
  ['Poissons et fruits de mer', 2], ['Poissons frais', 2], ['Fruits de mer frais', 2],
  ['Entretien ménager et nettoyage', 0], ['Papier', 0], ['Lessive', 0], ['Vaisselle', 0], ['Entretien ménager', 0], ['Entretien général', 0], ['Articles pour la cuisine', 0]
];
/* Les sous-catégories qui mélangent des aliments qui ne se gardent pas pareil (les framboises, les pommes) : l'app y propose
   une durée par aliment, d'après son nom. Ailleurs, la sous-catégorie suffit. */
const SOUSCATS_MELANGEES = ['Fruits', 'Légumes', 'Fines herbes fraîches', 'Fromages fins', 'Fromages emballés', 'Laits, crèmes et beurres'];
const PROPOSEES_ALIMENTS = [
  // les fruits
  ['fraise', 3], ['framboise', 3], ['mûre', 3], ['bleuet', 5], ['cerise', 5], ['raisin', 7], ['banane', 5], ['avocat', 5], ['pêche', 5],
  ['nectarine', 5], ['prune', 5], ['abricot', 5], ['poire', 7], ['pomme', 30], ['orange', 14], ['clémentine', 14], ['mandarine', 14],
  ['citron', 21], ['lime', 14], ['pamplemousse', 14], ['kiwi', 7], ['mangue', 5], ['ananas', 5], ['melon', 7], ['cantaloup', 7],
  ['melon d\'eau', 7], ['pastèque', 7], ['canneberge', 14], ['grenade', 21], ['figue', 2], ['papaye', 5], ['litchi', 5],
  // les légumes
  ['laitue', 5], ['salade', 5], ['épinard', 5], ['roquette', 3], ['mesclun', 3], ['chou frisé', 5], ['kale', 5], ['brocoli', 5],
  ['chou-fleur', 7], ['chou', 21], ['chou de Bruxelles', 7], ['carotte', 21], ['céleri', 14], ['concombre', 7], ['courgette', 5],
  ['poivron', 7], ['piment', 7], ['tomate', 5], ['tomate cerise', 7], ['champignon', 5], ['asperge', 3], ['haricot', 5],
  ['pois mange-tout', 5], ['pois sucré', 5], ['maïs', 3], ['oignon', 30], ['oignon vert', 7], ['échalote verte', 7], ['échalote', 30],
  ['ail', 60], ['pomme de terre', 30], ['patate', 30], ['patate douce', 21], ['courge', 30], ['citrouille', 30], ['betterave', 21],
  ['navet', 21], ['radis', 14], ['poireau', 14], ['aubergine', 5], ['gingembre', 21], ['germe de haricot', 3], ['bok choy', 5],
  ['fenouil', 7], ['artichaut', 5], ['panais', 21], ['rutabaga', 30], ['endive', 5],
  // les fines herbes
  ['basilic', 5], ['coriandre', 5], ['persil', 7], ['aneth', 5], ['menthe', 5], ['ciboulette', 5], ['thym', 7], ['romarin', 14],
  ['estragon', 5], ['sauge', 7],
  // les fromages
  ['brie', 7], ['camembert', 7], ['chèvre', 7], ['ricotta', 5], ['mozzarella', 7], ['bocconcini', 5], ['burrata', 3], ['cheddar', 30],
  ['parmesan', 60], ['gouda', 30], ['gruyère', 30], ['emmental', 30], ['feta', 14], ['bleu', 21], ['oka', 21], ['cottage', 7],
  ['mascarpone', 7], ['fromage à la crème', 14], ['halloumi', 30], ['raclette', 21], ['suisse', 30], ['provolone', 21],
  // les laits, crèmes et beurres
  ['beurre', 60], ['lait', 14], ['crème', 14], ['crème sure', 21], ['babeurre', 14], ['crème fouettée', 7]
];
/* « UNE FOIS OUVERT » (RdG-09, J-C, 2026-10-08 : « sa durée de vie est raccourcie quand c'est ouvert, comme justement le lait » —
   choix A : comme la durée de vie, proposée par sous-catégorie, et par aliment quand ça ne colle pas; J-C corrige). 0 = « Pas de
   changement » (les pâtes, le riz) : pas d'« Ouvrir ». Une sous-catégorie absente de la liste : rien de connu (pas d'« Ouvrir »). */
const PROPOSEES_OUVERT_CATS = [
  ['Fruits et légumes', 0], ['Fruits', 0], ['Légumes', 0], ['Fines herbes fraîches', 0],
  ['Produits laitiers et œufs', 7], ['Laits, crèmes et beurres', 7], ['Œufs', 0], ['Yogourts', 5], ['Fromages emballés', 21], ['Fromages fins', 7],
  ['Garde-manger', 0], ['Ingrédients pour cuisson et préparation', 0], ['Aliments en conserve et en pot', 5],
  ['Céréales, tartinades et sirops', 60], ['Condiments et garnitures', 60], ['Fines herbes, épices et sauces', 0],
  ['Huiles et vinaigres', 0], ['Pâtes, riz et fèves', 0], ['Gastronomie internationale', 30],
  ['Boissons', 0], ['Café', 30], ['Thés et boissons chaudes', 0], ['Jus et boissons', 7], ['Boissons gazeuses', 3], ['Eau', 0],
  ['Boissons au soja, riz et amandes', 7],
  ['Bières et vins', 0], ['Bières et cidres', 0],
  ['Viandes et volailles', 0], ['Bœuf et veau', 0], ['Poulet et dinde', 0], ['Porc', 0], ['Agneau et gibier', 0], ['Saucisses et bacon', 7], ['Viandes surgelées', 0],
  ['Collations', 14], ['Collations salées', 14], ['Collations sucrées et bonbons', 30], ['Noix, graines et fruits', 90],
  ['Produits surgelés', 0], ['Crème glacée et friandises', 0],
  ['Pains et pâtisseries', 0], ['Pains frais et baguettes', 0], ['Pains emballés', 0], ['Pains à hamburger et petits pains', 0],
  ['Tortillas et pains plats', 0], ['Viennoiseries, muffins et bagels', 0], ['Desserts et pâtisseries', 0],
  ['Charcuteries et plats préparés', 5], ['Charcuteries', 5],
  ['Poissons et fruits de mer', 0], ['Poissons frais', 0], ['Fruits de mer frais', 0],
  ['Entretien ménager et nettoyage', 0], ['Papier', 0], ['Lessive', 0], ['Vaisselle', 0], ['Entretien ménager', 0], ['Entretien général', 0], ['Articles pour la cuisine', 0]
];
const PROPOSEES_OUVERT_ALIMENTS = [   // d'après le nom, partout (une sous-catégorie mélange : le ketchup et la mayonnaise)
  ['lait', 7], ['lait de coco', 5], ['crème', 7], ['crème sure', 14], ['crème glacée', 0], ['babeurre', 7], ['beurre', 30], ['beurre d\'arachide', 90],
  ['yogourt', 5], ['fromage à la crème', 14], ['ricotta', 5], ['cottage', 5], ['mozzarella', 7], ['cheddar', 21], ['parmesan', 30],
  ['jus', 7], ['boisson gazeuse', 3], ['café', 30], ['vin', 3],
  ['ketchup', 180], ['moutarde', 180], ['mayonnaise', 60], ['relish', 180], ['cornichon', 90], ['olive', 30], ['salsa', 14],
  ['vinaigrette', 60], ['sauce', 30], ['sauce soja', 365], ['pesto', 7], ['pâte de tomate', 5], ['bouillon', 5], ['houmous', 7], ['tofu', 5],
  ['confiture', 30], ['sirop', 365], ['miel', 0], ['tartinade', 60], ['céréale', 60],
  ['croustille', 14], ['craquelin', 30], ['biscuit', 30], ['noix', 90],
  ['bacon', 7], ['jambon', 5], ['salami', 21], ['pepperoni', 21]
];
const OUVERT_DE_CAT = {}; PROPOSEES_OUVERT_CATS.forEach(x => { OUVERT_DE_CAT[cleNom(x[0])] = x[1]; });
const DUREE_DE_CAT = {}; PROPOSEES_CATS.forEach(x => { DUREE_DE_CAT[cleNom(x[0])] = x[1]; });
const MELANGEES = SOUSCATS_MELANGEES.map(cleNom);
/* Les mots d'un nom, sans accent ni majuscule, au singulier (« Pommes de terre » -> pomme de terre). */
function motsDe(t) {
  return String(t || '').replace(/œ/gi, 'oe').replace(/æ/gi, 'ae').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .split(/[^a-z0-9]+/).filter(Boolean).map(m => m.length > 3 && /[sx]$/.test(m) ? m.slice(0, -1) : m);
}
const CLES_ALIMENTS = PROPOSEES_ALIMENTS.map(x => ({ mots: motsDe(x[0]), jours: x[1] })).sort((a, b) => b.mots.length - a.mots.length);
const CLES_OUVERT = PROPOSEES_OUVERT_ALIMENTS.map(x => ({ mots: motsDe(x[0]), jours: x[1] })).sort((a, b) => b.mots.length - a.mots.length);
/* La durée qu'une liste de mots (CLES_…) propose pour ce nom : le mot le plus tôt dans le nom, le plus long d'abord. '' = rien. */
function dureeDuNom(nom, cles) {
  const mots = motsDe(nom);
  let mieux = null;
  cles.forEach(c => {
    for (let i = 0; i + c.mots.length <= mots.length; i++) {
      if (!c.mots.every((m, k) => mots[i + k] === m)) continue;
      if (!mieux || i < mieux.i) mieux = { i: i, jours: c.jours };   // à position égale, la plus longue (déjà en tête) l'emporte
      break;
    }
  });
  return mieux ? mieux.jours : '';
}

/* « 3 jours », « 2 semaines », « 1 mois », « 1 an », « Aucune ». */
function texteDuree(j) {
  j = Number(j);
  if (!j) return 'Aucune';
  if (j % 365 === 0) return (j / 365) + (j === 365 ? ' an' : ' ans');
  if (j % 30 === 0) return (j / 30) + ' mois';
  if (j % 7 === 0) return (j / 7) + (j === 7 ? ' semaine' : ' semaines');
  return j + (j === 1 ? ' jour' : ' jours');
}
/* Une catégorie ou une sous-catégorie : la sienne (col. E), sinon la proposée. '' = aucune connue. */
function dureeDeCat(x) {
  if (!x) return '';
  const d = valeurDuree(x.duree), k = cleNom(x.nom);
  return d !== '' ? d : (Object.prototype.hasOwnProperty.call(DUREE_DE_CAT, k) ? DUREE_DE_CAT[k] : '');
}
/* Une sous-catégorie : la sienne, sinon celle de sa catégorie. */
function dureeSousCat(scid) {
  const rid = rayonDe(scid), sc = (SOUSCATS[rid] || []).find(x => String(x.id) === String(scid)), d = dureeDeCat(sc);
  return d !== '' ? d : dureeDeCat(RAYONS.find(r => String(r.id) === String(rid)));
}
/* Ce que l'app propose pour un aliment d'une sous-catégorie mélangée, d'après son nom : le mot le plus tôt dans le nom,
   le plus long d'abord (« Pommes de terre » n'est pas une pomme; « Fromage cheddar » est un cheddar). '' = rien. */
function dureeProposeeAliment(p) {
  const rid = rayonDe(p.catId), sc = (SOUSCATS[rid] || []).find(x => String(x.id) === String(p.catId));
  if (!sc || MELANGEES.indexOf(cleNom(sc.nom)) === -1) return '';
  return dureeDuNom(p.nom, CLES_ALIMENTS);
}
/* La durée d'un aliment au frais : la sienne (Produits col. K), sinon la proposée, sinon celle de sa sous-catégorie. */
function dureeAliment(p) {
  const d = valeurDuree(p.duree);
  if (d !== '') return d;
  const a = dureeProposeeAliment(p);
  return a !== '' ? a : dureeSousCat(p.catId);
}
/* Une fois ouvert — une catégorie ou une sous-catégorie : la sienne (Categories col. I), sinon la proposée. '' = rien de connu. */
function dureeOuvertDeCat(x) {
  if (!x) return '';
  const d = valeurDuree(x.dureeOuvert), k = cleNom(x.nom);
  return d !== '' ? d : (Object.prototype.hasOwnProperty.call(OUVERT_DE_CAT, k) ? OUVERT_DE_CAT[k] : '');
}
function dureeOuvertSousCat(scid) {
  const rid = rayonDe(scid), sc = (SOUSCATS[rid] || []).find(x => String(x.id) === String(scid)), d = dureeOuvertDeCat(sc);
  return d !== '' ? d : dureeOuvertDeCat(RAYONS.find(r => String(r.id) === String(rid)));
}
/* Une fois ouvert — un aliment : la sienne (Produits col. L), sinon celle que l'app propose d'après son nom, sinon sa sous-catégorie.
   0 = pas de changement. */
function dureeOuvert(p) {
  const d = valeurDuree(p.dureeOuvert);
  if (d !== '') return d;
  const a = dureeDuNom(p.nom, CLES_OUVERT);
  return a !== '' ? a : dureeOuvertSousCat(p.catId);
}
/* Le menu d'une durée (J-C, choix A) : en tête, ce qui vaut quand on n'a rien choisi; puis 1 jour… 2 ans; « Aucune »
   (« Pas de changement » pour « une fois ouvert »). */
function optionsDuree(choisie, premier, zero) {
  const vals = DUREES.slice();
  if (choisie !== '' && choisie !== 0 && vals.indexOf(choisie) === -1) { vals.push(choisie); vals.sort((a, b) => a - b); }   // une durée écrite à la main dans le Sheet
  return '<option value=""' + (choisie === '' ? ' selected' : '') + '>' + esc(premier) + '</option>' +
    vals.map(j => '<option value="' + j + '"' + (choisie === j ? ' selected' : '') + '>' + texteDuree(j) + '</option>').join('') +
    '<option value="0"' + (choisie === 0 ? ' selected' : '') + '>' + (zero || 'Aucune') + '</option>';
}
/* Gérer les bases → Aliments, un aliment ouvert, sous « Durée » : « Une fois ouvert ». Rien de choisi = la proposée. */
function htmlDureeOuvertAliment(p) {
  const a = dureeDuNom(p.nom, CLES_OUVERT), v = a !== '' ? a : dureeOuvertSousCat(p.catId);
  const premier = 'Proposée : ' + (v === '' || v === 0 ? 'pas de changement' : texteDuree(v));
  return '<div class="bloc accordeon-bloc"><div class="label">Une fois ouvert</div>' +
    '<select class="champ choix-duree-ouvert" data-aliment="' + esc(p.id) + '">' + optionsDuree(valeurDuree(p.dureeOuvert), premier, 'Pas de changement') + '</select></div>';
}
/* Une durée « une fois ouvert » choisie pour un aliment : instantané, Produits col. L par la file des gestes ('' = la proposée; 0 = pas de changement). */
function choisirDureeOuvertAliment(pid, v) {
  const p = PRODUITS.find(x => String(x.id) === String(pid)), c = lireCache();
  const row = c && (c.prods || []).find(r => String(r[0]) === String(pid));
  if (!p || !row) { avis('Pas changé — réessaie', 'erreur'); remplirPageAliments(true); return; }
  const l = row.slice(); while (l.length < 12) l.push('');
  l[11] = valeurDuree(v);
  poserGeste({ action: 'lignes', table: 'Produits', opId: 'ouvert-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8), lignes: [l] });
  p.dureeOuvert = l[11];
}
/* Gérer les bases → Aliments, un aliment ouvert : « Durée ». Rien de choisi = la proposée, ou celle de sa sous-catégorie. */
function htmlDureeAliment(p) {
  const a = dureeProposeeAliment(p), sc = dureeSousCat(p.catId);
  const premier = a !== '' ? 'Proposée : ' + texteDuree(a) : 'Proposée : ' + (sc !== '' ? texteDuree(sc) : 'aucune');   // celle de sa sous-catégorie (J-C, 2026-10-07 : « Proposée », pas « Comme sa… »)
  return '<div class="bloc accordeon-bloc"><div class="label">Durée</div>' +
    '<select class="champ choix-duree" data-aliment="' + esc(p.id) + '">' + optionsDuree(valeurDuree(p.duree), premier) + '</select></div>';
}
/* Gérer les bases → Catégories : la durée d'une sous-catégorie, sous son nom (J-C, choix A sur aperçu). Rien de choisi = la proposée,
   sinon celle de sa catégorie. */
function htmlDureeSousCat(sc) {
  const k = cleNom(sc.nom), prop = Object.prototype.hasOwnProperty.call(DUREE_DE_CAT, k) ? DUREE_DE_CAT[k] : '';
  const r = dureeDeCat(RAYONS.find(x => String(x.id) === String(rayonDe(sc.id))));
  const premier = prop !== '' ? 'Proposée : ' + texteDuree(prop) : 'Proposée : ' + (r !== '' ? texteDuree(r) : 'aucune');   // celle de sa catégorie (J-C : « Proposée »)
  return '<select class="champ choix-duree-sc" data-souscat="' + esc(sc.id) + '">' + optionsDuree(valeurDuree(sc.duree), premier) + '</select>';
}
/* Une durée choisie pour une sous-catégorie : instantané, Categories col. E par la file des gestes ('' = la proposée; 0 = Aucune). */
function choisirDureeSousCat(id, v) {
  const sc = [].concat(...Object.values(SOUSCATS)).find(x => String(x.id) === String(id)), c = lireCache();
  const row = c && (c.cats || []).find(r => String(r[0]) === String(id));
  if (!sc || !row) { avis('Pas changé — réessaie', 'erreur'); remplirPageCategories(true); return; }
  const l = row.slice(); l[4] = valeurDuree(v);
  poserGeste({ action: 'lignes', table: 'Categories', opId: 'dureesc-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8), lignes: [l] });
  sc.duree = l[4];
}
/* Une durée choisie pour un aliment : instantané, Produits col. K par la file des gestes ('' = rien de choisi; 0 = Aucune). */
function choisirDureeAliment(pid, v) {
  const p = PRODUITS.find(x => String(x.id) === String(pid)), c = lireCache();
  const row = c && (c.prods || []).find(r => String(r[0]) === String(pid));
  if (!p || !row) { avis('Pas changé — réessaie', 'erreur'); remplirPageAliments(true); return; }
  const l = row.slice(); while (l.length < 11) l.push('');
  l[10] = valeurDuree(v);
  poserGeste({ action: 'lignes', table: 'Produits', opId: 'duree-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8), lignes: [l] });
  p.duree = l[10];
}

/* ---------- L'horloge ---------- */
/* Un meuble « Congélateur » (Gérer les bases → Meubles) : l'endroit, ou le meuble de l'espace. L'Escale n'en est pas un. */
function estCongelo(emp) {
  if (!emp) return false;
  const r = resoudreEmp(emp), m = r && MEUBLES.find(x => String(x.id) === String(r.meubleId));
  return !!(m && m.congelo);
}
/* Une date de STOCK, en AAAA-MM-JJ ('' si rien). */
function jourDe(v) { const t = String(dateCourte(v) || '').slice(0, 10); return /^\d{4}-\d{2}-\d{2}$/.test(t) ? t : ''; }
function joursEntre(a, b) { return Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 864e5); }
/* Déplacer (deplacerLot) : un lot qui entre au congélo, ou qui en sort, repart à zéro aujourd'hui (STOCK col. P — J-C, choix A). */
function poserHorloge(ligne, de, vers) {
  if (estCongelo(de) === estCongelo(vers)) return;
  while (ligne.length < 16) ligne.push('');
  ligne[15] = dateDuJour();
}

/* ---------- La liste ---------- */
/* Ce qui arrive au dernier quart de sa durée, ou l'a passée : par aliment + endroit + marque + saveur + jours qui restent. */
function lignesBientot() {
  const auj = dateDuJour(), prods = {}, congelo = {}, par = {};
  PRODUITS.forEach(p => { prods[String(p.id)] = p; });
  STOCK.forEach(r => {
    const q = qteDe(r), p = prods[String(r[1])];                  // un pack compte ses pots, comme l'Inventaire
    if (q <= 0 || !p) return;
    const emp = String(r[2] || '');
    if (!(emp in congelo)) congelo[emp] = estCongelo(emp);
    const choix = [];                                            // [ce qui reste, sa durée] : fermé, et une fois ouvert — le plus court l'emporte
    const da = dureeAliment(p), d = da === 0 ? 0 : (congelo[emp] ? DUREE_CONGELO : da);   // Aucune (0) : jamais, même au congélo; au congélo : 4 mois, ouvert ou pas
    const depart = jourDe(r[15]) || jourDe(r[4]);
    if (d !== '' && d !== 0 && depart) choix.push([d - joursEntre(depart, auj), d]);
    const ouvert = jourDe(r[16]), o = ouvert && !congelo[emp] ? dureeOuvert(p) : '';   // STOCK col. Q : le jour de l'ouverture (RdG-09)
    if (o !== '' && o !== 0) choix.push([o - joursEntre(ouvert, auj), o]);            //   ouvrir ne rallonge jamais : le plus court des deux
    if (!choix.length) return;                                   // aucune durée connue (un aliment pas encore classé), ou Aucune
    const [reste, duree] = choix.reduce((a, b) => b[0] < a[0] ? b : a);
    if (reste > Math.max(1, Math.ceil(duree / 4))) return;       // pas encore le dernier quart
    const marque = String(r[5] || '').trim(), saveur = String(r[9] || '').trim();
    const k = [p.id, emp, marque, saveur, ouvert ? 'o' : '', reste].join('|');
    (par[k] = par[k] || { p: p, emp: emp, marque: marque, saveur: saveur, ouvert: !!ouvert, reste: reste, qte: 0 }).qte += q;
  });
  return Object.values(par);
}
/* « Encore 3 jours », « Encore 2 semaines », « Date passée ». */
function texteReste(reste) {
  if (reste <= 0) return 'Date passée';
  if (reste >= 60) return 'Encore ' + Math.round(reste / 30) + ' mois';
  if (reste >= 14) return 'Encore ' + Math.round(reste / 7) + ' semaines';
  return 'Encore ' + reste + (reste === 1 ? ' jour' : ' jours');
}
/* Par catégorie (J-C, choix C sur aperçu) : les catégories en barres à leur couleur, fermées, une liste blanche dessous, la plus
   pressée en tête. Ce qui était ouvert le reste après un geste. */
function remplirBientot() {
  const cible = $('liste-bientot');
  if (!cible) return;
  const ouverts = [...cible.querySelectorAll('[data-cle] > .ouvert')].map(t => t.parentElement.dataset.cle);
  LOTS = lotsParProduit();                                       // la fourchette et les flèches visent les lots (lotsDeCle)
  const groupes = {};
  lignesBientot().forEach(x => { const rid = rayonDe(x.p.catId); (groupes[rid] = groupes[rid] || []).push(x); });
  const ligne = x => {
    const det = [[nomListe(x.marque), nomListe(x.saveur)].filter(Boolean).join(' · '), x.ouvert ? '(ouvert)' : ''].filter(Boolean).join(' ');
    return '<div class="item"><div class="item-info"><div class="item-nom">' + esc(x.p.nom) + '</div>' +
      (det ? '<div class="item-detail">' + esc(det) + '</div>' : '') +
      '<div class="item-detail">' + esc(endroitMeuble(x.emp)) + '</div>' +
      '<div class="item-detail' + (x.reste <= 0 ? ' date-passee' : '') + '">' + texteReste(x.reste) + '</div></div>' +
      outilsInventaire(x.p.id, x.emp, x.marque, x.saveur, x.ouvert) + '<span class="item-quantite">' + x.qte + '</span></div>';
  };
  const groupe = (rid, nom) => {
    const xs = groupes[rid];
    if (!xs) return '';
    xs.sort((a, b) => (a.reste - b.reste) || String(a.p.nom).localeCompare(String(b.p.nom), 'fr'));
    const t = teinteCategorie(rid);
    return '<div class="accordeon" data-cle="' + esc('c:' + rid) + '"' + t.style + '><div class="accordeon-tete' + t.pale + '">' + esc(nom) + '</div>' +
      '<div class="accordeon-corps" hidden><div class="liste-blanche">' + xs.map(ligne).join('') + '</div></div></div>';
  };
  const html = RAYONS.map(r => groupe(String(r.id), r.nom)).join('') + groupe('', 'Sans catégorie');
  cible.innerHTML = html || '<div class="accordeon-item"><span class="texte-petit texte-pale">Rien à consommer bientôt.</span></div>';
  ouverts.forEach(k => { const t = [...cible.querySelectorAll('[data-cle]')].find(x => x.dataset.cle === k); if (t && !t.firstElementChild.classList.contains('ouvert')) toggleAccordeon(t.firstElementChild); });
}
