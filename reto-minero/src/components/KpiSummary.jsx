import React from 'react';

/**
 * Resumen KPI superior: conteo de nodos por nivel de evaluación normativa.
 * REGLA: Solo recibe nodos con evaluacion calculada; nunca estados escritos a mano.
 */
export function KpiSummary({ nodos = [], activeFilter = null, onFilterSelect }) {
  const normalCount    = nodos.filter(n => n.evaluacion?.nivel === 'NORMAL').length;
  const precCount      = nodos.filter(n => n.evaluacion?.nivel === 'PRECAUCION').length;
  const alarmaCount    = nodos.filter(n =>
    n.evaluacion?.nivel === 'ALARMA' || n.evaluacion?.nivel === 'EVACUACION'
  ).length;
  const sinSenalCount  = nodos.filter(n => n.evaluacion?.nivel === 'SIN_SEÑAL').length;

  const handleToggle = (nivel) => {
    onFilterSelect(activeFilter === nivel ? null : nivel);
  };

  return (
    <section aria-label="Resumen de Estados de Nodos" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
      {/* 1. NORMAL */}
      <button
        type="button"
        onClick={() => handleToggle('NORMAL')}
        className={`group flex items-center justify-between min-h-[72px] p-3.5 bg-surface-container rounded border border-[#2D3239] border-l-4 border-l-[#4A7A5B] text-left transition-all active:scale-[0.99] hover:bg-surface-container-high ${
          activeFilter === 'NORMAL' ? 'ring-2 ring-[#4A7A5B] bg-surface-container-high' : ''
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#4A7A5B]/15 border border-[#4A7A5B]/40 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px] text-[#6DAA81]">check_circle</span>
          </div>
          <div className="flex flex-col">
            <span className="font-code-badge text-[11px] text-secondary uppercase tracking-wider">ATMÓSFERA</span>
            <span className="font-action-label text-[16px] font-bold text-on-surface">NORMAL</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-telemetry-value-lg text-[32px] font-bold leading-none text-[#6DAA81]">
            {String(normalCount).padStart(2, '0')}
          </span>
          <span className="font-code-badge text-[11px] text-secondary">NODOS</span>
        </div>
      </button>

      {/* 2. PRECAUCIÓN */}
      <button
        type="button"
        onClick={() => handleToggle('PRECAUCION')}
        className={`group flex items-center justify-between min-h-[72px] p-3.5 bg-surface-container rounded border border-[#2D3239] border-l-4 border-l-[#A38A3A] text-left transition-all active:scale-[0.99] hover:bg-surface-container-high ${
          activeFilter === 'PRECAUCION' ? 'ring-2 ring-[#A38A3A] bg-surface-container-high' : ''
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#A38A3A]/15 border border-[#A38A3A]/40 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px] text-[#C2A855]">warning_amber</span>
          </div>
          <div className="flex flex-col">
            <span className="font-code-badge text-[11px] text-secondary uppercase tracking-wider">GAS ELEVADO</span>
            <span className="font-action-label text-[16px] font-bold text-on-surface">PRECAUCIÓN</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-telemetry-value-lg text-[32px] font-bold leading-none text-[#C2A855]">
            {String(precCount).padStart(2, '0')}
          </span>
          <span className="font-code-badge text-[11px] text-secondary">NODOS</span>
        </div>
      </button>

      {/* 3. ALARMA / EVACUACIÓN */}
      <button
        type="button"
        onClick={() => handleToggle('ALARMA')}
        className={`group flex items-center justify-between min-h-[72px] p-3.5 bg-surface-container rounded border border-[#2D3239] border-l-4 border-l-[#B2533E] text-left transition-all active:scale-[0.99] hover:bg-surface-container-high ${
          activeFilter === 'ALARMA' ? 'ring-2 ring-[#B2533E] bg-surface-container-high' : ''
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#B2533E]/15 border border-[#B2533E]/40 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px] text-[#D87661]">report</span>
          </div>
          <div className="flex flex-col">
            <span className="font-code-badge text-[11px] text-[#D87661] uppercase tracking-wider">INTERRUPCIÓN</span>
            <span className="font-action-label text-[16px] font-bold text-on-surface">ALARMA / EVAC.</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-telemetry-value-lg text-[32px] font-bold leading-none text-[#D87661]">
            {String(alarmaCount).padStart(2, '0')}
          </span>
          <span className="font-code-badge text-[11px] text-secondary">NODOS</span>
        </div>
      </button>

      {/* 4. SIN SEÑAL */}
      <button
        type="button"
        onClick={() => handleToggle('SIN_SEÑAL')}
        className={`group flex items-center justify-between min-h-[72px] p-3.5 bg-surface-container rounded border border-[#2D3239] border-l-4 border-l-[#7A7F8C] text-left transition-all active:scale-[0.99] hover:bg-surface-container-high ${
          activeFilter === 'SIN_SEÑAL' ? 'ring-2 ring-[#7A7F8C] bg-surface-container-high' : ''
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-surface-container-highest border border-[#2D3239] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px] text-secondary">signal_disconnected</span>
          </div>
          <div className="flex flex-col">
            <span className="font-code-badge text-[11px] text-secondary uppercase tracking-wider">TELEMETRÍA</span>
            <span className="font-action-label text-[16px] font-bold text-on-surface">SIN SEÑAL</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-telemetry-value-lg text-[32px] font-bold leading-none text-secondary">
            {String(sinSenalCount).padStart(2, '0')}
          </span>
          <span className="font-code-badge text-[11px] text-secondary">NODOS</span>
        </div>
      </button>
    </section>
  );
}
