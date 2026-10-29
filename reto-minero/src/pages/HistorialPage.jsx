import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import {
  generarHistorial24h,
  NODOS_METADATA,
} from '../demo/historialEjemplo.js';
import { exportarLecturasCsv } from '../utils/exportarCsv.js';
import { useToast } from '../components/Toast.jsx';

/**
 * Pantalla de Historial con Gráfico de Tendencias y Tabla de Auditoría.
 * Cumple con los requisitos de la Fase 5:
 * - Filtros por nodo, nivel de mina, variable (CH4, temp, hum) y rango temporal (6h, 12h, 24h).
 * - Gráfico con línea punteada en el límite legal y franja sombreada de precaución (50% a 100%).
 * - Tabla con chip de alerta y paginación ergonómica.
 * - Botón "Exportar CSV".
 */
export function HistorialPage({ initialNodoId = null, onVolverTablero }) {
  const { mostrarToast } = useToast();
  const [ahora] = useState(() => Date.now());

  // Generar datos deterministas de 24 horas
  const todoHistorial = useMemo(() => generarHistorial24h(ahora), [ahora]);

  // ── Filtros de estado ───────────────────────────────────────────────────────
  const [filtroNodo, setFiltroNodo]         = useState(initialNodoId || 'TODOS');
  const [filtroNivel, setFiltroNivel]       = useState('TODOS');
  const [filtroVariable, setFiltroVariable] = useState('ch4'); // 'ch4' | 'temperatura' | 'humedad'
  const [filtroRango, setFiltroRango]       = useState(24);   // 6 | 12 | 24 horas
  const [paginaActual, setPaginaActual]     = useState(1);
  const elementosPorPagina = 12;

  // ── Filtrado en memoria ─────────────────────────────────────────────────────
  const lecturasFiltradas = useMemo(() => {
    const limiteMinutos = filtroRango * 60;

    return todoHistorial.filter((item) => {
      // Filtro por rango
      if (item.minutosAtras > limiteMinutos) return false;
      // Filtro por nodo
      if (filtroNodo !== 'TODOS' && item.nodoId !== filtroNodo) return false;
      // Filtro por nivel de mina
      if (filtroNivel !== 'TODOS' && item.nivelMina !== filtroNivel) return false;
      return true;
    });
  }, [todoHistorial, filtroRango, filtroNodo, filtroNivel]);

  // Nodo seleccionado actual para obtener metadatos específicos (límite, etc.)
  const nodoMetaActual = useMemo(() => {
    if (filtroNodo === 'TODOS') return null;
    return NODOS_METADATA.find((n) => n.id === filtroNodo) || null;
  }, [filtroNodo]);

  const limiteSitio = nodoMetaActual?.limite ?? 1.0;

  // ── Preparar datos para el gráfico de Recharts ──────────────────────────────
  const datosGrafico = useMemo(() => {
    // Si hay un nodo específico seleccionado, graficar sus lecturas ordenadas
    if (filtroNodo !== 'TODOS') {
      return lecturasFiltradas.map((r) => ({
        hora: r.horaFormateada,
        valor: r[filtroVariable],
        ch4: r.ch4,
        temperatura: r.temperatura,
        humedad: r.humedad,
        nodo: r.nombreNodo,
      }));
    }

    // Si "TODOS" está seleccionado, agrupar por hora promedio para ver la tendencia global
    const mapaPorHora = new Map();
    for (const r of lecturasFiltradas) {
      if (!mapaPorHora.has(r.horaFormateada)) {
        mapaPorHora.set(r.horaFormateada, { suma: 0, count: 0, hora: r.horaFormateada });
      }
      const entry = mapaPorHora.get(r.horaFormateada);
      entry.suma += r[filtroVariable];
      entry.count += 1;
    }

    return Array.from(mapaPorHora.values()).map((e) => ({
      hora: e.hora,
      valor: Number((e.suma / e.count).toFixed(2)),
    }));
  }, [lecturasFiltradas, filtroNodo, filtroVariable]);

  // ── Paginación de la tabla ──────────────────────────────────────────────────
  // Tabla en orden descendente (más recientes primero)
  const lecturasDescendentes = useMemo(() => {
    return [...lecturasFiltradas].sort((a, b) => b.timestamp - a.timestamp);
  }, [lecturasFiltradas]);

  const totalPaginas = Math.max(1, Math.ceil(lecturasDescendentes.length / elementosPorPagina));
  const inicioIdx = (paginaActual - 1) * elementosPorPagina;
  const lecturasPaginadas = lecturasDescendentes.slice(inicioIdx, inicioIdx + elementosPorPagina);

  const handleExportarCsv = () => {
    const nombre = `telemetria-${filtroNodo.toLowerCase()}-${filtroRango}h.csv`;
    const ok = exportarLecturasCsv(lecturasFiltradas, nombre);
    if (ok) {
      mostrarToast(`Exportación exitosa: ${lecturasFiltradas.length} registros en ${nombre}`, 'success');
    } else {
      mostrarToast('No hay datos para exportar con los filtros actuales', 'warning');
    }
  };

  // Configuración de la variable seleccionada
  const configVar = {
    ch4: {
      nombre: 'Metano (CH₄)',
      unidad: '%Vol',
      color: '#C2A855',
      stroke: '#EAB308',
      min: 0,
      max: 2.0,
    },
    temperatura: {
      nombre: 'Temperatura',
      unidad: '°C',
      color: '#E07A5F',
      stroke: '#F97316',
      min: 20,
      max: 35,
    },
    humedad: {
      nombre: 'Humedad Relativa',
      unidad: '%',
      color: '#3B82F6',
      stroke: '#60A5FA',
      min: 50,
      max: 100,
    },
  }[filtroVariable];

  return (
    <div className="flex flex-col w-full p-space-md gap-space-md bg-surface text-on-surface">
      {/* ── Encabezado de la página ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-space-md bg-surface-container p-4 rounded-lg border border-[#2D3239]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#C29B38]/15 border border-[#C29B38]/40 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[#C29B38] text-[24px]">history</span>
          </div>
          <div className="flex flex-col">
            <h1 className="font-headline-md text-[20px] font-bold text-on-surface uppercase leading-tight">
              Historial y Tendencias de Telemetría
            </h1>
            <span className="font-code-badge text-[12px] text-secondary">
              Muestreo cada 10 min · Datos deterministas de 24 h · Decreto 1886 de 2015
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onVolverTablero && (
            <button
              type="button"
              onClick={onVolverTablero}
              className="min-h-[42px] px-3.5 bg-surface-container-high rounded text-secondary hover:text-on-surface flex items-center gap-1.5 font-action-label text-[13px] uppercase border border-[#2D3239] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Tablero</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExportarCsv}
            className="min-h-[42px] px-4 rounded bg-[#4A7A5B] hover:bg-[#5b9570] text-white flex items-center gap-2 font-action-label text-[13px] uppercase font-bold transition-all shadow-md active:scale-98"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* ── Barra de Filtros Interactivos ─────────────────────────────────── */}
      <section
        aria-label="Filtros de telemetría"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-surface-container-low p-3.5 rounded-lg border border-[#2D3239]"
      >
        {/* 1. Selector de Nodo */}
        <div className="flex flex-col gap-1">
          <label htmlFor="filtro-nodo" className="font-code-badge text-[11px] text-secondary uppercase font-semibold">
            Nodo Sensor:
          </label>
          <select
            id="filtro-nodo"
            value={filtroNodo}
            onChange={(e) => {
              setFiltroNodo(e.target.value);
              setPaginaActual(1);
            }}
            className="w-full min-h-[42px] bg-surface-container-lowest px-3 py-1.5 rounded text-on-surface font-body-md text-[13px] border border-[#2D3239] focus:outline-none focus:border-[#C29B38]"
          >
            <option value="TODOS">Todos los nodos ({NODOS_METADATA.length})</option>
            {NODOS_METADATA.map((n) => (
              <option key={n.id} value={n.id}>
                {n.nombre} ({n.nivel})
              </option>
            ))}
          </select>
        </div>

        {/* 2. Selector de Nivel de Mina */}
        <div className="flex flex-col gap-1">
          <label htmlFor="filtro-nivel" className="font-code-badge text-[11px] text-secondary uppercase font-semibold">
            Nivel de Mina:
          </label>
          <select
            id="filtro-nivel"
            value={filtroNivel}
            onChange={(e) => {
              setFiltroNivel(e.target.value);
              setPaginaActual(1);
            }}
            className="w-full min-h-[42px] bg-surface-container-lowest px-3 py-1.5 rounded text-on-surface font-body-md text-[13px] border border-[#2D3239] focus:outline-none focus:border-[#C29B38]"
          >
            <option value="TODOS">Todos los niveles</option>
            <option value="N-1">Nivel 1 (-310 m)</option>
            <option value="N-2">Nivel 2 (-420 m)</option>
            <option value="N-3">Nivel 3 (-540 m)</option>
          </select>
        </div>

        {/* 3. Selector de Variable */}
        <div className="flex flex-col gap-1">
          <label htmlFor="filtro-variable" className="font-code-badge text-[11px] text-secondary uppercase font-semibold">
            Variable Ambiental:
          </label>
          <select
            id="filtro-variable"
            value={filtroVariable}
            onChange={(e) => setFiltroVariable(e.target.value)}
            className="w-full min-h-[42px] bg-surface-container-lowest px-3 py-1.5 rounded text-on-surface font-body-md text-[13px] border border-[#2D3239] focus:outline-none focus:border-[#C29B38]"
          >
            <option value="ch4">Metano — CH₄ (%Vol)</option>
            <option value="temperatura">Temperatura (°C)</option>
            <option value="humedad">Humedad Relativa (%)</option>
          </select>
        </div>

        {/* 4. Selector de Rango Temporal */}
        <div className="flex flex-col gap-1">
          <span className="font-code-badge text-[11px] text-secondary uppercase font-semibold">
            Rango Temporal:
          </span>
          <div className="flex items-center bg-surface-container-lowest p-1 rounded border border-[#2D3239] gap-1">
            {[6, 12, 24].map((rango) => (
              <button
                key={rango}
                type="button"
                onClick={() => {
                  setFiltroRango(rango);
                  setPaginaActual(1);
                }}
                className={`flex-1 min-h-[34px] rounded font-code-badge text-[12px] font-bold uppercase transition-colors ${
                  filtroRango === rango
                    ? 'bg-surface-container-high text-on-surface border border-[#2D3239]'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                {rango} h
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gráfico Interactivo de Línea (Recharts) ───────────────────────── */}
      <section
        aria-label="Gráfico de tendencia"
        className="flex flex-col bg-surface-container rounded-lg border border-[#2D3239] p-4 gap-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2D3239] pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#C29B38] text-[20px]">show_chart</span>
            <h2 className="font-action-label text-[15px] font-bold text-on-surface uppercase">
              Curva de Tendencia: {configVar.nombre} ({configVar.unidad})
            </h2>
          </div>

          <div className="flex items-center gap-4 text-secondary font-code-badge text-[11px] flex-wrap">
            {filtroVariable === 'ch4' && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 border-t-2 border-dashed border-[#B2533E]" />
                  <span>Límite Legal ({limiteSitio.toFixed(1)}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-2 bg-[#A38A3A]/25 border border-[#A38A3A]/40 rounded-xs" />
                  <span>Franja Precaución ({((limiteSitio * 0.5)).toFixed(2)}% - {limiteSitio.toFixed(1)}%)</span>
                </div>
              </>
            )}
            <span>Mostrando {datosGrafico.length} puntos ({filtroRango} h)</span>
          </div>
        </div>

        {/* Contenedor del Gráfico */}
        <div className="w-full h-[320px] pt-2">
          {datosGrafico.length === 0 ? (
            <div className="h-full flex items-center justify-center text-secondary font-code-badge text-[13px]">
              No hay datos disponibles para el filtro seleccionado
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={datosGrafico} margin={{ top: 10, right: 24, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#252932" />
                <XAxis
                  dataKey="hora"
                  stroke="#7A7F8C"
                  tick={{ fontSize: 11, fontFamily: 'JetBrains Mono', fill: '#9DA3B2' }}
                  tickLine={false}
                />
                <YAxis
                  stroke="#7A7F8C"
                  unit={` ${configVar.unidad}`}
                  domain={[configVar.min, configVar.max]}
                  tick={{ fontSize: 11, fontFamily: 'JetBrains Mono', fill: '#9DA3B2' }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#181A1F',
                    border: '1px solid #2D3239',
                    borderRadius: '6px',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '12px',
                    color: '#E2E8F0',
                  }}
                  formatter={(val) => [`${val} ${configVar.unidad}`, configVar.nombre]}
                  labelFormatter={(lbl) => `Hora: ${lbl}`}
                />

                {/* Franja de Precaución (50% a 100% del límite) para CH4 */}
                {filtroVariable === 'ch4' && (
                  <ReferenceArea
                    y1={limiteSitio * 0.5}
                    y2={limiteSitio}
                    fill="#A38A3A"
                    fillOpacity={0.10}
                  />
                )}

                {/* Línea punteada en el Límite Legal para CH4 */}
                {filtroVariable === 'ch4' && (
                  <ReferenceLine
                    y={limiteSitio}
                    stroke="#B2533E"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    label={{
                      value: `Límite ${limiteSitio.toFixed(1)}%`,
                      position: 'top',
                      fill: '#D87661',
                      fontSize: 10,
                      fontFamily: 'JetBrains Mono',
                    }}
                  />
                )}

                {/* Línea de referencia en 32°C para Temperatura */}
                {filtroVariable === 'temperatura' && (
                  <ReferenceLine
                    y={32}
                    stroke="#B2533E"
                    strokeDasharray="4 4"
                    label={{
                      value: 'Máx 32°C (por validar)',
                      position: 'top',
                      fill: '#D87661',
                      fontSize: 10,
                      fontFamily: 'JetBrains Mono',
                    }}
                  />
                )}

                {/* Línea de datos */}
                <Line
                  type="monotone"
                  dataKey="valor"
                  name={configVar.nombre}
                  stroke={configVar.stroke}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: configVar.stroke }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* ── Tabla de Auditoría de Lecturas ─────────────────────────────────── */}
      <section
        aria-label="Tabla de lecturas históricas"
        className="flex flex-col bg-surface-container rounded-lg border border-[#2D3239] p-4 gap-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2D3239] pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">table_rows</span>
            <h2 className="font-action-label text-[15px] font-bold text-on-surface uppercase">
              Registro Tabular de Telemetría ({lecturasFiltradas.length} mediciones)
            </h2>
          </div>

          <span className="font-code-badge text-[12px] text-secondary">
            Página {paginaActual} de {totalPaginas}
          </span>
        </div>

        {/* Contenedor de Tabla con Scroll Horizontal Responsivo */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2D3239] bg-surface-container-lowest font-code-badge text-[11px] text-secondary uppercase">
                <th className="p-2.5">Fecha y Hora</th>
                <th className="p-2.5">Nodo Sensor</th>
                <th className="p-2.5">Nivel Mina</th>
                <th className="p-2.5">CH₄ (%Vol)</th>
                <th className="p-2.5">Temp (°C)</th>
                <th className="p-2.5">Humedad (%)</th>
                <th className="p-2.5">Estado Normativo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D3239] font-body-md text-[13px]">
              {lecturasPaginadas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-secondary font-code-badge">
                    No se encontraron registros para los filtros seleccionados
                  </td>
                </tr>
              ) : (
                lecturasPaginadas.map((r) => {
                  const esAlarma = r.alertaNivel === 'ALARMA' || r.alertaNivel === 'EVACUACION';
                  const esPrecaucion = r.alertaNivel === 'PRECAUCION';

                  const badgeClass =
                    r.alertaNivel === 'EVACUACION'
                      ? 'bg-[#8B3232]/25 text-[#D97575] border-[#8B3232]'
                      : r.alertaNivel === 'ALARMA'
                      ? 'bg-[#B2533E]/20 text-[#D87661] border-[#B2533E]/50'
                      : r.alertaNivel === 'PRECAUCION'
                      ? 'bg-[#A38A3A]/20 text-[#C2A855] border-[#A38A3A]/50'
                      : r.alertaNivel === 'SIN_SEÑAL'
                      ? 'bg-surface-container-highest text-secondary border-[#2D3239]'
                      : 'bg-[#4A7A5B]/20 text-[#6DAA81] border-[#4A7A5B]/40';

                  return (
                    <tr key={r.id} className="hover:bg-surface-container-high transition-colors">
                      <td className="p-2.5 font-code-badge text-[12px] text-secondary whitespace-nowrap">
                        {r.horaFormateada}
                      </td>
                      <td className="p-2.5 font-semibold text-on-surface whitespace-nowrap">
                        {r.nombreNodo}
                      </td>
                      <td className="p-2.5 font-code-badge text-[11px] text-secondary">
                        {r.nivelMina}
                      </td>
                      <td
                        className={`p-2.5 font-telemetry-value-md text-[14px] font-bold ${
                          esAlarma
                            ? 'text-[#D87661]'
                            : esPrecaucion
                            ? 'text-[#C2A855]'
                            : 'text-on-surface'
                        }`}
                      >
                        {r.ch4.toFixed(2)}%
                      </td>
                      <td className="p-2.5 font-telemetry-value-md text-[13px] text-secondary">
                        {r.temperatura.toFixed(1)}°
                      </td>
                      <td className="p-2.5 font-telemetry-value-md text-[13px] text-secondary">
                        {r.humedad}%
                      </td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded font-code-badge text-[11px] font-bold uppercase border ${badgeClass}`}
                        >
                          {r.alertaNivel}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginador */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between pt-2 border-t border-[#2D3239]">
            <span className="font-code-badge text-[11px] text-secondary">
              Mostrando {inicioIdx + 1} a {Math.min(inicioIdx + elementosPorPagina, lecturasFiltradas.length)} de{' '}
              {lecturasFiltradas.length}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                className="min-h-[34px] px-3 rounded bg-surface-container-high text-secondary hover:text-on-surface disabled:opacity-40 disabled:pointer-events-none font-code-badge text-[11px] uppercase border border-[#2D3239] transition-colors"
              >
                Anterior
              </button>

              <span className="font-code-badge text-[11px] px-2 text-on-surface">
                {paginaActual} / {totalPaginas}
              </span>

              <button
                type="button"
                disabled={paginaActual >= totalPaginas}
                onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
                className="min-h-[34px] px-3 rounded bg-surface-container-high text-secondary hover:text-on-surface disabled:opacity-40 disabled:pointer-events-none font-code-badge text-[11px] uppercase border border-[#2D3239] transition-colors"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

