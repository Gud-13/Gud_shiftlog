/* ═══════════════════════════════════════════
   ShiftLog — Service Worker
   Version: 5.18
   Стратегия: Network First — всегда пробуем
   получить свежую версию с сервера,
   кэш используем только если нет сети.
═══════════════════════════════════════════ */

const CACHE_NAME = 'shiftlog-v5.21';

const ASSETS = [
  '/Gud_shiftlog/',
  '/Gud_shiftlog/index.html',
  '/Gud_shiftlog/app.js',
  '/Gud_shiftlog/style.css',
  '/Gud_shiftlog/manifest.json',
  '/Gud_shiftlog/icon-192.png',
  '/Gud_shiftlog/icon-512.png',
];

// Установка — кэшируем все файлы
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Активация — удаляем старые кэши
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch — Network First стратегия
self.addEventListener('fetch', e => {
  // Пропускаем Firebase запросы — они не кэшируются
  if (e.request.url.includes('firebasedatabase') ||
      e.request.url.includes('googleapis') ||
      e.request.url.includes('gstatic')) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Получили свежий ответ — обновляем кэш
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Нет сети — отдаём из кэша
        return caches.match(e.request);
      })
  );
});
