import React, { useState } from 'react';
import { Sidebar } from './Sidebar';

/**
 * Layout principal de ATMO-MONITOR.
 * Gestiona el estado collapsed/expanded del Sidebar y ajusta el margen
 * izquierdo del contenido con la misma transición CSS.
 * El header muestra una etiqueta discreta "Datos de demostración".
 *
 * REGLA: layout/ contiene la estructura de navegación y barras fijas.
 */
export function MainLayout({ children, sidebarProps }) {
  const [collapsed, setCollapsed] = useState(false);

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
        {/* Header fijo con etiqueta de demostración */}
        <header
          className="fixed top-0 right-0 h-16 bg-surface-container-low border-b border-[#2D3239] z-40 transition-[left] duration-300 ease-in-out flex items-center justify-end px-space-md"
          style={{ left: collapsed ? '4rem' : '18rem' }}
        >
          {/* Etiqueta discreta de datos demo */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#2D3239] bg-surface-container">
            <span className="material-symbols-outlined text-[15px] text-[#C29B38]">science</span>
            <span className="font-code-badge text-[11px] text-secondary uppercase tracking-wider">
              Datos de demostración
            </span>
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
