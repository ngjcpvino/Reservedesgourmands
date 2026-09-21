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

  async function montrerScanner() {
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
    el('scan-code').textContent = code;
    el('scan-resultat').hidden = false;
    msg('Code lu ✓');
    arreter();   // tranche 1 : on lit UN code et on s’arrête
  }

  function arreter() {
    scanning = false;
    if (timer) { clearTimeout(timer); timer = null; }
    if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
    if (video) { try { video.pause(); } catch (e) {} video.srcObject = null; }
  }

  window.montrerScanner = montrerScanner;
  window.stopScanner = arreter;

  function init() {
    var r = el('scan-retour');
    if (r) r.addEventListener('click', function () {
      arreter();
      if (typeof montrerChoixComment === 'function') montrerChoixComment();
    });
    var encore = el('scan-encore');
    if (encore) encore.addEventListener('click', function () { montrerScanner(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
