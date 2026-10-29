import React, { useState } from 'react';
import { Sidebar } from './layout/Sidebar';
import { Header } from './layout/Header';
import { TableroPage } from './pages/TableroPage';
import { MeasurementModal } from './components/MeasurementModal';
import { AlarmModal } from './components/AlarmModal';
import { useAtmosphericData } from './hooks/useAtmosphericData';
import { useAlertas } from './hooks/useAlertas';
import './styles/global.css';

export function App() {
  const { sectors, registrarMedicion } = useAtmosphericData();
  const { audioHabilitado, habilitarAudio, dispararAlerta, silenciar } = useAlertas();

  const [activeRoute, setActiveRoute] = useState('tablero');

  // Estados de Modales
  const [isMeasurementModalOpen, setIsMeasurementModalOpen] = useState(false);
  const [measurementInitialSector, setMeasurementInitialSector] = useState('');
  const [alarmModalState, setAlarmModalState] = useState({
    isOpen: false,
    sectorName: '',
    isEvacuation: false
  });

  // Abrir modal de medición
  const handleOpenMeasurement = (sectorName = '') => {
    setMeasurementInitialSector(sectorName);
    setIsMeasurementModalOpen(true);
  };

  // Guardar nueva medición con evaluación core y persistencia
  const handleSaveMeasurement = async ({ sectorName, ch4, o2, co, operator }) => {
    const { evaluacion } = await registrarMedicion({
      sectorName,
      ch4,
      o2,
      co,
      operator
    });

    setIsMeasurementModalOpen(false);

    // Disparar alertas sonoras y de voz si es necesario
    if (evaluacion.esCritico || evaluacion.nivel === 'PRECAUCION') {
      const gasCritico = evaluacion.alertaPrincipal?.gas || 'CO';
      const valorCritico = evaluacion.alertaPrincipal?.valor || co;
      dispararAlerta({
        nivel: evaluacion.nivel,
        gas: gasCritico,
        valor: valorCritico,
        sector: sectorName
      });
    }

    alert(
      `Medición registrada para ${sectorName}.\nNivel de riesgo evaluado: ${evaluacion.nivel}\n${
        evaluacion.alertaPrincipal?.mensaje || 'Parámetros dentro de norma legal.'
      }`
    );
  };

  // Disparadores de Alarma
  const handleTriggerAlarm = (sectorName) => {
    setAlarmModalState({
      isOpen: true,
      sectorName,
      isEvacuation: false
    });
  };

  const handleTriggerSOS = () => {
    setAlarmModalState({
      isOpen: true,
      sectorName: 'Mina General',
      isEvacuation: true
    });
  };

  const handleConfirmAlarm = () => {
    const { sectorName, isEvacuation } = alarmModalState;
    setAlarmModalState({ isOpen: false, sectorName: '', isEvacuation: false });

    if (isEvacuation) {
      dispararAlerta({ nivel: 'EVACUACION', gas: 'CH4', valor: 2.5, sector: 'Mina General' });
      alert('¡ALERTA DE EVACUACIÓN GENERAL EMITIDA! Sirena y protocolo de vida activados.');
    } else {
      dispararAlerta({ nivel: 'ALARMA', gas: 'CO', valor: 30, sector: sectorName });
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
        onNavigate={(route) => {
          setActiveRoute(route);
          if (route === 'registrar-medicion') {
            handleOpenMeasurement();
          }
        }}
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
          {activeRoute === 'tablero' || activeRoute === 'registrar-medicion' ? (
            <TableroPage
              sectors={sectors}
              onOpenMeasurement={handleOpenMeasurement}
              onTriggerAlarm={handleTriggerAlarm}
            />
          ) : (
            <div className="p-8 text-center text-secondary">
              <span className="material-symbols-outlined text-[48px] mb-2 block text-[#C29B38]">
                construction
              </span>
              <h2 className="font-headline-md text-on-surface text-[20px] uppercase">
                Módulo en Preparación: {activeRoute.toUpperCase()}
              </h2>
              <p className="font-body-md mt-2">
                Conforme a la estructura del hackatón, este módulo se vinculará con los repositorios locales.
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

      {/* Modales Interactivos */}
      <MeasurementModal
        isOpen={isMeasurementModalOpen}
        initialSector={measurementInitialSector}
        onClose={() => setIsMeasurementModalOpen(false)}
        onSave={handleSaveMeasurement}
      />

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
