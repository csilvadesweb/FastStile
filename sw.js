"use strict";

/**
 * FastStile Finance Pro - Service Worker
 * Versão: 2.1.0 (2026)
 * Objetivo: Garantir funcionamento offline e instalação nativa.
 */

const CACHE_NAME = 'faststile-v3-pro';

// Lista de arquivos essenciais para funcionamento offline
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

// Instalação: Salva todos os arquivos no cache do navegador
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Cache aberto e populando ativos.');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Ativação: Limpa caches antigos de versões anteriores
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('SW: Removendo cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estratégia de Busca (Fetch): Tenta o Cache primeiro, se falhar busca na Rede
self.addEventListener('fetch', (event) => {
  // Ignorar requisições de API de câmbio para não travar o app se estiver offline
  if (event.request.url.includes('awesomeapi')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Retorna o cache se existir, senão faz a requisição na rede
      return response || fetch(event.request).then((fetchResponse) => {
        // Opcional: Adicionar novas requisições dinamicamente ao cache
        return caches.open(CACHE_NAME).then((cache) => {
          if (event.request.method === 'GET') {
            cache.put(event.request, fetchResponse.clone());
          }
          return fetchResponse;
        });
      });
    }).catch(() => {
      // Se ambos falharem (offline e sem cache), você pode retornar uma página amigável
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});
