import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

/**
 * Layout principal de la aplicación ATMO-MONITOR.
 * Compone el Sidebar lateral fijo + Header superior fijo + zona de contenido desplazable.
 *
 * Uso:
 *   <MainLayout sidebar={sidebarProps}>
 *     <TableroPage ... />
 *   </MainLayout>
 *
 * REGLA: layout/ contiene la estructura de navegación y barras fijas.
 */
export function MainLayout({ children, sidebarProps }) {
  return (
    <div className="bg-surface text-on-surface font-body-md select-none min-h-screen">
      {/* Sidebar lateral fijo */}
      <Sidebar {...sidebarProps} />

      {/* Columna derecha: header fijo + contenido principal */}
      <div className="pl-72">
        <Header />

        {/* Área de contenido — ocupa el resto de la pantalla bajo el header */}
        <main className="w-full pt-16 bg-surface min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}

