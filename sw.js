// Hablo service worker: appka funguje i offline.
// Při každé úpravě souborů zvyš číslo verze, ať se telefon stáhne novou verzi.
const VERSION = 'hablo-v1';
const FILES = [
  './', 'index.html', 'style.css', 'app.js', 'content.js', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-32.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Vlastní soubory: nejdřív síť (ať máš vždy novou verzi), bez sítě cache.
// Fonty z Googlu: nejdřív cache.
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      const copy = res.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); return res;
    })));
    return;
  }
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then((res) => {
      const copy = res.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || caches.match('index.html')))
  );
});
