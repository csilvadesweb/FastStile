const CACHE_NAME = 'faststile-pro-v2026';
const ASSETS = ['./', './index.html', './style.css', './script.js', './manifest.json', './privacy.html'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
