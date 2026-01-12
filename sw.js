const CACHE_NAME = "faststile-v3-cache";

const STATIC_ASSETS = [
  "/FastStile/",
  "/FastStile/index.html",
  "/FastStile/style.css",
  "/FastStile/App.js",
  "/FastStile/script.js",
  "/FastStile/manifest.json",
  "/FastStile/privacy.html",
  "/FastStile/icons/icon-192.png",
  "/FastStile/icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(response => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => {
          if (event.request.mode === "navigate") {
            return caches.match("/FastStile/index.html");
          }
        });
    })
  );
});