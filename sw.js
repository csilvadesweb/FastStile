const CACHE_NAME = 'faststile-pwa-v13'; // Versão incrementada
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './privacy.html',
  './icons/icon-192.png',
  './icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
];

// Instalação: Cache de Precaching
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching Assets');
        return cache.addAll(ASSETS);
      })
      .catch(err => console.error('[Service Worker] Cache Error:', err))
  );
});

// Ativação: Limpeza de Caches Antigos
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Clearing Old Cache:', key);
          return caches.delete(key);
        }
      })
    ))
  );
  return self.clients.claim();
});

// Interceptação de Requisições (Fetch Strategy: Cache First, falling back to Network)
self.addEventListener('fetch', (e) => {
  // Ignora APIs externas (AwesomeAPI) para garantir dados frescos ou erro explícito
  if (e.request.url.includes('awesomeapi')) {
    return; 
  }

  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      // Retorna cache se existir, senão tenta rede
      return cachedResponse || fetch(e.request).then(networkResponse => {
        // Opcional: Aqui poderíamos cachear novas requisições dinamicamente
        return networkResponse;
      });
    }).catch(() => {
      // Fallback final para robustez (ex: se offline e sem cache)
      // Se for uma navegação HTML, poderia retornar uma página offline.html
      if (e.request.mode === 'navigate') {
         return caches.match('./index.html');
      }
    })
  );
});
