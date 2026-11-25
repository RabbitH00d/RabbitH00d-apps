// Network first, cache as fallback: new cards and app updates arrive as soon as the phone is online.
const CACHE = "dm-v2";
const FILES = ["./", "index.html", "app.js", "decouvertes.json", "manifest.webmanifest", "icon.svg", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith("dm-") && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok && (sameOrigin || url.hostname.endsWith("gstatic.com") || url.hostname.endsWith("googleapis.com"))) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }).catch(async () => {
      const hit = await caches.match(req, { ignoreSearch: true });
      if (!hit) return Response.error();
      if (sameOrigin && url.pathname.endsWith("decouvertes.json")) {
        const h = new Headers(hit.headers);
        h.set("x-dm-offline", "1");
        return new Response(await hit.blob(), { status: 200, headers: h });
      }
      return hit;
    })
  );
});
