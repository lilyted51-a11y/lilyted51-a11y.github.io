/* ============ sw.js — para poder instalar el juego como app ============
 * - Código del juego (html, js, css): primero la red, así cada actualización
 *   llega al momento; si no hay conexión, la última copia guardada.
 * - Sprites, iconos y fuente: no cambian nunca, se sirven de la caché
 *   (se van guardando según se usan: no se descarga todo de golpe).
 *   Menos los disfraces (assets/pokemon/{dex}/k-*, tools/make_skins.py): esos
 *   se pueden retocar, así que van como el código (primero la red).
 * - Firebase y demás servicios de fuera no se tocan.
 * 25-11-2026:
 * - Del código se guarda UNA copia por fichero (sin el ?v=… de cada versión): antes se quedaba una por
 *   versión publicada y una por cada vez que se miraba version.json (cada 5 min), y el juego ocupaba más
 *   y más en el navegador. version.json ya no se guarda (sin red no sirve de nada).
 * - Los nombres nuevos (v2) borran al activarse lo de antes: la copia del código que había crecido y los
 *   sprites guardados, porque con las formas del juego oficial se cambiaron muchos (megas, Gigamax,
 *   Calyrex...) y si no se seguían viendo los viejos o cortados. Cuando se vuelvan a cambiar sprites que
 *   ya existían, hay que subir otra vez el número de ART.
 */
const CODE = 'ps-code-v2', ART = 'ps-art-v2';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CODE).then(c => c.addAll(['./', './index.html', './css/style.css', './manifest.webmanifest'])).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CODE && k !== ART).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (/\/version\.json$/.test(url.pathname)) return;          // (el aviso de versión nueva: siempre a la red)
  const art = /\/assets\/(pokemon|icons|fonts)\//.test(url.pathname) && !/\/k-[a-z0-9-]+\//.test(url.pathname);
  if (art) {
    e.respondWith(caches.open(ART).then(async c => {
      const hit = await c.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok) c.put(req, res.clone());
      return res;
    }));
    return;
  }
  const key = url.origin + url.pathname;                         // (una copia por fichero, sin ?v=…)
  e.respondWith(fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CODE).then(c => c.put(key, copy)); }
    return res;
  }).catch(async () => {
    // Sin red: la copia guardada. La página de inicio sólo sirve de respaldo
    // al abrir la web (nunca en lugar de un script o una imagen).
    const hit = (await caches.match(key)) || (await caches.match(req, { ignoreSearch: true }));
    if (hit) return hit;
    if (req.mode === 'navigate') return (await caches.match('./index.html')) || Response.error();
    return Response.error();
  }));
});
