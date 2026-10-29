import React from 'react';
import { useAlertasContext } from '../context/AlertasContext.jsx';

/**
 * Barra inferior de estado de la red de sensores con controles de prueba de alarmas (Demo).
 * REGLA: layout/ contiene la estructura de navegación y barras fijas.
 */
export function FooterBar() {
  const { probarAlarma, silenciar } = useAlertasContext();

  return (
    <footer className="mt-space-sm p-3 bg-surface-container-lowest rounded border border-[#2D3239] flex flex-wrap items-center justify-between gap-space-md">
      {/* Indicador de red activa */}
      <div className="flex items-center gap-space-md flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#4A7A5B] animate-pulse shrink-0" />
          <span className="font-code-badge text-[12px] text-on-surface font-semibold tracking-wider">
            RED DE SENSORES DE METANO ACTIVA
          </span>
        </div>

        <div className="hidden sm:block h-4 w-[1px] bg-[#2D3239]" />

        {/* Decreto de referencia */}
        <div className="flex items-center gap-1.5 text-secondary">
          <span className="material-symbols-outlined text-[16px]">verified</span>
          <span className="font-code-badge text-[12px]">
            Decreto 1886 de 2015 · MinMinas Colombia
          </span>
        </div>
      </div>

      {/* ── Controles "Probar alarmas (Demo)" ───────────────────────────── */}
      <div className="flex items-center gap-1.5 flex-wrap p-1 rounded bg-surface-container border border-[#2D3239]">
        <div className="flex items-center gap-1 px-2 text-secondary font-code-badge text-[11px] uppercase tracking-wider">
          <span className="material-symbols-outlined text-[16px] text-[#C29B38]">science</span>
          <span>Probar alarmas (Demo):</span>
        </div>

        {/* Botón Precaución */}
        <button
          type="button"
          onClick={() => probarAlarma('PRECAUCION')}
          title="Reproducir tono de Precaución (440 Hz, 1 pitido)"
          className="min-h-[34px] px-2.5 rounded bg-surface-container-high hover:bg-[#A38A3A]/20 text-[#C2A855] border border-[#A38A3A]/40 font-code-badge text-[11px] font-bold uppercase transition-colors flex items-center gap-1"
        >
          <span className="w-2 h-2 rounded-full bg-[#C2A855]" />
          <span>Precaución</span>
        </button>

        {/* Botón Alarma */}
        <button
          type="button"
          onClick={() => probarAlarma('ALARMA')}
          title="Reproducir alarma sonora (440 Hz, 3 pitidos cada 5 s)"
          className="min-h-[34px] px-2.5 rounded bg-surface-container-high hover:bg-[#B2533E]/20 text-[#D87661] border border-[#B2533E]/40 font-code-badge text-[11px] font-bold uppercase transition-colors flex items-center gap-1"
        >
          <span className="w-2 h-2 rounded-full bg-[#D87661]" />
          <span>Alarma</span>
        </button>

        {/* Botón Evacuación */}
        <button
          type="button"
          onClick={() => probarAlarma('EVACUACION')}
          title="Reproducir sirena continua de Evacuación (450-850 Hz)"
          className="min-h-[34px] px-2.5 rounded bg-surface-container-high hover:bg-[#8B3232]/25 text-[#D97575] border border-[#8B3232] font-code-badge text-[11px] font-bold uppercase transition-colors flex items-center gap-1"
        >
          <span className="w-2 h-2 rounded-full bg-[#D97575] animate-ping" />
          <span>Evacuación</span>
        </button>

        {/* Botón Silenciar */}
        <button
          type="button"
          onClick={silenciar}
          title="Silenciar sonido del tablero"
          className="min-h-[34px] px-2.5 rounded bg-surface-container-high hover:bg-surface-variant text-secondary hover:text-on-surface border border-[#2D3239] font-code-badge text-[11px] uppercase transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[15px]">volume_off</span>
          <span>Silenciar</span>
        </button>
      </div>
    </footer>
  );
}
