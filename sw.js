const CACHE_NAME = 'faststile-v2';
const ASSETS = [
    '/FastStile/',
    '/FastStile/index.html',
    '/FastStile/style.css',
    '/FastStile/script.js',
    '/FastStile/manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', (event) => {
    event.respondWith(caches.match(event.request).then((response) => response || fetch(event.request)));
});
