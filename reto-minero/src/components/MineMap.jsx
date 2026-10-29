import React, { useState } from 'react';

/**
 * Esquema técnico de galerías subterráneas (Blueprint vector interactivo)
 */
export function MineMap({ onSelectSector, onFocusCritical, selectedSectorId }) {
  const [activeLevel, setActiveLevel] = useState('N-2');

  const levels = [
    { id: 'N-2', label: 'N-2 (-420m)' },
    { id: 'N-1', label: 'N-1 (-310m)' },
    { id: 'N-3', label: 'N-3 (-540m)' }
  ];

  return (
    <section className="lg:col-span-7 flex flex-col bg-surface-container rounded border border-[#2D3239] p-space-md gap-space-md">
      {/* Controles de encabezado del mapa */}
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

        {/* Selectores táctiles ergonómicos */}
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
      <div className="relative w-full h-[540px] rounded overflow-hidden flex flex-col justify-between border border-[#2D3239]" style={{ backgroundColor: '#14161a' }}>
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Patrón de malla milimétrica */}
            <pattern height="40" id="grid-pattern-react" patternUnits="userSpaceOnUse" width="40">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1d2026" strokeWidth="1" />
              <path d="M 20 0 L 20 40 M 0 20 L 40 20" fill="none" stroke="#181a1f" strokeWidth="0.5" />
            </pattern>
            {/* Marcadores de flechas */}
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

          {/* Conexión Tambor 3 */}
          <path d="M 150 460 L 150 370" fill="none" stroke="#252932" strokeDasharray="6,4" strokeWidth="16" />

          {/* Rosa náutica minera */}
          <g transform="translate(24, 24)">
            <circle cx="16" cy="16" fill="#181a1f" r="14" stroke="#2D3239" strokeWidth="1.5" />
            <path d="M 16 6 L 20 18 L 16 15 L 12 18 Z" fill="#9da3b2" />
            <text fill="#a6abb8" fontFamily="JetBrains Mono" fontSize="8" fontWeight="bold" textAnchor="middle" x="16" y="27">
              NM
            </text>
          </g>
        </svg>

        {/* Sectores táctiles interactivos sobre el mapa */}
        <div className="relative w-full h-full p-space-md">
          {/* 1. Túnel Acceso Principal */}
          <div className="absolute left-6 top-16 z-20">
            <button
              type="button"
              onClick={() => onSelectSector('tunel-acceso')}
              className={`flex flex-col min-h-[52px] min-w-[170px] p-2 bg-surface-container-high/95 backdrop-blur-sm rounded text-left border border-[#2D3239] border-l-2 border-l-[#4A7A5B] hover:bg-surface-variant active:scale-95 transition-all shadow-sm ${
                selectedSectorId === 'tunel-acceso' ? 'ring-2 ring-[#6DAA81]' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-code-badge text-[12px] text-on-surface font-semibold">Túnel Acceso Principal</span>
                <span className="material-symbols-outlined text-[16px] text-[#6DAA81]">check_circle</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="font-code-badge text-[11px] text-secondary">COTA -400M</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-code-badge font-semibold bg-[#4A7A5B]/20 text-[#6DAA81] border border-[#4A7A5B]/30">NORMAL</span>
              </div>
            </button>
          </div>

          {/* 2. Inyección de Aire */}
          <div className="absolute left-[33%] top-14 z-20">
            <button
              type="button"
              onClick={() => onSelectSector('inyeccion-aire')}
              className={`flex flex-col min-h-[52px] min-w-[180px] p-2 bg-surface-container-high/95 backdrop-blur-sm rounded text-left border border-[#2D3239] border-l-2 border-l-[#4A7A5B] hover:bg-surface-variant active:scale-95 transition-all shadow-sm ${
                selectedSectorId === 'inyeccion-aire' ? 'ring-2 ring-[#6DAA81]' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-code-badge text-[12px] text-on-surface font-semibold">Inyección Aire (Nivel 2)</span>
                <span className="material-symbols-outlined text-[16px] text-[#6DAA81]">air</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="font-code-badge text-[11px] text-secondary">Q: 1420 m³/min</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-code-badge font-semibold bg-[#4A7A5B]/20 text-[#6DAA81] border border-[#4A7A5B]/30">ESTABLE</span>
              </div>
            </button>
          </div>

          {/* 3. Frente de Explotación 1 */}
          <div className="absolute right-6 top-28 z-20">
            <button
              type="button"
              onClick={() => onSelectSector('frente-explotacion-1')}
              className={`flex flex-col min-h-[60px] min-w-[210px] p-2.5 bg-surface-container-high/95 backdrop-blur-sm rounded text-left border border-[#2D3239] border-l-2 border-l-[#A38A3A] hover:bg-surface-variant active:scale-95 transition-all shadow-sm ${
                selectedSectorId === 'frente-explotacion-1' ? 'ring-2 ring-[#C2A855]' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-action-label text-[13px] text-on-surface uppercase font-semibold">Frente Explotación 1</span>
                <span className="material-symbols-outlined text-[18px] text-[#C2A855]">warning</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="font-code-badge text-[12px] text-[#C2A855] font-semibold">CH₄: 0.8% Vol</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-action-label font-bold text-[#C2A855] bg-[#A38A3A]/20 border border-[#A38A3A]/40">PRECAUCIÓN</span>
              </div>
              <div className="font-code-badge text-[11px] text-secondary mt-0.5">Cota -425m · Tajo mecanizado</div>
            </button>
          </div>

          {/* 4. Retorno Principal */}
          <div className="absolute right-12 bottom-20 z-30">
            <button
              type="button"
              onClick={() => onSelectSector('retorno-principal')}
              className={`relative flex flex-col min-h-[68px] min-w-[230px] p-2.5 bg-surface-container-highest/95 backdrop-blur-sm rounded text-left border border-[#B2533E]/80 border-l-4 border-l-[#B2533E] active:scale-95 transition-transform shadow-md ${
                selectedSectorId === 'retorno-principal' ? 'ring-2 ring-[#D87661]' : ''
              }`}
            >
              <span className="absolute -top-2.5 right-2 px-1.5 py-0.2 rounded font-code-badge text-[9px] bg-[#B2533E] text-white font-bold uppercase tracking-wider">
                SUSPENDER LABOR
              </span>
              <div className="flex items-center justify-between">
                <span className="font-action-label text-[13px] text-on-surface uppercase font-bold">Retorno Principal</span>
                <span className="material-symbols-outlined text-[20px] text-[#D87661]">dangerous</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="font-telemetry-unit text-[14px] font-bold text-[#D87661]">CO: 30 PPM</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-code-badge font-bold bg-[#B2533E]/20 text-[#D87661] border border-[#B2533E]/40">ALARMA CRÍTICA</span>
              </div>
              <div className="font-code-badge text-[11px] text-[#D87661] mt-0.5">Límite norma: 25 ppm superado</div>
            </button>
          </div>

          {/* 5. Tambor 3 */}
          <div className="absolute left-10 bottom-16 z-20">
            <button
              type="button"
              onClick={() => onSelectSector('tambor-3')}
              className={`flex flex-col min-h-[60px] min-w-[210px] p-2.5 bg-surface-container-high/95 backdrop-blur-sm rounded text-left border border-dashed border-[#5A606E] hover:bg-surface-variant active:scale-95 transition-all shadow-sm ${
                selectedSectorId === 'tambor-3' ? 'ring-2 ring-secondary' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-action-label text-[13px] text-on-surface uppercase font-semibold">Tambor 3 (Pilar Sur)</span>
                <span className="material-symbols-outlined text-secondary text-[18px]">schedule</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="font-code-badge text-[11px] text-secondary">Sin medir: 2h 15m</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-code-badge font-semibold bg-surface-container-highest text-secondary border border-[#2D3239] uppercase">PENDIENTE</span>
              </div>
              <div className="font-code-badge text-[11px] text-[#A38A3A] mt-0.5">Excedió ventana legal de 2h</div>
            </button>
          </div>

          {/* 6. Galería de Transporte */}
          <div className="absolute left-[36%] bottom-14 z-20">
            <button
              type="button"
              onClick={() => onSelectSector('galeria-transporte')}
              className={`flex flex-col min-h-[52px] min-w-[190px] p-2 bg-surface-container-high/95 backdrop-blur-sm rounded text-left border border-[#2D3239] border-l-2 border-l-[#4A7A5B] hover:bg-surface-variant active:scale-95 transition-all shadow-sm ${
                selectedSectorId === 'galeria-transporte' ? 'ring-2 ring-[#6DAA81]' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-code-badge text-[12px] text-on-surface font-semibold">Galería Transporte</span>
                <span className="material-symbols-outlined text-[16px] text-[#6DAA81]">train</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="font-code-badge text-[11px] text-secondary">Coche #4 Operativo</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-code-badge font-semibold bg-[#4A7A5B]/20 text-[#6DAA81] border border-[#4A7A5B]/30">NORMAL</span>
              </div>
            </button>
          </div>
        </div>

        {/* Leyenda técnica normativa */}
        <div className="flex flex-wrap items-center justify-between px-space-md py-2.5 bg-surface-container-lowest z-30 border-t border-[#2D3239]">
          <div className="flex items-center gap-space-md flex-wrap">
            <span className="font-code-badge text-[11px] text-secondary uppercase font-semibold">Semáforo Minero:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#4A7A5B]" />
              <span className="font-code-badge text-[11px] text-secondary">Normal (CH₄ &lt; 0.5% | CO &lt; 25ppm)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#A38A3A]" />
              <span className="font-code-badge text-[11px] text-secondary">Precaución (CH₄ ≥ 0.5%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#B2533E]" />
              <span className="font-code-badge text-[11px] text-secondary">Alarma (Suspender labor)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#8B3232]" />
              <span className="font-code-badge text-[11px] text-[#D97575]">Evacuación (CH₄ &gt; 1.5%)</span>
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

