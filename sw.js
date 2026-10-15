// Cache solo dei file locali della PWA; le API e Google non vengono intercettati.
importScripts('./notification-core.js');
const CACHE = 'anime-explorer-shell-v41';
const ASSETS = ['./', './index.html', './version.js', './calendar.js', './calendar.css', './notification-core.js', './notifications.js', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;
  if (url.href === new URL('./version.js', self.registration.scope).href) {
    event.respondWith(fetch(req, {cache: 'no-store'}).then(async response => {if(response.ok){const cache=await caches.open(CACHE);await cache.put(req,response.clone());}return response;}).catch(() => caches.match(req)));
    return;
  }
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).then(response => {if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put('./index.html',copy));}return response;}).catch(() => caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(req).then(cached => cached || fetch(req)));
});
self.addEventListener('message',event=>{
  if(event.data?.type==='check-episode-alerts')event.waitUntil(self.AnimeAlerts.checkToday(self.registration).catch(()=>{}));
});
self.addEventListener('periodicsync',event=>{
  if(event.tag==='anime-episode-alerts')event.waitUntil(self.AnimeAlerts.checkToday(self.registration));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const url=new URL(event.notification.data?.url||'./index.html?calendar=1',self.registration.scope).href;
  event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(async clients=>{
    const existing=clients.find(client=>client.url.startsWith(self.registration.scope));
    if(existing){const navigated=await existing.navigate(url);return (navigated||existing).focus()}
    return self.clients.openWindow(url);
  }));
});
