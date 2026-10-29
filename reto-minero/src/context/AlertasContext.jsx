/* oxlint-disable react/only-export-components */
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { obtenerNodosEjemplo } from '../demo/datosEjemplo.js';
import { evaluarNodo } from '../core/evaluador.js';
import { LIMITES_DECRETO_1886 } from '../config/limites.js';
import { TIPOS_SITIO } from '../config/tiposSitio.js';
import {
  inicializarAudio,
  reproducirPrecaucion,
  reproducirAlarma,
  reproducirEvacuacion,
  detenerSonidos,
} from '../alertas/audio.js';
import { narrarAlerta } from '../alertas/voz.js';
import { vibrarAlerta, detenerVibracion } from '../alertas/vibracion.js';
import { useToast } from '../components/Toast.jsx';
import { alertasRepo } from '../data/repositorio.js';

export const AlertasContext = createContext(null);

export function AlertasProvider({ children }) {
  const { mostrarToast } = useToast();

  // 1. Estado en memoria de los nodos (con evaluación inicial calculada)
  const [nodos, setNodos] = useState(() => {
    const raw = obtenerNodosEjemplo();
    const ahora = new Date();
    return raw.map((nodo) => ({
      ...nodo,
      evaluacion: evaluarNodo(nodo, ahora),
    }));
  });

  // 2. Generar alertas desde los nodos en ALARMA o EVACUACION al cargar
  const [alertas, setAlertas] = useState(() => {
    const raw = obtenerNodosEjemplo();
    const ahora = new Date();
    const iniciales = [];

    for (const nodo of raw) {
      const evaluacion = evaluarNodo(nodo, ahora);
      if (evaluacion.nivel === 'ALARMA' || evaluacion.nivel === 'EVACUACION') {
        const tipoInfo = TIPOS_SITIO[nodo.tipoSitio];
        const limitKey = tipoInfo?.limiteMetanoKey;
        const limiteDato = limitKey ? LIMITES_DECRETO_1886.METANO_POR_SITIO[limitKey] : null;

        iniciales.push({
          id: `alerta-${nodo.id}`,
          nodoId: nodo.id,
          nombre: nodo.nombre,
          nivel: evaluacion.nivel,
          gas: 'CH4',
          valor: nodo.lectura?.ch4 ?? 0,
          limite: limiteDato?.limite ?? 1.0,
          articulo: LIMITES_DECRETO_1886.METANO_POR_SITIO.articulo,
          accion:
            evaluacion.alertaPrincipal?.accion ||
            'Suspender inmediatamente las labores del sector y evacuar hacia corriente de aire fresco.',
          hora: new Date(nodo.lectura?.fecha ?? Date.now()).toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          reconocida: false,
          reconocidaPor: null,
          horaReconocida: null,
        });
      }
    }
    return iniciales;
  });

  // 3. Audio y modales en memoria
  const [audioHabilitado, setAudioHabilitado] = useState(false);
  const [alertaModal, setAlertaModal] = useState(null);
  const [isConfirmEvacuacionOpen, setIsConfirmEvacuacionOpen] = useState(false);

  // Reproducir sonido, voz y vibración según la gravedad de la alerta
  const dispararSonidoAlerta = useCallback((alerta) => {
    if (!alerta) return;
    if (alerta.nivel === 'EVACUACION') {
      reproducirEvacuacion();
      narrarAlerta(alerta.gas || 'CH4', alerta.valor, alerta.nombre);
      vibrarAlerta([500, 200, 500, 200, 500]);
    } else if (alerta.nivel === 'ALARMA') {
      reproducirAlarma(alerta.gas || 'CH4');
      narrarAlerta(alerta.gas || 'CH4', alerta.valor, alerta.nombre);
      vibrarAlerta([300, 150, 300]);
    } else if (alerta.nivel === 'PRECAUCION') {
      reproducirPrecaucion(alerta.gas || 'CH4');
      vibrarAlerta([200]);
    }
  }, []);

  // Silenciar sonido y vibración
  const silenciar = useCallback(() => {
    detenerSonidos();
    detenerVibracion();
  }, []);

  // Iniciar turno / Activar sonido
  const habilitarAudio = useCallback(() => {
    const ok = inicializarAudio();
    setAudioHabilitado(ok);

    // Si hay alertas sin reconocer, suena la más grave (EVACUACION > ALARMA) y abre su modal con datos REALES
    const noReconocidas = alertas.filter((a) => !a.reconocida);
    if (noReconocidas.length > 0) {
      const evac = noReconocidas.find((a) => a.nivel === 'EVACUACION');
      const prioritaria = evac || noReconocidas[0];
      dispararSonidoAlerta(prioritaria);
      setAlertaModal(prioritaria);
    }
    return ok;
  }, [alertas, dispararSonidoAlerta]);

  // Reconocer alarma: silencia, registra supervisor del turno y hora, y abre la siguiente sin reconocer
  const reconocerAlerta = useCallback((alertaId, supervisor = 'Supervisor de turno') => {
    silenciar();
    const horaActual = new Date().toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    });

    let siguienteAlerta = null;

    setAlertas((prev) => {
      const actualizadas = prev.map((a) => {
        if (a.id === alertaId) {
          const alertaGuardada = {
            ...a,
            reconocida: true,
            reconocidaPor: supervisor,
            horaReconocida: horaActual,
          };
          // Persistir en IndexedDB
          alertasRepo.guardar(alertaGuardada).catch(() => {});
          return alertaGuardada;
        }
        return a;
      });

      // Buscar siguiente sin reconocer
      siguienteAlerta = actualizadas.find((a) => !a.reconocida) || null;
      return actualizadas;
    });

    mostrarToast(`Alarma reconocida por ${supervisor} a las ${horaActual}.`, 'success');

    if (siguienteAlerta) {
      setAlertaModal(siguienteAlerta);
      if (audioHabilitado) {
        dispararSonidoAlerta(siguienteAlerta);
      }
    } else {
      setAlertaModal(null);
    }
  }, [silenciar, mostrarToast, audioHabilitado, dispararSonidoAlerta]);

  // Activar sirenas de TODOS los nodos (comando simulado por LoRa)
  const activarSirenasTodosLosNodos = useCallback(() => {
    setNodos((prev) => prev.map((n) => ({ ...n, alarmaLocalActiva: true })));
  }, []);

  // Protocolo de evacuación general (SOS): confirmación y ejecución
  const abrirConfirmEvacuacion = useCallback(() => {
    setIsConfirmEvacuacionOpen(true);
  }, []);

  const cerrarConfirmEvacuacion = useCallback(() => {
    setIsConfirmEvacuacionOpen(false);
  }, []);

  const confirmarEvacuacionGeneral = useCallback(() => {
    setIsConfirmEvacuacionOpen(false);

    // 1. Enciende las sirenas de TODOS los nodos (comando simulado)
    activarSirenasTodosLosNodos();

    // 2. Crea alerta de evacuación general en memoria
    const horaActual = new Date().toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const evacAlert = {
      id: `evac-general-${Date.now()}`,
      nodoId: 'todos',
      nombre: 'Evacuación General de la Mina',
      nivel: 'EVACUACION',
      gas: 'CH4',
      valor: 'General',
      limite: '2.0% (Art. 53)',
      articulo: 'Art. 53 / Dec. 1886',
      accion: 'Evacuación inmediata de todo el personal subterráneo hacia superficie por las vías de transporte y pozos principales.',
      hora: horaActual,
      reconocida: false,
      reconocidaPor: null,
      horaReconocida: null,
    };

    setAlertas((prev) => [evacAlert, ...prev]);

    // 3. Suena la sirena de evacuación del tablero hasta reconocerla
    reproducirEvacuacion();
    narrarAlerta('CH4', 'General', 'Mina General');
    vibrarAlerta([500, 200, 500, 200, 500]);

    // 4. Abre el modal rojo a pantalla completa
    setAlertaModal(evacAlert);

    mostrarToast('🚨 Comando simulado transmitido: sirenas y balizas encendidas en todos los nodos.', 'danger');
  }, [activarSirenasTodosLosNodos, mostrarToast]);

  // Probar alarmas (rotulado para demo)
  const probarAlarma = useCallback((tipo) => {
    inicializarAudio();
    if (tipo === 'PRECAUCION') {
      reproducirPrecaucion('CH4');
      mostrarToast('Demo: Reproduciendo sonido de Precaución (440 Hz, 1 pitido)', 'warning');
    } else if (tipo === 'ALARMA') {
      reproducirAlarma('CH4');
      mostrarToast('Demo: Reproduciendo sonido de Alarma (440 Hz, 3 pitidos cada 5 s)', 'danger');
    } else if (tipo === 'EVACUACION') {
      reproducirEvacuacion();
      mostrarToast('Demo: Reproduciendo sirena continua de Evacuación (450-850 Hz)', 'danger');
    } else if (tipo === 'SILENCIAR') {
      silenciar();
      mostrarToast('Sonidos del tablero silenciados.', 'info');
    }
  }, [silenciar, mostrarToast]);

  const abrirModalAlerta = useCallback((alerta) => {
    setAlertaModal(alerta);
  }, []);

  const cerrarModal = useCallback(() => {
    setAlertaModal(null);
  }, []);

  const contextValue = useMemo(
    () => ({
      nodos,
      alertas,
      audioHabilitado,
      alertaModal,
      isConfirmEvacuacionOpen,
      habilitarAudio,
      silenciar,
      reconocerAlerta,
      abrirModalAlerta,
      cerrarModal,
      abrirConfirmEvacuacion,
      cerrarConfirmEvacuacion,
      confirmarEvacuacionGeneral,
      probarAlarma,
      activarSirenasTodosLosNodos,
    }),
    [
      nodos,
      alertas,
      audioHabilitado,
      alertaModal,
      isConfirmEvacuacionOpen,
      habilitarAudio,
      silenciar,
      reconocerAlerta,
      abrirModalAlerta,
      cerrarModal,
      abrirConfirmEvacuacion,
      cerrarConfirmEvacuacion,
      confirmarEvacuacionGeneral,
      probarAlarma,
      activarSirenasTodosLosNodos,
    ]
  );

  return (
    <AlertasContext.Provider value={contextValue}>
      {children}
    </AlertasContext.Provider>
  );
}

export function useAlertasContext() {
  const ctx = useContext(AlertasContext);
  if (!ctx) {
    throw new Error('useAlertasContext debe usarse dentro de un AlertasProvider');
  }
  return ctx;
}

