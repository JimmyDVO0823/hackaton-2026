import React from 'react';

/**
 * Resumen KPI superior de estados de sectores mineros
 */
export function KpiSummary({ sectors = [], activeFilter = null, onFilterSelect }) {
  const normalCount = sectors.filter(s => s.status === 'NORMAL').length;
  const precCount = sectors.filter(s => s.status === 'PRECAUCION').length;
  const alarmaCount = sectors.filter(s => s.status === 'ALARMA').length;
  const pendCount = sectors.filter(s => s.status === 'PENDIENTE').length;

  const handleToggle = (status) => {
    if (activeFilter === status) {
      onFilterSelect(null); // Quitar filtro
    } else {
      onFilterSelect(status);
    }
  };

  return (
    <section aria-label="Resumen de Estados de Sectores" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
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
          <span className="font-code-badge text-[11px] text-secondary">SECTORES</span>
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
            <span className="material-symbols-outlined text-[22px] text-[#C2A855]">warning</span>
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
          <span className="font-code-badge text-[11px] text-secondary">SECTOR</span>
        </div>
      </button>

      {/* 3. ALARMA CRÍTICA */}
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
            <span className="font-action-label text-[16px] font-bold text-on-surface">ALARMA (LABOR)</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-telemetry-value-lg text-[32px] font-bold leading-none text-[#D87661]">
            {String(alarmaCount).padStart(2, '0')}
          </span>
          <span className="font-code-badge text-[11px] text-secondary">SUSPENDIDO</span>
        </div>
      </button>

      {/* 4. MEDICIONES PENDIENTES */}
      <button
        type="button"
        onClick={() => handleToggle('PENDIENTE')}
        className={`group flex items-center justify-between min-h-[72px] p-3.5 bg-surface-container rounded border border-[#2D3239] border-l-4 border-l-[#7A7F8C] text-left transition-all active:scale-[0.99] hover:bg-surface-container-high ${
          activeFilter === 'PENDIENTE' ? 'ring-2 ring-[#7A7F8C] bg-surface-container-high' : ''
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-surface-container-highest border border-[#2D3239] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px] text-secondary">pending_actions</span>
          </div>
          <div className="flex flex-col">
            <span className="font-code-badge text-[11px] text-secondary uppercase tracking-wider">NORMATIVA</span>
            <span className="font-action-label text-[16px] font-bold text-on-surface">PENDIENTES</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-telemetry-value-lg text-[32px] font-bold leading-none text-secondary">
            {String(pendCount).padStart(2, '0')}
          </span>
          <span className="font-code-badge text-[11px] text-secondary">&gt;2 HORAS</span>
        </div>
      </button>
    </section>
  );
}

