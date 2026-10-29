/**
 * Motor de predicción de tendencia de concentración de gas metano (CH4).
 * Utiliza regresión lineal sobre las últimas lecturas para calcular la tasa de variación
 * por minuto y proyectar el tiempo estimado hasta alcanzar el límite normativo del sitio.
 *
 * REGLA: Funciones puras, sin dependencias del DOM ni efectos secundarios.
 */

/**
 * Calcula la regresión lineal simple y la estimación de tiempo hasta el límite.
 *
 * @param {Array<{ ch4: number, fecha: string|number }>} ultimasLecturas - Mínimo 2 lecturas (típicamente 6)
 * @param {number} limiteNormativo - Límite de CH4 del sitio (ej. 1.0 o 1.5)
 * @returns {{
 *   tendencia: 'SUBIENDO' | 'BAJANDO' | 'ESTABLE',
 *   pendientePorMinuto: number,
 *   minutosHastaLimite: number | null,
 *   mensaje: string | null
 * }}
 */
export function estimarTiempoHastaLimite(ultimasLecturas = [], limiteNormativo = 1.0) {
  if (!ultimasLecturas || ultimasLecturas.length < 2) {
    return {
      tendencia: 'ESTABLE',
      pendientePorMinuto: 0,
      minutosHastaLimite: null,
      mensaje: null,
    };
  }

  // Ordenar cronológicamente ascendente (la más antigua primero)
  const ordenadas = [...ultimasLecturas].sort((a, b) => {
    const ta = typeof a.fecha === 'number' ? a.fecha : new Date(a.fecha).getTime();
    const tb = typeof b.fecha === 'number' ? b.fecha : new Date(b.fecha).getTime();
    return ta - tb;
  });

  const t0 = typeof ordenadas[0].fecha === 'number'
    ? ordenadas[0].fecha
    : new Date(ordenadas[0].fecha).getTime();

  // Convertir a minutos transcurridos x_i y valor y_i
  const puntos = ordenadas.map((r, idx) => {
    const t = typeof r.fecha === 'number' ? r.fecha : new Date(r.fecha).getTime();
    // Si las fechas son idénticas o no válidas, usar índice * 10 min
    const xMinutos = !isNaN(t) && t > t0 ? (t - t0) / 60000 : idx * 10;
    return { x: xMinutos, y: Number(r.ch4) || 0 };
  });

  const n = puntos.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += puntos[i].x;
    sumY += puntos[i].y;
    sumXY += puntos[i].x * puntos[i].y;
    sumX2 += puntos[i].x * puntos[i].x;
  }

  const denominador = n * sumX2 - sumX * sumX;
  if (Math.abs(denominador) < 1e-9) {
    return {
      tendencia: 'ESTABLE',
      pendientePorMinuto: 0,
      minutosHastaLimite: null,
      mensaje: null,
    };
  }

  // Pendiente m (% CH4 por minuto)
  const pendiente = (n * sumXY - sumX * sumY) / denominador;
  const ultimoValor = puntos[n - 1].y;

  // Umbral mínimo de pendiente para considerar que está subiendo (> +0.001 %/min = +0.06% por hora)
  const UMBRAL_PENDIENTE = 0.0008;

  if (pendiente > UMBRAL_PENDIENTE) {
    if (ultimoValor >= limiteNormativo) {
      return {
        tendencia: 'SUBIENDO',
        pendientePorMinuto: Number(pendiente.toFixed(5)),
        minutosHastaLimite: 0,
        mensaje: `Límite de ${limiteNormativo.toFixed(1).replace('.', ',')}% ya alcanzado`,
      };
    }

    const distancia = limiteNormativo - ultimoValor;
    const minutos = Math.max(1, Math.round(distancia / pendiente));

    // Si la proyección ocurre en un rango operativo razonable (< 180 min)
    const limiteFormateado = limiteNormativo.toFixed(1).replace('.', ',');
    return {
      tendencia: 'SUBIENDO',
      pendientePorMinuto: Number(pendiente.toFixed(5)),
      minutosHastaLimite: minutos,
      mensaje: `Llegaría a ${limiteFormateado}% en ~${minutos} min`,
    };
  }

  if (pendiente < -UMBRAL_PENDIENTE) {
    return {
      tendencia: 'BAJANDO',
      pendientePorMinuto: Number(pendiente.toFixed(5)),
      minutosHastaLimite: null,
      mensaje: null,
    };
  }

  return {
    tendencia: 'ESTABLE',
    pendientePorMinuto: Number(pendiente.toFixed(5)),
    minutosHastaLimite: null,
    mensaje: null,
  };
}

