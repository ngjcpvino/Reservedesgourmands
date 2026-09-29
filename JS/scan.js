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

  function el(id) { return document.getElementById(id); }
  function msg(t) { var m = el('scan-msg'); if (m) m.textContent = t || ''; }

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
    msg('Démarrage de la caméra…');
    await demarrer();
  }

  async function demarrer() {
    video = el('scan-video');
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
      msg('La caméra n’est pas disponible sur cet appareil.'); return;
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } }, audio: false
      });
    } catch (e) {
      msg('Caméra refusée ou indisponible. Autorise la caméra, puis reviens.'); return;
    }
    video.srcObject = stream;
    video.setAttribute('playsinline', '');
    try { await video.play(); } catch (e) {}
    if (!(await chargerLib())) return;
    if (!canvas) { canvas = document.createElement('canvas'); ctx = canvas.getContext('2d', { willReadFrequently: true }); }
    msg('Vise un code-barres…');
    scanning = true;
    boucle();
  }

  /* Boucle douce (~5 lectures/s) : moins gourmande que chaque image. */
  async function boucle() {
    if (!scanning) return;
    try {
      if (video && video.readyState >= 2 && video.videoWidth) {
        canvas.width = video.videoWidth; canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        var img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var res = await readBarcodes(img, { tryHarder: true, maxNumberOfSymbols: 1 });
        if (res && res.length && res[0].text) { trouve(res[0].text); return; }
      }
    } catch (e) { /* image/wasm ponctuel : on continue */ }
    if (scanning) timer = setTimeout(boucle, 200);
  }

  function trouve(code) {
    arreter();                                   // on tient un code : on coupe la caméra
    msg('Lu : ' + code);
    if (mode) { mode.lu(code); return; }         // -> la recherche
    if (typeof ouvrirFicheScan === 'function') { ouvrirFicheScan(code); return; }   // -> la fiche (mode code)
    el('scan-code').textContent = code;          // filet : fiche pas branchée
    el('scan-resultat').hidden = false;
    msg('Code lu ✓');
  }

  /* Open Food Facts : code -> { code, nom, marque, format, trouve }. */
  async function chercherOFF(code) {
    var url = 'https://world.openfoodfacts.org/api/v2/product/' + encodeURIComponent(code)
            + '.json?fields=code,product_name_fr,generic_name_fr,brands,quantity,image_front_small_url,image_front_url,product_name_en,product_name';
    try {
      var r = await fetch(url, { headers: { 'Accept': 'application/json' } });
      var j = await r.json();
      if (j && j.status === 1 && j.product) {
        var p = j.product;
        var nom = (p.product_name_fr || p.generic_name_fr || '').trim();   // le français seulement (J-C) : sinon vide, il choisit lui-même
        var marque = (p.brands || '').split(',')[0].trim();
        var photo = p.image_front_small_url || p.image_front_url || '';   // la photo de face : on reconnaît la boîte d'un coup d'œil
        // le nom dans une autre langue : à LIRE seulement (« Tu n'en as pas »), jamais écrit dans la fiche ni le Sheet (J-C, 2026-09-28)
        var nomAutre = (p.product_name_en || p.product_name || '').trim();
        return { code: code, nom: nom, nomAutre: nomAutre, marque: marque, format: nettoyerFormat(p.quantity), photo: photo, trouve: true };
      }
    } catch (e) { /* réseau / inconnu : on retombe sur « non trouvé » */ }
    return { code: code, nom: '', nomAutre: '', marque: '', format: '', photo: '', trouve: false };
  }

  function nettoyerFormat(q) { return String(q || '').replace(/\s*e\s*$/i, '').trim(); }

  function arreter() {
    scanning = false;
    if (timer) { clearTimeout(timer); timer = null; }
    if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
    if (video) { try { video.pause(); } catch (e) {} video.srcObject = null; }
  }

  window.montrerScanner = montrerScanner;
  window.stopScanner = arreter;
  window.chercherOFF = chercherOFF;   // utilisé aussi par la fiche (champ code corrigé à la main)

  function init() {
    var r = el('scan-retour');
    if (r) r.addEventListener('click', function () {
      arreter();
      if (mode && typeof mode.retour === 'function') { mode.retour(); return; }   // on revient d'où l'on vient
      if (typeof montrerChoixQuoi === 'function') montrerChoixQuoi();
    });
    var encore = el('scan-encore');
    if (encore) encore.addEventListener('click', function () { montrerScanner(mode); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
