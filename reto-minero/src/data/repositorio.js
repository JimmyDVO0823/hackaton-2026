/**
 * Repositorios de datos para la aplicación Atmo-Monitor.
 * Abstrae el acceso a IndexedDB para trabajadores, lecturas, alertas y turnos.
 */

import {
  dbObtenerTodos,
  dbObtenerPorId,
  dbGuardar,
  dbEliminar,
  dbBuscarPorIndice,
} from './db.js';

// ── REPOSITORIO DE TRABAJADORES Y FICHAS DE EMERGENCIA ────────────────────────
export const trabajadoresRepo = {
  async listar() {
    return await dbObtenerTodos('trabajadores');
  },

  async obtenerPorId(id) {
    return await dbObtenerPorId('trabajadores', id);
  },

  async guardar(trabajador) {
    if (!trabajador.id) {
      trabajador.id = `TRAB-${Date.now().toString().slice(-4)}`;
    }
    await dbGuardar('trabajadores', trabajador);
    return trabajador;
  },

  async eliminar(id) {
    return await dbEliminar('trabajadores', id);
  },

  async listarPorSector(sectorId) {
    const todos = await dbObtenerTodos('trabajadores');
    return todos.filter((t) => t.sectorAsignado === sectorId);
  },

  async listarPorTurno(turnoId) {
    const todos = await dbObtenerTodos('trabajadores');
    return todos.filter((t) => t.turnoHabitual === turnoId);
  },
};

// ── REPOSITORIO DE LECTURAS HISTÓRICAS ────────────────────────────────────────
export const lecturasRepo = {
  async guardar(lectura) {
    return await dbGuardar('lecturas', lectura);
  },

  async listarPorNodo(nodoId) {
    try {
      return await dbBuscarPorIndice('lecturas', 'nodoId', nodoId);
    } catch {
      const todos = await dbObtenerTodos('lecturas');
      return todos.filter((l) => l.nodoId === nodoId);
    }
  },

  async listarRecientes(limite = 500) {
    const todas = await dbObtenerTodos('lecturas');
    return todas.slice(-limite);
  },
};

// ── REPOSITORIO DE ALERTAS Y BITÁCORA ─────────────────────────────────────────
export const alertasRepo = {
  async guardar(alerta) {
    if (!alerta.id) {
      alerta.id = `ALERTA-${Date.now()}`;
    }
    return await dbGuardar('alertas', alerta);
  },

  async listar() {
    return await dbObtenerTodos('alertas');
  },
};

// ── REPOSITORIO DE RESÚMENES DE TURNO ─────────────────────────────────────────
export const turnosRepo = {
  async guardar(turno) {
    return await dbGuardar('turnos', turno);
  },

  async listar() {
    return await dbObtenerTodos('turnos');
  },
};
