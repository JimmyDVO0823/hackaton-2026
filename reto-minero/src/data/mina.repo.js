import { abrirBaseDatos } from './db.js';

/**
 * Repositorio de Configuración y Metadatos de la Mina en IndexedDB
 */

export const minaRepo = {
  async obtenerConfiguracion() {
    const db = await abrirBaseDatos();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('mina', 'readonly');
      const store = tx.objectStore('mina');
      const req = store.get('mina_principal');
      req.onsuccess = () =>
        resolve(
          req.result || {
            id: 'mina_principal',
            nombre: 'Mina El Carbón – Nivel 2',
            cota: 'COTA -420M · SECTOR GALERÍA SUR',
            categoria: 'II',
            turno: 'Turno 2 (14:00 - 22:00)',
            operador: 'Ing. C. Mendoza'
          }
        );
      req.onerror = () => reject(req.error);
    });
  },

  async guardarConfiguracion(config) {
    const db = await abrirBaseDatos();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('mina', 'readwrite');
      const store = tx.objectStore('mina');
      const req = store.put({ ...config, id: 'mina_principal' });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
};

