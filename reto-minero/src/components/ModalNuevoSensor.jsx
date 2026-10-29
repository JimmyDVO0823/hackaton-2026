import React, { useState } from 'react';
import { TIPOS_SITIO } from '../config/tiposSitio.js';
import { useToast } from './Toast.jsx';

const NIVELES = ['N-1', 'N-2', 'N-3'];

// Dimensiones del plano de MineMap (coordenadas en px del mundo 960x540)
const MAPA_ANCHO = 960;
const MAPA_ALTO = 540;
// Margen para que la tarjeta del marcador (≈196x70 px) no se salga del plano
const MAX_X = MAPA_ANCHO - 200;
const MAX_Y = MAPA_ALTO - 110;

const FORM_INICIAL = {
  nombre: '',
  ubicacion: '',
  tipoSitio: 'frente_explotacion',
  nivel: 'N-1',
  x: 380,
  y: 200,
};

const inputClass =
  'w-full min-h-[40px] bg-surface-container-lowest px-3 py-1.5 rounded text-on-surface font-body-md text-[13px] border border-[#2D3239] focus:outline-none focus:border-[#C29B38]';
const labelClass = 'font-code-badge text-[11px] text-secondary uppercase font-semibold block mb-1';

/**
 * Modal para registrar un nuevo nodo sensor en la red de monitoreo.
 * La posición en el esquema de galerías se elige haciendo clic sobre el plano.
 */
export function ModalNuevoSensor({ isOpen, onClose, onGuardar }) {
  const { mostrarToast } = useToast();
  const [formData, setFormData] = useState(FORM_INICIAL);

  if (!isOpen) return null;

  const cerrar = () => {
    setFormData(FORM_INICIAL);
    onClose();
  };

  const handleClickPlano = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * MAPA_ANCHO);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * MAPA_ALTO);
    setFormData({
      ...formData,
      x: Math.min(MAX_X, Math.max(0, x)),
      y: Math.min(MAX_Y, Math.max(0, y)),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.ubicacion.trim()) {
      mostrarToast('Debe ingresar el nombre y la ubicación del sensor.', 'warning');
      return;
    }
    onGuardar(formData);
    cerrar();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-surface-container border-2 border-[#C29B38] rounded-xl max-w-lg w-full max-h-[calc(100vh-2rem)] overflow-y-auto p-6 shadow-2xl flex flex-col gap-4 text-on-surface">
        {/* Cabecera */}
        <div className="flex items-start justify-between border-b border-[#2D3239] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[#C29B38]/20 border border-[#C29B38]/50 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#E0B853] text-[28px]">sensors</span>
            </div>
            <div>
              <span className="font-code-badge text-[11px] text-[#E0B853] uppercase font-bold tracking-wider">
                RED DE MONITOREO · ART. 53 DEC. 1886
              </span>
              <h3 className="font-headline-md text-[18px] font-bold text-white uppercase leading-tight">
                Añadir Nuevo Sensor
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={cerrar}
            className="w-8 h-8 rounded hover:bg-surface-container-high text-secondary hover:text-on-surface flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className={labelClass}>Nombre del Sitio *</label>
              <input
                type="text"
                required
                placeholder="Ej: Frente de Avance 3"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Ubicación *</label>
              <input
                type="text"
                required
                placeholder="Ej: Sector Este · Galería de avance"
                value={formData.ubicacion}
                onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Tipo de Sitio</label>
              <select
                value={formData.tipoSitio}
                onChange={(e) => setFormData({ ...formData, tipoSitio: e.target.value })}
                className={inputClass}
              >
                {Object.values(TIPOS_SITIO).map((t) => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Nivel de Galería</label>
              <select
                value={formData.nivel}
                onChange={(e) => setFormData({ ...formData, nivel: e.target.value })}
                className={inputClass}
              >
                {NIVELES.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Selector de posición sobre el plano */}
          <div>
            <label className={labelClass}>Posición en el Esquema (clic para ubicar)</label>
            <div
              onClick={handleClickPlano}
              className="relative w-full rounded border border-[#2D3239] cursor-crosshair overflow-hidden"
              style={{
                aspectRatio: `${MAPA_ANCHO} / ${MAPA_ALTO}`,
                backgroundColor: '#14161a',
                backgroundImage:
                  'linear-gradient(#1d2026 1px, transparent 1px), linear-gradient(90deg, #1d2026 1px, transparent 1px)',
                backgroundSize: '4.1667% 7.4074%',
              }}
            >
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox={`0 0 ${MAPA_ANCHO} ${MAPA_ALTO}`}
              >
                <path d="M 80 110 L 320 110 L 320 280 L 580 280" fill="none" stroke="#252932" strokeWidth="26" />
                <path d="M 320 280 L 320 460 L 150 460" fill="none" stroke="#252932" strokeWidth="24" />
                <path d="M 580 280 L 720 180" fill="none" stroke="#252932" strokeWidth="24" />
                <path d="M 720 180 L 720 390 L 530 390 L 530 490" fill="none" stroke="#252932" strokeWidth="22" />
                <circle cx={formData.x} cy={formData.y} r="14" fill="#C29B38" fillOpacity="0.3" stroke="#E0B853" strokeWidth="3" />
                <circle cx={formData.x} cy={formData.y} r="5" fill="#E0B853" />
              </svg>
            </div>
            <span className="font-code-badge text-[10px] text-secondary mt-1 block">
              Coordenadas: X {formData.x} · Y {formData.y}
            </span>
          </div>

          <div className="p-2.5 rounded bg-surface-container-lowest border border-[#2D3239] flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#6DAA81]">info</span>
            <span className="font-code-badge text-[11px] text-secondary">
              El sensor se evaluará con los límites de CH₄ del tipo de sitio seleccionado.
            </span>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2D3239]">
            <button
              type="button"
              onClick={cerrar}
              className="min-h-[42px] px-4 rounded bg-surface-container-high hover:bg-surface-variant text-secondary hover:text-on-surface font-action-label text-[12px] uppercase border border-[#2D3239]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="min-h-[42px] px-5 rounded bg-[#C29B38] hover:bg-[#d4aa3e] text-[#121417] font-action-label text-[13px] uppercase font-bold transition-all shadow-md active:scale-98 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Añadir Sensor</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
