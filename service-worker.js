// Nombre del caché para esta versión de la aplicación
const CACHE_NAME = 'estadisticas-v1';

// Lista de URLs que queremos cachear.
// Asegúrate de incluir todos los archivos necesarios para que la app funcione offline.
const urlsToCache = [
  '/', // Importante para la raíz del sitio
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/icon-192x192.png', // Asegúrate de que estos iconos existan en tu carpeta
  '/icon-512x512.png'  // Asegúrate de que estos iconos existan en tu carpeta
  // Si usas Google Fonts directamente en tu CSS, también deberías cachearlas.
  // En tu caso, estás usando @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  // Por lo tanto, también deberías añadir esta URL a la lista:
  // 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap'
];

// Evento 'install': se dispara cuando el Service Worker se instala por primera vez.
// Aquí abrimos el caché y añadimos todos los recursos esenciales.
self.addEventListener('install', event => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cache abierto, añadiendo URLs...');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('Service Worker: Fallo al cachear URLs', err))
  );
});

// Evento 'fetch': se dispara cada vez que el navegador solicita un recurso (red).
// Aquí interceptamos las solicitudes y las servimos desde el caché si están disponibles,
// o desde la red si no.
self.addEventListener('fetch', event => {
  // Ignoramos solicitudes que no sean de tipo 'navigate' (por ejemplo, peticiones de extensión, etc.)
  // Esta condición es importante para evitar errores con peticiones que no son de la app.
  if (event.request.mode === 'navigate' || event.request.destination === 'document' || event.request.destination === 'script' || event.request.destination === 'style' || event.request.destination === 'image') {
      event.respondWith(
        caches.match(event.request)
          .then(response => {
            // Si el recurso está en caché, lo servimos desde ahí.
            if (response) {
              console.log('Service Worker: Sirviendo desde caché:', event.request.url);
              return response;
            }
            // Si no está en caché, intentamos obtenerlo de la red.
            console.log('Service Worker: Obteniendo de la red:', event.request.url);
            return fetch(event.request)
              .then(networkResponse => {
                // Si obtenemos una respuesta válida de la red, la cacheamos para futuras visitas.
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                  return networkResponse;
                }
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, responseToCache);
                  });
                return networkResponse;
              })
              .catch(() => {
                // Si la red falla y no hay nada en caché, podemos servir una página offline.
                // Aquí podrías servir una página HTML simple de "offline" si la creas.
                // return caches.match('/offline.html');
                console.warn('Service Worker: Fallo en red y no hay caché para', event.request.url);
                // O simplemente retornar un error si no quieres una página offline específica
                return new Response('<h1>Aplicación Offline</h1><p>No tienes conexión a internet y el contenido no está disponible sin conexión.</p>', {
                    headers: { 'Content-Type': 'text/html' }
                });
              });
          })
      );
  }
});

// Evento 'activate': se dispara cuando un nuevo Service Worker toma el control.
// Aquí limpiamos los cachés antiguos para asegurarnos de que solo se use la versión actual.
self.addEventListener('activate', event => {
  console.log('Service Worker: Activando...');
  const cacheWhitelist = [CACHE_NAME]; // Solo queremos mantener el caché actual

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Borrando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
