import React from 'react';

/**
 * Tarjeta individual de sector con telemetría de gases y acciones
 */
export function SectorCard({ sector, isSelected, onTriggerAlarm, onRegisterMeasurement }) {
  const { id, name, description, status, statusBadge, warningText, telemetry, pendingAlert, lastMeasurement, statusNote } = sector;

  // Clases según severidad de estado
  const borderClass =
    status === 'ALARMA'
      ? 'border-l-4 border-l-[#B2533E]'
      : status === 'PRECAUCION'
      ? 'border-l-4 border-l-[#A38A3A]'
      : status === 'PENDIENTE'
      ? 'border-dashed border-[#5A606E]'
      : 'border-l-4 border-l-[#4A7A5B]';

  const badgeClass =
    status === 'ALARMA'
      ? 'bg-[#B2533E]/20 border border-[#B2533E]/50 text-[#D87661]'
      : status === 'PRECAUCION'
      ? 'bg-[#A38A3A]/20 border border-[#A38A3A]/50 text-[#C2A855]'
      : status === 'PENDIENTE'
      ? 'bg-surface-container-highest text-secondary border border-[#2D3239]'
      : 'bg-[#4A7A5B]/20 border border-[#4A7A5B]/40 text-[#6DAA81]';

  const badgeIcon =
    status === 'ALARMA'
      ? 'warning'
      : status === 'PRECAUCION'
      ? 'warning_amber'
      : status === 'PENDIENTE'
      ? 'schedule'
      : 'verified';

  return (
    <article
      id={`card-${id}`}
      className={`sector-card flex flex-col p-3.5 bg-surface-container rounded border border-[#2D3239] ${borderClass} shadow-sm transition-all ${
        isSelected ? 'highlight-pulse ring-2 ring-[#C29B38]' : ''
      }`}
    >
      {/* Cabecera de la tarjeta */}
      <div className="flex items-start justify-between gap-space-sm border-b border-[#2D3239] pb-2.5">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span
              className={`material-symbols-outlined text-[20px] ${
                status === 'ALARMA'
                  ? 'text-[#D87661]'
                  : status === 'PRECAUCION'
                  ? 'text-[#C2A855]'
                  : status === 'PENDIENTE'
                  ? 'text-secondary'
                  : 'text-[#6DAA81]'
              }`}
            >
              {status === 'ALARMA' ? 'report' : status === 'PENDIENTE' ? 'pending_actions' : 'check_circle'}
            </span>
            <h3 className="font-headline-md text-[17px] font-bold text-on-surface uppercase">
              {name}
            </h3>
          </div>
          <span className="font-code-badge text-[11px] text-secondary">
            {description}
          </span>
          {warningText && (
            <span className={`font-code-badge text-[11px] ${status === 'ALARMA' ? 'text-[#D87661]' : 'text-secondary'} mt-0.5`}>
              {warningText}
            </span>
          )}
        </div>

        {/* Badge de Estado */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-code-badge text-[12px] font-bold uppercase ${badgeClass}`}>
          <span className="material-symbols-outlined text-[16px]">{badgeIcon}</span>
          <span>{statusBadge}</span>
        </div>
      </div>

      {/* Caso 1: Tarjeta con Alerta Pendiente */}
      {status === 'PENDIENTE' && pendingAlert && (
        <>
          <div className="p-3 my-2.5 rounded bg-surface-container-lowest flex items-center justify-between border border-[#2D3239]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[26px] text-secondary">timer_off</span>
              <div className="flex flex-col">
                <span className="font-action-label text-[14px] text-on-surface font-semibold">
                  {pendingAlert.elapsed}
                </span>
                <span className="font-code-badge text-[11px] text-[#C2A855]">
                  {pendingAlert.limitText}
                </span>
              </div>
            </div>
            <div className="hidden sm:flex flex-col items-end">
              <span className="font-code-badge text-[11px] text-secondary">ÚLTIMA RONDA</span>
              <span className="font-code-badge text-[12px] text-on-surface">{pendingAlert.lastRound}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onRegisterMeasurement(name)}
            className="min-h-[48px] w-full rounded flex items-center justify-center gap-2 font-action-label text-[13px] uppercase font-bold text-[#181a1e] bg-[#C29B38] hover:bg-[#d2b56d] active:scale-[0.98] transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[22px]">add_circle</span>
            <span>Registrar Medición Ahora</span>
          </button>
        </>
      )}

      {/* Caso 2: Tarjeta con Telemetría de Gases */}
      {telemetry && (
        <>
          <div className="grid grid-cols-3 gap-2 my-3">
            {/* CH4 */}
            <div
              className={`flex flex-col p-2 rounded border ${
                telemetry.ch4.isAlert
                  ? 'bg-[#2A261A] border-[#A38A3A]/60'
                  : 'bg-surface-container-lowest border-[#2D3239]'
              }`}
            >
              <span
                className={`font-code-badge text-[11px] ${
                  telemetry.ch4.isAlert ? 'text-[#C2A855] font-semibold' : 'text-secondary'
                }`}
              >
                {telemetry.ch4.label}
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span
                  className={`font-telemetry-value-md text-[24px] font-bold ${
                    telemetry.ch4.isAlert ? 'text-[#C2A855]' : 'text-on-surface'
                  }`}
                >
                  {telemetry.ch4.value}
                </span>
                <span
                  className={`font-telemetry-unit text-[12px] ${
                    telemetry.ch4.isAlert ? 'text-[#C2A855]' : 'text-secondary'
                  }`}
                >
                  {telemetry.ch4.unit}
                </span>
              </div>
              <span
                className={`font-code-badge text-[10px] mt-0.5 ${
                  telemetry.ch4.isAlert ? 'text-[#C2A855] font-semibold uppercase' : 'text-[#6DAA81] font-semibold'
                }`}
              >
                {telemetry.ch4.statusText}
              </span>
            </div>

            {/* O2 */}
            <div className="flex flex-col p-2 bg-surface-container-lowest rounded border border-[#2D3239]">
              <span className="font-code-badge text-[11px] text-secondary">
                {telemetry.o2.label}
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-telemetry-value-md text-[24px] font-bold text-on-surface">
                  {telemetry.o2.value}
                </span>
                <span className="font-telemetry-unit text-[12px] text-secondary">
                  {telemetry.o2.unit}
                </span>
              </div>
              <span className="font-code-badge text-[10px] text-[#6DAA81] font-semibold mt-0.5">
                {telemetry.o2.statusText}
              </span>
            </div>

            {/* CO */}
            <div
              className={`flex flex-col p-2 rounded border ${
                telemetry.co.isAlert
                  ? 'bg-[#2E1A17] border-[#B2533E]/60'
                  : 'bg-surface-container-lowest border-[#2D3239]'
              }`}
            >
              <span
                className={`font-code-badge text-[11px] font-bold ${
                  telemetry.co.isAlert ? 'text-[#D87661]' : 'text-secondary'
                }`}
              >
                {telemetry.co.label}
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span
                  className={`font-telemetry-value-md text-[24px] font-bold ${
                    telemetry.co.isAlert ? 'text-[#D87661]' : 'text-on-surface'
                  }`}
                >
                  {telemetry.co.value}
                </span>
                <span
                  className={`font-telemetry-unit text-[12px] ${
                    telemetry.co.isAlert ? 'text-[#D87661]' : 'text-secondary'
                  }`}
                >
                  {telemetry.co.unit}
                </span>
              </div>
              <span
                className={`font-code-badge text-[10px] font-bold mt-0.5 ${
                  telemetry.co.isAlert ? 'text-[#D87661] uppercase' : 'text-[#6DAA81]'
                }`}
              >
                {telemetry.co.statusText}
              </span>
            </div>
          </div>

          {/* Footer de la tarjeta con auditoría y acciones */}
          <div className="flex flex-wrap items-center justify-between gap-space-sm pt-2 border-t border-[#2D3239]">
            {lastMeasurement && (
              <div className="flex items-center gap-space-xs text-secondary font-code-badge text-[12px]">
                <span className="material-symbols-outlined text-[16px]">history_toggle_off</span>
                <span>
                  {lastMeasurement.timeAgo} · <strong>{lastMeasurement.operator}</strong>
                </span>
              </div>
            )}
            {statusNote && (
              <span className="text-[#6DAA81] font-code-badge text-[11px] font-semibold">
                {statusNote}
              </span>
            )}

            {/* Botones de acción */}
            <div className="flex items-center gap-2">
              {status === 'ALARMA' && (
                <>
                  <button
                    type="button"
                    onClick={() => alert(`Alarmas silenciadas temporalmente para ${name}.`)}
                    className="min-h-[48px] px-3.5 bg-surface-container-high text-secondary hover:text-on-surface rounded flex items-center justify-center font-action-label text-[13px] uppercase border border-[#2D3239] hover:bg-surface-variant transition-colors"
                  >
                    Silenciar
                  </button>
                  <button
                    type="button"
                    onClick={() => onTriggerAlarm(name)}
                    className="min-h-[48px] px-4 rounded flex items-center gap-1.5 font-action-label text-[13px] uppercase font-bold transition-all active:scale-[0.98] text-white bg-[#B2533E] hover:bg-[#c65e47] border border-[#d87661]"
                  >
                    <span className="material-symbols-outlined text-[20px]">emergency</span>
                    <span>Protocolo Alarma</span>
                  </button>
                </>
              )}

              {status === 'PRECAUCION' && (
                <button
                  type="button"
                  onClick={() => alert(`Ventilación verificada y reforzada en ${name}.`)}
                  className="min-h-[48px] px-4 bg-surface-container-high text-[#E2E8F0] hover:text-white rounded flex items-center gap-1.5 font-action-label text-[13px] uppercase border border-[#2D3239] hover:bg-surface-variant active:scale-[0.98] transition-all"
                >
                  <span className="material-symbols-outlined text-[20px] text-[#A6ABB8]">air</span>
                  <span>Verificar Ventilación</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </article>
  );
}
