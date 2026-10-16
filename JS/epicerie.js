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
var EPI_SANS = '';           // Sans code : 'habituels', 'entonnoir', ou '' (les deux boutons)
var epiJeton = 0;            // un code qui cherche encore quand on passe à autre chose : sa réponse ne compte plus
const EPI_CACHE_CIRC = 'rdg_circ_epicerie';   // { magasin, jour, lignes } : rouvrir la même épicerie le même jour = instantané
const EPI_CAMERA = { video: 'epi-video', msg: 'epi-msg', lu: c => surCodeEpicerie(c) };

/* ---------- 1. L'épicerie ---------- */
function montrerEpiceries() {
  toutCacher(); $('vue-epicerie').hidden = false; $('btn-burger').hidden = false;
  EPI = null; EPI_CARTE = null; epiJeton++;
  $('epi-titre').textContent = "Toute l'épicerie";
  montrer('epi-choix', true); montrer('epi-scan', false); montrer('epi-completer', false);   // Compléter vu juste avant (le + → Compléter → Retour → les deux sacs) ne reste pas dessous
  $('epi-magasin-neuf').value = ''; $('epi-magasin-msg').className = 'message message-repli'; $('epi-magasin-msg').textContent = '';
  fermerListesVides();
  remplirEpiceries();
  window.scrollTo(0, 0);
}
/* La liste où entrent les articles : celle de CE magasin, d'AUJOURD'HUI, pas close (J-C, 2026-10-14 : « après une journée les listes
   devraient se fermer, et la date d'entrée devient une nouvelle liste »). Les deux appareils d'un même jour scannent dans la même; une
   liste d'un jour passé ne reçoit plus rien (elle attend Compléter), l'épicerie touchée repart sur une liste neuve, datée du jour. */
const listeDuJour = mag => EPICERIES.find(r => String(r[1]) === String(mag) && String(r[3]) !== 'C' && String(dateCourte(r[2]) || '').slice(0, 10) === dateDuJour());
const lignesEpicerie = id => STOCK.filter(r => String(r[13] || '') === String(id));
const articles = n => n + ' article' + (n > 1 ? 's' : '');
/* Une liste d'un jour passé qui n'a plus rien à compléter (vide : ouverte puis quittée sans rien scanner; tout consommé)
   se ferme (Epiceries col. D = C), d'un geste (J-C, 2026-10-09 : « 0 article… à quoi bon »). Jamais une liste
   d'aujourd'hui : l'autre appareil y scanne peut-être, ses articles pas encore arrivés ici. L'épicerie touchée ensuite repart sur une
   liste neuve, datée du jour (la bonne circulaire). */
function fermerListesVides() {
  const auj = dateDuJour();
  const vides = EPICERIES.filter(r => String(r[3]) !== 'C' && String(dateCourte(r[2]) || '').slice(0, 10) < auj && !lignesACompleter(r[0]).length);
  if (!vides.length) return;
  poserGeste({ action: 'lignes', table: 'Epiceries', opId: 'epiv-' + idLocal(),
    lignes: vides.map(r => { const l = r.slice(); while (l.length < 5) l.push(''); l[3] = 'C'; return l; }) });
  poserPoints();
}
/* Les épiceries en tuiles, sur 2 colonnes, comme la page Circulaires (J-C, 2026-10-14) : leur logo, sinon leur nom sur leur couleur.
   Rien n'y dit qu'une liste attend (J-C : « pourquoi ? » — toucher l'épicerie entre dans la liste du jour de toute façon; Compléter a
   son point rouge). */
function remplirEpiceries() {
  const xs = LISTES.Magasins.slice().sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
  $('epi-magasins').innerHTML = xs.length ? '<div class="grille">' + xs.map(x => tuileMagasin(x.id, 'data-epi-magasin="' + esc(x.id) + '"')).join('') + '</div>'
    : '<div class="accordeon-item"><span class="texte-petit texte-pale">Aucun magasin.</span></div>';
}
/* « Nouveau magasin… » (J-C, 2026-10-09 : « dans les 2 sacs, faudrait pouvoir ajouter un magasin ») : créé comme dans Gérer les
   bases → Magasins (sa circulaire à Oui), puis ouvert tout de suite pour scanner — on l'ajoute parce qu'on y est. Un nom déjà là : lui. */
async function ajouterEpicerie() {
  const champ = $('epi-magasin-neuf'), msg = $('epi-magasin-msg'), btn = $('btn-epi-magasin');
  const nom = champ.value.trim();
  msg.className = 'message message-repli'; msg.textContent = '';
  if (!nom || btn.disabled) return;
  const deja = LISTES.Magasins.find(m => cleNom(m.nom) === cleNom(nom));
  let id = deja ? String(deja.id) : '';
  if (!id) {
    btn.disabled = true; montrerVoile(true);
    try { id = await creerMagasin(nom); }
    catch (e) {
      msg.className = 'message message-repli message-erreur'; msg.textContent = 'Pas ajouté — réessaie.';
      chargerReferences().then(() => { if (!$('vue-epicerie').hidden && !$('epi-choix').hidden) remplirEpiceries(); });   // créé quand même ? il paraît
      return;
    } finally { btn.disabled = false; montrerVoile(false); }
  }
  champ.value = '';
  remplirEpiceries();
  choisirEpicerie(id);
}
/* L'épicerie touchée : sa liste pas encore close, ou une nouvelle (instantanée : elle part dans la file); puis sa circulaire. */
async function choisirEpicerie(mag) {
  const m = LISTES.Magasins.find(x => String(x.id) === String(mag));
  if (!m) return;
  let l = listeDuJour(mag);
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
  montrer('epi-choix', false); montrer('epi-scan', true); montrer('epi-completer', false);
  remplirListeEpicerie();
  modeSansCode(false);
  window.scrollTo(0, 0);
}
function demarrerCamera() { if (window.scanContinu) window.scanContinu(EPI_CAMERA); }
function reprendreCamera() { if (window.reprendreScan) window.reprendreScan(EPI_CAMERA); }
/* « Sans code » : la caméra laisse sa place à deux boutons, les habituels (le cœur) et l'entonnoir (J-C, 2026-10-15, C sur aperçu :
   « trop d'info en même temps »). L'un touché, l'autre disparaît et son contenu paraît; la flèche ramène aux deux, puis au scan.
   Le PLU d'un fruit : « Taper le code », sous la caméra (le champ PLU d'ici faisait double emploi). */
function modeSansCode(on) {
  montrer('epi-camera', !on); montrer('epi-sans', on);
  fermerCarte();
  if (on) {
    if (window.stopScanner) window.stopScanner();
    reinitSansCode();
    choisirSans('');
  } else demarrerCamera();
}
/* Les habituels ou l'entonnoir ('' : les deux boutons, rien d'ouvert). */
function choisirSans(quoi) {
  EPI_SANS = quoi;
  $('epi-sans-choix').querySelectorAll('[data-sans]').forEach(b => { b.hidden = !!quoi && b.dataset.sans !== quoi; });
  montrer('epi-habituels', quoi === 'habituels'); montrer('epi-entonnoir', quoi === 'entonnoir');
  if (!quoi) fermerCarte();
}
function fermerCarte() { EPI_CARTE = null; epiJeton++; $('epi-carte').innerHTML = ''; }

/* Un code lu. Ses données d'abord (instantané); sinon la recherche (identifierCode). */
async function surCodeEpicerie(code) {
  code = lirePese(String(code || '').trim());           // un paquet pesé au magasin : sa clé (le prix lu, à côté)
  if (!code || !EPI) return;
  const jeton = ++epiJeton;
  const connu = articleConnu(code);
  if (connu) { montrerCarte(connu); return; }
  if (estPese(code)) { montrerCarte(articleNouveau(code, null)); return; }   // un code de magasin : personne d'autre ne le connaît
  if (estPlu(code)) {                                    // 4 ou 5 chiffres tapés (« Taper le code ») : un PLU, comme dans Sans code
    await chargerPlu();
    if (jeton !== epiJeton || $('epi-scan').hidden) return;
    const nom = nomPlu(code);
    if (nom) { montrerCarte(articlePlu(code, nom)); return; }
  }
  const local = codeCirculaire(code);                    // dans une circulaire d'IGA : tout de suite, sans réseau
  if (local) { montrerCarte(articleNouveau(code, local)); return; }
  $('epi-carte').innerHTML = '<div class="carte bloc-suite carte-scan"><div class="message">Recherche du produit…</div>' +
    '<button class="bouton bouton-pleine bouton-quitter" type="button" data-epi-annuler>Annuler</button></div>';
  const recherche = identifierCode(code);
  chariotPendant(recherche, 'Recherche du produit…');   // le chariot : on voit qu'elle travaille (5 s au plus, elle continue derrière)
  const r = await recherche;
  if (jeton !== epiJeton || $('epi-scan').hidden) return;   // annulé, ou parti ailleurs entre-temps
  montrerCarte(articleNouveau(code, r));
}
/* Un code qui n'est pas à nous : UN appel au coffre-fort (les circulaires d'IGA, puis Open Food Facts) — un coffre-fort pas encore
   à jour : Open Food Facts directement. La même recherche pour les deux sacs et pour Ajouter (J-C, 2026-10-09). */
async function identifierCode(code) {
  if (estPese(code)) return { source: '' };              // un code de magasin (la viande) : ni IGA ni Open Food Facts
  let r = null;
  if (!CODES_CIRC.complet) {                             // l'archive d'IGA pas encore sur l'appareil : le coffre-fort la lit
    try { r = await Coffre.identifier(code); } catch (e) {}
    if (r && r.ok) return r;
  }
  let d = null;
  if (typeof window.chercherOFF === 'function') { try { d = await window.chercherOFF(code); } catch (e) {} }
  return d && d.trouve ? { source: 'off', texte: d.nom || d.nomAutre, marque: d.marque, format: d.format, photo: d.photo } : { source: '' };
}
/* ---------- LES CODES DES CIRCULAIRES, SUR L'APPAREIL (J-C, 2026-10-13 : « on ne sait pas s'il travaille »; « lire un Sheet, ça devrait
   pas être si long, surtout si ça roule en arrière du temps que je fasse des choix d'action ») ----------
   Chargés en arrière-plan à l'ouverture (sans chariot), gardés sur l'appareil, refaits une fois par jour (tant que seule la semaine
   d'IGA est là, à chaque chargement : l'archive arrive dès que le coffre-fort la donne) : un produit qu'IGA a eu en
   circulaire est reconnu TOUT DE SUITE au scan, sans réseau. Le coffre-fort les donne en une liste compacte (`codesCirculaires` : la
   semaine et l'archive d'un an — `complet`); tant qu'il ne connaît pas cette action, la circulaire d'IGA de la semaine seulement
   (`circulaireMagasin`) — et `identifier` lit encore l'archive. Ne reste au réseau qu'Open Food Facts (le chariot, 5 s au plus). */
const CACHE_CODES_CIRC = 'rdg_codes_circ';
var CODES_CIRC = (() => { try { return JSON.parse(localStorage.getItem(CACHE_CODES_CIRC) || 'null') || { codes: {} }; } catch (e) { return { codes: {} }; } })();
let chargementCodesCirc = false;
async function chargerCodesCirculaires() {
  if (chargementCodesCirc || (CODES_CIRC.complet && CODES_CIRC.jour === dateDuJour())) return;   // pas encore l'archive : on réessaie à chaque chargement
  chargementCodesCirc = true;
  try {
    let r = null, complet = true;
    try { r = await Coffre.codesCirculaires(); } catch (e) {}
    if (!(r && r.ok && r.codes)) {                       // le coffre-fort ne la connaît pas encore : la semaine d'IGA (TEMPORAIRE, jusqu'au collage)
      complet = false;
      const iga = LISTES.Magasins.find(m => cleNom(m.nom) === 'iga' && m.circ !== false);
      if (!iga) return;
      try { r = await Coffre.circulaireMagasin(String(iga.id)); } catch (e) { return; }
      if (!(r && r.ok)) return;
      const codes = {};
      (r.lignes || []).forEach(l => {
        const k = formeCode(l.code);
        if (k) codes[k] = [l.texte || '', l.marque ? nomListe(l.marque) : (l.marqueFlipp || ''), String(l.format || '').split(' + ')[0], l.photo || ''];
      });
      r = { codes: codes };
    }
    CODES_CIRC = { jour: dateDuJour(), complet: complet, codes: r.codes };
    try { localStorage.setItem(CACHE_CODES_CIRC, JSON.stringify(CODES_CIRC)); } catch (e) {}
  } finally { chargementCodesCirc = false; }
}
/* Un code des circulaires, trouvé sur l'appareil : la même réponse qu'`identifier` (null : pas là). */
function codeCirculaire(code) {
  const c = CODES_CIRC.codes || {}, x = c[formeCode(code)] || c[String(code || '').trim()];
  return x ? { ok: true, source: 'circulaire', texte: x[0], marque: x[1], format: x[2], photo: x[3] } : null;
}
const produitActif = pid => PRODUITS.some(p => String(p.id) === String(pid));
/* Déjà à nous (Stock : sa dernière entrée donne la marque, la saveur, le format), ou appris au tri. */
function articleConnu(code) {
  const k = formeCode(code), pid = CODES[code] || CODES[k];
  if (pid && produitActif(pid)) {
    const l = derniereLigneCode(code);
    return { code: code, pid: String(pid), marque: l ? String(l[5] || '') : '', saveur: l ? String(l[9] || '') : '',
             format: l && !estPese(code) ? String(l[6] || '') : '' };   // un paquet pesé : son poids, J-C le tape
  }
  const t = CODES_TRI[k] || CODES_TRI[code];
  if (t && produitActif(t[0])) return { code: code, pid: String(t[0]), marque: String(t[1] || ''), saveur: String(t[2] || ''), format: '' };
  return null;
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
  const pese = estPese(a.code);
  a.prixPese = pese ? prixPese(a.code) : '';
  const m = trouverCirculaire(a);
  a.ligne = m ? m.ligne : null; a.auto = !!(m && m.auto);
  const prod = a.pid ? PRODUITS.find(p => String(p.id) === String(a.pid)) : null;
  const nom = a.nouveau ? (a.nouveau.inconnu ? 'Produit inconnu' : a.nouveau.nom) : (prod ? prod.nom : '');
  const marqueNom = a.marque ? nomListe(a.marque) : (a.nouveau ? a.nouveau.marqueNom : '');
  const detail = [marqueNom, a.saveur ? nomListe(a.saveur) : '', a.format].filter(Boolean).join(' · ') || (estPlu(a.code) ? 'PLU ' + a.code : '');
  let h = '<div class="item">' + (a.photo ? '<img class="tri-photo" src="' + esc(a.photo) + '" alt="">' : '') +
    '<div class="item-info"><div class="item-nom">' + esc(nom) + '</div>' + (detail ? '<div class="item-detail">' + esc(detail) + '</div>' : '') +
    (a.nouveau && a.nouveau.inconnu ? '<div class="code-barres">' + esc(a.code) + '</div>' : '') + '</div>' +
    '<button class="off" type="button" data-off-carte hidden aria-label="Photos pour Open Food Facts"></button></div>';   // le logo d'Open Food Facts : quand il lui manque quelque chose (offCarte)
  if (a.ligne && a.auto) h += '<div class="message message-succes">En circulaire : ' + esc(textePrixLigne(a.ligne)) + '</div>';
  if (a.ligne && !a.auto) h += '<div class="bloc-suite"><div class="label">Dans la circulaire de ' + esc(EPI.nom) + '</div>' + htmlLigneCirc(a.ligne) + '</div>';
  if (a.prixPese !== '') h += '<div class="message message-succes">Prix payé : ' + esc(textePrix(a.prixPese)) + ' $</div>';
  h += pese ? htmlPoids() : htmlQuantite();             // un paquet pesé : toujours 1; son poids à la place (choix A sur aperçu)
  h += a.ligne && !a.auto
    ? '<div class="bloc-suite"><div class="label-fort">L\'associer à ce produit ?</div><div class="grille bloc-suite">' +
      '<button class="bouton bouton-vert" type="button" data-epi-ok="O">Oui</button>' +
      '<button class="bouton bouton-brun" type="button" data-epi-ok="N">Non</button></div></div>'
    : '<button class="bouton bouton-vert bouton-pleine bouton-suite" type="button" data-epi-ok="">OK</button>';
  h += '<button class="bouton bouton-pleine bouton-quitter" type="button" data-epi-annuler>Annuler</button>';
  $('epi-carte').innerHTML = '<div class="carte bloc-suite carte-scan">' + h + '</div>';
  if (!pese) brancherPlusMoins($('epi-carte').firstElementChild, 99);
  offCarte(a);                                           // ce qui manque à Open Food Facts (JS/off.js) : son logo, s'il y a lieu
}
/* Une ligne de la circulaire, au complet (J-C : « sinon je peux pas répondre ») : sa photo, son nom, son format, son prix (le régulier). */
function htmlLigneCirc(l) {
  const fmt = formatAffiche(l.format).replace(/(\d)x(\d)/g, '$1 x $2').replace(/ \+ /g, ' ou ') || l.description || '';
  const reg = textePrix(l.regulier), prix = textePrixLigne(l);
  return '<div class="item">' + (l.photo ? '<img class="tri-photo" src="' + esc(l.photo) + '" alt="">' : '<span class="tri-photo tri-photo-vide"></span>') +
    '<div class="item-info"><div class="item-nom">' + esc(adoucir(l.texte)) + '</div><div class="item-detail">' +
    esc([fmt, prix + (reg ? ' (' + reg + ')' : '')].filter(Boolean).join(' · ')) + '</div></div></div>';
}
/* Le poids d'un paquet pesé au magasin, à la place de la quantité (J-C, 2026-10-15, choix A sur aperçu : le poids seul). Vide, il
   entre quand même. */
function htmlPoids() {
  return '<div class="bloc bloc-detache"><div class="label">Poids</div><div class="poids">' +
    '<input class="champ" type="text" inputmode="decimal" autocomplete="off" enterkeyhint="done" data-poids>' +
    '<span class="poids-unite">kg</span></div><div class="message message-erreur message-repli" data-poids-msg></div></div>';
}
function textePrixLigne(l) { const u = String(l.unite || '').trim(); return textePrix(l.prix) + (u ? (u[0] === '/' ? '' : ' ') + u : ''); }
/* Le prix payé, d'après la circulaire : « 2 pour 7 $ » = 3,50 chacun (J-C); au poids (« /lb », « le 100 g ») : le paquet a son
   propre prix, on le laisse vide (la viande emballée au magasin : son code le donne, lirePese). Le prix membre est celui de la circulaire (ils ont les cartes). */
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
  if (!a || !EPI || !carte || !carte.querySelector('.qte, [data-poids]')) return;
  const champPoids = carte.querySelector('[data-poids]'), poids = champPoids ? lirePoids(champPoids.value) : '';
  if (poids === null) {                                  // « 1022 » : des grammes ? un poids se tape en kilos
    carte.querySelector('[data-poids-msg]').textContent = 'Le poids en kilos : 1,022, par exemple.';
    champPoids.focus(); return;
  }
  const qte = champPoids ? 1 : Math.max(1, parseInt(carte.querySelector('.qte').value, 10) || 1);
  let pid = a.pid, marque = a.marque || '', saveur = a.saveur || '';
  if (!pid) {
    const n = a.nouveau, deja = !n.inconnu && PRODUITS.find(p => cleNom(p.nom) === cleNom(n.nom));   // le même nom déjà à nous : lui
    pid = deja ? String(deja.id) : creerAlimentInstant(n.nom, '');    // sans catégorie : Compléter (ou Gérer les bases → Aliments)
    marque = n.marqueId || idListeOuNeuve('Marques', n.marqueNom);   // la marque d'un produit neuf : retrouvée, sinon créée
    saveur = n.saveurId || '';
  }
  pid = String(pid);
  const l = a.ligne, avecCirc = !!l && (a.auto || rep === 'O');
  const prix = champPoids ? a.prixPese : avecCirc ? prixUnitaire(l) : '';   // un paquet pesé : le prix de son code, toujours
  const emp = premierEndroit(pid), id = idLocal(), opId = 'epi-' + id, qui = localStorage.getItem(QUI) || '', code = a.code || '';
  const format = champPoids ? (poids ? poids + ' kg' : '') : a.format || '';
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
  if (offApresCarte(a, pid)) return;                     // Open Food Facts : sur sa liste; son logo touché : l'écran des photos, puis on revient scanner
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

/* « Épicerie du 14 octobre » (J-C, 2026-10-15 : à la place de « Déjà scanné (13) »; à part des actions, sous un bandeau foncé — 3 sur
   aperçu) : les lignes de STOCK de cette liste, une par produit (même aliment, marque, saveur, format, code), le dernier scanné en haut;
   rescanner le même article fait monter sa quantité. */
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
  const r = EPICERIES.find(x => String(x[0]) === EPI.id), jour = jourLong(r ? r[2] : dateDuJour());
  $('epi-liste').innerHTML = !groupes.length ? '' : '<div class="bloc-detache"><div class="espace-bandeau bandeau-fonce">' + esc(jour ? 'Épicerie du ' + jour : 'Épicerie') + '</div><div class="liste-blanche">' +
    groupes.reverse().map(g => {
      const p = PRODUITS.find(x => String(x.id) === g.pid);
      const det = [nomListe(g.marque), nomListe(g.saveur), g.format].filter(Boolean).join(' · ') || (estPlu(g.code) ? 'PLU ' + g.code : '');
      return '<div class="item"><div class="item-info"><div class="item-nom">' + esc(p ? p.nom : '') + '</div>' +
        (det ? '<div class="item-detail">' + esc(det) + '</div>' : '') + '</div><span class="item-quantite">' + esc(g.qte) + '</span></div>';
    }).join('') + '</div></div>';
}

/* ---------- 3. Sans code : les habituels, l'entonnoir ---------- */
function reinitSansCode() {
  remplirHabituels();
  $('epi-cat').innerHTML = optionsCats();
  surEpiCat();                                           // tout ce qui suit la catégorie, caché
  $('epi-nom-neuf').value = '';
}
/* Les habituels sans code : ce qu'on a déjà entré sans code-barres (ou avec un PLU). TOUS (J-C, 2026-10-14 : « les 12 me semble petit…
   les légumes et fruits, les vracs »), en cases sur 3 colonnes, un bandeau par catégorie, dans son ordre, chacune en ordre alphabétique
   (on cherche un nom, pas un rang); « Sans catégorie » au bout. Une case = une sorte : le nom, dessous la marque · la saveur — ni le PLU
   ni le format (J-C : « la qte est dans la suite »); touchée, la carte prend le PLU et le format de sa dernière entrée. */
function remplirHabituels(cible) {   // cible : où les poser (les deux sacs, sinon le sac seul)
  const par = {}, xs = [];
  STOCK.forEach(r => {
    const code = String(r[8] || '').trim(), pid = String(r[1] || ''), marque = String(r[5] || ''), saveur = String(r[9] || '');
    if ((code && !estPlu(code)) || !produitActif(pid) || estReste(r)) return;   // un vrai code-barres : il se scanne; le reste d'un pack entamé n'est pas une entrée
    const k = pid + '|' + marque + '|' + saveur;
    let x = par[k];
    if (!x) { x = par[k] = { pid: pid, marque: marque, saveur: saveur }; xs.push(x); }
    x.code = code; x.format = String(r[6] || '');   // la plus récente
  });
  xs.forEach(x => {
    const p = PRODUITS.find(y => String(y.id) === x.pid);
    x.nom = p ? p.nom : ''; x.rid = p ? rayonDe(p.catId) : '';
    x.det = [nomListe(x.marque), nomListe(x.saveur)].filter(Boolean).join(' · ');
  });
  const rang = rid => { const i = rid ? RAYONS.findIndex(r => String(r.id) === rid) : -1; return i === -1 ? RAYONS.length : i; };
  EPI_HABITUELS = xs.sort((a, b) => rang(a.rid) - rang(b.rid) || a.nom.localeCompare(b.nom, 'fr') || a.det.localeCompare(b.det, 'fr'));
  let h = '', rid = null;
  EPI_HABITUELS.forEach((x, i) => {
    if (x.rid !== rid) { rid = x.rid; const ry = RAYONS.find(r => String(r.id) === rid); h += '<div class="espace-bandeau"' + teinteCategorie(rid).style + '>' + esc(ry ? ry.nom : 'Sans catégorie') + '</div>'; }
    h += '<div class="item" data-epi-hab="' + i + '"><div class="item-info"><div class="item-nom">' + esc(x.nom) + '</div>' +
      (x.det ? '<div class="item-detail">' + esc(x.det) + '</div>' : '') + '</div></div>';
  });
  (cible || $('epi-habituels')).innerHTML = h ? '<div class="liste-blanche liste-cases">' + h + '</div>'
    : '<div class="liste-blanche"><div class="item"><div class="item-info"><div class="texte-petit texte-pale">Rien encore : ils viendront au fil des épiceries</div></div></div></div>';
}
function choisirHabituel(i) {
  const x = EPI_HABITUELS[i];
  if (x) montrerCarte({ code: x.code, pid: x.pid, marque: x.marque, saveur: x.saveur, format: x.format, sansCode: true });
}
/* Le sac seul, « Sans code » (J-C, 2026-10-15 : « le même choix pour un sac, sauf qu'il n'a pas de liste ») : la caméra laisse sa place
   aux deux mêmes boutons. Le cœur : les habituels; l'un touché → la fiche, remplie (sa marque, sa saveur, son format; son PLU s'il en a
   un). L'entonnoir : la fiche à la main. La flèche recule d'un pas (un choix → les deux boutons → la caméra → le choix des sacs);
   Annuler de la fiche ramène d'où elle est venue. */
var SEUL_SANS = null;        // le sac seul : null (la caméra), '' (les deux boutons), 'habituels'
function montrerSansSeul(quoi) {
  if (window.stopScanner) window.stopScanner();
  if ($('vue-scan').hidden) {                            // revenu de la fiche (Annuler)
    toutCacher(); $('vue-scan').hidden = false; $('btn-burger').hidden = false; $('scan-titre').textContent = 'Entrer un article';
  }
  SEUL_SANS = quoi;
  ['scan-video', 'scan-msg', 'scan-choix', 'scan-resultat'].forEach(id => montrer(id, false));
  $('vue-scan').querySelectorAll('.saisie-neuve[data-ajout="code"]').forEach(l => { l.hidden = true; });
  montrer('scan-sans', true);
  $('scan-sans-choix').querySelectorAll('[data-sans]').forEach(b => { b.hidden = !!quoi && b.dataset.sans !== quoi; });
  if (quoi === 'habituels') remplirHabituels($('scan-habituels'));
  montrer('scan-habituels', quoi === 'habituels');
}
function retourSeul() {
  if (SEUL_SANS === 'habituels') montrerSansSeul('');
  else if (SEUL_SANS === '') montrerScanProduit();
  else montrerChoixQuoi();
}
function choisirSansSeul(quoi) {
  if (SEUL_SANS) { montrerSansSeul(''); return; }        // le bouton choisi, retouché : les deux, comme la flèche
  if (quoi === 'habituels') { montrerSansSeul('habituels'); return; }
  montrerFormulaire(false);                              // l'entonnoir : la fiche à la main
  annulerFiche = () => montrerSansSeul('');
}
/* Un habituel touché (le sac seul) : la fiche, sa sorte remplie. Un PLU : comme tapé (le code connu donne sa dernière entrée). */
function ouvrirHabituelSeul(x) {
  if (!x) return;
  if (x.code) ouvrirFicheScan(x.code);
  else {
    const p = PRODUITS.find(y => String(y.id) === String(x.pid));
    ouvrirFicheNom(p ? p.nom : '');
    if (produitCourant !== null) {
      if (nomListe(x.marque)) choisirParNom('marque', nomListe(x.marque)); else $('marque').value = '';
      if (nomListe(x.saveur)) choisirParNom('saveur', nomListe(x.saveur)); else $('saveur').value = '';
      if (String(x.format || '').trim()) poserFormat(String(x.format).trim());
    }
  }
  annulerFiche = () => montrerSansSeul('habituels');
}
/* L'article d'un PLU tapé (« Taper le code », sous la caméra : après OK, la caméra reprend) : l'aliment à qui il a déjà servi, sinon
   celui qui porte le même nom, sinon un aliment neuf au nom officiel. */
function articlePlu(v, nom) {
  const connu = articleConnu(v), alim = !connu && alimentPourPlu(nom);
  return connu || (alim ? { code: v, pid: String(alim.id), marque: '', saveur: '', format: '' } : { code: v, pid: null, nouveau: { nom: nom }, format: '' });
}
function alimentPourPlu(nom) {
  const mots = motsTri(nom);
  if (!mots.length) return null;
  const c = PRODUITS.filter(p => { const m = motsTri(p.nom); return m.length && m[0] === mots[0] && m.every(w => mots.indexOf(w) !== -1); });
  return c.sort((a, b) => motsTri(b.nom).length - motsTri(a.nom).length)[0] || null;   // le plus précis
}
/* L'entonnoir : Catégorie → Sous-catégorie → Produit (« Nouveau produit… » au bout : son nom à la place du menu, le +). */
function surEpiCat() {
  const rid = $('epi-cat').value, ok = vraieCat(rid);
  majSaisie($('epi-cat'), true);                         // « Nouvelle catégorie… » : son nom à la place du menu
  $('epi-souscat').innerHTML = optionsCats(ok ? rid : '');
  majSaisie($('epi-souscat'));
  montrer('epi-souscat', ok); montrer('epi-produit', false); montrer('epi-neuf', false);
}
function surEpiSousCat() {
  const scid = $('epi-souscat').value, ok = vraieCat(scid);
  majSaisie($('epi-souscat'), true);
  const ps = ok ? PRODUITS.filter(p => String(p.catId) === String(scid)).sort((a, b) => a.nom.localeCompare(b.nom, 'fr')) : [];
  $('epi-produit').innerHTML = options(ps, '— Produit —') + '<option value="nouveau">Nouveau produit…</option>';
  montrer('epi-produit', ok); montrer('epi-neuf', false);
}
function surEpiProduit() {
  const v = $('epi-produit').value;
  if (majSaisie($('epi-produit'), true)) { fermerCarte(); return; }
  if (v) montrerCarte({ code: '', pid: v, marque: '', saveur: '', format: '', sansCode: true });
}
/* Le + de « Nouveau produit… » : l'aliment (retrouvé ou neuf) revient choisi dans le menu, et sa carte s'ouvre. */
function ajouterEpiNeuf() {
  const nom = $('epi-nom-neuf').value.trim(), scid = $('epi-souscat').value;
  if (!nom || !scid) { $('epi-nom-neuf').focus(); return; }
  const deja = alimentDuNom(nom, scid);                  // déjà là (ici, ou ailleurs : né sans catégorie d'une épicerie) : lui, jamais un double
  const pid = deja ? String(deja.id) : creerAlimentInstant(nom, scid);
  surEpiSousCat();                                       // le menu refait (l'aliment neuf y est), la ligne de saisie cachée
  $('epi-nom-neuf').value = '';
  choisirOption($('epi-produit'), pid, deja ? deja.nom : nom);
  montrerCarte({ code: '', pid: pid, marque: '', saveur: '', format: '', sansCode: true });
}

/* ---------- 4. Compléter (le + : la feuille cochée — J-C, 2026-10-04, sur aperçu) ----------
   L'épicerie, groupée par meuble comme l'Inventaire par meuble : « À placer » d'abord (ce qui n'a pas de place : l'Escale), puis
   les meubles, chacun avec ses espaces en bandeaux. Les deux flèches d'un article ouvrent la carte de l'Escale (placer, corriger,
   répartir : une partie seulement). OK : ce qui est placé et a sa catégorie quitte la liste (STOCK col. O = le jour, par la file
   des gestes); le reste attend, avec le point rouge. Plus rien : la liste est close (Epiceries col. D = C). Le + → Compléter : les
   épiceries qui attendent, en tuiles avec leur point rouge (J-C, 2026-10-14 : « le même genre de page en icône, avec juste un point
   rouge comme partout »). */
var EPI_COMPLETER = null;    // la liste ouverte : { id, magasin, nom }; null = les tuiles
var LOTS_COMPLETER = [];     // ses lots, comme l'Escale : { pid, emp, marque, saveur, formats, qte, lignes }
var COMPLETER_OUVERT = '';   // le groupe ouvert ('escale' ou l'ID d'un meuble) : il le reste après un geste
const lignesACompleter = id => STOCK.filter(r => String(r[13] || '') === String(id) && !String(r[14] || '') && Number(r[3]) > 0);
const aCategorie = pid => { const p = PRODUITS.find(x => String(x.id) === String(pid)); return !!(p && p.catId); };
/* Les épiceries où il y a du travail, en tuiles (A sur aperçu : seulement celles-là), le point rouge sur chacune; rien d'écrit. */
function montrerCompleter() {
  const xs = aCompleter();
  if (!xs.length) { avis('Rien à compléter'); return; }
  toutCacher(); $('vue-epicerie').hidden = false; $('btn-burger').hidden = false;
  EPI_COMPLETER = null;
  $('epi-titre').textContent = 'Compléter';
  montrer('epi-choix', false); montrer('epi-scan', false); montrer('epi-completer', true);
  PANNEAU = null; $('completer-produit').innerHTML = ''; majVueCompleter(); montrer('completer-ok', false);   // une carte restée ouverte (le menu, une autre page) : fermée
  $('completer-liste').innerHTML = '';
  const mags = [...new Set(xs.map(r => String(r[1])))].sort((a, b) => nomListe(a).localeCompare(nomListe(b), 'fr'));
  $('completer-listes').innerHTML = '<div class="grille">' + mags.map(m => tuileMagasin(m, 'data-completer="' + esc(m) + '"', 'point-rouge')).join('') + '</div>';
  window.scrollTo(0, 0);
}
/* Une épicerie touchée : sa plus vieille liste qui attend (une liste par jour : deux jours chez Metro = deux listes; la suivante
   attend sous la même tuile, qui garde son point). */
function ouvrirCompleterMagasin(m) {
  const row = aCompleter().filter(r => String(r[1]) === String(m)).sort((a, b) => String(dateCourte(a[2]) || '').localeCompare(String(dateCourte(b[2]) || '')))[0];
  if (row) ouvrirCompleter(row);
}
function ouvrirCompleter(row) {
  EPI_COMPLETER = { id: String(row[0]), magasin: String(row[1]), nom: nomListe(row[1]) };
  toutCacher(); $('vue-epicerie').hidden = false; $('btn-burger').hidden = false;
  $('epi-titre').textContent = EPI_COMPLETER.nom;
  montrer('epi-choix', false); montrer('epi-scan', false); montrer('epi-completer', true);
  $('completer-listes').innerHTML = '';
  COMPLETER_OUVERT = 'escale';                           // « À placer » ouvert d'abord : c'est là qu'il y a quelque chose à faire
  PANNEAU = null; $('completer-produit').innerHTML = '';
  remplirCompleter();
  majVueCompleter();
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
  const groupe = (cle, titre, attrs, pale, corps, apres) => '<div class="accordeon" data-groupe="' + esc(cle) + '"' + attrs + '><div class="accordeon-tete' + pale + (COMPLETER_OUVERT === cle ? ' ouvert' : '') + '">' +
    esc(titre) + (apres || '') + '</div><div class="accordeon-corps"' + (COMPLETER_OUVERT === cle ? '' : ' hidden') + '>' + corps + '</div></div>';
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
    h += groupe(String(m.id), m.nom, teinte ? ' style="--meuble:' + esc(teinte) + '"' : '', teinte && couleurPale(teinte) ? ' tete-pale' : '', corps, floconDe(m));   // la couleur du meuble est une DONNÉE; un congélateur, son flocon
  });
  $('completer-liste').innerHTML = h || '<div class="vide"><div class="vide-titre">Tout est complété</div></div>';
  montrer('completer-ok', !!h && !PANNEAU);              // une carte ouverte : la liste attend derrière
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
    }, true);                                            // Compléter compte les boîtes de l'épicerie
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
    if (aCompleter().length) montrerCompleter(); else montrerChoixQuoi();   // une autre attend : les tuiles; sinon, l'écran du +
    return;
  }
  poserPoints();
  avis((nFaits ? articles(nFaits) + ' rangé' + (nFaits > 1 ? 's' : '') + ' · ' : '') + nReste + ' attend' + (nReste > 1 ? 'ent' : '') + ' (à placer ou sans catégorie)', nFaits ? 'succes' : 'avis');
  remplirCompleter();
}

/* ---------- 5. Compléter pour vrai : le produit et son prix (J-C, 2026-10-04 : « quand je complète, je complète pour vrai »;
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
/* COMPLÉTER EN QUATRE ÉTAPES (J-C, 2026-10-15 : « Oh que c'est pas convivial, les étapes devraient être séparées, la lecture de ce que je
   colle du site de Super C devrait être approuvée, le code-barres devrait être écrit quelque part, le nom français devrait être
   suggéré »; l'aperçu : « Go ») — une carte à la place de la liste (le reste se cache, comme au tri), une étape à la fois :
   1 le produit (son nom, son code-barres; Voir chez Super C, Coller la page — le texte du raccourci « Copier pour la Réserve »);
   2 ce que l'app a lu (Oui, c'est ça / Corriger — sans la page : la marque, le format, le prix à remplir);
   3 ton aliment (le rayon lu, le nom français proposé; la circulaire, s'il y a lieu); 4 où il est rangé, C'est fait.
   Tous les champs vivent dans la carte du début à la fin : « C'est fait » les lit comme avant (validerProduit). */
function ouvrirProduit(i) {
  const lot = LOTS_COMPLETER[i];
  if (!lot) return;
  PANNEAU = { i: i, lot: lot, ligne: null, assoc: '', auto: false, etape: 1, lu: null, corriger: false };
  $('completer-produit').innerHTML = htmlPanneau(lot);
  majVueCompleter();
  const p = PRODUITS.find(x => String(x.id) === lot.pid) || { nom: '', catId: '' };
  const rid = p.catId ? rayonDe(p.catId) : '';
  $('cp-cat').innerHTML = optionsCats(); $('cp-cat').value = rid;
  remplirSousCatPanneau(p.catId);
  remplirAlimentsPanneau(p.catId ? lot.pid : 'nouveau', p.nom);
  $('cp-marque').innerHTML = optionsListe('marque', sortesVues(lot.pid, 'marque'), lot.marque); $('cp-marque').value = lot.marque || '';
  $('cp-saveur').innerHTML = optionsListe('saveur', sortesVues(lot.pid, 'saveur'), lot.saveur); $('cp-saveur').value = lot.saveur || '';
  poserFormatPanneau(lot.formats[0] || '');
  ajouterEndroitPanneau(resoudreEmp(lot.emp || premierEndroit(lot.pid)), lot.qte);   // sa place (ou sa place habituelle) et toute la quantité
  const prix = prixDuLot(lot);
  $('cp-prix').value = prix !== '' ? textePrix(prix) : '';
  allerEtape(1);
  photoProduitPanneau();
}
/* La carte ouverte, ou la liste : jamais les deux (le reste de la liste se cache, comme au tri). */
function majVueCompleter() {
  const ouvert = !!PANNEAU;
  montrer('completer-produit', ouvert);
  montrer('completer-liste', !ouvert);
  montrer('completer-retour', !ouvert);
  montrer('completer-ok', !ouvert && !!LOTS_COMPLETER.length);
}
function fermerProduit() {
  PANNEAU = null;
  $('completer-produit').innerHTML = '';
  remplirCompleter();
  majVueCompleter();
}
function htmlPanneau(lot) {
  const code = formeCode(codeDuLot(lot)), page = code.length >= 8 && !estPese(code);   // une page à chercher : un vrai code-barres
  const p = PRODUITS.find(x => String(x.id) === lot.pid) || { nom: '' };
  const champ = (label, html) => '<div class="bloc"><div class="label">' + label + '</div>' + html + '</div>';
  const tete = (n, titre, id) => htmlEtapes(n, 4, titre, id);   // htmlEtapes : entree.js (le tri aussi)
  const fleche = '<button class="bouton bouton-or" type="button" data-cp-recul aria-label="Revenir"><span class="icone icone-revenir"></span></button>';
  const annuler = '<button class="bouton" type="button" data-cp-annuler>Annuler</button>';
  const bas = (texte, attr, second) => '<div class="cp-msg-place"></div><button class="bouton bouton-vert bouton-pleine bouton-detache" type="button" ' + attr + '>' + texte + '</button>' +
    '<div class="grille bloc-suite">' + second + '</div>';
  const detail = detailLot(lot);
  return '<div class="carte">' +
    '<div data-etape="1">' + tete(1, 'Le produit') +
      '<div class="liste-blanche bloc-suite"><div class="item" id="cp-produit"><div class="item-info"><div class="item-nom">' + esc(p.nom) + '</div>' +
        (detail ? '<div class="item-detail">' + esc(detail) + '</div>' : '') + (code ? '<div class="code-barres">' + esc(code) + '</div>' : '') + '</div></div></div>' +
      (page ? '<button class="bouton bouton-brun bouton-pleine bouton-detache" type="button" data-cp-voir>Voir chez Super C</button>' +
              '<div class="message">Sur sa page : Partager → Copier pour la Réserve, puis reviens ici.</div>' +
              '<textarea class="champ bloc-suite" id="cp-texte" placeholder="Colle le texte de la page ici" hidden></textarea>' +
              '<div class="cp-msg-place"></div><button class="bouton bouton-vert bouton-pleine bouton-suite" type="button" data-cp-coller>Coller la page</button>' +
              '<div class="grille bloc-suite"><button class="bouton" type="button" data-cp-sans>Sans la page</button>' + annuler + '</div>'
            : bas('Suivant', 'data-cp-sans', annuler)) +
    '</div>' +
    '<div data-etape="2" hidden>' + tete(2, 'Ce que l\'app a lu', 'cp-titre-2') +
      '<div class="liste-blanche bloc-suite" id="cp-lu"></div>' +
      '<div class="bloc-suite" id="cp-champs">' +
        champ('Marque', '<select class="champ" id="cp-marque"></select>' + htmlSaisieNeuve('neuve', 'cp-marque-neuve', 'Nouvelle marque…')) +
        champ('Format', '<div class="ligne-couleur"><input class="champ champ-nombre" id="cp-nb" inputmode="decimal" autocomplete="off"><select class="champ" id="cp-unite"></select></div>') +
        champ('Prix payé', '<input class="champ" id="cp-prix" inputmode="decimal" autocomplete="off"><div class="message message-repli" id="cp-prix-msg"></div>') +
      '</div>' +
      '<div id="cp-bas-lu">' + bas('Oui, c\'est ça', 'data-cp-suivant', fleche + '<button class="bouton bouton-brun" type="button" data-cp-corriger>Corriger</button>') + '</div>' +
      '<div id="cp-bas-champs">' + bas('Suivant', 'data-cp-suivant', fleche + annuler) + '</div>' +
    '</div>' +
    '<div data-etape="3" hidden>' + tete(3, 'Ton aliment') + '<div class="bloc-suite">' +
      champ('Catégorie', '<select class="champ" id="cp-cat"></select>' + htmlSaisieNeuve('neuve', 'cp-cat-neuve', 'Nouvelle catégorie…', 'categorie')) +
      '<div class="bloc" id="cp-bloc-souscat"><div class="label">Sous-catégorie</div><select class="champ" id="cp-souscat" data-parent="cp-cat"></select>' +
      htmlSaisieNeuve('neuve', 'cp-souscat-neuve', 'Nouvelle sous-catégorie…', 'categorie') + '</div>' +
      '<div class="bloc" id="cp-bloc-aliment"><div class="label">Aliment</div><select class="champ champ-fort" id="cp-aliment"></select>' +
      htmlSaisieNeuve('nouveau', 'cp-nom', 'Nouvel aliment…') + '<div class="message message-repli" id="cp-aliment-msg"></div></div>' +
      champ('Saveur', '<select class="champ" id="cp-saveur"></select>' + htmlSaisieNeuve('neuve', 'cp-saveur-neuve', 'Nouvelle saveur…')) +
      '<div id="cp-circ"></div></div>' + bas('Suivant', 'data-cp-suivant', fleche + annuler) +
    '</div>' +
    '<div data-etape="4" hidden>' + tete(4, 'Où il est rangé') +
      '<div class="bloc-suite" id="cp-endroits"></div><button class="bouton bouton-petit bouton-suite" type="button" data-cp-endroit>+ un autre endroit</button>' +   // un ou plusieurs endroits, comme la fiche (J-C : « la répartition doit pouvoir se faire là aussi »)
      bas('C\'est fait', 'data-cp-ok', fleche + annuler) +
    '</div>' +
    '<div class="message message-repli message-erreur" id="cp-msg"></div></div>';
}
/* Une étape à la fois; le message d'erreur se pose au-dessus de ses boutons. */
function allerEtape(n) {
  const P = PANNEAU, carte = $('completer-produit');
  if (!P) return;
  P.etape = n;
  carte.querySelectorAll('[data-etape]').forEach(e => { e.hidden = Number(e.dataset.etape) !== n; });
  $('cp-msg').textContent = '';
  if (n === 2) montrerEtape2();
  if (n === 3) majCirculairePanneau();
  const place = [...carte.querySelectorAll('[data-etape="' + n + '"] .cp-msg-place')].find(x => !x.closest('[hidden]'));
  if (place) place.appendChild($('cp-msg'));
  window.scrollTo(0, 0);
}
/* L'étape 2 : ce qui a été lu (la page collée), Oui / Corriger — ou, sans la page (ou pour corriger), la marque, le format, le prix. */
function montrerEtape2() {
  const P = PANNEAU, lu = !!P.lu && !P.corriger;
  montrer('cp-lu', lu); montrer('cp-bas-lu', lu);
  montrer('cp-champs', !lu); montrer('cp-bas-champs', !lu);
  $('cp-titre-2').textContent = P.lu ? 'Ce que l\'app a lu' : 'Marque, format, prix';
  if (lu) remplirLu();
  const place = [...$('completer-produit').querySelectorAll('[data-etape="2"] .cp-msg-place')].find(x => !x.closest('[hidden]'));
  if (place) place.appendChild($('cp-msg'));
}
/* Ce que l'app a lu, tel que ce sera enregistré (les champs remplis par la page) : le nom français et la photo de Super C, la marque,
   le format, le rayon, le prix, le numéro de produit — le bon (vert) ou pas celui scanné (rouge). */
function remplirLu() {
  const P = PANNEAU, r = P.lu, ligne = ligneLu;     // ligneLu : entree.js (le tri aussi)
  const rid = $('cp-cat').value, scid = $('cp-souscat').value;
  const ry = RAYONS.find(x => String(x.id) === rid), sc = (SOUSCATS[rid] || []).find(x => String(x.id) === scid);
  const code = r.code ? formeCode(r.code) : '', bon = !!code && codeNu(code) === codeNu(codeDuLot(P.lot));
  let h = r.nom ? '<div class="item">' + (r.photo ? '<img class="tri-photo" src="' + esc(r.photo) + '" alt="">' : '') +
    '<div class="item-info"><div class="item-nom">' + esc(r.nom) + '</div><div class="item-detail">La page de Super C</div></div></div>' : '';
  const marque = nomChoixPanneau('marque'), format = formatPanneau();
  if (marque) h += ligne('Marque', marque);
  if (format) h += ligne('Format', format);
  h += ligne('Rayon', ry ? ry.nom + (sc ? ' › ' + sc.nom : '') : 'Pas trouvé : tu le choisiras à l\'étape 3');
  h += ligne('Prix', $('cp-prix').value.trim() || '—', '', $('cp-prix-msg').textContent);
  h += ligne('Numéro de produit', code ? code + (bon ? ' · le bon' : ' · pas celui scanné') : 'Pas dans la page', code ? (bon ? 'message-succes' : 'message-erreur') : '');
  $('cp-lu').innerHTML = h;
}
const nomChoixPanneau = ch => { const v = $('cp-' + ch).value; return v === 'neuve' ? $('cp-' + ch + '-neuve').value.trim() : nomListe(v); };
/* La photo du produit à l'étape 1 : celle d'Open Food Facts, si elle vient (sans attendre : la carte est déjà là). */
async function photoProduitPanneau() {
  const P = PANNEAU, code = formeCode(codeDuLot(P.lot));
  if (code.length < 8 || estPese(code) || typeof window.chercherOFF !== 'function') return;
  let d = null;
  try { d = await window.chercherOFF(code); } catch (e) {}
  const it = $('cp-produit');
  if (PANNEAU !== P || !it || !d || !d.photo || it.querySelector('.tri-photo')) return;
  const img = document.createElement('img');
  img.className = 'tri-photo'; img.alt = ''; img.src = d.photo;
  it.insertBefore(img, it.firstChild);
}
/* « Coller la page » : le presse-papiers lu d'un toucher (le raccourci vient de copier la page); refusé par l'appareil : une case où
   coller, comme avant. */
async function collerDuPressePapiers() {
  const t = await lirePressePapiers();               // entree.js (le tri aussi)
  if (!PANNEAU) return;
  if (t == null) {
    montrer('cp-texte', true); $('cp-texte').focus();
    $('cp-msg').textContent = 'Colle le texte de la page dans la case.';
    return;
  }
  if (!t.trim()) { $('cp-msg').textContent = 'Rien à coller : sur sa page, Partager → Copier pour la Réserve.'; return; }
  lireLaPage(t);
}
function lireLaPage(t) {
  if (!PANNEAU || !String(t || '').trim()) return;
  const r = collerPage(t);
  if (!r) { $('cp-msg').textContent = 'Rien de lisible : as-tu copié la page avec « Copier pour la Réserve » ?'; return; }
  PANNEAU.lu = r; PANNEAU.corriger = false;
  allerEtape(2);
}
/* La flèche : une étape en arrière (Corriger → ce qui a été lu, d'abord). */
function reculerEtape() {
  const P = PANNEAU;
  if (!P) return;
  if (P.etape === 2 && P.corriger && P.lu) { P.corriger = false; montrerEtape2(); return; }
  if (P.etape > 1) allerEtape(P.etape - 1);
}
/* Suivant (ou Oui, c'est ça) : ce que l'étape demande, puis la suivante. */
async function suivantEtape() {
  const P = PANNEAU, msg = $('cp-msg');
  if (!P) return;
  if (P.etape === 2) {
    const t = $('cp-prix').value.trim(), n = Number(t.replace(/\s*\$\s*/, '').replace(',', '.'));
    if (t && !(isFinite(n) && n >= 0)) { P.corriger = true; montrerEtape2(); msg.textContent = 'Le prix : un nombre (« 2,49 »).'; return; }
    allerEtape(3);
    return;
  }
  if (P.etape === 3) {
    if (!await poserCatsTapees($('completer-produit')) || PANNEAU !== P) return;   // une catégorie tapée sans le + : créée d'abord
    const manque = manqueEntonnoir($('cp-cat').value, $('cp-souscat').value);
    if (manque) { msg.textContent = manque; return; }
    const v = $('cp-aliment').value;
    if (!v || (v === 'nouveau' && !$('cp-nom').value.trim())) { msg.textContent = 'Choisis l\'aliment, ou nomme le nouveau.'; return; }
    allerEtape(4);
  }
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
  const rid = $('cp-cat').value, ok = vraieCat(rid);
  majSaisie($('cp-cat'), true);                          // « Nouvelle catégorie… » : son nom à la place du menu
  $('cp-souscat').innerHTML = optionsCats(ok ? rid : '');
  $('cp-souscat').value = ok && scid && rayonDe(scid) === rid ? String(scid) : '';
  majSaisie($('cp-souscat'));
  montrer('cp-bloc-souscat', ok);
}
/* Les aliments de la sous-catégorie, « Nouvel aliment… » au bout (son nom dessous, celui du produit d'avance). */
function remplirAlimentsPanneau(choisi, nom) {
  const scid = $('cp-souscat').value, ok = vraieCat(scid);
  majSaisie($('cp-souscat'), true);
  const ps = ok ? PRODUITS.filter(p => String(p.catId) === String(scid)).sort((a, b) => a.nom.localeCompare(b.nom, 'fr')) : [];
  $('cp-aliment').innerHTML = options(ps, '— Aliment —') + '<option value="nouveau">Nouvel aliment…</option>';
  const v = !ok ? '' : choisi === 'nouveau' || ps.some(p => String(p.id) === String(choisi)) ? String(choisi) : 'nouveau';
  $('cp-aliment').value = v;
  if (nom !== undefined) $('cp-nom').value = nom;
  else if (!$('cp-nom').value) $('cp-nom').value = (PRODUITS.find(p => String(p.id) === PANNEAU.lot.pid) || {}).nom || '';
  montrer('cp-bloc-aliment', ok);
  surAlimentPanneau();
}
function surAlimentPanneau() {
  const v = $('cp-aliment').value, m = $('cp-aliment-msg');
  majSaisie($('cp-aliment'));                         // « Nouvel aliment… » : son nom à la place du menu
  const autre = v && v !== 'nouveau' && v !== PANNEAU.lot.pid && PRODUITS.find(p => String(p.id) === v);
  m.textContent = autre ? 'Il devient du ' + autre.nom + ' (ton aliment) : tout ce qu\'il y en a passe à ' + autre.nom + '.' : '';
  const ou = document.querySelector('#cp-endroits .endroit');   // pas encore placé : la place habituelle de l'aliment choisi, s'il en a une
  if (autre && ou && !PANNEAU.lot.emp && !ou.querySelector('.meuble').value) { const e = premierEndroit(autre.id); if (e) brancherEndroit(ou, resoudreEmp(e)); }
  ['marque', 'saveur'].forEach(ch => {                // ses marques et saveurs (entrées, apprises au tri), avec celles du produit scanné; le choix reste
    const el = $('cp-' + ch);
    if (!el || el.value === 'neuve') return;          // un nom neuf en cours : on n'y touche pas
    const v = el.value;
    el.innerHTML = optionsListe(ch, sortesVues(autre ? autre.id : PANNEAU.lot.pid, ch).concat(sortesVues(PANNEAU.lot.pid, ch)), v);
    el.value = v;
  });
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
  return v === 'neuve' ? idListeOuNeuve(CHOIX_FICHE[champ].liste, $('cp-' + champ + '-neuve').value) : v;
}
/* Un NOM dans une liste (Marques, Saveurs) : retrouvé (sans accent ni majuscule), sinon créé (ID d'ici, par la file).
   ⚠️ Jamais « idListe » : c'est la fonction d'entree.js qui CHERCHE un ID ou un nom sans rien créer. Du 4 au 8 octobre, celle-ci
   portait le même nom et la remplaçait (le dernier fichier chargé gagne) : le tri des circulaires, qui cherchait la marque par son
   ID, créait une marque nommée « 20261004082900169-28ddy » (vu par J-C : « une drôle de lait biologique »). */
function idListeOuNeuve(liste, nom) {
  nom = String(nom || '').trim();
  if (!nom) return '';
  const x = LISTES[liste].find(y => cleNom(y.nom) === cleNom(nom));
  if (x) return x.id;
  const id = idLocal();
  LISTES[liste].push({ id: id, nom: nom }); LISTES[liste].sort((a, b) => a.nom.localeCompare(b.nom, 'fr')); NOMS_LISTES[id] = nom;
  poserGeste({ action: 'creer', table: liste, opId: 'liste-' + id, ligne: [id, nom, 'O'] });   // Marques, Saveurs : ID · Nom · Actif
  return id;
}
/* Compléter : un nom (la page collée) dans le menu de la marque ou de la saveur. */
function choisirNomPanneau(champ, nom) { choisirNomDans($('cp-' + champ), $('cp-' + champ + '-neuve'), champ, nom); }   // choisirNomDans : entree.js (sert aussi le tri)
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
/* Le texte d'une page de Super C (ou de Metro), collé : ce qu'on y lit. Deux formes (essayées sur les pages collées par J-C) :
   · le raccourci « Copier pour la Réserve » (2026-10-15, les biscuits Leclerc) : toute la page — le code du site, les menus, puis UNE
     ligne de données sûre, « <la photo> <la marque> <le code> <l'adresse du produit> », dont le chemin est le rayon (…/allees/collations/
     collations-sucrees-et-bonbons/…). Le reste se lit entre cette ligne et « Fréquemment achetés » (d'autres produits, plus bas);
   · une page copiée au doigt (2026-10-03 : la tarte à la citrouille Irrésistible, le sucre Redpath) : le chemin du rayon en tête, la
     marque en majuscules, le nom, le format.
   Rend { code, rid, scid, marque, nom, format, prix, regulier, special, photo } — ce qui a été trouvé. Le tri s'en sert aussi. */
const DONNEES_PAGE = /(https:\/\/product-images\.metro\.ca\/\S+)\s+(?:(.*?)\s+)?(\d{8,14})\s+(https:\/\/(?:www\.)?(?:superc|metro)\.ca\/\S*?\/p\/\d{8,14})/;
const cleChemin = s => cleNom(String(s || '').replace(/œ/gi, 'oe').replace(/æ/gi, 'ae'));   // « œufs » = « oeufs » (l'adresse d'une page)
function lirePage(texte) {
  const t = String(texte || ''), toutes = t.split(/\r?\n/).map(s => s.replace(/\s+/g, ' ').trim()).filter(Boolean), r = {};
  const code = (t.match(/Num[ée]ro de produit\s*:?\s*(\d{6,14})/i) || [])[1];
  if (code) r.code = code;
  const d = t.match(DONNEES_PAGE);
  let lignes = toutes;
  if (d) {                                               // le raccourci
    r.photo = d[1]; r.code = r.code || d[3];
    if (d[2] && /\p{L}/u.test(d[2])) r.marque = adoucir(d[2].trim());
    rayonDuChemin(d[4], r);
    const i = toutes.findIndex(l => l.indexOf(d[4]) !== -1);
    const fin = toutes.findIndex((l, j) => j > i && /^(Fr[ée]quemment achet|Description du produit)/i.test(l));
    lignes = toutes.slice(i + 1, fin === -1 ? undefined : fin);   // ce produit-ci seulement
    const k = d[2] ? lignes.findIndex(l => cleNom(l) === cleNom(d[2])) : -1;   // la marque seule, puis le nom, puis le format
    if (k !== -1) {
      if (lignes[k + 1] && !/[$]/.test(lignes[k + 1])) r.nom = lignes[k + 1];
      if (lignes[k + 2] && formatCle(lignes[k + 2])) r.format = formatStock(lignes[k + 2]);
    }
    if (!r.nom) {                                        // sinon : la ligne avant les prix « 4.49 CAD »
      const c = toutes.findIndex(l => /^\d+\.\d{2} CAD/.test(l));
      if (c > 0 && c < i) r.nom = toutes[c - 1];
    }
  } else {                                               // copiée au doigt
    for (let i = 0; i < Math.min(lignes.length, 8) && !r.rid; i++) {       // le chemin du rayon : SES catégories (taillées sur Super C)
      const rr = RAYONS.find(x => cleChemin(x.nom) === cleChemin(lignes[i]));
      if (!rr) continue;
      r.rid = String(rr.id);
      const sc = (SOUSCATS[rr.id] || []).find(x => cleChemin(x.nom) === cleChemin(lignes[i + 1] || ''));
      if (sc) r.scid = String(sc.id);
    }
    const k = lignes.findIndex(l => /\p{L}{2}/u.test(l) && l === l.toUpperCase() && !/[$\d]/.test(l));   // la marque, en majuscules (« REDPATH »)
    if (k !== -1) {
      r.marque = adoucir(lignes[k]);
      if (lignes[k + 1] && !/[$]/.test(lignes[k + 1])) r.nom = lignes[k + 1];
      if (lignes[k + 2] && formatCle(lignes[k + 2])) r.format = formatStock(lignes[k + 2]);
    }
  }
  if (!r.format) { const f = lignes.find(l => /^\d+(?:[.,]\d+)?\s*(?:kg|g|ml|l)\b/i.test(l)); if (f) r.format = formatStock(f); }
  const zone = lignes.join('\n');
  const reg = (zone.match(/Prix r[ée]gulier\s*(\d+[.,]\d{2})/i) || [])[1];
  if (reg) r.regulier = reg;
  const p = lignes.find(l => /^\d+[.,]\d{2}\s*\$/.test(l) && !/\//.test(l) && !/r[ée]gulier/i.test(l));   // le prix payé, pas celui au 100 g
  if (p) r.prix = p.match(/^(\d+[.,]\d{2})/)[1];
  const fin = (zone.match(/En sp[ée]cial jusqu.au ([^\n]+)/i) || [])[1];
  if (fin) r.special = fin.trim();
  return r;
}
/* L'adresse d'un produit (…/allees/collations/collations-sucrees-et-bonbons/biscuits-et-gateaux/<nom>/p/<code>) : le 1er morceau qui
   est une de ses catégories, puis une de ses sous-catégories parmi les suivants (leurs noms viennent de Super C). */
function rayonDuChemin(url, r) {
  const morceaux = String(url || '').replace(/^https?:\/\/[^/]+\//, '').split('/');
  const i = morceaux.findIndex(m => RAYONS.some(x => cleChemin(x.nom) === cleChemin(m)));
  if (i === -1) return;
  const rr = RAYONS.find(x => cleChemin(x.nom) === cleChemin(morceaux[i]));
  r.rid = String(rr.id);
  const sc = (SOUSCATS[rr.id] || []).find(x => morceaux.slice(i + 1).some(m => cleChemin(x.nom) === cleChemin(m)));
  if (sc) r.scid = String(sc.id);
}
/* La page lue, dans les champs de la carte : le rayon, l'aliment (le sien dont tous les mots sont dans le nom de la page, le plus précis;
   sinon un nouveau, au NOM FRANÇAIS de la page — avant la virgule : « Biscuits au beurre garnis de chocolat noir, Célébration »), la
   marque, le format, le prix (pas si un jeudi est passé depuis l'achat). Rend ce qui a été lu, ou null (rien de lisible). */
function collerPage(texte) {
  const P = PANNEAU;
  if (!P) return null;
  const r = lirePage(texte);
  if (!Object.keys(r).length) return null;
  if (r.rid) { $('cp-cat').value = r.rid; remplirSousCatPanneau(r.scid || ''); }
  const scid = $('cp-souscat').value;
  if (r.nom) {
    const mots = motsTri(r.nom), nomFr = r.nom.split(',')[0].trim();
    const ps = PRODUITS.filter(p => (!scid || String(p.catId) === String(scid)) && motsTri(p.nom).length && motsTri(p.nom).every(w => mots.indexOf(w) !== -1))
      .sort((a, b) => motsTri(b.nom).length - motsTri(a.nom).length);
    if (!ps[0]) $('cp-nom').value = nomFr;               // pas un des siens : le nom français attend « Nouvel aliment… » (aussi quand le rayon vient plus tard)
    if (scid) remplirAlimentsPanneau(ps[0] ? String(ps[0].id) : 'nouveau', ps[0] ? undefined : nomFr);
    if (ps[0]) {                                         // ce qui reste du nom devient la saveur (« Sucre granulé spécial fin » → « Granulé spécial fin »)
      const aMots = motsTri(ps[0].nom), reste = nomFr.split(' ').filter(w => !motsTri(w).length || aMots.indexOf(motsTri(w)[0]) === -1).join(' ').trim();
      if (reste && motsTri(reste).length) choisirNomPanneau('saveur', reste.charAt(0).toUpperCase() + reste.slice(1));
    }
  }
  if (r.marque) choisirNomPanneau('marque', r.marque);
  if (r.format) poserFormatPanneau(r.format);
  const pm = $('cp-prix-msg');
  if (r.prix) {
    if (P.ligne && P.assoc === 'O') pm.textContent = 'Le prix de la circulaire reste (associé).';
    else if (jeudiPasse(dateDuLot(P.lot), dateDuJour())) pm.textContent = 'Prix de la page pas pris : un jeudi est passé depuis l\'achat.';
    else { $('cp-prix').value = textePrix(r.prix); pm.textContent = (r.special ? 'En spécial jusqu\'au ' + r.special : 'Le prix de la page') + (r.regulier ? ' (rég. ' + textePrix(r.regulier) + ')' : '') + '.'; }
  }
  majCirculairePanneau();
  return r;
}
/* « C'est ça » : l'aliment (catégorie, nom — ou réuni à l'aliment choisi), puis les lignes du lot (marque, saveur, format, prix). */
async function validerProduit() {
  const P = PANNEAU, msg = $('cp-msg');
  if (!P) return;
  if (!await poserCatsTapees($('epi-completer')) || PANNEAU !== P) return;   // une catégorie tapée sans le + : créée d'abord
  const lot = P.lot, scid = $('cp-souscat').value, v = $('cp-aliment').value, nom = $('cp-nom').value.trim();
  const manque = manqueEntonnoir($('cp-cat').value, scid);
  if (manque) { msg.textContent = manque; return; }
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
  const deja = v === 'nouveau' ? alimentDuNom(nom, scid, lot.pid) : null;   // « nouveau », mais ce nom est déjà un aliment : lui, jamais un double
  if ((v !== 'nouveau' && v !== lot.pid) || deja) {      // un autre aliment, qui existe : le produit lui est réuni (tout ce qu'il y en a)
    cible = deja ? String(deja.id) : v;
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
  fermerProduit();
  poserPoints();
  avis('Complété : ' + fait, 'succes');
}
/* Réunir le produit du scan (perdu) à un aliment qui existe (garde) — instantané : la mémoire tout de suite, puis l'action
   reunirProduits d'api.gs par la file des gestes (ses lots, ses sorties, ses « Pas aimé »; rejouable). */
function reunirProduitsInstant(garde, perdu) {
  poserGeste({ action: 'reunirProduits', opId: 'reun-' + idLocal(), garde: String(garde), perdu: String(perdu) });   // STOCK et le cache suivent (appliquerGeste)
  suivreTriReunion(garde, perdu);                        // ses articles de circulaire aussi (« L'associer ? » au scan) — ceux que l'appareil connaît
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
    if (b) ouvrirCompleterMagasin(b.dataset.completer);
  });
  $('completer-liste').addEventListener('click', ev => {
    const r = ev.target.closest('.ranger[data-completer-lot]');
    if (r) { ouvrirLotCompleter(r); return; }
    if (ev.target.closest('.endroit')) return;           // toucher la carte d'un endroit ne plie rien
    const it = ev.target.closest('[data-completer-item]');
    if (it) { ouvrirProduit(Number(it.dataset.completerItem)); return; }
    const tete = ev.target.closest('.accordeon-tete');
    if (!tete) return;
    const g = tete.closest('[data-groupe]');
    COMPLETER_OUVERT = tete.classList.contains('ouvert') ? '' : (g ? g.dataset.groupe : '');
    toggleAccordeon(tete);
  });
  $('completer-ok').addEventListener('click', validerCompleter);
  $('completer-produit').addEventListener('click', ev => {   // la carte du produit, en quatre étapes
    if (ev.target.closest('[data-cp-voir]')) { voirChezSuperC(); return; }
    if (ev.target.closest('[data-cp-coller]')) { collerDuPressePapiers(); return; }
    if (ev.target.closest('[data-cp-sans]')) { if (PANNEAU) { PANNEAU.corriger = true; allerEtape(2); } return; }
    if (ev.target.closest('[data-cp-corriger]')) { if (PANNEAU) { PANNEAU.corriger = true; montrerEtape2(); } return; }
    if (ev.target.closest('[data-cp-suivant]')) { suivantEtape(); return; }
    if (ev.target.closest('[data-cp-recul]')) { reculerEtape(); return; }
    if (ev.target.closest('[data-cp-endroit]')) { ajouterEndroitPanneau(null, ''); return; }
    const re = ev.target.closest('#cp-endroits .endroit-retirer');
    if (re) { if ($('cp-endroits').children.length > 1) re.closest('.endroit').remove(); return; }
    const ass = ev.target.closest('[data-cp-assoc]');
    if (ass) { associerPanneau(ass.dataset.cpAssoc); return; }
    if (ev.target.closest('[data-cp-ok]')) { validerProduit(); return; }
    if (ev.target.closest('[data-cp-annuler]')) fermerProduit();
  });
  $('completer-produit').addEventListener('change', ev => {
    const id = ev.target.id;
    if (id === 'cp-cat') { remplirSousCatPanneau(''); remplirAlimentsPanneau(''); }
    else if (id === 'cp-souscat') remplirAlimentsPanneau('');
    else if (id === 'cp-aliment') surAlimentPanneau();
    else if (id === 'cp-marque' || id === 'cp-saveur') majSaisie(ev.target, true);
  });
  $('completer-produit').addEventListener('input', ev => { if (ev.target.id === 'cp-texte') lireLaPage(ev.target.value); });   // l'appareil a refusé le presse-papiers : collé dans la case
  $('completer-retour').addEventListener('click', () => { if (EPI_COMPLETER && aCompleter().length) montrerCompleter(); else montrerChoixQuoi(); });   // la liste → les tuiles → l'écran du + : un pas à la fois
  $('epi-magasins').addEventListener('click', ev => { const b = ev.target.closest('[data-epi-magasin]'); if (b) choisirEpicerie(b.dataset.epiMagasin); });
  $('btn-epi-magasin').addEventListener('click', ajouterEpicerie);
  $('epi-magasin-neuf').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); ajouterEpicerie(); } });
  $('epi-choix-retour').addEventListener('click', montrerChoixQuoi);            // Retour recule d'un pas : les deux sacs
  $('epi-retour').addEventListener('click', () => {   // la flèche recule d'un pas : un choix de Sans code → ses deux boutons → le scan → le choix de l'épicerie
    if (!$('epi-sans').hidden) { if (EPI_SANS) choisirSans(''); else modeSansCode(false); }
    else montrerEpiceries();                         // la liste du jour reste ouverte : retouchée, l'épicerie y revient; demain, elle attend Compléter
  });
  $('epi-sans-code').addEventListener('click', () => modeSansCode(true));
  $('epi-carte').addEventListener('click', ev => {
    const off = ev.target.closest('[data-off-carte]');
    if (off) { toucherOffCarte(off); return; }
    const ok = ev.target.closest('[data-epi-ok]');
    if (ok) { validerCarte(ok.dataset.epiOk); return; }
    if (ev.target.closest('[data-epi-annuler]')) annulerCarte();
  });
  $('scan-sans-choix').addEventListener('click', ev => { const b = ev.target.closest('[data-sans]'); if (b) choisirSansSeul(b.dataset.sans); });
  $('scan-habituels').addEventListener('click', ev => { const h = ev.target.closest('[data-epi-hab]'); if (h) ouvrirHabituelSeul(EPI_HABITUELS[Number(h.dataset.epiHab)]); });
  $('epi-sans-choix').addEventListener('click', ev => { const b = ev.target.closest('[data-sans]'); if (b) choisirSans(EPI_SANS ? '' : b.dataset.sans); });   // le bouton choisi, retouché : les deux, comme la flèche
  $('epi-habituels').addEventListener('click', ev => { const h = ev.target.closest('[data-epi-hab]'); if (h) choisirHabituel(Number(h.dataset.epiHab)); });
  $('epi-cat').addEventListener('change', surEpiCat);
  $('epi-souscat').addEventListener('change', surEpiSousCat);
  $('epi-produit').addEventListener('change', surEpiProduit);
  AJOUTS_NEUFS.epi = ajouterEpiNeuf;                                             // le + de « Nouveau produit… » (Sans code)
  // l'app passe en arrière-plan pendant le scan : la caméra se ferme; au retour, elle se rouvre (sauf si un article attend son OK)
  document.addEventListener('visibilitychange', () => {
    if ($('vue-epicerie').hidden || $('epi-scan').hidden || $('epi-camera').hidden) return;
    if (document.hidden) { if (window.stopScanner) window.stopScanner(); }
    else if (!EPI_CARTE) demarrerCamera();
  });
}
document.addEventListener('DOMContentLoaded', initEpicerie);
