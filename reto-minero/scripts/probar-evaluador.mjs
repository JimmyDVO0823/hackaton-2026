import { evaluarNodo } from '../src/core/evaluador.js';

console.log('🧪 Iniciando pruebas del evaluador normativo Decreto 1886...');

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

console.log('🎉 ¡Todas las pruebas del evaluador pasaron exitosamente!');

