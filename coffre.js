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

  motDePasse()         { return sessionStorage.getItem('rdg_mdp') || ''; },
  definirMotDePasse(m) { sessionStorage.setItem('rdg_mdp', m); },
  oublier()            { sessionStorage.removeItem('rdg_mdp'); },

  async appel(charge) {
    const res = await fetch(this.URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(Object.assign({ motDePasse: this.motDePasse() }, charge))
    });
    return res.json();
  },

  lire(table)               { return this.appel({ action: 'lire', table }); },
  ajouter(table, ligne)     { return this.appel({ action: 'ajouter', table, ligne }); },
  modifier(table, id, ligne){ return this.appel({ action: 'modifier', table, id, ligne }); },

  // Enregistre le mot de passe et vérifie qu'il est bon.
  async connexion(m) {
    this.definirMotDePasse(m);
    const r = await this.lire('Produits');
    if (r && r.ok) return true;
    this.oublier();
    return false;
  }
};
