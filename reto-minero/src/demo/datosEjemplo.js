/**
 * Datos fijos de 6 nodos sensores con el modelo definido en la skill:
 * { id, nombre, ubicacion, tipoSitio, nivel, mapCoords, lectura: { ch4, temperatura, humedad, bateria, rssi, fecha }, alarmaLocalActiva }
 * Las fechas son relativas a "ahora" para que siempre se vean recientes.
 */

export function obtenerNodosEjemplo(ahora = new Date()) {
  const t = ahora instanceof Date ? ahora.getTime() : new Date(ahora).getTime();

  return [
    // 1. Frente de explotación 1 (N-2): CH4 0.7% -> PRECAUCION (límite 1.0%, 0.7 >= 0.5)
    {
      id: 'frente-explotacion-1',
      nombre: 'Frente de Explotación 1',
      ubicacion: 'Sector Norte · Tajo mecanizado',
      tipoSitio: 'frente_explotacion',
      nivel: 'N-2',
      mapCoords: {
        right: '1.5rem',
        top: '7rem'
      },
      lectura: {
        ch4: 0.7,
        temperatura: 26.5,
        humedad: 78,
        bateria: 85,
        rssi: -68,
        fecha: new Date(t - 1 * 60 * 1000).toISOString() // hace 1 min
      },
      alarmaLocalActiva: false
    },

    // 2. Retorno de tajo (N-2): CH4 1.2% -> PRECAUCION (su límite es 1.5%, 1.2 >= 0.75 y < 1.5)
    {
      id: 'retorno-tajo',
      nombre: 'Retorno de Tajo',
      ubicacion: 'Sector Sur · Galería de retorno de tajo',
      tipoSitio: 'retorno_tajos',
      nivel: 'N-2',
      mapCoords: {
        right: '6rem',
        top: '12rem'
      },
      lectura: {
        ch4: 1.2,
        temperatura: 27.2,
        humedad: 82,
        bateria: 92,
        rssi: -72,
        fecha: new Date(t - 2 * 60 * 1000).toISOString() // hace 2 min
      },
      alarmaLocalActiva: false
    },

    // 3. Retorno principal (N-2): CH4 1.1% -> ALARMA, alarma local activa (límite 1.0%, 1.1 >= 1.0)
    {
      id: 'retorno-principal',
      nombre: 'Retorno Principal',
      ubicacion: 'Galería Retorno · Sector Sur · Cota -420m',
      tipoSitio: 'retorno_principal',
      nivel: 'N-2',
      mapCoords: {
        right: '3rem',
        bottom: '5rem'
      },
      lectura: {
        ch4: 1.1,
        temperatura: 28.0,
        humedad: 84,
        bateria: 79,
        rssi: -65,
        fecha: new Date(t - 1 * 60 * 1000).toISOString() // hace 1 min
      },
      alarmaLocalActiva: true
    },

    // 4. Frente de avance (N-3): sin transmitir hace 12 min -> SIN_SEÑAL (límite: 5 min)
    {
      id: 'frente-avance',
      nombre: 'Frente de Avance',
      ubicacion: 'Nivel 3 · Cota -540m · Galería Sur',
      tipoSitio: 'frente_avance',
      nivel: 'N-3',
      mapCoords: {
        left: '2.5rem',
        bottom: '4rem'
      },
      lectura: {
        ch4: 0.2,
        temperatura: 24.1,
        humedad: 70,
        bateria: 64,
        rssi: -88,
        fecha: new Date(t - 12 * 60 * 1000).toISOString() // hace 12 min
      },
      alarmaLocalActiva: false
    },

    // 5. Retorno de preparación (N-1): CH4 0.3% -> NORMAL (límite 1.5%, 0.3 < 0.75)
    {
      id: 'retorno-preparacion',
      nombre: 'Retorno de Preparación',
      ubicacion: 'Nivel 1 · Cota -310m · Galería Este',
      tipoSitio: 'retorno_preparacion',
      nivel: 'N-1',
      mapCoords: {
        left: '33%',
        top: '3.5rem'
      },
      lectura: {
        ch4: 0.3,
        temperatura: 23.5,
        humedad: 68,
        bateria: 95,
        rssi: -62,
        fecha: new Date(t - 3 * 60 * 1000).toISOString() // hace 3 min
      },
      alarmaLocalActiva: false
    },

    // 6. Frente de explotación 2 (N-1): CH4 0.2% -> NORMAL (límite 1.0%, 0.2 < 0.5)
    {
      id: 'frente-explotacion-2',
      nombre: 'Frente de Explotación 2',
      ubicacion: 'Nivel 1 · Cota -310m · Frente Norte',
      tipoSitio: 'frente_explotacion',
      nivel: 'N-1',
      mapCoords: {
        left: '36%',
        bottom: '3.5rem'
      },
      lectura: {
        ch4: 0.2,
        temperatura: 22.8,
        humedad: 65,
        bateria: 90,
        rssi: -60,
        fecha: new Date(t - 2 * 60 * 1000).toISOString() // hace 2 min
      },
      alarmaLocalActiva: false
    }
  ];
}

export const NODOS_EJEMPLO = obtenerNodosEjemplo();
