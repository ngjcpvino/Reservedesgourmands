/* ============================================================
   DONNÉES D'ESSAI — TEMPORAIRE (J-C, 2026-09-30 : « beaucoup de données, pour voir toutes les possibilités »).
   Le bouton « Données d'essai » d'Outils entre une septantaine d'aliments fictifs dans les VRAIS meubles,
   comme de vraies entrées (entrerArticle), pour le tour des listes.
   ⚠️ À RETIRER quand le tour des listes est fini : ce fichier, sa ligne <script> et le bouton #menu-essai de rdg.html.
   Les données, elles, partent avec le grand ménage d'avant les vraies entrées.

   Les cas couverts : un aliment sans marque ni saveur · une seule sorte · 2, 4 et 10 sortes · la même sorte en deux formats ·
   des unités mélangées · le même aliment à 2 endroits · un espace très chargé (15 épices) · posé sur un meuble, sans espace ·
   « Pas encore rangé » (une sorte, plusieurs) · des noms longs · il n'en reste plus · « pour réserve » · « Pas aimé ».

   À l'épreuve du reclic : chaque entrée a son jeton fixe (essai-1, essai-2…). Une entrée déjà dans STOCK n'est pas renvoyée,
   et le coffre-fort refuse un jeton déjà vu. Retoucher le bouton après une coupure reprend où ça s'est arrêté.
============================================================ */

/* [nom, sous-catégorie, sortes]; une sorte = [marque, saveur, format, lieux, 'pasaime'?];
   un lieu = [où, quantité, 'vide'?] — où : 'frigo.0' (l'espace 0 du frigo), 'frigo.porte', 'reserve.-' (sur le meuble, sans espace),
   '' (pas encore rangé). 'vide' : entré, puis mis à zéro (il n'en reste plus). 'pasaime' : une consommée, « Ne pas racheter ». */
const DONNEES_ESSAI = [
  ['Fromage', 'Fromages emballés', [
    ['Black Diamond', 'Cheddar fort', '400 g', [['frigo.1', 1]]],
    ['Black Diamond', 'Cheddar doux', '400 g', [['frigo.1', 1]]],
    ['Oka', '', '200 g', [['frigo.1', 1]]],
    ['Saputo', 'Mozzarella', '340 g', [['frigo.1', 2]]],
    ['Saputo', 'Mozzarella', '907 g', [['frigo.1', 1]]],
    ['Balderson', 'Cheddar 2 ans', '300 g', [['frigo.1', 1]]],
    ['Président', 'Brie', '200 g', [['frigo.1', 1]]],
    ['Krinos', 'Feta', '200 g', [['frigo.1', 1]]],
    ['Boursin', 'Ail et fines herbes', '150 g', [['frigo.1', 1]]],
    ['Perron', 'Cheddar vieilli', '250 g', [['frigo.1', 1]]],
    ['Kraft', 'Parmesan râpé', '250 g', [['frigo.1', 1]]]]],
  ['Yogourt', 'Yogourts', [
    ['Liberté', 'Fraise', '650 g', [['frigo.0', 2]]],
    ['Liberté', 'Vanille', '650 g', [['frigo.0', 1]]],
    ['Yoplait', 'Fraise', '650 g', [['frigo.0', 1]]],
    ['Yoplait', 'Fraise', '16 unité', [['frigo.0', 1]]],
    ['Oikos', 'Nature', '750 g', [['frigo.0', 2]], 'pasaime']]],
  ['Lait', 'Laits, crèmes et beurres', [
    ['Natrel', '', '2 L', [['frigo.porte', 2]]],
    ['Natrel', 'Sans lactose', '2 L', [['frigo.porte', 1, 'vide']]]]],
  ['Beurre', 'Laits, crèmes et beurres', [
    ['Lactantia', '', '454 g', [['frigo.porte', 1], ['congelo.0', 2]]]]],
  ['Crème', 'Laits, crèmes et beurres', [
    ['Natrel', '15 %', '473 ml', [['frigo.porte', 1]]],
    ['Natrel', '35 %', '473 ml', [['frigo.porte', 1, 'vide']]]]],
  ['Œufs', 'Œufs', [['', '', '12 unité', [['frigo.2', 2]]]]],

  ['Pomme', 'Fruits', [
    ['', 'McIntosh', '8 unité', [['frigo.3', 1]]],
    ['', 'Gala', '6 unité', [['', 1]]]]],
  ['Banane', 'Fruits', [['', '', '6 unité', [['', 1]]]]],
  ['Carotte', 'Légumes', [['', '', '907 g', [['frigo.3', 1]]]]],
  ['Laitue romaine', 'Légumes', [['', '', '1 unité', [['frigo.3', 2]]]]],
  ['Oignon', 'Légumes', [
    ['', 'Jaune', '2 kg', [['reserve.1', 1]]],
    ['', 'Rouge', '1 kg', [['reserve.1', 1]]]]],
  ['Pomme de terre', 'Légumes', [['', 'Russet', '5 kg', [['reserve.1', 1]]]]],
  ['Persil', 'Fines herbes fraîches', [['', 'Italien', '1 unité', [['frigo.3', 1, 'vide']]]]],

  ['Cannelle', 'Fines herbes, épices et sauces', [['Club House', 'Moulue', '37 g', [['gm.0', 1]]]]],
  ['Cumin', 'Fines herbes, épices et sauces', [['Club House', 'Moulu', '44 g', [['gm.0', 1]]]]],
  ['Paprika', 'Fines herbes, épices et sauces', [
    ['Club House', 'Fumé', '60 g', [['gm.0', 1]]],
    ['Club House', 'Doux', '53 g', [['gm.0', 1]]]]],
  ['Origan', 'Fines herbes, épices et sauces', [['Club House', '', '14 g', [['gm.0', 1]]]]],
  ['Thym', 'Fines herbes, épices et sauces', [['Club House', '', '17 g', [['gm.0', 1]]]]],
  ['Basilic', 'Fines herbes, épices et sauces', [['Épices de cru', '', '20 g', [['gm.0', 1]]]]],
  ['Poivre noir', 'Fines herbes, épices et sauces', [['Club House', 'Grains entiers', '110 g', [['gm.0', 1]]]]],
  ['Muscade', 'Fines herbes, épices et sauces', [['Épices de cru', 'Entière', '30 g', [['gm.0', 1]]]]],
  ['Curcuma', 'Fines herbes, épices et sauces', [['Club House', '', '42 g', [['gm.0', 1]]]]],
  ['Gingembre moulu', 'Fines herbes, épices et sauces', [['Club House', '', '33 g', [['gm.0', 1]]]]],
  ['Clou de girofle', 'Fines herbes, épices et sauces', [['Club House', 'Entier', '38 g', [['gm.0', 1]]]]],
  ['Piment de Cayenne', 'Fines herbes, épices et sauces', [['Club House', '', '35 g', [['gm.0', 1]]]]],
  ['Cari', 'Fines herbes, épices et sauces', [['Club House', 'Doux', '45 g', [['gm.0', 1]]]]],
  ['Romarin', 'Fines herbes, épices et sauces', [['Épices de cru', '', '15 g', [['gm.0', 1]]]]],
  ['Feuilles de laurier', 'Fines herbes, épices et sauces', [['Club House', '', '4 g', [['gm.0', 1]]]]],

  ['Farine', 'Ingrédients pour cuisson et préparation', [['', '', '2 kg', [['gm.1', 1]]]]],
  ['Sucre', 'Ingrédients pour cuisson et préparation', [['Lantic', 'Blanc', '2 kg', [['gm.1', 1], ['reserve.0', 2, 'vide']]]]],
  ['Poudre à pâte', 'Ingrédients pour cuisson et préparation', [['Magic', '', '225 g', [['gm.1', 1]]]]],
  ['Café', 'Café', [
    ['Van Houtte', 'Colombie', '300 g', [['gm.2', 1]]],
    ['Van Houtte', 'Colombie', '925 g', [['gm.2', 1], ['reserve.0', 1]]],
    ['Maxwell House', 'Original', '925 g', [['reserve.0', 2]]]]],
  ['Céréales', 'Céréales, tartinades et sirops', [
    ['Kellogg\'s', 'Corn Flakes', '750 g', [['gm.2', 2], ['reserve.0', 4, 'vide']]],
    ['Quaker', 'Gruau', '1 kg', [['gm.2', 1], ['reserve.0', 3]]]]],
  ['Beurre d\'arachide', 'Céréales, tartinades et sirops', [
    ['Kraft', 'Crémeux', '1 kg', [['gm.1', 1], ['reserve.0', 2]]],
    ['Kraft', 'Croquant', '1 kg', [['reserve.0', 1]]]]],
  ['Sirop d\'érable', 'Céréales, tartinades et sirops', [['Citadelle', 'Ambré', '540 ml', [['gm.1', 1], ['reserve.0', 3]]]]],
  ['Confiture', 'Céréales, tartinades et sirops', [
    ['Double Fruit', 'Fraises', '500 ml', [['frigo.2', 1]]],
    ['Double Fruit', 'Framboises', '500 ml', [['frigo.2', 1]]],
    ['Double Fruit', 'Bleuets', '500 ml', [['reserve.0', 2]]]]],
  ['Pâtes', 'Pâtes, riz et fèves', [
    ['Catelli', 'Spaghetti', '900 g', [['gm.3', 1], ['reserve.0', 3, 'vide']]],
    ['Catelli', 'Macaroni', '900 g', [['gm.3', 1]]],
    ['Catelli', 'Penne', '900 g', [['gm.3', 2]]],
    ['Barilla', 'Linguine', '500 g', [['gm.3', 1]]]]],
  ['Riz', 'Pâtes, riz et fèves', [['Uncle Ben\'s', 'Basmati', '2 kg', [['gm.3', 1]]]]],
  ['Sauce à spaghetti aux champignons et poivrons rouges grillés', 'Aliments en conserve et en pot', [
    ['Classico', '', '650 ml', [['gm.3', 2], ['reserve.1', 4]]]]],
  ['Tomates en dés assaisonnées à l\'italienne avec basilic, ail et origan', 'Aliments en conserve et en pot', [
    ['Aylmer', '', '796 ml', [['reserve.1', 6]]]]],
  ['Soupe', 'Aliments en conserve et en pot', [
    ['Campbell\'s', 'Tomate', '284 ml', [['reserve.1', 4]]],
    ['Campbell\'s', 'Poulet et nouilles', '284 ml', [['reserve.1', 3]]]]],
  ['Thon', 'Aliments en conserve et en pot', [['Clover Leaf', 'Pâle émietté', '170 g', [['reserve.1', 6]]]]],
  ['Huile d\'olive', 'Huiles et vinaigres', [['Bertolli', 'Extra vierge', '1 L', [['gm.3', 1]]]]],
  ['Vinaigre', 'Huiles et vinaigres', [['Heinz', 'Blanc', '4 L', [['reserve.-', 1]]]]],
  ['Ketchup', 'Condiments et garnitures', [['Heinz', '', '1 L', [['frigo.porte', 1, 'vide']]]]],
  ['Moutarde', 'Condiments et garnitures', [
    ['French\'s', 'Jaune', '400 ml', [['frigo.porte', 1]]],
    ['Maille', 'Dijon', '200 ml', [['frigo.porte', 1, 'vide']]]]],
  ['Mayonnaise', 'Condiments et garnitures', [['Hellmann\'s', 'Originale', '890 ml', [['frigo.2', 1, 'vide']]]]],
  ['Sauce soya', 'Gastronomie internationale', [['Kikkoman', 'Réduite en sodium', '591 ml', [['frigo.porte', 1]]]]],

  ['Jus d\'orange', 'Jus et boissons', [['Tropicana', 'Sans pulpe', '1 L', [['frigo.porte', 1], ['reserve.0', 2]]]]],
  ['Thé', 'Thés et boissons chaudes', [
    ['Red Rose', '', '72 unité', [['gm.2', 1]]],
    ['Tetley', 'Vert', '20 unité', [['gm.2', 1]]]]],
  ['Eau pétillante', 'Eau', [
    ['Perrier', 'Citron', '12 unité', [['', 1]]],
    ['Perrier', 'Nature', '12 unité', [['', 2]]]]],
  ['Bière', 'Bières et cidres', [
    ['Boréale', 'Rousse', '6 unité', [['reserve.-', 2]]],
    ['Boréale', 'IPA', '6 unité', [['reserve.-', 1]]]]],

  ['Poulet', 'Poulet et dinde', [
    ['', 'Poitrines', '1 kg', [['congelo.0', 3]]],
    ['', 'Cuisses', '1 kg', [['congelo.0', 2]]]]],
  ['Bœuf haché', 'Bœuf et veau', [['', 'Mi-maigre', '454 g', [['congelo.0', 4]]]]],
  ['Bacon', 'Saucisses et bacon', [['Maple Leaf', 'Fumé', '375 g', [['congelo.1', 2], ['frigo.2', 1]]]]],
  ['Saucisses', 'Saucisses et bacon', [
    ['Lafleur', 'Italiennes douces', '500 g', [['congelo.1', 1]]],
    ['Lafleur', 'Italiennes fortes', '500 g', [['congelo.1', 1]]]]],
  ['Saumon', 'Poissons frais', [['', 'Filets', '454 g', [['congelo.0', 2, 'vide']]]]],
  ['Crevettes', 'Fruits de mer frais', [['Sélection', 'Cuites', '340 g', [['congelo.0', 1]]]]],
  ['Jambon', 'Charcuteries', [['Olymel', 'Forêt-Noire', '175 g', [['frigo.2', 1]]]]],
  ['Crème glacée', 'Crème glacée et friandises', [
    ['Chapman\'s', 'Vanille', '2 L', [['congelo.1', 1]]],
    ['Chapman\'s', 'Chocolat', '2 L', [['congelo.1', 1]]],
    ['Coaticook', 'Érable', '1 L', [['congelo.1', 1]]]]],

  ['Pain tranché', 'Pains emballés', [
    ['POM', 'Blanc', '675 g', [['', 1]]],
    ['Bon Matin', 'Blé entier', '675 g', [['congelo.1', 2]]]]],
  ['Bagels', 'Viennoiseries, muffins et bagels', [['St-Viateur', 'Sésame', '6 unité', [['congelo.1', 2]]]]],
  ['Tortillas', 'Tortillas et pains plats', [['Old El Paso', 'Blé', '10 unité', [['gm.3', 1]]]]],
  ['Croustilles', 'Collations salées', [
    ['Lay\'s', 'Nature', '235 g', [['gm.3', 1]]],
    ['Lay\'s', 'Sel et vinaigre', '235 g', [['gm.3', 1]], 'pasaime'],
    ['Old Dutch', 'Ketchup', '220 g', [['gm.3', 2]]]]],
  ['Biscuits', 'Collations sucrées et bonbons', [['Christie', 'Oreo', '303 g', [['gm.3', 1]]]]],
  ['Amandes', 'Noix, graines et fruits', [['Kirkland', 'Nature', '1 kg', [['reserve.1', 1]]]]],

  ['Papier essuie-tout', 'Papier', [['Bounty', '', '6 unité', [['reserve.-', 1]]]]],
  ['Papier hygiénique', 'Papier', [['Cashmere', '', '12 unité', [['reserve.-', 2]]]]],
  ['Savon à vaisselle', 'Vaisselle', [['Palmolive', 'Original', '591 ml', [['menage.0', 1]]]]],
  ['Détergent à lessive', 'Lessive', [
    ['Tide', 'Original', '2 L', [['menage.0', 1]]],
    ['Tide', 'Sans parfum', '2 L', [['menage.0', 1]]]]],
  ['Sacs à ordures', 'Entretien général', [['Glad', 'Grand format', '40 unité', [['menage.1', 1]]]]]
];

/* Les meubles fictifs deviennent les VRAIS : trouvés par leur nom, sinon les meubles qui restent (les plus garnis d'espaces d'abord). */
const GENRES_ESSAI = { frigo: /frigo|r[ée]frig/i, congelo: /cong[ée]l/i, gm: /garde|manger|d[ée]pense/i,
                       reserve: /r[ée]serve/i, menage: /[ée]vier|lavabo|buanderie|m[ée]nage|lavage/i };
function meublesEssai() {
  const pris = {}, choix = {};
  Object.keys(GENRES_ESSAI).forEach(g => {
    const m = MEUBLES.find(x => !pris[x.id] && GENRES_ESSAI[g].test(x.nom));
    if (m) { choix[g] = m; pris[m.id] = true; }
  });
  const libres = MEUBLES.filter(x => !pris[x.id]).sort((a, b) => (ESPACES[b.id] || []).length - (ESPACES[a.id] || []).length);
  Object.keys(GENRES_ESSAI).forEach(g => { if (!choix[g]) choix[g] = libres.shift() || MEUBLES[0]; });
  return choix;
}
function endroitEssai(ou, choix) {
  if (!ou) return '';                                   // pas encore rangé
  const k = ou.split('.'), m = choix[k[0]], esp = ESPACES[m.id] || [];
  if (k[1] === '-' || !esp.length) return String(m.id);   // posé sur le meuble, sans espace
  if (k[1] === 'porte') return String((esp.find(e => /porte/i.test(e.nom)) || esp[esp.length - 1]).id);
  return String(esp[Number(k[1]) % esp.length].id);
}
function sousCatEssai(nom) {
  const toutes = [].concat(...Object.values(SOUSCATS));
  const sc = toutes.find(x => cleNom(x.nom) === cleNom(nom)) || toutes[0];
  return sc ? String(sc.id) : '';
}
/* Une marque ou une saveur : celle qui existe (même nom, sans accent ni majuscule), sinon créée au coffre-fort. */
async function nomEssai(L, nom) {
  if (!nom) return '';
  const deja = LISTES[L].find(x => cleNom(x.nom) === cleNom(nom));
  if (deja) return deja.id;
  const r = await Coffre.ajouter(L, ['', nom, 'O']);
  if (!r || !r.ok) throw new Error((r && r.erreur) || 'refus');
  const id = String(r.id);
  LISTES[L].push({ id: id, nom: nom }); NOMS_LISTES[id] = nom;
  const c = lireCache();
  if (c) { c.listes = c.listes || {}; c.listes[L] = (c.listes[L] || []).concat([[id, nom, 'O']]); ecrireCache(c); }
  return id;
}
function prixEssai(n) { return n % 3 ? ((n * 173) % 1200 / 100 + 1.99).toFixed(2).replace('.', ',') : ''; }

var essaiEnCours = false;
async function remplirEssai() {
  const btn = $('menu-essai');
  if (essaiEnCours) return;
  essaiEnCours = true; btn.disabled = true;
  const total = DONNEES_ESSAI.reduce((s, a) => s + a[2].length, 0);
  let fait = 0;
  const montre = () => { btn.textContent = 'Données d\'essai : ' + fait + ' / ' + total; };
  montre();
  try {
    if (await chargerReferences() !== true) throw new Error('réserve pas relue');   // à jour : ce qu'un 1er essai a déjà entré
    if (!MEUBLES.length || !Object.keys(SOUSCATS).length) throw new Error('aucun meuble ou aucune catégorie');
    const choix = meublesEssai(), qui = localStorage.getItem(QUI) || '';
    const magasins = LISTES.Magasins.map(x => x.id);
    let n = 0;
    for (const [nom, sc, sortes] of DONNEES_ESSAI) {
      let pid = (PRODUITS.find(p => nomNu(p.nom) === nomNu(nom)) || {}).id;
      for (const [marque, saveur, format, lieux] of sortes) {
        const op = 'essai-' + (++n);
        const deja = STOCK.find(r => String(r[7]) === op);
        if (deja) { pid = pid || deja[1]; fait++; montre(); continue; }    // déjà entré (un essai coupé en route)
        const m = await nomEssai('Marques', marque), sv = await nomEssai('Saveurs', saveur);
        const commun = { marque: m, format: format, saveur: sv, code: '', magasin: n % 5 ? (magasins[n % magasins.length] || '') : '',
                         prix: prixEssai(n), qui: qui, endroits: lieux.map(l => ({ emp: endroitEssai(l[0], choix), qte: l[1] })),
                         opId: op, nouveaux: [] };
        const r = await Coffre.entrerArticle(pid ? Object.assign({ produitId: pid }, commun)
                                                 : Object.assign({ produit: [nom, sousCatEssai(sc)] }, commun));
        if (!r || !r.ok) throw new Error((r && r.erreur) || 'refus');
        pid = pid || r.produitId;
        fait++; montre();
      }
    }
    if (await chargerReferences() !== true) throw new Error('réserve pas relue');   // les lignes neuves, avec leur ID
    // « Il n'en reste plus » et « pour réserve » : ces lignes-là tombent à zéro (un seul envoi)
    const modifs = [], date = dateDuJour();
    n = 0;
    DONNEES_ESSAI.forEach(a => a[2].forEach(s => {
      const op = 'essai-' + (++n);
      s[3].forEach(l => {
        if (l[2] !== 'vide') return;
        const emp = endroitEssai(l[0], choix);
        STOCK.filter(r => String(r[7]) === op && String(r[2] || '') === emp && Number(r[3]) > 0 && r[0]).forEach(r => {
          const ligne = r.slice(); ligne[4] = dateCourte(ligne[4]); ligne[3] = 0;
          modifs.push({ id: String(r[0]), ligne: ligne });
        });
      });
    }));
    if (modifs.length) poserGeste({ action: 'deplacer', opId: 'essai-vides', modifs: modifs, ajouts: [] });
    // « Pas aimé » : une consommée, avec la case « Ne pas racheter »
    n = 0;
    DONNEES_ESSAI.forEach(a => a[2].forEach(s => {
      const op = 'essai-' + (++n);
      if (s[4] !== 'pasaime') return;
      const r = STOCK.find(x => String(x[7]) === op && Number(x[3]) > 0 && x[0]);
      if (!r || estPasAime(r[1], String(r[5] || '').trim(), String(r[9] || '').trim())) return;
      const ligne = r.slice(); ligne[4] = dateCourte(ligne[4]); ligne[3] = Number(r[3]) - 1;
      poserGeste({ action: 'consommer', opId: op + '-conso', sortie: ['', r[1], r[2], 1, date, r[5], r[6], r[9], qui, op + '-conso'],
                   modifs: [{ id: String(r[0]), ligne: ligne }], ajouts: [], pasAime: ['', r[1], r[5], r[9], date, qui] });
    }));
    if (!$('vue-listes').hidden) remplirInventaire();
    if (!$('vue-achats').hidden) remplirAchats();
    btn.textContent = 'Données d\'essai entrées';
    avis('Données d\'essai entrées', 'succes');
  } catch (e) {
    btn.textContent = 'Données d\'essai : continuer';
    avis('Essai arrêté à ' + fait + ' / ' + total + ' (' + e.message + ') — retouche pour continuer', 'erreur');
  } finally {
    essaiEnCours = false; btn.disabled = false;
  }
}
$('menu-essai').addEventListener('click', remplirEssai);
