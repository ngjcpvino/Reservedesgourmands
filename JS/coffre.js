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

  async _envoyer(charge, delai) {
    const ctrl = delai ? new AbortController() : null;
    const minuterie = ctrl ? setTimeout(() => ctrl.abort(), delai) : null;
    try {
      const res = await fetch(this.URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(Object.assign({ motDePasse: this.motDePasse() }, charge)),
        signal: ctrl ? ctrl.signal : undefined
      });
      return await res.json();
    } finally { if (minuterie) clearTimeout(minuterie); }
  },

  lire(table)               { return this.appel({ action: 'lire', table }); },
  ajouter(table, ligne)     { return this.appel({ action: 'ajouter', table, ligne }); },
  modifier(table, id, ligne){ return this.appel({ action: 'modifier', table, id, ligne }); },

  // Rapides : un seul aller-retour
  references()              { return this.appel({ action: 'references' }, this.DELAI_LECTURE); },
  entrerArticle(charge)     { return this.appel(Object.assign({ action: 'entrerArticle' }, charge)); },
  ordonner(groupes)         { return this.appel({ action: 'ordonner', groupes }); },
  couleurs(charge)          { return this.appel(Object.assign({ action: 'couleurs' }, charge)); },
  consommer(charge)         { return this.appel(Object.assign({}, charge, { action: 'consommer' })); },   // STOCK + Sorties (+ PasAimes), à l'épreuve du reclic
  deplacer(charge)          { return this.appel(Object.assign({}, charge, { action: 'deplacer' })); },    // des lignes de STOCK changent d'endroit, rejouable
  reunir(charge)            { return this.appel(Object.assign({}, charge, { action: 'reunir' })); },      // deux noms d'une liste n'en font plus qu'un
  reunirProduits(charge)    { return this.appel(Object.assign({}, charge, { action: 'reunirProduits' })); },   // deux aliments n'en font plus qu'un (lots, sorties, « Pas aimé »)
  pasAime(charge)           { return this.appel(Object.assign({ action: 'pasAime' }, charge)); },     // retirer un « Pas aimé »
  achats(charge)            { return this.appel(Object.assign({}, charge, { action: 'achats' })); },  // la liste d'achats : des lignes écrites par ID (rejouable)

  // Enregistre le mot de passe et vérifie qu'il est bon.
  async connexion(m) {
    this.definirMotDePasse(m);
    const r = await this.lire('Produits');
    if (r && r.ok) return true;
    this.oublier();
    return false;
  }
};
