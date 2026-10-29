import React, { useState, useEffect } from 'react';
import { useMina } from '../hooks/useMina.js';
import { trabajadoresRepo } from '../data/repositorio.js';
import { useToast } from './Toast.jsx';

/**
 * Modal para Apertura Formal de Turno y Registro del Supervisor Responsable.
 * Sustituye cualquier requerimiento de login tradicional, permitiendo que
 * la terminal industrial registre la trazabilidad legal requerida por el Decreto 1886.
 */
export function ModalIniciarTurno({ isOpen, onClose, onTurnoIniciado }) {
  const { supervisorTurno, registrarInicioTurno } = useMina();
  const { mostrarToast } = useToast();

  const [supervisoresDisponibles, setSupervisoresDisponibles] = useState([]);
  const [formData, setFormData] = useState({
    nombre: supervisorTurno?.nombre || '',
    documento: supervisorTurno?.documento || '',
    cargo: supervisorTurno?.cargo || 'Supervisor de Seguridad y SST',
    telefono: supervisorTurno?.telefono || '',
    turnoId: supervisorTurno?.turnoId || 'T2',
  });

  // Cargar lista de supervisores y personal de ingeniería desde IndexedDB
  useEffect(() => {
    let activo = true;
    trabajadoresRepo.listar()
      .then((lista) => {
        if (!activo) return;
        const candidatos = lista.filter(
          (t) =>
            t.categoriaRol === 'Supervisión' ||
            t.categoriaRol === 'Ingeniería' ||
            t.categoriaRol === 'Salvamento'
        );
        setSupervisoresDisponibles(candidatos.length > 0 ? candidatos : lista);
      })
      .catch(() => {
        if (activo) setSupervisoresDisponibles([]);
      });

    return () => {
      activo = false;
    };
  }, []);

  if (!isOpen) return null;

  const handleSeleccionarCandidato = (e) => {
    const id = e.target.value;
    if (!id) return;
    const encontrado = supervisoresDisponibles.find((t) => t.id === id);
    if (encontrado) {
      setFormData({
        nombre: encontrado.nombre,
        documento: encontrado.documento,
        cargo: encontrado.rol,
        telefono: encontrado.telefono || '',
        turnoId: encontrado.turnoHabitual || formData.turnoId,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.documento.trim()) {
      mostrarToast('Debe ingresar el nombre y documento del supervisor responsable.', 'warning');
      return;
    }

    registrarInicioTurno(formData);
    onTurnoIniciado?.();
    mostrarToast(
      `Turno iniciado por ${formData.nombre} (C.C. ${formData.documento}). Trazabilidad y audio activados.`,
      'success'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-surface-container border-2 border-[#C29B38] rounded-xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4 text-on-surface">
        {/* Cabecera */}
        <div className="flex items-start justify-between border-b border-[#2D3239] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[#C29B38]/20 border border-[#C29B38]/50 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#E0B853] text-[28px]">verified_user</span>
            </div>
            <div>
              <span className="font-code-badge text-[11px] text-[#E0B853] uppercase font-bold tracking-wider">
                TRAZABILIDAD LEGAL · DECRETO 1886 DE 2015
              </span>
              <h3 className="font-headline-md text-[18px] font-bold text-white uppercase leading-tight">
                Apertura de Turno y Responsable
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded hover:bg-surface-container-high text-secondary hover:text-on-surface flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <p className="font-body-md text-[13px] text-secondary leading-relaxed">
          Sin necesidad de login. Ingrese los datos del profesional que asume el control del monitoreo
          atmosférico. Esta información quedará registrada en las actas oficiales y en el <strong>Resumen de Turno (CSV)</strong>.
        </p>

        {/* Selector rápido desde la base de datos */}
        {supervisoresDisponibles.length > 0 && (
          <div className="p-3 bg-surface-container-lowest rounded-lg border border-[#2D3239] flex flex-col gap-1.5">
            <label className="font-code-badge text-[11px] text-[#E0B853] uppercase font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">groups</span>
              Cargar desde Base de Datos de Personal:
            </label>
            <select
              onChange={handleSeleccionarCandidato}
              defaultValue=""
              className="w-full min-h-[38px] bg-surface-container px-3 py-1 rounded text-on-surface font-body-md text-[13px] border border-[#2D3239] focus:outline-none focus:border-[#C29B38]"
            >
              <option value="" disabled>-- Seleccione un profesional registrado --</option>
              {supervisoresDisponibles.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre} · {t.rol} (C.C. {t.documento})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="font-code-badge text-[11px] text-secondary uppercase font-semibold block mb-1">
                Nombre Completo del Supervisor *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Ing. Carlos Andrés Mendoza Silva"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full min-h-[40px] bg-surface-container-lowest px-3 py-1.5 rounded text-on-surface font-body-md text-[13px] border border-[#2D3239] focus:outline-none focus:border-[#C29B38]"
              />
            </div>

            <div>
              <label className="font-code-badge text-[11px] text-secondary uppercase font-semibold block mb-1">
                Documento de Identidad (C.C.) *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: 1053782910"
                value={formData.documento}
                onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                className="w-full min-h-[40px] bg-surface-container-lowest px-3 py-1.5 rounded text-on-surface font-body-md text-[13px] border border-[#2D3239] focus:outline-none focus:border-[#C29B38]"
              />
            </div>

            <div>
              <label className="font-code-badge text-[11px] text-secondary uppercase font-semibold block mb-1">
                Cargo / Rol *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Supervisor SST, Director Ventilación"
                value={formData.cargo}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                className="w-full min-h-[40px] bg-surface-container-lowest px-3 py-1.5 rounded text-on-surface font-body-md text-[13px] border border-[#2D3239] focus:outline-none focus:border-[#C29B38]"
              />
            </div>

            <div>
              <label className="font-code-badge text-[11px] text-secondary uppercase font-semibold block mb-1">
                Teléfono de Contacto
              </label>
              <input
                type="text"
                placeholder="+57 3..."
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full min-h-[40px] bg-surface-container-lowest px-3 py-1.5 rounded text-on-surface font-body-md text-[13px] border border-[#2D3239] focus:outline-none focus:border-[#C29B38]"
              />
            </div>

            <div>
              <label className="font-code-badge text-[11px] text-secondary uppercase font-semibold block mb-1">
                Turno de Operación
              </label>
              <select
                value={formData.turnoId}
                onChange={(e) => setFormData({ ...formData, turnoId: e.target.value })}
                className="w-full min-h-[40px] bg-surface-container-lowest px-3 py-1.5 rounded text-on-surface font-body-md text-[13px] border border-[#2D3239] focus:outline-none focus:border-[#C29B38]"
              >
                <option value="T1">Turno 1 (Mañana 06:00 - 14:00)</option>
                <option value="T2">Turno 2 (Tarde 14:00 - 22:00)</option>
                <option value="T3">Turno 3 (Noche 22:00 - 06:00)</option>
              </select>
            </div>
          </div>

          <div className="p-2.5 rounded bg-surface-container-lowest border border-[#2D3239] flex items-center gap-2 mt-1">
            <span className="material-symbols-outlined text-[18px] text-[#6DAA81]">volume_up</span>
            <span className="font-code-badge text-[11px] text-secondary">
              Al confirmar, se activará el sonido de alarmas y sirenas en esta consola de control.
            </span>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2D3239]">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[42px] px-4 rounded bg-surface-container-high hover:bg-surface-variant text-secondary hover:text-on-surface font-action-label text-[12px] uppercase border border-[#2D3239]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="min-h-[42px] px-5 rounded bg-[#C29B38] hover:bg-[#d4aa3e] text-[#121417] font-action-label text-[13px] uppercase font-bold transition-all shadow-md active:scale-98 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
              <span>Confirmar e Iniciar Turno</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
