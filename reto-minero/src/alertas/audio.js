/**
 * Sistema de audio para alertas mineras con Web Audio API
 * REGLA: Tonos y ritmos exactos según skill.md:
 * - Tonos por gas: CH4 440 Hz, O2 523 Hz, CO 659 Hz, H2S 784 Hz, otros 880 Hz
 * - Ritmos por gravedad:
 *   - Precaución: 1 pitido (0.3 s)
 *   - Alarma: 3 pitidos (0.15 s c/u) repetidos cada 5 s
 *   - Evacuación: sirena modulada continua (450 Hz - 850 Hz)
 * - Varios gases: suena solo el más grave (EVACUACION > ALARMA > PRECAUCION)
 */

let audioCtx = null;
let alarmaInterval = null;
let sirenaInterval = null;
let sirenaOscilador = null;
let sirenaGain = null;
let timeoutsActivos = [];

// Frecuencias normativas por gas en Hz
export const TONOS_GAS = {
  CH4: 440,
  O2: 523,
  CO: 659,
  H2S: 784,
  OTROS: 880
};

export function inicializarAudio() {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  } catch (err) {
    console.warn('Error inicializando Web Audio API:', err);
  }
  return !!audioCtx;
}

function emitirPitido(frecuencia, duracionSeg = 0.2) {
  if (!audioCtx) return;
  try {
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
  } catch (err) {
    console.warn('Error emitirPitido:', err);
  }
}

export function reproducirPrecaucion(gas = 'CH4') {
  detenerSonidos();
  inicializarAudio();
  const freq = TONOS_GAS[gas] || TONOS_GAS.OTROS;
  emitirPitido(freq, 0.3); // 1 solo pitido
}

export function reproducirAlarma(gas = 'CH4') {
  detenerSonidos();
  inicializarAudio();
  const freq = TONOS_GAS[gas] || TONOS_GAS.OTROS;

  const emitirTresPitidos = () => {
    emitirPitido(freq, 0.15);
    const t1 = setTimeout(() => emitirPitido(freq, 0.15), 200);
    const t2 = setTimeout(() => emitirPitido(freq, 0.15), 400);
    timeoutsActivos.push(t1, t2);
  };

  emitirTresPitidos();
  alarmaInterval = setInterval(emitirTresPitidos, 5000);
}

export function reproducirEvacuacion() {
  detenerSonidos();
  inicializarAudio();
  if (!audioCtx) return;

  try {
    sirenaOscilador = audioCtx.createOscillator();
    sirenaGain = audioCtx.createGain();

    sirenaOscilador.type = 'sine';
    sirenaOscilador.frequency.setValueAtTime(500, audioCtx.currentTime);

    let sube = true;
    sirenaInterval = setInterval(() => {
      if (!sirenaOscilador || !audioCtx) {
        if (sirenaInterval) {
          clearInterval(sirenaInterval);
          sirenaInterval = null;
        }
        return;
      }
      try {
        const targetFreq = sube ? 850 : 450;
        sirenaOscilador.frequency.exponentialRampToValueAtTime(targetFreq, audioCtx.currentTime + 0.4);
        sube = !sube;
      } catch {}
    }, 400);

    sirenaGain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    sirenaOscilador.connect(sirenaGain);
    sirenaGain.connect(audioCtx.destination);
    sirenaOscilador.start();
  } catch (err) {
    console.warn('Error reproducirEvacuacion:', err);
  }
}

export function detenerSonidos() {
  if (alarmaInterval) {
    clearInterval(alarmaInterval);
    alarmaInterval = null;
  }
  if (sirenaInterval) {
    clearInterval(sirenaInterval);
    sirenaInterval = null;
  }
  for (const t of timeoutsActivos) {
    clearTimeout(t);
  }
  timeoutsActivos = [];

  if (sirenaOscilador) {
    try {
      sirenaOscilador.stop();
      sirenaOscilador.disconnect();
    } catch {}
    sirenaOscilador = null;
  }
  if (sirenaGain) {
    try {
      sirenaGain.disconnect();
    } catch {}
    sirenaGain = null;
  }
}
