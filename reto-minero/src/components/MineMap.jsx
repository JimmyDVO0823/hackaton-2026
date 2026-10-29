import React, { useState, useRef, useCallback, useEffect } from 'react';

/** Prioridad de nivel para calcular el peor estado de un nivel de galería */
const PRIORIDAD = { NORMAL: 0, SIN_SEÑAL: 1, PRECAUCION: 2, ALARMA: 3, EVACUACION: 4 };

/** Paleta semafórica por nivel evaluado */
const PALETA = {
  NORMAL:     { border: '#4A7A5B', text: '#6DAA81',  bg: 'rgba(74,122,91,0.12)',  badge: 'rgba(74,122,91,0.18)',  icon: 'check_circle'       },
  PRECAUCION: { border: '#A38A3A', text: '#C2A855',  bg: 'rgba(163,138,58,0.12)', badge: 'rgba(163,138,58,0.18)', icon: 'warning_amber'       },
  ALARMA:     { border: '#B2533E', text: '#D87661',  bg: 'rgba(178,83,62,0.12)',  badge: 'rgba(178,83,62,0.18)',  icon: 'report'              },
  EVACUACION: { border: '#8B3232', text: '#D97575',  bg: 'rgba(139,50,50,0.18)',  badge: 'rgba(139,50,50,0.25)',  icon: 'sos'                 },
  SIN_SEÑAL:  { border: '#5A606E', text: '#9DA3B2',  bg: 'rgba(90,96,110,0.10)',  badge: 'rgba(90,96,110,0.15)',  icon: 'signal_disconnected' },
};

function peorNivel(nodos) {
  return nodos.reduce((peor, n) => {
    const nivel = n.evaluacion?.nivel ?? 'NORMAL';
    return PRIORIDAD[nivel] > PRIORIDAD[peor] ? nivel : peor;
  }, 'NORMAL');
}

const BASE_WIDTH = 960;
const BASE_HEIGHT = 540;
const MIN_ZOOM = 0.4;
const MAX_ZOOM = 3.0;
const ZOOM_STEP = 0.15;

/**
 * Esquema técnico de galerías subterráneas.
 * Funcionalidades:
 * - Filtro por nivel de galería o vista general sin filtros ("Todos").
 * - Zoom con rueda del ratón y botones +/−/reset.
 * - Pan arrastrando el mapa con el ratón.
 * - Pantalla completa estable (mantiene la proporción y alineación de nodos y túneles).
 * - Importar plano DXF (solo selector visual).
 */
export function MineMap({ nodos = [], onSelectNodo, _onFocusCritical, selectedNodoId }) {
  const NIVELES = ['N-1', 'N-2', 'N-3'];

  // ── Filtro de nivel (null = mostrar todos los niveles) ────────────────────────
  const [ahora] = useState(() => Date.now());
  const [activeLevel, setActiveLevel] = useState('N-1');
  const showAll = activeLevel === null;

  const nodosFiltrados = showAll
    ? nodos
    : nodos.filter((n) => n.nivel === activeLevel);

    // ── Zoom / Pan ───────────────────────────────────────────────────────────────
  const [zoom, setZoom]   = useState(1);
  const [pan, setPan]     = useState({ x: 0, y: 0 });
  const dragging          = useRef(false);
  const dragStart         = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const containerRef      = useRef(null);
  const sectionRef        = useRef(null);
  const dxfInputRef       = useRef(null);

  const clampZoom = (z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

  // Ajustar mapa centrado en el contenedor disponible
  const fitToContainer = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const scaleX = (rect.width - 24) / BASE_WIDTH;
    const scaleY = (rect.height - 48) / BASE_HEIGHT;
    const targetScale = clampZoom(Math.min(scaleX, scaleY));

    const centerX = (rect.width - BASE_WIDTH * targetScale) / 2;
    const centerY = (rect.height - BASE_HEIGHT * targetScale) / 2;

    setZoom(targetScale);
    setPan({ x: Math.round(centerX), y: Math.max(0, Math.round(centerY)) });
  }, []);

  // ── Pantalla completa ────────────────────────────────────────────────────────
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onFsChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullscreen(isFs);
      // Re-centrar mapa en el nuevo tamaño tras entrar/salir de fullscreen
      setTimeout(() => fitToContainer(), 100);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, [fitToContainer]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        if (sectionRef.current?.requestFullscreen) {
          await sectionRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Error al alternar pantalla completa:', err);
    }
  }, []);

  // ── Importar DXF (UI solamente) ──────────────────────────────────────────────
  const [dxfFileName, setDxfFileName] = useState(null);

  const handleDxfChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDxfFileName(file.name);
    e.target.value = '';
  }, []);

  // ── Zoom con rueda del ratón ─────────────────────────────────────────────────
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setZoom((prevZoom) => {
      const delta    = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
      const nextZoom = clampZoom(prevZoom + delta);
      const scale    = nextZoom / prevZoom;
      setPan((prevPan) => ({
        x: mouseX - scale * (mouseX - prevPan.x),
        y: mouseY - scale * (mouseY - prevPan.y),
      }));
      return nextZoom;
    });
  }, []);

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    dragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    if (containerRef.current) containerRef.current.style.cursor = 'grabbing';
  }, [pan]);

  const handleMouseMove = useCallback((e) => {
    if (!dragging.current) return;
    setPan({
      x: dragStart.current.panX + (e.clientX - dragStart.current.x),
      y: dragStart.current.panY + (e.clientY - dragStart.current.y),
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    dragging.current = false;
    if (containerRef.current) containerRef.current.style.cursor = 'grab';
  }, []);

  const handleZoomIn    = () => setZoom((z) => clampZoom(z + ZOOM_STEP * 2));
  const handleZoomOut   = () => setZoom((z) => clampZoom(z - ZOOM_STEP * 2));
  const handleZoomReset = () => fitToContainer();

  return (
    <section
      ref={sectionRef}
      className={`lg:col-span-7 flex flex-col bg-surface-container rounded border border-[#2D3239] p-space-md gap-space-md ${
        isFullscreen
          ? 'fixed inset-0 z-[9999] w-screen h-screen rounded-none border-0 p-4 bg-[#14161a] overflow-hidden'
          : ''
      }`}
    >
      {/* ── Encabezado ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-space-sm bg-surface-container-low p-2.5 rounded border border-[#2D3239] shrink-0">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-[#C29B38] text-[24px]">hub</span>
          <div className="flex flex-col">
            <h2 className="font-headline-md text-[18px] text-on-surface leading-tight font-semibold">
              Esquema de Galerías Subterráneas
            </h2>
            <span className="font-code-badge text-[11px] text-secondary">
              PROYECCIÓN TÉCNICA OPERATIVA · DEC. 1886 DE 2015
              {dxfFileName && (
                <span className="ml-2 text-[#C29B38]">· DXF: {dxfFileName}</span>
              )}
            </span>
          </div>
        </div>

        {/* ── Controles de cabecera ─────────────────────────────────────────── */}
        <div className="flex items-center gap-2 flex-wrap">

          {/* Importar DXF (solo UI) */}
          <input
            ref={dxfInputRef}
            type="file"
            accept=".dxf"
            className="hidden"
            onChange={handleDxfChange}
          />
          <button
            type="button"
            onClick={() => dxfInputRef.current?.click()}
            title="Importar plano en formato DXF"
            className="min-h-[42px] px-3 bg-surface-container-high text-secondary hover:text-on-surface rounded flex items-center gap-1.5 font-action-label text-[13px] uppercase border border-[#2D3239] transition-colors active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[20px]">upload_file</span>
            <span>Importar DXF</span>
          </button>

          {/* Pantalla completa */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            className="min-h-[42px] px-3 bg-surface-container-high text-secondary hover:text-on-surface rounded flex items-center gap-1.5 font-action-label text-[13px] uppercase border border-[#2D3239] transition-colors active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
            </span>
            <span>{isFullscreen ? 'Salir' : 'Pantalla Completa'}</span>
          </button>

          {/* Selectores de nivel + opción "Todos" */}
          <div className="flex items-center bg-surface-container-lowest p-1 rounded border border-[#2D3239]">
            <button
              type="button"
              onClick={() => setActiveLevel(null)}
              className={`min-h-[42px] px-3 font-code-badge text-[12px] rounded transition-colors flex items-center gap-1.5 ${
                showAll
                  ? 'bg-surface-container-high text-on-surface font-semibold border border-[#2D3239]'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">layers</span>
              Todos
            </button>

            {NIVELES.map((lvl) => {
              const nodosDelNivel = nodos.filter((n) => n.nivel === lvl);
              const peor  = peorNivel(nodosDelNivel);
              const color = PALETA[peor]?.border ?? '#4A7A5B';
              const isActive = activeLevel === lvl;
              const etiqueta = lvl === 'N-1' ? 'Nivel 1' : lvl === 'N-2' ? 'Nivel 2' : 'Nivel 3';
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setActiveLevel(lvl)}
                  className={`min-h-[42px] px-3 font-code-badge text-[12px] rounded transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-surface-container-high text-on-surface font-semibold border border-[#2D3239]'
                      : 'text-secondary hover:text-on-surface'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  {etiqueta}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Canvas Blueprint con Zoom / Pan ─────────────────────────────────── */}
      <div className="flex flex-col gap-1 flex-1 min-h-0">
        {/* Barra de zoom */}
        <div className="flex items-center justify-end gap-1 shrink-0">
          <span className="font-code-badge text-[10px] text-secondary mr-1">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomOut}
            title="Alejar"
            className="w-8 h-8 flex items-center justify-center bg-surface-container-high hover:bg-surface-variant rounded border border-[#2D3239] text-secondary hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">remove</span>
          </button>
          <button
            type="button"
            onClick={handleZoomReset}
            title="Restablecer vista centrada"
            className="w-8 h-8 flex items-center justify-center bg-surface-container-high hover:bg-surface-variant rounded border border-[#2D3239] text-secondary hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">fit_screen</span>
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            title="Acercar"
            className="w-8 h-8 flex items-center justify-center bg-surface-container-high hover:bg-surface-variant rounded border border-[#2D3239] text-secondary hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
          </button>
        </div>

        {/* Área del mapa interactivo */}
        <div
          ref={containerRef}
          className={`relative w-full rounded overflow-hidden border border-[#2D3239] select-none ${
            isFullscreen ? 'flex-1 h-full min-h-0' : 'h-[540px]'
          }`}
          style={{ backgroundColor: '#14161a', cursor: 'grab' }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Contenedor del mundo (coordenadas unificadas fijas 960x540) */}
          <div
            className="absolute"
            style={{
              width: `${BASE_WIDTH}px`,
              height: `${BASE_HEIGHT}px`,
              left: 0,
              top: 0,
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              willChange: 'transform',
            }}
          >
            {/* SVG estructural del plano subterráneo */}
            <svg
              className="absolute inset-0 pointer-events-none"
              width={BASE_WIDTH}
              height={BASE_HEIGHT}
              viewBox={`0 0 ${BASE_WIDTH} ${BASE_HEIGHT}`}
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern height="40" id="grid-minemap" patternUnits="userSpaceOnUse" width="40">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1d2026" strokeWidth="1" />
                  <path d="M 20 0 L 20 40 M 0 20 L 40 20" fill="none" stroke="#181a1f" strokeWidth="0.5" />
                </pattern>
                <marker id="arrow-fresco" markerHeight="6" markerWidth="6" orient="auto-start-reverse" refX="5" refY="5" viewBox="0 0 10 10">
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#4A7A5B" />
                </marker>
                <marker id="arrow-viciado" markerHeight="6" markerWidth="6" orient="auto-start-reverse" refX="5" refY="5" viewBox="0 0 10 10">
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#B2533E" />
                </marker>
              </defs>
              <rect fill="url(#grid-minemap)" height="100%" width="100%" />

              {/* Túneles principales */}
              <path d="M 80 110 L 320 110 L 320 280 L 580 280" fill="none" stroke="#252932" strokeLinecap="square" strokeWidth="26" />
              <path d="M 80 110 L 320 110 L 320 280 L 580 280" fill="none" stroke="#1c2320" strokeLinecap="square" strokeWidth="10" />
              {/* Flujo fresco */}
              <path d="M 100 110 L 260 110" fill="none" markerEnd="url(#arrow-fresco)" stroke="#4A7A5B" strokeDasharray="6,4" strokeWidth="2" />
              <path d="M 320 160 L 320 240" fill="none" markerEnd="url(#arrow-fresco)" stroke="#4A7A5B" strokeDasharray="6,4" strokeWidth="2" />
              <path d="M 360 280 L 500 280" fill="none" markerEnd="url(#arrow-fresco)" stroke="#4A7A5B" strokeDasharray="6,4" strokeWidth="2" />
              {/* Galería central */}
              <path d="M 320 280 L 320 460 L 150 460" fill="none" stroke="#252932" strokeLinecap="square" strokeWidth="24" />
              <path d="M 320 280 L 320 460 L 150 460" fill="none" stroke="#1c2025" strokeWidth="8" />
              {/* Diagonal frente */}
              <path d="M 580 280 L 720 180" fill="none" stroke="#252932" strokeLinecap="square" strokeWidth="24" />
              <path d="M 580 280 L 720 180" fill="none" stroke="#25231c" strokeWidth="8" />
              {/* Retorno viciado */}
              <path d="M 720 180 L 720 390 L 530 390 L 530 490" fill="none" stroke="#252932" strokeLinecap="square" strokeWidth="22" />
              <path d="M 720 180 L 720 390 L 530 390 L 530 490" fill="none" stroke="#261d1b" strokeWidth="6" />
              <path d="M 720 240 L 720 340" fill="none" markerEnd="url(#arrow-viciado)" stroke="#B2533E" strokeDasharray="6,4" strokeWidth="2" />
              <path d="M 680 390 L 570 390" fill="none" markerEnd="url(#arrow-viciado)" stroke="#B2533E" strokeDasharray="6,4" strokeWidth="2" />
              {/* Rosa náutica */}
              <g transform="translate(24, 24)">
                <circle cx="16" cy="16" fill="#181a1f" r="14" stroke="#2D3239" strokeWidth="1.5" />
                <path d="M 16 6 L 20 18 L 16 15 L 12 18 Z" fill="#9da3b2" />
                <text fill="#a6abb8" fontFamily="JetBrains Mono" fontSize="8" fontWeight="bold" textAnchor="middle" x="16" y="27">NM</text>
              </g>
            </svg>

            {/* Mensaje vacío */}
            {nodosFiltrados.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-code-badge text-[13px] text-secondary bg-surface-container/80 px-4 py-2 rounded border border-[#2D3239]">
                  Sin nodos {showAll ? 'disponibles' : `en ${activeLevel}`}
                </span>
              </div>
            )}

            {/* Marcadores de nodos sobre el plano */}
            {nodosFiltrados.map((nodo) => {
              const nivel      = nodo.evaluacion?.nivel ?? 'NORMAL';
              const p          = PALETA[nivel];
              const isSelected = selectedNodoId === nodo.id;
              const tiempoMin  = Math.round((ahora - new Date(nodo.lectura?.fecha ?? 0).getTime()) / 60000);
              const ch4        = nodo.lectura?.ch4?.toFixed(1) ?? '--';

              return (
                <div
                  key={nodo.id}
                  className="absolute z-20"
                  style={nodo.mapCoords}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => onSelectNodo(nodo.id)}
                    className="flex flex-col min-h-[60px] min-w-[196px] p-2.5 backdrop-blur-sm rounded text-left border transition-all active:scale-95 shadow-md"
                    style={{
                      backgroundColor: isSelected ? p.bg : 'rgba(24,26,31,0.95)',
                      borderColor: p.border,
                      borderLeftWidth: '3px',
                      outline: isSelected ? `2px solid ${p.border}` : 'none',
                      outlineOffset: '2px',
                      boxShadow: isSelected
                        ? `0 0 0 3px ${p.border}55, 0 4px 16px ${p.border}44`
                        : undefined,
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-action-label text-[12px] uppercase font-semibold leading-tight" style={{ color: p.text }}>
                        {nodo.nombre}
                      </span>
                      <span className="material-symbols-outlined text-[18px] shrink-0" style={{ color: p.text }}>
                        {p.icon}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-1 gap-2">
                      <span className="font-code-badge text-[12px] font-bold" style={{ color: p.text }}>
                        CH₄: {ch4}%
                      </span>
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-code-badge font-bold uppercase"
                        style={{ backgroundColor: p.badge, color: p.text, border: `1px solid ${p.border}` }}
                      >
                        {nivel === 'SIN_SEÑAL' ? 'SIN SEÑAL' : nivel}
                      </span>
                    </div>

                    <div className="font-code-badge text-[10px] mt-1" style={{ color: '#6B7280' }}>
                      {tiempoMin < 60 ? `Hace ${tiempoMin} min` : 'Hace +1h'} · {nodo.nivel}
                    </div>

                    {nodo.alarmaLocalActiva && (
                      <span className="mt-1 font-code-badge text-[9px] font-bold text-white bg-[#B2533E] px-1.5 py-0.5 rounded animate-pulse self-start">
                        SIRENA LOCAL ACTIVA
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* ── Leyenda (fija, fuera del transform) ──────────────────────── */}
          <div className="absolute bottom-0 left-0 right-0 flex flex-wrap items-center justify-between px-space-md py-2 bg-surface-container-lowest border-t border-[#2D3239] z-30">
            <div className="flex items-center gap-space-md flex-wrap">
              <span className="font-code-badge text-[11px] text-secondary uppercase font-semibold">Semáforo:</span>
              {Object.entries(PALETA).map(([nivel, p]) => (
                <div key={nivel} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: p.border }} />
                  <span className="font-code-badge text-[11px] text-secondary">
                    {nivel === 'SIN_SEÑAL' ? 'Sin señal' : nivel.charAt(0) + nivel.slice(1).toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1 text-secondary font-code-badge text-[11px]">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              <span>Art. 53 · Dec. 1886/2015</span>
            </div>
          </div>

          {/* ── Hint de navegación ───────────────────────────────────────── */}
          <div className="absolute top-2 right-2 z-30 flex items-center gap-1 px-2 py-1 bg-surface-container-lowest/80 rounded border border-[#2D3239]">
            <span className="material-symbols-outlined text-[13px] text-secondary">pan_tool</span>
            <span className="font-code-badge text-[10px] text-secondary">Arrastra · Rueda para zoom</span>
          </div>

          {/* ── Toast DXF cargado ─────────────────────────────────────────── */}
          {dxfFileName && (
            <div className="absolute top-2 left-2 z-30 flex items-center gap-1.5 px-2.5 py-1.5 bg-surface-container-low border border-[#2D3239] rounded shadow">
              <span className="material-symbols-outlined text-[15px] text-[#C29B38]">draft</span>
              <span className="font-code-badge text-[10px] text-secondary">DXF: {dxfFileName}</span>
              <button
                type="button"
                onClick={() => setDxfFileName(null)}
                className="ml-1 text-secondary hover:text-on-surface"
                title="Quitar"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
