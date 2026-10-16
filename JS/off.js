/* ============================================================
   CONTRIBUER À OPEN FOOD FACTS (rdg.html). Décisions : docs/RdG-10-open-food-facts-2026-10-14.md (J-C, 2026-10-14 : « aider le
   plus possible, tant qu'à entrer des codes-barres lors d'un achat »; seize décisions, aperçus vus et tranchés).
   Utilise entree.js, prix.js, epicerie.js (chargés avant) et scan.js (chercherOFF).
   · Au premier scan d'un code, à la maison (le sac seul, les deux sacs — jamais Rechercher : au magasin, on n'entre rien), l'app
     demande à Open Food Facts ce qui lui manque : les trois photos (le devant, les ingrédients, la valeur nutritive), le nom
     français, la marque, le format. S'il manque quelque chose, son logo (L1) paraît sur la carte, sur la fiche. Touché : l'article
     entre, puis l'écran des photos. Pas touché : l'article entre, et le produit va sur la liste « Pour Open Food Facts » (plus tard).
   · La liste : la 4e de Listes (sa barre porte la forme du logo, L2), toute la liste, le plus vieux en premier. Sa poubelle (J-C,
     2026-10-16 : « je n'ai pas gardé l'emballage ») : il la quitte (G = « Retiré … »); au prochain achat, Open Food Facts est
     redemandé et le logo reparaît — pas touché, il revient sur la liste.
   · Consommer et Ouvrir : la ligne d'un produit de la liste porte le logo (R1) — le produit en main, on fait les photos; ignoré, rien.
   · L'écran des photos (B) : les trois cases côte à côte (une vide : on la touche, l'appareil photo de l'iPhone s'ouvre, la photo se
     pose dans sa case); ce qui manque du texte, chacun son crayon; « Envoyer à Open Food Facts » / « Plus tard ». L'envoi passe par
     le coffre-fort (api.gs : le compte d'OFF de J-C dans les Propriétés du script, jamais ici), une photo à la fois. Les photos
     prises restent en mémoire le temps de la visite (trop lourdes pour l'appareil) : « Plus tard » les garde jusqu'à la fermeture.
   La liste vit dans l'onglet OFF (A ID · B Code · C ProduitID · D Manque · E Date · F Qui · G Envoye), écrite par SA file
   (rdg_off_attente, jamais celle des gestes : un coffre-fort qui ne connaît pas encore l'onglet n'y bloque rien); d'ici là, elle vit
   sur l'appareil (rdg_off). Manque : des mots séparés par des virgules (devant, ingredients, nutrition, nom, marque, format).
============================================================ */
const OFF_PHOTOS_CLES = [['devant', 'Le devant'], ['ingredients', 'Les ingrédients'], ['nutrition', 'La valeur nutritive']];
const OFF_TEXTES_CLES = [['nom', 'Nom'], ['marque', 'Marque'], ['format', 'Format']];
const OFF_MOTS = { devant: 'le devant', ingredients: 'les ingrédients', nutrition: 'la valeur nutritive', nom: 'le nom', marque: 'la marque', format: 'le format' };
const OFF_LOCAL = 'rdg_off', OFF_ATTENTE = 'rdg_off_attente';
const OFF_PHOTO_MAX = 1600, OFF_QUALITE = 0.85;   // la photo réduite sur l'appareil avant l'envoi (le VPN) : assez fine pour lire les ingrédients
/* Open Food Facts compte les demandes : trop d'un coup, il répond « 429 » (J-C, 2026-10-14 : deux photos parties, la 3e refusée). Une pause
   entre deux envois; un 429 : on attend et on réessaie, de plus en plus patients, le chariot dit combien de temps encore. */
const OFF_PAUSE = 3000, OFF_REESSAIS = [10000, 20000, 40000];
var OFF_LISTE = (() => { try { return JSON.parse(localStorage.getItem(OFF_LOCAL) || '[]'); } catch (e) { return []; } })();
var OFF_PHOTOS = {};      // { code: { devant: 'data:image/jpeg;base64,…' } } : les photos prises, pas encore envoyées
var OFF_ENVOYEES = {};    // { code: { devant: … } } : les photos parties pendant la visite — montrées « (envoyée) » dans leur case, pas une case vide
var OFF_VUE = null;       // l'écran des photos : { code, ligne, manque, etat, textes, retour, prise }
var OFF_FICHE = null;     // le sac seul : { code, manque, surListe, photos } — ce que la fiche sait d'Open Food Facts
/* Les codes qu'Open Food Facts a déjà au complet (gardés sur l'appareil) : au prochain achat, aucun appel. Les autres sont redemandés
   à chaque achat — un produit retiré de la liste y revient. */
const OFF_COMPLETS_LOCAL = 'rdg_off_complets';
var OFF_COMPLETS = (() => { try { return JSON.parse(localStorage.getItem(OFF_COMPLETS_LOCAL) || '{}') || {}; } catch (e) { return {}; } })();
let envoiOff = false, expeditionOff = false;

const codeOffOk = c => /^\d{8,14}$/.test(String(c || '').trim()) && !estPese(c);   // un vrai code-barres (pas un PLU, pas « sans code », pas un paquet pesé au magasin)
const estPhotoOff = k => OFF_PHOTOS_CLES.some(x => x[0] === k);
const manqueDe = l => String((l && l[3]) || '').split(',').map(s => s.trim()).filter(Boolean);
const completOff = code => !!OFF_COMPLETS[codeNu(code)];
function noterCompletOff(code) {
  OFF_COMPLETS[codeNu(code)] = 1;
  try { localStorage.setItem(OFF_COMPLETS_LOCAL, JSON.stringify(OFF_COMPLETS)); } catch (e) {}
}
/* Le produit de ce code sur la liste (pas encore envoyé ni retiré), ou null. */
function ligneOff(code) {
  const k = codeNu(code);
  return OFF_LISTE.find(l => !l[6] && codeNu(l[1]) === k) || null;
}
/* « les 3 photos, le nom », « les ingrédients, la valeur nutritive » */
function texteManque(manque) {
  const photos = manque.filter(estPhotoOff), autres = manque.filter(k => !estPhotoOff(k));
  const mots = photos.length === OFF_PHOTOS_CLES.length ? ['les 3 photos'] : photos.map(k => OFF_MOTS[k]);
  return mots.concat(autres.map(k => OFF_MOTS[k] || k)).join(', ');
}

/* ---------- La liste : la mémoire, sa file ---------- */
function garderOff() { try { localStorage.setItem(OFF_LOCAL, JSON.stringify(OFF_LISTE)); } catch (e) {} }
function lireAttenteOff() { try { return JSON.parse(localStorage.getItem(OFF_ATTENTE) || '[]'); } catch (e) { return []; } }
function ecrireAttenteOff(l) { try { localStorage.setItem(OFF_ATTENTE, JSON.stringify(l)); } catch (e) {} }
function poserLigneOff(ligne) {
  const i = OFF_LISTE.findIndex(l => String(l[0]) === String(ligne[0]));
  if (i === -1) OFF_LISTE.push(ligne.slice()); else OFF_LISTE[i] = ligne.slice();
}
/* Une ligne écrite : tout de suite ici, puis au Sheet par la file (neuve : ajouter, avec l'ID d'ici — rejouable; sinon : modifier). */
function ecrireOff(ligne, neuve) {
  poserLigneOff(ligne); garderOff();
  ecrireAttenteOff(lireAttenteOff().concat([{ op: neuve ? 'a' : 'm', ligne: ligne.slice() }]));
  setTimeout(expedierOff, 0);
}
/* references.off : les lignes pas encore envoyées. Absent (le coffre-fort ne connaît pas encore l'onglet) : celle de l'appareil.
   Ce qui attend encore dans la file est reposé par-dessus, comme les gestes. */
function poserListeOff(serveur) {
  if (Array.isArray(serveur)) OFF_LISTE = serveur.map(r => { const l = r.slice(); while (l.length < 7) l.push(''); l[1] = String(l[1] || ''); return l; });
  lireAttenteOff().forEach(e => poserLigneOff(e.ligne));
  garderOff();
  // un code de magasin (la viande pesée, entrée avant le 2026-10-15) n'est jamais pour Open Food Facts : il quitte la liste
  OFF_LISTE.filter(l => !l[6] && !codeOffOk(l[1])).forEach(l => { const n = l.slice(); n[6] = 'Retiré ' + dateDuJour(); ecrireOff(n, false); });
}
async function expedierOff() {
  if (expeditionOff || !Coffre.motDePasse()) return;
  expeditionOff = true;
  try {
    while (lireAttenteOff().length) {
      const e = lireAttenteOff()[0];
      let r = null;
      try { r = e.op === 'a' ? await Coffre.ajouter('OFF', e.ligne) : await Coffre.modifier('OFF', e.ligne[0], e.ligne); } catch (x) {}
      if (!(r && r.ok)) break;                    // réseau, ou l'onglet pas encore connu du coffre-fort : tout reste, ça repartira
      ecrireAttenteOff(lireAttenteOff().slice(1));
    }
  } finally { expeditionOff = false; }
}
/* Sur la liste (une fois par code) : ce qui manque à Open Food Facts, le jour de l'entrée, qui. */
function ajouterOff(code, pid, manque) {
  if (!codeOffOk(code) || !manque || !manque.length || ligneOff(code)) return;
  ecrireOff([idLocal(), String(code).trim(), String(pid || ''), manque.join(','), dateDuJour(), localStorage.getItem(QUI) || '', ''], true);
}

/* Ce qu'Open Food Facts a de ce code (scan.js : chercherOFF; frais : sans la mémoire de 2 minutes). null : pas de réponse. */
async function etatOff(code, frais) {
  if (!codeOffOk(code) || typeof window.chercherOFF !== 'function') return null;
  let d = null;
  try { d = await window.chercherOFF(String(code).trim(), frais); } catch (e) {}
  return d && !d.erreur ? d : null;
}

/* ---------- Le sac seul : la fiche ---------- */
function offFicheRaz() { OFF_FICHE = null; montrer('fiche-off', false); }
/* Le code connu (sa recherche finie : jamais deux appels à la fois). Déjà sur la liste : le logo tout de suite; Open Food Facts l'a
   déjà au complet : rien; sinon (un premier achat, un produit retiré de la liste…), Open Food Facts dit ce qui lui manque. */
async function offFiche(code) {
  code = String(code || '').trim();
  offFicheRaz();
  if (!codeOffOk(code)) return;
  const deja = ligneOff(code);
  if (deja) { OFF_FICHE = { code: code, manque: manqueDe(deja), surListe: true }; montrer('fiche-off', true); return; }
  if (completOff(code)) return;
  const d = await etatOff(code);
  if (d && !d.manque.length) noterCompletOff(code);
  if ($('vue-app').hidden || $('codebarres').value.trim() !== code || !d || !d.manque.length) return;
  OFF_FICHE = { code: code, manque: d.manque };
  montrer('fiche-off', true);
}
/* Le logo de la fiche touché : l'article entre (Enregistrer), puis l'écran des photos. L'entrée refusée (il manque un endroit…) :
   rien de plus — le prochain Enregistrer ne l'ouvrira pas sans un nouveau toucher. */
async function toucherOffFiche() {
  if (!OFF_FICHE) return;
  OFF_FICHE.photos = true;
  await enregistrer();
  if (OFF_FICHE) OFF_FICHE.photos = false;
}
/* Après l'entrée de la fiche (enregistrer) : sur la liste, et l'écran des photos si on l'a demandé (true : il est ouvert). */
function offApresFiche(code, pid) {
  const f = OFF_FICHE;
  OFF_FICHE = null;
  if (!f || codeNu(f.code) !== codeNu(code)) return false;
  if (!f.surListe) ajouterOff(f.code, pid, f.manque);
  if (!f.photos) return false;
  montrerOff(f.code, retourAuMenu);              // le sac seul : un article, et c'est fini — après les photos, le menu
  return true;
}

/* ---------- Les deux sacs : la carte ---------- */
async function offCarte(a) {
  if (!a || !codeOffOk(a.code)) return;
  const deja = ligneOff(a.code);
  if (deja) { a.off = { manque: manqueDe(deja), surListe: true }; montrerLogoCarte(a); return; }
  if (completOff(a.code)) return;
  const d = await etatOff(a.code);
  if (d && !d.manque.length) noterCompletOff(a.code);
  if (EPI_CARTE !== a || !d || !d.manque.length) return;
  a.off = { manque: d.manque };
  montrerLogoCarte(a);
}
function montrerLogoCarte(a) {
  const b = EPI_CARTE === a && $('epi-carte').querySelector('[data-off-carte]');
  if (b) b.hidden = false;
}
/* Touché : l'article entre (OK), puis l'écran des photos. La carte pose sa question (« L'associer à ce produit ? ») : le logo reste
   enfoncé, et la réponse fera le reste. */
function toucherOffCarte(b) {
  const a = EPI_CARTE;
  if (!a || !a.off) return;
  a.off.photos = true;
  if ($('epi-carte').querySelector('[data-epi-ok=""]')) { validerCarte(''); return; }
  b.setAttribute('aria-pressed', 'true');
}
/* Après l'entrée d'une carte (validerCarte) : sur la liste; les photos demandées : leur écran, puis on revient scanner (true). */
function offApresCarte(a, pid) {
  if (!a || !a.off) return false;
  if (!a.off.surListe) ajouterOff(a.code, pid, a.off.manque);
  if (!a.off.photos) return false;
  montrerOff(a.code, montrerScanEpicerie);
  return true;
}

/* ---------- Consommer, Ouvrir : le logo sur la ligne (R1) ---------- */
function boutonOff(rows, pid) {
  const r = (rows || []).find(x => codeOffOk(x[8]) && ligneOff(x[8]));
  return r ? '<button class="off" type="button" data-off="' + esc(String(r[8]).trim()) + '" data-off-pid="' + esc(pid) + '" aria-label="Photos pour Open Food Facts"></button>' : '';
}

/* ---------- La liste « Pour Open Food Facts » (Listes, la 4e) : toute la liste, le plus vieux en premier (Y) ---------- */
function remplirOff() {
  const cible = $('liste-off');
  if (!cible) return;
  const xs = OFF_LISTE.filter(l => !l[6] && codeOffOk(l[1])).sort((a, b) =>
    String(dateCourte(a[4]) || '').localeCompare(String(dateCourte(b[4]) || '')) || String(a[0]).localeCompare(String(b[0])));
  cible.innerHTML = xs.length ? '<div class="liste-blanche">' + xs.map(ligneListeOff).join('') + '</div>'
    : '<div class="accordeon-item"><span class="texte-petit texte-pale">Rien à envoyer à Open Food Facts.</span></div>';
}
function ligneListeOff(l) {
  const code = String(l[1]), st = derniereLigneCode(code);
  const det = [st ? nomListe(st[5]) : '', st ? String(st[6] || '') : ''].filter(Boolean).join(' · ') || code;
  const jour = jourCourt(l[4]);
  return '<div class="item"><div class="item-info"><div class="item-nom">' + esc(nomOff(l[2])) + '</div>' +
    '<div class="item-detail">' + esc(det) + '</div>' +
    '<div class="item-detail">Il manque : ' + esc(texteManque(manqueDe(l))) + '</div>' +
    (jour ? '<div class="item-detail">Entré le ' + esc(jour) + '</div>' : '') + '</div>' +
    '<div class="boutons-ligne"><button class="retirer" type="button" data-off-retirer="' + esc(l[0]) + '" aria-label="Retirer de la liste"></button>' +
    '<button class="off" type="button" data-off="' + esc(code) + '" aria-label="Photos pour Open Food Facts"></button></div></div>';
}
/* La poubelle (A sur aperçu : avant le logo) : « Retirer … de la liste ? » à la place de la ligne, Oui / Non, comme partout. */
function demanderRetraitOff(id) {
  remplirOff();                                    // une seule question à la fois
  const l = OFF_LISTE.find(x => String(x[0]) === String(id)), b = $('liste-off').querySelector('[data-off-retirer="' + selVal(id) + '"]');
  if (!l || !b) return;
  b.closest('.item').outerHTML = '<div class="accordeon-item accordeon-item-saisie"><span>' + esc('Retirer ' + nomOff(l[2]) + ' de la liste ?') + '</span>' + ouiNon('o', id) + '</div>';
}
/* Oui : il quitte la liste (rien d'effacé : la ligne de l'onglet OFF porte « Retiré » et le jour); au prochain achat, il reviendra. */
function retirerOff(id) {
  const l = OFF_LISTE.find(x => String(x[0]) === String(id));
  if (l && !l[6]) { const n = l.slice(); n[6] = 'Retiré ' + dateDuJour(); ecrireOff(n, false); }
  remplirOff();
}
/* Le nom de l'aliment (un produit inconnu des deux sacs porte « Inconnu 0626… » tant qu'on ne l'a pas complété). */
function nomOff(pid) {
  const p = PRODUITS.find(x => String(x.id) === String(pid));
  return p && !/^Inconnu \d/.test(p.nom) ? p.nom : 'Produit inconnu';
}
async function revenirListeOff() {
  await montrerListes();
  const t = $('liste-off').previousElementSibling;
  if (!t.classList.contains('ouvert')) toggleAccordeon(t);
}

/* ---------- L'écran des photos (B) ---------- */
async function montrerOff(code, retour) {
  const ligne = ligneOff(code);
  if (!ligne) { retour(); return; }
  toutCacher(); $('vue-off').hidden = false; $('btn-burger').hidden = false;
  window.scrollTo(0, 0);
  code = String(ligne[1]);
  const v = OFF_VUE = { code: code, ligne: ligne.slice(), manque: manqueDe(ligne), etat: null, textes: textesDepart(ligne), retour: retour, prise: '', fini: false };
  messageOff('');
  remplirVueOff();
  const recherche = etatOff(code, true);          // ce qu'Open Food Facts a MAINTENANT (quelqu'un l'a peut-être complété entre-temps)
  chariotPendant(recherche, 'Open Food Facts…');
  const d = await recherche;
  if (OFF_VUE !== v || $('vue-off').hidden || !d) return;   // parti ailleurs, ou pas de réponse : ce que la liste dit
  v.etat = d;
  if (!d.manque.length) {                          // il a déjà tout : il quitte la liste
    v.ligne[3] = ''; v.ligne[6] = dateDuJour(); ecrireOff(v.ligne, false); noterCompletOff(code);
    OFF_VUE = null;
    avis('Open Food Facts l\'a déjà. Merci quand même !', 'succes');
    retour(); return;
  }
  if (d.manque.join(',') !== v.manque.join(',')) { v.manque = d.manque; v.ligne[3] = d.manque.join(','); ecrireOff(v.ligne, false); }
  remplirVueOff();
}
/* Le texte qu'on enverra : le nom de l'aliment (en français), la marque et le format de sa dernière entrée — chacun se corrige. */
function textesDepart(ligne) {
  const st = derniereLigneCode(ligne[1]), nom = nomOff(ligne[2]);
  return { nom: nom === 'Produit inconnu' ? '' : nom, marque: st ? nomListe(st[5]) : '', format: st ? String(st[6] || '').trim() : '' };
}
function messageOff(t) { $('off-msg').className = 'message message-repli' + (t ? ' message-erreur' : ''); $('off-msg').textContent = t || ''; }
function remplirVueOff() {
  const v = OFF_VUE;
  if (!v) return;
  const prises = OFF_PHOTOS[v.code] || {}, chezEux = (v.etat && v.etat.photos) || {};
  $('off-photos').innerHTML = OFF_PHOTOS_CLES.map(([k, nom]) => {
    if (v.manque.indexOf(k) === -1) {              // Open Food Facts l'a : partie pendant la visite (la nôtre), ou déjà là (la leur)
      const partie = (OFF_ENVOYEES[v.code] || {})[k], src = partie || chezEux[k];
      return '<figure class="off-photo"><span class="off-cadre">' + (src ? '<img src="' + esc(src) + '" alt="">' : '') + '</span>' +
        '<figcaption>' + nom + (partie ? ' (envoyée)' : ' (déjà là)') + '</figcaption></figure>';
    }
    if (prises[k])                                 // prise : la petite pastille, pour la reprendre
      return '<figure class="off-photo"><span class="off-cadre"><img src="' + prises[k] + '" alt="">' +
        '<label class="off off-coin" for="off-fichier" data-off-photo="' + k + '" aria-label="Reprendre la photo"></label></span>' +
        '<figcaption>' + nom + '</figcaption></figure>';
    return '<figure class="off-photo"><label class="off-cadre off-vide" for="off-fichier" data-off-photo="' + k + '" aria-label="Prendre la photo">' +
      '<span class="off-grand"></span></label><figcaption>' + nom + '</figcaption></figure>';
  }).join('');
  const textes = OFF_TEXTES_CLES.filter(([k]) => v.manque.indexOf(k) !== -1);
  $('off-textes').hidden = !textes.length;
  $('off-textes').innerHTML = textes.map(([k, nom]) => {
    const val = String(v.textes[k] || '').trim();
    return '<div class="item"><div class="item-info"><div class="texte-petit texte-pale">' + nom + '</div>' +
      '<div class="item-nom">' + (val ? esc(val) : '<span class="texte-pale">(à écrire)</span>') + '</div></div>' +
      '<button class="crayon" type="button" data-off-texte="' + k + '" aria-label="Corriger"></button></div>';
  }).join('');
  const pret = aEnvoyerOff().length > 0 && !v.fini;   // rien de prêt : ni le merci ni Envoyer (on prend d'abord une photo)
  montrer('off-merci', pret); montrer('off-envoyer', pret);
  montrer('off-fini', v.fini); montrer('off-retour', v.fini); montrer('off-plus-tard', !v.fini);   // tout est parti : leur logo, « Merci ! », Retour
  iconeRetour('off-retour', v.retour === retourAuMenu);   // la maison mène au menu, la flèche recule d'un pas
}
/* Le crayon : la valeur devient un champ; Entrée ou toucher ailleurs la garde. */
function corrigerTexteOff(k) {
  const v = OFF_VUE, b = $('off-textes').querySelector('[data-off-texte="' + k + '"]');
  if (!v || !b) return;
  const cible = b.previousElementSibling.querySelector('.item-nom');
  cible.innerHTML = '<input class="champ champ-renommer" data-off-champ="' + k + '" autocomplete="off" enterkeyhint="done">';
  const champ = cible.firstElementChild;
  champ.value = v.textes[k] || '';
  champ.focus();
}
function garderTexteOff(champ) {
  const v = OFF_VUE;
  if (!v || !champ.isConnected) return;
  v.textes[champ.dataset.offChamp] = champ.value.trim();
  remplirVueOff();
}
/* Une photo prise : réduite ici (OFF_PHOTO_MAX), posée dans sa case. */
async function surPhotoOff() {
  const v = OFF_VUE, champ = $('off-fichier'), f = champ.files && champ.files[0];
  champ.value = '';                                  // la même case retouchée rouvre l'appareil
  if (!v || !f || !v.prise) return;
  try { (OFF_PHOTOS[v.code] = OFF_PHOTOS[v.code] || {})[v.prise] = await reduirePhoto(f); messageOff(''); }
  catch (e) { messageOff('Photo illisible — reprends-la.'); }
  if (OFF_VUE === v) remplirVueOff();
}
function reduirePhoto(fichier) {
  return new Promise((ok, non) => {
    const url = URL.createObjectURL(fichier), img = new Image();
    img.onload = () => {
      const r = Math.min(1, OFF_PHOTO_MAX / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement('canvas');
      c.width = Math.round(img.naturalWidth * r); c.height = Math.round(img.naturalHeight * r);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      ok(c.toDataURL('image/jpeg', OFF_QUALITE));
    };
    img.onerror = () => { URL.revokeObjectURL(url); non(new Error('illisible')); };
    img.src = url;
  });
}
/* Ce qui est prêt à partir : le texte qui manque (écrit), puis chaque photo prise. */
function aEnvoyerOff() {
  const v = OFF_VUE, prises = OFF_PHOTOS[v.code] || {}, envois = [], champs = {};
  OFF_TEXTES_CLES.forEach(([k]) => { if (v.manque.indexOf(k) !== -1 && String(v.textes[k] || '').trim()) champs[k] = String(v.textes[k]).trim(); });
  if (Object.keys(champs).length) envois.push({ champs: champs });
  OFF_PHOTOS_CLES.forEach(([k]) => { if (v.manque.indexOf(k) !== -1 && prises[k]) envois.push({ photo: k }); });
  return envois;
}
/* Envoyer : par le coffre-fort, un envoi à la fois (le texte, puis chaque photo), sous le chariot; chaque envoi réussi retire ce qu'il
   portait de ce qui manque (le coffre-fort réécrit la ligne). Un texte laissé vide (du vrac, sans marque) n'a rien à dire : on ne le
   redemandera pas. Tout est parti : le produit quitte la liste. Un refus : la raison reste écrite, les photos restent prises. */
async function envoyerOff() {
  const v = OFF_VUE;
  if (!v || envoiOff) return;
  const envois = aEnvoyerOff();
  if (!envois.length) return;
  envoiOff = true; messageOff('');
  montrerVoile(true);
  let erreur = '';
  const avant = v.ligne.join('|');
  try {
    await expedierOff();                             // la ligne d'abord, si elle attendait encore (le coffre-fort la crée de toute façon)
    const nbPhotos = envois.filter(x => x.photo).length;
    let n = 0;
    for (let i = 0; i < envois.length; i++) {
      const x = envois[i], quoi = x.photo ? 'Photo ' + (++n) + ' de ' + nbPhotos + '…' : 'Le texte…';
      $('voile-texte').textContent = quoi;
      if (i) await dormirOff(OFF_PAUSE);              // une pause entre deux envois : Open Food Facts compte les demandes
      const charge = { code: v.code, ligne: v.ligne.slice() };
      if (x.photo) { charge.photo = x.photo; charge.image = OFF_PHOTOS[v.code][x.photo].split(',')[1]; }
      else charge.champs = x.champs;
      let r = null;
      for (let essai = 0; ; essai++) {
        $('voile-texte').textContent = quoi;
        r = await Coffre.envoyerOFF(charge);
        if ((r && r.ok) || !tropDeDemandes(r) || essai >= OFF_REESSAIS.length) break;
        await patienterOff(OFF_REESSAIS[essai]);         // « 429 » : trop de demandes — on attend, puis on réessaie
      }
      if (!(r && r.ok)) {
        erreur = r && r.erreur === 'action inconnue' ? 'Pas envoyé : le coffre-fort ne sait pas encore parler à Open Food Facts (api.gs, à l\'ordi).'
          : tropDeDemandes(r) ? 'Pas envoyé : Open Food Facts reçoit trop de demandes en ce moment. Réessaie dans quelques minutes.'
          : 'Pas envoyé' + (r && r.erreur ? ' (' + r.erreur + ')' : '') + ' — réessaie.';
        break;
      }
      const faits = x.photo ? [x.photo] : Object.keys(x.champs);
      v.manque = v.manque.filter(k => faits.indexOf(k) === -1);
      if (x.photo) {                                    // partie : elle quitte les photos à envoyer, et reste dans sa case, « (envoyée) »
        (OFF_ENVOYEES[v.code] = OFF_ENVOYEES[v.code] || {})[x.photo] = OFF_PHOTOS[v.code][x.photo];
        delete OFF_PHOTOS[v.code][x.photo];
      }
      v.ligne[3] = v.manque.join(',');
    }
  } catch (e) { erreur = 'Pas envoyé (' + e.message + ') — réessaie.'; }
  finally { envoiOff = false; montrerVoile(false); }
  if (!erreur) v.manque = v.manque.filter(estPhotoOff);
  v.ligne[3] = v.manque.join(',');
  if (!v.manque.length) v.ligne[6] = dateDuJour();
  if (v.ligne.join('|') !== avant) ecrireOff(v.ligne, false);
  if (OFF_VUE !== v) return;
  if (erreur) { messageOff(erreur); noterErreur(erreur); remplirVueOff(); return; }
  if (!v.manque.length) { v.fini = true; remplirVueOff(); window.scrollTo(0, 0); return; }   // tout est parti : l'écran reste, le merci en gros (J-C, 2026-10-14, C sur aperçu : 3 s de message, c'était trop court)
  avis('Envoyé. Il reste ' + texteManque(v.manque) + '.', 'succes');
  remplirVueOff();
}
/* Un refus pour trop de demandes (« erreur 429 »). */
const tropDeDemandes = r => !!r && !r.ok && /\b429\b/.test(String(r.erreur || ''));
const dormirOff = ms => new Promise(ok => setTimeout(ok, ms));
/* L'attente après un 429, seconde par seconde sous le chariot : « Open Food Facts demande une pause… 18 s ». */
async function patienterOff(ms) {
  for (let s = Math.ceil(ms / 1000); s > 0; s--) {
    $('voile-texte').textContent = 'Open Food Facts demande une pause… ' + s + ' s';
    await dormirOff(1000);
  }
}
/* Plus tard, ou Retour une fois tout parti : d'où l'on vient. */
function quitterOff() {
  const v = OFF_VUE;
  OFF_VUE = null;
  if (v) delete OFF_ENVOYEES[v.code];             // la prochaine visite relit Open Food Facts : ses photos y seront
  if (v) v.retour(); else retourAuMenu();
}

function initOff() {
  $('off-photos').addEventListener('click', ev => {   // la case touchée : on retient laquelle, l'appareil photo s'ouvre (le label)
    const l = ev.target.closest('[data-off-photo]');
    if (l && OFF_VUE) OFF_VUE.prise = l.dataset.offPhoto;
  });
  $('off-fichier').addEventListener('change', surPhotoOff);
  $('off-textes').addEventListener('click', ev => { const b = ev.target.closest('[data-off-texte]'); if (b) corrigerTexteOff(b.dataset.offTexte); });
  $('off-textes').addEventListener('keydown', ev => { if (ev.key === 'Enter' && ev.target.dataset.offChamp) { ev.preventDefault(); ev.target.blur(); } });
  $('off-textes').addEventListener('focusout', ev => { if (ev.target.dataset.offChamp) garderTexteOff(ev.target); });
  $('off-envoyer').addEventListener('click', envoyerOff);
  $('off-plus-tard').addEventListener('click', quitterOff);
  $('off-retour').addEventListener('click', quitterOff);
  $('fiche-off').addEventListener('click', toucherOffFiche);
  $('liste-off').addEventListener('click', ev => {
    const r = ev.target.closest('[data-off-retirer]');   // la poubelle : la question
    if (r) { demanderRetraitOff(r.dataset.offRetirer); return; }
    const oui = ev.target.closest('[data-retirer-oui]');
    if (oui) { const k = oui.dataset.retirerOui; retirerOff(k.slice(k.indexOf('|') + 1)); return; }
    if (ev.target.closest('[data-retirer-non]')) { remplirOff(); return; }
    const b = ev.target.closest('[data-off]');
    if (b) montrerOff(b.dataset.off, revenirListeOff);
  });
  $('liste-off').previousElementSibling.addEventListener('click', function () { if (this.classList.contains('ouvert')) remplirOff(); });
}
document.addEventListener('DOMContentLoaded', initOff);
