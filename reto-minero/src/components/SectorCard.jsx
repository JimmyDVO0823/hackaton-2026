import React from 'react';
import { TIPOS_SITIO } from '../config/tiposSitio.js';

/**
 * Tarjeta individual de nodo sensor con telemetría y estado calculado
 * REGLA: Nunca lee un estado escrito a mano; usa nodo.evaluacion.
 */
export function SectorCard({ nodo, isSelected, onTriggerAlarm }) {
  const { id, nombre, ubicacion, tipoSitio, nivel, lectura, alarmaLocalActiva, evaluacion } = nodo;
  const nivelRiesgo = evaluacion?.nivel || 'NORMAL';
  const alertaPrincipal = evaluacion?.alertaPrincipal;

  // Clases y colores calculados según la evaluación normativa
  const borderClass =
    nivelRiesgo === 'EVACUACION'
      ? 'border-l-4 border-l-[#8B3232]'
      : nivelRiesgo === 'ALARMA'
      ? 'border-l-4 border-l-[#B2533E]'
      : nivelRiesgo === 'PRECAUCION'
      ? 'border-l-4 border-l-[#A38A3A]'
      : nivelRiesgo === 'SIN_SEÑAL'
      ? 'border-dashed border-[#5A606E]'
      : 'border-l-4 border-l-[#4A7A5B]';

  const badgeClass =
    nivelRiesgo === 'EVACUACION'
      ? 'bg-[#8B3232]/25 border border-[#8B3232] text-[#D97575]'
      : nivelRiesgo === 'ALARMA'
      ? 'bg-[#B2533E]/20 border border-[#B2533E]/50 text-[#D87661]'
      : nivelRiesgo === 'PRECAUCION'
      ? 'bg-[#A38A3A]/20 border border-[#A38A3A]/50 text-[#C2A855]'
      : nivelRiesgo === 'SIN_SEÑAL'
      ? 'bg-surface-container-highest text-secondary border border-[#2D3239]'
      : 'bg-[#4A7A5B]/20 border border-[#4A7A5B]/40 text-[#6DAA81]';

  const badgeIcon =
    nivelRiesgo === 'EVACUACION'
      ? 'sos'
      : nivelRiesgo === 'ALARMA'
      ? 'warning'
      : nivelRiesgo === 'PRECAUCION'
      ? 'warning_amber'
      : nivelRiesgo === 'SIN_SEÑAL'
      ? 'signal_disconnected'
      : 'verified';

  const badgeText =
    nivelRiesgo === 'EVACUACION'
      ? 'EVACUACIÓN'
      : nivelRiesgo === 'ALARMA'
      ? 'ALARMA · SUSPENDER'
      : nivelRiesgo === 'PRECAUCION'
      ? 'PRECAUCIÓN'
      : nivelRiesgo === 'SIN_SEÑAL'
      ? 'SIN SEÑAL'
      : 'NORMAL';

  // Cálculo del tiempo transcurrido
  const fechaLectura = new Date(lectura?.fecha || 0);
  const minutos = Math.max(1, Math.round((Date.now() - fechaLectura.getTime()) / (1000 * 60)));
  const tiempoTexto = minutos < 60 ? `Hace ${minutos} min` : `Hace +1h`;

  const tipoSitioNombre = TIPOS_SITIO[tipoSitio]?.nombre || tipoSitio;

  return (
    <article
      id={`card-${id}`}
      className={`sector-card flex flex-col p-3.5 bg-surface-container rounded border border-[#2D3239] ${borderClass} shadow-sm transition-all ${
        isSelected ? 'highlight-pulse ring-2 ring-[#C29B38]' : ''
      }`}
    >
      {/* Cabecera del Nodo */}
      <div className="flex items-start justify-between gap-space-sm border-b border-[#2D3239] pb-2.5">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span
              className={`material-symbols-outlined text-[20px] ${
                nivelRiesgo === 'EVACUACION'
                  ? 'text-[#D97575]'
                  : nivelRiesgo === 'ALARMA'
                  ? 'text-[#D87661]'
                  : nivelRiesgo === 'PRECAUCION'
                  ? 'text-[#C2A855]'
                  : nivelRiesgo === 'SIN_SEÑAL'
                  ? 'text-secondary'
                  : 'text-[#6DAA81]'
              }`}
            >
              {badgeIcon}
            </span>
            <h3 className="font-headline-md text-[17px] font-bold text-on-surface uppercase">
              {nombre}
            </h3>
            <span className="font-code-badge text-[11px] px-1.5 py-0.5 rounded bg-surface-container-high border border-[#2D3239] text-secondary">
              {nivel}
            </span>
            {alarmaLocalActiva && (
              <span className="font-code-badge text-[10px] px-1.5 py-0.5 rounded bg-[#B2533E] text-white font-bold animate-pulse">
                SIRENA LOCAL
              </span>
            )}
          </div>
          <span className="font-code-badge text-[11px] text-secondary mt-0.5">
            {ubicacion} · <strong className="text-on-surface-variant">{tipoSitioNombre}</strong>
          </span>
          {alertaPrincipal?.mensaje && (
            <span
              className={`font-code-badge text-[11px] mt-1 ${
                nivelRiesgo === 'EVACUACION'
                  ? 'text-[#D97575] font-bold'
                  : nivelRiesgo === 'ALARMA'
                  ? 'text-[#D87661] font-semibold'
                  : 'text-[#C2A855]'
              }`}
            >
              {alertaPrincipal.mensaje}
            </span>
          )}
        </div>

        {/* Badge de Estado Evaluado */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-code-badge text-[12px] font-bold uppercase ${badgeClass}`}>
          <span className="material-symbols-outlined text-[16px]">{badgeIcon}</span>
          <span>{badgeText}</span>
        </div>
      </div>

      {/* Lecturas de Telemetría (CH4, Temperatura, Humedad) */}
      <div className="grid grid-cols-3 gap-2 my-3">
        {/* CH4 Metano */}
        <div
          className={`flex flex-col p-2 rounded border ${
            nivelRiesgo === 'ALARMA' || nivelRiesgo === 'EVACUACION'
              ? 'bg-[#2E1A17] border-[#B2533E]/60'
              : nivelRiesgo === 'PRECAUCION'
              ? 'bg-[#2A261A] border-[#A38A3A]/60'
              : 'bg-surface-container-lowest border-[#2D3239]'
          }`}
        >
          <span className="font-code-badge text-[11px] text-secondary">CH₄ METANO</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span
              className={`font-telemetry-value-md text-[24px] font-bold ${
                nivelRiesgo === 'ALARMA' || nivelRiesgo === 'EVACUACION'
                  ? 'text-[#D87661]'
                  : nivelRiesgo === 'PRECAUCION'
                  ? 'text-[#C2A855]'
                  : 'text-on-surface'
              }`}
            >
              {lectura?.ch4?.toFixed(1) ?? '--'}
            </span>
            <span className="font-telemetry-unit text-[12px] text-secondary">%Vol</span>
          </div>
          <span className="font-code-badge text-[10px] text-secondary mt-0.5">
            {tipoSitio.includes('tajo') || tipoSitio.includes('preparacion') ? 'Límite: 1.5%' : 'Límite: 1.0%'}
          </span>
        </div>

        {/* Temperatura */}
        <div className="flex flex-col p-2 bg-surface-container-lowest rounded border border-[#2D3239]">
          <span className="font-code-badge text-[11px] text-secondary">TEMPERATURA</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-telemetry-value-md text-[24px] font-bold text-on-surface">
              {lectura?.temperatura?.toFixed(1) ?? '--'}
            </span>
            <span className="font-telemetry-unit text-[12px] text-secondary">°C</span>
          </div>
          <span className="font-code-badge text-[10px] text-secondary mt-0.5">Límite por validar</span>
        </div>

        {/* Humedad */}
        <div className="flex flex-col p-2 bg-surface-container-lowest rounded border border-[#2D3239]">
          <span className="font-code-badge text-[11px] text-secondary">HUMEDAD</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-telemetry-value-md text-[24px] font-bold text-on-surface">
              {lectura?.humedad ?? '--'}
            </span>
            <span className="font-telemetry-unit text-[12px] text-secondary">%</span>
          </div>
          <span className="font-code-badge text-[10px] text-secondary mt-0.5">Informativa</span>
        </div>
      </div>

      {/* Footer de la tarjeta con Telemetría de hardware (Batería, RSSI, Tiempo) */}
      <div className="flex flex-wrap items-center justify-between gap-space-sm pt-2 border-t border-[#2D3239]">
        <div className="flex items-center gap-space-sm text-secondary font-code-badge text-[11px]">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px]">schedule</span>
            <span>{tiempoTexto}</span>
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px]">battery_std</span>
            <span>{lectura?.bateria}%</span>
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px]">wifi</span>
            <span>{lectura?.rssi} dBm</span>
          </span>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          {(nivelRiesgo === 'ALARMA' || nivelRiesgo === 'EVACUACION') && (
            <>
              <button
                type="button"
                onClick={() => alert(`Alarma silenciada localmente para ${nombre}.`)}
                className="min-h-[44px] px-3 bg-surface-container-high text-secondary hover:text-on-surface rounded flex items-center justify-center font-action-label text-[12px] uppercase border border-[#2D3239] hover:bg-surface-variant transition-colors"
              >
                Silenciar
              </button>
              <button
                type="button"
                onClick={() => onTriggerAlarm(nombre)}
                className="min-h-[44px] px-3.5 rounded flex items-center gap-1.5 font-action-label text-[12px] uppercase font-bold text-white bg-[#B2533E] hover:bg-[#c65e47] border border-[#d87661]"
              >
                <span className="material-symbols-outlined text-[18px]">emergency</span>
                <span>Protocolo</span>
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
