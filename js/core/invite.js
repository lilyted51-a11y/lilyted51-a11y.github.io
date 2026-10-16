/* ============ invite.js — copia local: código de invitación ============
 * Antes de entrar (o crear cuenta) se pide un código. Sólo se guarda su huella
 * SHA-256 en Firestore, documento config/invite: { hashes: ['<sha256 hex>', ...] }
 * (lectura pública, ver firestore.rules). Varias huellas = varios códigos válidos.
 *
 *   - Si el documento no existe o está vacío, no se pide nada.
 *   - Acertado, se recuerda en este navegador (ps.invite): no se vuelve a pedir
 *     mientras esa huella siga en la lista.
 *   - Huella de un código:  python tools/invite_hash.py MICODIGO
 */
G.Invite = (() => {
  const K = 'ps.invite';
  let hashes = null;

  async function sha256(text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async function list() {
    if (hashes) return hashes;
    const fb = G.DB.fb;
    if (!fb || !fb.fs) return (hashes = []);
    try {
      const snap = await fb.fs.collection('config').doc('invite').get();
      const d = snap.exists ? snap.data() : {};
      hashes = Array.isArray(d.hashes) ? d.hashes.filter(h => typeof h === 'string' && h.length === 64) : [];
    } catch (e) { console.warn('[Invite] sin config/invite:', e.message); hashes = []; }
    return hashes;
  }

  /** ¿Hace falta pedir el código en este navegador? */
  async function needed() {
    const hs = await list();
    if (!hs.length) return false;
    let saved = null;
    try { saved = localStorage.getItem(K); } catch (e) { /* sin almacenamiento */ }
    return !(saved && hs.includes(saved));
  }

  /** Enseña la pantalla y llama a `then` cuando el código es correcto. */
  function ask(then) {
    const $ = id => document.getElementById(id);
    const scr = $('scr-invite'), inp = $('invite-code'), msg = $('invite-msg');
    scr.classList.remove('hidden');
    inp.value = ''; msg.textContent = '';
    setTimeout(() => inp.focus(), 50);
    $('invite-form').onsubmit = async e => {
      e.preventDefault();
      const code = inp.value.trim();
      if (!code) return;
      const h = await sha256(code);
      if (!hashes.includes(h)) {
        msg.textContent = 'Código incorrecto.';
        G.Audio.sfx('error');
        inp.select();
        return;
      }
      try { localStorage.setItem(K, h); } catch (e) { /* se pedirá otra vez */ }
      scr.classList.add('hidden');
      G.Audio.sfx('confirm');
      then();
    };
  }

  /** Si hace falta, pide el código; si no, sigue directamente. */
  async function gate(then) {
    if (await needed()) ask(then); else then();
  }

  return { gate, needed, sha256 };
})();
