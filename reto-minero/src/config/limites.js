/**
 * Límites normativos oficiales según Decreto 1886 de 2015 (Reglamento de Seguridad en las Labores Mineras Subterráneas de Colombia).
 * REGLA: Los límites normativos viven ÚNICAMENTE en este archivo, referenciando su artículo respectivo.
 */

export const LIMITES_DECRETO_1886 = {
  // Oxígeno (Art. 38): Debe encontrarse entre 19.5% y 23.5% en volumen
  OXIGENO: {
    articulo: 'Art. 38',
    minApto: 19.5,
    maxApto: 23.5,
    unidad: '%Vol',
    descripcion: 'Apto exclusivamente entre 19.5% y 23.5% en volumen.'
  },

  // Gases tóxicos (Art. 39), en partes por millón (PPM)
  GASES_TOXICOS: {
    articulo: 'Art. 39',
    CO2: { twa: 5000, stel: 30000, unidad: 'PPM', nombre: 'Dióxido de Carbono' },
    CO: { twa: 25, stel: null, unidad: 'PPM', nombre: 'Monóxido de Carbono' },
    H2S: { twa: 1, stel: 5, unidad: 'PPM', nombre: 'Ácido Sulfhídrico' },
    SO2: { twa: null, stel: 0.25, unidad: 'PPM', nombre: 'Dióxido de Azufre' },
    NO: { twa: 25, stel: null, unidad: 'PPM', nombre: 'Óxido Nítrico' },
    NO2: { twa: null, stel: 0.2, unidad: 'PPM', nombre: 'Dióxido de Nitrógeno' }
  },

  // Metano (CH4) según tipo de labor/sitio (Art. 53 y Art. 162)
  METANO_POR_SITIO: {
    articulo: 'Art. 53',
    frente_explotacion: { limite: 1.0, unidad: '%Vol', descripcion: 'Frentes de explotación o avance (20% LEL)' },
    retorno_principal: { limite: 1.0, unidad: '%Vol', descripcion: 'Retornos principales de aire (20% LEL)' },
    retorno_tajos: { limite: 1.5, unidad: '%Vol', descripcion: 'Retorno de aire de tajos (30% LEL)' },
    retorno_preparacion: { limite: 1.5, unidad: '%Vol', descripcion: 'Retorno de frentes de preparación y desarrollo (30% LEL)' },
    limite_voladura: { limite: 0.5, articulo: 'Art. 162', unidad: '%Vol', descripcion: 'Prohibición de voladura con 0.5% o más' },
    limite_evacuacion: { limite: 2.0, articulo: 'Art. 53', unidad: '%Vol', descripcion: 'Por encima de 2% solo ingresa personal de salvamento' }
  },

  // Categorías de mina (Art. 58) y frecuencia mínima de medición (Art. 60)
  CATEGORIA_MINA: {
    articulo_categoria: 'Art. 58',
    articulo_frecuencia: 'Art. 60',
    I: { maxMetano: 0.0, frecuenciaHoras: null, descripcion: '0% de metano. Medir al inicio de turno y antes de cada voladura.' },
    II: { maxMetano: 0.3, frecuenciaHoras: 2, descripcion: 'Hasta 0.3%. Medir al iniciar turno, antes de voladuras y máx cada 2h.' },
    III: { maxMetano: Infinity, frecuenciaHoras: 0, descripcion: 'Más de 0.3%. Medir antes de cada turno y de forma continua.' }
  },

  // Velocidades del aire (Art. 56) en m/s
  VELOCIDAD_AIRE: {
    articulo: 'Art. 56',
    vias_trolley_min: 1.0,
    galerias_explotacion_min: 0.5,
    auxiliar_vias_carbon_min: 0.3,
    auxiliar_tambores_arriba_min: 0.5,
    auxiliar_bajadas_roca_min: 0.2,
    vias_transito_max: 6.0,
    tajos_max: 4.5
  },

  // Caudal mínimo de ventilación (Art. 54)
  CAUDAL_VENTILACION: {
    articulo: 'Art. 54',
    por_trabajador_bajo_1500m: 3.0, // m³/min
    por_trabajador_sobre_1500m: 6.0, // m³/min
    diesel_hp_co_bajo: 4.0, // m³/min por HP si CO exosto <= 0.08%
    diesel_hp_co_alto: 6.0  // m³/min por HP si CO exosto <= 0.12%
  },

  // Temperatura ambiente subterránea (pendiente de validar con especialista minero)
  TEMPERATURA: {
    estado: 'por validar',
    unidad: '°C',
    nota: 'Límite pendiente de validar con integrante de Ingeniería de Minas.'
  }
};

