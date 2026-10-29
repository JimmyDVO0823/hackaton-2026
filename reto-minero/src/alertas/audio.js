/**
 * Sistema de audio para alertas mineras con Web Audio API
 * REGLA: Tonos y ritmos exactos según skill.md:
 * - Tonos por gas: CH₄ 440 Hz, O₂ 523 Hz, CO 659 Hz, H₂S 784 Hz, otros 880 Hz
 * - Ritmos por gravedad: Precaución (1 pitido), Alarma (3 pitidos cada 5s), Evacuación (sirena continua)
 * - Varios gases: suena solo el más grave
 */

let audioCtx = null;
let alarmaInterval = null;
let sirenaOscilador = null;

// Frecuencias normativas por gas en Hz
export const TONOS_GAS = {
  CH4: 440,
  O2: 523,
  CO: 659,
  H2S: 784,
  OTROS: 880
};

export function inicializarAudio() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return !!audioCtx;
}

function emitirPitido(frecuencia, duracionSeg = 0.2) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(frecuencia, audioCtx.currentTime);

  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duracionSeg);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + duracionSeg);
}

export function reproducirPrecaucion(gas = 'CH4') {
  inicializarAudio();
  const freq = TONOS_GAS[gas] || TONOS_GAS.OTROS;
  emitirPitido(freq, 0.3); // 1 solo pitido
}

export function reproducirAlarma(gas = 'CO') {
  detenerSonidos();
  inicializarAudio();
  const freq = TONOS_GAS[gas] || TONOS_GAS.OTROS;

  const emitirTresPitidos = () => {
    emitirPitido(freq, 0.15);
    setTimeout(() => emitirPitido(freq, 0.15), 200);
    setTimeout(() => emitirPitido(freq, 0.15), 400);
  };

  emitirTresPitidos();
  alarmaInterval = setInterval(emitirTresPitidos, 5000);
}

export function reproducirEvacuacion() {
  detenerSonidos();
  inicializarAudio();
  if (!audioCtx) return;

  sirenaOscilador = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  sirenaOscilador.type = 'sine';
  sirenaOscilador.frequency.setValueAtTime(500, audioCtx.currentTime);

  // Modular frecuencia de sirena periódicamente
  let sube = true;
  const sirenaInterval = setInterval(() => {
    if (!sirenaOscilador) {
      clearInterval(sirenaInterval);
      return;
    }
    const targetFreq = sube ? 850 : 450;
    sirenaOscilador.frequency.exponentialRampToValueAtTime(targetFreq, audioCtx.currentTime + 0.4);
    sube = !sube;
  }, 400);

  gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
  sirenaOscilador.connect(gain);
  gain.connect(audioCtx.destination);
  sirenaOscilador.start();
}

export function detenerSonidos() {
  if (alarmaInterval) {
    clearInterval(alarmaInterval);
    alarmaInterval = null;
  }
  if (sirenaOscilador) {
    try {
      sirenaOscilador.stop();
      sirenaOscilador.disconnect();
    } catch {}
    sirenaOscilador = null;
  }
}
