import React from 'react';

/**
 * Barra lateral de navegación comprimible para tabletas mineras industriales.
 * - Expandida : w-72  — icono + etiqueta
 * - Colapsada : w-16  — solo icono (tooltip nativo al hacer hover)
 *
 * REGLA: layout/ contiene la barra lateral y barra superior.
 */
export function Sidebar({
  activeRoute = 'tablero',
  onNavigate,
  onTriggerSOS,
  audioHabilitado = false,
  onHabilitarAudio,
  collapsed = false,
  onToggleCollapse,
}) {
  const navItems = [
    { id: 'tablero',               label: 'Tablero',            icon: 'grid_view' },
    { id: 'historial',             label: 'Historial',          icon: 'history'   },
    { id: 'alertas',               label: 'Alertas',            icon: 'warning'   },
    { id: 'configuracion-de-mina', label: 'Configuración Mina', icon: 'settings'  },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-surface-container-low z-50 flex flex-col justify-between border-r border-[#2D3239] transition-[width] duration-300 ease-in-out overflow-hidden ${
        collapsed ? 'w-16' : 'w-72'
      }`}
    >
      <div className="flex flex-col min-w-0">
        {/* ── Cabecera ────────────────────────────────────────────────── */}
        <div className="h-16 px-3 flex items-center bg-surface-container-lowest border-b border-[#2D3239] shrink-0">
          <span className="material-symbols-outlined text-[#C29B38] text-[26px] shrink-0">radar</span>

          <div
            className={`flex flex-col ml-3 transition-opacity duration-200 ${
              collapsed ? 'opacity-0 pointer-events-none w-0 overflow-hidden' : 'opacity-100'
            }`}
          >
            <span className="font-action-label text-[15px] font-bold uppercase tracking-wider text-[#D8DADE] whitespace-nowrap">
              ATMO-MONITOR
            </span>
            <span className="font-code-badge text-[12px] text-secondary whitespace-nowrap">
              IS-SISTEMA SEGURIDAD
            </span>
          </div>

          <button
            type="button"
            onClick={onToggleCollapse}
            title={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
            className="ml-auto shrink-0 w-8 h-8 flex items-center justify-center rounded hover:bg-surface-container-high text-secondary hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">
              {collapsed ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>
        </div>

        {/* ── Control de Audio ────────────────────────────────────────── */}
        {!collapsed && (
          <div className="p-3 mx-2 mt-2 bg-surface-container-lowest rounded border border-[#2D3239] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className={`material-symbols-outlined text-[18px] ${audioHabilitado ? 'text-[#6DAA81]' : 'text-[#C2A855]'}`}>
                {audioHabilitado ? 'volume_up' : 'volume_off'}
              </span>
              <span className="font-code-badge text-[11px] text-secondary whitespace-nowrap">
                {audioHabilitado ? 'Sonido Activo' : 'Audio en Espera'}
              </span>
            </div>
            {!audioHabilitado && (
              <button
                type="button"
                onClick={onHabilitarAudio}
                className="px-2 py-1 bg-surface-container-high hover:bg-surface-variant text-on-surface text-[10px] font-bold uppercase rounded border border-[#2D3239] whitespace-nowrap"
              >
                Activar
              </button>
            )}
          </div>
        )}

        {collapsed && (
          <div className="flex justify-center mt-3 shrink-0">
            <button
              type="button"
              onClick={onHabilitarAudio}
              title={audioHabilitado ? 'Sonido activo' : 'Activar audio'}
              className="w-10 h-10 flex items-center justify-center rounded hover:bg-surface-container-high transition-colors"
            >
              <span className={`material-symbols-outlined text-[22px] ${audioHabilitado ? 'text-[#6DAA81]' : 'text-[#C2A855]'}`}>
                {audioHabilitado ? 'volume_up' : 'volume_off'}
              </span>
            </button>
          </div>
        )}

        {/* ── Menú de navegación ──────────────────────────────────────── */}
        <nav className={`flex flex-col gap-1.5 mt-2 ${collapsed ? 'px-1' : 'p-space-sm'}`}>
          {navItems.map((item) => {
            const isActive = activeRoute === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                title={collapsed ? item.label : undefined}
                className={`flex items-center min-h-[52px] rounded transition-colors text-left ${
                  collapsed ? 'justify-center px-0' : 'px-space-md'
                } ${
                  isActive
                    ? 'bg-surface-container-high text-[#E2E8F0] font-semibold border-l-2 border-[#C29B38]'
                    : 'bg-surface-container text-secondary hover:bg-surface-container-high hover:text-on-surface border border-[#2D3239]'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[24px] shrink-0 ${
                    isActive ? 'text-[#C29B38]' : ''
                  } ${collapsed ? '' : 'mr-space-md'}`}
                >
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="font-action-label text-[14px] uppercase tracking-wider whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Pie: solo botón SOS ─────────────────────────────────────── */}
      <div className={`border-t border-[#2D3239] bg-surface-container-lowest ${collapsed ? 'p-2' : 'p-space-md'}`}>
        <button
          type="button"
          onClick={onTriggerSOS}
          title={collapsed ? 'Protocolo Evacuación' : undefined}
          className={`min-h-[52px] w-full flex items-center justify-center bg-[#5C2222]/80 hover:bg-[#5C2222] text-[#F0BEBE] border border-[#8B3232] font-action-label text-[13px] uppercase rounded active:scale-[0.98] transition-colors ${
            collapsed ? 'gap-0 px-0' : 'gap-space-sm'
          }`}
        >
          <span className="material-symbols-outlined text-[20px] shrink-0">sos</span>
          {!collapsed && <span className="whitespace-nowrap">Protocolo Evacuación</span>}
        </button>
      </div>
    </aside>
  );
}
