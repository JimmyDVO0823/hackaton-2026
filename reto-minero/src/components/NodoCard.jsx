import React, { useState, useMemo } from 'react';
import { TIPOS_SITIO } from '../config/tiposSitio.js';
import { LIMITES_DECRETO_1886 } from '../config/limites.js';
import { obtenerUltimasLecturasNodo } from '../demo/historialEjemplo.js';
import { estimarTiempoHastaLimite } from '../core/prediccion.js';

/**
 * Tarjeta individual de nodo sensor con telemetría, predicción de tendencia y acceso al historial.
 * REGLA: Nunca lee un estado escrito a mano; usa nodo.evaluacion.
 */
export function NodoCard({
  nodo,
  isSelected,
  onActivarBocina,
  bocinaActiva = false,
  onVerHistorial,
}) {
  const [ahora] = useState(() => Date.now());

  const { id, nombre, ubicacion, tipoSitio, nivel, lectura, alarmaLocalActiva, evaluacion } = nodo;
  const nivelRiesgo = evaluacion?.nivel ?? 'NORMAL';
  const alertaPrincipal = evaluacion?.alertaPrincipal;

  // ── Paleta por nivel ────────────────────────────────────────────────────────
  const estilos = {
    EVACUACION: {
      border: 'border-l-4 border-l-[#8B3232]',
      badgeBg: 'bg-[#8B3232]/25 border border-[#8B3232]',
      badgeText: 'text-[#D97575]',
      valueText: 'text-[#D97575]',
      ch4Bg: 'bg-[#2E1A17] border-[#8B3232]/60',
      icon: 'sos',
      label: 'EVACUACIÓN',
    },
    ALARMA: {
      border: 'border-l-4 border-l-[#B2533E]',
      badgeBg: 'bg-[#B2533E]/20 border border-[#B2533E]/50',
      badgeText: 'text-[#D87661]',
      valueText: 'text-[#D87661]',
      ch4Bg: 'bg-[#2E1A17] border-[#B2533E]/60',
      icon: 'report',
      label: 'ALARMA – SUSPENDER',
    },
    PRECAUCION: {
      border: 'border-l-4 border-l-[#A38A3A]',
      badgeBg: 'bg-[#A38A3A]/20 border border-[#A38A3A]/50',
      badgeText: 'text-[#C2A855]',
      valueText: 'text-[#C2A855]',
      ch4Bg: 'bg-[#2A261A] border-[#A38A3A]/60',
      icon: 'warning_amber',
      label: 'PRECAUCIÓN',
    },
    SIN_SEÑAL: {
      border: 'border-dashed border-[#5A606E]',
      badgeBg: 'bg-surface-container-highest border border-[#2D3239]',
      badgeText: 'text-secondary',
      valueText: 'text-secondary',
      ch4Bg: 'bg-surface-container-lowest border-[#2D3239]',
      icon: 'signal_disconnected',
      label: 'SIN SEÑAL',
    },
    NORMAL: {
      border: 'border-l-4 border-l-[#4A7A5B]',
      badgeBg: 'bg-[#4A7A5B]/20 border border-[#4A7A5B]/40',
      badgeText: 'text-[#6DAA81]',
      valueText: 'text-[#6DAA81]',
      ch4Bg: 'bg-surface-container-lowest border-[#2D3239]',
      icon: 'verified',
      label: 'NORMAL',
    },
  };
  const e = estilos[nivelRiesgo] ?? estilos.NORMAL;

  // ── Límite CH4 del sitio ────────────────────────────────────────────────────
  const tipoInfo = TIPOS_SITIO[tipoSitio];
  const limitKey = tipoInfo?.limiteMetanoKey;
  const limiteDato = limitKey ? LIMITES_DECRETO_1886.METANO_POR_SITIO[limitKey] : null;
  const limiteValor = limiteDato?.limite ?? 1.0;
  const limiteArticulo = LIMITES_DECRETO_1886.METANO_POR_SITIO.articulo;
  const tipoNombre = tipoInfo?.nombre ?? tipoSitio;

  // ── Predicción de tendencia con las últimas 6 lecturas ───────────────────────
  const prediccion = useMemo(() => {
    const ultimas = obtenerUltimasLecturasNodo(id, 6, ahora);
    return estimarTiempoHastaLimite(ultimas, limiteValor);
  }, [id, limiteValor, ahora]);

  // ── Tiempo desde última transmisión ────────────────────────────────────────
  const fechaLectura = new Date(lectura?.fecha ?? 0);
  const minutos = Math.max(0, Math.round((ahora - fechaLectura.getTime()) / 60000));
  const tiempoTexto = minutos < 60 ? `Hace ${minutos} min` : 'Hace +1h';

  return (
    <article
      id={`card-${id}`}
      className={`flex flex-col p-3.5 bg-surface-container rounded border border-[#2D3239] ${e.border} shadow-sm transition-all ${
        isSelected ? 'highlight-pulse ring-2 ring-[#C29B38]' : ''
      }`}
    >
      {/* ── Cabecera ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-space-sm border-b border-[#2D3239] pb-2.5">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`material-symbols-outlined text-[20px] ${e.valueText}`}>{e.icon}</span>
            <h3 className="font-headline-md text-[17px] font-bold text-on-surface uppercase truncate">
              {nombre}
            </h3>
            <span className="font-code-badge text-[11px] px-1.5 py-0.5 rounded bg-surface-container-high border border-[#2D3239] text-secondary shrink-0">
              {nivel}
            </span>
            {alarmaLocalActiva && (
              <span className="font-code-badge text-[10px] px-2 py-0.5 rounded bg-[#B2533E] text-white font-bold animate-pulse shrink-0 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                SIRENA + BALIZA LOCAL ACTIVA
              </span>
            )}
          </div>
          <span className="font-code-badge text-[11px] text-secondary mt-0.5 truncate">
            {ubicacion} · <strong className="text-on-surface-variant">{tipoNombre}</strong>
          </span>
          {alertaPrincipal?.mensaje && (
            <span
              className={`font-code-badge text-[11px] mt-1 ${
                nivelRiesgo === 'EVACUACION' ? 'text-[#D97575] font-bold'
                : nivelRiesgo === 'ALARMA'    ? 'text-[#D87661] font-semibold'
                : e.valueText
              }`}
            >
              {alertaPrincipal.mensaje}
            </span>
          )}

          {/* Indicador de predicción de tendencia (solo si sube) */}
          {prediccion?.tendencia === 'SUBIENDO' && prediccion.mensaje && (
            <div className="flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded bg-[#A38A3A]/20 border border-[#A38A3A]/50 text-[#C2A855] font-code-badge text-[11px] font-bold self-start">
              <span className="material-symbols-outlined text-[16px] animate-pulse">trending_up</span>
              <span>{prediccion.mensaje}</span>
            </div>
          )}
        </div>

        {/* Badge de estado */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-code-badge text-[12px] font-bold uppercase shrink-0 ${e.badgeBg} ${e.badgeText}`}>
          <span className="material-symbols-outlined text-[16px]">{e.icon}</span>
          <span>{e.label}</span>
        </div>
      </div>

      {/* ── Lecturas de telemetría ────────────────────────────────────────── */}
      {nivelRiesgo === 'SIN_SEÑAL' ? (
        /* Mensaje especial SIN_SEÑAL */
        <div className="flex flex-col gap-2 my-3 p-3 bg-surface-container-lowest rounded border border-dashed border-[#5A606E]">
          <div className="flex items-center gap-2 text-[#9DA3B2]">
            <span className="material-symbols-outlined text-[20px]">signal_disconnected</span>
            <span className="font-code-badge text-[12px] font-bold uppercase tracking-wider">
              Sin transmisión · {tiempoTexto}
            </span>
          </div>
          <p className="font-code-badge text-[11px] text-[#C2A855] bg-[#2A261A]/50 p-2 rounded border border-[#A38A3A]/30 leading-relaxed font-semibold">
            🛡️ La alarma local del nodo sigue protegiendo el sitio.
          </p>
          <div className="flex flex-wrap items-center gap-3 font-code-badge text-[11px] text-secondary mt-1">
            <span>Último CH₄: <strong className="text-on-surface">{lectura?.ch4?.toFixed(1) ?? '--'}%</strong></span>
            <span>·</span>
            <span>O₂: <strong className="text-on-surface">{lectura?.o2?.toFixed(1) ?? '20.9'}%</strong></span>
            <span>·</span>
            <span>CO: <strong className="text-on-surface">{lectura?.co ?? 2} PPM</strong></span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 my-3">
          <div className="grid grid-cols-3 gap-2">
            {/* CH4 Metano */}
            <div className={`flex flex-col p-2 rounded border ${e.ch4Bg}`}>
              <span className="font-code-badge text-[11px] text-secondary">CH₄ METANO</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className={`font-telemetry-value-md text-[24px] font-bold ${e.valueText}`}>
                  {lectura?.ch4?.toFixed(1) ?? '--'}
                </span>
                <span className="font-telemetry-unit text-[12px] text-secondary">%Vol</span>
              </div>
              <span className="font-code-badge text-[10px] text-secondary mt-0.5">
                Límite: {limiteValor.toFixed(1)}% ({limiteArticulo})
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
              <span className="font-code-badge text-[10px] text-secondary mt-0.5">
                Límite por validar
              </span>
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

          {/* Barra Multigas: O2, CO, H2S, NOx, CO2 */}
          <div className="grid grid-cols-5 gap-1 p-2 bg-surface-container-lowest rounded border border-[#2D3239] text-center">
            <div className="flex flex-col" title="Oxígeno (Rango legal 19.5% - 23.5%)">
              <span className="font-code-badge text-[9px] text-secondary uppercase font-semibold">O₂</span>
              <span className="font-code-badge text-[11px] font-bold text-on-surface">{lectura?.o2?.toFixed(1) ?? '20.9'}%</span>
            </div>
            <div className="flex flex-col border-l border-[#2D3239]" title="Monóxido de Carbono (Límite 25 PPM)">
              <span className="font-code-badge text-[9px] text-secondary uppercase font-semibold">CO</span>
              <span className="font-code-badge text-[11px] font-bold text-on-surface">{lectura?.co ?? 2} <span className="text-[8px] font-normal text-secondary">ppm</span></span>
            </div>
            <div className="flex flex-col border-l border-[#2D3239]" title="Ácido Sulfhídrico (Límite 1 PPM)">
              <span className="font-code-badge text-[9px] text-secondary uppercase font-semibold">H₂S</span>
              <span className="font-code-badge text-[11px] font-bold text-on-surface">{lectura?.h2s?.toFixed(2) ?? '0.05'} <span className="text-[8px] font-normal text-secondary">ppm</span></span>
            </div>
            <div className="flex flex-col border-l border-[#2D3239]" title="Gases Nitrosos (Límite 0.2 PPM)">
              <span className="font-code-badge text-[9px] text-secondary uppercase font-semibold">NOx</span>
              <span className="font-code-badge text-[11px] font-bold text-on-surface">{lectura?.nox?.toFixed(2) ?? '0.02'} <span className="text-[8px] font-normal text-secondary">ppm</span></span>
            </div>
            <div className="flex flex-col border-l border-[#2D3239]" title="Dióxido de Carbono (Límite 5000 PPM)">
              <span className="font-code-badge text-[9px] text-secondary uppercase font-semibold">CO₂</span>
              <span className="font-code-badge text-[11px] font-bold text-on-surface">{lectura?.co2 ?? 450} <span className="text-[8px] font-normal text-secondary">ppm</span></span>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer: hardware + acciones ──────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-space-sm pt-2 border-t border-[#2D3239]">
        <div className="flex items-center gap-space-sm text-secondary font-code-badge text-[11px] flex-wrap">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px]">schedule</span>
            <span>{tiempoTexto}</span>
          </span>
        </div>

        {/* Acciones: Ver Historial + Bocina */}
        <div className="flex items-center gap-2">
          {onVerHistorial && (
            <button
              type="button"
              onClick={() => onVerHistorial(id)}
              title={`Ver historial de lecturas de ${nombre}`}
              className="min-h-[40px] px-3 rounded flex items-center gap-1 font-action-label text-[12px] uppercase border bg-surface-container-high hover:bg-surface-variant text-secondary hover:text-on-surface border-[#2D3239] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">show_chart</span>
              <span>Historial</span>
            </button>
          )}

          {onActivarBocina && (
            <button
              type="button"
              onClick={() => onActivarBocina(id)}
              title={bocinaActiva ? 'Bocina activa · clic para desactivar' : 'Activar bocina en este sitio'}
              className={`min-h-[40px] px-3 rounded flex items-center gap-1.5 font-action-label text-[12px] uppercase border transition-colors ${
                bocinaActiva
                  ? 'bg-[#4A7A5B]/30 text-[#6DAA81] border-[#4A7A5B] animate-pulse'
                  : 'bg-surface-container-high text-secondary hover:text-on-surface border-[#2D3239] hover:bg-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {bocinaActiva ? 'volume_up' : 'volume_off'}
              </span>
              <span>{bocinaActiva ? 'Bocina ON' : 'Bocina'}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
