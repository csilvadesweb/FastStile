"use strict";

const CACHE_NAME = 'faststile-pwa-v5'; // Versão atualizada para forçar refresh
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './privacy.html',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
];

// Instala e força a ativação
self.addEventListener('install', (e) => {
  self.skipWaiting(); 
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// Remove caches antigos e assume controle
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  return self.clients.claim();
});

// Estratégia Network-First para garantir que dados novos (como premium) funcionem
self.addEventListener('fetch', (e) => {
  if (e.request.url.includes('awesomeapi')) return;
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
