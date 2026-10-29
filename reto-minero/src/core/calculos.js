/**
 * Fórmulas matemáticas y correcciones normativas según Decreto 1886
 * REGLA: core/ NO toca el DOM. Solo funciones puras reutilizables.
 */

/**
 * Corrección de TWA por jornada laboral extendida (método Brief & Scala)
 * @param {number} vlp Valor Límite Permisible nominal (ppm o mg/m³)
 * @param {number} hd Horas de la jornada diaria (ej. 10 o 12)
 * @returns {{ factorCorreccion: number, vlpc: number }}
 */
export function calcularBriefScala(vlp, hd) {
  if (hd <= 8) {
    return { factorCorreccion: 1.0, vlpc: vlp };
  }
  const fc = (8 / hd) * ((24 - hd) / 16);
  const vlpc = vlp * fc;
  return { factorCorreccion: fc, vlpc };
}

/**
 * Cálculo del caudal requerido según personal y altitud
 * @param {number} numTrabajadores 
 * @param {number} altitudMsnm Metros sobre el nivel del mar
 * @returns {number} Caudal mínimo en m³/min
 */
export function calcularCaudalMinimoPersonal(numTrabajadores, altitudMsnm = 0) {
  const factor = altitudMsnm > 1500 ? 6.0 : 3.0;
  return numTrabajadores * factor;
}

