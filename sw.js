const CACHE_NAME = "amp211-shell-v2";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Deliberately does NOT intercept the HTML document or app scripts — this
// site is under active development, and a page that's ever slightly stale
// (self-edit, new data, new features) is worse than one that just always
// loads fresh from the network like a normal page. Only photos are cached,
// since they never change once published and are the one thing worth
// saving bandwidth/offline access for.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.pathname.indexOf("/photos/") === -1) return;

  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
      return res;
    }))
  );
});
