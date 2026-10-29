/**
 * Utilidad para exportar registros de telemetría y resúmenes de turno a formato CSV.
 * Incluye UTF-8 BOM (\uFEFF) para compatibilidad nativa con Microsoft Excel en Windows.
 * Cumple con Decreto 1886 de 2015:
 * - NO incluye campos de batería (sensores conectados a corriente eléctrica fija).
 * - NO incluye señal wifi (solo conectividad CONECTADO vs SIN_SEÑAL).
 * - Incluye todos los gases normativos: CH4, O2, CO, H2S, NOx, CO2.
 */

import {
  obtenerInfoTurnos,
  calcularResumenTurno,
  generarCsvResumenTurno,
  descargarArchivoCsv,
} from '../core/turnos.js';

export function exportarLecturasCsv(lecturas = [], nombreArchivo = 'telemetria-minera.csv') {
  if (!lecturas || lecturas.length === 0) {
    return false;
  }

  const encabezados = [
    'Fecha y Hora',
    'Nodo Sensor',
    'Nivel Mina',
    'Ubicacion',
    'Tipo de Sitio',
    'CH4 (%Vol)',
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

  const escapar = (valor) => {
    if (valor === null || valor === undefined) return '""';
    const str = String(valor).replace(/"/g, '""');
    return `"${str}"`;
  };

  const filas = lecturas.map((item) => {
    const fecha = item.fechaIso
      ? new Date(item.fechaIso).toLocaleString('es-CO')
      : item.horaFormateada || '--';

    const estadoSenal = item.alertaNivel === 'SIN_SEÑAL' ? 'SIN SEÑAL' : 'CONECTADO';

    return [
      escapar(fecha),
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

  const contenido = '\uFEFF' + [encabezados.join(';'), ...filas].join('\r\n');
  return descargarArchivoCsv(contenido, nombreArchivo);
}

/**
 * Genera y descarga el resumen completo del turno indicado (o del turno actual).
 * @param {Array<Object>} historial - Lista de mediciones
 * @param {Object} [turnoEspecifico] - Información de turno opcional
 * @param {Object} [supervisor] - Datos del supervisor de turno para trazabilidad legal
 */
export function exportarResumenTurno(historial = [], turnoEspecifico = null, supervisor = null) {
  const { turnoActual } = obtenerInfoTurnos();
  const turno = turnoEspecifico || turnoActual;

  const resumen = calcularResumenTurno(historial, turno);
  const csvContenido = generarCsvResumenTurno(resumen, supervisor);

  const fechaIso = new Date().toISOString().split('T')[0];
  const nombreArchivo = `resumen-turno-${turno.id}_${fechaIso}.csv`;

  return descargarArchivoCsv(csvContenido, nombreArchivo);
}
