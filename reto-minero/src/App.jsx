import React, { useState, useCallback } from 'react';
import { MainLayout } from './layout/MainLayout';
import { TableroPage } from './pages/TableroPage';
import { HistorialPage } from './pages/HistorialPage';
import { PersonalPage } from './pages/PersonalPage';
import { AlarmModal } from './components/AlarmModal';
import { ToastProvider, useToast } from './components/Toast.jsx';
import { AlertasProvider, useAlertasContext } from './context/AlertasContext.jsx';
import { useTurnoAutomatico } from './hooks/useTurnoAutomatico.js';
import { useMina } from './hooks/useMina.js';
import { ModalIniciarTurno } from './components/ModalIniciarTurno.jsx';

function AppContent() {
  const {
    audioHabilitado,
    habilitarAudio,
    silenciar,
    abrirConfirmEvacuacion,
    abrirModalAlerta,
    alertas,
  } = useAlertasContext();

  const { mostrarToast } = useToast();
  const { supervisorTurno } = useMina();
  const [modalIniciarTurnoOpen, setModalIniciarTurnoOpen] = useState(false);

  // Gestión de turnos de 8h y descarga automática de resumen CSV
  const {
    turnoActual,
    descargarTurnoActual,
    simularFinDeTurno,
  } = useTurnoAutomatico((msg, tipo) => mostrarToast(msg, tipo), supervisorTurno);

  const [activeRoute, setActiveRoute] = useState('tablero');
  const [historialNodoId, setHistorialNodoId] = useState(null);

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
    if (hayBocinaActiva) {
      setBocinaGlobalActiva(false);
      setBocinasActivas({});
      silenciar?.();
    } else {
      if (!audioHabilitado) {
        habilitarAudio?.();
      }
      setBocinaGlobalActiva(true);
    }
  }, [hayBocinaActiva, audioHabilitado, habilitarAudio, silenciar]);

  // Disparar modal de alarma para un sector/nodo específico desde la lista
  const handleTriggerAlarm = useCallback((sectorName) => {
    const alertaEncontrada = alertas.find((a) => a.nombre.toLowerCase().includes(sectorName.toLowerCase()));
    if (alertaEncontrada) {
      abrirModalAlerta(alertaEncontrada);
    } else {
      abrirConfirmEvacuacion();
    }
  }, [alertas, abrirModalAlerta, abrirConfirmEvacuacion]);

  // Navegar a Historial filtrando por un nodo específico desde su tarjeta
  const handleVerHistorial = useCallback((nodoId) => {
    setHistorialNodoId(nodoId);
    setActiveRoute('historial');
  }, []);

  // Props del Sidebar
  const sidebarProps = {
    activeRoute,
    onNavigate: (route) => {
      if (route === 'historial') {
        setHistorialNodoId(null);
      }
      setActiveRoute(route);
    },
    onTriggerSOS: abrirConfirmEvacuacion,
    bocinaActiva: hayBocinaActiva,
    onToggleBocina: handleToggleBocinaSidebar,
    audioHabilitado,
    onHabilitarAudio: habilitarAudio,
  };

  const turnoProps = {
    turnoActual,
    descargarTurnoActual,
    simularFinDeTurno,
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
          onVerHistorial={handleVerHistorial}
          onAbrirIniciarTurno={() => setModalIniciarTurnoOpen(true)}
        />
      );
    }

    if (activeRoute === 'historial') {
      return (
        <HistorialPage
          initialNodoId={historialNodoId}
          onVolverTablero={() => setActiveRoute('tablero')}
        />
      );
    }

    if (activeRoute === 'personal') {
      return (
        <PersonalPage
          onVolverTablero={() => setActiveRoute('tablero')}
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
      <MainLayout
        sidebarProps={sidebarProps}
        turnoProps={turnoProps}
        supervisorProps={{
          supervisorTurno,
          onAbrirIniciarTurno: () => setModalIniciarTurnoOpen(true),
        }}
      >
        {renderContent()}
      </MainLayout>

      {/* Modal unificado de Alarma y Evacuación */}
      <AlarmModal />

      {/* Modal de Registro de Supervisor y Apertura de Turno */}
      <ModalIniciarTurno
        isOpen={modalIniciarTurnoOpen}
        onClose={() => setModalIniciarTurnoOpen(false)}
        onTurnoIniciado={habilitarAudio}
      />
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
