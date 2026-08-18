const CACHE_NAME = "danang-kfood-v15";
const APP_ASSETS = [
  "./",
  "./index.html",
  "./styles.css?v=15",
  "./data.js?v=15",
  "./app.js?v=15",
  "./manifest.webmanifest",
  "./assets/taegeuk-icon.png",
  "./assets/step-1.webp",
  "./assets/step-2.webp",
  "./assets/step-3.webp",
  "./assets/step-4.webp",
  "./assets/step-5.webp",
  "./assets/step-6.webp"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
          return response;
        })
        .catch(() => {
          if (event.request.mode === "navigate") return caches.match("./index.html");
          return cached;
        });

      return cached || network;
    }),
  );
});
