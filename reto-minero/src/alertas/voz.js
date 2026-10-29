/**
 * Síntesis de voz para alertas mineras
 * REGLA: la voz (speechSynthesis) dice gas, valor y sector.
 */

export function narrarAlerta(gas, valor, sector) {
  if (!('speechSynthesis' in window)) return;

  const nombresGases = {
    CH4: 'Metano',
    O2: 'Oxígeno',
    CO: 'Monóxido de carbono',
    H2S: 'Ácido sulfhídrico'
  };

  const nombreGas = nombresGases[gas] || gas;
  const texto = `Alerta. ${nombreGas}, valor ${valor}, en sector ${sector}.`;

  const utterance = new SpeechSynthesisUtterance(texto);
  utterance.lang = 'es-CO';
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

