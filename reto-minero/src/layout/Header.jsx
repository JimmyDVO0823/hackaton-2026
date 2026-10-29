import React, { useState, useEffect } from 'react';
import { useMina } from '../hooks/useMina.js';
import { useConexion } from '../hooks/useConexion.js';

/**
 * Encabezado de telemetría y estado operativo en tiempo real
 * REGLA: layout/ contiene la barra superior.
 */
export function Header() {
  const { configMina } = useMina();
  const { estaEnLinea } = useConexion();
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toTimeString().split(' ')[0]);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-surface-container-low border-b border-[#2D3239] z-40 px-space-md flex items-center justify-between">
      {/* Información de la Mina */}
      <div className="flex items-center gap-space-md">
        <div className="flex flex-col">
          <h1 className="font-headline-md text-[20px] font-bold leading-none text-on-surface">
            {configMina.nombre}
          </h1>
          <span className="font-code-badge text-[12px] text-secondary">
            {configMina.cota}
          </span>
        </div>
        <div className="h-6 w-[1px] bg-[#2D3239] mx-space-xs" />
        <div className="flex items-center gap-space-xs px-2.5 py-1 bg-surface-container-lowest border border-[#2D3239] rounded">
          <span
            className={`material-symbols-outlined text-[18px] ${
              estaEnLinea ? 'text-[#6DAA81]' : 'text-[#A38A3A]'
            }`}
          >
            {estaEnLinea ? 'cloud_done' : 'cloud_off'}
          </span>
          <span className="font-code-badge text-[12px] text-secondary uppercase">
            {estaEnLinea ? 'En línea – sincronizado' : 'Sin conexión – datos locales'}
          </span>
        </div>
      </div>

      {/* Indicadores de Turno, Batería y Reloj */}
      <div className="flex items-center gap-space-md">
        <div className="flex items-center gap-space-xs px-2.5 py-1 bg-surface-container rounded border border-[#2D3239]">
          <span className="material-symbols-outlined text-secondary text-[18px]">schedule</span>
          <span className="font-body-md text-[13px] text-secondary">
            {configMina.turno} · {configMina.operador}
          </span>
        </div>
        <div className="flex items-center gap-space-sm">
          <div className="flex items-center gap-space-xs px-2 py-1 bg-surface-container rounded border border-[#2D3239]">
            <span className="material-symbols-outlined text-secondary text-[18px]">battery_charging_80</span>
            <span className="font-code-badge text-[13px] text-on-surface">84%</span>
          </div>
          <div className="px-2.5 py-1 bg-surface-container rounded border border-[#2D3239] min-w-[85px] text-center">
            <span className="font-telemetry-value-md text-[16px] text-on-surface font-semibold">
              {currentTime || '17:42:08'}
            </span>
          </div>
          <div className="w-8 h-8 rounded bg-surface-container-high border border-[#2D3239] flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary text-[18px]">person</span>
          </div>
        </div>
      </div>
    </header>
  );
}
