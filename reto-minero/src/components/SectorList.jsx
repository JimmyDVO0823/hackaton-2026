import React from 'react';
import { SectorCard } from './SectorCard';

/**
 * Contenedor de la columna derecha de telemetría de sectores con buscador
 */
export function SectorList({
  sectors = [],
  searchTerm = '',
  onSearchChange,
  onResetFilters,
  selectedSectorId,
  onTriggerAlarm,
  onRegisterMeasurement
}) {
  return (
    <section className="lg:col-span-5 flex flex-col gap-space-md">
      {/* Buscador táctil y botón de restablecer */}
      <div className="flex items-center gap-space-sm bg-surface-container p-2 rounded border border-[#2D3239]">
        <div className="flex-1 flex items-center bg-surface-container-lowest px-3 py-1.5 rounded min-h-[48px] border border-[#2D3239]">
          <span className="material-symbols-outlined text-secondary text-[20px] mr-2">search</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar galería o gas (ej. CO, Tambor)..."
            className="w-full bg-transparent text-on-surface placeholder:text-secondary font-body-md text-[14px] focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={onResetFilters}
          title="Limpiar Filtros"
          className="min-h-[48px] min-w-[48px] px-3 bg-surface-container-high rounded text-secondary hover:text-on-surface flex items-center justify-center hover:bg-surface-variant transition-colors border border-[#2D3239]"
        >
          <span className="material-symbols-outlined text-[20px]">restart_alt</span>
        </button>
      </div>

      {/* Lista desplazable con tarjetas */}
      <div className="flex flex-col gap-space-md max-h-[640px] overflow-y-auto pr-1">
        {sectors.length === 0 ? (
          <div className="p-8 text-center bg-surface-container rounded border border-[#2D3239] text-secondary">
            <span className="material-symbols-outlined text-[36px] mb-2 block">search_off</span>
            <p className="font-action-label text-[14px]">No se encontraron sectores coincidentes</p>
            <button
              type="button"
              onClick={onResetFilters}
              className="mt-3 px-4 py-2 bg-surface-container-high text-on-surface rounded text-[12px] uppercase font-semibold border border-[#2D3239]"
            >
              Restablecer Filtros
            </button>
          </div>
        ) : (
          sectors.map((sector) => (
            <SectorCard
              key={sector.id}
              sector={sector}
              isSelected={selectedSectorId === sector.id}
              onTriggerAlarm={onTriggerAlarm}
              onRegisterMeasurement={onRegisterMeasurement}
            />
          ))
        )}
      </div>
    </section>
  );
}

