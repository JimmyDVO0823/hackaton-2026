import React, { useState } from 'react';

/**
 * Modal táctil para registrar una nueva medición de gases atmosféricos
 */
export function MeasurementModal({ isOpen, initialSector = '', onClose, onSave }) {
  const [sectorName, setSectorName] = useState(initialSector || 'Tambor 3');
  const [ch4, setCh4] = useState('0.2');
  const [o2, setO2] = useState('20.8');
  const [co, setCo] = useState('5');
  const [operator, setOperator] = useState('Ing. C. Mendoza');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      sectorName,
      ch4: parseFloat(ch4) || 0,
      o2: parseFloat(o2) || 0,
      co: parseInt(co, 10) || 0,
      operator
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-surface-container border border-[#2D3239] rounded-lg w-full max-w-lg p-space-md shadow-2xl flex flex-col gap-4">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between border-b border-[#2D3239] pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#C29B38] text-[24px]">science</span>
            <h2 className="font-headline-md text-[18px] font-bold text-on-surface uppercase">
              Registrar Medición Atmosférica
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded bg-surface-container-high text-secondary hover:text-on-surface flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Formulario táctil */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block font-code-badge text-[12px] text-secondary uppercase mb-1">
              Sector / Galería
            </label>
            <select
              value={sectorName}
              onChange={(e) => setSectorName(e.target.value)}
              className="w-full min-h-[48px] bg-surface-container-lowest border border-[#2D3239] rounded px-3 text-on-surface font-body-md focus:outline-none focus:border-[#C29B38]"
            >
              <option value="Tambor 3">Tambor 3 (Pilar Sur)</option>
              <option value="Retorno Principal">Retorno Principal</option>
              <option value="Frente de Explotación 1">Frente de Explotación 1</option>
              <option value="Galería de Transporte">Galería de Transporte</option>
              <option value="Inyección de Aire (Nivel 2)">Inyección de Aire (Nivel 2)</option>
              <option value="Túnel Acceso Principal">Túnel Acceso Principal</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-code-badge text-[11px] text-secondary uppercase mb-1">
                CH₄ Metano (%Vol)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={ch4}
                onChange={(e) => setCh4(e.target.value)}
                className="w-full min-h-[48px] bg-surface-container-lowest border border-[#2D3239] rounded px-3 text-on-surface font-telemetry-value-md text-[18px] focus:outline-none focus:border-[#C29B38]"
                required
              />
              <span className="font-code-badge text-[10px] text-secondary">Norma: &lt; 1.0%</span>
            </div>
            <div>
              <label className="block font-code-badge text-[11px] text-secondary uppercase mb-1">
                O₂ Oxígeno (%Vol)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="25"
                value={o2}
                onChange={(e) => setO2(e.target.value)}
                className="w-full min-h-[48px] bg-surface-container-lowest border border-[#2D3239] rounded px-3 text-on-surface font-telemetry-value-md text-[18px] focus:outline-none focus:border-[#C29B38]"
                required
              />
              <span className="font-code-badge text-[10px] text-secondary">Norma: &gt; 19.5%</span>
            </div>
            <div>
              <label className="block font-code-badge text-[11px] text-secondary uppercase mb-1">
                CO Monóxido (PPM)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="500"
                value={co}
                onChange={(e) => setCo(e.target.value)}
                className="w-full min-h-[48px] bg-surface-container-lowest border border-[#2D3239] rounded px-3 text-on-surface font-telemetry-value-md text-[18px] focus:outline-none focus:border-[#C29B38]"
                required
              />
              <span className="font-code-badge text-[10px] text-secondary">Norma: &lt; 25 PPM</span>
            </div>
          </div>

          <div>
            <label className="block font-code-badge text-[12px] text-secondary uppercase mb-1">
              Operador de Ronda
            </label>
            <input
              type="text"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="w-full min-h-[48px] bg-surface-container-lowest border border-[#2D3239] rounded px-3 text-on-surface font-body-md focus:outline-none focus:border-[#C29B38]"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2D3239]">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] px-4 rounded bg-surface-container-high text-secondary hover:text-on-surface font-action-label text-[13px] uppercase border border-[#2D3239]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="min-h-[48px] px-5 rounded bg-[#C29B38] hover:bg-[#d2b56d] text-[#181a1e] font-action-label text-[13px] uppercase font-bold transition-all shadow-sm"
            >
              Guardar Medición
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

