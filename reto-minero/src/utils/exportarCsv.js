/**
 * Utilidad para exportar registros de telemetría a formato CSV.
 * Incluye UTF-8 BOM (\uFEFF) para compatibilidad nativa con Microsoft Excel en Windows.
 */

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
    'Temperatura (°C)',
    'Humedad (%)',
    'Bateria (%)',
    'RSSI LoRa (dBm)',
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

    return [
      escapar(fecha),
      escapar(item.nombreNodo),
      escapar(item.nivelMina),
      escapar(item.ubicacion),
      escapar(item.tipoSitio),
      escapar(item.ch4?.toFixed(2)),
      escapar(item.limiteCh4?.toFixed(1)),
      escapar(item.temperatura?.toFixed(1)),
      escapar(item.humedad),
      escapar(item.bateria),
      escapar(item.rssi),
      escapar(item.alertaNivel),
    ].join(';'); // Separador punto y coma estándar para Excel en español
  });

  const contenido = '\uFEFF' + [encabezados.join(';'), ...filas].join('\r\n');
  const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', nombreArchivo);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
}

