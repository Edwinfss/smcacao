/* SM Notas: permite abrir la app sin señal.
   - La página se pide primero a internet (para recibir actualizaciones) y, si no hay señal, se usa la guardada.
   - Los archivos de la app (librería, íconos) se sirven desde el celular.
   - Las consultas a la base de datos (Supabase) NUNCA se guardan: siempre van por internet. */
const CACHE = 'smnotas-v11';
const ARCHIVOS = ['./', './index.html', './manifest.json', './supabase.js', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './favicon-32.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;   // base de datos: siempre por internet
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(r => { const copia = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', copia)); return r; })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
