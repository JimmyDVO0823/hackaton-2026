/**
 * Service Worker para funcionamiento PWA Offline
 * REGLAS:
 * - sw.js siempre en la raíz. Un service worker solo controla su carpeta hacia abajo.
 * - Versión de caché: atmosfera-v1
 * - Estrategia Cache-First para recursos estáticos con fallback a red.
 */

const CACHE_NAME = 'atmosfera-v1';

const STATIC_ASSETS = [
  './',
  './index.html',
  './favicon.svg',
  './icons.svg',
  './src/main.jsx',
  './src/App.jsx',
  './src/index.css',
  './src/styles/global.css',
  './src/config/limites.js',
  './src/core/evaluador.js',
  './src/core/calculos.js',
  './src/data/db.js',
  './src/data/mediciones.repo.js',
  './src/data/sectores.repo.js',
  './src/data/mina.repo.js',
  './src/alertas/audio.js',
  './src/alertas/voz.js',
  './src/alertas/vibracion.js',
  './src/hooks/useAtmosphericData.js',
  './src/hooks/useAlertas.js',
  './src/context/MinaContext.jsx',
  './src/layout/Sidebar.jsx',
  './src/layout/Header.jsx',
  './src/layout/FooterBar.jsx',
  './src/pages/TableroPage.jsx',
  './src/demo/datosEjemplo.js',
  './src/demo/simulador.js',
  './src/utils/formatters.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Algunos recursos dinámicos se cachearán en tiempo de ejecución:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Evitar interceptar extensiones de navegador
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Si falla la red sin conexión, devolver index.html si es navegación
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
    })
  );
});

