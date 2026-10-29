import { abrirBaseDatos } from './db.js';

/**
 * Repositorio de Sectores de la Mina en IndexedDB
 */

export const sectoresRepo = {
  async guardarTodos(sectores) {
    const db = await abrirBaseDatos();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sectores', 'readwrite');
      const store = tx.objectStore('sectores');
      sectores.forEach((sec) => store.put(sec));
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  },

  async obtenerTodos() {
    const db = await abrirBaseDatos();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sectores', 'readonly');
      const store = tx.objectStore('sectores');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },

  async actualizar(sector) {
    const db = await abrirBaseDatos();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sectores', 'readwrite');
      const store = tx.objectStore('sectores');
      const req = store.put(sector);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
};

