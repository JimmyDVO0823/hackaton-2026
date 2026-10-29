import { evaluarAtmosfera } from '../core/evaluador.js';

/**
 * Simulador de fluctuaciones de gases en tiempo real para demostraciones
 */
export function generarLecturaSimulada(sectorId, valoresBase = { ch4: 0.2, o2: 20.8, co: 5 }) {
  // Variación aleatoria controlada
  const deltaCh4 = (Math.random() - 0.48) * 0.1;
  const deltaO2 = (Math.random() - 0.5) * 0.1;
  const deltaCo = Math.floor((Math.random() - 0.45) * 3);

  const ch4 = Math.max(0, parseFloat((valoresBase.ch4 + deltaCh4).toFixed(2)));
  const o2 = Math.min(21.5, Math.max(18.0, parseFloat((valoresBase.o2 + deltaO2).toFixed(1))));
  const co = Math.max(0, valoresBase.co + deltaCo);

  const evaluacion = evaluarAtmosfera({ ch4, o2, co }, sectorId);

  return {
    ch4,
    o2,
    co,
    evaluacion,
    timestamp: new Date().toISOString()
  };
}

