/**
 * Utilidades para formateo de fechas, horas y unidades de telemetría minera
 */

export function formatearHora(fechaIso) {
  if (!fechaIso) return '';
  const d = new Date(fechaIso);
  return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

export function formatearFechaCompleta(fechaIso) {
  if (!fechaIso) return '';
  const d = new Date(fechaIso);
  return d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatearValorGas(valor, unidad = '%Vol') {
  return `${valor} ${unidad}`;
}

