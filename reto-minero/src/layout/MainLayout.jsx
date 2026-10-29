import React, { useState } from 'react';
import { Sidebar } from './Sidebar';

/**
 * Layout principal de ATMO-MONITOR.
 * Gestiona la navegación lateral, el estado de los turnos de 8 horas
 * y la barra superior fija con descarga de Resumen de Turno.
 *
 * REGLA: layout/ contiene la estructura de navegación y barras fijas.
 */
export function MainLayout({ children, sidebarProps, turnoProps, supervisorProps }) {
  const [collapsed, setCollapsed] = useState(false);
  const { turnoActual, simularFinDeTurno } = turnoProps || {};
  const { supervisorTurno, onAbrirIniciarTurno } = supervisorProps || {};

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
        {/* Header fijo con control de Turnos y Supervisor */}
        <header
          className="fixed top-0 right-0 h-16 bg-surface-container-low border-b border-[#2D3239] z-40 transition-[left] duration-300 ease-in-out flex items-center justify-between px-space-md gap-3"
          style={{ left: collapsed ? '4rem' : '18rem' }}
        >
          {/* Widget de Turno de Operación Minera (Turnos de 8 horas) */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {turnoActual && (
              <div
                className="flex items-center gap-2 px-3 py-1 rounded-lg bg-surface-container border border-[#2D3239] min-w-0 shrink"
                title={`Turno de 8h según Decreto 1886. Finaliza a las ${turnoActual.horarioTexto.split(' - ')[1]}. Descarga automática del resumen al finalizar.`}
              >
                <span className="material-symbols-outlined text-[18px] text-[#C29B38] animate-pulse shrink-0">
                  schedule
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="font-action-label text-[12px] font-bold text-on-surface uppercase tracking-wide leading-tight truncate">
                    {turnoActual.nombre} · <span className="text-secondary font-normal font-code-badge">{turnoActual.horarioTexto}</span>
                  </span>
                  <span className="font-code-badge text-[10px] text-secondary truncate">
                    Entrega en: <strong className="text-[#E0B853]">{turnoActual.tiempoRestanteTexto}</strong>
                  </span>
                </div>
              </div>
            )}

            {/* Widget de Supervisor Responsable y Trazabilidad */}
            {supervisorTurno && (
              <div
                className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-lg bg-surface-container border border-[#2D3239] min-w-0 shrink"
                title={`Supervisor Responsable: ${supervisorTurno.nombre} · C.C. ${supervisorTurno.documento} · ${supervisorTurno.cargo}`}
              >
                <div className="w-6 h-6 rounded bg-[#C29B38]/20 flex items-center justify-center shrink-0 border border-[#C29B38]/40">
                  <span className="material-symbols-outlined text-[15px] text-[#E0B853]">badge</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-action-label text-[11px] font-bold text-on-surface truncate max-w-[180px] leading-tight">
                    {supervisorTurno.nombre}
                  </span>
                  <span className="font-code-badge text-[10px] text-secondary truncate">
                    C.C. {supervisorTurno.documento}
                  </span>
                </div>
                {onAbrirIniciarTurno && (
                  <button
                    type="button"
                    onClick={onAbrirIniciarTurno}
                    title="Cambiar supervisor o registrar traspaso formal de turno"
                    className="p-1 hover:bg-surface-container-high rounded text-secondary hover:text-[#E0B853] transition-colors ml-0.5 shrink-0"
                  >
                    <span className="material-symbols-outlined text-[15px]">edit</span>
                  </button>
                )}
              </div>
            )}

            {/* Botón destacado si aún no se ha iniciado el turno */}
            {onAbrirIniciarTurno && !supervisorTurno?.iniciado && (
              <button
                type="button"
                onClick={onAbrirIniciarTurno}
                className="min-h-[36px] px-3 bg-[#C29B38] hover:bg-[#d4aa3e] text-[#121417] font-bold rounded flex items-center gap-1.5 font-action-label text-[11px] uppercase shadow-sm active:scale-98 shrink-0 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
                <span>Iniciar Turno</span>
              </button>
            )}
          </div>

          {/* Acciones de Turno */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Botón para Simular Fin de Turno (Permite verificar la entrega automática sin esperar 8h) */}
            {simularFinDeTurno && (
              <button
                type="button"
                onClick={simularFinDeTurno}
                title="Simular cambio de turno (Prueba de entrega y descarga automática del CSV)"
                className="min-h-[36px] px-2.5 bg-[#C29B38]/15 hover:bg-[#C29B38]/25 text-[#E0B853] rounded flex items-center gap-1 font-action-label text-[11px] uppercase font-bold border border-[#C29B38]/40 transition-colors whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[15px]">autorenew</span>
                <span className="hidden xl:inline">Simular Fin Turno</span>
              </button>
            )}
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
