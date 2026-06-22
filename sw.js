/* ============================================================
   魔法小皇宮 — Service Worker
   策略：預先快取 App 殼層；之後用 stale-while-revalidate，
   先回快取（離線可玩），背景再更新，不需手動改版本就會自動更新。
   ============================================================ */
const CACHE = "mlp-cache-v19";

const ASSETS = [
  "./",
  "./index.html",
  "./dressup.html",
  "./memory.html",
  "./match.html",
  "./maze.html",
  "./cards.html",
  "./tictactoe.html",
  "./math.html",
  "./archery.html",
  "./race.html",
  "./css/style.css",
  "./js/common.js",
  "./js/dressup.js",
  "./js/memory.js",
  "./js/match.js",
  "./js/maze.js",
  "./js/cards.js",
  "./js/tictactoe.js",
  "./js/math.js",
  "./js/archery.js",
  "./js/race.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-192.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./assets/sound/cat.wav",
  "./assets/sound/dog.mp3",
  "./assets/sound/cow.mp3",
  "./assets/sound/duck.mp3",
  "./assets/sound/rooster.mp3",
  "./assets/sound/pig.mp3",
  "./assets/sound/sheep.mp3",
];
// 註：assets/img/ 的圖片由使用者用 ChatGPT 產生後再放入；
// 因為一開始可能還不存在，不放進預先快取清單（會由 fetch 時自動快取），
// 缺圖時程式會自動退回 emoji。

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
          .catch(() => cached || (req.mode === "navigate" ? cache.match("./index.html") : Response.error()));
        // 先回快取（離線可玩），同時背景更新
        return cached || network;
      })
    )
  );
});
