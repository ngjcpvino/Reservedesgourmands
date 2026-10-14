/* ============================================================
   SCANNER — rdg.html. Lit un code-barres avec la caméra,
   moteur WASM (zxing-wasm, fiable sur iPhone/iPad).
   TRANCHE 1 : ouvrir la caméra → lire UN code → l'afficher.
   Suite (tranches à venir) : Open Food Facts + branchement à la fiche.
   Aucun script inline ; expose montrerScanner() et stopScanner() (window).
============================================================ */
(function () {
  var LIB = 'https://cdn.jsdelivr.net/npm/zxing-wasm@3.1.4/dist/es/reader/index.js';
  var readBarcodes = null;
  var stream = null, timer = null, scanning = false;
  var video = null, canvas = null, ctx = null;
  var mode = null;   // { lu(code), retour() } : la recherche s'en sert; sans mode, le code va à la fiche d'entrée
  var continu = null;   // toute l'épicerie : { video, msg, lu(code) } — la caméra reste ouverte entre deux articles (scanContinu, reprendreScan)
  var dernierLu = '', repriseA = 0;
  var MEME_CODE_MS = 2500;   // après « OK », le même code encore sous la caméra ne compte pas tout de suite (sinon : +1 de trop)

  function el(id) { return document.getElementById(id); }
  function msg(t) { var m = el(continu ? continu.msg : 'scan-msg'); if (m) m.textContent = t || ''; }

  /* Charge le moteur WASM à la demande (pas au chargement de la page). */
  async function chargerLib() {
    if (readBarcodes) return true;
    try {
      var mod = await import(LIB);
      readBarcodes = mod.readBarcodes;
      return true;
    } catch (e) {
      msg('Impossible de charger le lecteur de codes (connexion?).');
      return false;
    }
  }

  async function montrerScanner(m) {
    mode = (m && typeof m.lu === 'function') ? m : null;
    if (typeof toutCacher === 'function') toutCacher();
    el('vue-scan').hidden = false;
    var b = el('btn-burger'); if (b) b.hidden = false;
    el('scan-resultat').hidden = true;
    el('scan-code').textContent = '';
    el('scan-choix').hidden = !(mode && typeof mode.sansCode === 'function');   // le sac seul : « Taper le code » et « Sans code » sous la caméra
    fermerTaper();
    msg('Démarrage de la caméra…');
    await demarrer('scan-video');
  }

  /* Toute l'épicerie : la caméra dans SA page (video), ouverte jusqu'à ce qu'on la quitte. Un code lu : la lecture s'arrête
     (la caméra reste), lu(code); reprendreScan(m) la relance pour l'article suivant (m : de quoi la rouvrir si elle s'est fermée). */
  async function scanContinu(m) {
    arreter();
    continu = m; mode = null; dernierLu = ''; repriseA = 0;
    fermerTaper();
    msg('Démarrage de la caméra…');
    await demarrer(m.video);
  }
  function reprendreScan(m) {
    if (!continu) { if (m) scanContinu(m); return; }   // la caméra a été fermée entre-temps (l'app en arrière-plan) : on la rouvre
    if (scanning) return;
    if (!stream) { scanContinu(continu); return; }   // la caméra s'est fermée (l'app est passée en arrière-plan) : on la rouvre
    repriseA = Date.now(); msg('');
    scanning = true;
    boucle();
  }

  async function demarrer(idVideo) {
    video = el(idVideo);
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
      msg('La caméra n’est pas disponible sur cet appareil.'); return;
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        // une image fine (1080p) : le code se lit de plus loin, là où la caméra fait le point (J-C, 2026-10-02 : « c'est moi qui dois
        // bouger mon iPhone pour zoomer » — sans taille demandée, Safari donne ~640 px : il fallait coller le code, trop près pour le point)
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false
      });
    } catch (e) {
      msg('Caméra refusée ou indisponible. Autorise la caméra, puis reviens.'); return;
    }
    await reglerCamera(stream.getVideoTracks()[0]);
    video.srcObject = stream;
    video.setAttribute('playsinline', '');
    try { await video.play(); } catch (e) {}
    if (!(await chargerLib())) return;
    if (!canvas) { canvas = document.createElement('canvas'); ctx = canvas.getContext('2d', { willReadFrequently: true }); }
    msg('');                                     // la caméra est prête : rien à dire (J-C, 2026-10-13 : « Vise un code-barres… », pas utile)
    scanning = true;
    boucle();
  }

  /* Si l'appareil le permet : la mise au point continue, et un zoom 2× (le code paraît grand, le téléphone reste à bonne distance).
     Rien d'obligatoire : un appareil qui ne connaît pas ces réglages scanne comme avant. */
  var ZOOM = 2;
  async function reglerCamera(piste) {
    if (!piste || typeof piste.getCapabilities !== 'function') return;
    try {
      var cap = piste.getCapabilities() || {}, voulu = {};
      if (cap.focusMode && cap.focusMode.indexOf('continuous') !== -1) voulu.focusMode = 'continuous';
      if (cap.zoom && cap.zoom.max >= ZOOM) voulu.zoom = Math.max(cap.zoom.min || 1, ZOOM);
      if (Object.keys(voulu).length) await piste.applyConstraints({ advanced: [voulu] });
    } catch (e) { /* réglage refusé : on garde l'image telle quelle */ }
  }

  /* Boucle douce (~5 lectures/s) : moins gourmande que chaque image. On lit le CENTRE de l'image (70 % × 60 %), là où l'on vise :
     l'image 1080p reste rapide à lire. */
  var CENTRE_L = 0.7, CENTRE_H = 0.6;
  async function boucle() {
    if (!scanning) return;
    try {
      if (video && video.readyState >= 2 && video.videoWidth) {
        var vw = video.videoWidth, vh = video.videoHeight, sw = Math.round(vw * CENTRE_L), sh = Math.round(vh * CENTRE_H);
        canvas.width = sw; canvas.height = sh;
        ctx.drawImage(video, Math.round((vw - sw) / 2), Math.round((vh - sh) / 2), sw, sh, 0, 0, sw, sh);
        var img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var res = await readBarcodes(img, { tryHarder: true, maxNumberOfSymbols: 1 });
        var lu = res && res.length && res[0].text;
        if (lu && !(continu && lu === dernierLu && Date.now() - repriseA < MEME_CODE_MS)) { trouve(lu); return; }
      }
    } catch (e) { /* image/wasm ponctuel : on continue */ }
    if (scanning) timer = setTimeout(boucle, 200);
  }

  function trouve(code) {
    if (continu) {                               // toute l'épicerie : la caméra reste ouverte, la lecture attend l'article suivant
      scanning = false; if (timer) { clearTimeout(timer); timer = null; }
      dernierLu = code; msg('');
      continu.lu(code);
      return;
    }
    arreter();                                   // on tient un code : on coupe la caméra
    msg('Lu : ' + code);
    if (mode) { mode.lu(code); return; }         // -> la recherche
    if (typeof ouvrirFicheScan === 'function') { ouvrirFicheScan(code); return; }   // -> la fiche (mode code)
    el('scan-code').textContent = code;          // filet : fiche pas branchée
    el('scan-resultat').hidden = false;
    msg('Code lu');
  }

  /* Open Food Facts : code -> { code, nom, marque, format, photo, trouve, manque, photos, erreur }.
     manque : ce qui lui manque, pour l'aider (JS/off.js — devant, ingredients, nutrition : les photos; nom : le nom français; marque,
     format); photos : les siennes, petites. erreur : pas de réponse (le réseau) — on ne sait rien, ce n'est pas « inconnu ».
     La même réponse sert 2 minutes (l'entrée la demande deux fois : le nom, puis ce qui manque); frais : sans cette mémoire. */
  var MEMO_OFF_MS = 120000, memoOFF = {};
  var TOUT_MANQUE = ['devant', 'ingredients', 'nutrition', 'nom', 'marque', 'format'];
  async function chercherOFF(code, frais) {
    var m = memoOFF[code];
    if (!frais && m && Date.now() - m.a < MEMO_OFF_MS) return m.d;
    var url = 'https://world.openfoodfacts.org/api/v2/product/' + encodeURIComponent(code)
            + '.json?fields=code,product_name_fr,generic_name_fr,brands,quantity,image_front_small_url,image_front_url,product_name_en,product_name'
            + ',image_ingredients_url,image_ingredients_small_url,image_nutrition_url,image_nutrition_small_url';
    var d;
    try {
      var r = await fetch(url, { headers: { 'Accept': 'application/json' } });
      var j = await r.json();
      if (j && j.status === 1 && j.product) {
        var p = j.product;
        var nom = (p.product_name_fr || p.generic_name_fr || '').trim();   // le nom en français, s'il est rangé comme tel
        var marque = (p.brands || '').split(',')[0].trim();
        var photo = p.image_front_small_url || p.image_front_url || '';   // la photo de face : on reconnaît la boîte d'un coup d'œil
        // sinon, le nom PRINCIPAL du produit — celui que le site montre — avant l'anglais : bien des produits d'ici ont leur nom
        // français rangé là, pas dans le champ français (Rouleaux impériaux Wong Wing, 2026-09-30). La fiche le prend, J-C le corrige.
        var nomAutre = (p.product_name || p.product_name_en || '').trim();
        var manque = [];
        if (!p.image_front_url) manque.push('devant');
        if (!p.image_ingredients_url) manque.push('ingredients');
        if (!p.image_nutrition_url) manque.push('nutrition');
        if (!(p.product_name_fr || '').trim()) manque.push('nom');
        if (!(p.brands || '').trim()) manque.push('marque');
        if (!(p.quantity || '').trim()) manque.push('format');
        d = { code: code, nom: nom, nomAutre: nomAutre, marque: marque, format: nettoyerFormat(p.quantity), photo: photo, trouve: true, manque: manque,
              photos: { devant: photo, ingredients: p.image_ingredients_small_url || p.image_ingredients_url || '', nutrition: p.image_nutrition_small_url || p.image_nutrition_url || '' } };
      } else d = { code: code, nom: '', nomAutre: '', marque: '', format: '', photo: '', trouve: false, manque: TOUT_MANQUE.slice(), photos: {} };   // inconnu : tout lui manque
      memoOFF[code] = { a: Date.now(), d: d };
      return d;
    } catch (e) { /* réseau : on retombe sur « non trouvé », sans rien en conclure */ }
    return { code: code, nom: '', nomAutre: '', marque: '', format: '', photo: '', trouve: false, erreur: true, manque: [], photos: {} };
  }

  /* « TAPER LE CODE » (J-C, 2026-10-12 : « des codes-barres illisibles par le scan, mais les chiffres sont lisibles »; le sac seul et
     les deux sacs) : le champ prend la place du bouton (la ligne « .saisie-neuve » d'un « Nouveau… »); le + (ou Entrée) fait comme
     un code lu par la caméra — la caméra du sac seul se ferme, celle des deux sacs attend l'article suivant. 4 ou 5 chiffres : un PLU. */
  function fermerTaper() {
    document.querySelectorAll('.saisie-neuve[data-ajout="code"]').forEach(function (l) { l.hidden = true; l.querySelector('input').value = ''; });
  }
  function codeTape(l, nom) {
    var c = String(nom || '').replace(/[\s-]/g, '');
    if (!/^[0-9]{4,14}$/.test(c)) {
      var m = el(l.closest('#vue-epicerie') ? 'epi-msg' : 'scan-msg'); if (m) m.textContent = 'Un code, c’est 4 à 14 chiffres.';
      l.querySelector('input').focus(); return;
    }
    fermerTaper();
    if (!continu && l.closest('#vue-epicerie') && typeof surCodeEpicerie === 'function') { surCodeEpicerie(c); return; }   // les deux sacs, la caméra fermée (un article attendait son OK pendant que l'app dormait) : la carte quand même
    trouve(c);
  }

  function nettoyerFormat(q) { return String(q || '').replace(/\s*e\s*$/i, '').trim(); }

  function arreter() {
    scanning = false; continu = null;
    if (timer) { clearTimeout(timer); timer = null; }
    if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
    if (video) { try { video.pause(); } catch (e) {} video.srcObject = null; }
  }

  window.montrerScanner = montrerScanner;
  window.stopScanner = arreter;
  window.scanContinu = scanContinu;
  window.reprendreScan = reprendreScan;
  window.chercherOFF = chercherOFF;   // utilisé aussi par la fiche (champ code corrigé à la main)

  function init() {
    var r = el('scan-retour');
    if (r) r.addEventListener('click', function () {
      arreter();
      if (mode && typeof mode.retour === 'function') { mode.retour(); return; }   // on revient d'où l'on vient
      if (typeof montrerChoixQuoi === 'function') montrerChoixQuoi();
    });
    var sans = el('scan-sans-code');                     // le sac seul : l'entonnoir, sans la caméra
    if (sans) sans.addEventListener('click', function () {
      var m = mode;
      arreter();
      if (m && typeof m.sansCode === 'function') m.sansCode();
    });
    document.addEventListener('click', function (ev) {   // « Taper le code » : son champ prend sa place, le clavier à chiffres ouvert
      var b = ev.target.closest('[data-taper]');
      if (!b) return;
      var l = (b.closest('.grille') || b).nextElementSibling;   // la ligne de saisie suit les deux icônes
      l.hidden = false; l.querySelector('input').focus();
    });
    if (typeof AJOUTS_NEUFS === 'object') AJOUTS_NEUFS.code = codeTape;   // le + de la ligne (et Entrée) : le mécanisme des « Nouveau… »
    var encore = el('scan-encore');
    if (encore) encore.addEventListener('click', function () { montrerScanner(mode); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
