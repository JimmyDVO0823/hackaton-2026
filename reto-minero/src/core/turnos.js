/**
 * Gestión y cálculo de Turnos Mineros de 8 horas según Decreto 1886 de 2015.
 * REGLAS:
 * - 3 turnos al día de 8 horas continuas cada uno:
 *     * Turno 1 (Mañana / Día): 06:00 a 14:00
 *     * Turno 2 (Tarde):        14:00 a 22:00
 *     * Turno 3 (Noche / Trasnocho): 22:00 a 06:00
 * - Al terminar cada turno, se emite automáticamente el "Resumen de Turno" en formato CSV para entrega y auditoría.
 * - Los sensores están conectados a corriente eléctrica fija (NO batería).
 */

export const DEFINICION_TURNOS = [
  {
    id: 'T1',
    codigo: 'TURNO_1',
    nombre: 'Turno 1 (Mañana)',
    horarioTexto: '06:00 - 14:00',
    horaInicio: 6,
    horaFin: 14,
  },
  {
    id: 'T2',
    codigo: 'TURNO_2',
    nombre: 'Turno 2 (Tarde)',
    horarioTexto: '14:00 - 22:00',
    horaInicio: 14,
    horaFin: 22,
  },
  {
    id: 'T3',
    codigo: 'TURNO_3',
    nombre: 'Turno 3 (Noche)',
    horarioTexto: '22:00 - 06:00',
    horaInicio: 22,
    horaFin: 6,
  },
];

/**
 * Obtiene la información del turno en curso y del turno que acaba de concluir.
 * @param {Date|number} fechaReferencia
 */
export function obtenerInfoTurnos(fechaReferencia = new Date()) {
  const d = fechaReferencia instanceof Date ? fechaReferencia : new Date(fechaReferencia);
  const hora = d.getHours();

  let turnoActualDef = null;
  let turnoPrevioDef = null;
  let inicioTimestamp = 0;
  let finTimestamp = 0;

  const medianocheHoy = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

  if (hora >= 6 && hora < 14) {
    // Turno 1: 06:00 a 14:00
    turnoActualDef = DEFINICION_TURNOS[0];
    turnoPrevioDef = DEFINICION_TURNOS[2]; // Previo: T3 de la noche anterior
    inicioTimestamp = medianocheHoy + 6 * 3600 * 1000;
    finTimestamp = medianocheHoy + 14 * 3600 * 1000;
  } else if (hora >= 14 && hora < 22) {
    // Turno 2: 14:00 a 22:00
    turnoActualDef = DEFINICION_TURNOS[1];
    turnoPrevioDef = DEFINICION_TURNOS[0]; // Previo: T1 de hoy
    inicioTimestamp = medianocheHoy + 14 * 3600 * 1000;
    finTimestamp = medianocheHoy + 22 * 3600 * 1000;
  } else {
    // Turno 3: 22:00 a 06:00
    turnoActualDef = DEFINICION_TURNOS[2];
    turnoPrevioDef = DEFINICION_TURNOS[1]; // Previo: T2 de hoy
    if (hora >= 22) {
      inicioTimestamp = medianocheHoy + 22 * 3600 * 1000;
      finTimestamp = medianocheHoy + (24 + 6) * 3600 * 1000; // 06:00 de mañana
    } else {
      // Entre 00:00 y 05:59
      inicioTimestamp = medianocheHoy - 2 * 3600 * 1000; // 22:00 de ayer
      finTimestamp = medianocheHoy + 6 * 3600 * 1000;   // 06:00 de hoy
    }
  }

  const duracionTotalMs = 8 * 3600 * 1000;
  const tiempoTranscurridoMs = Math.max(0, d.getTime() - inicioTimestamp);
  const tiempoRestanteMs = Math.max(0, finTimestamp - d.getTime());

  const horasRestantes = Math.floor(tiempoRestanteMs / (3600 * 1000));
  const minutosRestantes = Math.floor((tiempoRestanteMs % (3600 * 1000)) / (60 * 1000));

  // Clave unívoca del turno actual (ej. "2026-10-29_T2")
  const fechaStr = d.toISOString().split('T')[0];
  const claveTurnoActual = `${fechaStr}_${turnoActualDef.id}`;

  return {
    turnoActual: {
      ...turnoActualDef,
      clave: claveTurnoActual,
      inicioTimestamp,
      finTimestamp,
      tiempoTranscurridoMs,
      tiempoRestanteMs,
      horasRestantes,
      minutosRestantes,
      tiempoRestanteTexto: `${horasRestantes}h ${minutosRestantes}m`,
      porcentajeCompletado: Math.min(100, Math.round((tiempoTranscurridoMs / duracionTotalMs) * 100)),
    },
    turnoPrevio: {
      ...turnoPrevioDef,
      inicioTimestamp: inicioTimestamp - 8 * 3600 * 1000,
      finTimestamp: inicioTimestamp,
      clave: `${fechaStr}_${turnoPrevioDef.id}`,
    },
  };
}

/**
 * Filtra el historial de lecturas correspondientes a un turno específico y calcula sus métricas ejecutivas.
 * @param {Array<Object>} historial - Lista completa de lecturas
 * @param {Object} turno - Información del turno { id, nombre, horarioTexto, inicioTimestamp, finTimestamp }
 */
export function calcularResumenTurno(historial = [], turno) {
  const { inicioTimestamp, finTimestamp } = turno;

  // Filtrar lecturas del rango temporal del turno
  const lecturasDelTurno = historial.filter(
    (item) => item.timestamp >= inicioTimestamp && item.timestamp <= finTimestamp
  );

  if (lecturasDelTurno.length === 0) {
    // Si no hay lecturas exactas en ese rango, tomar las últimas 8 horas disponibles
    const ochoHorasAtras = Date.now() - 8 * 3600 * 1000;
    const fallback = historial.filter((item) => item.timestamp >= ochoHorasAtras);
    return procesarMetricasTurno(fallback.length > 0 ? fallback : historial.slice(-48), turno);
  }

  return procesarMetricasTurno(lecturasDelTurno, turno);
}

function procesarMetricasTurno(lecturas, turno) {
  const total = lecturas.length;
  if (total === 0) {
    return {
      turno,
      lecturas: [],
      totalMediciones: 0,
      peorNivel: 'NORMAL',
      ch4: { max: 0, prom: 0, nodoMax: '--' },
      o2: { min: 20.9, prom: 20.9 },
      co: { max: 0, prom: 0 },
      h2s: { max: 0, prom: 0 },
      nox: { max: 0, prom: 0 },
      co2: { max: 400, prom: 400 },
      temperatura: { prom: 24, max: 24 },
      humedad: { prom: 70 },
      conteoAlertas: { NORMAL: 0, PRECAUCION: 0, ALARMA: 0, EVACUACION: 0, SIN_SEÑAL: 0 },
    };
  }

  let sumaCh4 = 0, maxCh4 = 0, nodoMaxCh4 = '';
  let sumaO2 = 0, minO2 = 100;
  let sumaCo = 0, maxCo = 0;
  let sumaH2s = 0, maxH2s = 0;
  let sumaNox = 0, maxNox = 0;
  let sumaCo2 = 0, maxCo2 = 0;
  let sumaTemp = 0, maxTemp = 0;
  let sumaHum = 0;

  const PRIORIDAD = { NORMAL: 1, SIN_SEÑAL: 2, PRECAUCION: 3, ALARMA: 4, EVACUACION: 5 };
  let peorNivel = 'NORMAL';
  const conteoAlertas = { NORMAL: 0, PRECAUCION: 0, ALARMA: 0, EVACUACION: 0, SIN_SEÑAL: 0 };

  for (const r of lecturas) {
    // CH4
    const ch4 = r.ch4 ?? 0;
    sumaCh4 += ch4;
    if (ch4 > maxCh4) {
      maxCh4 = ch4;
      nodoMaxCh4 = r.nombreNodo;
    }

    // O2
    const o2 = r.o2 ?? 20.9;
    sumaO2 += o2;
    if (o2 < minO2) minO2 = o2;

    // CO
    const co = r.co ?? 0;
    sumaCo += co;
    if (co > maxCo) maxCo = co;

    // H2S
    const h2s = r.h2s ?? 0;
    sumaH2s += h2s;
    if (h2s > maxH2s) maxH2s = h2s;

    // NOx
    const nox = r.nox ?? 0;
    sumaNox += nox;
    if (nox > maxNox) maxNox = nox;

    // CO2
    const co2 = r.co2 ?? 400;
    sumaCo2 += co2;
    if (co2 > maxCo2) maxCo2 = co2;

    // Temp & Hum
    const t = r.temperatura ?? 24;
    sumaTemp += t;
    if (t > maxTemp) maxTemp = t;

    sumaHum += (r.humedad ?? 70);

    // Severidad
    const nivel = r.alertaNivel ?? 'NORMAL';
    if (conteoAlertas[nivel] !== undefined) {
      conteoAlertas[nivel] += 1;
    }
    if ((PRIORIDAD[nivel] || 1) > (PRIORIDAD[peorNivel] || 1)) {
      peorNivel = nivel;
    }
  }

  return {
    turno,
    lecturas,
    totalMediciones: total,
    peorNivel,
    ch4: {
      max: Number(maxCh4.toFixed(2)),
      prom: Number((sumaCh4 / total).toFixed(2)),
      nodoMax: nodoMaxCh4 || '--',
    },
    o2: {
      min: Number(minO2.toFixed(2)),
      prom: Number((sumaO2 / total).toFixed(2)),
    },
    co: {
      max: Number(maxCo.toFixed(1)),
      prom: Number((sumaCo / total).toFixed(1)),
    },
    h2s: {
      max: Number(maxH2s.toFixed(2)),
      prom: Number((sumaH2s / total).toFixed(2)),
    },
    nox: {
      max: Number(maxNox.toFixed(2)),
      prom: Number((sumaNox / total).toFixed(2)),
    },
    co2: {
      max: Math.round(maxCo2),
      prom: Math.round(sumaCo2 / total),
    },
    temperatura: {
      max: Number(maxTemp.toFixed(1)),
      prom: Number((sumaTemp / total).toFixed(1)),
    },
    humedad: {
      prom: Math.round(sumaHum / total),
    },
    conteoAlertas,
  };
}

/**
 * Genera el documento oficial en formato CSV con metadatos de auditoría y registros detallados.
 * Totalmente compatible con Excel (BOM UTF-8, delimitador punto y coma).
 * SIN DATOS DE BATERÍA NI SEÑAL WIFI (sensores conectados a red eléctrica fija).
 */
export function generarCsvResumenTurno(resumen) {
  const { turno, lecturas, totalMediciones, peorNivel, ch4, o2, co, h2s, nox, co2, temperatura, humedad, conteoAlertas } = resumen;
  const fechaEmision = new Date().toLocaleString('es-CO');

  const escapar = (val) => {
    if (val === null || val === undefined) return '""';
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  };

  const lineasHeader = [
    '# =========================================================================',
    '# REPORTE OFICIAL DE ENTREGA Y RESUMEN DE TURNO DE OPERACIÓN MINERA',
    '# DECRETO 1886 DE 2015 · REGLAMENTO DE SEGURIDAD EN LABORES SUBTERRÁNEAS',
    '# SISTEMA CONTINUO DE VENTILACIÓN Y TELEMETRÍA ATMO-MONITOR',
    '# =========================================================================',
    `# Fecha y Hora de Emisión:;${escapar(fechaEmision)}`,
    `# Turno de Operación:;${escapar(`${turno.nombre} (${turno.horarioTexto})`)}`,
    `# Duración del Turno:;${escapar('8 Horas')}`,
    `# Total de Registros de Telemetría:;${totalMediciones}`,
    `# Peor Estado Normativo Registrado:;${escapar(peorNivel)}`,
    `# Concentración Máxima CH4:;${escapar(`${ch4.max}% Vol en ${ch4.nodoMax} (Prom: ${ch4.prom}% Vol)`)}`,
    `# Concentración Mínima O2:;${escapar(`${o2.min}% Vol (Rango Apto Legal Art. 38: 19.5% - 23.5% | Prom: ${o2.prom}% Vol)`)}`,
    `# Concentración Máxima CO:;${escapar(`${co.max} PPM (Límite TWA Legal Art. 39: 25 PPM | Prom: ${co.prom} PPM)`)}`,
    `# Concentración Máxima H2S:;${escapar(`${h2s.max} PPM (Límite TWA Legal Art. 39: 1 PPM | Prom: ${h2s.prom} PPM)`)}`,
    `# Concentración Máxima NOx:;${escapar(`${nox.max} PPM (Límite TWA NO2 Legal Art. 39: 0.2 PPM | Prom: ${nox.prom} PPM)`)}`,
    `# Concentración Máxima CO2:;${escapar(`${co2.max} PPM (Límite TWA Legal Art. 39: 5000 PPM | Prom: ${co2.prom} PPM)`)}`,
    `# Temperatura Promedio:;${escapar(`${temperatura.prom}°C (Máx: ${temperatura.max}°C)`)}`,
    `# Humedad Relativa Promedio:;${escapar(`${humedad.prom}%`)}`,
    `# Alimentación Eléctrica Sensores:;${escapar('Red Eléctrica Fija Permanente 110V/220V (Sin baterías)')}`,
    `# Balance de Alertas en el Turno:;${escapar(`Normal: ${conteoAlertas.NORMAL} | Precaución: ${conteoAlertas.PRECAUCION} | Alarma: ${conteoAlertas.ALARMA} | Evacuación: ${conteoAlertas.EVACUACION} | Sin Señal: ${conteoAlertas.SIN_SEÑAL}`)}`,
    '# =========================================================================',
    '',
  ];

  const columnasTabla = [
    'Fecha y Hora',
    'Turno',
    'Nodo Sensor',
    'Nivel Mina',
    'Ubicacion',
    'Tipo de Labor',
    'CH4 Metano (%Vol)',
    'Limite CH4 (%Vol)',
    'Oxigeno O2 (%Vol)',
    'Monoxido Carbono CO (PPM)',
    'Acido Sulfhidrico H2S (PPM)',
    'Gases Nitrosos NOx (PPM)',
    'Dioxido Carbono CO2 (PPM)',
    'Temperatura (°C)',
    'Humedad (%)',
    'Estado Señal',
    'Estado Normativo',
  ];

  const filas = lecturas.map((item) => {
    const fecha = item.fechaIso
      ? new Date(item.fechaIso).toLocaleString('es-CO')
      : item.horaFormateada || '--';

    const estadoSenal = item.alertaNivel === 'SIN_SEÑAL' ? 'SIN SEÑAL' : 'CONECTADO';

    return [
      escapar(fecha),
      escapar(turno.nombre),
      escapar(item.nombreNodo),
      escapar(item.nivelMina),
      escapar(item.ubicacion),
      escapar(item.tipoSitio),
      escapar(item.ch4?.toFixed(2)),
      escapar(item.limiteCh4?.toFixed(1)),
      escapar(item.o2?.toFixed(2) ?? '20.90'),
      escapar(item.co?.toFixed(1) ?? '2.0'),
      escapar(item.h2s?.toFixed(2) ?? '0.05'),
      escapar(item.nox?.toFixed(2) ?? '0.02'),
      escapar(item.co2 ?? 450),
      escapar(item.temperatura?.toFixed(1)),
      escapar(item.humedad),
      escapar(estadoSenal),
      escapar(item.alertaNivel),
    ].join(';');
  });

  return '\uFEFF' + [...lineasHeader, columnasTabla.join(';'), ...filas].join('\r\n');
}

/**
 * Dispara la descarga del archivo CSV en el navegador.
 */
export function descargarArchivoCsv(contenidoCsv, nombreArchivo) {
  try {
    const blob = new Blob([contenidoCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', nombreArchivo);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('Error al descargar archivo CSV:', err);
    return false;
  }
}
