/**
 * Tipos de sitio subterráneo según Decreto 1886 de 2015 (Art. 53)
 * Solo frentes y retornos de aire con sus identificadores y nombres legibles.
 */

export const TIPOS_SITIO = {
  frente_explotacion: {
    id: 'frente_explotacion',
    nombre: 'Frente de explotación o avance',
    limiteMetanoKey: 'frente_explotacion'
  },
  frente_avance: {
    id: 'frente_avance',
    nombre: 'Frente de avance',
    limiteMetanoKey: 'frente_explotacion'
  },
  retorno_principal: {
    id: 'retorno_principal',
    nombre: 'Retorno principal de aire',
    limiteMetanoKey: 'retorno_principal'
  },
  retorno_tajos: {
    id: 'retorno_tajos',
    nombre: 'Retorno de aire de tajos',
    limiteMetanoKey: 'retorno_tajos'
  },
  retorno_preparacion: {
    id: 'retorno_preparacion',
    nombre: 'Retorno de frentes de preparación y desarrollo',
    limiteMetanoKey: 'retorno_preparacion'
  }
};

