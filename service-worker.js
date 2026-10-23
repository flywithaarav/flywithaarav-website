// FlyWithAarav PWA cache: check the network first so uploaded updates appear promptly.
const CACHE_NAME = "flywithaarav-shell-v1-2-3";
const APP_SHELL = ["./", "./index.html", "./style.css", "./app-icon.svg", "./manifest.webmanifest", "./version.json", "./updates.html", "./ban-check.js"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes("/rest/") || url.pathname.includes("/auth/")) return;

  // Always check for the latest version metadata; never serve a stale version.json.
  if (url.pathname.endsWith("/version.json")) {
    event.respondWith(fetch(request, { cache: "no-store" }).catch(() => caches.match(request)));
    return;
  }

  // Network-first for pages and assets, with cached fallback for offline use.
  event.respondWith(fetch(request, { cache: "no-cache" }).then(response => {
    if (response.ok) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
    }
    return response;
  }).catch(async () => (await caches.match(request)) || (request.mode === "navigate" ? await caches.match("./index.html") : Response.error())));
});
