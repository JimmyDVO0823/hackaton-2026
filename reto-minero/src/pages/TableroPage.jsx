import React, { useState } from 'react';
import { KpiSummary } from '../components/KpiSummary';
import { MineMap } from '../components/MineMap';
import { SectorList } from '../components/SectorList';
import { FooterBar } from '../layout/FooterBar';
import { useNodos } from '../hooks/useNodos';

/**
 * Pantalla Principal: Tablero de Monitoreo Atmosférico.
 * REGLA: pages/ contiene las pantallas del flujo de usuario.
 * Obtiene los nodos con evaluación calculada desde useNodos (hook de lógica).
 */
export function TableroPage({ onTriggerAlarm }) {
  const { nodos } = useNodos();

  const [activeFilter, setActiveFilter] = useState(null);
  const [searchTerm, setSearchTerm]     = useState('');
  const [selectedNodoId, setSelectedNodoId] = useState(null);

  const handleSelectNodo = (nodoId) => {
    setSelectedNodoId(nodoId);
    const cardEl = document.getElementById(`card-${nodoId}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleFocusCritical = () => {
    handleSelectNodo('retorno-principal');
  };

  /** Filtra por KPI activo (nivel de evaluación) y por texto de búsqueda */
  const nodosFiltrados = nodos.filter((nodo) => {
    const nivel = nodo.evaluacion?.nivel ?? 'NORMAL';
    // El filtro ALARMA captura también EVACUACION
    const matchesFilter =
      activeFilter === null ||
      nivel === activeFilter ||
      (activeFilter === 'ALARMA' && nivel === 'EVACUACION');

    const query = searchTerm.toLowerCase().trim();
    const matchesSearch =
      query === '' ||
      nodo.nombre.toLowerCase().includes(query) ||
      nodo.ubicacion.toLowerCase().includes(query) ||
      nivel.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex flex-col w-full p-space-md gap-space-md bg-surface text-on-surface">
      {/* 1. Resumen KPI */}
      <KpiSummary
        nodos={nodos}
        activeFilter={activeFilter}
        onFilterSelect={setActiveFilter}
      />

      {/* 2. Cuerpo Principal: Mapa + Lista */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md items-start">
        <MineMap
          nodos={nodos}
          onSelectNodo={handleSelectNodo}
          onFocusCritical={handleFocusCritical}
          selectedNodoId={selectedNodoId}
        />

        <SectorList
          nodos={nodosFiltrados}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onResetFilters={() => {
            setActiveFilter(null);
            setSearchTerm('');
            setSelectedNodoId(null);
          }}
          selectedNodoId={selectedNodoId}
          onTriggerAlarm={onTriggerAlarm}
        />
      </div>

      {/* 3. Barra Inferior */}
      <FooterBar
        onSync={() => alert('Sincronización local completada.')}
      />
    </div>
  );
}
