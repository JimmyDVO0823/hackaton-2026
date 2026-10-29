/**
 * Límites normativos oficiales según Decreto 1886 de 2015 (Reglamento de Seguridad en las Labores Mineras Subterráneas de Colombia).
 * REGLA: Ningún componente o evaluador escribe límites a mano. Todo se lee de este archivo.
 */

export const LIMITES_DECRETO_1886 = {
  // Constantes de monitoreo de telemetría
  SIN_SEÑAL_MINUTOS: 5,
  UMBRAL_PRECAUCION: 0.5, // 50% del límite normativo según skill.md

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
    NO2: { twa: 0.2, stel: null, unidad: 'PPM', nombre: 'Dióxido de Nitrógeno' }
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

  // Temperatura ambiente subterránea (configurable, marcada "por validar")
  TEMPERATURA: {
    maximo: 32,
    estado: 'por validar',
    unidad: '°C',
    nota: 'Límite pendiente de validar con integrante de Ingeniería de Minas.'
  },

  // Humedad relativa ambiente (informativa)
  HUMEDAD: {
    unidad: '%',
    tipo: 'informativa',
    descripcion: 'Humedad relativa en corriente de aire subterránea'
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
    por_trabajador_bajo_1500m: 3.0,
    por_trabajador_sobre_1500m: 6.0,
    diesel_hp_co_bajo: 4.0,
    diesel_hp_co_alto: 6.0
  },

  // Material Particulado / Polvo de Carbón (Higiene Ocupacional y Seguridad Minera)
  MATERIAL_PARTICULADO: {
    articulo: 'Higiene Minera / Dec. 1886',
    PM25: {
      nombre: 'Polvo Respirable (PM2.5)',
      unidad: 'µg/m³',
      limiteSeguridad: 50.0,       // Límite de Alarma de seguridad
      umbralPrecaucion: 35.0,      // Umbral preventivo de precaución
      umbralVariacionMinima: 1.5,  // Variación en µg/m³ para considerar cambio real
      lecturasSostenidasAlerta: 3, // Mediciones consecutivas en alza para disparar alerta
      descripcion: 'Fracción respirable capaz de penetrar alvéolos pulmonares.'
    },
    PM10: {
      nombre: 'Polvo Inhalable (PM10)',
      unidad: 'µg/m³',
      limiteSeguridad: 150.0,      // Límite de Alarma de seguridad
      umbralPrecaucion: 100.0,     // Umbral preventivo de precaución
      umbralVariacionMinima: 3.0,  // Variación en µg/m³ para considerar cambio real
      lecturasSostenidasAlerta: 3, // Mediciones consecutivas en alza para disparar alerta
      descripcion: 'Fracción torácica e inhalable generada en arranque y transporte.'
    }
  }
};
