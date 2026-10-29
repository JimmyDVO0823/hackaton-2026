/* oxlint-disable react/only-export-components */
import React, { createContext, useState } from 'react';

export const MinaContext = createContext(null);

const STORAGE_KEY_SUPERVISOR = 'atmo_supervisor_turno';

export function MinaProvider({ children }) {
  const [supervisorTurno, setSupervisorTurno] = useState(() => {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY_SUPERVISOR);
      if (guardado) return JSON.parse(guardado);
    } catch {
      // Ignorar error de storage
    }
    return {
      nombre: 'Ing. Carlos Andrés Mendoza',
      documento: '1053782910',
      cargo: 'Supervisor de Seguridad y SST',
      telefono: '+57 312 456 7890',
      horaInicioTurno: '14:00',
      turnoId: 'T2',
      iniciado: false,
    };
  });

  const [configMina, setConfigMina] = useState(() => {
    let operadorInicial = 'Ing. Carlos Andrés Mendoza (C.C. 1053782910)';
    try {
      const guardado = localStorage.getItem(STORAGE_KEY_SUPERVISOR);
      if (guardado) {
        const s = JSON.parse(guardado);
        if (s?.nombre) {
          operadorInicial = `${s.nombre} (C.C. ${s.documento || 'S/D'})`;
        }
      }
    } catch {}
    return {
      nombre: 'Mina El Carbón – Nivel 2',
      cota: 'COTA -420M · SECTOR GALERÍA SUR',
      categoria: 'II',
      turno: 'Turno 2 (14:00 - 22:00)',
      operador: operadorInicial,
    };
  });

  const [alertasActivas, setAlertasActivas] = useState([]);

  const registrarInicioTurno = (datosSupervisor) => {
    const ahora = new Date();
    const horaActualStr = ahora.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const nuevoSupervisor = {
      ...supervisorTurno,
      ...datosSupervisor,
      horaInicioTurno: datosSupervisor.horaInicioTurno || horaActualStr,
      fechaAperturaIso: ahora.toISOString(),
      iniciado: true,
    };

    setSupervisorTurno(nuevoSupervisor);
    setConfigMina((prev) => ({
      ...prev,
      operador: `${nuevoSupervisor.nombre} (C.C. ${nuevoSupervisor.documento || 'S/D'})`,
    }));

    try {
      localStorage.setItem(STORAGE_KEY_SUPERVISOR, JSON.stringify(nuevoSupervisor));
    } catch {
      // Ignorar en entornos restrictivos
    }
  };

  const actualizarConfiguracion = (nuevaCfg) => {
    setConfigMina((prev) => ({ ...prev, ...nuevaCfg }));
  };

  const agregarAlertaActiva = (alerta) => {
    setAlertasActivas((prev) => [alerta, ...prev.slice(0, 9)]);
  };

  const limpiarAlertas = () => {
    setAlertasActivas([]);
  };

  return (
    <MinaContext.Provider
      value={{
        configMina,
        actualizarConfiguracion,
        supervisorTurno,
        registrarInicioTurno,
        alertasActivas,
        agregarAlertaActiva,
        limpiarAlertas
      }}
    >
      {children}
    </MinaContext.Provider>
  );
}
