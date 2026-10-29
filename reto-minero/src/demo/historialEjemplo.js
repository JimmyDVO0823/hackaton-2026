/**
 * Generador determinista de lecturas históricas de las últimas 24 horas.
 * REGLAS:
 * - Determinista: SIN Math.random().
 * - Una lectura cada 10 minutos (144 intervalos por nodo).
 * - Mediciones multigas completas: CH4, O2, CO, H2S, NOx, CO2, Temperatura y Humedad.
 * - Los sensores están conectados permanentemente a la red eléctrica (SIN batería).
 * - Retorno Principal N-2: CH4 sube de 0,4% a 1,1% en las últimas 2 h (ALARMA).
 * - Frente de Avance N-3: subida a 0,9% entre las 03:00 y las 04:30 y bajada tras ventilar.
 * - Nodo SIN_SEÑAL (Frente de Avance): deja de tener lecturas desde su última transmisión (hace 12 min).
 */

import { evaluarNodo } from '../core/evaluador.js';

export const NODOS_METADATA = [
  {
    id: 'retorno-principal',
    nombre: 'Retorno Principal',
    ubicacion: 'Galería Retorno · Sector Sur · Cota -420m',
    tipoSitio: 'retorno_principal',
    nivel: 'N-2',
    limite: 1.0,
    baseTemp: 28.0,
    baseHum: 84,
    baseO2: 20.0,
    baseCo: 12,
    baseH2s: 0.30,
    baseNox: 0.07,
    baseCo2: 1200,
  },
  {
    id: 'frente-explotacion-1',
    nombre: 'Frente de Explotación 1',
    ubicacion: 'Sector Norte · Tajo mecanizado',
    tipoSitio: 'frente_explotacion',
    nivel: 'N-2',
    limite: 1.0,
    baseTemp: 26.5,
    baseHum: 78,
    baseO2: 20.4,
    baseCo: 6,
    baseH2s: 0.15,
    baseNox: 0.04,
    baseCo2: 680,
  },
  {
    id: 'retorno-tajo',
    nombre: 'Retorno de Tajo',
    ubicacion: 'Sector Sur · Galería de retorno de tajo',
    tipoSitio: 'retorno_tajos',
    nivel: 'N-2',
    limite: 1.5,
    baseTemp: 27.2,
    baseHum: 82,
    baseO2: 20.1,
    baseCo: 9,
    baseH2s: 0.25,
    baseNox: 0.05,
    baseCo2: 950,
  },
  {
    id: 'frente-avance',
    nombre: 'Frente de Avance',
    ubicacion: 'Nivel 3 · Cota -540m · Galería Sur',
    tipoSitio: 'frente_avance',
    nivel: 'N-3',
    limite: 1.0,
    baseTemp: 24.1,
    baseHum: 70,
    baseO2: 20.8,
    baseCo: 4,
    baseH2s: 0.08,
    baseNox: 0.03,
    baseCo2: 480,
  },
  {
    id: 'retorno-preparacion',
    nombre: 'Retorno de Preparación',
    ubicacion: 'Nivel 1 · Cota -310m · Galería Este',
    tipoSitio: 'retorno_preparacion',
    nivel: 'N-1',
    limite: 1.5,
    baseTemp: 23.5,
    baseHum: 68,
    baseO2: 20.8,
    baseCo: 3,
    baseH2s: 0.08,
    baseNox: 0.02,
    baseCo2: 520,
  },
  {
    id: 'frente-explotacion-2',
    nombre: 'Frente de Explotación 2',
    ubicacion: 'Nivel 1 · Cota -310m · Frente Norte',
    tipoSitio: 'frente_explotacion',
    nivel: 'N-1',
    limite: 1.0,
    baseTemp: 22.8,
    baseHum: 65,
    baseO2: 20.9,
    baseCo: 2,
    baseH2s: 0.04,
    baseNox: 0.01,
    baseCo2: 430,
  },
];

/**
 * Calcula el valor de CH4 para un nodo en un momento dado de forma determinista.
 */
function calcularCh4Determinista(nodoId, timestamp, minutosAtras) {
  const d = new Date(timestamp);
  const horaDecimal = d.getHours() + d.getMinutes() / 60;

  switch (nodoId) {
    case 'retorno-principal': {
      // Evento: sube de 0,4% a 1,1% en las últimas 2 h (minutosAtras entre 120 y 0)
      if (minutosAtras <= 120) {
        const progreso = (120 - minutosAtras) / 120; // 0 a 1
        const curva = Math.pow(progreso, 1.25);
        const ondulacion = 0.01 * Math.sin(minutosAtras * 0.1);
        const val = 0.40 + 0.70 * curva + ondulacion;
        return Number(Math.min(1.10, Math.max(0.40, val)).toFixed(2));
      }
      const osc = 0.02 * Math.sin(minutosAtras * 0.08) + 0.01 * Math.cos(minutosAtras * 0.03);
      return Number((0.40 + osc).toFixed(2));
    }

    case 'frente-avance': {
      // Evento: subida a 0,9% entre las 03:00 y las 04:30 y bajada tras ventilar
      if (horaDecimal >= 3.0 && horaDecimal <= 4.5) {
        const distPico = Math.abs(horaDecimal - 3.75) / 0.75;
        const factorCampana = Math.cos(distPico * (Math.PI / 2));
        const val = 0.20 + 0.70 * Math.max(0, factorCampana);
        return Number(val.toFixed(2));
      }
      const osc = 0.02 * Math.sin(minutosAtras * 0.05);
      return Number((0.20 + osc).toFixed(2));
    }

    case 'retorno-tajo': {
      // Línea base en PRECAUCIÓN ~1.2% (límite 1.5%)
      const osc = 0.05 * Math.sin(minutosAtras * 0.06) + 0.02 * Math.cos(minutosAtras * 0.12);
      return Number((1.18 + osc).toFixed(2));
    }

    case 'frente-explotacion-1': {
      // Línea base en PRECAUCIÓN ~0.7% (límite 1.0%)
      const osc = 0.04 * Math.sin(minutosAtras * 0.08) - 0.02 * Math.cos(minutosAtras * 0.04);
      return Number((0.68 + osc).toFixed(2));
    }

    case 'retorno-preparacion': {
      const osc = 0.02 * Math.sin(minutosAtras * 0.07);
      return Number((0.30 + osc).toFixed(2));
    }

    case 'frente-explotacion-2':
    default: {
      const osc = 0.02 * Math.cos(minutosAtras * 0.09);
      return Number((0.20 + osc).toFixed(2));
    }
  }
}

/**
 * Genera el conjunto de lecturas de las últimas 24 horas para todos los nodos.
 * @param {Date|number} fechaReferencia
 * @returns {Array<Object>} Lista plana de lecturas ordenadas cronológicamente
 */
export function generarHistorial24h(fechaReferencia = new Date()) {
  const tBase = fechaReferencia instanceof Date
    ? fechaReferencia.getTime()
    : new Date(fechaReferencia).getTime();

  const totalPasos = 144; // 24 horas * 6 lecturas por hora
  const intervaloMs = 10 * 60 * 1000; // 10 minutos
  const resultado = [];

  for (const meta of NODOS_METADATA) {
    for (let paso = totalPasos; paso >= 0; paso--) {
      const minutosAtras = paso * 10;
      const t = tBase - paso * intervaloMs;

      // Evento: El nodo SIN_SEÑAL deja de tener lecturas desde hace 12 min
      if (meta.id === 'frente-avance' && minutosAtras < 12) {
        continue;
      }

      const ch4 = calcularCh4Determinista(meta.id, t, minutosAtras);

      // Variación determinista suave para temperatura y humedad
      const variacionTemp = 0.4 * Math.sin((paso + meta.limite * 10) * 0.1);
      const variacionHum = 1.5 * Math.cos((paso + meta.limite * 5) * 0.08);

      const temperatura = Number((meta.baseTemp + variacionTemp).toFixed(1));
      const humedad = Math.round(meta.baseHum + variacionHum);

      // Variación determinista para los otros gases (correlacionados con ventilación y CH4)
      const factorDesplazamiento = ch4 * 0.35; // A mayor metano, menor oxígeno libre
      const o2 = Number((meta.baseO2 - factorDesplazamiento + 0.1 * Math.sin(paso * 0.08)).toFixed(2));
      const co = Number((meta.baseCo + (ch4 > 0.8 ? 5 : 0) + 0.8 * Math.cos(paso * 0.05)).toFixed(1));
      const h2s = Number((meta.baseH2s + 0.03 * Math.sin(paso * 0.1)).toFixed(2));
      const nox = Number((meta.baseNox + 0.01 * Math.cos(paso * 0.07)).toFixed(2));
      const co2 = Math.round(meta.baseCo2 + ch4 * 200 + 40 * Math.sin(paso * 0.04));

      const d = new Date(t);
      const fechaIso = d.toISOString();
      const horaFormateada = d.toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
      });

      // Evaluar estado normativo en este punto temporal
      const evaluacion = evaluarNodo(
        {
          id: meta.id,
          tipoSitio: meta.tipoSitio,
          lectura: { ch4, temperatura, fecha: fechaIso },
        },
        new Date(t)
      );

      resultado.push({
        id: `${meta.id}-${paso}`,
        nodoId: meta.id,
        nombreNodo: meta.nombre,
        ubicacion: meta.ubicacion,
        nivelMina: meta.nivel,
        tipoSitio: meta.tipoSitio,
        limiteCh4: meta.limite,
        timestamp: t,
        minutosAtras,
        fechaIso,
        horaFormateada,
        ch4,
        o2,
        co,
        h2s,
        nox,
        co2,
        temperatura,
        humedad,
        alertaNivel: evaluacion.nivel,
      });
    }
  }

  // Orden cronológico ascendente (más antiguo al más reciente)
  return resultado.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Obtiene las últimas N lecturas de un nodo específico para cálculo de tendencia.
 */
export function obtenerUltimasLecturasNodo(nodoId, n = 6, fechaReferencia = new Date()) {
  const todas = generarHistorial24h(fechaReferencia);
  const delNodo = todas.filter((l) => l.nodoId === nodoId);
  return delNodo.slice(-n);
}
