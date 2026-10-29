/**
 * Datos de ejemplo iniciales para el simulador y modo offline
 */

export const SECTORES_EJEMPLO = [
  {
    id: 'retorno-principal',
    name: 'Retorno Principal',
    description: 'GALERÍA RETORNO · SECTOR SUR · COTA -420M',
    status: 'ALARMA',
    statusBadge: 'ALARMA · SUSPENDER',
    warningText: 'Límite norma: 25 ppm superado',
    telemetry: {
      ch4: { label: 'CH₄ METANO', value: '0.3', unit: '%Vol', statusText: 'Seguro (<1.0%)', isAlert: false },
      o2: { label: 'O₂ OXÍGENO', value: '19.8', unit: '%Vol', statusText: 'Apto (>19.5%)', isAlert: false },
      co: { label: 'CO MONÓXIDO', value: '30', unit: 'PPM', statusText: 'Crítico (>25)', isAlert: true }
    },
    lastMeasurement: {
      timeAgo: 'Hace 8 min (14:32)',
      operator: 'Op. J. Gómez'
    },
    mapCoords: {
      right: '3rem',
      bottom: '5rem'
    }
  },
  {
    id: 'frente-explotacion-1',
    name: 'Frente de Explotación 1',
    description: 'TAJO PRINCIPAL · SECTOR NORTE · COTA -425M',
    status: 'PRECAUCION',
    statusBadge: 'PRECAUCIÓN',
    warningText: 'Cota -425m · Tajo mecanizado',
    telemetry: {
      ch4: { label: 'CH₄ METANO', value: '0.8', unit: '%Vol', statusText: 'Elevado (>0.5%)', isAlert: true },
      o2: { label: 'O₂ OXÍGENO', value: '20.4', unit: '%Vol', statusText: 'Óptimo', isAlert: false },
      co: { label: 'CO MONÓXIDO', value: '12', unit: 'PPM', statusText: 'Bajo control', isAlert: false }
    },
    lastMeasurement: {
      timeAgo: 'Hace 18 min (14:22)',
      operator: 'Op. M. Duarte'
    },
    mapCoords: {
      right: '1.5rem',
      top: '7rem'
    }
  },
  {
    id: 'tambor-3',
    name: 'Tambor 3',
    description: 'PILAR SUR · ZONA DE RECUPERACIÓN',
    status: 'PENDIENTE',
    statusBadge: 'FUERA DE TIEMPO',
    pendingAlert: {
      elapsed: 'Sin medir hace 2 h 15 min',
      limitText: 'Límite legal: Máximo 2 horas continuas',
      lastRound: '12:17 (T1)'
    },
    mapCoords: {
      left: '2.5rem',
      bottom: '4rem'
    }
  },
  {
    id: 'galeria-transporte',
    name: 'Galería de Transporte',
    description: 'VÍA FÉRREA NIVEL 2 · SECTOR CENTRAL',
    status: 'NORMAL',
    statusBadge: 'NORMAL',
    telemetry: {
      ch4: { label: 'CH₄', value: '0.1', unit: '%', statusText: 'Estable', isAlert: false },
      o2: { label: 'O₂', value: '20.9', unit: '%', statusText: 'Estable', isAlert: false },
      co: { label: 'CO', value: '4', unit: 'PPM', statusText: 'Estable', isAlert: false }
    },
    lastMeasurement: {
      timeAgo: 'Hace 35 min (14:05)',
      operator: 'Op. J. Gómez'
    },
    statusNote: 'Parámetros estables',
    mapCoords: {
      left: '36%',
      bottom: '3.5rem'
    }
  },
  {
    id: 'inyeccion-aire',
    name: 'Inyección de Aire (Nivel 2)',
    description: 'VENTILADOR PRINCIPAL SUR',
    status: 'NORMAL',
    statusBadge: 'NORMAL',
    telemetry: {
      ch4: { label: 'CH₄', value: '0.0', unit: '%', statusText: 'Estable', isAlert: false },
      o2: { label: 'O₂', value: '21.0', unit: '%', statusText: 'Estable', isAlert: false },
      co: { label: 'CO', value: '0', unit: 'PPM', statusText: 'Estable', isAlert: false }
    },
    lastMeasurement: {
      timeAgo: 'Hace 42 min',
      operator: 'Automático'
    },
    statusNote: 'Caudal: 1420 m³/min',
    mapCoords: {
      left: '33%',
      top: '3.5rem'
    }
  },
  {
    id: 'tunel-acceso',
    name: 'Túnel Acceso Principal',
    description: 'COTA -400M · ACCESO PRINCIPAL',
    status: 'NORMAL',
    statusBadge: 'NORMAL',
    telemetry: {
      ch4: { label: 'CH₄', value: '0.0', unit: '%', statusText: 'Estable', isAlert: false },
      o2: { label: 'O₂', value: '20.9', unit: '%', statusText: 'Estable', isAlert: false },
      co: { label: 'CO', value: '2', unit: 'PPM', statusText: 'Estable', isAlert: false }
    },
    lastMeasurement: {
      timeAgo: 'Hace 50 min',
      operator: 'Op. R. Morales'
    },
    statusNote: 'Cota -400m',
    mapCoords: {
      left: '1.5rem',
      top: '4rem'
    }
  }
];

