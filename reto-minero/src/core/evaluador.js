import { LIMITES_DECRETO_1886 } from '../config/limites.js';

/**
 * Evaluación de condiciones atmosféricas según Decreto 1886
 * REGLA: core/ no toca el DOM. Recibe datos y devuelve resultados puros.
 * 
 * Niveles de riesgo:
 * - Normal: < 50% del límite normativo
 * - Precaución: 50% a 80% del límite, o tendencia alcista
 * - Alarma: >= 100% del límite. Suspender labor y ventilar
 * - Evacuación: CH₄ > 2.0%, O₂ < 19.5%
 */
export function evaluarAtmosfera(medicion, tipoSitio = 'retorno_principal') {
  const { ch4 = 0, o2 = 20.9, co = 0 } = medicion;
  const alertas = [];

  // 1. Evaluación de Oxígeno (Art. 38)
  const limO2 = LIMITES_DECRETO_1886.OXIGENO;
  if (o2 < limO2.minApto) {
    alertas.push({
      gas: 'O2',
      nivel: 'EVACUACION',
      valor: o2,
      articulo: limO2.articulo,
      mensaje: `Deficiencia crítica de Oxígeno (${o2}%). Mínimo legal: ${limO2.minApto}%.`,
      accion: 'Evacuación inmediata del personal y activación de línea de vida.'
    });
  } else if (o2 < 20.0) {
    alertas.push({
      gas: 'O2',
      nivel: 'PRECAUCION',
      valor: o2,
      articulo: limO2.articulo,
      mensaje: `Oxígeno por debajo del estándar óptimo (${o2}%).`,
      accion: 'Verificar caudal de ventilación fresca.'
    });
  }

  // 2. Evaluación de Metano (Art. 53, Art. 162)
  const configSitio = LIMITES_DECRETO_1886.METANO_POR_SITIO[tipoSitio] || LIMITES_DECRETO_1886.METANO_POR_SITIO.retorno_principal;
  const limiteCh4 = configSitio.limite;

  if (ch4 >= 2.0) {
    alertas.push({
      gas: 'CH4',
      nivel: 'EVACUACION',
      valor: ch4,
      articulo: LIMITES_DECRETO_1886.METANO_POR_SITIO.limite_evacuacion.articulo,
      mensaje: `Metano crítico (${ch4}%). Riesgo inminente de explosividad.`,
      accion: 'Evacuación general, desenergización total de la labor. Solo personal de salvamento.'
    });
  } else if (ch4 >= limiteCh4) {
    alertas.push({
      gas: 'CH4',
      nivel: 'ALARMA',
      valor: ch4,
      articulo: LIMITES_DECRETO_1886.METANO_POR_SITIO.articulo,
      mensaje: `Límite de Metano superado (${ch4}% >= ${limiteCh4}%).`,
      accion: 'Suspender labor de inmediato, evacuar frente y ajustar ventilación auxiliar.'
    });
  } else if (ch4 >= limiteCh4 * 0.5) {
    alertas.push({
      gas: 'CH4',
      nivel: 'PRECAUCION',
      valor: ch4,
      articulo: LIMITES_DECRETO_1886.METANO_POR_SITIO.articulo,
      mensaje: `Metano elevado en rango de precaución (${ch4}%).`,
      accion: 'Monitoreo continuo y verificación de velocidad de aire.'
    });
  }

  // 3. Evaluación de Monóxido de Carbono (Art. 39)
  const limCO = LIMITES_DECRETO_1886.GASES_TOXICOS.CO.twa;
  if (co > limCO) {
    alertas.push({
      gas: 'CO',
      nivel: 'ALARMA',
      valor: co,
      articulo: LIMITES_DECRETO_1886.GASES_TOXICOS.articulo,
      mensaje: `Monóxido de Carbono superó TWA (${co} PPM > ${limCO} PPM).`,
      accion: 'Suspender labor, evacuar personal hacia corriente de aire fresco y ventilar.'
    });
  } else if (co >= limCO * 0.5) {
    alertas.push({
      gas: 'CO',
      nivel: 'PRECAUCION',
      valor: co,
      articulo: LIMITES_DECRETO_1886.GASES_TOXICOS.articulo,
      mensaje: `Monóxido de Carbono en precaución (${co} PPM).`,
      accion: 'Inspeccionar posibles combustiones lentas o gases de voladura.'
    });
  }

  // Determinar severidad máxima
  const prioridad = { EVACUACION: 4, ALARMA: 3, PRECAUCION: 2, NORMAL: 1 };
  let nivelMaximo = 'NORMAL';
  let alertaPrincipal = null;

  for (const a of alertas) {
    if (prioridad[a.nivel] > prioridad[nivelMaximo]) {
      nivelMaximo = a.nivel;
      alertaPrincipal = a;
    }
  }

  return {
    nivel: nivelMaximo,
    alertas,
    alertaPrincipal,
    esCritico: nivelMaximo === 'ALARMA' || nivelMaximo === 'EVACUACION'
  };
}

