import { useState, useEffect, useCallback } from 'react';
import { sectoresRepo } from '../data/sectores.repo.js';
import { medicionesRepo } from '../data/mediciones.repo.js';
import { SECTORES_EJEMPLO } from '../demo/datosEjemplo.js';
import { evaluarAtmosfera } from '../core/evaluador.js';

/**
 * Hook para gestionar sectores y mediciones en IndexedDB con soporte offline
 */
export function useAtmosphericData() {
  const [sectors, setSectors] = useState(SECTORES_EJEMPLO);
  const [cargando, setCargando] = useState(true);

  // Carga inicial desde IndexedDB con fallback
  useEffect(() => {
    async function cargar() {
      try {
        const datos = await sectoresRepo.obtenerTodos();
        if (datos && datos.length > 0) {
          setSectors(datos);
        } else {
          await sectoresRepo.guardarTodos(SECTORES_EJEMPLO);
          setSectors(SECTORES_EJEMPLO);
        }
      } catch (err) {
        console.warn('Usando memoria local por error en IndexedDB:', err);
        setSectors(SECTORES_EJEMPLO);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  // Registro de nueva medición
  const registrarMedicion = useCallback(async ({ sectorName, ch4, o2, co, operator }) => {
    const evaluacion = evaluarAtmosfera({ ch4, o2, co });
    const nuevoNivel = evaluacion.nivel;
    const esAlarma = nuevoNivel === 'ALARMA' || nuevoNivel === 'EVACUACION';
    const esPrecaucion = nuevoNivel === 'PRECAUCION';

    const statusBadge =
      nuevoNivel === 'EVACUACION'
        ? 'EVACUACIÓN'
        : nuevoNivel === 'ALARMA'
        ? 'ALARMA · SUSPENDER'
        : nuevoNivel === 'PRECAUCION'
        ? 'PRECAUCIÓN'
        : 'NORMAL';

    let sectorActualizado = null;

    setSectors((prev) => {
      const actualizados = prev.map((s) => {
        if (s.name.toLowerCase().includes(sectorName.toLowerCase())) {
          sectorActualizado = {
            ...s,
            status: nuevoNivel === 'EVACUACION' ? 'ALARMA' : nuevoNivel,
            statusBadge,
            pendingAlert: undefined,
            telemetry: {
              ch4: {
                label: 'CH₄ METANO',
                value: ch4.toFixed(1),
                unit: '%Vol',
                statusText: ch4 >= 0.5 ? 'Elevado' : 'Seguro (<1.0%)',
                isAlert: ch4 >= 0.5
              },
              o2: {
                label: 'O₂ OXÍGENO',
                value: o2.toFixed(1),
                unit: '%Vol',
                statusText: o2 >= 19.5 ? 'Apto (>19.5%)' : 'Deficiente',
                isAlert: o2 < 19.5
              },
              co: {
                label: 'CO MONÓXIDO',
                value: String(co),
                unit: 'PPM',
                statusText: co > 25 ? 'Crítico (>25)' : 'Bajo control',
                isAlert: co > 25
              }
            },
            lastMeasurement: {
              timeAgo: 'Hace un momento',
              operator
            }
          };
          return sectorActualizado;
        }
        return s;
      });

      // Persistir en IndexedDB de forma no bloqueante
      if (sectorActualizado) {
        sectoresRepo.actualizar(sectorActualizado).catch(console.error);
        medicionesRepo
          .guardar({
            sectorId: sectorActualizado.id,
            sectorNombre: sectorActualizado.name,
            ch4,
            o2,
            co,
            operador: operator,
            nivel: nuevoNivel
          })
          .catch(console.error);
      }

      return actualizados;
    });

    return { evaluacion, esAlarma, esPrecaucion };
  }, []);

  return {
    sectors,
    cargando,
    registrarMedicion
  };
}

