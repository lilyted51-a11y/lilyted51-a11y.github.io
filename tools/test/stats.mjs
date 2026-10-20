/* ============ stats.mjs — resumen de las partidas de batch.mjs (copia local) ============
 * node tools/test/stats.mjs <archivo.jsonl> [etiqueta]
 * Por etiqueta: n, media, mediana, mínimo/máximo, % que llega a la Sentencia (30 min),
 * intervalo de confianza del 95 % de la media, y de qué se muere.
 */
import fs from 'node:fs';
const [,, file, only] = process.argv;
const rows = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)).filter(r => !r.error && r.t != null);
const by = {};
for (const r of rows) if (!only || r.label === only) (by[r.label] = by[r.label] || []).push(r);
const mmss = s => Math.floor(s / 60) + ':' + String(Math.round(s % 60)).padStart(2, '0');
for (const [label, rs] of Object.entries(by)) {
  const t = rs.map(r => r.t).sort((a, b) => a - b), n = t.length;
  const mean = t.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(t.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, n - 1));
  const ci = 1.96 * sd / Math.sqrt(n);
  const reach = rs.filter(r => r.t >= 1800 || r.judg != null).length;
  const src = {}; for (const r of rs) for (const [k, v] of Object.entries(r.dmgBy || {})) src[k] = (src[k] || 0) + v;
  const tot = Object.values(src).reduce((a, b) => a + b, 0) || 1;
  console.log(`${label}: n=${n} | media ${mmss(mean)} ±${mmss(ci)} (IC 95 %) | mediana ${mmss(t[n >> 1])} | min ${mmss(t[0])} max ${mmss(t[n - 1])} | llegan a 30:00: ${reach}/${n}`);
  console.log('   daño recibido: ' + Object.entries(src).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ' ' + Math.round(v / tot * 100) + '%').join(' · '));
  console.log('   nivel medio ' + Math.round(rs.reduce((a, r) => a + r.lv, 0) / n) + ' · vida máx media ' + Math.round(rs.reduce((a, r) => a + r.maxHp, 0) / n));
}
