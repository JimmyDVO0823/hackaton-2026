import React, { useState } from 'react';
import { Sidebar } from './layout/Sidebar';
import { Header } from './layout/Header';
import { TableroPage } from './pages/TableroPage';
import { AlarmModal } from './components/AlarmModal';
import { useAlertas } from './hooks/useAlertas';

/**
 * Raíz de la aplicación ATMO-MONITOR.
 * Gestiona la ruta activa, el modal de alarma y los handlers de SOS.
 * REGLA: No contiene lógica de negocio; delega en hooks y páginas.
 */
export function App() {
  const { audioHabilitado, habilitarAudio, dispararAlerta, silenciar } = useAlertas();

  const [activeRoute, setActiveRoute] = useState('tablero');
  const [alarmModalState, setAlarmModalState] = useState({
    isOpen: false,
    sectorName: '',
    isEvacuation: false
  });

  // Disparadores de Alarma
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

  return (
    <div className="bg-surface text-on-surface font-body-md select-none min-h-screen">
      {/* Sidebar Lateral */}
      <Sidebar
        activeRoute={activeRoute}
        onNavigate={setActiveRoute}
        onTriggerSOS={handleTriggerSOS}
        audioHabilitado={audioHabilitado}
        onHabilitarAudio={habilitarAudio}
      />

      {/* Contenedor con margen izquierdo compensando Sidebar */}
      <div className="pl-72">
        {/* Encabezado Superior */}
        <Header />

        {/* Contenido Principal / Pantalla Actual */}
        <main className="w-full pt-16 bg-surface min-h-screen">
          {activeRoute === 'tablero' ? (
            <TableroPage onTriggerAlarm={handleTriggerAlarm} />
          ) : (
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
          )}
        </main>
      </div>

      {/* Modal de Alarma */}
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
    </div>
  );
}

export default App;
