/* ============================================================
   LES PRIX — « En solde du … au … » (la 3e liste de Listes, « En spécial cette semaine » jusqu'au 2026-10-07) et la Liste d'achats
   « Par épicerie » (J-C, 2026-10-07; docs/RdG-08). Son histoire en deux temps : le jeudi, chercher des idées dans ce qui est en solde
   (la liste « En solde », dans Listes);
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
/* « 14 octobre », « 1er octobre » (le titre d'une liste des deux sacs : « Épicerie du 14 octobre ») */
function jourLong(v) {
  const m = String(dateCourte(v) || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? (+m[3] === 1 ? '1er' : String(+m[3])) + ' ' + MOIS[m[2] - 1] : '';
}
/* « au Super C », « à l'IGA » */
function chez(m) { const n = nomListe(m); return (/^[aeiouyàâäéèêëîïôöùûü]/i.test(n) ? 'à l\'' : 'au ') + n; }
/* L'épicerie d'une ligne de STOCK (col. L) : son ID; une vieille valeur écrite en texte retrouve le sien. */
const magasinDe = v => { v = String(v || '').trim(); return LISTES.Magasins.some(x => x.id === v) ? v : idListe('Magasins', v); };
const unitePoids = u => /lb|kg|100\s*g/i.test(String(u || '')) ? String(u) : '';   // un prix régulier : seulement l'unité au poids (« 2/ » vaut pour le solde)

/* LE PRIX CONNU d'un aliment dans chaque épicerie : { magasin: { source: 'solde' | 'paye' | 'regulier', prix, unite, regulier, marque,
   format, date, detail } }. Le solde de la semaine l'emporte (le meilleur au détail, s'il y en a deux); sinon le plus récent des prix payés
   et des prix réguliers vus en circulaire (à date égale : le payé). soldes : ceux à compter (la Liste d'épicerie cache ceux d'une marque
   qu'on ne rachète pas); sans : tous ceux de la semaine. */
function prixConnus(pid, soldes) {
  const par = {};
  (soldes || soldesDe(pid)).forEach(r => {
    const m = String(r[1]), x = { source: 'solde', prix: r[4], unite: r[6], regulier: r[5], marque: r[14], date: '',
      format: formatAffiche(formatCle(r[7])).replace(/(\d)x(\d)/g, '$1 x $2').replace(/ \+ /g, ' ou '), detail: prixAuDetail(r[4], r[6], r[7]) };
    const a = par[m];
    if (!a || (comparables([x.detail, a.detail]) && centsDe(x.detail) < centsDe(a.detail))) par[m] = x;
  });
  const autre = (m, x, plusTard) => { const a = par[m]; if (!a || (a.source !== 'solde' && (x.date > a.date || (plusTard && x.date === a.date)))) par[m] = x; };
  STOCK.forEach(l => {                                  // payé : [ID, Produit, Emp, Qte, Date, Marque, Format, …, Magasin (L), Prix (M)]
    if (String(l[1]) !== String(pid) || estReste(l)) return;   // le reste d'un pack entamé : son format n'est plus celui du prix payé
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

/* ---------- La Liste d'achats « Par épicerie » (décisions 13 à 19, 28, 30, 31, 34) ----------
   ⚠️ DÉBRANCHÉE le 2026-10-18 : « Par épicerie » quitte la Liste d'épicerie, mais son code reste (J-C : « On retire, mais efface rien car
   je ne suis pas certain » — RdG-06, section 6, décision 18). Rien ne l'appelle; la rebrancher = un bouton sur la page, qui la montre.
   COMME LA PAGE CIRCULAIRES (J-C, 2026-10-07 : « faudrait être cohérent… respecter ce qui a déjà été décidé dans les autres pages »;
   aperçu « Oui ») : les épiceries dont la circulaire est lue en tuiles, 2 colonnes — leur logo sur une carte blanche, sinon leur nom sur
   leur couleur —, le nombre dans le coin (là où se pose le point rouge sur Circulaires) = ce qu'on va chercher là; la plus garnie en
   premier. Une épicerie touchée (ouverte : son ID) : elle seule, en bannière, et TOUTE la liste en trois parties — Moins cher ici · Prix
   pareil ou inconnu · Moins cher ailleurs —, un bandeau par catégorie dans chacune; la bannière touchée ramène aux tuiles. La case
   seulement (cochée dans une, cochée partout). */
function htmlParEpicerie(items, ouverte) {
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
    const quand = it.main ? '' : it.auto === 'pas' ? '(pour réserve)' : it.auto === 'ouvert' ? '(dernier ouvert)' : '';   // le dernier ouvert (RdG-09)
    let d = quand ? '<div class="item-detail">' + quand + '</div>' : '';
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
      '<div class="boutons-ligne"><input class="case" type="checkbox" tabindex="-1"' + (it.coche ? ' checked' : '') + '></div></div>';
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
  const n = m => '<span class="nombre">' + compte[m] + '</span>';
  if (ouverte && mags.indexOf(ouverte) !== -1) {      // une épicerie touchée : elle seule, en bannière (sa circulaire éteinte entre-temps : les tuiles)
    const m = ouverte, tete = banniereMagasin(m, n(m));
    const corps = partie('Moins cher ici', items.filter(it => gagne[it.pid] === m), m) + partie('Prix pareil ou inconnu', items.filter(it => !gagne[it.pid]), m) +
                  partie('Moins cher ailleurs', items.filter(it => gagne[it.pid] && gagne[it.pid] !== m), m);
    return '<div class="accordeon" data-epicerie-ouverte>' + tete + '<div class="liste-blanche achats-groupe">' + corps + '</div></div>';
  }
  return '<div class="grille">' + mags.map(m => tuileMagasin(m, 'data-epicerie="' + esc(m) + '"', '', n(m))).join('') + '</div>';   // les tuiles de la page Circulaires, le nombre en plus
}

/* ---------- Listes → « En solde du 8 au 14 octobre 2026 » (décisions 2, 6, 20 à 23, 33) ----------
   Son titre (J-C, 2026-10-07 : « Remplacer "En spécial cette semaine" par "En solde du xx au xx 2026" ») : LA SEMAINE EN COURS, du
   jeudi au mercredi (J-C, le même soir : « on affiche que les soldes du jeudi au mercredi pour une semaine »). Avant : le plus tôt des
   débuts et le plus tard des fins — le cahier d'IGA, valide trois semaines, faisait dire « du 24 septembre au 14 octobre », et rien ne
   disait ce qui valait encore la semaine suivante. Ce qui est montré vaut cette semaine (un solde de plus longue durée aussi : « un
   solde c'est un solde »); jeudi, la nouvelle semaine remplace tout. Sans solde en cours : « En solde ». */
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
/* La semaine des circulaires : le jeudi d'avant (ou aujourd'hui), à l'heure du Québec, et le mercredi qui la finit. */
function semaineSoldes() {
  const a = dateDuJour().split('-').map(Number), jeudi = new Date(a[0], a[1] - 1, a[2]);
  jeudi.setDate(jeudi.getDate() - (jeudi.getDay() + 3) % 7);
  return { jeudi: jeudi, mercredi: new Date(jeudi.getFullYear(), jeudi.getMonth(), jeudi.getDate() + 6) };
}
function titreSoldes() {
  if (!SPECIAUX.some(soldeEnCours)) return 'En solde';
  const { jeudi, mercredi } = semaineSoldes();
  const d = [jeudi.getFullYear(), jeudi.getMonth() + 1, jeudi.getDate()], f = [mercredi.getFullYear(), mercredi.getMonth() + 1, mercredi.getDate()];
  const quand = x => (x[2] === 1 ? '1er' : String(x[2]));   // « 1er octobre »
  const de = quand(d) + (d[1] !== f[1] || d[0] !== f[0] ? ' ' + MOIS[d[1] - 1] : '') + (d[0] !== f[0] ? ' ' + d[0] : '');
  return 'En solde du ' + de + ' au ' + quand(f) + ' ' + MOIS[f[1] - 1] + ' ' + f[0];
}
/* Le jeudi, les idées : par catégorie, dans son ordre, fermées; dans chacune, ses Oui puis, plus pâles, ses Peut-être (une idée peut
   naître d'un Peut-être). Une ligne par aliment, ses épiceries dessous (la moins chère au détail en rouge); la flèche l'ajoute à la
   Liste d'achats, sinon « (déjà sur ta liste) ». Ce qui était ouvert le reste (on ajoute l'un après l'autre). */
function remplirSpecial() {
  const cible = $('liste-special');
  if (!cible) return;
  cible.previousElementSibling.textContent = titreSoldes();   // la barre dit les dates, ouverte ou fermée
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

/* ---------- LE + DES SOLDES (J-C, 2026-10-17 et 2026-10-18 : « je fouine et clique, ça se retrouve sur la liste; souvent ça influence
   les achats »; RdG-06, section 5 « Les soldes dans le + », et section 6, décisions 20, 23, 24, 26, 31, 32 — l'aperçu : « Oui ») ----------
   Le 3e bouton de la Liste d'épicerie (rouge, l'étiquette et son +) : UN MODE À PART, comme le + — rien ne va sur la liste avant le
   crochet, qui met tout d'un coup (chaque solde avec son épicerie : « Veau haché (Super C) ») et ramène à la liste; le X sort sans rien
   ajouter. En arrivant : les épiceries dont la circulaire est lue, en tuiles (le nombre de ses choisis dans le coin). Une touchée : sa
   bannière (touchée : retour aux tuiles, les choix restent — choix A), ses catégories fermées, une seule ouverte à la fois; TOUS ses
   soldes de la semaine sauf les Jamais (et une marque qu'on ne rachète pas : décision 10), une ligne par article — le rond du feu (vert
   Oui, jaune Peut-être, rien = pas encore trié; Oui d'abord), la marque, le format, le prix et le prix au 100 g —, la case au bout (C3) :
   toucher la ligne la choisit, retouchée elle ne l'est plus. Glissée vers la gauche (à l'abri des gros doigts, décision 32) : le crayon
   (sa catégorie — Flipp ne donne pas de rayon : « Eau de Cologne s'installe dans Boissons 😂 » —, retenue pour les semaines suivantes) et
   le rond rouge (Jamais, tout de suite, partout, comme au tri). Un article pas encore trié, choisi : « un Oui, sans le travail du tri » —
   aucune question ici; sur la liste sous son texte de circulaire, et au tri, le feu déjà au vert. Les articles viennent de la circulaire
   de l'épicerie, gardée sur l'appareil jusqu'au jeudi (chargerCirculaire, JS/epicerie.js : la même que les deux sacs). */
var SOLDES = { mag: '', choix: {} };                   // l'épicerie touchée; ce qui est choisi : { 'magasin|clé': { mag, l } }
const SOLDES_JAMAIS = { cles: {}, genres: {} };        // les Jamais donnés ici, en attendant que la circulaire relue les sache
function montrerSoldes() {
  SOLDES = { mag: '', choix: {} };
  toutCacher(); $('vue-soldes').hidden = false; $('btn-burger').hidden = false;
  $('soldes-liste').innerHTML = '';
  remplirSoldes();
  window.scrollTo(0, 0);
}
const epiceriesSoldes = () => LISTES.Magasins.filter(x => x.circ !== false && !x.introuvable).map(x => String(x.id));
const lignesCircDe = mag => EPI_CIRC_MAG === String(mag) ? EPI_CIRC : [];
const triCirc = l => l.tri && (l.tri.reponse === 'O' || l.tri.reponse === 'P') ? l.tri : null;
const pidCirc = l => { const t = triCirc(l); return t && t.produits && t.produits[0] ? String(t.produits[0]) : ''; };   // l'aliment auquel le tri l'a relié
const marqueCirc = l => { const t = triCirc(l); return t && t.marques && t.marques[0] ? t.marques[0] : l.marque || adoucir(l.marqueFlipp); };   // un ID, ou le texte de Flipp
const feuCirc = l => { const t = triCirc(l); return !t ? '' : t.reponse === 'O' ? 'oui' : 'peutetre'; };
function genresJamais() {                              // un Jamais vaut dans toutes les épiceries (par le genre, Tri col. L)
  const g = Object.assign({}, SOLDES_JAMAIS.genres);
  reponsesTri().forEach(r => { if ((r[2] === 'J' || r[2] === 'M') && r[11]) g[String(r[11])] = true; });
  return g;
}
const jamaisCirc = (l, jg) => !!(l.tri && (l.tri.reponse === 'J' || l.tri.reponse === 'M')) || !!SOLDES_JAMAIS.cles[l.cle] || !!(l.genre && jg[l.genre]);
/* Sa catégorie : corrigée au crayon, sinon celle de son aliment (trié), sinon celle que le coffre-fort a devinée (la circulaire, ou ce qui
   reste à trier), sinon « Autres ». */
function catSolde(l) {
  const o = catCirc(l.cle);
  if (o) return o;
  const pid = pidCirc(l), p = pid && PRODUITS.find(x => String(x.id) === pid);
  if (p && rayonDe(p.catId)) return rayonDe(p.catId);
  if (l.categorie) return String(l.categorie);
  const a = TRI && TRI.aTrier.find(x => String(x.cle) === String(l.cle) || (x.cles || []).map(String).indexOf(String(l.cle)) !== -1);
  return a && a.categorie ? String(a.categorie) : 'autres';
}
/* « Maître Saladier · 1 kg · 9,99 », dessous « 1,00 / 100 g »; « 2 pour 7 $ » : la condition, et le prix d'un seul. */
function detailSolde(l) {
  const c = prixSoldeCourt(l.prix, l.unite), d = prixAuDetail(l.prix, l.unite, l.format || l.description);
  const fmt = formatAffiche(l.format).replace(/(\d)x(\d)/g, '$1 x $2').replace(/ \+ /g, ' ou ') || adoucir(l.description, false);
  const avant = [nomListe(marqueCirc(l)), fmt, c.cond].filter(Boolean).map(esc).join(' · ');
  return (avant ? avant + ' · ' : '') + '<span class="solde-prix">' + esc(c.prix) + '</span>' + (d && d.val != null ? htmlUnite(d) : '');
}
function ligneSolde(l) {
  const feu = feuCirc(l), choisi = !!SOLDES.choix[SOLDES.mag + '|' + l.cle];
  return '<div class="glisse"><div class="item" data-solde="' + esc(l.cle) + '"><div class="item-info"><div class="item-nom">' +
      (feu ? '<span class="feu-point feu-point-' + feu + '"></span>' : '') + esc(adoucir(l.texte)) + '</div>' +
      '<div class="item-detail">' + detailSolde(l) + '</div></div>' +
      '<input class="case" type="checkbox" tabindex="-1"' + (choisi ? ' checked' : '') + '></div>' +
    '<div class="glisse-zone"><button class="crayon" type="button" data-solde-cat="' + esc(l.cle) + '" aria-label="Sa catégorie"></button>' +
      '<button class="jamais" type="button" data-solde-jamais="' + esc(l.cle) + '" aria-label="Jamais"></button></div></div>';
}
function remplirSoldes() {
  const cible = $('soldes-liste'), nombre = n => n ? '<span class="nombre">' + n + '</span>' : '';
  const choisis = (m, k) => Object.values(SOLDES.choix).filter(c => c.mag === m && (!k || groupeTri(catSolde(c.l)) === k)).length;
  if (!SOLDES.mag) {
    const mags = epiceriesSoldes();
    cible.innerHTML = mags.length ? '<div class="grille">' + mags.map(m => tuileMagasin(m, 'data-soldes-mag="' + esc(m) + '"', '', nombre(choisis(m)))).join('') + '</div>'
      : '<div class="accordeon-item"><span class="texte-petit texte-pale">Aucune circulaire lue cette semaine.</span></div>';
    return;
  }
  const m = SOLDES.mag, tG = cible.querySelector('[data-groupe] > .accordeon-tete.ouvert'), groupe = tG ? tG.parentElement.dataset.groupe : '';
  const jg = genresJamais(), rang = l => { const f = feuCirc(l); return f === 'oui' ? 0 : f === 'peutetre' ? 1 : 2; };
  const ls = lignesCircDe(m).filter(l => l && l.cle && !jamaisCirc(l, jg) && !(pidCirc(l) && marquePasAimee(pidCirc(l), marqueCirc(l))))
    .sort((a, b) => rang(a) - rang(b) || adoucir(a.texte).localeCompare(adoucir(b.texte), 'fr'));
  cible.innerHTML = '<div class="accordeon" data-soldes-banniere>' + banniereMagasin(m, nombre(choisis(m))) + '<div class="accordeon-corps">' +
    (ls.length ? htmlGroupesTri(ls, catSolde, ligneSolde, k => nombre(choisis(m, k)))
               : '<div class="accordeon-item"><span class="texte-petit texte-pale">Rien de lu dans sa circulaire cette semaine.</span></div>') + '</div></div>';
  const acc = [...cible.querySelectorAll('[data-groupe]')].find(a => a.dataset.groupe === groupe);
  if (acc) toggleAccordeon(acc.firstElementChild);     // la catégorie ouverte le reste : on choisit l'un après l'autre
}
/* Une épicerie touchée : sa circulaire (sur l'appareil jusqu'au jeudi : instantané — le chariot la 1re fois de la semaine), relue en
   arrière-plan; la page suit quand la relecture arrive, sauf sous le doigt. */
async function ouvrirEpicerieSoldes(mag) {
  const m = LISTES.Magasins.find(x => String(x.id) === String(mag));
  if (!m) return;
  await chargerCirculaire(m);
  if ($('vue-soldes').hidden) return;                  // parti ailleurs pendant la lecture
  SOLDES.mag = String(mag);
  $('soldes-liste').innerHTML = '';                    // ses catégories fermées en arrivant
  remplirSoldes();
  window.scrollTo(0, 0);
  if (EPI_CIRC_RELUE) EPI_CIRC_RELUE.then(() => redessinerSoldes(mag));
  categoriesPourSoldes(mag);
}
function redessinerSoldes(mag) {
  if ($('vue-soldes').hidden || SOLDES.mag !== String(mag) || $('soldes-liste').querySelector('.glisse.glissee, .glisse.glissant, [data-solde-cat-de]')) return;
  remplirSoldes();
}
/* TEMPORAIRE — tant que la circulaire d'une épicerie ne dit pas la catégorie de ses articles (api.gs, RdG-06, section 7) : celle que le
   tri connaît (lireTri, en arrière-plan, une fois), sinon « Autres ». À retirer quand ses lignes portent `categorie`. */
function categoriesPourSoldes(mag) {
  if (TRI || !EPI_CIRC.some(l => l && l.categorie === undefined)) return;
  lireTriEnFond();
  if (lectureTri) lectureTri.then(() => redessinerSoldes(mag));
}
function choisirSolde(cle) {
  const k = SOLDES.mag + '|' + cle, l = lignesCircDe(SOLDES.mag).find(x => String(x.cle) === String(cle));
  if (SOLDES.choix[k]) delete SOLDES.choix[k]; else if (l) SOLDES.choix[k] = { mag: SOLDES.mag, l: l };
  remplirSoldes();
}
/* Le crayon : le menu des catégories (« Autres » compris) à la place de la ligne, le X pour laisser tomber. */
function demanderCatSolde(cle) {
  remplirSoldes();                                     // une seule question à la fois
  const g = [...$('soldes-liste').querySelectorAll('.glisse')].find(x => x.firstElementChild.dataset.solde === String(cle));
  const l = lignesCircDe(SOLDES.mag).find(x => String(x.cle) === String(cle));
  if (!g || !l) return;
  const ici = groupeTri(catSolde(l)), opt = (v, n) => '<option value="' + esc(v) + '"' + (v === ici ? ' selected' : '') + '>' + esc(n) + '</option>';
  g.outerHTML = '<div class="accordeon-item question-choix" data-solde-cat-de="' + esc(cle) + '"><span>' + esc('La catégorie de « ' + adoucir(l.texte) + ' » :') + '</span>' +
    '<select class="champ" data-solde-rayon="' + esc(cle) + '">' + RAYONS.map(r => opt(String(r.id), r.nom)).join('') + opt('autres', 'Autres') + '</select>' +
    '<button class="bouton bouton-petit" type="button" data-action="non" data-solde-cat-non aria-label="Annuler"><span class="icone icone-non"></span></button></div>';
}
/* Choisie : l'article y passe, et y reste les semaines suivantes (retenu pour lui, CategoriesCirc). Instantané; l'envoi, sa propre file. */
function poserCatSolde(cle, rid) {
  cle = String(cle); rid = String(rid || '');
  ecrireAttenteCatCirc(lireAttenteCatCirc().concat([[idLocal(), cle, rid, dateDuJour(), localStorage.getItem(QUI) || '']]));
  CAT_CIRC[cle] = rid;
  const c = lireCache(); if (c) { (c.categoriesCirc = c.categoriesCirc || {})[cle] = rid; ecrireCache(c); }
  const r = RAYONS.find(x => String(x.id) === rid);
  avis('Dans « ' + (r ? r.nom : 'Autres') + ' »', 'succes');
  remplirSoldes();
  expedierCatCirc();
}
/* Le rond rouge : Jamais, tout de suite (le geste du tri, par la file des gestes) — il vaut partout et l'article ne revient plus. */
function jamaisSolde(cle) {
  const m = SOLDES.mag, l = lignesCircDe(m).find(x => String(x.cle) === String(cle));
  if (!l) return;
  const e = { action: 'trier', opId: 'tri-' + idLocal(), cles: [String(cle)], reponse: 'J', produits: [], code: '', qui: localStorage.getItem(QUI) || '', neufs: l.tri ? 0 : 1 };
  if (TRI) { const avant = TRI.aTrier.length; appliquerTri(e, TRI); e.neufs = avant - TRI.aTrier.length; garderTri(); }
  poserGeste(e);
  noterNbATrier(TRI ? TRI.aTrier.length : NB_A_TRIER - e.neufs);   // le point rouge de Circulaires suit
  l.tri = { reponse: 'J', produits: [], marques: [], saveurs: [], code: '' };
  SOLDES_JAMAIS.cles[String(cle)] = true;
  if (l.genre) SOLDES_JAMAIS.genres[String(l.genre)] = true;
  delete SOLDES.choix[m + '|' + cle];
  EPI_CIRC_TOUCHEE++; garderCirculaire();              // la circulaire gardée le sait (une relecture en route ne l'écrase pas)
  remplirSoldes();
}
/* Le crochet : chaque solde choisi sur la liste (Achats, Etat « solde », avec son épicerie et la fin du solde — sans fin connue : le
   mercredi de la semaine); un aliment mis de côté revient. Déjà choisi : rien de plus. */
function validerSoldes() {
  const w = semaineSoldes().mercredi, mercredi = [w.getFullYear(), String(w.getMonth() + 1).padStart(2, '0'), String(w.getDate()).padStart(2, '0')].join('-');
  const qui = localStorage.getItem(QUI) || '', auj = dateDuJour(), lignes = [];
  let n = 0;
  Object.values(SOLDES.choix).forEach(c => {
    const l = c.l, pid = pidCirc(l), cle = String(l.cle);
    if (ACHATS.some(r => achatActif(r) && r[4] === 'solde' && String(r[8]) === c.mag && String(r[10]) === cle && soldeEnCoursAchat(r, auj))) return;
    if (pid) lignesDeAliment(pid, 'plustard').forEach(r => { const x = r.slice(); x[7] = 'N'; lignes.push(x); });
    // Achats : ID · ProduitID · Marque · Saveur · Etat · Date · Qui · Actif · Magasin · Fin · Cle · Texte · Categorie · Prix · Regulier · Unite · Format
    lignes.push([idLocal(), pid, String(marqueCirc(l) || ''), '', 'solde', auj, qui, 'O', c.mag, String(dateCourte(l.fin) || '').slice(0, 10) || mercredi, cle,
                 String(l.texte || ''), catSolde(l), l.prix == null ? '' : l.prix, l.regulier == null ? '' : l.regulier, String(l.unite || ''), String(l.format || l.description || '')]);
    n++;
  });
  poserAchats(lignes);
  SOLDES = { mag: '', choix: {} };
  montrerAchats();
  if (n) avis(n + (n > 1 ? ' soldes' : ' solde') + ' sur la liste', 'succes');
}

/* LA CATÉGORIE D'UN ARTICLE DE CIRCULAIRE, CORRIGÉE AU CRAYON (décision 32) — onglet CategoriesCirc : A ID · B Cle · C Categorie · D Date
   · E Qui (la plus récente d'une clé l'emporte; « autres » = Autres). references.categoriesCirc = { clé : catégorie }; ce qui n'est pas
   encore parti (sa propre file, sans bruit, comme le journal des erreurs : un coffre-fort qui ne connaît pas encore l'onglet n'arrête
   rien) y est reposé. Elle sert ici, au tri (À trier) et sur la liste (un solde pas encore trié). */
const ATTENTE_CATCIRC = 'rdg_catcirc_attente';
let envoiCatCirc = false;
function lireAttenteCatCirc() { try { return JSON.parse(localStorage.getItem(ATTENTE_CATCIRC) || '[]') || []; } catch (e) { return []; } }
function ecrireAttenteCatCirc(l) { try { localStorage.setItem(ATTENTE_CATCIRC, JSON.stringify(l)); } catch (e) {} }
const catCirc = cle => CAT_CIRC[String(cle == null ? '' : cle)] || '';
function reposerCatCirc() { lireAttenteCatCirc().forEach(l => { CAT_CIRC[String(l[1])] = String(l[2]); }); }
async function expedierCatCirc() {
  if (envoiCatCirc || !Coffre.motDePasse()) return;
  envoiCatCirc = true;
  try {
    while (lireAttenteCatCirc().length) {
      const ligne = lireAttenteCatCirc()[0];
      let r = null;
      try { r = await Coffre.ajouter('CategoriesCirc', ligne, Coffre.DELAI_LECTURE); } catch (x) {}   // rejouable : son ID
      if (!(r && r.ok)) break;                          // réseau, ou l'onglet pas encore connu du coffre-fort : tout reste, ça repartira
      ecrireAttenteCatCirc(lireAttenteCatCirc().filter(l => l[0] !== ligne[0]));
    }
  } finally { envoiCatCirc = false; }
}

function initSoldes() {
  brancherGlisse($('soldes-liste'));
  $('soldes-liste').addEventListener('click', ev => {
    if (toucherGlisse($('soldes-liste'), ev)) return;   // la fin d'un glissement, ou une ligne glissée qui revient
    const t = ev.target.closest('[data-soldes-mag]');
    if (t) { ouvrirEpicerieSoldes(t.dataset.soldesMag); return; }
    if (ev.target.closest('[data-soldes-banniere] > .accordeon-tete')) {   // la bannière : retour aux épiceries, les choix restent
      SOLDES.mag = ''; $('soldes-liste').innerHTML = ''; remplirSoldes(); window.scrollTo(0, 0); return;
    }
    const c = ev.target.closest('[data-solde-cat]');
    if (c) { demanderCatSolde(c.dataset.soldeCat); return; }
    const j = ev.target.closest('[data-solde-jamais]');
    if (j) { jamaisSolde(j.dataset.soldeJamais); return; }
    if (ev.target.closest('[data-solde-cat-non]')) { remplirSoldes(); return; }
    if (ev.target.closest('[data-solde-cat-de]')) return;   // le menu de sa catégorie : il se choisit (change)
    const tete = ev.target.closest('.accordeon-tete');
    if (tete) { toggleAccordeon(tete); return; }
    const l = ev.target.closest('[data-solde]');
    if (l) choisirSolde(l.dataset.solde);
  });
  $('soldes-liste').addEventListener('change', ev => { const s = ev.target.closest('[data-solde-rayon]'); if (s) poserCatSolde(s.dataset.soldeRayon, s.value); });
  $('soldes-non').addEventListener('click', () => { SOLDES = { mag: '', choix: {} }; montrerAchats(); });
  $('soldes-oui').addEventListener('click', validerSoldes);
}
document.addEventListener('DOMContentLoaded', initSoldes);
