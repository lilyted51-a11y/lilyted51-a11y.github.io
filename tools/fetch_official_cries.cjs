// Copia local (25-11-2026): baja los gritos de los Pokémon del juego oficial (pokesurvivor.com/assets/cries/<n>.mp3,
// con permiso del dueño) a assets/cries/<nuestro número>.mp3: las 1025 especies y las formas que tienen grito propio
// (su número oficial está en G.FORMS[d].off). Las que no lo tienen usan el de su especie (js/core/cries.js, OWN).
// Con calma: 4 a la vez y una pausa; lo que ya está no se vuelve a bajar. Al acabar, la lista para OWN.
//   node tools/fetch_official_cries.cjs
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const G = {}; const ctx = vm.createContext({ G, window: {}, console });
for (const f of ['js/data/pokedex.js', 'js/data/forms.js']) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx);
const OUT = path.join(ROOT, 'assets/cries'); fs.mkdirSync(OUT, { recursive: true });
const jobs = [], seen = new Set();
for (const r of G.DEX) {
  const d = r.dex, off = d <= 1025 ? d : (G.FORMS[d] && G.FORMS[d].off);
  if (off && !seen.has(d)) { seen.add(d); jobs.push({ d, off }); }
}
for (const [d, f] of Object.entries(G.FORMS)) if (!seen.has(+d) && f.off) { seen.add(+d); jobs.push({ d: +d, off: f.off }); }
const ok = [], miss = [], err = [];
let bytes = 0;
const isMp3 = b => (b[0] === 0x49 && b[1] === 0x44 && b[2] === 0x33) || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0);
async function one(j) {
  const dst = path.join(OUT, j.d + '.mp3');
  if (fs.existsSync(dst)) { ok.push(j.d); bytes += fs.statSync(dst).size; return; }
  for (let t = 0; t < 3; t++) {
    try {
      const r = await fetch('https://pokesurvivor.com/assets/cries/' + j.off + '.mp3');
      const ct = r.headers.get('content-type') || '', buf = Buffer.from(await r.arrayBuffer());
      if (r.status === 404 || ct.includes('html')) { miss.push(j); return; }      // (sin grito: su página de 404)
      if (r.status !== 200 || !isMp3(buf)) throw new Error(r.status + ' ' + ct);
      fs.writeFileSync(dst, buf); bytes += buf.length; ok.push(j.d); return;
    } catch (e) { if (t === 2) err.push(Object.assign({ e: String(e) }, j)); await new Promise(r => setTimeout(r, 1500)); }
  }
}
(async () => {
  let i = 0;
  const worker = async () => { while (i < jobs.length) { await one(jobs[i++]); await new Promise(r => setTimeout(r, 120)); } };
  await Promise.all([worker(), worker(), worker(), worker()]);
  console.log('bajados', ok.length, '· sin grito', miss.length, '· errores', err.length, '·', (bytes / 1048576).toFixed(1), 'MB');
  if (err.length) console.log(JSON.stringify(err));
  console.log('OWN (formas con grito propio):', ok.filter(d => d > 1025).sort((a, b) => a - b).join(', '));
})();
