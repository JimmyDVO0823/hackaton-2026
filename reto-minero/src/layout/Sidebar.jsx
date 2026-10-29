import React from 'react';

/**
 * Barra lateral de navegación adaptada para tabletas mineras industriales
 * REGLA: layout/ contiene la barra lateral y barra superior.
 */
export function Sidebar({ activeRoute = 'tablero', onNavigate, onTriggerSOS, audioHabilitado = false, onHabilitarAudio }) {
  const navItems = [
    { id: 'tablero', label: 'Tablero', icon: 'grid_view' },
    { id: 'registrar-medicion', label: 'Registrar Medición', icon: 'science' },
    { id: 'historial', label: 'Historial', icon: 'history' },
    { id: 'alertas', label: 'Alertas', icon: 'warning' },
    { id: 'configuracion-de-mina', label: 'Configuración Mina', icon: 'settings' }
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-surface-container-low z-50 flex flex-col justify-between border-r border-[#2D3239]">
      <div className="flex flex-col">
        {/* Cabecera del Sidebar */}
        <div className="h-16 px-space-md flex items-center gap-space-sm bg-surface-container-lowest border-b border-[#2D3239]">
          <span className="material-symbols-outlined text-[#C29B38] text-[26px]">radar</span>
          <div className="flex flex-col">
            <span className="font-action-label text-[15px] font-bold uppercase tracking-wider text-[#D8DADE]">
              ATMO-MONITOR
            </span>
            <span className="font-code-badge text-[12px] text-secondary">
              IS-SISTEMA SEGURIDAD
            </span>
          </div>
        </div>

        {/* Control de Audio Normativo para el turno */}
        <div className="p-3 mx-2 mt-2 bg-surface-container-lowest rounded border border-[#2D3239] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`material-symbols-outlined text-[18px] ${audioHabilitado ? 'text-[#6DAA81]' : 'text-[#C2A855]'}`}>
              {audioHabilitado ? 'volume_up' : 'volume_off'}
            </span>
            <span className="font-code-badge text-[11px] text-secondary">
              {audioHabilitado ? 'Sonido Activo' : 'Audio en Espera'}
            </span>
          </div>
          {!audioHabilitado && (
            <button
              type="button"
              onClick={onHabilitarAudio}
              className="px-2 py-1 bg-surface-container-high hover:bg-surface-variant text-on-surface text-[10px] font-bold uppercase rounded border border-[#2D3239]"
            >
              Activar
            </button>
          )}
        </div>

        {/* Menú de navegación */}
        <nav className="flex flex-col p-space-sm gap-1.5 mt-2">
          {navItems.map((item) => {
            const isActive = activeRoute === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`flex items-center min-h-[52px] px-space-md rounded transition-colors text-left ${
                  isActive
                    ? 'bg-surface-container-high text-[#E2E8F0] font-semibold border-l-2 border-[#C29B38]'
                    : 'bg-surface-container text-secondary hover:bg-surface-container-high hover:text-on-surface border border-[#2D3239]'
                }`}
              >
                <span
                  className={`material-symbols-outlined mr-space-md text-[24px] ${
                    isActive ? 'text-[#C29B38]' : ''
                  }`}
                >
                  {item.icon}
                </span>
                <span className="font-action-label text-[14px] uppercase tracking-wider">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Pie del Sidebar: Certificación y Botón SOS */}
      <div className="p-space-md border-t border-[#2D3239] bg-surface-container-lowest flex flex-col gap-space-sm">
        <div className="flex items-center justify-between text-secondary">
          <span className="font-code-badge text-[12px]">TAB-RUGGED-04</span>
          <span className="font-code-badge text-[12px] text-[#A6ABB8] px-1.5 py-0.5 bg-surface-container rounded border border-[#2D3239]">
            ATEX M1
          </span>
        </div>
        <button
          className="min-h-[52px] w-full flex items-center justify-center gap-space-sm bg-[#5C2222]/80 hover:bg-[#5C2222] text-[#F0BEBE] border border-[#8B3232] font-action-label text-[13px] uppercase rounded active:scale-[0.98] transition-colors"
          type="button"
          onClick={onTriggerSOS}
        >
          <span className="material-symbols-outlined text-[20px]">sos</span>
          <span>Protocolo Evacuación</span>
        </button>
      </div>
    </aside>
  );
}

