// Ein einfacher Name für unseren Cache
const CACHE_NAME = 'imposter-spiel-cache-v1';
// Die Dateien, die wir beim ersten Laden speichern wollen
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/logo192.png',
  '/logo512.png',
  '/manifest.json',
  '/word-categories.json'
  // Die JS- und CSS-Dateien werden von React automatisch hinzugefügt
];

// Event Listener für die Installation des Service Workers
self.addEventListener('install', event => {
  // Wir warten, bis der Cache geöffnet und alle unsere Dateien hinzugefügt wurden
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache wurde geöffnet');
        return cache.addAll(urlsToCache);
      })
  );
});

// Event Listener für Netzwerk-Anfragen (z.B. Laden von Dateien)
self.addEventListener('fetch', event => {
  event.respondWith(
    // Wir schauen zuerst im Cache nach, ob die angefragte Datei schon da ist
    caches.match(event.request)
      .then(response => {
        // Wenn die Datei im Cache ist, geben wir sie von dort zurück
        if (response) {
          return response;
        }
        // Wenn nicht, laden wir sie aus dem Netzwerk
        return fetch(event.request);
      }
    )
  );
});
