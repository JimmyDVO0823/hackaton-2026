import React from 'react';

/**
 * Panel de Monitoreo de Polvo de Carbón (PM2.5 / PM10) por Zonas de la Mina.
 * Permite identificar en tiempo real qué sectores y niveles subterráneos
 * presentan aumento de concentración de material particulado y tendencias sostenidas.
 */
export function ZonasPolvoPanel({ nodos = [], onSelectNodo, onVerHistorial }) {
  // Ordenar nodos por criticidad de polvo (los que están aumentando o tienen mayor PM2.5 primero)
  const zonasOrdenadas = [...nodos].sort((a, b) => {
    const aSost = a.lectura?.aumentoSostenidoPm25 ? 1 : 0;
    const bSost = b.lectura?.aumentoSostenidoPm25 ? 1 : 0;
    if (bSost !== aSost) return bSost - aSost;

    const aAum = a.lectura?.tendenciaPm25 === 'AUMENTANDO' ? 1 : 0;
    const bAum = b.lectura?.tendenciaPm25 === 'AUMENTANDO' ? 1 : 0;
    if (bAum !== aAum) return bAum - aAum;

    return (b.lectura?.pm25 ?? 0) - (a.lectura?.pm25 ?? 0);
  });

  const zonasAumentando = nodos.filter(
    (n) => n.lectura?.tendenciaPm25 === 'AUMENTANDO' || n.lectura?.tendenciaPm10 === 'AUMENTANDO'
  );
  const zonasSostenidas = nodos.filter(
    (n) => n.lectura?.aumentoSostenidoPm25 || n.lectura?.aumentoSostenidoPm10
  );

  return (
    <section
      aria-label="Identificación de Zonas con Aumento de Polvo"
      className="flex flex-col bg-surface-container rounded-lg border border-[#2D3239] p-4 gap-3 shadow-sm"
    >
      {/* Cabecera del Panel */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2D3239] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded bg-[#A38A3A]/20 border border-[#A38A3A]/50 flex items-center justify-center shrink-0 text-[#C2A855]">
            <span className="material-symbols-outlined text-[20px]">grain</span>
          </div>
          <div>
            <h2 className="font-action-label text-[15px] font-bold text-on-surface uppercase tracking-wide">
              Identificación de Zonas de Mina · Concentración de Polvo (PM2.5 / PM10)
            </h2>
            <p className="font-code-badge text-[11px] text-secondary">
              Georreferenciación temporal por sector, cota y nivel para control de material particulado
            </p>
          </div>
        </div>

        {/* Badges de Resumen */}
        <div className="flex items-center gap-2 font-code-badge text-[11px] flex-wrap">
          {zonasSostenidas.length > 0 && (
            <span className="px-2.5 py-1 rounded bg-[#B2533E]/20 text-[#D87661] border border-[#B2533E]/50 font-bold flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#D87661]" />
              {zonasSostenidas.length} Zona(s) con Aumento Sostenido
            </span>
          )}
          <span className="px-2.5 py-1 rounded bg-surface-container-highest border border-[#2D3239] text-secondary">
            {zonasAumentando.length} de {nodos.length} zonas en ascenso
          </span>
        </div>
      </div>

      {/* Grid de Zonas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {zonasOrdenadas.map((nodo) => {
          const l = nodo.lectura;
          const pm25 = l?.pm25 ?? 0;
          const pm10 = l?.pm10 ?? 0;
          const fechaHora = l?.fecha ? new Date(l.fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : '--';
          const esAlarma = pm25 >= 50 || pm10 >= 150;
          const esAumento = l?.tendenciaPm25 === 'AUMENTANDO' || l?.tendenciaPm10 === 'AUMENTANDO';
          const esSostenido = l?.aumentoSostenidoPm25 || l?.aumentoSostenidoPm10;

          return (
            <div
              key={nodo.id}
              className={`flex flex-col p-3 rounded-lg border transition-all ${
                esAlarma
                  ? 'bg-[#2E1A17] border-[#B2533E]/70 shadow-sm'
                  : esSostenido
                  ? 'bg-[#2A261A] border-[#A38A3A]/70 shadow-sm'
                  : 'bg-surface-container-lowest border-[#2D3239]'
              }`}
            >
              {/* Identificación de Ubicación y Nivel */}
              <div className="flex items-start justify-between gap-2 border-b border-[#2D3239]/60 pb-2">
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-action-label text-[13px] font-bold text-on-surface truncate">
                      {nodo.nombre}
                    </span>
                    <span className="font-code-badge text-[10px] px-1.5 py-0.2 rounded bg-surface-container-high border border-[#2D3239] text-secondary shrink-0">
                      {nodo.nivel}
                    </span>
                  </div>
                  <span className="font-code-badge text-[10px] text-secondary truncate mt-0.5">
                    📍 {nodo.ubicacion}
                  </span>
                </div>

                {/* Hora de medición */}
                <span className="font-code-badge text-[10px] text-secondary whitespace-nowrap flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">schedule</span>
                  {fechaHora}
                </span>
              </div>

              {/* Métricas PM2.5 y PM10 */}
              <div className="grid grid-cols-2 gap-2 my-2.5">
                {/* PM2.5 */}
                <div className="flex flex-col p-1.5 rounded bg-surface-container/60 border border-[#2D3239]/60">
                  <span className="font-code-badge text-[9px] text-secondary uppercase font-semibold">
                    PM2.5 Respirable
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span
                      className={`font-telemetry-value-md text-[17px] font-bold ${
                        pm25 >= 50 ? 'text-[#D87661]' : pm25 >= 35 ? 'text-[#C2A855]' : 'text-on-surface'
                      }`}
                    >
                      {pm25.toFixed(1)}
                    </span>
                    <span className="font-telemetry-unit text-[10px] text-secondary">µg/m³</span>
                  </div>
                  <span className="font-code-badge text-[9px] text-secondary mt-0.5">
                    Lím: 50 | Alerta: 35
                  </span>
                </div>

                {/* PM10 */}
                <div className="flex flex-col p-1.5 rounded bg-surface-container/60 border border-[#2D3239]/60">
                  <span className="font-code-badge text-[9px] text-secondary uppercase font-semibold">
                    PM10 Inhalable
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span
                      className={`font-telemetry-value-md text-[17px] font-bold ${
                        pm10 >= 150 ? 'text-[#D87661]' : pm10 >= 100 ? 'text-[#C2A855]' : 'text-on-surface'
                      }`}
                    >
                      {pm10.toFixed(1)}
                    </span>
                    <span className="font-telemetry-unit text-[10px] text-secondary">µg/m³</span>
                  </div>
                  <span className="font-code-badge text-[9px] text-secondary mt-0.5">
                    Lím: 150 | Alerta: 100
                  </span>
                </div>
              </div>

              {/* Estado de Tendencia y Alertas */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#2D3239]/60">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded font-code-badge text-[10px] font-bold flex items-center gap-1 ${
                      esSostenido || esAlarma
                        ? 'bg-[#B2533E]/20 text-[#D87661] border border-[#B2533E]/50'
                        : esAumento
                        ? 'bg-[#A38A3A]/20 text-[#C2A855] border border-[#A38A3A]/50'
                        : l?.tendenciaPm25 === 'DISMINUYENDO'
                        ? 'bg-[#4A7A5B]/20 text-[#6DAA81] border border-[#4A7A5B]/50'
                        : 'bg-surface-container-high text-secondary border border-[#2D3239]'
                    }`}
                  >
                    <span>
                      {l?.tendenciaPm25 === 'AUMENTANDO'
                        ? '↗'
                        : l?.tendenciaPm25 === 'DISMINUYENDO'
                        ? '↘'
                        : '→'}
                    </span>
                    <span>
                      {esSostenido
                        ? 'Aumento Sostenido'
                        : l?.tendenciaPm25 === 'AUMENTANDO'
                        ? 'Aumentando'
                        : l?.tendenciaPm25 === 'DISMINUYENDO'
                        ? 'Disminuyendo'
                        : 'Estable'}
                    </span>
                  </span>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1.5">
                  {onSelectNodo && (
                    <button
                      type="button"
                      onClick={() => onSelectNodo(nodo.id)}
                      title="Enfocar nodo en mapa"
                      className="px-2 py-1 rounded bg-surface-container-high hover:bg-surface-variant text-secondary hover:text-on-surface font-code-badge text-[10px] border border-[#2D3239] transition-colors"
                    >
                      Mapa
                    </button>
                  )}
                  {onVerHistorial && (
                    <button
                      type="button"
                      onClick={() => onVerHistorial(nodo.id)}
                      title="Ver historial de polvo"
                      className="px-2 py-1 rounded bg-surface-container-high hover:bg-surface-variant text-secondary hover:text-on-surface font-code-badge text-[10px] border border-[#2D3239] transition-colors flex items-center gap-0.5"
                    >
                      <span className="material-symbols-outlined text-[13px]">show_chart</span>
                      <span>Historial</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

