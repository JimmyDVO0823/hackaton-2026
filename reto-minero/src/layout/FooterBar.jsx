import React, { useState, useEffect } from 'react';

/**
 * Barra inferior ergonómica de pulgar para tableta industrial
 * REGLA: layout/ contiene la estructura de navegación y barras fijas.
 */
export function FooterBar({ onSync }) {
  const [countdown, setCountdown] = useState(25);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 30 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <footer className="mt-space-sm p-3 bg-surface-container-lowest rounded border border-[#2D3239] flex flex-wrap items-center justify-between gap-space-md">
      {/* Indicadores de Sincronización */}
      <div className="flex items-center gap-space-md">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#4A7A5B] animate-pulse" />
          <span className="font-code-badge text-[12px] text-on-surface font-semibold tracking-wider">
            RED DE SENSORES DE METANO ACTIVA
          </span>
        </div>
        <div className="h-4 w-[1px] bg-[#2D3239]" />
        <span className="font-code-badge text-[12px] text-secondary">
          TELEMETRÍA EN VIVO · CICLO: {countdown} SEG
        </span>
      </div>

      {/* Botones de acción táctiles para guantes */}
      <div className="flex items-center gap-space-md w-full sm:w-auto">
        <button
          type="button"
          onClick={onSync}
          className="min-h-[48px] px-5 bg-surface-container-high rounded text-secondary hover:text-on-surface flex items-center justify-center gap-1.5 font-action-label text-[13px] uppercase border border-[#2D3239] hover:bg-surface-variant transition-colors"
        >
          <span className="material-symbols-outlined text-secondary text-[20px]">sync</span>
          <span>Sincronizar Nodos</span>
        </button>
      </div>
    </footer>
  );
}
