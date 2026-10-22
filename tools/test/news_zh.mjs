/* news_zh.mjs — las novedades en la versión publicada (index.html, sin G), en chino: títulos, fechas y líneas (copia local) */
import { tab, sleep } from './cdp.lib.mjs';
const A = await tab(+(process.argv[2] || 9337));
await A.go('http://localhost:8765/index.html', 9000);
await A.ev(`document.getElementById('tap-start') && document.getElementById('tap-start').click(); 1`); await sleep(1500);
await A.ev(`document.getElementById('scr-invite') && document.getElementById('scr-invite').classList.add('hidden'); document.getElementById('btn-news').click(); 1`); await sleep(2000);
const days = JSON.parse(await A.ev(`JSON.stringify([...document.querySelectorAll('#news-body .news-day h3')].slice(0, 4).map(h => h.innerText.split(String.fromCharCode(10)).join(' | ')))`));
days.forEach(d => console.log('·', d));
const body = await A.ev(`document.getElementById('news-body').innerText`);
const latin = [...new Set((body.match(/[A-Za-zÀ-ž][A-Za-zÀ-ž' ]{4,}/g) || []).map(x => x.trim()))].filter(x => !/^(PokéSurvivor|Pok[eé]mon|Kecleon|TheAdro7|Mega|Bot)\b/i.test(x));
console.log('restos en latín:', JSON.stringify(latin.slice(0, 15)));
console.log('errores:', A.errs.slice(0, 3).join(' || ') || 'ninguno');
A.close(); process.exit(0);
