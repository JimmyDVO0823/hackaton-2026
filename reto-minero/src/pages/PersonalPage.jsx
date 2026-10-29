import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { trabajadoresRepo } from '../data/repositorio.js';
import { useToast } from '../components/Toast.jsx';

const ROLES_CATEGORIAS = [
  'TODAS',
  'Supervisión',
  'Operación',
  'Ventilación',
  'Mantenimiento',
  'Salvamento',
  'Ingeniería',
];

const NIVELES = ['TODOS', 'N-1', 'N-2', 'N-3'];
const TURNOS = [
  { id: 'TODOS', label: 'Todos los turnos' },
  { id: 'T1', label: 'Turno 1 (Mañana 06:00 - 14:00)' },
  { id: 'T2', label: 'Turno 2 (Tarde 14:00 - 22:00)' },
  { id: 'T3', label: 'Turno 3 (Noche 22:00 - 06:00)' },
];

const TIPOS_SANGRE = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

export function PersonalPage({ onVolverTablero }) {
  const { mostrarToast } = useToast();
  const [trabajadores, setTrabajadores] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('TODAS');
  const [filtroNivel, setFiltroNivel] = useState('TODOS');
  const [filtroTurno, setFiltroTurno] = useState('TODOS');
  const [soloAlertasMedicas, setSoloAlertasMedicas] = useState(false);
  const [soloBrigadistas, setSoloBrigadistas] = useState(false);

  // Modales
  const [trabajadorFicha, setTrabajadorFicha] = useState(null);
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
  const [trabajadorEditando, setTrabajadorEditando] = useState(null);

  // Formulario nuevo/editar
  const formInicial = {
    documento: '',
    nombre: '',
    rol: '',
    categoriaRol: 'Operación',
    turnoHabitual: 'T1',
    sectorAsignado: 'frente-explotacion-1',
    sectorNombre: 'Frente de Explotación 1 (N-2)',
    nivel: 'N-2',
    telefono: '',
    contactoNombre: '',
    contactoParentesco: '',
    contactoTelefono: '',
    tipoSangre: 'O+',
    enfermedades: '',
    alergias: '',
    medicamentos: '',
    eps: '',
    arl: 'Positiva Compañía de Seguros',
    esBrigadistaSalvamento: false,
  };
  const [formData, setFormData] = useState(formInicial);

  // Recargar lista desde IndexedDB
  const recargarTrabajadores = useCallback(async () => {
    try {
      const lista = await trabajadoresRepo.listar();
      setTrabajadores(lista);
    } catch (err) {
      console.error('Error al cargar trabajadores:', err);
      mostrarToast('Error al leer la base de datos de trabajadores', 'error');
    } finally {
      setCargando(false);
    }
  }, [mostrarToast]);

  useEffect(() => {
    let activo = true;
    trabajadoresRepo.listar()
      .then((lista) => {
        if (activo) {
          setTrabajadores(lista);
          setCargando(false);
        }
      })
      .catch((err) => {
        if (activo) {
          console.error('Error al cargar trabajadores:', err);
          mostrarToast('Error al leer la base de datos de trabajadores', 'error');
          setCargando(false);
        }
      });

    return () => {
      activo = false;
    };
  }, [mostrarToast]);

  // Filtrado reactivo en memoria
  const trabajadoresFiltrados = useMemo(() => {
    return trabajadores.filter((t) => {
      // Búsqueda por texto
      if (busqueda.trim()) {
        const query = busqueda.toLowerCase().trim();
        const enNombre = t.nombre.toLowerCase().includes(query);
        const enDoc = t.documento.includes(query);
        const enRol = t.rol.toLowerCase().includes(query);
        const enSector = (t.sectorNombre || '').toLowerCase().includes(query);
        if (!enNombre && !enDoc && !enRol && !enSector) return false;
      }

      // Categoría
      if (filtroCategoria !== 'TODAS' && t.categoriaRol !== filtroCategoria) {
        return false;
      }

      // Nivel
      if (filtroNivel !== 'TODOS' && t.nivel !== filtroNivel) {
        return false;
      }

      // Turno
      if (filtroTurno !== 'TODOS' && t.turnoHabitual !== filtroTurno) {
        return false;
      }

      // Alertas médicas (enfermedades o alergias reportadas)
      if (soloAlertasMedicas) {
        const tieneEnf = t.fichaMedica?.enfermedades?.some(
          (e) => !e.toLowerCase().includes('sin ') && !e.toLowerCase().includes('ningun')
        );
        const tieneAlerg = t.fichaMedica?.alergias?.some(
          (a) => !a.toLowerCase().includes('ningun')
        );
        if (!tieneEnf && !tieneAlerg) return false;
      }

      // Brigadistas
      if (soloBrigadistas && !t.fichaMedica?.esBrigadistaSalvamento) {
        return false;
      }

      return true;
    });
  }, [trabajadores, busqueda, filtroCategoria, filtroNivel, filtroTurno, soloAlertasMedicas, soloBrigadistas]);

  // Métricas rápidas
  const totalTrabajadores = trabajadores.length;
  const totalBrigadistas = trabajadores.filter((t) => t.fichaMedica?.esBrigadistaSalvamento).length;
  const totalConCondicion = trabajadores.filter((t) => {
    const tieneEnf = t.fichaMedica?.enfermedades?.some(
      (e) => !e.toLowerCase().includes('sin ') && !e.toLowerCase().includes('ningun')
    );
    const tieneAlerg = t.fichaMedica?.alergias?.some(
      (a) => !a.toLowerCase().includes('ningun')
    );
    return tieneEnf || tieneAlerg;
  }).length;

  // Manejo de formulario
  const handleAbrirCrear = () => {
    setTrabajadorEditando(null);
    setFormData(formInicial);
    setMostrarModalNuevo(true);
  };

  const handleAbrirEditar = (t) => {
    setTrabajadorEditando(t);
    setFormData({
      documento: t.documento || '',
      nombre: t.nombre || '',
      rol: t.rol || '',
      categoriaRol: t.categoriaRol || 'Operación',
      turnoHabitual: t.turnoHabitual || 'T1',
      sectorAsignado: t.sectorAsignado || 'frente-explotacion-1',
      sectorNombre: t.sectorNombre || 'Frente de Explotación 1 (N-2)',
      nivel: t.nivel || 'N-2',
      telefono: t.telefono || '',
      contactoNombre: t.contactoEmergencia?.nombre || '',
      contactoParentesco: t.contactoEmergencia?.parentesco || '',
      contactoTelefono: t.contactoEmergencia?.telefono || '',
      tipoSangre: t.fichaMedica?.tipoSangre || 'O+',
      enfermedades: (t.fichaMedica?.enfermedades || []).join(', '),
      alergias: (t.fichaMedica?.alergias || []).join(', '),
      medicamentos: (t.fichaMedica?.medicamentos || []).join(', '),
      eps: t.fichaMedica?.eps || '',
      arl: t.fichaMedica?.arl || 'Positiva Compañía de Seguros',
      esBrigadistaSalvamento: !!t.fichaMedica?.esBrigadistaSalvamento,
    });
    setMostrarModalNuevo(true);
  };

  const handleGuardarTrabajador = async (e) => {
    e.preventDefault();
    if (!formData.documento.trim() || !formData.nombre.trim() || !formData.rol.trim()) {
      mostrarToast('Complete el documento, nombre y rol del trabajador.', 'warning');
      return;
    }

    const nuevoItem = {
      id: trabajadorEditando ? trabajadorEditando.id : `TRAB-${Date.now().toString().slice(-4)}`,
      documento: formData.documento.trim(),
      nombre: formData.nombre.trim(),
      rol: formData.rol.trim(),
      categoriaRol: formData.categoriaRol,
      turnoHabitual: formData.turnoHabitual,
      sectorAsignado: formData.sectorAsignado,
      sectorNombre: formData.sectorNombre,
      nivel: formData.nivel,
      telefono: formData.telefono.trim(),
      contactoEmergencia: {
        nombre: formData.contactoNombre.trim() || 'No registrado',
        parentesco: formData.contactoParentesco.trim() || 'Familiar',
        telefono: formData.contactoTelefono.trim() || 'No registrado',
      },
      fichaMedica: {
        tipoSangre: formData.tipoSangre,
        enfermedades: formData.enfermedades
          ? formData.enfermedades.split(',').map((s) => s.trim()).filter(Boolean)
          : ['Ninguna reportada'],
        alergias: formData.alergias
          ? formData.alergias.split(',').map((s) => s.trim()).filter(Boolean)
          : ['Ninguna conocida'],
        medicamentos: formData.medicamentos
          ? formData.medicamentos.split(',').map((s) => s.trim()).filter(Boolean)
          : ['Ninguno'],
        eps: formData.eps.trim() || 'No reportada',
        arl: formData.arl.trim() || 'Positiva Compañía de Seguros',
        aptoTrabajoBajoTierra: true,
        ultimoExamenMedico: new Date().toISOString().split('T')[0],
        esBrigadistaSalvamento: formData.esBrigadistaSalvamento,
      },
      estado: 'ACTIVO',
    };

    try {
      await trabajadoresRepo.guardar(nuevoItem);
      mostrarToast(
        trabajadorEditando
          ? `Trabajador ${nuevoItem.nombre} actualizado en la base de datos.`
          : `Trabajador ${nuevoItem.nombre} registrado con éxito en IndexedDB.`,
        'success'
      );
      setMostrarModalNuevo(false);
      recargarTrabajadores();
    } catch (err) {
      console.error(err);
      mostrarToast('Error al guardar trabajador en la base de datos.', 'error');
    }
  };

  const handleEliminarTrabajador = async (id, nombre) => {
    if (!window.confirm(`¿Está seguro de eliminar el registro de ${nombre}?`)) return;
    try {
      await trabajadoresRepo.eliminar(id);
      mostrarToast(`Registro de ${nombre} eliminado de la base de datos.`, 'info');
      if (trabajadorFicha?.id === id) setTrabajadorFicha(null);
      recargarTrabajadores();
    } catch (err) {
      console.error(err);
      mostrarToast('Error al eliminar registro.', 'error');
    }
  };

  // Exportar planilla médica en CSV
  const handleExportarCsv = () => {
    if (trabajadores.length === 0) return;

    const encabezados = [
      'ID',
      'Documento',
      'Nombre Completo',
      'Rol / Cargo',
      'Categoría',
      'Turno',
      'Nivel',
      'Sector Asignado',
      'Teléfono',
      'Tipo de Sangre',
      'Enfermedades Preexistentes',
      'Alergias',
      'Medicamentos',
      'Contacto Emergencia',
      'Teléfono Emergencia',
      'EPS',
      'ARL',
      'Brigadista Salvamento',
    ];

    const filas = trabajadores.map((t) => [
      `"${t.id}"`,
      `"${t.documento}"`,
      `"${t.nombre}"`,
      `"${t.rol}"`,
      `"${t.categoriaRol}"`,
      `"${t.turnoHabitual}"`,
      `"${t.nivel}"`,
      `"${t.sectorNombre || t.sectorAsignado}"`,
      `"${t.telefono || ''}"`,
      `"${t.fichaMedica?.tipoSangre || ''}"`,
      `"${(t.fichaMedica?.enfermedades || []).join('; ')}"`,
      `"${(t.fichaMedica?.alergias || []).join('; ')}"`,
      `"${(t.fichaMedica?.medicamentos || []).join('; ')}"`,
      `"${t.contactoEmergencia?.nombre || ''} (${t.contactoEmergencia?.parentesco || ''})"`,
      `"${t.contactoEmergencia?.telefono || ''}"`,
      `"${t.fichaMedica?.eps || ''}"`,
      `"${t.fichaMedica?.arl || ''}"`,
      `"${t.fichaMedica?.esBrigadistaSalvamento ? 'SÍ' : 'NO'}"`,
    ]);

    const csvContent = '\uFEFF' + [encabezados.join(','), ...filas.map((f) => f.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `planilla-medica-emergencias-mina_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    mostrarToast('Planilla de Emergencias Médicas exportada en CSV.', 'success');
  };

  return (
    <div className="flex flex-col w-full p-space-md gap-space-md bg-surface text-on-surface">
      {/* ── Cabecera y Acciones Rápidas ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-space-md bg-surface-container p-4 rounded-lg border border-[#2D3239]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#C29B38]/15 border border-[#C29B38]/40 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[#C29B38] text-[24px]">badge</span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-headline-md text-[20px] font-bold text-on-surface uppercase leading-tight">
                Padrón de Personal y Ficha Médica de Emergencias
              </h1>
              <span className="px-2 py-0.5 rounded bg-[#4A7A5B]/20 text-[#6DAA81] border border-[#4A7A5B]/40 font-code-badge text-[11px] font-bold">
                IndexedDB Local · 100% Offline
              </span>
            </div>
            <span className="font-code-badge text-[12px] text-secondary mt-0.5">
              Protocolo de Salvamento y Rescate Minero · Decreto 1886 de 2015
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
              Tablero
            </button>
          )}

          <button
            type="button"
            onClick={handleExportarCsv}
            title="Exportar Planilla Médica para Emergencias y ARL"
            className="min-h-[42px] px-3.5 rounded bg-surface-container-high hover:bg-surface-container-highest text-[#D8DADE] border border-[#2D3239] flex items-center gap-2 font-action-label text-[13px] uppercase transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Exportar CSV
          </button>

          <button
            type="button"
            onClick={handleAbrirCrear}
            className="min-h-[42px] px-4 rounded bg-[#C29B38] hover:bg-[#d4aa3e] text-[#121417] font-bold flex items-center gap-2 font-action-label text-[13px] uppercase transition-all shadow-md active:scale-98"
          >
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            Registrar Trabajador
          </button>
        </div>
      </div>

      {/* ── Tarjetas KPI Rápidas ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-surface-container-low p-3.5 rounded-lg border border-[#2D3239] flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-surface-container flex items-center justify-center shrink-0 border border-[#2D3239]">
            <span className="material-symbols-outlined text-[#D8DADE] text-[22px]">groups</span>
          </div>
          <div>
            <span className="font-code-badge text-[11px] text-secondary uppercase block">Personal Registrado</span>
            <span className="font-headline-md text-[20px] font-bold text-on-surface">{totalTrabajadores} trabajadores</span>
          </div>
        </div>

        <div className="bg-surface-container-low p-3.5 rounded-lg border border-[#2D3239] flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#C29B38]/20 flex items-center justify-center shrink-0 border border-[#C29B38]/40">
            <span className="material-symbols-outlined text-[#E0B853] text-[22px]">health_and_safety</span>
          </div>
          <div>
            <span className="font-code-badge text-[11px] text-secondary uppercase block">Brigadistas Salvamento</span>
            <span className="font-headline-md text-[20px] font-bold text-[#E0B853]">{totalBrigadistas} activos</span>
          </div>
        </div>

        <div className="bg-surface-container-low p-3.5 rounded-lg border border-[#2D3239] flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#5C2222]/40 flex items-center justify-center shrink-0 border border-[#8B3232]">
            <span className="material-symbols-outlined text-[#D97575] text-[22px]">medical_information</span>
          </div>
          <div>
            <span className="font-code-badge text-[11px] text-secondary uppercase block">Alertas Médicas Preexistentes</span>
            <span className="font-headline-md text-[20px] font-bold text-[#D97575]">{totalConCondicion} de atención prioritaria</span>
          </div>
        </div>

        <div className="bg-surface-container-low p-3.5 rounded-lg border border-[#2D3239] flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#4A7A5B]/20 flex items-center justify-center shrink-0 border border-[#4A7A5B]/50">
            <span className="material-symbols-outlined text-[#6DAA81] text-[22px]">bloodtype</span>
          </div>
          <div>
            <span className="font-code-badge text-[11px] text-secondary uppercase block">Banco de Tipaje Sanguíneo</span>
            <span className="font-headline-md text-[20px] font-bold text-[#6DAA81]">100% Identificados</span>
          </div>
        </div>
      </div>

      {/* ── Barra de Búsqueda y Filtros ───────────────────────────────────────── */}
      <div className="bg-surface-container-low p-3.5 rounded-lg border border-[#2D3239] flex flex-col gap-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Búsqueda */}
          <div className="md:col-span-2 relative">
            <label htmlFor="busqueda-trabajador" className="font-code-badge text-[11px] text-secondary uppercase font-semibold block mb-1">
              Buscar por nombre, documento o cargo:
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-secondary text-[20px]">
                search
              </span>
              <input
                id="busqueda-trabajador"
                type="text"
                placeholder="Ej: Mendoza, 1053, Picador, Frente 1..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full min-h-[42px] bg-surface-container-lowest pl-10 pr-3 py-1.5 rounded text-on-surface font-body-md text-[13px] border border-[#2D3239] focus:outline-none focus:border-[#C29B38]"
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda('')}
                  className="absolute right-3 top-2.5 text-secondary hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>
          </div>

          {/* Filtro Rol / Categoría */}
          <div>
            <label htmlFor="filtro-categoria" className="font-code-badge text-[11px] text-secondary uppercase font-semibold block mb-1">
              Categoría de Rol:
            </label>
            <select
              id="filtro-categoria"
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="w-full min-h-[42px] bg-surface-container-lowest px-3 py-1.5 rounded text-on-surface font-body-md text-[13px] border border-[#2D3239] focus:outline-none focus:border-[#C29B38]"
            >
              {ROLES_CATEGORIAS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'TODAS' ? 'Todas las Categorías' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Turno */}
          <div>
            <label htmlFor="filtro-turno" className="font-code-badge text-[11px] text-secondary uppercase font-semibold block mb-1">
              Turno:
            </label>
            <select
              id="filtro-turno"
              value={filtroTurno}
              onChange={(e) => setFiltroTurno(e.target.value)}
              className="w-full min-h-[42px] bg-surface-container-lowest px-3 py-1.5 rounded text-on-surface font-body-md text-[13px] border border-[#2D3239] focus:outline-none focus:border-[#C29B38]"
            >
              {TURNOS.map((tur) => (
                <option key={tur.id} value={tur.id}>
                  {tur.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botones de Filtro Rápido */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#2D3239]">
          <span className="font-code-badge text-[11px] text-secondary uppercase font-semibold mr-1">
            Nivel:
          </span>
          {NIVELES.map((niv) => (
            <button
              key={niv}
              type="button"
              onClick={() => setFiltroNivel(niv)}
              className={`px-2.5 py-1 rounded font-code-badge text-[11px] font-bold uppercase transition-colors border ${
                filtroNivel === niv
                  ? 'bg-[#C29B38]/20 text-[#E0B853] border-[#C29B38]'
                  : 'bg-surface-container-lowest text-secondary hover:text-on-surface border-[#2D3239]'
              }`}
            >
              {niv}
            </button>
          ))}

          <div className="h-4 w-px bg-[#2D3239] mx-2 hidden sm:block" />

          {/* Toggles */}
          <button
            type="button"
            onClick={() => setSoloAlertasMedicas((prev) => !prev)}
            className={`px-3 py-1 rounded font-code-badge text-[11px] font-bold uppercase flex items-center gap-1.5 border transition-colors ${
              soloAlertasMedicas
                ? 'bg-[#5C2222]/35 text-[#D97575] border-[#8B3232]'
                : 'bg-surface-container-lowest text-secondary hover:text-on-surface border-[#2D3239]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">medical_services</span>
            Solo Con Alerta Médica Preexistente
          </button>

          <button
            type="button"
            onClick={() => setSoloBrigadistas((prev) => !prev)}
            className={`px-3 py-1 rounded font-code-badge text-[11px] font-bold uppercase flex items-center gap-1.5 border transition-colors ${
              soloBrigadistas
                ? 'bg-[#C29B38]/20 text-[#E0B853] border-[#C29B38]'
                : 'bg-surface-container-lowest text-secondary hover:text-on-surface border-[#2D3239]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">health_and_safety</span>
            Solo Brigadistas
          </button>

          <span className="ml-auto font-code-badge text-[11px] text-secondary">
            Mostrando {trabajadoresFiltrados.length} de {trabajadores.length} registros
          </span>
        </div>
      </div>

      {/* ── Listado de Tarjetas de Trabajadores ─────────────────────────────────── */}
      {cargando ? (
        <div className="p-12 text-center text-secondary bg-surface-container-low rounded-lg border border-[#2D3239]">
          <span className="material-symbols-outlined text-[32px] animate-spin text-[#C29B38]">sync</span>
          <p className="font-body-md mt-2">Accediendo a la base de datos local IndexedDB...</p>
        </div>
      ) : trabajadoresFiltrados.length === 0 ? (
        <div className="p-12 text-center text-secondary bg-surface-container-low rounded-lg border border-[#2D3239]">
          <span className="material-symbols-outlined text-[36px] text-secondary">person_off</span>
          <p className="font-headline-md text-[16px] text-on-surface mt-2 uppercase">
            No se encontraron trabajadores con los filtros aplicados
          </p>
          <button
            type="button"
            onClick={() => {
              setBusqueda('');
              setFiltroCategoria('TODAS');
              setFiltroNivel('TODOS');
              setFiltroTurno('TODOS');
              setSoloAlertasMedicas(false);
              setSoloBrigadistas(false);
            }}
            className="mt-3 px-3 py-1.5 bg-surface-container-high rounded text-secondary hover:text-on-surface font-action-label text-[12px] uppercase border border-[#2D3239]"
          >
            Restablecer Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {trabajadoresFiltrados.map((trabajador) => {
            const tieneEnf = trabajador.fichaMedica?.enfermedades?.some(
              (e) => !e.toLowerCase().includes('sin ') && !e.toLowerCase().includes('ningun')
            );
            const tieneAlerg = trabajador.fichaMedica?.alergias?.some(
              (a) => !a.toLowerCase().includes('ningun')
            );
            const requiereAlerta = tieneEnf || tieneAlerg;

            return (
              <div
                key={trabajador.id}
                className="bg-surface-container-low rounded-lg border border-[#2D3239] p-4 flex flex-col justify-between hover:border-[#484F5C] transition-colors relative"
              >
                <div>
                  {/* Encabezado de la tarjeta */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-action-label text-[15px] font-bold text-on-surface leading-tight truncate">
                          {trabajador.nombre}
                        </span>
                        {trabajador.fichaMedica?.esBrigadistaSalvamento && (
                          <span
                            title="Brigadista Certificado de Salvamento Minero"
                            className="px-1.5 py-0.5 rounded bg-[#C29B38]/20 text-[#E0B853] border border-[#C29B38]/50 font-code-badge text-[10px] font-bold flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[12px]">health_and_safety</span>
                            BRIGADA
                          </span>
                        )}
                      </div>
                      <span className="font-code-badge text-[12px] text-secondary block mt-0.5">
                        C.C. {trabajador.documento} · {trabajador.id}
                      </span>
                    </div>

                    {/* Badge destacado de Tipo de Sangre */}
                    <div
                      title="Tipo de Sangre y Factor RH para Emergencias"
                      className="px-2.5 py-1 rounded bg-[#5C2222] border border-[#8B3232] text-white flex flex-col items-center shrink-0 shadow-sm"
                    >
                      <span className="font-code-badge text-[9px] uppercase tracking-wider text-[#F0BEBE]">RH</span>
                      <span className="font-headline-md text-[14px] font-bold leading-none">
                        {trabajador.fichaMedica?.tipoSangre || 'N/R'}
                      </span>
                    </div>
                  </div>

                  {/* Rol y Ubicación en la mina */}
                  <div className="mt-3 p-2.5 rounded bg-surface-container-lowest border border-[#2D3239] flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-code-badge text-secondary uppercase text-[10px]">Rol / Cargo:</span>
                      <span className="font-action-label text-[#E0B853] font-semibold text-right">
                        {trabajador.rol}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-code-badge text-secondary uppercase text-[10px]">Ubicación habitual:</span>
                      <span className="font-body-md text-on-surface text-[12px] flex items-center gap-1">
                        <span className="px-1 py-0.2 rounded bg-surface-container-high border border-[#2D3239] font-code-badge text-[10px]">
                          {trabajador.nivel}
                        </span>
                        <span className="truncate max-w-[150px]">{trabajador.sectorNombre || trabajador.sectorAsignado}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-code-badge text-secondary uppercase text-[10px]">Turno asignado:</span>
                      <span className="font-code-badge text-secondary text-[11px]">
                        {trabajador.turnoHabitual === 'T1' && 'Turno 1 (06:00 - 14:00)'}
                        {trabajador.turnoHabitual === 'T2' && 'Turno 2 (14:00 - 22:00)'}
                        {trabajador.turnoHabitual === 'T3' && 'Turno 3 (22:00 - 06:00)'}
                      </span>
                    </div>
                  </div>

                  {/* Bloque Médico de Emergencia */}
                  <div className="mt-3 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-code-badge text-[10px] text-secondary uppercase font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px] text-[#D97575]">emergency</span>
                        Ficha de Emergencia Médica:
                      </span>
                      {requiereAlerta && (
                        <span className="px-1.5 py-0.2 rounded bg-[#5C2222]/30 text-[#D97575] border border-[#8B3232] font-code-badge text-[9px] font-bold">
                          ALERTA MÉDICA
                        </span>
                      )}
                    </div>

                    {/* Enfermedades */}
                    <div className="flex items-start gap-1 text-[11px]">
                      <span className="font-code-badge text-secondary shrink-0 text-[10px]">Patologías:</span>
                      <span className={`font-body-md text-[11px] ${tieneEnf ? 'text-[#D97575] font-semibold' : 'text-secondary'}`}>
                        {(trabajador.fichaMedica?.enfermedades || []).join(', ') || 'Ninguna'}
                      </span>
                    </div>

                    {/* Alergias */}
                    <div className="flex items-start gap-1 text-[11px]">
                      <span className="font-code-badge text-secondary shrink-0 text-[10px]">Alergias:</span>
                      <span className={`font-body-md text-[11px] ${tieneAlerg ? 'text-[#E0B853] font-semibold' : 'text-secondary'}`}>
                        {(trabajador.fichaMedica?.alergias || []).join(', ') || 'Ninguna'}
                      </span>
                    </div>

                    {/* Contacto SOS */}
                    <div className="mt-1 pt-1.5 border-t border-[#2D3239] flex items-center justify-between text-[11px]">
                      <span className="font-code-badge text-secondary text-[10px] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px] text-[#C29B38]">contact_phone</span>
                        SOS:
                      </span>
                      <span className="font-body-md text-on-surface truncate text-right">
                        {trabajador.contactoEmergencia?.nombre} ({trabajador.contactoEmergencia?.telefono})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Acciones de la tarjeta */}
                <div className="mt-4 pt-3 border-t border-[#2D3239] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setTrabajadorFicha(trabajador)}
                    className="flex-1 min-h-[34px] px-3 rounded bg-surface-container-high hover:bg-[#C29B38]/20 hover:text-[#E0B853] hover:border-[#C29B38]/50 text-secondary border border-[#2D3239] font-action-label text-[11px] uppercase flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[15px]">medical_services</span>
                    Ficha Completa
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAbrirEditar(trabajador)}
                    title="Editar datos de este trabajador"
                    className="w-8 h-8 rounded bg-surface-container hover:bg-surface-container-high text-secondary hover:text-on-surface border border-[#2D3239] flex items-center justify-center transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEliminarTrabajador(trabajador.id, trabajador.nombre)}
                    title="Eliminar de la base de datos"
                    className="w-8 h-8 rounded bg-surface-container hover:bg-[#5C2222]/50 text-secondary hover:text-[#D97575] border border-[#2D3239] flex items-center justify-center transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal de Ficha Médica de Emergencia (Lectura Detallada / Brigada) ── */}
      {trabajadorFicha && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-surface-container-low border border-[#2D3239] rounded-xl max-w-xl w-full p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            {/* Cabecera del Modal */}
            <div className="flex items-start justify-between border-b border-[#2D3239] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded bg-[#5C2222] border border-[#8B3232] text-white flex flex-col items-center justify-center shrink-0">
                  <span className="font-code-badge text-[9px] uppercase tracking-wider text-[#F0BEBE]">RH</span>
                  <span className="font-headline-md text-[18px] font-bold leading-none">
                    {trabajadorFicha.fichaMedica?.tipoSangre || 'N/R'}
                  </span>
                </div>
                <div>
                  <h3 className="font-headline-md text-[18px] font-bold text-on-surface uppercase">
                    {trabajadorFicha.nombre}
                  </h3>
                  <span className="font-code-badge text-[12px] text-secondary">
                    C.C. {trabajadorFicha.documento} · {trabajadorFicha.rol}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setTrabajadorFicha(null)}
                className="w-8 h-8 rounded hover:bg-surface-container text-secondary hover:text-on-surface flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Aviso de Brigada si aplica */}
            {trabajadorFicha.fichaMedica?.esBrigadistaSalvamento && (
              <div className="p-2.5 rounded bg-[#C29B38]/15 border border-[#C29B38]/40 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#E0B853] text-[20px]">health_and_safety</span>
                <span className="font-body-md text-[12px] text-[#E0B853]">
                  Personal Certificado de la <strong>Brigada de Salvamento Minero</strong> (Primeros Auxilios y Evacuación).
                </span>
              </div>
            )}

            {/* Datos de Asignación */}
            <div className="grid grid-cols-2 gap-3 bg-surface-container p-3 rounded border border-[#2D3239]">
              <div>
                <span className="font-code-badge text-[10px] text-secondary uppercase block">Ubicación Mina</span>
                <span className="font-action-label text-[13px] text-on-surface">
                  {trabajadorFicha.nivel} · {trabajadorFicha.sectorNombre || trabajadorFicha.sectorAsignado}
                </span>
              </div>
              <div>
                <span className="font-code-badge text-[10px] text-secondary uppercase block">Turno</span>
                <span className="font-action-label text-[13px] text-on-surface">
                  {trabajadorFicha.turnoHabitual === 'T1' && 'Turno 1 (06:00 - 14:00)'}
                  {trabajadorFicha.turnoHabitual === 'T2' && 'Turno 2 (14:00 - 22:00)'}
                  {trabajadorFicha.turnoHabitual === 'T3' && 'Turno 3 (22:00 - 06:00)'}
                </span>
              </div>
              <div>
                <span className="font-code-badge text-[10px] text-secondary uppercase block">Teléfono Móvil</span>
                <span className="font-action-label text-[13px] text-on-surface">{trabajadorFicha.telefono || 'Sin registrar'}</span>
              </div>
              <div>
                <span className="font-code-badge text-[10px] text-secondary uppercase block">EPS / ARL</span>
                <span className="font-action-label text-[13px] text-on-surface">
                  {trabajadorFicha.fichaMedica?.eps} / {trabajadorFicha.fichaMedica?.arl}
                </span>
              </div>
            </div>

            {/* Ficha Médica Detallada */}
            <div className="flex flex-col gap-3">
              <h4 className="font-action-label text-[13px] uppercase font-bold text-[#D97575] flex items-center gap-1.5 border-b border-[#2D3239] pb-1">
                <span className="material-symbols-outlined text-[16px]">medical_information</span>
                Información Clínica y Primeros Auxilios
              </h4>

              <div className="p-3 bg-surface-container rounded border border-[#2D3239] flex flex-col gap-2">
                <div>
                  <span className="font-code-badge text-[10px] text-secondary uppercase block font-semibold">
                    Enfermedades Preexistentes / Condiciones Crónicas:
                  </span>
                  <p className="font-body-md text-[13px] text-on-surface mt-0.5">
                    {(trabajadorFicha.fichaMedica?.enfermedades || []).join(', ') || 'Ninguna reportada'}
                  </p>
                </div>

                <div>
                  <span className="font-code-badge text-[10px] text-secondary uppercase block font-semibold">
                    Alergias a Medicamentos o Sustancias:
                  </span>
                  <p className="font-body-md text-[13px] text-[#E0B853] mt-0.5 font-semibold">
                    {(trabajadorFicha.fichaMedica?.alergias || []).join(', ') || 'Ninguna conocida'}
                  </p>
                </div>

                <div>
                  <span className="font-code-badge text-[10px] text-secondary uppercase block font-semibold">
                    Medicamentos Habituales / De Emergencia:
                  </span>
                  <p className="font-body-md text-[13px] text-on-surface mt-0.5">
                    {(trabajadorFicha.fichaMedica?.medicamentos || []).join(', ') || 'Ninguno'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#2D3239] text-[11px]">
                  <div>
                    <span className="text-secondary">Último Examen Ocupacional:</span>{' '}
                    <span className="font-semibold text-on-surface">
                      {trabajadorFicha.fichaMedica?.ultimoExamenMedico || 'Al día'}
                    </span>
                  </div>
                  <div>
                    <span className="text-secondary">Aptitud Laboral Bajo Tierra:</span>{' '}
                    <span className="font-semibold text-[#6DAA81]">CERTIFICADO APTO</span>
                  </div>
                </div>
              </div>

              {/* Contacto de Emergencia */}
              <h4 className="font-action-label text-[13px] uppercase font-bold text-[#E0B853] flex items-center gap-1.5 border-b border-[#2D3239] pb-1 mt-1">
                <span className="material-symbols-outlined text-[16px]">emergency_share</span>
                Contacto Inmediato en Caso de Emergencia
              </h4>

              <div className="p-3 bg-surface-container rounded border border-[#2D3239] flex items-center justify-between">
                <div>
                  <span className="font-action-label text-[14px] font-bold text-on-surface block">
                    {trabajadorFicha.contactoEmergencia?.nombre}
                  </span>
                  <span className="font-code-badge text-[11px] text-secondary">
                    Parentesco: {trabajadorFicha.contactoEmergencia?.parentesco}
                  </span>
                </div>

                <a
                  href={`tel:${trabajadorFicha.contactoEmergencia?.telefono}`}
                  className="px-3 py-1.5 rounded bg-[#4A7A5B] hover:bg-[#5b9570] text-white font-action-label text-[12px] font-bold flex items-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">call</span>
                  {trabajadorFicha.contactoEmergencia?.telefono}
                </a>
              </div>
            </div>

            {/* Pie del modal */}
            <div className="flex justify-end gap-2 border-t border-[#2D3239] pt-3">
              <button
                type="button"
                onClick={() => setTrabajadorFicha(null)}
                className="px-4 py-2 bg-surface-container-high hover:bg-surface-container text-on-surface rounded font-action-label text-[12px] uppercase border border-[#2D3239]"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de Creación / Edición de Trabajador ─────────────────────────── */}
      {mostrarModalNuevo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleGuardarTrabajador}
            className="bg-surface-container-low border border-[#2D3239] rounded-xl max-w-2xl w-full p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-[#2D3239] pb-3">
              <h3 className="font-headline-md text-[18px] font-bold text-on-surface uppercase flex items-center gap-2">
                <span className="material-symbols-outlined text-[#C29B38]">
                  {trabajadorEditando ? 'edit' : 'person_add'}
                </span>
                {trabajadorEditando ? 'Modificar Registro de Trabajador' : 'Registrar Nuevo Trabajador'}
              </h3>
              <button
                type="button"
                onClick={() => setMostrarModalNuevo(false)}
                className="w-8 h-8 rounded hover:bg-surface-container text-secondary hover:text-on-surface flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Sección 1: Datos Personales y Rol */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="font-code-badge text-[11px] text-secondary uppercase font-semibold block mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Pedro Juan Pérez"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full min-h-[38px] bg-surface-container-lowest px-3 py-1 rounded text-on-surface font-body-md text-[13px] border border-[#2D3239] focus:outline-none focus:border-[#C29B38]"
                />
              </div>

              <div>
                <label className="font-code-badge text-[11px] text-secondary uppercase font-semibold block mb-1">
                  Documento de Identidad (C.C.) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 1053456789"
                  value={formData.documento}
                  onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                  className="w-full min-h-[38px] bg-surface-container-lowest px-3 py-1 rounded text-on-surface font-body-md text-[13px] border border-[#2D3239] focus:outline-none focus:border-[#C29B38]"
                />
              </div>

              <div>
                <label className="font-code-badge text-[11px] text-secondary uppercase font-semibold block mb-1">
                  Cargo / Rol Minero *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Picador de Avance, Operador Malacate"
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                  className="w-full min-h-[38px] bg-surface-container-lowest px-3 py-1 rounded text-on-surface font-body-md text-[13px] border border-[#2D3239] focus:outline-none focus:border-[#C29B38]"
                />
              </div>

              <div>
                <label className="font-code-badge text-[11px] text-secondary uppercase font-semibold block mb-1">
                  Categoría de Rol
                </label>
                <select
                  value={formData.categoriaRol}
                  onChange={(e) => setFormData({ ...formData, categoriaRol: e.target.value })}
                  className="w-full min-h-[38px] bg-surface-container-lowest px-3 py-1 rounded text-on-surface font-body-md text-[13px] border border-[#2D3239] focus:outline-none focus:border-[#C29B38]"
                >
                  {ROLES_CATEGORIAS.filter((c) => c !== 'TODAS').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-code-badge text-[11px] text-secondary uppercase font-semibold block mb-1">
                  Turno Habitual
                </label>
                <select
                  value={formData.turnoHabitual}
                  onChange={(e) => setFormData({ ...formData, turnoHabitual: e.target.value })}
                  className="w-full min-h-[38px] bg-surface-container-lowest px-3 py-1 rounded text-on-surface font-body-md text-[13px] border border-[#2D3239] focus:outline-none focus:border-[#C29B38]"
                >
                  <option value="T1">Turno 1 (Mañana 06:00 - 14:00)</option>
                  <option value="T2">Turno 2 (Tarde 14:00 - 22:00)</option>
                  <option value="T3">Turno 3 (Noche 22:00 - 06:00)</option>
                </select>
              </div>

              <div>
                <label className="font-code-badge text-[11px] text-secondary uppercase font-semibold block mb-1">
                  Nivel de Trabajo
                </label>
                <select
                  value={formData.nivel}
                  onChange={(e) => setFormData({ ...formData, nivel: e.target.value })}
                  className="w-full min-h-[38px] bg-surface-container-lowest px-3 py-1 rounded text-on-surface font-body-md text-[13px] border border-[#2D3239] focus:outline-none focus:border-[#C29B38]"
                >
                  <option value="N-1">N-1 (Cota -310 m)</option>
                  <option value="N-2">N-2 (Cota -420 m)</option>
                  <option value="N-3">N-3 (Cota -540 m)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="font-code-badge text-[11px] text-secondary uppercase font-semibold block mb-1">
                  Sector Habitual Asignado
                </label>
                <input
                  type="text"
                  placeholder="Ej: Frente de Explotación 1, Galería Sur..."
                  value={formData.sectorNombre}
                  onChange={(e) => setFormData({ ...formData, sectorNombre: e.target.value })}
                  className="w-full min-h-[38px] bg-surface-container-lowest px-3 py-1 rounded text-on-surface font-body-md text-[13px] border border-[#2D3239] focus:outline-none focus:border-[#C29B38]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="font-code-badge text-[11px] text-secondary uppercase font-semibold block mb-1">
                  Teléfono Móvil
                </label>
                <input
                  type="text"
                  placeholder="+57 3..."
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full min-h-[38px] bg-surface-container-lowest px-3 py-1 rounded text-on-surface font-body-md text-[13px] border border-[#2D3239] focus:outline-none focus:border-[#C29B38]"
                />
              </div>
            </div>

            {/* Sección 2: Ficha Médica de Emergencia */}
            <div className="border-t border-[#2D3239] pt-3 flex flex-col gap-3">
              <h4 className="font-action-label text-[13px] uppercase font-bold text-[#D97575] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">emergency</span>
                Ficha Médica para Casos de Emergencia (Crítico)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="font-code-badge text-[11px] text-secondary uppercase font-semibold block mb-1">
                    Tipo de Sangre y Factor RH *
                  </label>
                  <select
                    value={formData.tipoSangre}
                    onChange={(e) => setFormData({ ...formData, tipoSangre: e.target.value })}
                    className="w-full min-h-[38px] bg-surface-container-lowest px-3 py-1 rounded text-on-surface font-body-md text-[13px] border border-[#2D3239] focus:outline-none focus:border-[#C29B38] font-bold text-[#D97575]"
                  >
                    {TIPOS_SANGRE.map((ts) => (
                      <option key={ts} value={ts}>
                        {ts}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="esBrigadista"
                    checked={formData.esBrigadistaSalvamento}
                    onChange={(e) => setFormData({ ...formData, esBrigadistaSalvamento: e.target.checked })}
                    className="w-4 h-4 rounded text-[#C29B38] focus:ring-[#C29B38]"
                  />
                  <label htmlFor="esBrigadista" className="font-action-label text-[12px] uppercase text-[#E0B853] font-bold cursor-pointer">
                    Miembro de la Brigada de Salvamento Minero
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label className="font-code-badge text-[11px] text-secondary uppercase font-semibold block mb-1">
                    Enfermedades Preexistentes / Patologías (separadas por coma):
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Asma, Hipertensión, Diabetes Tipo 2, o dejar vacío"
                    value={formData.enfermedades}
                    onChange={(e) => setFormData({ ...formData, enfermedades: e.target.value })}
                    className="w-full min-h-[38px] bg-surface-container-lowest px-3 py-1 rounded text-on-surface font-body-md text-[13px] border border-[#2D3239] focus:outline-none focus:border-[#C29B38]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="font-code-badge text-[11px] text-secondary uppercase font-semibold block mb-1">
                    Alergias a Medicamentos o Sustancias (separadas por coma):
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Penicilina, AINEs, Sulfas, Polvo de carbón, o ninguna"
                    value={formData.alergias}
                    onChange={(e) => setFormData({ ...formData, alergias: e.target.value })}
                    className="w-full min-h-[38px] bg-surface-container-lowest px-3 py-1 rounded text-on-surface font-body-md text-[13px] border border-[#2D3239] focus:outline-none focus:border-[#C29B38]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="font-code-badge text-[11px] text-secondary uppercase font-semibold block mb-1">
                    Medicamentos Habituales / SOS:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Salbutamol inhalador, Losartán 50mg"
                    value={formData.medicamentos}
                    onChange={(e) => setFormData({ ...formData, medicamentos: e.target.value })}
                    className="w-full min-h-[38px] bg-surface-container-lowest px-3 py-1 rounded text-on-surface font-body-md text-[13px] border border-[#2D3239] focus:outline-none focus:border-[#C29B38]"
                  />
                </div>

                <div>
                  <label className="font-code-badge text-[11px] text-secondary uppercase font-semibold block mb-1">
                    EPS Afiliada
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Sanitas, Nueva EPS, Sura"
                    value={formData.eps}
                    onChange={(e) => setFormData({ ...formData, eps: e.target.value })}
                    className="w-full min-h-[38px] bg-surface-container-lowest px-3 py-1 rounded text-on-surface font-body-md text-[13px] border border-[#2D3239] focus:outline-none focus:border-[#C29B38]"
                  />
                </div>

                <div>
                  <label className="font-code-badge text-[11px] text-secondary uppercase font-semibold block mb-1">
                    ARL Minera
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Positiva, Colmena, Bolívar"
                    value={formData.arl}
                    onChange={(e) => setFormData({ ...formData, arl: e.target.value })}
                    className="w-full min-h-[38px] bg-surface-container-lowest px-3 py-1 rounded text-on-surface font-body-md text-[13px] border border-[#2D3239] focus:outline-none focus:border-[#C29B38]"
                  />
                </div>
              </div>
            </div>

            {/* Sección 3: Contacto SOS */}
            <div className="border-t border-[#2D3239] pt-3 flex flex-col gap-3">
              <h4 className="font-action-label text-[13px] uppercase font-bold text-[#E0B853] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">contact_phone</span>
                Contacto Familiar de Emergencia (SOS)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="font-code-badge text-[11px] text-secondary uppercase font-semibold block mb-1">
                    Nombre del Contacto
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Lucía Pérez"
                    value={formData.contactoNombre}
                    onChange={(e) => setFormData({ ...formData, contactoNombre: e.target.value })}
                    className="w-full min-h-[38px] bg-surface-container-lowest px-3 py-1 rounded text-on-surface font-body-md text-[13px] border border-[#2D3239] focus:outline-none focus:border-[#C29B38]"
                  />
                </div>

                <div>
                  <label className="font-code-badge text-[11px] text-secondary uppercase font-semibold block mb-1">
                    Parentesco
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Esposa, Madre, Hermano"
                    value={formData.contactoParentesco}
                    onChange={(e) => setFormData({ ...formData, contactoParentesco: e.target.value })}
                    className="w-full min-h-[38px] bg-surface-container-lowest px-3 py-1 rounded text-on-surface font-body-md text-[13px] border border-[#2D3239] focus:outline-none focus:border-[#C29B38]"
                  />
                </div>

                <div>
                  <label className="font-code-badge text-[11px] text-secondary uppercase font-semibold block mb-1">
                    Teléfono SOS
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: +57 3..."
                    value={formData.contactoTelefono}
                    onChange={(e) => setFormData({ ...formData, contactoTelefono: e.target.value })}
                    className="w-full min-h-[38px] bg-surface-container-lowest px-3 py-1 rounded text-on-surface font-body-md text-[13px] border border-[#2D3239] focus:outline-none focus:border-[#C29B38]"
                  />
                </div>
              </div>
            </div>

            {/* Botones del formulario */}
            <div className="flex justify-end gap-2 border-t border-[#2D3239] pt-3">
              <button
                type="button"
                onClick={() => setMostrarModalNuevo(false)}
                className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-secondary rounded font-action-label text-[12px] uppercase border border-[#2D3239]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#C29B38] hover:bg-[#d4aa3e] text-[#121417] font-bold rounded font-action-label text-[12px] uppercase shadow-md active:scale-98"
              >
                {trabajadorEditando ? 'Guardar Cambios' : 'Registrar en Base de Datos'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
