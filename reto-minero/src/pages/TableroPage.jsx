import React, { useState, useCallback } from 'react';
import { KpiSummary } from '../components/KpiSummary';
import { MineMap } from '../components/MineMap';
import { SectorList } from '../components/SectorList';
import { FooterBar } from '../layout/FooterBar';
import { useNodos } from '../hooks/useNodos';
import { useAlertasContext } from '../context/AlertasContext.jsx';

/**
 * Pantalla Principal: Tablero de Monitoreo Atmosférico.
 * REGLA: pages/ contiene las pantallas del flujo de usuario.
 * Obtiene los nodos con evaluación calculada desde useNodos y gestiona el audio de turno.
 */
export function TableroPage({
  onTriggerAlarm,
  bocinasActivas: bocinasActivasProp,
  onToggleBocina: onToggleBocinaProp,
  bocinaGlobalActiva: bocinaGlobalActivaProp,
  onBocinaGlobal: onBocinaGlobalProp,
  onVerHistorial,
  onAbrirIniciarTurno,
}) {
  const { nodos } = useNodos();
  const { audioHabilitado, habilitarAudio } = useAlertasContext();
  const handleIniciarTurno = onAbrirIniciarTurno || habilitarAudio;

  const [activeFilter, setActiveFilter]     = useState(null);
  const [searchTerm, setSearchTerm]         = useState('');
  const [selectedNodoId, setSelectedNodoId] = useState(null);

  // ── Bocinas sincronizadas (usa props o fallback local) ──────────────────────
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

  // ── Selección de nodo ───────────────────────────────────────────────────────
  const handleSelectNodo = useCallback((nodoId) => {
    setSelectedNodoId(nodoId);
    const cardEl = document.getElementById(`card-${nodoId}`);
    if (cardEl) cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  /** Filtra por KPI activo (nivel de evaluación) y por texto de búsqueda.
   *  El filtro "ALARMA" captura también EVACUACION. */
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
      {/* ── Aviso visible: Iniciar turno / activar sonido si el audio está inactivo ── */}
      {!audioHabilitado && (
        <section
          aria-label="Aviso de activación de sonido de turno"
          className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#2A261A] border-2 border-[#A38A3A] rounded-lg shadow-lg animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#A38A3A]/20 border border-[#A38A3A]/50 flex items-center justify-center shrink-0 text-[#C2A855]">
              <span className="material-symbols-outlined text-[24px]">volume_off</span>
            </div>
            <div>
              <h3 className="font-action-label text-[14px] font-bold text-[#E2E8F0] uppercase tracking-wide">
                Sonido del tablero desactivado
              </h3>
              <p className="font-code-badge text-[12px] text-[#C2A855]">
                Obligatorio para recibir alertas audibles de CH₄ según protocolo de turno.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleIniciarTurno}
            className="min-h-[44px] px-5 bg-[#C2A855] hover:bg-[#d6bc68] text-black font-action-label text-[13px] uppercase font-black rounded transition-all shadow-md active:scale-98 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
            <span>Iniciar turno / Asignar supervisor</span>
          </button>
        </section>
      )}

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
          onVerHistorial={onVerHistorial}
        />
      </div>

      {/* 3. Barra inferior */}
      <FooterBar />
    </div>
  );
}
