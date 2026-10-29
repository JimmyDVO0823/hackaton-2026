import { useState, useEffect, useCallback, useRef } from 'react';
import {
  obtenerInfoTurnos,
  calcularResumenTurno,
  generarCsvResumenTurno,
  descargarArchivoCsv,
} from '../core/turnos.js';
import { generarHistorial24h } from '../demo/historialEjemplo.js';
import { turnosRepo } from '../data/repositorio.js';

const STORAGE_KEY_ULTIMO_TURNO = 'atmo_ultimo_turno_descargado';

/**
 * Hook para la entrega automática del documento "Resumen de Turno" (CSV) cada 8 horas.
 * - Detecta el cambio de turno (06:00, 14:00, 22:00).
 * - Descarga automáticamente el CSV al finalizar cada turno.
 * - Provee control manual para descargar el turno actual o simular el cierre de turno.
 */
export function useTurnoAutomatico(onNotificacion, supervisorTurno = null) {
  const [infoTurnos, setInfoTurnos] = useState(() => obtenerInfoTurnos());
  const ultimoTurnoIdRef = useRef(infoTurnos.turnoActual.id);

  // Función para ejecutar la exportación de un turno
  const exportarTurno = useCallback((turno, esAutomatico = false) => {
    const ahora = Date.now();
    const historial = generarHistorial24h(ahora);
    const resumen = calcularResumenTurno(historial, turno);
    const csv = generarCsvResumenTurno(resumen, supervisorTurno);

    const fechaStr = new Date().toISOString().split('T')[0];
    const nombre = `resumen-turno-${turno.id}_${fechaStr}.csv`;
    const ok = descargarArchivoCsv(csv, nombre);

    // Guardar registro histórico del turno en IndexedDB con trazabilidad del supervisor
    try {
      turnosRepo.guardar({
        id: `turno-${turno.id}-${fechaStr}-${Date.now().toString().slice(-4)}`,
        codigo: turno.codigo,
        nombre: turno.nombre,
        fecha: fechaStr,
        generadoEn: new Date().toISOString(),
        supervisor: supervisorTurno,
        resumen,
      }).catch(() => {});
    } catch {
      // Ignorar si falla IndexedDB
    }

    if (ok) {
      const msg = esAutomatico
        ? `🔔 ¡Turno Finalizado (${turno.nombre})! Se descargó automáticamente el Resumen de Turno (${nombre}).`
        : `📄 Resumen de ${turno.nombre} generado y descargado exitosamente (${nombre}).`;
      onNotificacion?.(msg, 'success');
    }
    return ok;
  }, [onNotificacion, supervisorTurno]);

  // Verificar periódicamente el tiempo y el cambio de turno cada 5 segundos
  useEffect(() => {
    const verificarTurno = () => {
      const ahora = new Date();
      const nuevaInfo = obtenerInfoTurnos(ahora);
      setInfoTurnos(nuevaInfo);

      const turnoActualId = nuevaInfo.turnoActual.id;
      const turnoPrevio = nuevaInfo.turnoPrevio;

      // Si cambió el turno (ej. de T1 a T2 a las 14:00)
      if (ultimoTurnoIdRef.current && ultimoTurnoIdRef.current !== turnoActualId) {
        const claveRegistro = `descargado_${turnoPrevio.clave}`;
        const yaDescargado = localStorage.getItem(claveRegistro);

        if (!yaDescargado) {
          // Descargar automáticamente el resumen del turno que acaba de finalizar
          exportarTurno(turnoPrevio, true);
          try {
            localStorage.setItem(claveRegistro, new Date().toISOString());
            localStorage.setItem(STORAGE_KEY_ULTIMO_TURNO, turnoPrevio.clave);
          } catch {
            // Ignorar errores de storage en modo privado
          }
        }
      }

      ultimoTurnoIdRef.current = turnoActualId;
    };

    const intervalId = setInterval(verificarTurno, 5000);
    return () => clearInterval(intervalId);
  }, [exportarTurno]);

  // Descarga manual del turno actual en curso
  const descargarTurnoActual = useCallback(() => {
    return exportarTurno(infoTurnos.turnoActual, false);
  }, [exportarTurno, infoTurnos.turnoActual]);

  // Simulación para demostración / evaluación de hackathon
  const simularFinDeTurno = useCallback(() => {
    exportarTurno(infoTurnos.turnoActual, true);
  }, [exportarTurno, infoTurnos.turnoActual]);

  return {
    turnoActual: infoTurnos.turnoActual,
    turnoPrevio: infoTurnos.turnoPrevio,
    descargarTurnoActual,
    simularFinDeTurno,
  };
}
