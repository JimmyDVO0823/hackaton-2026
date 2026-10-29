import React, { useState, useCallback } from 'react';
import { MainLayout } from './layout/MainLayout';
import { TableroPage } from './pages/TableroPage';
import { AlarmModal } from './components/AlarmModal';
import { useAlertas } from './hooks/useAlertas';

/**
 * Raíz de la aplicación ATMO-MONITOR.
 * Gestiona la ruta activa, el modal de alarma y los handlers de SOS.
 * Sincroniza el estado de las bocinas entre el Sidebar y el menú derecho del Tablero.
 */
export function App() {
  const { audioHabilitado, habilitarAudio, dispararAlerta, silenciar } = useAlertas();

  const [activeRoute, setActiveRoute] = useState('tablero');
  const [alarmModalState, setAlarmModalState] = useState({
    isOpen: false,
    sectorName: '',
    isEvacuation: false,
  });

  // ── Bocinas sincronizadas (Sitios específicos + Global) ─────────────────────
  const [bocinasActivas, setBocinasActivas] = useState({}); // { [nodoId]: boolean }
  const [bocinaGlobalActiva, setBocinaGlobalActiva] = useState(false);

  // Hay bocina activa si la global está encendida o al menos un sitio individual lo está
  const hayBocinaActiva = bocinaGlobalActiva || Object.values(bocinasActivas).some(Boolean);

  const handleToggleBocinaNodo = useCallback((nodoId) => {
    // Si la bocina global estaba activa y se desactiva un nodo, se apaga el modo global
    setBocinasActivas((prev) => ({ ...prev, [nodoId]: !prev[nodoId] }));
  }, []);

  const handleBocinaGlobal = useCallback(() => {
    setBocinaGlobalActiva((prev) => {
      const next = !prev;
      if (!next) setBocinasActivas({});
      return next;
    });
  }, []);

  // Control desde el Sidebar: si hay alguna bocina activa apaga todo; si no, activa la global
  const handleToggleBocinaSidebar = useCallback(() => {
    if (!audioHabilitado) {
      habilitarAudio?.();
    }
    if (hayBocinaActiva) {
      setBocinaGlobalActiva(false);
      setBocinasActivas({});
    } else {
      setBocinaGlobalActiva(true);
    }
  }, [hayBocinaActiva, audioHabilitado, habilitarAudio]);

  // ── Disparadores de Alarma ──────────────────────────────────────────────────
  const handleTriggerAlarm = (sectorName) => {
    setAlarmModalState({ isOpen: true, sectorName, isEvacuation: false });
  };

  const handleTriggerSOS = () => {
    setAlarmModalState({ isOpen: true, sectorName: 'Mina General', isEvacuation: true });
  };

  const handleConfirmAlarm = () => {
    const { sectorName, isEvacuation } = alarmModalState;
    setAlarmModalState({ isOpen: false, sectorName: '', isEvacuation: false });

    if (isEvacuation) {
      dispararAlerta({ nivel: 'EVACUACION', gas: 'CH4', valor: 2.5, sector: 'Mina General' });
      alert('¡ALERTA DE EVACUACIÓN GENERAL EMITIDA! Sirena y protocolo de vida activados.');
    } else {
      dispararAlerta({ nivel: 'ALARMA', gas: 'CH4', valor: 1.5, sector: sectorName });
      alert(
        `Protocolo de Suspensión Activado para ${sectorName}. Notificación enviada al personal de ventilación.`
      );
    }
  };

  // ── Props del Sidebar (incluye estado de bocina sincronizado) ───────────────
  const sidebarProps = {
    activeRoute,
    onNavigate: setActiveRoute,
    onTriggerSOS: handleTriggerSOS,
    bocinaActiva: hayBocinaActiva,
    onToggleBocina: handleToggleBocinaSidebar,
  };

  // ── Pantalla activa ─────────────────────────────────────────────────────────
  const renderContent = () => {
    if (activeRoute === 'tablero') {
      return (
        <TableroPage
          onTriggerAlarm={handleTriggerAlarm}
          bocinasActivas={bocinasActivas}
          onToggleBocina={handleToggleBocinaNodo}
          bocinaGlobalActiva={bocinaGlobalActiva}
          onBocinaGlobal={handleBocinaGlobal}
        />
      );
    }
    return (
      <div className="p-8 text-center text-secondary">
        <span className="material-symbols-outlined text-[48px] mb-2 block text-[#C29B38]">
          construction
        </span>
        <h2 className="font-headline-md text-on-surface text-[20px] uppercase">
          Módulo en Preparación: {activeRoute.toUpperCase()}
        </h2>
        <p className="font-body-md mt-2">
          Este módulo se vinculará con los repositorios locales en próximas fases.
        </p>
        <button
          type="button"
          onClick={() => setActiveRoute('tablero')}
          className="mt-4 px-4 py-2 bg-surface-container-high text-on-surface rounded font-action-label text-[12px] uppercase border border-[#2D3239]"
        >
          Volver al Tablero
        </button>
      </div>
    );
  };

  return (
    <>
      <MainLayout sidebarProps={sidebarProps}>
        {renderContent()}
      </MainLayout>

      {/* Modal de Alarma — fuera del layout para quedar encima de todo */}
      <AlarmModal
        isOpen={alarmModalState.isOpen}
        sectorName={alarmModalState.sectorName}
        isEvacuation={alarmModalState.isEvacuation}
        onClose={() => {
          silenciar();
          setAlarmModalState({ isOpen: false, sectorName: '', isEvacuation: false });
        }}
        onConfirm={handleConfirmAlarm}
      />
    </>
  );
}

export default App;
