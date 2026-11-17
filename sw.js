// 앱 파일만 폰에 보관해서 전파 없는 곳에서도 열리게 한다.
// 인터넷이 되면 최신 파일을 받아 보관하고, 안 되면 보관해 둔 파일로 연다.
// 명단·사진 같은 다른 요청은 절대 보관하지 않는다 (데이터는 IndexedDB에만 있음).
const CACHE = 'house-v2';
const FILES = ['./', 'index.html', 'manifest.json', 'icon.svg', 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js']
  .map(f => new URL(f, self.registration.scope).href);

self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', e => {
  const url = e.request.url.split(/[?#]/)[0];
  if (e.request.method !== 'GET' || !FILES.includes(url)) return;
  e.respondWith(
    fetch(e.request)
      .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(url, copy)); return res; })
      .catch(() => caches.match(url))
  );
});
