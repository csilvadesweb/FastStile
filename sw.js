const CACHE_NAME = 'faststile-v1';
const ASSETS = [
  '/FastStile/',
  '/FastStile/index.html',
  '/FastStile/style.css',
  '/FastStile/script.js',
  '/FastStile/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
});
