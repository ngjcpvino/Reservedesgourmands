/* ============================================================
   COFFRE — communication avec le coffre-fort (Apps Script).
   Partagé par TOUTES les pages. Le mot de passe voyage en HTTPS,
   il n'est jamais écrit dans le code.
   Une page l'utilise ainsi :
     await Coffre.connexion(mdp)         -> true / false
     await Coffre.lire('Stock')          -> { ok, lignes }
     await Coffre.ajouter('Produits', […])
     await Coffre.modifier('Stock', id, […])
============================================================ */
const Coffre = {
  URL: 'https://script.google.com/macros/s/AKfycbzh7b73Vt7Jm0EJIeZx1BN9-Bbu3_6seatzMZTrf_zCKrHuJVnymJba0fmK8Rlkjyqf/exec',

  motDePasse()         { return localStorage.getItem('rdg_mdp') || ''; },
  definirMotDePasse(m) { localStorage.setItem('rdg_mdp', m); },
  oublier()            { localStorage.removeItem('rdg_mdp'); },

  // LA FILE : un seul appel à la fois, dans l'ordre, pour toute l'app — même ceux
  // qui partent en arrière-plan. Le VPN échappe les appels simultanés (« Load failed »).
  _file: Promise.resolve(),
  appel(charge, delai) {
    const tour = this._file.then(() => this._envoyer(charge, delai));
    this._file = tour.catch(() => {});   // un échec ne bloque pas la file
    return tour;
  },

  // Une LECTURE qui ne répond pas est abandonnée après ce délai (ms) : sinon le chariot de
  // l'entrée tournerait sans fin, et la file resterait bloquée derrière. Jamais pour une
  // écriture : le coffre-fort pourrait l'avoir faite quand même.
  DELAI_LECTURE: 12000,

  // Un échec dit POURQUOI (J-C, 2026-10-07 : « Circulaires pas lues », sans raison, et on devinait) — trois cas que l'app
  // confondait : e.delai (pas de réponse à temps), e.reseau (la communication
  // coupée — le VPN, ou une page d'erreur de Google qui n'a pas le droit d'entrer), e.plante (le coffre-fort a répondu
  // une page d'erreur au lieu de sa réponse : le script a planté — sa phrase d'erreur est gardée).
  async _envoyer(charge, delai) {
    const ctrl = delai ? new AbortController() : null;
    const minuterie = ctrl ? setTimeout(() => ctrl.abort(), delai) : null;
    const debut = Date.now();
    let texte;
    try {
      const res = await fetch(this.URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(Object.assign({ motDePasse: this.motDePasse() }, charge)),
        signal: ctrl ? ctrl.signal : undefined
      });
      texte = await res.text();
    } catch (e) {
      const s = Math.round((Date.now() - debut) / 1000);
      throw e.name === 'AbortError' ? this._echec('pas de réponse en ' + s + ' s', 'delai')
                                    : this._echec('communication coupée après ' + s + ' s (' + e.message + ')', 'reseau');
    } finally { if (minuterie) clearTimeout(minuterie); }
    try { return JSON.parse(texte); }
    catch (e) { throw this._echec('le coffre-fort a planté : ' + this._extrait(texte), 'plante'); }
  },
  _echec(message, genre) { const e = new Error(message); e[genre] = true; return e; },
  // La page d'erreur de Google n'est pas du JSON : on en garde la phrase qui dit pourquoi (« TypeError: … (ligne 812, fichier api) »).
  _extrait(html) {
    const t = String(html || '').replace(/<(style|script|title)[^]*?<\/\1>/gi, ' ').replace(/<[^>]*>/g, ' ')
      .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n)).replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"')
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
    const m = t.match(/[A-Za-z]*(Error|Exception|Erreur)\b.*/);
    return (m ? m[0] : t).slice(0, 200) || 'réponse vide';
  },

  lire(table)               { return this.appel({ action: 'lire', table }); },
  ajouter(table, ligne)     { return this.appel({ action: 'ajouter', table, ligne }); },
  modifier(table, id, ligne){ return this.appel({ action: 'modifier', table, id, ligne }); },

  // Rapides : un seul aller-retour
  references(delai)         { return this.appel({ action: 'references' }, delai || this.DELAI_LECTURE); },   // delai : la patience de cet essai (l'entrée en fait plusieurs, de plus en plus patients)
  entrerArticle(charge)     { return this.appel(Object.assign({ action: 'entrerArticle' }, charge)); },
  ordonner(groupes)         { return this.appel({ action: 'ordonner', groupes }); },
  couleurs(charge)          { return this.appel(Object.assign({ action: 'couleurs' }, charge)); },
  consommer(charge)         { return this.appel(Object.assign({}, charge, { action: 'consommer' })); },   // STOCK + Sorties (+ PasAimes), à l'épreuve du reclic
  deplacer(charge)          { return this.appel(Object.assign({}, charge, { action: 'deplacer' })); },    // des lignes de STOCK changent d'endroit, rejouable
  reunir(charge)            { return this.appel(Object.assign({}, charge, { action: 'reunir' })); },      // deux noms d'une liste n'en font plus qu'un
  reunirProduits(charge)    { return this.appel(Object.assign({}, charge, { action: 'reunirProduits' })); },   // deux aliments n'en font plus qu'un (lots, sorties, « Pas aimé »)
  pasAime(charge)           { return this.appel(Object.assign({ action: 'pasAime' }, charge)); },     // retirer un « Pas aimé »
  achats(charge)            { return this.appel(Object.assign({}, charge, { action: 'achats' })); },  // la liste d'achats : des lignes écrites par ID (rejouable)
  lireTri(delai)            { return this.appel({ action: 'lireTri' }, delai || this.DELAI_LECTURE); },   // la page de tri des circulaires : ce qui est à trier + les réponses déjà données (une lecture; delai : la patience de cet essai)
  trier(charge)             { return this.appel(Object.assign({}, charge, { action: 'trier' })); },     // Oui / Peut-être / Jamais pour des articles (onglet Tri, rejouable)
  chercherOFF(charge)       { return this.appel(Object.assign({}, charge, { action: 'chercherOFF' }), this.DELAI_LECTURE); },   // le tri : Open Food Facts par le nom et la marque (une lecture)
  identifier(code)          { return this.appel({ action: 'identifier', code: code }, this.DELAI_LECTURE); },                 // toute l'épicerie : un code inconnu → les circulaires d'IGA, puis Open Food Facts (une lecture)
  circulaireMagasin(mag)    { return this.appel({ action: 'circulaireMagasin', magasin: mag }, this.DELAI_LECTURE); },        // toute l'épicerie : la circulaire de la semaine d'une épicerie (une lecture)

  // Enregistre le mot de passe et vérifie qu'il est bon.
  async connexion(m) {
    this.definirMotDePasse(m);
    const r = await this.lire('Produits');
    if (r && r.ok) return true;
    this.oublier();
    return false;
  }
};
