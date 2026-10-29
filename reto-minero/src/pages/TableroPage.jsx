import React, { useState, useCallback } from 'react';
import { KpiSummary } from '../components/KpiSummary';
import { MineMap } from '../components/MineMap';
import { SectorList } from '../components/SectorList';
import { FooterBar } from '../layout/FooterBar';
import { useNodos } from '../hooks/useNodos';

/**
 * Pantalla Principal: Tablero de Monitoreo Atmosférico.
 * REGLA: pages/ contiene las pantallas del flujo de usuario.
 * Obtiene los nodos con evaluación calculada desde useNodos.
 */
export function TableroPage({
  onTriggerAlarm,
  bocinasActivas: bocinasActivasProp,
  onToggleBocina: onToggleBocinaProp,
  bocinaGlobalActiva: bocinaGlobalActivaProp,
  onBocinaGlobal: onBocinaGlobalProp,
}) {
  const { nodos } = useNodos();

  const [activeFilter, setActiveFilter]     = useState(null);
  const [searchTerm, setSearchTerm]         = useState('');
  const [selectedNodoId, setSelectedNodoId] = useState(null);

  // ── Bocinas sincronizadas (usa props o fallback local) ────────────────────────
  const [bocinasActivasLocal, setBocinasActivasLocal] = useState({});
  const [bocinaGlobalActivaLocal, setBocinaGlobalActivaLocal] = useState(false);

  const bocinasActivas = bocinasActivasProp ?? bocinasActivasLocal;
  const bocinaGlobalActiva = bocinaGlobalActivaProp ?? bocinaGlobalActivaLocal;

  const handleToggleBocina = onToggleBocinaProp ?? ((nodoId) => {
    setBocinasActivasLocal((prev) => ({ ...prev, [nodoId]: !prev[nodoId] }));
  });

  const handleBocinaGlobal = onBocinaGlobalProp ?? (() => {
    setBocinaGlobalActivaLocal((prev) => {
      const next = !prev;
      if (!next) setBocinasActivasLocal({});
      return next;
    });
  });

  // ── Selección de nodo ────────────────────────────────────────────────────────
  const handleSelectNodo = useCallback((nodoId) => {
    setSelectedNodoId(nodoId);
    // Scroll a la tarjeta en la lista
    const cardEl = document.getElementById(`card-${nodoId}`);
    if (cardEl) cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  /** Filtra por KPI activo (nivel de evaluación) y por texto de búsqueda.
   *  El filtro «ALARMA» captura también EVACUACION. */
  const nodosFiltrados = nodos.filter((nodo) => {
    const nivel = nodo.evaluacion?.nivel ?? 'NORMAL';
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

      {/* 2. Mapa + Lista */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md items-start">
        <MineMap
          nodos={nodos}
          onSelectNodo={handleSelectNodo}
          onFocusCritical={() => {
            const critico = nodos.find(
              n => n.evaluacion?.nivel === 'ALARMA' || n.evaluacion?.nivel === 'EVACUACION'
            );
            if (critico) handleSelectNodo(critico.id);
          }}
          selectedNodoId={selectedNodoId}
        />

        <SectorList
          nodos={nodosFiltrados}
          todosLosNodos={nodos}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onResetFilters={() => {
            setActiveFilter(null);
            setSearchTerm('');
            setSelectedNodoId(null);
          }}
          selectedNodoId={selectedNodoId}
          onSelectNodo={handleSelectNodo}
          onTriggerAlarm={onTriggerAlarm}
          bocinasActivas={bocinasActivas}
          onToggleBocina={handleToggleBocina}
          bocinaGlobalActiva={bocinaGlobalActiva}
          onBocinaGlobal={handleBocinaGlobal}
        />
      </div>

      {/* 3. Barra inferior */}
      <FooterBar />
    </div>
  );
}
