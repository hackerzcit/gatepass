/**
 * Service worker for offline support.
 * - Caches pages and static assets when visited online.
 * - When offline, serves cached content so the app still loads.
 * User must visit the site at least once while online for offline to work.
 */
const CACHE_NAME = "hackerz-gatepass-v1";

function isSameOrigin(url) {
  try {
    return new URL(url).origin === self.location.origin;
  } catch {
    return false;
  }
}

function shouldCache(request) {
  const url = request.url;
  if (!isSameOrigin(url)) return false;
  const path = new URL(url).pathname;
  if (path.startsWith("/api/")) return false;
  if (request.mode === "navigate") return true;
  return (
    path.startsWith("/_next/static/") ||
    path.endsWith(".js") ||
    path.endsWith(".css") ||
    path.endsWith(".ico") ||
    path.endsWith(".svg")
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = request.url;

  if (request.mode !== "navigate" && request.mode !== "same-origin") {
    return;
  }
  if (!isSameOrigin(url) || !shouldCache(request)) return;

  event.respondWith(
    (async () => {
      try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200) {
          const cache = await caches.open(CACHE_NAME);
          const clone = networkResponse.clone();
          cache.put(request, clone);
        }
        return networkResponse;
      } catch {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === "navigate") {
          return caches.match("/").then((r) => r || new Response(
            "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>Offline</title></head><body style=\"font-family:system-ui;padding:2rem;text-align:center;\"><h1>You're offline</h1><p>Open this app again when you have internet, or try again in a moment.</p></body></html>",
            { headers: { "Content-Type": "text/html" } }
          ));
        }
        throw new Error("Offline");
      }
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});
