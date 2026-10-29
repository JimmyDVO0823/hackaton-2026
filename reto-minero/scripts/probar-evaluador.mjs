import { evaluarNodo } from '../src/core/evaluador.js';
import { estimarTiempoHastaLimite, analizarTendenciaPolvo } from '../src/core/prediccion.js';

console.log('🧪 Iniciando pruebas del evaluador normativo Decreto 1886, predicción y polvo PM2.5/PM10...');

const ahora = new Date('2026-10-29T12:00:00Z');
const haceUnMinuto = new Date(ahora.getTime() - 1 * 60 * 1000).toISOString();
const haceDoceMinutos = new Date(ahora.getTime() - 12 * 60 * 1000).toISOString();

// Caso 1: Retorno de tajo con CH4 1.2% (límite 1.5% -> 50% es 0.75%, por tanto 1.2% está en PRECAUCIÓN)
const nodoTajo = {
  id: 'nodo-tajo',
  tipoSitio: 'retorno_tajos',
  lectura: { ch4: 1.2, temperatura: 24, fecha: haceUnMinuto }
};
const resTajo = evaluarNodo(nodoTajo, ahora);
console.assert(
  resTajo.nivel === 'PRECAUCION',
  `Error Caso 1: esperado PRECAUCION, obtenido ${resTajo.nivel}`
);
console.log('✅ Caso 1: Retorno de tajo 1.2% -> PRECAUCION');

// Caso 2: Frente de explotación con CH4 1.2% (límite 1.0% -> superado, por tanto ALARMA)
const nodoFrente = {
  id: 'nodo-frente',
  tipoSitio: 'frente_explotacion',
  lectura: { ch4: 1.2, temperatura: 25, fecha: haceUnMinuto }
};
const resFrente = evaluarNodo(nodoFrente, ahora);
console.assert(
  resFrente.nivel === 'ALARMA',
  `Error Caso 2: esperado ALARMA, obtenido ${resFrente.nivel}`
);
console.log('✅ Caso 2: Frente 1.2% -> ALARMA');

// Caso 3: Concentración crítica de 2.3% CH4 (supera límite de evacuación 2.0% -> EVACUACION)
const nodoCritico = {
  id: 'nodo-critico',
  tipoSitio: 'retorno_principal',
  lectura: { ch4: 2.3, temperatura: 26, fecha: haceUnMinuto }
};
const resCritico = evaluarNodo(nodoCritico, ahora);
console.assert(
  resCritico.nivel === 'EVACUACION',
  `Error Caso 3: esperado EVACUACION, obtenido ${resCritico.nivel}`
);
console.log('✅ Caso 3: 2.3% CH4 -> EVACUACION');

// Caso 4: 12 min sin transmitir (límite de 5 minutos excedido -> SIN_SEÑAL)
const nodoSinSenal = {
  id: 'nodo-sin-senal',
  tipoSitio: 'frente_avance',
  lectura: { ch4: 0.2, temperatura: 23, fecha: haceDoceMinutos }
};
const resSinSenal = evaluarNodo(nodoSinSenal, ahora);
console.assert(
  resSinSenal.nivel === 'SIN_SEÑAL',
  `Error Caso 4: esperado SIN_SEÑAL, obtenido ${resSinSenal.nivel}`
);
console.log('✅ Caso 4: 12 min sin transmitir -> SIN_SEÑAL');

// ── Pruebas de prediccion.js ────────────────────────────────────────────────
console.log('📈 Evaluando motor de predicción de tendencia (prediccion.js)...');

// Caso 5: Tendencia SUBIENDO (sube a razón de ~0.1% cada 10 min -> límite 1.5% estimado en ~40 min)
const tBase = ahora.getTime();
const lecturasSubiendo = [
  { ch4: 0.6, fecha: new Date(tBase - 50 * 60000).toISOString() },
  { ch4: 0.7, fecha: new Date(tBase - 40 * 60000).toISOString() },
  { ch4: 0.8, fecha: new Date(tBase - 30 * 60000).toISOString() },
  { ch4: 0.9, fecha: new Date(tBase - 20 * 60000).toISOString() },
  { ch4: 1.0, fecha: new Date(tBase - 10 * 60000).toISOString() },
  { ch4: 1.1, fecha: new Date(tBase).toISOString() },
];
const resPredSubiendo = estimarTiempoHastaLimite(lecturasSubiendo, 1.5);
console.assert(
  resPredSubiendo.tendencia === 'SUBIENDO',
  `Error Caso 5: esperado tendencia SUBIENDO, obtenido ${resPredSubiendo.tendencia}`
);
console.assert(
  resPredSubiendo.minutosHastaLimite === 40,
  `Error Caso 5: esperado ~40 min, obtenido ${resPredSubiendo.minutosHastaLimite}`
);
console.assert(
  resPredSubiendo.mensaje && resPredSubiendo.mensaje.includes('1,5%') && resPredSubiendo.mensaje.includes('40 min'),
  `Error Caso 5: formato de mensaje incorrecto: ${resPredSubiendo.mensaje}`
);
console.log(`✅ Caso 5: Predicción subiendo correcta -> "${resPredSubiendo.mensaje}"`);

// Caso 6: Tendencia BAJANDO (concentración disminuyendo tras ventilación)
const lecturasBajando = [
  { ch4: 1.0, fecha: new Date(tBase - 50 * 60000).toISOString() },
  { ch4: 0.9, fecha: new Date(tBase - 40 * 60000).toISOString() },
  { ch4: 0.8, fecha: new Date(tBase - 30 * 60000).toISOString() },
  { ch4: 0.7, fecha: new Date(tBase - 20 * 60000).toISOString() },
  { ch4: 0.6, fecha: new Date(tBase - 10 * 60000).toISOString() },
  { ch4: 0.5, fecha: new Date(tBase).toISOString() },
];
const resPredBajando = estimarTiempoHastaLimite(lecturasBajando, 1.5);
console.assert(
  resPredBajando.tendencia === 'BAJANDO',
  `Error Caso 6: esperado tendencia BAJANDO, obtenido ${resPredBajando.tendencia}`
);
console.assert(
  resPredBajando.minutosHastaLimite === null && resPredBajando.mensaje === null,
  `Error Caso 6: cuando baja no debe proyectar tiempo al límite`
);
console.log('✅ Caso 6: Predicción bajando correcta -> sin mensaje de alerta');

// ── Pruebas de Polvo PM2.5 y PM10 (Evaluador y Tendencias) ─────────────────
console.log('💨 Evaluando monitoreo de material particulado (PM2.5 y PM10)...');

// Caso 7: Polvo respirable PM2.5 supera límite de seguridad (54.0 µg/m³ >= 50.0 µg/m³ -> ALARMA)
const nodoPolvoPm25Critico = {
  id: 'nodo-polvo-25',
  tipoSitio: 'frente_explotacion',
  lectura: {
    ch4: 0.2,
    temperatura: 24,
    pm25: 54.0,
    pm10: 95.0,
    fecha: haceUnMinuto,
  },
};
const resPolvoPm25 = evaluarNodo(nodoPolvoPm25Critico, ahora);
console.assert(
  resPolvoPm25.nivel === 'ALARMA',
  `Error Caso 7: esperado ALARMA por PM2.5, obtenido ${resPolvoPm25.nivel}`
);
console.assert(
  resPolvoPm25.alertas.some((a) => a.tipo === 'POLVO_PM25' && a.nivel === 'ALARMA'),
  `Error Caso 7: no se encontró la alerta de ALARMA de POLVO_PM25`
);
console.log('✅ Caso 7: Polvo PM2.5 (54 µg/m³ >= 50 µg/m³) -> ALARMA');

// Caso 8: Polvo inhalable PM10 supera límite de seguridad (165.0 µg/m³ >= 150.0 µg/m³ -> ALARMA)
const nodoPolvoPm10Critico = {
  id: 'nodo-polvo-10',
  tipoSitio: 'frente_explotacion',
  lectura: {
    ch4: 0.2,
    temperatura: 24,
    pm25: 25.0,
    pm10: 165.0,
    fecha: haceUnMinuto,
  },
};
const resPolvoPm10 = evaluarNodo(nodoPolvoPm10Critico, ahora);
console.assert(
  resPolvoPm10.nivel === 'ALARMA',
  `Error Caso 8: esperado ALARMA por PM10, obtenido ${resPolvoPm10.nivel}`
);
console.log('✅ Caso 8: Polvo PM10 (165 µg/m³ >= 150 µg/m³) -> ALARMA');

// Caso 9: Detección de Aumento Sostenido con analizarTendenciaPolvo y alerta PRECAUCION
const lecturasPolvoAscendentes = [
  { pm25: 18.0 },
  { pm25: 23.0 },
  { pm25: 29.0 },
  { pm25: 36.0 },
];
const analisisTendencia = analizarTendenciaPolvo(lecturasPolvoAscendentes, 'pm25');
console.assert(
  analisisTendencia.tendencia === 'AUMENTANDO',
  `Error Caso 9: esperado tendencia AUMENTANDO, obtenido ${analisisTendencia.tendencia}`
);
console.assert(
  analisisTendencia.aumentoSostenido === true,
  `Error Caso 9: esperado aumentoSostenido true, obtenido ${analisisTendencia.aumentoSostenido}`
);

const nodoAumentoSostenido = {
  id: 'nodo-aumento-polvo',
  tipoSitio: 'frente_explotacion',
  lectura: {
    ch4: 0.2,
    temperatura: 24,
    pm25: 36.0,
    pm10: 80.0,
    aumentoSostenidoPm25: true,
    tendenciaPm25: 'AUMENTANDO',
    fecha: haceUnMinuto,
  },
};
const resAumentoSostenido = evaluarNodo(nodoAumentoSostenido, ahora);
console.assert(
  resAumentoSostenido.nivel === 'PRECAUCION',
  `Error Caso 9: esperado PRECAUCION por aumento sostenido de polvo, obtenido ${resAumentoSostenido.nivel}`
);
console.log('✅ Caso 9: Detección de aumento sostenido de polvo PM2.5 -> PRECAUCION');

// Caso 10: Detección de tendencia DISMINUYENDO y ESTABLE
const lecturasBajandoPolvo = [{ pm25: 40.0 }, { pm25: 30.0 }, { pm25: 22.0 }];
const analisisBajando = analizarTendenciaPolvo(lecturasBajandoPolvo, 'pm25');
console.assert(
  analisisBajando.tendencia === 'DISMINUYENDO',
  `Error Caso 10: esperado tendencia DISMINUYENDO, obtenido ${analisisBajando.tendencia}`
);

const lecturasEstablesPolvo = [{ pm25: 22.0 }, { pm25: 22.5 }, { pm25: 22.2 }];
const analisisEstable = analizarTendenciaPolvo(lecturasEstablesPolvo, 'pm25');
console.assert(
  analisisEstable.tendencia === 'ESTABLE',
  `Error Caso 10: esperado tendencia ESTABLE, obtenido ${analisisEstable.tendencia}`
);
console.log('✅ Caso 10: Comparación correcta de tendencias: DISMINUYENDO y ESTABLE');

console.log('🎉 ¡Todas las pruebas del evaluador, predicción y polvo PM2.5/PM10 pasaron exitosamente!');
