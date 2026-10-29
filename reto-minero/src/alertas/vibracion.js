/**
 * Soporte de vibración táctil para tableta o dispositivo minero
 * REGLA: La vibración (navigator.vibrate) es opcional.
 */

export function vibrarAlerta(patron = [200, 100, 200]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(patron);
    } catch {}
  }
}

export function detenerVibracion() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(0);
    } catch {}
  }
}
