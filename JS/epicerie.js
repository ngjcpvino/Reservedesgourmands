/* ============================================================
   TOUTE L'ÉPICERIE — Entrer (rdg.html, les deux sacs). Décisions : docs/RdG-01-entree.md, section 3 bis
   (J-C, 2026-10-02, réflexion et aperçus). Utilise les fonctions d'entree.js (chargé avant).
   Les deux sacs → l'épicerie → le scan en rafale. Chaque article entre TOUT DE SUITE dans STOCK, à sa place habituelle
   (l'Escale s'il n'en a pas), avec l'épicerie, qui, et le prix de la circulaire quand il y en a un; l'envoi part par la
   file des gestes (action « entrer », rejouable par son jeton). Une liste par épicerie (onglet Epiceries; STOCK col. N) :
   tant qu'elle n'est pas close (Compléter, à venir), ce qui vient de la même épicerie s'y ajoute.
   Au scan, le code est cherché dans cet ordre : Stock → Tri → (un appel) les circulaires d'IGA, puis Open Food Facts → rien.
   La circulaire de l'épicerie, lue une fois au début : un article d'IGA dont le code y est = son prix, sans question; chez
   Super C et Metro (aucun code dans leurs circulaires), la ligne qui ressemble est montrée au complet, avec « L'associer à ce
   produit ? » Oui / Non — répondre accepte l'article (choix C de J-C). Oui : le code se colle à la ligne (onglet Tri) et le
   prix payé se remplit.
============================================================ */
var EPI = null;              // la liste en cours : { id, magasin, nom }
var EPI_CIRC = [];           // la circulaire de la semaine de cette épicerie (circulaireMagasin)
var EPI_CARTE = null;        // l'article à l'écran : { code, pid, nouveau, marque, saveur, format, photo, ligne, auto, sansCode }
var EPI_REFUS = {};          // « Non » à une ligne de la circulaire, pour ce produit : on ne la repropose plus pendant cette épicerie
var EPI_HABITUELS = [];      // les habituels sans code affichés (Sans code)
var epiJeton = 0;            // un code qui cherche encore quand on passe à autre chose : sa réponse ne compte plus
const EPI_CACHE_CIRC = 'rdg_circ_epicerie';   // { magasin, jour, lignes } : rouvrir la même épicerie le même jour = instantané
const EPI_CAMERA = { video: 'epi-video', msg: 'epi-msg', lu: c => surCodeEpicerie(c) };

/* ---------- 1. L'épicerie ---------- */
function montrerEpiceries() {
  toutCacher(); $('vue-epicerie').hidden = false; $('btn-burger').hidden = false;
  EPI = null; EPI_CARTE = null; epiJeton++;
  $('epi-titre').textContent = "Toute l'épicerie";
  montrer('epi-choix', true); montrer('epi-scan', false);
  remplirEpiceries();
  window.scrollTo(0, 0);
}
const listeOuverte = mag => EPICERIES.find(r => String(r[1]) === String(mag) && String(r[3]) !== 'C');
const lignesEpicerie = id => STOCK.filter(r => String(r[13] || '') === String(id));
const nbArticles = id => lignesEpicerie(id).reduce((s, r) => s + (Number(r[3]) || 0), 0);
const articles = n => n + ' article' + (n > 1 ? 's' : '');
/* Une barre par magasin, à SA couleur (comme la page Magasins). Une liste pas encore close : « En cours » ou « À compléter » (Terminé touché). */
function remplirEpiceries() {
  const xs = LISTES.Magasins.slice().sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
  $('epi-magasins').innerHTML = xs.map(x => {
    const l = listeOuverte(x.id), t = teinteMagasin(x.id);
    const note = l ? (String(l[3]) === 'T' ? 'À compléter' : 'En cours') + ' (' + articles(nbArticles(l[0])) + ')' : '';
    return '<div class="accordeon" data-epi-magasin="' + esc(x.id) + '"><div class="accordeon-tete' + t.pale + '"' + t.style + '><span>' + esc(x.nom) + '</span></div>' +
      (note ? '<div class="note-barre">' + esc(note) + '</div>' : '') + '</div>';
  }).join('') || '<div class="accordeon-item"><span class="texte-petit texte-pale">Aucun magasin : ajoute-les dans Gérer les bases → Magasins</span></div>';
}
/* L'épicerie touchée : sa liste pas encore close, ou une nouvelle (instantanée : elle part dans la file); puis sa circulaire. */
async function choisirEpicerie(mag) {
  const m = LISTES.Magasins.find(x => String(x.id) === String(mag));
  if (!m) return;
  let l = listeOuverte(mag);
  if (!l) {
    l = [idLocal(), String(mag), dateDuJour(), 'O', localStorage.getItem(QUI) || ''];   // Epiceries : ID · Magasin · Date · Etat · Qui
    poserGeste({ action: 'creer', table: 'Epiceries', opId: 'epi-' + l[0], ligne: l });  // EPICERIES la reçoit tout de suite
  }
  EPI = { id: String(l[0]), magasin: String(mag), nom: m.nom };
  EPI_REFUS = {};
  await chargerCirculaire(m);
  if (EPI && EPI.magasin === String(mag)) montrerScanEpicerie();
}
/* La circulaire de la semaine de cette épicerie : un appel (le chariot), gardé pour la journée. Interrupteur à Non, ou pas de
   réseau : on scanne quand même, sans elle. */
async function chargerCirculaire(m) {
  EPI_CIRC = [];
  const jour = dateDuJour();
  try {
    const c = JSON.parse(localStorage.getItem(EPI_CACHE_CIRC) || 'null');
    if (c && c.magasin === String(m.id) && c.jour === jour) { EPI_CIRC = c.lignes || []; return; }
  } catch (e) {}
  if (m.circ === false) return;
  montrerVoile(true);
  try {
    const r = await Coffre.circulaireMagasin(String(m.id));
    if (r && r.ok) { EPI_CIRC = r.lignes || []; garderCirculaire(); }
  } catch (e) { /* réseau : sans la circulaire */ }
  finally { montrerVoile(false); }
}
function garderCirculaire() {
  if (!EPI) return;
  try { localStorage.setItem(EPI_CACHE_CIRC, JSON.stringify({ magasin: EPI.magasin, jour: dateDuJour(), lignes: EPI_CIRC })); } catch (e) {}
}

/* ---------- 2. Le scan ---------- */
function montrerScanEpicerie() {
  toutCacher(); $('vue-epicerie').hidden = false; $('btn-burger').hidden = false;
  $('epi-titre').textContent = EPI.nom;
  montrer('epi-choix', false); montrer('epi-scan', true);
  remplirListeEpicerie(); afficherTerminer();
  modeSansCode(false);
  window.scrollTo(0, 0);
}
function demarrerCamera() { if (window.scanContinu) window.scanContinu(EPI_CAMERA); }
function reprendreCamera() { if (window.reprendreScan) window.reprendreScan(EPI_CAMERA); }
/* « Sans code » : la caméra laisse sa place au PLU, aux habituels (la barre fermée, J-C) et à l'entonnoir; « Revenir au scan ». */
function modeSansCode(on) {
  montrer('epi-camera', !on); montrer('epi-sans', on);
  fermerCarte();
  if (on) {
    if (window.stopScanner) window.stopScanner();
    reinitSansCode();
    const t = $('epi-habituels-tete'); if (t.classList.contains('ouvert')) toggleAccordeon(t);
  } else demarrerCamera();
}
function fermerCarte() { EPI_CARTE = null; epiJeton++; $('epi-carte').innerHTML = ''; }

/* Un code lu. Ses données d'abord (instantané); sinon UN appel au coffre-fort (les circulaires d'IGA, puis Open Food Facts) —
   un coffre-fort pas encore à jour : Open Food Facts directement. */
async function surCodeEpicerie(code) {
  code = String(code || '').trim();
  if (!code || !EPI) return;
  const jeton = ++epiJeton;
  const connu = articleConnu(code);
  if (connu) { montrerCarte(connu); return; }
  $('epi-carte').innerHTML = '<div class="carte bloc-suite carte-scan"><div class="message">Recherche du produit…</div>' +
    '<button class="bouton bouton-pleine bouton-quitter" type="button" data-epi-annuler>Annuler</button></div>';
  let r = null;
  try { r = await Coffre.identifier(code); } catch (e) {}
  if (!r || !r.ok) {
    let d = null;
    if (typeof window.chercherOFF === 'function') { try { d = await window.chercherOFF(code); } catch (e) {} }
    r = d && d.trouve ? { source: 'off', texte: d.nom || d.nomAutre, marque: d.marque, format: d.format, photo: d.photo } : { source: '' };
  }
  if (jeton !== epiJeton || $('epi-scan').hidden) return;   // annulé, ou parti ailleurs entre-temps
  montrerCarte(articleNouveau(code, r));
}
const produitActif = pid => PRODUITS.some(p => String(p.id) === String(pid));
/* Déjà à nous (Stock : sa dernière entrée donne la marque, la saveur, le format), ou appris au tri. */
function articleConnu(code) {
  const k = formeCode(code), pid = CODES[code] || CODES[k];
  if (pid && produitActif(pid)) {
    const l = derniereLigneCode(code);
    return { code: code, pid: String(pid), marque: l ? String(l[5] || '') : '', saveur: l ? String(l[9] || '') : '', format: l ? String(l[6] || '') : '' };
  }
  const t = CODES_TRI[k] || CODES_TRI[code];
  if (t && produitActif(t[0])) return { code: code, pid: String(t[0]), marque: String(t[1] || ''), saveur: String(t[2] || ''), format: '' };
  return null;
}
/* La dernière ENTRÉE de ce code (une ligne qui porte un jeton : pas le reste d'un pack entamé, « 5 unité »). */
function derniereLigneCode(code) {
  const a = codeNu(code);
  let reste = null;
  for (let i = STOCK.length - 1; i >= 0; i--) {
    if (codeNu(STOCK[i][8]) !== a) continue;
    if (String(STOCK[i][7] || '')) return STOCK[i];
    reste = reste || STOCK[i];
  }
  return reste;
}
/* Pas à nous : un produit neuf (le nom de la circulaire d'IGA ou d'Open Food Facts), ou inconnu (le code seul). */
function articleNouveau(code, r) {
  if (!r || !r.source || !String(r.texte || r.marque || '').trim()) return { code: code, pid: null, nouveau: { nom: 'Inconnu ' + code, inconnu: true }, format: '' };
  const marqueNom = adoucir(r.marque || '');
  let nom = adoucir(r.texte || r.marque);
  if (marqueNom) {                                       // la marque garde son écriture dans le nom (« SUCRE REDPATH » → « Sucre Redpath »)
    const re = new RegExp('(^|[^\\p{L}])(' + marqueNom.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')(?![\\p{L}])', 'giu');
    nom = nom.replace(re, (m, avant) => avant + marqueNom);
    nom = nom.charAt(0).toUpperCase() + nom.slice(1);
  }
  return { code: code, pid: null, format: formatStock(r.format), photo: r.photo || '',
           nouveau: { nom: nom, marqueNom: marqueNom, marqueId: r.marqueId || '', saveurId: r.saveurId || '' } };
}
/* Un format écrit comme la fiche l'écrit (« 2 L », « 0,454 kg ») : sinon les quantités ne s'additionnent pas. Autre chose
   (« 12 x 200 ml ») : tel quel. */
function formatStock(f) {
  const t = String(f || '').trim().replace(/\s+/g, ' ');
  const m = formatCle(t).split(' + ')[0].match(/^(\d+(?:\.\d+)?) (kg|g|ml|l)$/);
  return m ? m[1].replace('.', ',') + ' ' + (m[2] === 'l' ? 'L' : m[2]) : t;
}

/* La carte de l'article : sa photo (si on en a une), son nom, marque · saveur · format; la ligne de la circulaire s'il y a lieu;
   la quantité (1, − +); OK — ou « L'associer à ce produit ? » Oui / Non, qui accepte l'article; Annuler (un mauvais scan). */
function montrerCarte(a) {
  EPI_CARTE = a;
  const m = trouverCirculaire(a);
  a.ligne = m ? m.ligne : null; a.auto = !!(m && m.auto);
  const prod = a.pid ? PRODUITS.find(p => String(p.id) === String(a.pid)) : null;
  const nom = a.nouveau ? (a.nouveau.inconnu ? 'Produit inconnu' : a.nouveau.nom) : (prod ? prod.nom : '');
  const marqueNom = a.marque ? nomListe(a.marque) : (a.nouveau ? a.nouveau.marqueNom : '');
  const detail = [marqueNom, a.saveur ? nomListe(a.saveur) : '', a.format].filter(Boolean).join(' · ') || (estPlu(a.code) ? 'PLU ' + a.code : '');
  let h = '<div class="item">' + (a.photo ? '<img class="tri-photo" src="' + esc(a.photo) + '" alt="">' : '') +
    '<div class="item-info"><div class="item-nom">' + esc(nom) + '</div>' + (detail ? '<div class="item-detail">' + esc(detail) + '</div>' : '') +
    (a.nouveau && a.nouveau.inconnu ? '<div class="code-barres">' + esc(a.code) + '</div>' : '') + '</div></div>';
  if (a.ligne && a.auto) h += '<div class="message message-succes">En circulaire : ' + esc(textePrixLigne(a.ligne)) + '</div>';
  if (a.ligne && !a.auto) h += '<div class="bloc-suite"><div class="label">Dans la circulaire de ' + esc(EPI.nom) + '</div>' + htmlLigneCirc(a.ligne) + '</div>';
  h += htmlQuantite();
  h += a.ligne && !a.auto
    ? '<div class="bloc-suite"><div class="label-fort">L\'associer à ce produit ?</div><div class="grille bloc-suite">' +
      '<button class="bouton bouton-vert" type="button" data-epi-ok="O">Oui</button>' +
      '<button class="bouton bouton-brun" type="button" data-epi-ok="N">Non</button></div></div>'
    : '<button class="bouton bouton-vert bouton-pleine bouton-suite" type="button" data-epi-ok="">OK</button>';
  h += '<button class="bouton bouton-pleine bouton-quitter" type="button" data-epi-annuler>Annuler</button>';
  $('epi-carte').innerHTML = '<div class="carte bloc-suite carte-scan">' + h + '</div>';
  brancherPlusMoins($('epi-carte').firstElementChild, 99);
}
/* Une ligne de la circulaire, au complet (J-C : « sinon je peux pas répondre ») : sa photo, son nom, son format, son prix (le régulier). */
function htmlLigneCirc(l) {
  const fmt = formatAffiche(l.format).replace(/(\d)x(\d)/g, '$1 x $2').replace(/ \+ /g, ' ou ') || l.description || '';
  const reg = textePrix(l.regulier), prix = textePrixLigne(l);
  return '<div class="item">' + (l.photo ? '<img class="tri-photo" src="' + esc(l.photo) + '" alt="">' : '<span class="tri-photo tri-photo-vide"></span>') +
    '<div class="item-info"><div class="item-nom">' + esc(adoucir(l.texte)) + '</div><div class="item-detail">' +
    esc([fmt, prix + (reg ? ' (' + reg + ')' : '')].filter(Boolean).join(' · ')) + '</div></div></div>';
}
function textePrixLigne(l) { const u = String(l.unite || '').trim(); return textePrix(l.prix) + (u ? (u[0] === '/' ? '' : ' ') + u : ''); }
/* Le prix payé, d'après la circulaire : « 2 pour 7 $ » = 3,50 chacun (J-C); au poids (« /lb », « le 100 g ») : le paquet a son
   propre prix, on le laisse vide (la viande : on attend l'étiquette de J-C). Le prix membre est celui de la circulaire (ils ont les cartes). */
function prixUnitaire(l) {
  const u = String(l.unite || '').toLowerCase();
  if (/kg|lb|\d\s*g\b/.test(u)) return '';
  const p = Number(String(l.prix == null ? '' : l.prix).replace(',', '.'));
  if (!isFinite(p) || p <= 0) return '';
  const n = Number((u.match(/(\d+)\s*\//) || [])[1]) || 1;
  return Math.round(p / n * 100) / 100;
}
/* La ligne de la circulaire de CETTE épicerie qui est ce produit :
   · le même code (IGA le donne; ou un article déjà relié au tri) : c'est lui, pas de question — le prix, tout seul;
   · sinon (Super C, Metro : pas de code) : la ligne du même aliment (relié au tri, ou proposé par le coffre-fort), une marque et
     un format qui ne disent pas autre chose — ou, pour un produit neuf, ses mots dans le texte de la ligne. La question tranche. */
function trouverCirculaire(a) {
  if (!EPI_CIRC.length) return null;
  const k = codeNu(a.code);
  if (k) {
    const exact = EPI_CIRC.find(l => codeNu(l.code) === k || (l.tri && codeNu(l.tri.code) === k));
    if (exact) return { ligne: exact, auto: true };
  }
  const refus = String(a.pid || a.code || '');
  const marqueNom = cleNom(a.marque ? nomListe(a.marque) : (a.nouveau ? a.nouveau.marqueNom : ''));
  const fmt = formatCle(a.format);
  let meilleur = null, score = -1;
  EPI_CIRC.forEach(l => {
    if (EPI_REFUS[l.cle + '|' + refus]) return;
    const pids = l.tri && l.tri.produits && l.tri.produits.length ? l.tri.produits.map(String) : (l.produitId ? [String(l.produitId)] : []);
    const mq = l.tri && l.tri.marques && l.tri.marques[0] ? nomListe(l.tri.marques[0]) : (l.marque ? nomListe(l.marque) : l.marqueFlipp);
    const lMarque = cleNom(mq);
    let s;
    if (a.pid && pids.indexOf(String(a.pid)) !== -1) s = 2;
    else if (!a.pid && a.nouveau && !a.nouveau.inconnu) {
      const lm = motsTri(l.texte), communs = motsTri(a.nouveau.nom).filter(w => lm.indexOf(w) !== -1).length;
      if (communs < (marqueNom && lMarque ? 1 : 2)) return;
      s = communs;
    } else return;
    if (marqueNom && lMarque && marqueNom !== lMarque) return;          // une autre marque : pas lui
    if (fmt && l.format && l.format.split(' + ').indexOf(fmt) === -1) return;   // un autre format : pas lui
    if (marqueNom && lMarque === marqueNom) s += 2;
    if (fmt && l.format) s += 1;
    if (s > score) { score = s; meilleur = l; }
  });
  if (!meilleur) return null;
  // déjà relié à CET aliment (Oui ou Peut-être, au tri ou à un scan d'avant) : c'est réglé — le prix, sans question. Une ligne
  // « choix varié » couvre plusieurs saveurs : un autre code du même aliment, de la même marque et du même format, c'est elle aussi.
  const t = meilleur.tri, relie = !!(a.pid && t && (t.reponse === 'O' || t.reponse === 'P') && (t.produits || []).map(String).indexOf(String(a.pid)) !== -1);
  return { ligne: meilleur, auto: relie };
}

/* OK, ou Oui / Non : l'article entre. INSTANTANÉ : STOCK et l'écran tout de suite, l'envoi dans la file des gestes (dans l'ordre :
   l'aliment neuf et sa marque neuve avant lui, puis le tri s'il est relié). */
function validerCarte(rep) {
  const a = EPI_CARTE, carte = $('epi-carte').firstElementChild;
  if (!a || !EPI || !carte || !carte.querySelector('.qte')) return;
  const qte = Math.max(1, parseInt(carte.querySelector('.qte').value, 10) || 1);
  let pid = a.pid, marque = a.marque || '', saveur = a.saveur || '';
  if (!pid) {
    const n = a.nouveau, deja = !n.inconnu && PRODUITS.find(p => cleNom(p.nom) === cleNom(n.nom));   // le même nom déjà à nous : lui
    pid = deja ? String(deja.id) : creerAlimentInstant(n.nom, '');    // sans catégorie : Compléter (ou Gérer les bases → Aliments)
    marque = n.marqueId || idMarque(n.marqueNom);
    saveur = n.saveurId || '';
  }
  pid = String(pid);
  const l = a.ligne, avecCirc = !!l && (a.auto || rep === 'O');
  const prix = avecCirc ? prixUnitaire(l) : '';
  const emp = premierEndroit(pid), id = idLocal(), opId = 'epi-' + id, qui = localStorage.getItem(QUI) || '', code = a.code || '';
  const format = a.format || '';
  // Stock : ID · ProduitID · Emp · Qte · Date · Marque · Format · OpId · CodeBarres · Saveur · QuiEntre · Magasin · Prix · Epicerie
  const ligne = [id, pid, emp, qte, dateDuJour(), marque, format, opId, code, saveur, qui, EPI.magasin, prix, EPI.id];
  poserGeste({ action: 'entrer', opId: opId, stock: [ligne],
    charge: { produitId: pid, marque: marque, format: format, saveur: saveur, code: code, magasin: EPI.magasin, prix: prix, qui: qui,
              opId: opId, epicerie: EPI.id, endroits: [{ id: id, emp: emp, qte: qte }] } });
  if (l && rep === 'O') relierCirculaire(l, pid, marque, saveur, code);
  if (l && rep === 'N') EPI_REFUS[l.cle + '|' + String(a.pid || a.code || '')] = true;
  if (code) {                                            // son code est à nous tout de suite : le prochain scan le reconnaît
    CODES[code] = pid;
    const c = lireCache(); if (c) { (c.codes = c.codes || {})[code] = pid; ecrireCache(c); }
  }
  memoriserVariante(pid, marque, format, [{ emp: emp, qte: qte }], saveur);
  nettoyerAchats(pid);                                   // entré : il quitte la liste d'achats
  fermerCarte();
  remplirListeEpicerie();
  poserPoints();                                         // le point rouge de Compléter : il y a du nouveau à placer
  if (a.sansCode) reinitSansCode(); else reprendreCamera();
}
function annulerCarte() {
  const sans = EPI_CARTE && EPI_CARTE.sansCode;
  fermerCarte();
  if (sans || !$('epi-sans').hidden) reinitSansCode(); else reprendreCamera();
}
/* Sa place habituelle (l'endroit 1 de l'aliment, s'il existe encore), sinon l'Escale. */
function premierEndroit(pid) {
  const e = endroitsHabituels(pid).find(x => resoudreEmp(x));
  return e ? String(e) : '';
}
/* La marque d'un produit neuf : retrouvée dans la liste Marques (sans accent ni majuscule), sinon créée (ID d'ici, par la file). */
function idMarque(nom) {
  nom = String(nom || '').trim();
  if (!nom) return '';
  const x = LISTES.Marques.find(y => cleNom(y.nom) === cleNom(nom));
  if (x) return x.id;
  const id = idLocal();
  LISTES.Marques.push({ id: id, nom: nom }); LISTES.Marques.sort((a, b) => a.nom.localeCompare(b.nom, 'fr')); NOMS_LISTES[id] = nom;
  poserGeste({ action: 'creer', table: 'Marques', opId: 'liste-' + id, ligne: [id, nom, 'O'] });   // Marques : ID · Nom · Actif
  return id;
}
/* Oui : la ligne de la circulaire est ce produit — onglet Tri (Oui, l'aliment, la marque, la saveur, le code scanné), par la file.
   Les semaines suivantes, l'article est déjà trié; le scan le reconnaît sans question. */
function relierCirculaire(l, pid, marque, saveur, code) {
  const neuf = !l.tri;
  poserGeste({ action: 'trier', opId: 'tri-' + idLocal(), cles: [l.cle], reponse: 'O', produits: [{ produitId: pid, marque: marque, saveur: saveur }],
               code: String(code || ''), qui: localStorage.getItem(QUI) || '', neufs: neuf ? 1 : 0 });
  l.tri = { reponse: 'O', produits: [pid], marques: [marque], saveurs: [saveur], code: String(code || '') };
  if (code) CODES_TRI[formeCode(code)] = [pid, marque, saveur];
  if (neuf) noterNbATrier(NB_A_TRIER - 1);
  garderCirculaire();
}

/* « Déjà scanné (13) » : les lignes de STOCK de cette liste, une par produit (même aliment, marque, saveur, format, code), le
   dernier scanné en haut; rescanner le même article fait monter sa quantité. */
function remplirListeEpicerie() {
  const groupes = [], par = {};
  lignesEpicerie(EPI.id).forEach(r => {
    const k = [r[1], r[5], r[9], r[6], codeNu(r[8])].map(v => String(v == null ? '' : v)).join('|');
    let g = par[k];
    if (!g) g = par[k] = { pid: String(r[1]), marque: r[5], saveur: r[9], format: r[6], code: String(r[8] || ''), qte: 0 };
    else groupes.splice(groupes.indexOf(g), 1);
    groupes.push(g);
    g.qte += Number(r[3]) || 0;
  });
  const n = groupes.reduce((s, g) => s + g.qte, 0);
  $('epi-liste').innerHTML = !groupes.length ? '' : '<div class="bloc-suite"><div class="label">Déjà scanné (' + n + ')</div><div class="liste-blanche">' +
    groupes.reverse().map(g => {
      const p = PRODUITS.find(x => String(x.id) === g.pid);
      const det = [nomListe(g.marque), nomListe(g.saveur), g.format].filter(Boolean).join(' · ') || (estPlu(g.code) ? 'PLU ' + g.code : '');
      return '<div class="item"><div class="item-info"><div class="item-nom">' + esc(p ? p.nom : '') + '</div>' +
        (det ? '<div class="item-detail">' + esc(det) + '</div>' : '') + '</div><span class="item-quantite">' + esc(g.qte) + '</span></div>';
    }).join('') + '</div></div>';
}

/* ---------- 3. Sans code : le PLU, les habituels, l'entonnoir ---------- */
function reinitSansCode() {
  $('epi-plu').value = ''; $('epi-plu-nom').textContent = ''; $('epi-plu-nom').className = 'message message-repli';
  remplirHabituels();
  $('epi-cat').innerHTML = options(RAYONS, '— Catégorie —');
  montrer('epi-souscat', false); montrer('epi-produit', false); montrer('epi-neuf', false); $('epi-nom-neuf').value = '';
}
/* Les habituels sans code : ce qu'on a déjà entré sans code-barres (ou avec un PLU), le plus fréquent en haut. */
function remplirHabituels() {
  const par = {}, xs = [];
  STOCK.forEach(r => {
    const code = String(r[8] || '').trim(), pid = String(r[1] || '');
    if ((code && !estPlu(code)) || !produitActif(pid)) return;      // un vrai code-barres : il se scanne
    const k = pid + '|' + code;
    let x = par[k];
    if (!x) { x = par[k] = { pid: pid, code: code, n: 0 }; xs.push(x); }
    x.n++; x.marque = String(r[5] || ''); x.saveur = String(r[9] || ''); x.format = String(r[6] || '');   // la plus récente
  });
  EPI_HABITUELS = xs.sort((a, b) => b.n - a.n).slice(0, 12);
  $('epi-habituels').innerHTML = '<div class="liste-blanche">' + (EPI_HABITUELS.map((x, i) => {
    const p = PRODUITS.find(y => String(y.id) === x.pid);
    const det = estPlu(x.code) ? 'PLU ' + x.code : [nomListe(x.marque), nomListe(x.saveur), x.format].filter(Boolean).join(' · ');
    return '<div class="item" data-epi-hab="' + i + '"><div class="item-info"><div class="item-nom">' + esc(p ? p.nom : '') + '</div>' +
      (det ? '<div class="item-detail">' + esc(det) + '</div>' : '') + '</div></div>';
  }).join('') || '<div class="item"><div class="item-info"><div class="texte-petit texte-pale">Rien encore : ils viendront au fil des épiceries</div></div></div>') + '</div>';
}
function choisirHabituel(i) {
  const x = EPI_HABITUELS[i];
  if (x) montrerCarte({ code: x.code, pid: x.pid, marque: x.marque, saveur: x.saveur, format: x.format, sansCode: true });
}
/* Le PLU tapé : le nom officiel dessous (pour vérifier), et la carte — l'aliment à qui ce PLU a déjà servi, sinon celui qui porte
   le même nom (« Pommes Fuji » → Pomme), sinon un aliment neuf au nom officiel. */
async function surPluEpicerie() {
  const v = $('epi-plu').value.replace(/\D/g, ''), msg = $('epi-plu-nom');
  if (!estPlu(v)) { msg.textContent = ''; if (EPI_CARTE && EPI_CARTE.plu) fermerCarte(); return; }
  await chargerPlu();
  if ($('epi-plu').value.replace(/\D/g, '') !== v) return;   // un autre chiffre tapé entre-temps
  const nom = nomPlu(v);
  msg.className = 'message message-repli' + (nom ? '' : ' message-erreur');
  msg.textContent = nom || 'PLU inconnu';
  if (!nom) { if (EPI_CARTE && EPI_CARTE.plu) fermerCarte(); return; }
  const connu = articleConnu(v), alim = !connu && alimentPourPlu(nom);
  const a = connu || (alim ? { code: v, pid: String(alim.id), marque: '', saveur: '', format: '' } : { code: v, pid: null, nouveau: { nom: nom }, format: '' });
  a.sansCode = true; a.plu = true;
  montrerCarte(a);
}
function alimentPourPlu(nom) {
  const mots = motsTri(nom);
  if (!mots.length) return null;
  const c = PRODUITS.filter(p => { const m = motsTri(p.nom); return m.length && m[0] === mots[0] && m.every(w => mots.indexOf(w) !== -1); });
  return c.sort((a, b) => motsTri(b.nom).length - motsTri(a.nom).length)[0] || null;   // le plus précis
}
/* L'entonnoir : Catégorie → Sous-catégorie → Produit (« Nouveau produit… » au bout : un nom, Ajouter). */
function surEpiCat() {
  const rid = $('epi-cat').value;
  $('epi-souscat').innerHTML = options(SOUSCATS[rid] || [], '— Sous-catégorie —');
  montrer('epi-souscat', !!rid); montrer('epi-produit', false); montrer('epi-neuf', false);
}
function surEpiSousCat() {
  const scid = $('epi-souscat').value;
  const ps = PRODUITS.filter(p => String(p.catId) === String(scid)).sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
  $('epi-produit').innerHTML = options(ps, '— Produit —') + '<option value="nouveau">Nouveau produit…</option>';
  montrer('epi-produit', !!scid); montrer('epi-neuf', false);
}
function surEpiProduit() {
  const v = $('epi-produit').value;
  montrer('epi-neuf', v === 'nouveau');
  if (v === 'nouveau') { fermerCarte(); $('epi-nom-neuf').focus(); return; }
  if (v) montrerCarte({ code: '', pid: v, marque: '', saveur: '', format: '', sansCode: true });
}
function ajouterEpiNeuf() {
  const nom = $('epi-nom-neuf').value.trim(), scid = $('epi-souscat').value;
  if (!nom || !scid) { $('epi-nom-neuf').focus(); return; }
  const deja = PRODUITS.find(p => String(p.catId) === String(scid) && cleNom(p.nom) === cleNom(nom));   // déjà là : lui, jamais un double
  const pid = deja ? String(deja.id) : creerAlimentInstant(nom, scid);
  montrer('epi-neuf', false);
  montrerCarte({ code: '', pid: pid, marque: '', saveur: '', format: '', sansCode: true });
}

/* ---------- 4. Terminé (au bas, choix E) : une confirmation, dont le Oui n'est pas là où l'on touche pendant le scan ---------- */
function afficherTerminer() {
  $('epi-fin').innerHTML = '<button class="bouton bouton-brun bouton-pleine bouton-detache" type="button" data-epi-terminer>Terminé</button>';
}
function demanderTerminer() {
  if (!EPI) return;
  $('epi-fin').innerHTML = '<div class="liste-blanche bouton-detache"><div class="accordeon-item accordeon-item-saisie" data-confirme><span>' +
    esc('Terminer ' + EPI.nom + ' ? (' + articles(nbArticles(EPI.id)) + ')') + '</span>' +
    '<button class="bouton bouton-petit bouton-vert" type="button" data-epi-terminer-oui>Oui</button>' +
    '<button class="bouton bouton-petit" type="button" data-epi-terminer-non>Non</button></div></div>';
}
/* Oui : la liste passe à « terminée » (Epiceries col. D = T, par la file) et attend Compléter. Elle reste ouverte : un article
   oublié de la même épicerie s'y ajoute encore. On revient au choix de l'épicerie (une autre épicerie : Terminé, puis Entrer). */
function terminerEpicerie() {
  if (!EPI) return;
  const row = EPICERIES.find(r => String(r[0]) === EPI.id);
  if (row && String(row[3]) === 'O') {
    const l = row.slice(); while (l.length < 5) l.push('');
    l[3] = 'T';
    poserGeste({ action: 'lignes', table: 'Epiceries', opId: 'epit-' + idLocal(), lignes: [l] });
  }
  avis(EPI.nom + ' : terminé', 'succes');
  montrerEpiceries();
}

/* ---------- 5. Compléter (le + : la feuille cochée — J-C, 2026-10-04, sur aperçu) ----------
   L'épicerie, groupée par meuble comme l'Inventaire par meuble : « À placer » d'abord (ce qui n'a pas de place : l'Escale), puis
   les meubles, chacun avec ses espaces en bandeaux. Les deux flèches d'un article ouvrent la carte de l'Escale (placer, corriger,
   répartir : une partie seulement). OK : ce qui est placé et a sa catégorie quitte la liste (STOCK col. O = le jour, par la file
   des gestes); le reste attend, avec le point rouge. Plus rien : la liste est close (Epiceries col. D = C). Plusieurs épiceries à
   compléter : on choisit laquelle. Donner une catégorie à un produit neuf : pas encore ici (Gérer les bases → Aliments). */
var EPI_COMPLETER = null;    // la liste ouverte : { id, magasin, nom, plusieurs }
var LOTS_COMPLETER = [];     // ses lots, comme l'Escale : { pid, emp, marque, saveur, formats, qte, lignes }
var COMPLETER_OUVERT = '';   // le groupe ouvert ('escale' ou l'ID d'un meuble) : il le reste après un geste
const lignesACompleter = id => STOCK.filter(r => String(r[13] || '') === String(id) && !String(r[14] || '') && Number(r[3]) > 0);
const aCategorie = pid => { const p = PRODUITS.find(x => String(x.id) === String(pid)); return !!(p && p.catId); };
function montrerCompleter() {
  const xs = aCompleter();
  if (!xs.length) { avis('Rien à compléter'); return; }
  if (xs.length === 1) { ouvrirCompleter(xs[0], false); return; }
  toutCacher(); $('vue-epicerie').hidden = false; $('btn-burger').hidden = false;
  EPI_COMPLETER = null;
  $('epi-titre').textContent = 'Compléter';
  montrer('epi-choix', false); montrer('epi-scan', false); montrer('epi-completer', true); montrer('completer-ok', false);
  $('completer-liste').innerHTML = '';
  $('completer-listes').innerHTML = xs.map(r => {
    const n = lignesACompleter(r[0]).reduce((s, l) => s + (Number(l[3]) || 0), 0), t = teinteMagasin(r[1]);
    return '<div class="accordeon" data-completer="' + esc(r[0]) + '"><div class="accordeon-tete' + t.pale + '"' + t.style + '><span>' + esc(nomListe(r[1])) + '</span></div>' +
      '<div class="note-barre">' + esc(jourLisible(r[2]) + ' (' + articles(n) + ')') + '</div></div>';
  }).join('');
  window.scrollTo(0, 0);
}
/* « 4 octobre » (une date AAAA-MM-JJ du Sheet). */
function jourLisible(v) {
  const t = String(dateCourte(v) || '').slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(t) ? new Date(t + 'T12:00:00').toLocaleDateString('fr-CA', { day: 'numeric', month: 'long' }) : t;
}
function ouvrirCompleter(row, plusieurs) {
  EPI_COMPLETER = { id: String(row[0]), magasin: String(row[1]), nom: nomListe(row[1]), plusieurs: !!plusieurs };
  toutCacher(); $('vue-epicerie').hidden = false; $('btn-burger').hidden = false;
  $('epi-titre').textContent = EPI_COMPLETER.nom;
  montrer('epi-choix', false); montrer('epi-scan', false); montrer('epi-completer', true); montrer('completer-ok', true);
  $('completer-listes').innerHTML = '';
  COMPLETER_OUVERT = 'escale';                           // « À placer » ouvert d'abord : c'est là qu'il y a quelque chose à faire
  remplirCompleter();
  window.scrollTo(0, 0);
  const m = LISTES.Magasins.find(x => String(x.id) === EPI_COMPLETER.magasin) || { id: EPI_COMPLETER.magasin, circ: true };
  EPI_CIRC = [];
  if (!jeudiPasse(row[2], dateDuJour())) chargerCirculaire(m);   // le prix de la circulaire suit (J-C) — la semaine de l'achat seulement
}
function remplirCompleter() {
  const par = {};
  LOTS_COMPLETER = [];
  lignesACompleter(EPI_COMPLETER.id).forEach(r => {
    const emp = String(r[2] || '') && resoudreEmp(r[2]) ? String(r[2]) : '';   // un endroit disparu : à placer
    const marque = String(r[5] || '').trim(), saveur = String(r[9] || '').trim(), format = String(r[6] || '').trim();
    const k = [r[1], emp, marque, saveur].join('|');
    let lot = par[k];
    if (!lot) { lot = par[k] = { pid: String(r[1]), emp: emp, marque: marque, saveur: saveur, formats: [], qte: 0, lignes: [] }; LOTS_COMPLETER.push(lot); }
    lot.qte += Number(r[3]) || 0;
    if (format && lot.formats.indexOf(format) === -1) lot.formats.push(format);
    lot.lignes.push(String(r[0]));
  });
  const nom = lot => (PRODUITS.find(p => String(p.id) === lot.pid) || {}).nom || '';
  const ligne = lot => {
    const i = LOTS_COMPLETER.indexOf(lot), prix = prixDuLot(lot);
    const det = [[detailLot(lot), prix ? textePrix(prix) : ''].filter(Boolean).join(' · '), aCategorie(lot.pid) ? '' : '(sans catégorie)'].filter(Boolean).join(' ');
    return '<div class="item" data-completer-item="' + i + '"><div class="item-info"><div class="item-nom">' + esc(nom(lot)) + '</div>' + (det ? '<div class="item-detail">' + esc(det) + '</div>' : '') + '</div>' +
      '<button class="ranger" type="button" data-completer-lot="' + i + '" aria-label="Placer"></button><span class="item-quantite">' + esc(lot.qte) + '</span></div>';
  };
  const parNom = (a, b) => nom(a).localeCompare(nom(b), 'fr');
  const groupe = (cle, titre, attrs, pale, corps) => '<div class="accordeon" data-groupe="' + esc(cle) + '"' + attrs + '><div class="accordeon-tete' + pale + (COMPLETER_OUVERT === cle ? ' ouvert' : '') + '">' +
    esc(titre) + '</div><div class="accordeon-corps"' + (COMPLETER_OUVERT === cle ? '' : ' hidden') + '>' + corps + '</div></div>';
  let h = '';
  const aPlacer = LOTS_COMPLETER.filter(l => !l.emp).sort(parNom);
  if (aPlacer.length) h += groupe('escale', 'À placer', '', '', aPlacer.map(ligne).join(''));
  MEUBLES.forEach(m => {                                 // les meubles dans leur ordre (celui de Gérer les bases)
    const ici = LOTS_COMPLETER.filter(l => l.emp && resoudreEmp(l.emp).meubleId === String(m.id));
    if (!ici.length) return;
    let corps = ici.filter(l => l.emp === String(m.id)).sort(parNom).map(ligne).join('');   // posé sur le meuble, sans espace
    (ESPACES[m.id] || []).forEach(e => {
      const la = ici.filter(l => l.emp === String(e.id)).sort(parNom);
      if (la.length) corps += '<div class="espace-bandeau">' + esc(e.nom) + '</div>' + la.map(ligne).join('');
    });
    const teinte = couleurDe(m.couleur);
    h += groupe(String(m.id), m.nom, teinte ? ' style="--meuble:' + esc(teinte) + '"' : '', teinte && couleurPale(teinte) ? ' tete-pale' : '', corps);   // la couleur du meuble est une DONNÉE
  });
  $('completer-liste').innerHTML = h || '<div class="vide"><div class="vide-titre">Tout est complété</div></div>';
  montrer('completer-ok', !!h);
}
/* Les deux flèches d'un article : la carte de l'Escale (la pièce, le meuble, l'espace, la quantité — le total d'avance). Une partie
   seulement = répartir : le reste reste où il est. Oui fait le geste (instantané, deplacerLot); Non laisse tout tel quel. */
function ouvrirLotCompleter(btn) {
  const i = Number(btn.dataset.completerLot);
  remplirCompleter();                                    // une seule carte à la fois (les lots refaits dans le même ordre)
  const lot = LOTS_COMPLETER[i], item = $('completer-liste').querySelector('[data-completer-lot="' + i + '"]');
  if (!lot || !item) return;
  const carte = document.createElement('div');
  carte.className = 'endroit carte';
  carte.innerHTML = htmlChoixEndroit() +
    '<div class="bloc"><div class="label">Quantité</div><input class="champ qte" type="text" inputmode="numeric" pattern="[0-9]*" value="' + esc(lot.qte) + '"></div>' +
    '<div class="message"></div>' +
    '<div class="grille"><button class="bouton bouton-petit bouton-vert lot-oui" type="button" hidden>Oui</button>' +
    '<button class="bouton bouton-petit lot-non" type="button">Non</button></div>';
  item.closest('.item').replaceWith(carte);
  brancherEndroit(carte);
  const cible = () => carte.querySelector('.espace').value || carte.querySelector('.meuble').value;
  const combien = () => parseInt(carte.querySelector('.qte').value, 10) || 0;
  const question = () => {
    const emp = cible(), q = combien(), m = carte.querySelector('.message'), oui = carte.querySelector('.lot-oui');
    const ok = !!emp && emp !== lot.emp && q > 0 && q <= lot.qte;
    m.className = 'message';
    if (q > lot.qte) { m.className = 'message message-erreur'; m.textContent = 'Il y en a ' + lot.qte + '.'; }
    else if (!ok) m.textContent = emp && emp === lot.emp ? 'Il y est déjà.' : '';
    else m.textContent = 'Ranger ' + (q > 1 ? 'les ' + q : 'le ' + q) + ' à ' + libelleEndroit(emp) + ' ?' + (q < lot.qte ? ' (' + (lot.qte - q) + (lot.qte - q > 1 ? ' restent où ils sont)' : ' reste où il est)') : '');
    oui.hidden = !ok;
  };
  carte.addEventListener('change', question);
  carte.addEventListener('input', question);
  carte.querySelector('.lot-non').onclick = () => remplirCompleter();
  carte.querySelector('.lot-oui').onclick = () => {
    const emp = cible();
    deplacerLot(lot, emp, combien(), fait => {
      if (fait) memoriserVariante(lot.pid, '', '', [{ emp: emp }], '');   // sa place devient connue : la prochaine fois, il y ira tout seul
      remplirCompleter();
    });
  };
  question();
}
/* OK : ce qui est placé et a sa catégorie quitte la liste (col. O = le jour); le reste attend. Plus rien : la liste est close. */
function validerCompleter() {
  const E = EPI_COMPLETER;
  if (!E) return;
  const rows = STOCK.filter(r => String(r[13] || '') === E.id && !String(r[14] || ''));
  const complet = r => Number(r[3]) <= 0 || (!!String(r[2] || '') && !!resoudreEmp(r[2]) && aCategorie(r[1]));
  const faits = rows.filter(complet), reste = rows.filter(r => !complet(r));
  const jour = dateDuJour();
  if (faits.length) poserGeste({ action: 'deplacer', opId: 'compl-' + idLocal(), ajouts: [],
    modifs: faits.map(r => { const l = r.slice(); while (l.length < 15) l.push(''); l[4] = dateCourte(l[4]); l[14] = jour; return { id: String(r[0]), ligne: l }; }) });
  const nFaits = faits.reduce((s, r) => s + (Number(r[3]) || 0), 0), nReste = reste.reduce((s, r) => s + (Number(r[3]) || 0), 0);
  if (!reste.length) {
    const row = EPICERIES.find(r => String(r[0]) === E.id);
    if (row) { const l = row.slice(); while (l.length < 5) l.push(''); l[3] = 'C'; poserGeste({ action: 'lignes', table: 'Epiceries', opId: 'epic-' + idLocal(), lignes: [l] }); }
    poserPoints();
    avis(E.nom + ' : complété', 'succes');
    montrerChoixQuoi();
    return;
  }
  poserPoints();
  avis((nFaits ? articles(nFaits) + ' rangé' + (nFaits > 1 ? 's' : '') + ' · ' : '') + nReste + ' attend' + (nReste > 1 ? 'ent' : '') + ' (à placer ou sans catégorie)', nFaits ? 'succes' : 'avis');
  remplirCompleter();
}

/* ---------- 6. Compléter pour vrai : le produit et son prix (J-C, 2026-10-04 : « quand je complète, je complète pour vrai »;
   « le prix doit suivre aussi quand c'est en circulaire »; aperçu « ça semble intéressant ») ----------
   Toucher le nom d'un article ouvre son produit dessous : « Voir chez Super C » (sa page, par son code), le texte de la page collé
   (tout se remplit : le rayon → la catégorie et la sous-catégorie, la marque, le nom, le format, le prix — RdG-01, 3 bis), puis la
   catégorie, la sous-catégorie, l'aliment (le sien qui ressemble, sinon « Nouvel aliment… »), la marque, la saveur, le format, le prix
   payé. Sans prix et en circulaire chez cette épicerie (la semaine de l'achat) : la ligne de la circulaire et « L'associer ? » — Oui
   remplit le prix et colle le code à la circulaire (le Tri : l'article quitte « À trier »). « C'est ça » : instantané, par la file des
   gestes — l'aliment (sa catégorie, son nom; ou réuni à un aliment qui existe), les lignes de STOCK du lot (marque, saveur, format, prix). */
var PANNEAU = null;          // le produit ouvert : { i, lot, ligne (de la circulaire), assoc ('O' · 'N' · ''), auto }
const prixDuLot = lot => { for (const id of lot.lignes) { const r = STOCK.find(x => String(x[0]) === id); if (r && String(r[12] == null ? '' : r[12]).trim() !== '') return r[12]; } return ''; };
const dateDuLot = lot => { const r = STOCK.find(x => String(x[0]) === lot.lignes[0]); return r ? r[4] : ''; };
const codeDuLot = lot => { for (const id of lot.lignes) { const r = STOCK.find(x => String(x[0]) === id); if (r && String(r[8] || '').trim()) return String(r[8]).trim(); } return ''; };
/* Un jeudi entre le jour de l'achat (exclu) et aujourd'hui (inclus) : la circulaire a changé — son prix ne vaut plus pour cet achat. */
function jeudiPasse(achat, auj) {
  const d = new Date(String(dateCourte(achat) || '').slice(0, 10) + 'T12:00:00'), t = new Date(String(auj).slice(0, 10) + 'T12:00:00');
  if (isNaN(d) || isNaN(t)) return false;
  for (let x = new Date(d.getTime() + 864e5); x <= t; x = new Date(x.getTime() + 864e5)) if (x.getDay() === 4) return true;
  return false;
}
function ouvrirProduit(i) {
  PANNEAU = null;
  remplirCompleter();                                    // un seul produit (ou une seule carte) ouvert à la fois
  const lot = LOTS_COMPLETER[i], item = $('completer-liste').querySelector('[data-completer-item="' + i + '"]');
  if (!lot || !item) return;
  PANNEAU = { i: i, lot: lot, ligne: null, assoc: '', auto: false };
  item.insertAdjacentHTML('afterend', htmlPanneau(lot));
  const p = PRODUITS.find(x => String(x.id) === lot.pid) || { nom: '', catId: '' };
  const rid = p.catId ? rayonDe(p.catId) : '';
  $('cp-cat').innerHTML = options(RAYONS, '— Catégorie —'); $('cp-cat').value = rid;
  remplirSousCatPanneau(p.catId);
  remplirAlimentsPanneau(p.catId ? lot.pid : 'nouveau', p.nom);
  const vr = VARIANTES[lot.pid] || {};
  $('cp-marque').innerHTML = optionsListe('marque', vr.marques || [], lot.marque); $('cp-marque').value = lot.marque || '';
  $('cp-saveur').innerHTML = optionsListe('saveur', vr.saveurs || [], lot.saveur); $('cp-saveur').value = lot.saveur || '';
  poserFormatPanneau(lot.formats[0] || '');
  ajouterEndroitPanneau(resoudreEmp(lot.emp || premierEndroit(lot.pid)), lot.qte);   // sa place (ou sa place habituelle) et toute la quantité
  const prix = prixDuLot(lot);
  $('cp-prix').value = prix !== '' ? textePrix(prix) : '';
  majCirculairePanneau();
}
function htmlPanneau(lot) {
  const code = formeCode(codeDuLot(lot));
  const champ = (label, html) => '<div class="bloc"><div class="label">' + label + '</div>' + html + '</div>';
  return '<div class="carte" data-panneau>' +
    (code.length >= 8 ? '<button class="bouton bouton-brun bouton-pleine" type="button" data-cp-voir>Voir chez Super C</button>' : '') +
    champ('Colle le texte de la page', '<textarea class="champ" id="cp-texte" placeholder="Du chemin du rayon jusqu\'au numéro de produit"></textarea><div class="message message-repli" id="cp-lu"></div>') +
    champ('Catégorie', '<select class="champ" id="cp-cat"></select>') +
    '<div class="bloc" id="cp-bloc-souscat"><div class="label">Sous-catégorie</div><select class="champ" id="cp-souscat"></select></div>' +
    '<div class="bloc" id="cp-bloc-aliment"><div class="label">Aliment</div><select class="champ champ-fort" id="cp-aliment"></select>' +
    '<input class="champ bloc-suite" id="cp-nom" autocomplete="off" enterkeyhint="done" placeholder="Nom du nouvel aliment"><div class="message message-repli" id="cp-aliment-msg"></div></div>' +
    champ('Marque', '<select class="champ" id="cp-marque"></select><input class="champ bloc-suite" id="cp-marque-neuve" autocomplete="off" placeholder="Nom de la marque" hidden>') +
    champ('Saveur', '<select class="champ" id="cp-saveur"></select><input class="champ bloc-suite" id="cp-saveur-neuve" autocomplete="off" placeholder="Nom de la saveur" hidden>') +
    champ('Format', '<div class="ligne-couleur"><input class="champ champ-nombre" id="cp-nb" inputmode="decimal" autocomplete="off"><select class="champ" id="cp-unite"></select></div>') +
    '<div id="cp-endroits"></div><button class="bouton bouton-petit bouton-suite" type="button" data-cp-endroit>+ un autre endroit</button>' +   // où il est rangé — un ou plusieurs endroits, comme la fiche (J-C : « la répartition doit pouvoir se faire là aussi »)
    '<div id="cp-circ"></div>' +
    champ('Prix payé', '<input class="champ" id="cp-prix" inputmode="decimal" autocomplete="off"><div class="message message-repli" id="cp-prix-msg"></div>') +
    '<div class="message message-repli message-erreur" id="cp-msg"></div>' +
    '<div class="grille bloc-suite"><button class="bouton bouton-petit bouton-vert" type="button" data-cp-ok>C\'est ça</button>' +
    '<button class="bouton bouton-petit" type="button" data-cp-annuler>Annuler</button></div></div>';
}
/* Un endroit du produit ouvert : la carte de la fiche (pièce, meuble, espace, quantité, « Retirer » s'il y en a plus d'un). */
function ajouterEndroitPanneau(pref, qte) {
  const row = document.createElement('div');
  row.className = 'endroit carte';
  row.innerHTML = htmlChoixEndroit() +
    '<div class="bloc"><div class="label">Quantité</div><input class="champ qte" type="text" inputmode="numeric" pattern="[0-9]*" value="' + esc(qte) + '"></div>' +
    '<button class="bouton bouton-petit endroit-retirer" type="button">Retirer</button>';
  $('cp-endroits').appendChild(row);
  brancherEndroit(row, pref);
}
function remplirSousCatPanneau(scid) {
  const rid = $('cp-cat').value;
  $('cp-souscat').innerHTML = options(SOUSCATS[rid] || [], '— Sous-catégorie —');
  $('cp-souscat').value = scid && rayonDe(scid) === rid ? String(scid) : '';
  montrer('cp-bloc-souscat', !!rid);
}
/* Les aliments de la sous-catégorie, « Nouvel aliment… » au bout (son nom dessous, celui du produit d'avance). */
function remplirAlimentsPanneau(choisi, nom) {
  const scid = $('cp-souscat').value;
  const ps = PRODUITS.filter(p => String(p.catId) === String(scid)).sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
  $('cp-aliment').innerHTML = options(ps, '— Aliment —') + '<option value="nouveau">Nouvel aliment…</option>';
  const v = choisi === 'nouveau' || ps.some(p => String(p.id) === String(choisi)) ? String(choisi) : (scid ? 'nouveau' : '');
  $('cp-aliment').value = v;
  if (nom !== undefined) $('cp-nom').value = nom;
  else if (!$('cp-nom').value) $('cp-nom').value = (PRODUITS.find(p => String(p.id) === PANNEAU.lot.pid) || {}).nom || '';
  montrer('cp-bloc-aliment', !!scid);
  surAlimentPanneau();
}
function surAlimentPanneau() {
  const v = $('cp-aliment').value, m = $('cp-aliment-msg');
  $('cp-nom').hidden = v !== 'nouveau';
  const autre = v && v !== 'nouveau' && v !== PANNEAU.lot.pid && PRODUITS.find(p => String(p.id) === v);
  m.textContent = autre ? 'Il devient du ' + autre.nom + ' (ton aliment) : tout ce qu\'il y en a passe à ' + autre.nom + '.' : '';
  const ou = document.querySelector('#cp-endroits .endroit');   // pas encore placé : la place habituelle de l'aliment choisi, s'il en a une
  if (autre && ou && !PANNEAU.lot.emp && !ou.querySelector('.meuble').value) { const e = premierEndroit(autre.id); if (e) brancherEndroit(ou, resoudreEmp(e)); }
  majCirculairePanneau();
}
function poserFormatPanneau(f) {
  const m = String(f || '').trim().match(/^([0-9]+(?:[.,][0-9]+)?)?\s*(.*)$/), u = m && m[2] ? m[2].trim() : '';
  const us = unitesConnues(); if (u && us.indexOf(u) === -1) us.push(u);
  $('cp-unite').innerHTML = '<option value="">— Unité —</option>' + us.map(x => '<option value="' + esc(x) + '">' + esc(x) + '</option>').join('');
  $('cp-unite').value = u;
  $('cp-nb').value = m && m[1] ? m[1].replace('.', ',') : '';
}
const formatPanneau = () => { const nb = $('cp-nb').value.trim().replace('.', ','), u = $('cp-unite').value; return nb || u ? ((nb ? nb + ' ' : '') + u).trim() : ''; };
/* Le choix d'une liste (marque, saveur) : un ID, ou un nom neuf — retrouvé dans la liste (sans accent ni majuscule), sinon créé. */
function choixPanneau(champ) {
  const v = $('cp-' + champ).value;
  return v === 'neuve' ? idListe(CHOIX_FICHE[champ].liste, $('cp-' + champ + '-neuve').value) : v;
}
function idListe(liste, nom) {
  nom = String(nom || '').trim();
  if (!nom) return '';
  const x = LISTES[liste].find(y => cleNom(y.nom) === cleNom(nom));
  if (x) return x.id;
  const id = idLocal();
  LISTES[liste].push({ id: id, nom: nom }); LISTES[liste].sort((a, b) => a.nom.localeCompare(b.nom, 'fr')); NOMS_LISTES[id] = nom;
  poserGeste({ action: 'creer', table: liste, opId: 'liste-' + id, ligne: [id, nom, 'O'] });   // Marques, Saveurs : ID · Nom · Actif
  return id;
}
/* Mettre un nom dans un menu de liste : retrouvé (choisi), sinon « Nouvelle… » avec le nom écrit dessous. */
function choisirNomPanneau(champ, nom) {
  nom = String(nom || '').trim();
  if (!nom) return;
  const sel = $('cp-' + champ), x = LISTES[CHOIX_FICHE[champ].liste].find(y => cleNom(y.nom) === cleNom(nom)), neuve = $('cp-' + champ + '-neuve');
  if (x) {
    if (![...sel.options].some(o => o.value === x.id)) sel.insertAdjacentHTML('afterbegin', '<option value="' + esc(x.id) + '">' + esc(x.nom) + '</option>');
    sel.value = x.id; neuve.hidden = true;
  } else { sel.value = 'neuve'; neuve.value = nom; neuve.hidden = false; }
}
/* La circulaire de l'épicerie (la semaine de l'achat) : ce produit y est-il ? Sans prix seulement — un prix déjà là (le scan) gagne. */
function majCirculairePanneau() {
  const P = PANNEAU, boite = $('cp-circ');
  if (!P || !boite) return;
  const v = $('cp-aliment').value, pid = v && v !== 'nouveau' ? v : P.lot.pid;
  const a = { code: codeDuLot(P.lot), pid: pid, marque: $('cp-marque').value === 'neuve' ? '' : $('cp-marque').value, format: formatPanneau() };
  const dejaPrix = prixDuLot(P.lot) !== '';
  const m = !dejaPrix && EPI_CIRC.length ? trouverCirculaire(a) : null;
  if ((m ? m.ligne.cle : '') !== (P.ligne ? P.ligne.cle : '')) P.assoc = '';   // une autre ligne (l'aliment a changé) : la question revient
  P.ligne = m ? m.ligne : null; P.auto = !!(m && m.auto); P.pidCirc = pid;
  if (P.auto) { P.assoc = 'O'; $('cp-prix').value = textePrix(prixUnitaire(P.ligne)); }
  boite.innerHTML = !P.ligne ? '' : P.auto
    ? '<div class="message message-succes">En circulaire chez ' + esc(EPI_COMPLETER.nom) + ' : ' + esc(textePrixLigne(P.ligne)) + '</div>'
    : '<div class="bloc"><div class="label">Dans la circulaire de ' + esc(EPI_COMPLETER.nom) + '</div>' + htmlLigneCirc(P.ligne) +
      (P.assoc ? '<div class="message">' + (P.assoc === 'O' ? 'Associé : le prix de la circulaire.' : 'Pas associé.') + '</div>'
               : '<div class="label-fort bloc-suite">L\'associer à ce produit ?</div><div class="grille bloc-suite">' +
                 '<button class="bouton bouton-vert" type="button" data-cp-assoc="O">Oui</button><button class="bouton bouton-brun" type="button" data-cp-assoc="N">Non</button></div>') + '</div>';
}
function associerPanneau(rep) {
  const P = PANNEAU;
  if (!P || !P.ligne) return;
  P.assoc = rep;
  if (rep === 'O') { const p = prixUnitaire(P.ligne); $('cp-prix').value = p !== '' ? textePrix(p) : ''; $('cp-prix-msg').textContent = p !== '' ? 'Le prix de la circulaire.' : 'Au poids : le prix reste à écrire.'; }
  else EPI_REFUS[P.ligne.cle + '|' + String(P.pidCirc)] = true;   // la même clé que trouverCirculaire
  majCirculairePanneau();
}
/* « Voir chez Super C » : la page du produit s'ouvre directement avec son code (vérifié le 2026-10-02 : superc.ca/…/p/<code>). */
function voirChezSuperC() {
  const code = PANNEAU && formeCode(codeDuLot(PANNEAU.lot));
  if (code) window.open('https://www.superc.ca/allees/produit/p/' + encodeURIComponent(code), '_blank');
}
/* Le texte d'une page de Super C (ou de Metro), collé : ce qu'on y lit. Essayé sur les deux pages collées par J-C le 2026-10-03
   (Tarte à la citrouille Irrésistible; Sucre granulé spécial fin Redpath). */
function lirePage(texte) {
  const t = String(texte || ''), lignes = t.split(/\r?\n/).map(s => s.replace(/\s+/g, ' ').trim()).filter(Boolean), r = {};
  const code = (t.match(/Num[ée]ro de produit\s*:?\s*(\d{6,14})/i) || [])[1];
  if (code) r.code = code;
  for (let i = 0; i < Math.min(lignes.length, 8) && !r.rid; i++) {       // le chemin du rayon : SES catégories (taillées sur Super C)
    const rr = RAYONS.find(x => cleNom(x.nom) === cleNom(lignes[i]));
    if (!rr) continue;
    r.rid = String(rr.id);
    const sc = (SOUSCATS[rr.id] || []).find(x => cleNom(x.nom) === cleNom(lignes[i + 1] || ''));
    if (sc) r.scid = String(sc.id);
  }
  const k = lignes.findIndex(l => /\p{L}{2}/u.test(l) && l === l.toUpperCase() && !/[$\d]/.test(l));   // la marque, en majuscules (« REDPATH »)
  if (k !== -1) {
    r.marque = adoucir(lignes[k]);
    if (lignes[k + 1] && !/[$]/.test(lignes[k + 1])) r.nom = lignes[k + 1];
    if (lignes[k + 2] && formatCle(lignes[k + 2])) r.format = formatStock(lignes[k + 2]);
  }
  if (!r.format) { const f = lignes.find(l => /^\d+(?:[.,]\d+)?\s*(?:kg|g|ml|l)\b/i.test(l)); if (f) r.format = formatStock(f); }
  const reg = (t.match(/Prix r[ée]gulier\s*(\d+[.,]\d{2})/i) || [])[1];
  if (reg) r.regulier = reg;
  const p = lignes.find(l => /^\d+[.,]\d{2}\s*\$/.test(l) && !/\//.test(l) && !/r[ée]gulier/i.test(l));   // le prix payé, pas celui au 100 g
  if (p) r.prix = p.match(/^(\d+[.,]\d{2})/)[1];
  const fin = (t.match(/En sp[ée]cial jusqu.au ([^\n]+)/i) || [])[1];
  if (fin) r.special = fin.trim();
  return r;
}
function collerPage(texte) {
  const P = PANNEAU;
  if (!P) return;
  const r = lirePage(texte), lu = [], m = $('cp-lu');
  if (!Object.keys(r).length) { m.textContent = texte.trim() ? 'Rien de lisible : as-tu copié le texte de la page ?' : ''; return; }
  if (r.rid) { $('cp-cat').value = r.rid; remplirSousCatPanneau(r.scid || ''); lu.push('le rayon'); }
  const scid = $('cp-souscat').value;
  if (r.nom) {                                           // l'aliment : le sien dont tous les mots sont dans le nom (le plus précis), sinon un nouveau
    const mots = motsTri(r.nom);
    const ps = PRODUITS.filter(p => (!scid || String(p.catId) === String(scid)) && motsTri(p.nom).length && motsTri(p.nom).every(w => mots.indexOf(w) !== -1))
      .sort((a, b) => motsTri(b.nom).length - motsTri(a.nom).length);
    if (scid) remplirAlimentsPanneau(ps[0] ? String(ps[0].id) : 'nouveau', ps[0] ? undefined : r.nom);
    if (ps[0]) {                                         // ce qui reste du nom devient la saveur (« Sucre granulé spécial fin » → « Granulé spécial fin »)
      const aMots = motsTri(ps[0].nom), reste = r.nom.split(' ').filter(w => !motsTri(w).length || aMots.indexOf(motsTri(w)[0]) === -1).join(' ').trim();
      if (reste && motsTri(reste).length) choisirNomPanneau('saveur', reste.charAt(0).toUpperCase() + reste.slice(1));
    }
    lu.push('le nom');
  }
  if (r.marque) { choisirNomPanneau('marque', r.marque); lu.push('la marque'); }
  if (r.format) { poserFormatPanneau(r.format); lu.push('le format'); }
  const pm = $('cp-prix-msg');
  if (r.prix) {
    if (P.ligne && P.assoc === 'O') pm.textContent = 'Le prix de la circulaire reste (associé).';
    else if (jeudiPasse(dateDuLot(P.lot), dateDuJour())) pm.textContent = 'Prix de la page pas pris : un jeudi est passé depuis l\'achat.';
    else { $('cp-prix').value = textePrix(r.prix); pm.textContent = 'Le prix de la page' + (r.special ? ' : en spécial jusqu\'au ' + r.special : '') + (r.regulier ? ' (rég. ' + textePrix(r.regulier) + ')' : '') + '.'; }
    lu.push('le prix');
  }
  const bon = !r.code || codeNu(r.code) === codeNu(codeDuLot(P.lot));
  m.className = 'message message-repli' + (bon ? '' : ' message-erreur');
  m.textContent = 'Lu : ' + lu.join(', ') + '.' + (r.code ? (bon ? ' Numéro de produit : le bon.' : ' Attention : le numéro de produit n\'est pas celui scanné.') : '');
  majCirculairePanneau();
}
/* « C'est ça » : l'aliment (catégorie, nom — ou réuni à l'aliment choisi), puis les lignes du lot (marque, saveur, format, prix). */
function validerProduit() {
  const P = PANNEAU, msg = $('cp-msg');
  if (!P) return;
  const lot = P.lot, scid = $('cp-souscat').value, v = $('cp-aliment').value, nom = $('cp-nom').value.trim();
  if (!scid) { msg.textContent = 'Choisis une catégorie et une sous-catégorie.'; return; }
  if (!v || (v === 'nouveau' && !nom)) { msg.textContent = 'Choisis l\'aliment, ou nomme le nouveau.'; return; }
  const prixTxt = $('cp-prix').value.trim(), prixNb = Number(prixTxt.replace(/\s*\$\s*/, '').replace(',', '.'));
  if (prixTxt && !(isFinite(prixNb) && prixNb >= 0)) { msg.textContent = 'Le prix : un nombre (« 2,49 »).'; return; }
  const marque = choixPanneau('marque'), saveur = choixPanneau('saveur'), format = formatPanneau();
  const endroits = [...document.querySelectorAll('#cp-endroits .endroit')].map(c => ({ emp: c.querySelector('.espace').value || c.querySelector('.meuble').value,
    q: parseInt(c.querySelector('.qte').value, 10) || 0 })).filter(e => e.q > 0);
  const total = endroits.reduce((s, e) => s + e.q, 0);
  if (total > lot.qte) { msg.textContent = 'Il y en a ' + lot.qte + '.'; return; }
  if (endroits.length > 1 && endroits.some(e => !e.emp)) { msg.textContent = 'Choisis où va chaque quantité.'; return; }
  const ventes = endroits.filter(e => e.emp && e.emp !== lot.emp);   // ce qui change de place; le reste reste où il est
  let cible = lot.pid;
  const c = lireCache(), p = PRODUITS.find(x => String(x.id) === lot.pid);
  if (v !== 'nouveau' && v !== lot.pid) {                // un autre aliment, qui existe : le produit lui est réuni (tout ce qu'il y en a)
    cible = v;
    reunirProduitsInstant(cible, lot.pid);
  } else if (p) {                                        // lui-même : sa catégorie, son nom
    const row = c && (c.prods || []).find(r => String(r[0]) === lot.pid);
    const nouveauNom = v === 'nouveau' ? nom : p.nom;
    if (row && (String(row[2] || '') !== String(scid) || String(row[1]) !== nouveauNom)) {
      const l = row.slice(); l[1] = nouveauNom; l[2] = scid;
      poserGeste({ action: 'lignes', table: 'Produits', opId: 'prodc-' + idLocal(), lignes: [l] });
    }
    p.nom = nouveauNom; p.catId = scid;
    remplirProduitsDatalist();
  }
  const op = 'prodl-' + idLocal();
  const lignes = lot.lignes.map(id => STOCK.find(r => String(r[0]) === id)).filter(Boolean).map(r => {
    const l = r.slice(); while (l.length < 14) l.push('');
    l[1] = cible; l[4] = dateCourte(l[4]); l[5] = marque; l[6] = format; l[9] = saveur; l[12] = prixTxt ? Math.round(prixNb * 100) / 100 : '';
    return l;
  });
  const ajouts = [];                                     // répartir : chaque endroit prend sa quantité, ligne par ligne; une ligne coupée en deux
  let k = 0;                                             //   garde le reste (et sa place), la part qui part devient une ligne neuve (ID d'ici, la même date)
  ventes.forEach(e => {
    let reste = e.q;
    while (reste > 0 && k < lignes.length) {
      const l = lignes[k], q = Number(l[3]) || 0;
      if (q <= reste) { l[2] = e.emp; reste -= q; k++; }
      else { const a = l.slice(); a[0] = idLocal(); a[2] = e.emp; a[3] = reste; a[7] = op; ajouts.push(a); l[3] = q - reste; reste = 0; }
    }
  });
  if (lignes.length) poserGeste({ action: 'deplacer', opId: op, modifs: lignes.map(l => ({ id: String(l[0]), ligne: l })), ajouts: ajouts });
  if (P.ligne && P.assoc === 'O' && !P.auto) relierCirculaire(P.ligne, cible, marque, saveur, codeDuLot(lot));
  memoriserVariante(cible, marque, format, ventes.length ? ventes.map(e => ({ emp: e.emp })) : (lot.emp ? [{ emp: lot.emp }] : []), saveur);   // ses places deviennent connues
  const fait = (PRODUITS.find(x => String(x.id) === cible) || {}).nom || '';
  PANNEAU = null;
  remplirCompleter();
  poserPoints();
  avis('Complété : ' + fait, 'succes');
}
/* Réunir le produit du scan (perdu) à un aliment qui existe (garde) — instantané : la mémoire tout de suite, puis l'action
   reunirProduits d'api.gs par la file des gestes (ses lots, ses sorties, ses « Pas aimé »; rejouable). */
function reunirProduitsInstant(garde, perdu) {
  poserGeste({ action: 'reunirProduits', opId: 'reun-' + idLocal(), garde: String(garde), perdu: String(perdu) });   // STOCK et le cache suivent (appliquerGeste)
  PRODUITS = PRODUITS.filter(x => String(x.id) !== String(perdu));
  Object.keys(CODES).forEach(k => { if (String(CODES[k]) === String(perdu)) CODES[k] = String(garde); });
  const vp = VARIANTES[perdu];
  if (vp) memoriserVariante(String(garde), '', '', (vp.emplacements || []).map(e => ({ emp: e })), '');
  const c = lireCache();
  if (c) { Object.keys(c.codes || {}).forEach(k => { if (String(c.codes[k]) === String(perdu)) c.codes[k] = String(garde); }); ecrireCache(c); }
  remplirProduitsDatalist();
}

function initEpicerie() {
  $('choix-completer').addEventListener('click', montrerCompleter);
  $('completer-listes').addEventListener('click', ev => {
    const b = ev.target.closest('[data-completer]');
    const row = b && EPICERIES.find(r => String(r[0]) === b.dataset.completer);
    if (row) ouvrirCompleter(row, true);
  });
  $('completer-liste').addEventListener('click', ev => {
    const r = ev.target.closest('.ranger[data-completer-lot]');
    if (r) { ouvrirLotCompleter(r); return; }
    if (ev.target.closest('[data-cp-voir]')) { voirChezSuperC(); return; }
    if (ev.target.closest('[data-cp-endroit]')) { ajouterEndroitPanneau(null, ''); return; }
    const re = ev.target.closest('#cp-endroits .endroit-retirer');
    if (re) { if ($('cp-endroits').children.length > 1) re.closest('.endroit').remove(); return; }
    const ass = ev.target.closest('[data-cp-assoc]');
    if (ass) { associerPanneau(ass.dataset.cpAssoc); return; }
    if (ev.target.closest('[data-cp-ok]')) { validerProduit(); return; }
    if (ev.target.closest('[data-cp-annuler]')) { PANNEAU = null; remplirCompleter(); return; }
    if (ev.target.closest('.endroit, [data-panneau]')) return;   // toucher la carte ou le produit ouvert ne plie rien
    const it = ev.target.closest('[data-completer-item]');
    if (it) { ouvrirProduit(Number(it.dataset.completerItem)); return; }
    const tete = ev.target.closest('.accordeon-tete');
    if (!tete) return;
    const g = tete.closest('[data-groupe]');
    COMPLETER_OUVERT = tete.classList.contains('ouvert') ? '' : (g ? g.dataset.groupe : '');
    toggleAccordeon(tete);
  });
  $('completer-ok').addEventListener('click', validerCompleter);
  $('completer-liste').addEventListener('change', ev => {
    const id = ev.target.id;
    if (id === 'cp-cat') { remplirSousCatPanneau(''); remplirAlimentsPanneau(''); }
    else if (id === 'cp-souscat') remplirAlimentsPanneau('');
    else if (id === 'cp-aliment') surAlimentPanneau();
    else if (id === 'cp-marque' || id === 'cp-saveur') { const n = $(id + '-neuve'); n.hidden = ev.target.value !== 'neuve'; if (!n.hidden) n.focus(); }
  });
  $('completer-liste').addEventListener('input', ev => { if (ev.target.id === 'cp-texte') collerPage(ev.target.value); });
  $('completer-retour').addEventListener('click', () => { if (EPI_COMPLETER && EPI_COMPLETER.plusieurs) montrerCompleter(); else montrerChoixQuoi(); });
  $('epi-magasins').addEventListener('click', ev => { const b = ev.target.closest('[data-epi-magasin]'); if (b) choisirEpicerie(b.dataset.epiMagasin); });
  $('epi-choix-retour').addEventListener('click', montrerChoixQuoi);            // Retour recule d'un pas : les deux sacs
  $('epi-retour').addEventListener('click', montrerEpiceries);                   // sort sans terminer : la liste reste ouverte
  $('epi-sans-code').addEventListener('click', () => modeSansCode(true));
  $('epi-revenir').addEventListener('click', () => modeSansCode(false));
  $('epi-carte').addEventListener('click', ev => {
    const ok = ev.target.closest('[data-epi-ok]');
    if (ok) { validerCarte(ok.dataset.epiOk); return; }
    if (ev.target.closest('[data-epi-annuler]')) annulerCarte();
  });
  $('epi-fin').addEventListener('click', ev => {
    if (ev.target.closest('[data-epi-terminer]')) { demanderTerminer(); return; }
    if (ev.target.closest('[data-epi-terminer-oui]')) { terminerEpicerie(); return; }
    if (ev.target.closest('[data-epi-terminer-non]')) afficherTerminer();
  });
  $('epi-plu').addEventListener('input', surPluEpicerie);
  $('epi-habituels-tete').addEventListener('click', () => toggleAccordeon($('epi-habituels-tete')));
  $('epi-habituels').addEventListener('click', ev => { const h = ev.target.closest('[data-epi-hab]'); if (h) choisirHabituel(Number(h.dataset.epiHab)); });
  $('epi-cat').addEventListener('change', surEpiCat);
  $('epi-souscat').addEventListener('change', surEpiSousCat);
  $('epi-produit').addEventListener('change', surEpiProduit);
  $('epi-neuf-ok').addEventListener('click', ajouterEpiNeuf);
  $('epi-nom-neuf').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); ajouterEpiNeuf(); } });
  // l'app passe en arrière-plan pendant le scan : la caméra se ferme; au retour, elle se rouvre (sauf si un article attend son OK)
  document.addEventListener('visibilitychange', () => {
    if ($('vue-epicerie').hidden || $('epi-scan').hidden || $('epi-camera').hidden) return;
    if (document.hidden) { if (window.stopScanner) window.stopScanner(); }
    else if (!EPI_CARTE) demarrerCamera();
  });
}
document.addEventListener('DOMContentLoaded', initEpicerie);
