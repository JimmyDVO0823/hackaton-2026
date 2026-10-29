/**
 * Capa de persistencia local en IndexedDB para funcionamiento PWA 100% offline.
 * REGLA: Solo data/ habla con IndexedDB. Las pantallas usan los repositorios.
 */

const DB_NAME = 'AtmosferaMinaDB';
const DB_VERSION = 1;

export function abrirBaseDatos() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Store para mediciones atmosféricas
      if (!db.objectStoreNames.contains('mediciones')) {
        const storeMed = db.createObjectStore('mediciones', { keyPath: 'id', autoIncrement: true });
        storeMed.createIndex('sectorId', 'sectorId', { unique: false });
        storeMed.createIndex('fecha', 'fecha', { unique: false });
        storeMed.createIndex('nivel', 'nivel', { unique: false });
      }

      // Store para sectores
      if (!db.objectStoreNames.contains('sectores')) {
        db.createObjectStore('sectores', { keyPath: 'id' });
      }

      // Store para estado de mina
      if (!db.objectStoreNames.contains('mina')) {
        db.createObjectStore('mina', { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

