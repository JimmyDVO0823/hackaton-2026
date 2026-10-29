import React, { useState } from 'react';
import { KpiSummary } from '../components/KpiSummary';
import { MineMap } from '../components/MineMap';
import { SectorList } from '../components/SectorList';
import { FooterBar } from '../layout/FooterBar';

/**
 * Pantalla Principal: Tablero de Monitoreo Atmosférico
 * REGLA: pages/ contiene las pantallas del flujo de usuario.
 */
export function TableroPage({
  sectors = [],
  onOpenMeasurement,
  onTriggerAlarm
}) {
  const [activeFilter, setActiveFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSectorId, setSelectedSectorId] = useState(null);

  const handleSelectSector = (sectorId) => {
    setSelectedSectorId(sectorId);
    const targetId = sectorId === 'tunel-acceso' ? 'galeria-transporte' : sectorId;
    const cardEl = document.getElementById(`card-${targetId}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleFocusCritical = () => {
    handleSelectSector('retorno-principal');
  };

  const filteredSectors = sectors.filter((sector) => {
    const matchesFilter = activeFilter ? sector.status === activeFilter : true;
    const query = searchTerm.toLowerCase().trim();
    const matchesSearch =
      query === '' ||
      sector.name.toLowerCase().includes(query) ||
      sector.description.toLowerCase().includes(query) ||
      (sector.telemetry &&
        (sector.telemetry.ch4.value.includes(query) ||
          sector.telemetry.co.value.includes(query)));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex flex-col w-full p-space-md gap-space-md bg-surface text-on-surface">
      {/* 1. Resumen KPI */}
      <KpiSummary
        sectors={sectors}
        activeFilter={activeFilter}
        onFilterSelect={(status) => setActiveFilter(status)}
      />

      {/* 2. Cuerpo Principal: Mapa + Lista */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md items-start">
        <MineMap
          onSelectSector={handleSelectSector}
          onFocusCritical={handleFocusCritical}
          selectedSectorId={selectedSectorId}
        />

        <SectorList
          sectors={filteredSectors}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onResetFilters={() => {
            setActiveFilter(null);
            setSearchTerm('');
            setSelectedSectorId(null);
          }}
          selectedSectorId={selectedSectorId}
          onTriggerAlarm={onTriggerAlarm}
          onRegisterMeasurement={onOpenMeasurement}
        />
      </div>

      {/* 3. Barra Inferior */}
      <FooterBar
        onNewMeasurement={() => onOpenMeasurement()}
        onSync={() => alert('Sincronización local completada.')}
      />
    </div>
  );
}

