import React from 'react';

/**
 * Barra superior fija.
 * Reserva la altura (h-16) para que el contenido principal no quede oculto bajo ella.
 * El contenido visible ha sido eliminado; solo se mantiene el shell estructural.
 * REGLA: layout/ contiene la estructura de navegación y barras fijas.
 */
export function Header() {
  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-surface-container-low border-b border-[#2D3239] z-40" />
  );
}
