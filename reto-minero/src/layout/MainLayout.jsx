import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

/**
 * Layout principal de la aplicación ATMO-MONITOR.
 * Gestiona el estado collapsed/expanded del Sidebar y ajusta el margen
 * izquierdo del contenido con la misma transición CSS.
 *
 * Uso:
 *   <MainLayout sidebarProps={...}>
 *     <TableroPage />
 *   </MainLayout>
 *
 * REGLA: layout/ contiene la estructura de navegación y barras fijas.
 */
export function MainLayout({ children, sidebarProps }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-surface text-on-surface font-body-md select-none min-h-screen">
      {/* Sidebar lateral — ancho controlado internamente */}
      <Sidebar
        {...sidebarProps}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />

      {/* Columna derecha: se desplaza con la misma duración que el sidebar */}
      <div
        className="transition-[padding-left] duration-300 ease-in-out"
        style={{ paddingLeft: collapsed ? '4rem' : '18rem' }}
      >
        {/* Header fijo — ancho espejado al sidebar */}
        <header
          className={`fixed top-0 right-0 h-16 bg-surface-container-low border-b border-[#2D3239] z-40 transition-[left] duration-300 ease-in-out ${
            collapsed ? 'left-16' : 'left-72'
          }`}
        />

        {/* Área de contenido bajo el header */}
        <main className="w-full pt-16 bg-surface min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
