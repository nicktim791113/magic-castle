/* ============================================================
   魔法小皇宮 — Service Worker
   策略：預先快取 App 殼層；之後用 stale-while-revalidate，
   先回快取（離線可玩），背景再更新，不需手動改版本就會自動更新。
   ============================================================ */
const CACHE = "mlp-cache-v3";

const ASSETS = [
  "./",
  "./index.html",
  "./dressup.html",
  "./memory.html",
  "./match.html",
  "./maze.html",
  "./css/style.css",
  "./js/common.js",
  "./js/dressup.js",
  "./js/memory.js",
  "./js/match.js",
  "./js/maze.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-192.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  let url;
  try {
    url = new URL(req.url);
  } catch (e) {
    return;
  }
  if (url.origin !== self.location.origin) return; // 只處理同源資源

  event.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(req).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            if (res && res.status === 200 && res.type === "basic") {
              cache.put(req, res.clone());
            }
            return res;
          })
          .catch(() => cached || cache.match("./index.html"));
        // 先回快取（離線可玩），同時背景更新
        return cached || network;
      })
    )
  );
});
