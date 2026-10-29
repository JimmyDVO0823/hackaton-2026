import { LIMITES_DECRETO_1886 } from '../config/limites.js';

/**
 * Prioridad de severidad para consolidar el estado del nodo
 */
const PRIORIDAD_NIVEL = {
  EVACUACION: 5,
  ALARMA: 4,
  PRECAUCION: 3,
  SIN_SEÑAL: 2,
  NORMAL: 1
};

/**
 * Evaluación de telemetría de un nodo sensor según Decreto 1886 de 2015
 * REGLA: Ningún número fijo dentro del evaluador. Todo se lee de limites.js.
 * 
 * @param {Object} nodo Modelo de nodo { tipoSitio, lectura: { ch4, temperatura, fecha } }
 * @param {Date|number|string} [ahora=new Date()] Momento de referencia para evaluar conectividad
 * @returns {{ nivel: string, alertas: Array, alertaPrincipal: Object|null }}
 */
export function evaluarNodo(nodo, ahora = new Date()) {
  const alertas = [];
  const fechaActual = ahora instanceof Date ? ahora : new Date(ahora);
  const fechaLectura = new Date(nodo?.lectura?.fecha || 0);

  // 1. Evaluación de Pérdida de Conexión (SIN_SEÑAL)
  const diffMs = fechaActual.getTime() - fechaLectura.getTime();
  const minutosTranscurridos = diffMs / (1000 * 60);

  if (minutosTranscurridos > LIMITES_DECRETO_1886.SIN_SEÑAL_MINUTOS) {
    alertas.push({
      tipo: 'CONECTIVIDAD',
      nivel: 'SIN_SEÑAL',
      mensaje: `Nodo sin transmitir hace ${Math.round(minutosTranscurridos)} min`,
      detalle: `Superó el límite de ${LIMITES_DECRETO_1886.SIN_SEÑAL_MINUTOS} minutos sin reporte`
    });
  }

  // 2. Evaluación de Metano (CH4) según tipo de sitio
  const configSitio =
    LIMITES_DECRETO_1886.METANO_POR_SITIO[nodo?.tipoSitio] ||
    LIMITES_DECRETO_1886.METANO_POR_SITIO.frente_explotacion;

  const ch4 = nodo?.lectura?.ch4 ?? 0;
  const limiteSitio = configSitio.limite;
  const limiteEvacuacion = LIMITES_DECRETO_1886.METANO_POR_SITIO.limite_evacuacion.limite;
  const umbralPrecaucion = limiteSitio * LIMITES_DECRETO_1886.UMBRAL_PRECAUCION;

  if (ch4 >= limiteEvacuacion) {
    alertas.push({
      tipo: 'CH4',
      nivel: 'EVACUACION',
      gas: 'CH4',
      valor: ch4,
      limite: limiteEvacuacion,
      articulo: LIMITES_DECRETO_1886.METANO_POR_SITIO.limite_evacuacion.articulo,
      mensaje: `Metano crítico (${ch4}% >= ${limiteEvacuacion}%). Riesgo inminente de explosión.`,
      accion: 'Evacuación inmediata y desenergización total. Solo personal de salvamento.'
    });
  } else if (ch4 >= limiteSitio) {
    alertas.push({
      tipo: 'CH4',
      nivel: 'ALARMA',
      gas: 'CH4',
      valor: ch4,
      limite: limiteSitio,
      articulo: LIMITES_DECRETO_1886.METANO_POR_SITIO.articulo,
      mensaje: `Límite de Metano superado (${ch4}% >= ${limiteSitio}%).`,
      accion: 'Suspender labor de inmediato y reforzar ventilación.'
    });
  } else if (ch4 >= umbralPrecaucion) {
    alertas.push({
      tipo: 'CH4',
      nivel: 'PRECAUCION',
      gas: 'CH4',
      valor: ch4,
      limite: limiteSitio,
      articulo: LIMITES_DECRETO_1886.METANO_POR_SITIO.articulo,
      mensaje: `Metano en rango de precaución (${ch4}% >= ${umbralPrecaucion}%).`,
      accion: 'Monitoreo continuo y verificación de velocidad de ventilación.'
    });
  }

  // 3. Evaluación de Temperatura ambiente (marcada "por validar")
  const temp = nodo?.lectura?.temperatura;
  const limTemp = LIMITES_DECRETO_1886.TEMPERATURA;
  if (temp != null && temp > limTemp.maximo) {
    alertas.push({
      tipo: 'TEMPERATURA',
      nivel: 'PRECAUCION',
      valor: temp,
      limite: limTemp.maximo,
      estado: limTemp.estado,
      mensaje: `Temperatura de ${temp}°C supera ${limTemp.maximo}°C (${limTemp.estado}).`,
      accion: 'Inspeccionar ventilación y confort térmico.'
    });
  }

  // 4. Evaluación de Material Particulado (PM2.5 y PM10)
  const limParticulado = LIMITES_DECRETO_1886.MATERIAL_PARTICULADO;
  if (limParticulado) {
    const pm25 = nodo?.lectura?.pm25;
    const pm10 = nodo?.lectura?.pm10;
    const aumentoSostenidoPm25 = nodo?.lectura?.aumentoSostenidoPm25 || nodo?.lectura?.tendenciaPm25 === 'AUMENTANDO_SOSTENIDO';
    const aumentoSostenidoPm10 = nodo?.lectura?.aumentoSostenidoPm10 || nodo?.lectura?.tendenciaPm10 === 'AUMENTANDO_SOSTENIDO';

    // PM2.5 - Límite de seguridad alcanzado -> ALARMA
    if (pm25 != null && pm25 >= limParticulado.PM25.limiteSeguridad) {
      alertas.push({
        tipo: 'POLVO_PM25',
        nivel: 'ALARMA',
        gas: 'PM2.5',
        valor: pm25,
        limite: limParticulado.PM25.limiteSeguridad,
        unidad: limParticulado.PM25.unidad,
        articulo: limParticulado.articulo,
        mensaje: `Límite de polvo respirable PM2.5 superado (${pm25} µg/m³ >= ${limParticulado.PM25.limiteSeguridad} µg/m³).`,
        accion: 'Activar sistemas de supresión de polvo, verificar uso obligatorio de protección respiratoria e intensificar caudal de ventilación.'
      });
    } else if (pm25 != null && (pm25 >= limParticulado.PM25.umbralPrecaucion || aumentoSostenidoPm25)) {
      alertas.push({
        tipo: 'POLVO_PM25',
        nivel: 'PRECAUCION',
        gas: 'PM2.5',
        valor: pm25,
        limite: limParticulado.PM25.limiteSeguridad,
        unidad: limParticulado.PM25.unidad,
        articulo: limParticulado.articulo,
        mensaje: aumentoSostenidoPm25
          ? `Alerta preventiva: Aumento sostenido de polvo PM2.5 (${pm25} µg/m³). Tendencia creciente continua.`
          : `Polvo respirable PM2.5 en rango de precaución (${pm25} µg/m³ >= ${limParticulado.PM25.umbralPrecaucion} µg/m³).`,
        accion: 'Encender aspersores de agua en el frente y vigilar cortina de aire.'
      });
    }

    // PM10 - Límite de seguridad alcanzado -> ALARMA
    if (pm10 != null && pm10 >= limParticulado.PM10.limiteSeguridad) {
      alertas.push({
        tipo: 'POLVO_PM10',
        nivel: 'ALARMA',
        gas: 'PM10',
        valor: pm10,
        limite: limParticulado.PM10.limiteSeguridad,
        unidad: limParticulado.PM10.unidad,
        articulo: limParticulado.articulo,
        mensaje: `Límite de polvo inhalable PM10 superado (${pm10} µg/m³ >= ${limParticulado.PM10.limiteSeguridad} µg/m³).`,
        accion: 'Suspender temporalmente operaciones de trituración/cargue y verificar captadores de polvo.'
      });
    } else if (pm10 != null && (pm10 >= limParticulado.PM10.umbralPrecaucion || aumentoSostenidoPm10)) {
      alertas.push({
        tipo: 'POLVO_PM10',
        nivel: 'PRECAUCION',
        gas: 'PM10',
        valor: pm10,
        limite: limParticulado.PM10.limiteSeguridad,
        unidad: limParticulado.PM10.unidad,
        articulo: limParticulado.articulo,
        mensaje: aumentoSostenidoPm10
          ? `Alerta preventiva: Aumento sostenido de polvo PM10 (${pm10} µg/m³). Tendencia creciente continua.`
          : `Polvo inhalable PM10 en rango de precaución (${pm10} µg/m³ >= ${limParticulado.PM10.umbralPrecaucion} µg/m³).`,
        accion: 'Verificar humectación de vías de acarreo y funcionamiento de ventilación secundaria.'
      });
    }
  }

  // Determinar severidad máxima
  let nivelMaximo = 'NORMAL';
  let alertaPrincipal = null;

  for (const a of alertas) {
    const pesoAlerta = PRIORIDAD_NIVEL[a.nivel] || 1;
    const pesoMax = PRIORIDAD_NIVEL[nivelMaximo] || 1;
    if (pesoAlerta > pesoMax) {
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
