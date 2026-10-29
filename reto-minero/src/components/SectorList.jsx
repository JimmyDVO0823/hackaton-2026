import React from 'react';
import { NodoCard } from './NodoCard';

/**
 * Columna derecha: lista de tarjetas de nodos con buscador, filtros y control de bocinas.
 * REGLA: Recibe nodos con evaluacion calculada; nunca lee un estado escrito a mano.
 */
export function SectorList({
  nodos = [],
  searchTerm = '',
  onSearchChange,
  onResetFilters,
  selectedNodoId,
  onSelectNodo,
  onTriggerAlarm,
  bocinasActivas = {},
  onToggleBocina,
  onBocinaGlobal,
  bocinaGlobalActiva = false,
}) {
  return (
    <section className="lg:col-span-5 flex flex-col gap-space-md">
      {/* Buscador + control bocina global */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-space-sm bg-surface-container p-2 rounded border border-[#2D3239]">
          <div className="flex-1 flex items-center bg-surface-container-lowest px-3 py-1.5 rounded min-h-[48px] border border-[#2D3239]">
            <span className="material-symbols-outlined text-secondary text-[20px] mr-2">search</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar nodo, galería o estado (ej. ALARMA, Retorno)..."
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

        {/* Control de bocina global */}
        <button
          type="button"
          onClick={onBocinaGlobal}
          className={`min-h-[44px] w-full flex items-center justify-center gap-2 rounded font-action-label text-[13px] uppercase border transition-colors ${
            bocinaGlobalActiva
              ? 'bg-[#4A7A5B]/30 text-[#6DAA81] border-[#4A7A5B] animate-pulse'
              : 'bg-surface-container-high text-secondary hover:text-on-surface border-[#2D3239] hover:bg-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {bocinaGlobalActiva ? 'volume_up' : 'volume_off'}
          </span>
          <span>{bocinaGlobalActiva ? 'Bocina Global ACTIVA — clic para apagar' : 'Activar Bocina Global (todos los sitios)'}</span>
        </button>
      </div>

      {/* Lista de tarjetas */}
      <div className="flex flex-col gap-space-md max-h-[640px] overflow-y-auto pr-1">
        {nodos.length === 0 ? (
          <div className="p-8 text-center bg-surface-container rounded border border-[#2D3239] text-secondary">
            <span className="material-symbols-outlined text-[36px] mb-2 block">search_off</span>
            <p className="font-action-label text-[14px]">No se encontraron nodos coincidentes</p>
            <button
              type="button"
              onClick={onResetFilters}
              className="mt-3 px-4 py-2 bg-surface-container-high text-on-surface rounded text-[12px] uppercase font-semibold border border-[#2D3239]"
            >
              Restablecer Filtros
            </button>
          </div>
        ) : (
          nodos.map((nodo) => (
            <div
              key={nodo.id}
              onClick={() => onSelectNodo && onSelectNodo(nodo.id)}
              className="cursor-pointer"
            >
              <NodoCard
                nodo={nodo}
                isSelected={selectedNodoId === nodo.id}
                onTriggerAlarm={onTriggerAlarm}
                onActivarBocina={onToggleBocina}
                bocinaActiva={bocinaGlobalActiva || !!bocinasActivas[nodo.id]}
              />
            </div>
          ))
        )}
      </div>
    </section>
  );
}
