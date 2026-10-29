/**
 * Base de Datos Local de Atmo-Monitor (IndexedDB).
 * Permite operación 100% autónoma y offline en bocamina e interiores de mina subterránea.
 * 
 * Almacenes:
 * - `lecturas`: Histórico continuo multigas por nodo sensor.
 * - `alertas`: Bitácora de incidentes, superaciones de límites y evacuaciones.
 * - `turnos`: Resúmenes y actas de turno minero de 8 horas (Decreto 1886).
 * - `trabajadores`: Personal minero con roles y Ficha Médica de Emergencia (tipos de sangre, patologías, alergias).
 */

import { TRABAJADORES_INICIALES } from './trabajadoresEjemplo.js';
import { generarHistorial24h } from '../demo/historialEjemplo.js';

const DB_NOMBRE = 'AtmoMonitorDB';
const DB_VERSION = 1;

let dbInstancia = null;
let dbPromise = null;

/**
 * Abre o conecta con la base de datos IndexedDB.
 */
export function abrirBD() {
  if (dbInstancia) return Promise.resolve(dbInstancia);
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB no está disponible en este entorno.'));
      return;
    }

    const request = window.indexedDB.open(DB_NOMBRE, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // 1. Almacén de Lecturas de Sensores
      if (!db.objectStoreNames.contains('lecturas')) {
        const storeLecturas = db.createObjectStore('lecturas', { keyPath: 'id', autoIncrement: true });
        storeLecturas.createIndex('nodoId', 'nodoId', { unique: false });
        storeLecturas.createIndex('timestamp', 'timestamp', { unique: false });
        storeLecturas.createIndex('nodo_ts', ['nodoId', 'timestamp'], { unique: false });
      }

      // 2. Almacén de Alertas y Eventos
      if (!db.objectStoreNames.contains('alertas')) {
        const storeAlertas = db.createObjectStore('alertas', { keyPath: 'id' });
        storeAlertas.createIndex('nodoId', 'nodoId', { unique: false });
        storeAlertas.createIndex('nivel', 'nivel', { unique: false });
        storeAlertas.createIndex('fecha', 'fecha', { unique: false });
      }

      // 3. Almacén de Turnos Mineros
      if (!db.objectStoreNames.contains('turnos')) {
        const storeTurnos = db.createObjectStore('turnos', { keyPath: 'id' });
        storeTurnos.createIndex('codigo', 'codigo', { unique: false });
        storeTurnos.createIndex('fecha', 'fecha', { unique: false });
      }

      // 4. Almacén de Trabajadores y Emergencias Médicas
      if (!db.objectStoreNames.contains('trabajadores')) {
        const storeTrabajadores = db.createObjectStore('trabajadores', { keyPath: 'id' });
        storeTrabajadores.createIndex('documento', 'documento', { unique: true });
        storeTrabajadores.createIndex('rol', 'rol', { unique: false });
        storeTrabajadores.createIndex('sectorAsignado', 'sectorAsignado', { unique: false });
        storeTrabajadores.createIndex('turnoHabitual', 'turnoHabitual', { unique: false });
        storeTrabajadores.createIndex('tipoSangre', 'fichaMedica.tipoSangre', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      dbInstancia = event.target.result;
      dbPromise = null;
      // Inicializar datos semilla si están vacíos
      sembrarDatosIniciales(dbInstancia)
        .then(() => resolve(dbInstancia))
        .catch(() => resolve(dbInstancia)); // continuar aun con error menor de semilla
    };

    request.onerror = (event) => {
      dbPromise = null;
      reject(event.target.error || new Error('Error al abrir IndexedDB'));
    };
  });

  return dbPromise;
}

/**
 * Si la base de datos está vacía, puebla con el historial de 24h y los trabajadores iniciales.
 */
async function sembrarDatosIniciales(db) {
  try {
    // 1. Verificar si existen trabajadores
    const txTrab = db.transaction('trabajadores', 'readonly');
    const storeTrab = txTrab.objectStore('trabajadores');
    const conteoTrabReq = storeTrab.count();

    const trabCount = await new Promise((res) => {
      conteoTrabReq.onsuccess = () => res(conteoTrabReq.result);
      conteoTrabReq.onerror = () => res(0);
    });

    if (trabCount === 0) {
      const txEscritura = db.transaction('trabajadores', 'readwrite');
      const stW = txEscritura.objectStore('trabajadores');
      for (const trab of TRABAJADORES_INICIALES) {
        stW.put(trab);
      }
    }

    // 2. Verificar si existen lecturas
    const txLect = db.transaction('lecturas', 'readonly');
    const storeLect = txLect.objectStore('lecturas');
    const conteoLectReq = storeLect.count();

    const lectCount = await new Promise((res) => {
      conteoLectReq.onsuccess = () => res(conteoLectReq.result);
      conteoLectReq.onerror = () => res(0);
    });

    if (lectCount === 0) {
      const lecturasSemilla = generarHistorial24h(Date.now());
      const txLectW = db.transaction('lecturas', 'readwrite');
      const stLectW = txLectW.objectStore('lecturas');
      for (const l of lecturasSemilla) {
        stLectW.add(l);
      }
    }
  } catch (err) {
    console.warn('Advertencia al sembrar datos iniciales en IndexedDB:', err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MÉTODOS GENÉRICOS DE ACCESO A DATOS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Obtiene todos los registros de una tabla/almacén.
 */
export async function dbObtenerTodos(nombreStore) {
  const db = await abrirBD();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(nombreStore, 'readonly');
    const store = tx.objectStore(nombreStore);
    const req = store.getAll();

    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Obtiene un registro por su clave primaria.
 */
export async function dbObtenerPorId(nombreStore, id) {
  const db = await abrirBD();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(nombreStore, 'readonly');
    const store = tx.objectStore(nombreStore);
    const req = store.get(id);

    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Inserta o actualiza un registro.
 */
export async function dbGuardar(nombreStore, item) {
  const db = await abrirBD();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(nombreStore, 'readwrite');
    const store = tx.objectStore(nombreStore);
    const req = store.put(item);

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Elimina un registro por ID.
 */
export async function dbEliminar(nombreStore, id) {
  const db = await abrirBD();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(nombreStore, 'readwrite');
    const store = tx.objectStore(nombreStore);
    const req = store.delete(id);

    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Consulta registros mediante un índice.
 */
export async function dbBuscarPorIndice(nombreStore, indiceNombre, valor) {
  const db = await abrirBD();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(nombreStore, 'readonly');
    const store = tx.objectStore(nombreStore);
    const indice = store.index(indiceNombre);
    const req = indice.getAll(valor);

    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}
