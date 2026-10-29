import React, { useState } from 'react';

/**
 * Colores semafóricos para cada nivel de evaluación normativa.
 */
const COLOR_NIVEL = {
  NORMAL:     { border: 'border-l-[#4A7A5B]', badge: 'bg-[#4A7A5B]/20 text-[#6DAA81] border-[#4A7A5B]/30', icon: 'check_circle',         iconColor: 'text-[#6DAA81]' },
  PRECAUCION: { border: 'border-l-[#A38A3A]', badge: 'bg-[#A38A3A]/20 text-[#C2A855] border-[#A38A3A]/40', icon: 'warning_amber',        iconColor: 'text-[#C2A855]' },
  ALARMA:     { border: 'border-l-[#B2533E]', badge: 'bg-[#B2533E]/20 text-[#D87661] border-[#B2533E]/40', icon: 'report',               iconColor: 'text-[#D87661]' },
  EVACUACION: { border: 'border-l-[#8B3232]', badge: 'bg-[#8B3232]/25 text-[#D97575] border-[#8B3232]',   icon: 'sos',                  iconColor: 'text-[#D97575]' },
  SIN_SEÑAL:  { border: 'border-dashed border-[#5A606E]', badge: 'bg-surface-container-highest text-secondary border-[#2D3239]', icon: 'signal_disconnected', iconColor: 'text-secondary' },
};

function nivelColor(nivel) {
  return COLOR_NIVEL[nivel] ?? COLOR_NIVEL.NORMAL;
}

/**
 * Esquema técnico de galerías subterráneas (Blueprint vector interactivo).
 * Recibe nodos evaluados y los usa para colorear los marcadores del mapa.
 */
export function MineMap({ nodos = [], onSelectNodo, onFocusCritical, selectedNodoId }) {
  const [activeLevel, setActiveLevel] = useState('N-2');

  const levels = [
    { id: 'N-2', label: 'N-2 (-420m)' },
    { id: 'N-1', label: 'N-1 (-310m)' },
    { id: 'N-3', label: 'N-3 (-540m)' },
  ];

  /** Busca un nodo por ID para obtener su nivel evaluado */
  const getNivel = (id) => {
    const n = nodos.find(nd => nd.id === id);
    return n?.evaluacion?.nivel ?? 'NORMAL';
  };

  /** Renderiza un marcador de nodo sobre el mapa */
  const Marker = ({ id, label, sublabel, style, extra }) => {
    const nivel = getNivel(id);
    const { border, badge, icon, iconColor } = nivelColor(nivel);
    const isSelected = selectedNodoId === id;
    return (
      <div className="absolute z-20" style={style}>
        <button
          type="button"
          onClick={() => onSelectNodo(id)}
          className={`flex flex-col min-h-[56px] min-w-[200px] p-2.5 bg-surface-container-high/95 backdrop-blur-sm rounded text-left border border-[#2D3239] border-l-2 ${border} hover:bg-surface-variant active:scale-95 transition-all shadow-sm ${
            isSelected ? 'ring-2 ring-[#C29B38]' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-action-label text-[13px] text-on-surface uppercase font-semibold leading-tight">
              {label}
            </span>
            <span className={`material-symbols-outlined text-[18px] ${iconColor}`}>{icon}</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="font-code-badge text-[11px] text-secondary">{sublabel}</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-code-badge font-bold border ${badge} uppercase`}>
              {nivel.replace('_', ' ')}
            </span>
          </div>
          {extra && <div className="font-code-badge text-[11px] text-secondary mt-0.5">{extra}</div>}
        </button>
      </div>
    );
  };

  return (
    <section className="lg:col-span-7 flex flex-col bg-surface-container rounded border border-[#2D3239] p-space-md gap-space-md">
      {/* Controles de encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-space-sm pb-space-xs bg-surface-container-low p-2.5 rounded border border-[#2D3239]">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-[#C29B38] text-[24px]">hub</span>
          <div className="flex flex-col">
            <h2 className="font-headline-md text-[18px] text-on-surface leading-tight font-semibold">
              Esquema de Galerías Subterráneas
            </h2>
            <span className="font-code-badge text-[11px] text-secondary">
              PROYECCIÓN TÉCNICA OPERATIVA · COTA -420M
            </span>
          </div>
        </div>

        <div className="flex items-center gap-space-sm">
          <button
            type="button"
            onClick={onFocusCritical}
            className="min-h-[48px] px-3 bg-surface-container-high text-secondary hover:text-on-surface rounded flex items-center gap-1.5 font-action-label text-[13px] uppercase border border-[#2D3239] transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[#C29B38] text-[20px]">filter_center_focus</span>
            <span>Centrar Críticos</span>
          </button>
          <div className="flex items-center bg-surface-container-lowest p-1 rounded border border-[#2D3239]">
            {levels.map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setActiveLevel(lvl.id)}
                className={`min-h-[42px] px-2.5 font-code-badge text-[12px] rounded transition-colors ${
                  activeLevel === lvl.id
                    ? 'bg-surface-container-high text-on-surface font-semibold border border-[#2D3239]'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas Blueprint Minero */}
      <div
        className="relative w-full h-[540px] rounded overflow-hidden flex flex-col justify-between border border-[#2D3239]"
        style={{ backgroundColor: '#14161a' }}
      >
        {/* SVG estructural */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern height="40" id="grid-pattern-react" patternUnits="userSpaceOnUse" width="40">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1d2026" strokeWidth="1" />
              <path d="M 20 0 L 20 40 M 0 20 L 40 20" fill="none" stroke="#181a1f" strokeWidth="0.5" />
            </pattern>
            <marker id="arrow-fresco-react" markerHeight="6" markerWidth="6" orient="auto-start-reverse" refX="5" refY="5" viewBox="0 0 10 10">
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#4A7A5B" />
            </marker>
            <marker id="arrow-viciado-react" markerHeight="6" markerWidth="6" orient="auto-start-reverse" refX="5" refY="5" viewBox="0 0 10 10">
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#B2533E" />
            </marker>
          </defs>
          <rect fill="url(#grid-pattern-react)" height="100%" width="100%" />

          {/* Líneas estructurales de túneles */}
          <path d="M 80 110 L 320 110 L 320 280 L 580 280" fill="none" stroke="#252932" strokeLinecap="square" strokeWidth="26" />
          <path d="M 80 110 L 320 110 L 320 280 L 580 280" fill="none" stroke="#1c2320" strokeLinecap="square" strokeWidth="10" />

          {/* Flujo de ventilación fresco */}
          <path d="M 100 110 L 260 110" fill="none" markerEnd="url(#arrow-fresco-react)" stroke="#4A7A5B" strokeDasharray="6,4" strokeWidth="2" />
          <path d="M 320 160 L 320 240" fill="none" markerEnd="url(#arrow-fresco-react)" stroke="#4A7A5B" strokeDasharray="6,4" strokeWidth="2" />
          <path d="M 360 280 L 500 280" fill="none" markerEnd="url(#arrow-fresco-react)" stroke="#4A7A5B" strokeDasharray="6,4" strokeWidth="2" />

          {/* Galería Central */}
          <path d="M 320 280 L 320 460 L 150 460" fill="none" stroke="#252932" strokeLinecap="square" strokeWidth="24" />
          <path d="M 320 280 L 320 460 L 150 460" fill="none" stroke="#1c2025" strokeWidth="8" />

          {/* Diagonal Frente 1 */}
          <path d="M 580 280 L 720 180" fill="none" stroke="#252932" strokeLinecap="square" strokeWidth="24" />
          <path d="M 580 280 L 720 180" fill="none" stroke="#25231c" strokeWidth="8" />

          {/* Retorno de aire viciado */}
          <path d="M 720 180 L 720 390 L 530 390 L 530 490" fill="none" stroke="#252932" strokeLinecap="square" strokeWidth="22" />
          <path d="M 720 180 L 720 390 L 530 390 L 530 490" fill="none" stroke="#261d1b" strokeWidth="6" />

          {/* Flechas retorno viciado */}
          <path d="M 720 240 L 720 340" fill="none" markerEnd="url(#arrow-viciado-react)" stroke="#B2533E" strokeDasharray="6,4" strokeWidth="2" />
          <path d="M 680 390 L 570 390" fill="none" markerEnd="url(#arrow-viciado-react)" stroke="#B2533E" strokeDasharray="6,4" strokeWidth="2" />

          {/* Rosa náutica minera */}
          <g transform="translate(24, 24)">
            <circle cx="16" cy="16" fill="#181a1f" r="14" stroke="#2D3239" strokeWidth="1.5" />
            <path d="M 16 6 L 20 18 L 16 15 L 12 18 Z" fill="#9da3b2" />
            <text fill="#a6abb8" fontFamily="JetBrains Mono" fontSize="8" fontWeight="bold" textAnchor="middle" x="16" y="27">NM</text>
          </g>
        </svg>

        {/* Marcadores interactivos de nodos (IDs de datosEjemplo.js) */}
        <div className="relative w-full h-full p-space-md">
          <Marker
            id="frente-explotacion-1"
            label="Frente Explotación 1"
            sublabel="N-2 · Cota -420m"
            extra="Frente mecanizado"
            style={{ right: 6, top: 112 }}
          />
          <Marker
            id="retorno-tajo"
            label="Retorno de Tajo"
            sublabel="N-2 · Galería retorno"
            style={{ right: 12, bottom: 100 }}
          />
          <Marker
            id="retorno-principal"
            label="Retorno Principal"
            sublabel="N-2 · Canal principal"
            style={{ left: '36%', bottom: 56 }}
          />
          <Marker
            id="frente-avance"
            label="Frente de Avance"
            sublabel="N-3 · Cota -540m"
            style={{ left: 6, top: 64 }}
          />
          <Marker
            id="retorno-preparacion"
            label="Retorno Preparación"
            sublabel="N-1 · Cota -310m"
            style={{ left: '33%', top: 56 }}
          />
          <Marker
            id="frente-explotacion-2"
            label="Frente Explotación 2"
            sublabel="N-1 · Cota -310m"
            style={{ left: 6, bottom: 64 }}
          />
        </div>

        {/* Leyenda técnica normativa */}
        <div className="flex flex-wrap items-center justify-between px-space-md py-2.5 bg-surface-container-lowest z-30 border-t border-[#2D3239]">
          <div className="flex items-center gap-space-md flex-wrap">
            <span className="font-code-badge text-[11px] text-secondary uppercase font-semibold">Semáforo Minero:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#4A7A5B]" />
              <span className="font-code-badge text-[11px] text-secondary">Normal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#A38A3A]" />
              <span className="font-code-badge text-[11px] text-secondary">Precaución</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#B2533E]" />
              <span className="font-code-badge text-[11px] text-secondary">Alarma (Suspender labor)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#8B3232]" />
              <span className="font-code-badge text-[11px] text-[#D97575]">Evacuación</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#5A606E]" />
              <span className="font-code-badge text-[11px] text-secondary">Sin señal</span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs text-secondary font-code-badge text-[11px]">
            <span className="material-symbols-outlined text-[15px] text-[#A6ABB8]">verified</span>
            <span>Dec. 1886 MinMinas Colombia</span>
          </div>
        </div>
      </div>
    </section>
  );
}
