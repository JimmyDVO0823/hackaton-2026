/**
 * Datos fijos de 6 nodos sensores según Decreto 1886 de 2015.
 * REGLA: Los sensores están permanentemente conectados a la red eléctrica (NO usan batería).
 * La conectividad se evalúa por presencia de señal (CONECTADO vs SIN_SEÑAL).
 * Cada nodo incluye mediciones multigas y material particulado:
 * CH4, O2, CO, H2S, NOx, CO2, PM2.5, PM10, Temperatura y Humedad.
 */

export function obtenerNodosEjemplo(ahora = new Date()) {
  const t = ahora instanceof Date ? ahora.getTime() : new Date(ahora).getTime();

  return [
    // 1. Frente de explotación 1 (N-2): CH4 0.7% -> PRECAUCION. PM2.5 en aumento sostenido (42 µg/m³ >= 35)
    {
      id: 'frente-explotacion-1',
      nombre: 'Frente de Explotación 1',
      ubicacion: 'Sector Norte · Tajo mecanizado',
      tipoSitio: 'frente_explotacion',
      nivel: 'N-2',
      mapCoords: {
        right: '1.5rem',
        top: '7rem',
      },
      lectura: {
        ch4: 0.7,
        o2: 20.4,
        co: 6,
        h2s: 0.15,
        nox: 0.04,
        co2: 680,
        pm25: 42.0, // Alerta preventiva: aumento sostenido (umbral 35 superado)
        pm10: 120.0,
        tendenciaPm25: 'AUMENTANDO',
        tendenciaPm10: 'AUMENTANDO',
        aumentoSostenidoPm25: true,
        aumentoSostenidoPm10: true,
        temperatura: 26.5,
        humedad: 78,
        fecha: new Date(t - 1 * 60 * 1000).toISOString(), // hace 1 min
      },
      alarmaLocalActiva: false,
    },

    // 2. Retorno de tajo (N-2): CH4 1.2% -> PRECAUCION. Polvo estable en rango normal
    {
      id: 'retorno-tajo',
      nombre: 'Retorno de Tajo',
      ubicacion: 'Sector Sur · Galería de retorno de tajo',
      tipoSitio: 'retorno_tajos',
      nivel: 'N-2',
      mapCoords: {
        right: '6rem',
        top: '12rem',
      },
      lectura: {
        ch4: 1.2,
        o2: 20.1,
        co: 9,
        h2s: 0.25,
        nox: 0.06,
        co2: 950,
        pm25: 32.0,
        pm10: 88.0,
        tendenciaPm25: 'ESTABLE',
        tendenciaPm10: 'ESTABLE',
        aumentoSostenidoPm25: false,
        aumentoSostenidoPm10: false,
        temperatura: 27.2,
        humedad: 82,
        fecha: new Date(t - 2 * 60 * 1000).toISOString(), // hace 2 min
      },
      alarmaLocalActiva: false,
    },

    // 3. Retorno principal (N-2): CH4 1.1% -> ALARMA. PM2.5 54.0 y PM10 165.0 -> ALARMA POR POLVO Y METANO
    {
      id: 'retorno-principal',
      nombre: 'Retorno Principal',
      ubicacion: 'Galería Retorno · Sector Sur · Cota -420m',
      tipoSitio: 'retorno_principal',
      nivel: 'N-2',
      mapCoords: {
        right: '3rem',
        bottom: '5rem',
      },
      lectura: {
        ch4: 1.1,
        o2: 19.9,
        co: 14,
        h2s: 0.35,
        nox: 0.08,
        co2: 1250,
        pm25: 54.0, // Alarma: supera límite de seguridad 50 µg/m³
        pm10: 165.0, // Alarma: supera límite de seguridad 150 µg/m³
        tendenciaPm25: 'AUMENTANDO',
        tendenciaPm10: 'AUMENTANDO',
        aumentoSostenidoPm25: true,
        aumentoSostenidoPm10: true,
        temperatura: 28.0,
        humedad: 84,
        fecha: new Date(t - 1 * 60 * 1000).toISOString(), // hace 1 min
      },
      alarmaLocalActiva: true,
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
        bottom: '4rem',
      },
      lectura: {
        ch4: 0.2,
        o2: 20.9,
        co: 2,
        h2s: 0.05,
        nox: 0.02,
        co2: 450,
        pm25: 18.0,
        pm10: 45.0,
        tendenciaPm25: 'ESTABLE',
        tendenciaPm10: 'ESTABLE',
        aumentoSostenidoPm25: false,
        aumentoSostenidoPm10: false,
        temperatura: 24.1,
        humedad: 70,
        fecha: new Date(t - 12 * 60 * 1000).toISOString(), // hace 12 min (sin señal)
      },
      alarmaLocalActiva: false,
    },

    // 5. Retorno de preparación (N-1): CH4 0.3% -> NORMAL. Polvo disminuyendo tras aspersión
    {
      id: 'retorno-preparacion',
      nombre: 'Retorno de Preparación',
      ubicacion: 'Nivel 1 · Cota -310m · Galería Este',
      tipoSitio: 'retorno_preparacion',
      nivel: 'N-1',
      mapCoords: {
        left: '33%',
        top: '3.5rem',
      },
      lectura: {
        ch4: 0.3,
        o2: 20.8,
        co: 3,
        h2s: 0.08,
        nox: 0.03,
        co2: 520,
        pm25: 22.0,
        pm10: 60.0,
        tendenciaPm25: 'DISMINUYENDO',
        tendenciaPm10: 'DISMINUYENDO',
        aumentoSostenidoPm25: false,
        aumentoSostenidoPm10: false,
        temperatura: 23.5,
        humedad: 68,
        fecha: new Date(t - 3 * 60 * 1000).toISOString(), // hace 3 min
      },
      alarmaLocalActiva: false,
    },

    // 6. Frente de explotación 2 (N-1): CH4 0.2% -> NORMAL. Condiciones óptimas
    {
      id: 'frente-explotacion-2',
      nombre: 'Frente de Explotación 2',
      ubicacion: 'Nivel 1 · Cota -310m · Frente Norte',
      tipoSitio: 'frente_explotacion',
      nivel: 'N-1',
      mapCoords: {
        left: '36%',
        bottom: '3.5rem',
      },
      lectura: {
        ch4: 0.2,
        o2: 20.9,
        co: 2,
        h2s: 0.04,
        nox: 0.01,
        co2: 430,
        pm25: 16.0,
        pm10: 42.0,
        tendenciaPm25: 'ESTABLE',
        tendenciaPm10: 'ESTABLE',
        aumentoSostenidoPm25: false,
        aumentoSostenidoPm10: false,
        temperatura: 22.8,
        humedad: 65,
        fecha: new Date(t - 2 * 60 * 1000).toISOString(), // hace 2 min
      },
      alarmaLocalActiva: false,
    },
  ];
}

export const NODOS_EJEMPLO = obtenerNodosEjemplo();
