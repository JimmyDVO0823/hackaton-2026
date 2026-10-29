import React from 'react';

/**
 * Barra inferior de estado de la red de sensores.
 * REGLA: layout/ contiene la estructura de navegación y barras fijas.
 * Eliminado: botón "Sincronizar" y referencias a mediciones manuales.
 */
export function FooterBar() {
  return (
    <footer className="mt-space-sm p-3 bg-surface-container-lowest rounded border border-[#2D3239] flex flex-wrap items-center gap-space-md">
      {/* Indicador de red activa */}
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-[#4A7A5B] animate-pulse shrink-0" />
        <span className="font-code-badge text-[12px] text-on-surface font-semibold tracking-wider">
          RED DE SENSORES DE METANO ACTIVA
        </span>
      </div>

      <div className="h-4 w-[1px] bg-[#2D3239]" />

      {/* Decreto de referencia */}
      <div className="flex items-center gap-1.5">
        <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
        <span className="font-code-badge text-[12px] text-secondary">
          Decreto 1886 de 2015 · MinMinas Colombia
        </span>
      </div>
    </footer>
  );
}
