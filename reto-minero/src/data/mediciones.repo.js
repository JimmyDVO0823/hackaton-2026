import { abrirBaseDatos } from './db.js';

/**
 * Repositorio de Mediciones Atmosféricas en IndexedDB
 * REGLA: Ningún componente toca IndexedDB directamente; siempre a través de este repo.
 */

export const medicionesRepo = {
  async guardar(medicion) {
    const db = await abrirBaseDatos();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('mediciones', 'readwrite');
      const store = tx.objectStore('mediciones');
      const registro = {
        ...medicion,
        fecha: medicion.fecha || new Date().toISOString()
      };
      const req = store.add(registro);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  async listar() {
    const db = await abrirBaseDatos();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('mediciones', 'readonly');
      const store = tx.objectStore('mediciones');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },

  async listarPorSector(sectorId) {
    const db = await abrirBaseDatos();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('mediciones', 'readonly');
      const store = tx.objectStore('mediciones');
      const index = store.index('sectorId');
      const req = index.getAll(sectorId);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }
};

