import React, { useState } from 'react';
import { Sidebar } from './Sidebar';

/**
 * Layout principal de ATMO-MONITOR.
 * Gestiona la navegación lateral, el estado de los turnos de 8 horas
 * y la barra superior fija con descarga de Resumen de Turno.
 *
 * REGLA: layout/ contiene la estructura de navegación y barras fijas.
 */
export function MainLayout({ children, sidebarProps, turnoProps }) {
  const [collapsed, setCollapsed] = useState(false);
  const { turnoActual, descargarTurnoActual, simularFinDeTurno } = turnoProps || {};

  return (
    <div className="bg-surface text-on-surface font-body-md select-none min-h-screen">
      {/* Sidebar lateral */}
      <Sidebar
        {...sidebarProps}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />

      {/* Columna derecha — se desplaza junto con el sidebar */}
      <div
        className="transition-[padding-left] duration-300 ease-in-out"
        style={{ paddingLeft: collapsed ? '4rem' : '18rem' }}
      >
        {/* Header fijo con control de Turnos y Resumen CSV */}
        <header
          className="fixed top-0 right-0 h-16 bg-surface-container-low border-b border-[#2D3239] z-40 transition-[left] duration-300 ease-in-out flex items-center justify-between px-space-md gap-3"
          style={{ left: collapsed ? '4rem' : '18rem' }}
        >
          {/* Widget de Turno de Operación Minera (Turnos de 8 horas) */}
          <div className="flex items-center gap-2.5">
            {turnoActual && (
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container border border-[#2D3239]"
                title={`Turno de 8h según Decreto 1886. Finaliza a las ${turnoActual.horarioTexto.split(' - ')[1]}.`}
              >
                <span className="material-symbols-outlined text-[18px] text-[#C29B38] animate-pulse">
                  schedule
                </span>
                <div className="flex flex-col">
                  <span className="font-action-label text-[12px] font-bold text-on-surface uppercase tracking-wide leading-tight">
                    {turnoActual.nombre} · <span className="text-secondary font-normal font-code-badge">{turnoActual.horarioTexto}</span>
                  </span>
                  <span className="font-code-badge text-[10px] text-secondary">
                    Entrega de turno en: <strong className="text-[#E0B853]">{turnoActual.tiempoRestanteTexto}</strong> (Descarga automática al finalizar)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Acciones de Turno y Demo */}
          <div className="flex items-center gap-2">
            {/* Descarga manual del Resumen de Turno en CSV */}
            {descargarTurnoActual && (
              <button
                type="button"
                onClick={descargarTurnoActual}
                title="Generar y descargar documento 'Resumen de Turno' (CSV) con el historial acumulado de las 8 horas"
                className="min-h-[38px] px-3 bg-surface-container-high hover:bg-surface-variant text-on-surface rounded flex items-center gap-1.5 font-action-label text-[12px] uppercase font-semibold border border-[#2D3239] transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] text-[#C29B38]">assignment</span>
                <span>Resumen Turno (CSV)</span>
              </button>
            )}

            {/* Botón para Simular Fin de Turno (Permite verificar la entrega automática sin esperar 8h) */}
            {simularFinDeTurno && (
              <button
                type="button"
                onClick={simularFinDeTurno}
                title="Simular cambio de turno (Prueba de entrega y descarga automática del CSV)"
                className="min-h-[38px] px-2.5 bg-[#C29B38]/15 hover:bg-[#C29B38]/25 text-[#E0B853] rounded flex items-center gap-1 font-action-label text-[11px] uppercase font-bold border border-[#C29B38]/40 transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">autorenew</span>
                <span>Simular Fin Turno</span>
              </button>
            )}

            {/* Etiqueta discreta de datos demo */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#2D3239] bg-surface-container">
              <span className="material-symbols-outlined text-[14px] text-[#C29B38]">science</span>
              <span className="font-code-badge text-[10px] text-secondary uppercase tracking-wider">
                Demo 24h
              </span>
            </div>
          </div>
        </header>

        {/* Contenido principal */}
        <main className="w-full pt-16 bg-surface min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
