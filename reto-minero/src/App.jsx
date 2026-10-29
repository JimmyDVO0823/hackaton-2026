import React, { useState, useCallback } from 'react';
import { MainLayout } from './layout/MainLayout';
import { TableroPage } from './pages/TableroPage';
import { AlarmModal } from './components/AlarmModal';
import { ToastProvider } from './components/Toast.jsx';
import { AlertasProvider, useAlertasContext } from './context/AlertasContext.jsx';

function AppContent() {
  const {
    audioHabilitado,
    habilitarAudio,
    abrirConfirmEvacuacion,
    abrirModalAlerta,
    alertas,
  } = useAlertasContext();

  const [activeRoute, setActiveRoute] = useState('tablero');

  // ── Bocinas sincronizadas (Sitios específicos + Global) ──────────────────────
  const [bocinasActivas, setBocinasActivas] = useState({});
  const [bocinaGlobalActiva, setBocinaGlobalActiva] = useState(false);

  const hayBocinaActiva = bocinaGlobalActiva || Object.values(bocinasActivas).some(Boolean);

  const handleToggleBocinaNodo = useCallback((nodoId) => {
    setBocinasActivas((prev) => ({ ...prev, [nodoId]: !prev[nodoId] }));
  }, []);

  const handleBocinaGlobal = useCallback(() => {
    setBocinaGlobalActiva((prev) => {
      const next = !prev;
      if (!next) setBocinasActivas({});
      return next;
    });
  }, []);

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

  // Disparar modal de alarma para un sector/nodo específico desde la lista
  const handleTriggerAlarm = useCallback((sectorName) => {
    const alertaEncontrada = alertas.find((a) => a.nombre.toLowerCase().includes(sectorName.toLowerCase()));
    if (alertaEncontrada) {
      abrirModalAlerta(alertaEncontrada);
    } else {
      // Abre modal con datos reales si existe o de confirmación general
      abrirConfirmEvacuacion();
    }
  }, [alertas, abrirModalAlerta, abrirConfirmEvacuacion]);

  // Props del Sidebar
  const sidebarProps = {
    activeRoute,
    onNavigate: setActiveRoute,
    onTriggerSOS: abrirConfirmEvacuacion, // Protocolo Evacuación abre el modal sin datos inventados
    bocinaActiva: hayBocinaActiva,
    onToggleBocina: handleToggleBocinaSidebar,
    audioHabilitado,
    onHabilitarAudio: habilitarAudio,
  };

  // Pantalla activa
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

      {/* Modal unificado de Alarma y Evacuación */}
      <AlarmModal />
    </>
  );
}

export function App() {
  return (
    <ToastProvider>
      <AlertasProvider>
        <AppContent />
      </AlertasProvider>
    </ToastProvider>
  );
}

export default App;
