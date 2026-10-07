/* ============================================================
   LES PRIX — « En spécial cette semaine » et la Liste d'achats « Par épicerie » (J-C, 2026-10-07; docs/RdG-08).
   Son histoire en deux temps : le jeudi, chercher des idées dans ce qui est en solde (En spécial cette semaine, dans Listes);
   la liste faite, savoir quoi acheter où (la Liste d'achats, Par épicerie).
   · Le prix au 100 g, au 100 ml, à l'unité — comme l'étiquette des tablettes (décision 25) — écrit sous chaque prix, sur sa
     propre ligne, en petit (décisions 24, 32). Sans format : « (format ?) », jamais en rouge (décision 26).
   · Le prix CONNU d'un aliment dans une épicerie (décision 31) : son solde de la semaine, sinon le dernier prix connu — payé
     (STOCK col. M, l'épicerie col. L) ou régulier (les circulaires des semaines passées : references.prixReguliers) —, daté.
   Les sites des épiceries refusent l'app (RdG-05, section 7) : ce sont nos deux sources. Tout se calcule en mémoire, aucun appel.
============================================================ */

/* Le contenu d'un format, dans sa base : 450 g → { qte: 450, base: 'g' }; 2 L → 2000 ml; 12 x 200 ml → 2400 ml; 6 unité, paq. de 6
   → 6 u. Plusieurs formats différents (une circulaire « choix varié » : 400 g + 500 g) ou un écart (1-1,5 kg) : null — on ne devine pas. */
const BASES_FORMAT = { kg: ['g', 1000], g: ['g', 1], mg: ['g', 0.001], lb: ['g', 453.59237], oz: ['g', 28.349523], l: ['ml', 1000], ml: ['ml', 1] };
function contenuFormat(t) {
  t = String(t || '').toLowerCase().replace(/(\d),(\d)/g, '$1.$2');
  const re = /(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*(kg|mg|ml|lbs?|oz|g|litres?|l)(?![\p{L}])|(\d+(?:\.\d+)?)(\s*(?:-|à)\s*\d+(?:\.\d+)?)?\s*(kg|mg|ml|lbs?|oz|g|litres?|l)(?![\p{L}])/gu;
  const vus = [];
  let m;
  while ((m = re.exec(t))) {
    if (m[5]) return null;                                         // « 1-1,5 kg » : un écart
    const u = String(m[3] || m[6]).replace(/s$/, '').replace(/^litre$/, 'l'), b = BASES_FORMAT[u];
    vus.push({ qte: (m[1] ? Number(m[1]) * Number(m[2]) : Number(m[4])) * b[1], base: b[0] });
  }
  if (vus.length) return vus.every(v => v.base === vus[0].base && Math.abs(v.qte - vus[0].qte) < 0.5) ? vus[0] : null;
  // ce qui se compte : « 6 unité » (la fiche), « 6 un. », « paq. de 6 », « 6/paq. », « douzaine »
  const n = (t.match(/(\d+)\s*(?:unités?|un\.?)(?![\p{L}])/u) || t.match(/paq(?:uets?)?\.?\s*(?:de\s*)?(\d+)/u) || t.match(/(\d+)\s*(?:\/|par)\s*paq/u) || [])[1];
  if (n) return { qte: Number(n), base: 'u' };
  const dz = t.match(/(\d+)?\s*douzaines?(?![\p{L}])/u);
  if (dz) return { qte: 12 * (Number(dz[1]) || 1), base: 'u' };
  return null;
}
/* Le prix au détail : { val, base } — val au 100 g, au 100 ml ou à l'unité; val null = le format manque (« (format ?) »).
   null : pas de prix. L'unité de la circulaire : « /lb », « /kg », « le 100 g » (au poids : le format n'y fait rien), « 2/ » (2 pour ce prix). */
function prixAuDetail(prix, unite, format) {
  let p = Number(String(prix == null ? '' : prix).trim().replace(',', '.'));
  if (!(p > 0)) return null;
  const u = String(unite || '').toLowerCase();
  if (/\/\s*lbs?(?![\p{L}])/u.test(u)) return { val: p / 4.5359237, base: 'g' };
  if (/\/\s*kg(?![\p{L}])/u.test(u)) return { val: p / 10, base: 'g' };
  if (/100\s*g(?![\p{L}])/u.test(u)) return { val: p, base: 'g' };
  p = p / (Number((u.match(/(\d+)\s*\//) || [])[1]) || 1);
  const c = contenuFormat(format);
  if (!c || !c.qte) return { val: null, base: '' };
  return { val: c.base === 'u' ? p / c.qte : p / c.qte * 100, base: c.base };
}
const BASE_TEXTE = { g: '100 g', ml: '100 ml', u: 'unité' };
function texteUnite(d) {                              // « 0,28 / 100 g » · « 0,83 / unité » · « (format ?) »
  if (!d || d.val == null) return '(format ?)';
  return d.val.toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' / ' + BASE_TEXTE[d.base];
}
const centsDe = d => Math.round(d.val * 100);         // on compare ce qu'on voit, au cent près
/* Des prix qu'on peut comparer : tous ont leur prix au détail, dans la même base. Sinon, c'est comme une égalité : personne en rouge. */
const comparables = ds => ds.length > 0 && ds.every(d => d && d.val != null && d.base === ds[0].base);
const htmlUnite = d => '<span class="prix-unite">' + esc(texteUnite(d)) + '</span>';

/* « 3 oct. » (un prix payé, un prix régulier : sa date) */
function jourCourt(v) {
  const m = String(dateCourte(v) || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? new Date(+m[1], +m[2] - 1, +m[3]).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' }) : '';
}
/* « au Super C », « à l'IGA » */
function chez(m) { const n = nomListe(m); return (/^[aeiouyàâäéèêëîïôöùûü]/i.test(n) ? 'à l\'' : 'au ') + n; }
/* L'épicerie d'une ligne de STOCK (col. L) : son ID; une vieille valeur écrite en texte retrouve le sien. */
const magasinDe = v => { v = String(v || '').trim(); return LISTES.Magasins.some(x => x.id === v) ? v : idListe('Magasins', v); };
const unitePoids = u => /lb|kg|100\s*g/i.test(String(u || '')) ? String(u) : '';   // un prix régulier : seulement l'unité au poids (« 2/ » vaut pour le solde)

/* LE PRIX CONNU d'un aliment dans chaque épicerie : { magasin: { source: 'solde' | 'paye' | 'regulier', prix, unite, regulier, marque,
   format, date, detail } }. Le solde de la semaine l'emporte (le meilleur au détail, s'il y en a deux); sinon le plus récent des prix payés
   et des prix réguliers vus en circulaire (à date égale : le payé). */
function prixConnus(pid) {
  const par = {};
  soldesDe(pid).forEach(r => {
    const m = String(r[1]), x = { source: 'solde', prix: r[4], unite: r[6], regulier: r[5], marque: r[14], date: '',
      format: formatAffiche(formatCle(r[7])).replace(/(\d)x(\d)/g, '$1 x $2').replace(/ \+ /g, ' ou '), detail: prixAuDetail(r[4], r[6], r[7]) };
    const a = par[m];
    if (!a || (comparables([x.detail, a.detail]) && centsDe(x.detail) < centsDe(a.detail))) par[m] = x;
  });
  const autre = (m, x, plusTard) => { const a = par[m]; if (!a || (a.source !== 'solde' && (x.date > a.date || (plusTard && x.date === a.date)))) par[m] = x; };
  STOCK.forEach(l => {                                  // payé : [ID, Produit, Emp, Qte, Date, Marque, Format, …, Magasin (L), Prix (M)]
    if (String(l[1]) !== String(pid)) return;
    const m = magasinDe(l[11]), d = prixAuDetail(l[12], '', l[6]);
    if (m && d) autre(m, { source: 'paye', prix: l[12], unite: '', regulier: '', marque: l[5], format: String(l[6] || ''), date: String(dateCourte(l[4]) || '').slice(0, 10), detail: d }, true);
  });
  PRIX_REGULIERS.forEach(r => {                         // [ProduitID, Magasin, Regulier, Unite, Description, Date, Marque]
    if (String(r[0]) !== String(pid)) return;
    const m = magasinDe(r[1]), u = unitePoids(r[3]), d = prixAuDetail(r[2], u, r[4]);
    if (m && d) autre(m, { source: 'regulier', prix: r[2], unite: u, regulier: '', marque: r[6],
      format: formatAffiche(formatCle(r[4])).replace(/(\d)x(\d)/g, '$1 x $2').replace(/ \+ /g, ' ou '), date: String(dateCourte(r[5]) || '').slice(0, 10), detail: d }, false);
  });
  return par;
}
/* L'épicerie où l'aliment est le moins cher (le nombre sur sa bannière : ce qu'on va chercher là), sinon '' (prix pareil ou inconnu) :
   · aucun prix connu : '';
   · un seul : un solde l'emporte (un solde est sous le prix régulier); un prix payé ou régulier seul ne se compare à rien;
   · plusieurs : le moins cher au détail, s'il est seul à ce prix et que tous se comparent (même base, aucun « format ? »). */
function moinsCher(par, mags) {
  const k = mags.filter(m => par[m]);
  if (k.length === 1) return par[k[0]].source === 'solde' ? k[0] : '';
  if (!comparables(k.map(m => par[m].detail))) return '';
  const c = k.map(m => centsDe(par[m].detail)), min = Math.min(...c);
  return c.filter(x => x === min).length === 1 ? k[c.indexOf(min)] : '';
}
/* Une ligne de prix : « Catelli · 250 g · 2,49 (3,99) » (court : « 2,49 (3,99) »), « · payé le 3 oct. », « · régulier, vu le 19 sept. »;
   dessous, en petit, le prix au détail. */
function lignePrix(avant, x, court, rouge) {
  const t = (court ? [] : [nomListe(x.marque), x.format]).concat([prixAvecUnite(x.prix, x.unite) + (x.regulier ? ' (' + textePrix(x.regulier) + ')' : '')])
    .filter(Boolean).join(' · ') + (x.source === 'paye' ? ' · payé le ' + jourCourt(x.date) : x.source === 'regulier' ? ' · régulier, vu le ' + jourCourt(x.date) : '');
  return '<div class="item-detail' + (rouge ? ' solde-meilleur' : '') + '">' + esc(avant + t) + htmlUnite(x.detail) + '</div>';
}

/* ---------- La Liste d'achats « Par épicerie » (décisions 13 à 19, 28, 30, 31) ----------
   Les épiceries dont la circulaire est lue, en bannières à leur logo (sinon leur barre à leur couleur), le nombre à droite = ce qu'on va
   chercher là; la plus garnie en premier. Ouverte, une épicerie montre TOUTE la liste en trois parties — Moins cher ici · Prix pareil ou
   inconnu · Moins cher ailleurs —, un bandeau par catégorie dans chacune. La case seulement (cochée dans une, cochée partout). */
function htmlParEpicerie(items) {
  const mags = LISTES.Magasins.filter(x => x.circ !== false && !x.introuvable).map(x => x.id);
  if (!mags.length) return '<div class="accordeon-item"><span class="texte-petit texte-pale">Aucune circulaire lue cette semaine.</span></div>';
  const prix = {}, gagne = {}, compte = {};
  items.forEach(it => { prix[it.pid] = prixConnus(it.pid); gagne[it.pid] = moinsCher(prix[it.pid], mags); });
  mags.forEach(m => { compte[m] = items.filter(it => gagne[it.pid] === m).length; });
  mags.sort((a, b) => compte[b] - compte[a] || nomListe(a).localeCompare(nomListe(b), 'fr'));
  const pDe = pid => PRODUITS.find(p => String(p.id) === String(pid)) || {};
  const rang = pid => { const p = pDe(pid), rid = rayonDe(p.catId); return [rid ? RAYONS.findIndex(r => String(r.id) === rid) : RAYONS.length, (SOUSCATS[rid] || []).findIndex(sc => String(sc.id) === String(p.catId))]; };
  const ordre = (a, b) => { const x = rang(a.pid), y = rang(b.pid); return x[0] - y[0] || x[1] - y[1] || String(pDe(a.pid).nom || '').localeCompare(String(pDe(b.pid).nom || ''), 'fr'); };
  const ligne = (it, m) => {
    const par = prix[it.pid], g = gagne[it.pid], ici = par[m];
    let d = it.auto === 'pas' && !it.main ? '<div class="item-detail">(pour réserve)</div>' : '';
    if (g === m) d += lignePrix('', ici, false, true) + mags.filter(o => o !== m && par[o]).map(o => lignePrix('aussi ' + chez(o) + ' : ', par[o], true)).join('');
    else if (g) d += lignePrix(chez(g) + ' : ', par[g], false) + (ici ? lignePrix(ici.source === 'solde' ? 'ici aussi : ' : 'ici : ', ici, true) : '');
    else {
      const autres = mags.filter(o => o !== m && par[o]);
      if (ici) d += lignePrix('ici : ', ici, false);
      d += autres.map(o => lignePrix(chez(o) + ' : ', par[o], false)).join('');
      if (!ici && autres.length) d += '<div class="item-detail">ici : prix inconnu</div>';
      if (!ici && !autres.length && it.sortes.length) d += '<div class="item-detail">' + esc(it.sortes.join(' · ')) + '</div>';
    }
    return '<div class="item achat' + (it.coche ? ' achat-coche' : '') + '" data-achat="' + esc(it.cle) + '">' +
      '<div class="item-info"><div class="item-nom">' + esc(pDe(it.pid).nom || '') + '</div>' + d + '</div>' +
      '<div class="achat-boutons"><input class="case" type="checkbox" tabindex="-1"' + (it.coche ? ' checked' : '') + '></div></div>';
  };
  const partie = (titre, xs, m) => {
    if (!xs.length) return '';
    let h = '<div class="partie">' + titre + '</div>', rid = null;
    xs.sort(ordre).forEach(it => {
      const r = rayonDe(pDe(it.pid).catId);
      if (r !== rid) { rid = r; const ry = RAYONS.find(x => String(x.id) === r); h += '<div class="espace-bandeau"' + teinteCategorie(r).style + '>' + esc(ry ? ry.nom : 'Sans catégorie') + '</div>'; }
      h += ligne(it, m);
    });
    return h;
  };
  return mags.map(m => {
    const logo = styleLogo(m), t = teinteMagasin(m), n = '<span class="nombre">' + compte[m] + '</span>';
    const tete = logo ? '<div class="accordeon-tete banniere"><span class="logo"' + logo + ' aria-label="' + esc(nomListe(m)) + '"></span>' + n + '</div>'
                      : '<div class="accordeon-tete' + t.pale + '"' + t.style + '><span>' + esc(nomListe(m)) + '</span>' + n + '</div>';
    const corps = partie('Moins cher ici', items.filter(it => gagne[it.pid] === m), m) + partie('Prix pareil ou inconnu', items.filter(it => !gagne[it.pid]), m) +
                  partie('Moins cher ailleurs', items.filter(it => gagne[it.pid] && gagne[it.pid] !== m), m);
    return '<div class="accordeon" data-groupe="' + esc('m:' + m) + '">' + tete + '<div class="liste-blanche achats-groupe" hidden>' + corps + '</div></div>';
  }).join('');
}

/* ---------- Listes → « En spécial cette semaine » (décisions 2, 6, 20 à 23) ----------
   Le jeudi, les idées : par catégorie, dans son ordre, fermées; dans chacune, ses Oui puis, plus pâles, ses Peut-être (une idée peut
   naître d'un Peut-être). Une ligne par aliment, ses épiceries dessous (la moins chère au détail en rouge); la flèche l'ajoute à la
   Liste d'achats, sinon « (déjà sur ta liste) ». Ce qui était ouvert le reste (on ajoute l'un après l'autre). */
function remplirSpecial() {
  const cible = $('liste-special');
  if (!cible) return;
  const ouverts = [...cible.querySelectorAll('[data-cle] > .ouvert')].map(t => t.parentElement.dataset.cle);
  const rep = {}, surListe = {};
  SPECIAUX.forEach(r => {
    if (!soldeEnCours(r) || !PRODUITS.some(p => String(p.id) === String(r[2]))) return;
    const pid = String(r[2]);
    if (rep[pid] !== 'O') rep[pid] = r[13] === 'O' ? 'O' : 'P';    // un seul Oui suffit : l'aliment est un Oui
  });
  lignesAchats().forEach(it => { surListe[it.pid] = true; });
  const groupes = {};
  Object.keys(rep).forEach(pid => { const p = PRODUITS.find(x => String(x.id) === pid); const rid = rayonDe(p.catId); (groupes[rid] = groupes[rid] || []).push(p); });
  const ligne = p => {
    const sur = surListe[String(p.id)], h = htmlSoldes(p.id);
    return '<div class="item' + (rep[String(p.id)] === 'P' ? ' peut-etre' : '') + '"><div class="item-info"><div class="item-nom">' + esc(p.nom) + '</div>' +
      (sur ? '<div class="item-detail">(déjà sur ta liste)</div>' : '') + '</div>' +
      (sur ? '' : '<button class="remettre" type="button" data-special-ajouter="' + esc(p.id) + '" aria-label="Ajouter à la liste"></button>') +
      (h ? '<div class="soldes-ligne">' + h + '</div>' : '') + '</div>';
  };
  const groupe = (rid, nom) => {
    const ps = groupes[rid];
    if (!ps) return '';
    ps.sort((a, b) => (rep[String(a.id)] === 'O' ? 0 : 1) - (rep[String(b.id)] === 'O' ? 0 : 1) || String(a.nom).localeCompare(String(b.nom), 'fr'));
    const t = teinteCategorie(rid);
    return '<div class="accordeon" data-cle="' + esc('c:' + rid) + '"' + t.style + '><div class="accordeon-tete' + t.pale + '">' + esc(nom) + '</div>' +
      '<div class="accordeon-corps" hidden><div class="liste-blanche">' + ps.map(ligne).join('') + '</div></div></div>';
  };
  const html = RAYONS.map(r => groupe(String(r.id), r.nom)).join('') + groupe('', 'Sans catégorie');
  cible.innerHTML = html || '<div class="accordeon-item"><span class="texte-petit texte-pale">Rien en circulaire cette semaine.</span></div>';
  ouverts.forEach(k => { const t = [...cible.querySelectorAll('[data-cle]')].find(x => x.dataset.cle === k); if (t && !t.firstElementChild.classList.contains('ouvert')) toggleAccordeon(t.firstElementChild); });
}
/* La flèche : l'aliment va sur la Liste d'achats (mis de côté : il revient). Sa catégorie reste ouverte. */
function ajouterDepuisSpecial(pid) {
  const nom = (PRODUITS.find(x => String(x.id) === String(pid)) || {}).nom || '';
  if (surLaListe(pid)) avis('Sur la liste : ' + nom, 'succes'); else avis('Déjà sur la liste : ' + nom);
  remplirSpecial();
}
