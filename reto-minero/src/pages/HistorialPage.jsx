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
import { exportarLecturasCsv, exportarResumenTurno } from '../utils/exportarCsv.js';
import { obtenerInfoTurnos } from '../core/turnos.js';
import { useToast } from '../components/Toast.jsx';
import { useMina } from '../hooks/useMina.js';

/**
 * Pantalla de Historial con Gráfico de Tendencias Multigas y Tabla de Auditoría.
 * Cumple con Decreto 1886 de 2015:
 * - Gráfico de gases: Metano (CH4), Oxígeno (O2), Monóxido de Carbono (CO), Ácido Sulfhídrico (H2S),
 *   Gases Nitrosos (NOx/NO2), Dióxido de Carbono (CO2), además de Temperatura y Humedad.
 * - Límites normativos visuales (línea discontinua legal y franja sombreada de precaución).
 * - Entrega de "Resumen de Turno" (cada 8 horas) en CSV para auditoría legal.
 * - SIN BATERÍAS NI SEÑAL WIFI (sensores a red eléctrica fija 24/7).
 */
export function HistorialPage({ initialNodoId = null, onVolverTablero }) {
  const { mostrarToast } = useToast();
  const { supervisorTurno } = useMina();
  const [ahora] = useState(() => Date.now());

  // Generar datos deterministas de 24 horas
  const todoHistorial = useMemo(() => generarHistorial24h(ahora), [ahora]);

  // Turno actual
  const infoTurnos = useMemo(() => obtenerInfoTurnos(ahora), [ahora]);

  // ── Filtros de estado ───────────────────────────────────────────────────────
  const nodoInicialValido = (initialNodoId && initialNodoId !== 'TODOS')
    ? initialNodoId
    : NODOS_METADATA[0].id;
  const [filtroNodo, setFiltroNodo]         = useState(nodoInicialValido);
  const [filtroVariable, setFiltroVariable] = useState('ch4'); // ch4, o2, co, h2s, nox, co2, temperatura, humedad
  const [filtroRango, setFiltroRango]       = useState(24);   // 8 (turno) | 6 | 12 | 24 horas
  const [paginaActual, setPaginaActual]     = useState(1);
  const elementosPorPagina = 12;

  // ── Filtrado en memoria ─────────────────────────────────────────────────────
  const lecturasFiltradas = useMemo(() => {
    const finMinutos = filtroRango * 60;

    // Si es filtro por turno actual
    if (filtroRango === 'turno_actual') {
      const { inicioTimestamp, finTimestamp } = infoTurnos.turnoActual;
      return todoHistorial.filter((item) => {
        if (item.timestamp < inicioTimestamp || item.timestamp > finTimestamp) return false;
        return item.nodoId === filtroNodo;
      });
    }

    return todoHistorial.filter((item) => {
      if (item.minutosAtras > finMinutos) return false;
      return item.nodoId === filtroNodo;
    });
  }, [todoHistorial, filtroRango, filtroNodo, infoTurnos]);

  // Nodo seleccionado actual para obtener metadatos específicos (límite, etc.)
  const nodoMetaActual = useMemo(() => {
    return NODOS_METADATA.find((n) => n.id === filtroNodo) || NODOS_METADATA[0];
  }, [filtroNodo]);

  const limiteSitio = nodoMetaActual?.limite ?? 1.0;

  // ── Preparar datos para el gráfico de Recharts ──────────────────────────────
  const datosGrafico = useMemo(() => {
    return lecturasFiltradas.map((r) => ({
      hora: r.horaFormateada,
      valor: r[filtroVariable],
      ch4: r.ch4,
      o2: r.o2,
      co: r.co,
      h2s: r.h2s,
      nox: r.nox,
      co2: r.co2,
      temperatura: r.temperatura,
      humedad: r.humedad,
      pm25: r.pm25,
      pm10: r.pm10,
      nodo: r.nombreNodo,
    }));
  }, [lecturasFiltradas, filtroVariable]);

  // ── Paginación de la tabla ──────────────────────────────────────────────────
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

  const handleDescargarResumenTurno = () => {
    const ok = exportarResumenTurno(todoHistorial, infoTurnos.turnoActual, supervisorTurno);
    if (ok) {
      mostrarToast(`Resumen oficial de ${infoTurnos.turnoActual.nombre} descargado exitosamente`, 'success');
    }
  };

  // Configuración de cada variable y sus límites normativos (Decreto 1886)
  const configVar = {
    ch4: {
      nombre: 'Metano (CH₄)',
      unidad: '%Vol',
      color: '#C2A855',
      stroke: '#EAB308',
      min: 0,
      max: 2.0,
      limite: limiteSitio,
      articulo: 'Art. 53',
      precaucionMin: limiteSitio * 0.5,
      precaucionMax: limiteSitio,
      tipo: 'ch4',
    },
    o2: {
      nombre: 'Oxígeno (O₂)',
      unidad: '%Vol',
      color: '#06B6D4',
      stroke: '#06B6D4',
      min: 18.0,
      max: 24.0,
      limiteMin: 19.5,
      limiteMax: 23.5,
      articulo: 'Art. 38 (Rango apto: 19.5% - 23.5%)',
      tipo: 'rango',
    },
    co: {
      nombre: 'Monóxido de Carbono (CO)',
      unidad: 'PPM',
      color: '#F59E0B',
      stroke: '#F59E0B',
      min: 0,
      max: 35,
      limite: 25,
      articulo: 'Art. 39 (TWA 25 PPM)',
      precaucionMin: 12.5,
      precaucionMax: 25,
      tipo: 'limite_superior',
    },
    h2s: {
      nombre: 'Ácido Sulfhídrico (H₂S)',
      unidad: 'PPM',
      color: '#A855F7',
      stroke: '#A855F7',
      min: 0,
      max: 2.0,
      limite: 1.0,
      articulo: 'Art. 39 (TWA 1 PPM)',
      precaucionMin: 0.5,
      precaucionMax: 1.0,
      tipo: 'limite_superior',
    },
    nox: {
      nombre: 'Gases Nitrosos (NO/NO₂)',
      unidad: 'PPM',
      color: '#EC4899',
      stroke: '#EC4899',
      min: 0,
      max: 0.40,
      limite: 0.20,
      articulo: 'Art. 39 (NO₂ TWA 0.2 PPM)',
      precaucionMin: 0.10,
      precaucionMax: 0.20,
      tipo: 'limite_superior',
    },
    co2: {
      nombre: 'Dióxido de Carbono (CO₂)',
      unidad: 'PPM',
      color: '#10B981',
      stroke: '#10B981',
      min: 300,
      max: 6000,
      limite: 5000,
      articulo: 'Art. 39 (TWA 5000 PPM)',
      precaucionMin: 2500,
      precaucionMax: 5000,
      tipo: 'limite_superior',
    },
    temperatura: {
      nombre: 'Temperatura',
      unidad: '°C',
      color: '#E07A5F',
      stroke: '#F97316',
      min: 18,
      max: 36,
      limite: 32,
      articulo: 'Por validar (Máx 32°C)',
      tipo: 'limite_superior',
    },
    humedad: {
      nombre: 'Humedad Relativa',
      unidad: '%',
      color: '#3B82F6',
      stroke: '#60A5FA',
      min: 40,
      max: 100,
      articulo: 'Informativa',
      tipo: 'informativa',
    },
    pm25: {
      nombre: 'Polvo Respirable (PM2.5)',
      unidad: 'µg/m³',
      color: '#F97316',
      stroke: '#FB923C',
      min: 0,
      max: 80,
      limite: 50,
      articulo: 'Límite Seguridad: 50 µg/m³',
      precaucionMin: 35,
      precaucionMax: 50,
      tipo: 'limite_superior',
    },
    pm10: {
      nombre: 'Polvo Inhalable (PM10)',
      unidad: 'µg/m³',
      color: '#EA580C',
      stroke: '#F97316',
      min: 0,
      max: 200,
      limite: 150,
      articulo: 'Límite Seguridad: 150 µg/m³',
      precaucionMin: 100,
      precaucionMax: 150,
      tipo: 'limite_superior',
    },
  }[filtroVariable] || {};

  return (
    <div className="flex flex-col w-full p-space-md gap-space-md bg-surface text-on-surface">
      {/* ── Encabezado de la página ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-space-md bg-surface-container p-4 rounded-lg border border-[#2D3239]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#C29B38]/15 border border-[#C29B38]/40 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[#C29B38] text-[24px]">history</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-headline-md text-[20px] font-bold text-on-surface uppercase leading-tight">
                Historial y Tendencias de Telemetría Multigas
              </h1>
              {/* Badge del turno actual */}
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-surface-container-highest border border-[#2D3239] font-code-badge text-[11px] text-[#C29B38]">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                <span>{infoTurnos.turnoActual.nombre} ({infoTurnos.turnoActual.horarioTexto})</span>
                <span className="text-secondary">· Restan {infoTurnos.turnoActual.tiempoRestanteTexto}</span>
              </div>
            </div>
            <span className="font-code-badge text-[12px] text-secondary mt-0.5">
              Monitoreo continuo 24 h · Muestreo cada 10 min · Decreto 1886 de 2015 · Supervisor: {supervisorTurno?.nombre || 'Ing. Supervisor'} (C.C. {supervisorTurno?.documento || 'S/D'})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
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

          {/* Botón Resumen de Turno (CSV) */}
          <button
            type="button"
            onClick={handleDescargarResumenTurno}
            title="Descargar documento resumen del turno actual de 8 horas"
            className="min-h-[42px] px-4 rounded bg-[#C29B38]/20 hover:bg-[#C29B38]/30 text-[#E0B853] border border-[#C29B38]/60 flex items-center gap-2 font-action-label text-[13px] uppercase font-bold transition-all shadow-sm active:scale-98"
          >
            <span className="material-symbols-outlined text-[18px]">assignment</span>
            <span>Resumen Turno (CSV)</span>
          </button>

          {/* Botón Exportar CSV Filtro */}
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
        className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-surface-container-low p-3.5 rounded-lg border border-[#2D3239]"
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
            {NODOS_METADATA.map((n) => (
              <option key={n.id} value={n.id}>
                {n.nombre} ({n.nivel})
              </option>
            ))}
          </select>
        </div>

        {/* 2. Selector de Variable / Gas */}
        <div className="flex flex-col gap-1">
          <label htmlFor="filtro-variable" className="font-code-badge text-[11px] text-secondary uppercase font-semibold">
            Gas o Variable Ambiental:
          </label>
          <select
            id="filtro-variable"
            value={filtroVariable}
            onChange={(e) => setFiltroVariable(e.target.value)}
            className="w-full min-h-[42px] bg-surface-container-lowest px-3 py-1.5 rounded text-on-surface font-body-md text-[13px] border border-[#2D3239] focus:outline-none focus:border-[#C29B38]"
          >
            <optgroup label="Atmósfera Minera (Decreto 1886)">
              <option value="ch4">Metano — CH₄ (%Vol)</option>
              <option value="o2">Oxígeno — O₂ (%Vol)</option>
              <option value="co">Monóxido de Carbono — CO (PPM)</option>
              <option value="h2s">Ácido Sulfhídrico — H₂S (PPM)</option>
              <option value="nox">Gases Nitrosos — NO/NO₂ (PPM)</option>
              <option value="co2">Dióxido de Carbono — CO₂ (PPM)</option>
            </optgroup>
            <optgroup label="Material Particulado (Polvo de Carbón)">
              <option value="pm25">Polvo Respirable — PM2.5 (µg/m³)</option>
              <option value="pm10">Polvo Inhalable — PM10 (µg/m³)</option>
            </optgroup>
            <optgroup label="Parámetros Físicos">
              <option value="temperatura">Temperatura (°C)</option>
              <option value="humedad">Humedad Relativa (%)</option>
            </optgroup>
          </select>
        </div>

        {/* 4. Selector de Rango Temporal / Turno */}
        <div className="flex flex-col gap-1">
          <span className="font-code-badge text-[11px] text-secondary uppercase font-semibold">
            Ventana Temporal:
          </span>
          <div className="flex items-center bg-surface-container-lowest p-1 rounded border border-[#2D3239] gap-1">
            <button
              type="button"
              onClick={() => {
                setFiltroRango('turno_actual');
                setPaginaActual(1);
              }}
              title="Filtrar por las 8 horas del turno actual"
              className={`flex-1 min-h-[34px] rounded font-code-badge text-[11px] font-bold uppercase transition-colors px-1 text-center ${
                filtroRango === 'turno_actual'
                  ? 'bg-surface-container-high text-on-surface border border-[#2D3239]'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              Turno (8h)
            </button>
            {[6, 12, 24].map((rango) => (
              <button
                key={rango}
                type="button"
                onClick={() => {
                  setFiltroRango(rango);
                  setPaginaActual(1);
                }}
                className={`flex-1 min-h-[34px] rounded font-code-badge text-[11px] font-bold uppercase transition-colors ${
                  filtroRango === rango
                    ? 'bg-surface-container-high text-on-surface border border-[#2D3239]'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                {rango}h
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gráfico Interactivo Multigas (Recharts) ───────────────────────── */}
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
            {/* Leyendas normativas según el gas */}
            {configVar.tipo === 'ch4' && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 border-t-2 border-dashed border-[#B2533E]" />
                  <span>Límite Legal ({limiteSitio.toFixed(1)}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-2 bg-[#A38A3A]/25 border border-[#A38A3A]/40 rounded-xs" />
                  <span>Franja Precaución ({(limiteSitio * 0.5).toFixed(2)}% - {limiteSitio.toFixed(1)}%)</span>
                </div>
              </>
            )}

            {configVar.tipo === 'rango' && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 border-t-2 border-dashed border-[#B2533E]" />
                  <span>Mínimo Apto (19.5% Vol)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-2 bg-[#06B6D4]/20 border border-[#06B6D4]/40 rounded-xs" />
                  <span>Rango Legal Apto (19.5% - 23.5% Vol)</span>
                </div>
              </>
            )}

            {configVar.tipo === 'limite_superior' && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 border-t-2 border-dashed border-[#B2533E]" />
                  <span>Límite Legal ({configVar.limite} {configVar.unidad})</span>
                </div>
                {configVar.precaucionMin !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-2 bg-[#A38A3A]/25 border border-[#A38A3A]/40 rounded-xs" />
                    <span>Precaución ({configVar.precaucionMin} - {configVar.precaucionMax} {configVar.unidad})</span>
                  </div>
                )}
              </>
            )}

            <span>Mostrando {datosGrafico.length} puntos</span>
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
              <LineChart data={datosGrafico} margin={{ top: 12, right: 24, left: -10, bottom: 0 }}>
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

                {/* 1. Franja de Precaución para CH4 */}
                {configVar.tipo === 'ch4' && (
                  <ReferenceArea
                    y1={limiteSitio * 0.5}
                    y2={limiteSitio}
                    fill="#A38A3A"
                    fillOpacity={0.12}
                  />
                )}

                {/* 2. Línea punteada límite para CH4 */}
                {configVar.tipo === 'ch4' && (
                  <ReferenceLine
                    y={limiteSitio}
                    stroke="#B2533E"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    label={{
                      value: `Límite ${limiteSitio.toFixed(1)}% (${configVar.articulo})`,
                      position: 'top',
                      fill: '#D87661',
                      fontSize: 10,
                      fontFamily: 'JetBrains Mono',
                    }}
                  />
                )}

                {/* 3. Rango Apto para Oxígeno (O2) */}
                {configVar.tipo === 'rango' && (
                  <>
                    <ReferenceArea
                      y1={19.5}
                      y2={23.5}
                      fill="#06B6D4"
                      fillOpacity={0.12}
                    />
                    <ReferenceLine
                      y={19.5}
                      stroke="#B2533E"
                      strokeDasharray="4 4"
                      strokeWidth={2}
                      label={{
                        value: 'Mínimo Apto 19.5% (Art. 38)',
                        position: 'bottom',
                        fill: '#D87661',
                        fontSize: 10,
                        fontFamily: 'JetBrains Mono',
                      }}
                    />
                    <ReferenceLine
                      y={23.5}
                      stroke="#A38A3A"
                      strokeDasharray="4 4"
                      label={{
                        value: 'Máximo Apto 23.5%',
                        position: 'top',
                        fill: '#C2A855',
                        fontSize: 10,
                        fontFamily: 'JetBrains Mono',
                      }}
                    />
                  </>
                )}

                {/* 4. Gases con Límite Superior (CO, H2S, NOx, CO2, Temperatura) */}
                {configVar.tipo === 'limite_superior' && (
                  <>
                    {configVar.precaucionMin !== undefined && (
                      <ReferenceArea
                        y1={configVar.precaucionMin}
                        y2={configVar.precaucionMax}
                        fill="#A38A3A"
                        fillOpacity={0.12}
                      />
                    )}
                    <ReferenceLine
                      y={configVar.limite}
                      stroke="#B2533E"
                      strokeDasharray="4 4"
                      strokeWidth={2}
                      label={{
                        value: `Límite ${configVar.limite} ${configVar.unidad} (${configVar.articulo})`,
                        position: 'top',
                        fill: '#D87661',
                        fontSize: 10,
                        fontFamily: 'JetBrains Mono',
                      }}
                    />
                  </>
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
              Registro Tabular de Telemetría Multigas ({lecturasFiltradas.length} mediciones)
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
                <th className="p-2.5">O₂ (%Vol)</th>
                <th className="p-2.5">CO (ppm)</th>
                <th className="p-2.5">H₂S (ppm)</th>
                <th className="p-2.5">NOx (ppm)</th>
                <th className="p-2.5">CO₂ (ppm)</th>
                <th className="p-2.5">PM2.5 (µg/m³)</th>
                <th className="p-2.5">PM10 (µg/m³)</th>
                <th className="p-2.5">Tendencia Polvo</th>
                <th className="p-2.5">Temp (°C)</th>
                <th className="p-2.5">Estado Normativo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D3239] font-body-md text-[13px]">
              {lecturasPaginadas.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-6 text-center text-secondary font-code-badge">
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
                        className={`p-2.5 font-telemetry-value-md text-[13px] font-bold ${
                          esAlarma
                            ? 'text-[#D87661]'
                            : esPrecaucion
                            ? 'text-[#C2A855]'
                            : 'text-on-surface'
                        }`}
                      >
                        {r.ch4.toFixed(2)}%
                      </td>
                      <td className="p-2.5 font-code-badge text-[12px] text-on-surface">
                        {r.o2?.toFixed(1) ?? '20.9'}%
                      </td>
                      <td className="p-2.5 font-code-badge text-[12px] text-on-surface">
                        {r.co ?? 2}
                      </td>
                      <td className="p-2.5 font-code-badge text-[12px] text-secondary">
                        {r.h2s?.toFixed(2) ?? '0.05'}
                      </td>
                      <td className="p-2.5 font-code-badge text-[12px] text-secondary">
                        {r.nox?.toFixed(2) ?? '0.02'}
                      </td>
                      <td className="p-2.5 font-code-badge text-[12px] text-on-surface">
                        {r.co2 ?? 450}
                      </td>
                      <td className="p-2.5 font-code-badge text-[12px] font-bold text-on-surface">
                        {r.pm25 != null ? `${r.pm25.toFixed(1)}` : '--'}
                      </td>
                      <td className="p-2.5 font-code-badge text-[12px] font-bold text-on-surface">
                        {r.pm10 != null ? `${r.pm10.toFixed(1)}` : '--'}
                      </td>
                      <td className="p-2.5">
                        <span className={`px-1.5 py-0.5 rounded font-code-badge text-[10px] font-bold flex items-center gap-1 w-fit ${
                          r.aumentoSostenidoPm25 || (r.pm25 ?? 0) >= 50
                            ? 'bg-[#B2533E]/20 text-[#D87661] border border-[#B2533E]/40'
                            : r.tendenciaPm25 === 'AUMENTANDO'
                            ? 'bg-[#A38A3A]/20 text-[#C2A855] border border-[#A38A3A]/40'
                            : r.tendenciaPm25 === 'DISMINUYENDO'
                            ? 'bg-[#4A7A5B]/20 text-[#6DAA81] border border-[#4A7A5B]/40'
                            : 'bg-surface-container-high text-secondary'
                        }`}>
                          <span>{r.tendenciaPm25 === 'AUMENTANDO' ? '↗' : r.tendenciaPm25 === 'DISMINUYENDO' ? '↘' : '→'}</span>
                          <span>{r.aumentoSostenidoPm25 ? 'Aum. Sostenido' : (r.tendenciaPm25 || 'Estable')}</span>
                        </span>
                      </td>
                      <td className="p-2.5 font-code-badge text-[12px] text-secondary">
                        {r.temperatura.toFixed(1)}°
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
