import { useState, useCallback } from 'react';
import {
  inicializarAudio,
  reproducirPrecaucion,
  reproducirAlarma,
  reproducirEvacuacion,
  detenerSonidos
} from '../alertas/audio.js';
import { narrarAlerta } from '../alertas/voz.js';
import { vibrarAlerta, detenerVibracion } from '../alertas/vibracion.js';

/**
 * Hook para la orquestación de sonido, voz y vibración según gravedad
 */
export function useAlertas() {
  const [audioHabilitado, setAudioHabilitado] = useState(false);

  const habilitarAudio = useCallback(() => {
    const ok = inicializarAudio();
    setAudioHabilitado(ok);
    return ok;
  }, []);

  const dispararAlerta = useCallback(
    ({ nivel, gas = 'CO', valor = 0, sector = 'Mina' }) => {
      if (nivel === 'EVACUACION') {
        if (audioHabilitado) reproducirEvacuacion();
        narrarAlerta(gas, valor, sector);
        vibrarAlerta([500, 200, 500, 200, 500]);
      } else if (nivel === 'ALARMA') {
        if (audioHabilitado) reproducirAlarma(gas);
        narrarAlerta(gas, valor, sector);
        vibrarAlerta([300, 150, 300]);
      } else if (nivel === 'PRECAUCION') {
        if (audioHabilitado) reproducirPrecaucion(gas);
        vibrarAlerta([200]);
      }
    },
    [audioHabilitado]
  );

  const silenciar = useCallback(() => {
    detenerSonidos();
    detenerVibracion();
  }, []);

  return {
    audioHabilitado,
    habilitarAudio,
    dispararAlerta,
    silenciar
  };
}

