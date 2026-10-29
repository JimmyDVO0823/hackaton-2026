import React from 'react';

/**
 * Modal de confirmación para protocolos de alarma y evacuación inmediata
 */
export function AlarmModal({ isOpen, sectorName = '', isEvacuation = false, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-surface-container border-2 border-[#B2533E] rounded-lg w-full max-w-md p-space-md shadow-2xl flex flex-col gap-4">
        {/* Cabecera de Alerta Crítica */}
        <div className="flex items-center gap-3 text-[#D87661]">
          <div className="w-12 h-12 rounded bg-[#5C2222] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[30px] animate-pulse">
              {isEvacuation ? 'sos' : 'emergency'}
            </span>
          </div>
          <div>
            <span className="font-code-badge text-[11px] uppercase tracking-wider text-[#D87661]">
              {isEvacuation ? 'PROCEDIMIENTO CRÍTICO DE VIDA' : 'SUSPENSIÓN DE LABORES'}
            </span>
            <h3 className="font-headline-md text-[18px] font-bold text-white uppercase leading-tight">
              {isEvacuation ? 'Protocolo Evacuación General' : `Alarma: ${sectorName}`}
            </h3>
          </div>
        </div>

        <p className="font-body-md text-[14px] text-on-surface">
          {isEvacuation
            ? '¿Confirma el disparo del protocolo de evacuación general para todos los niveles de la mina? Se alertará inmediatamente a superficie y se cortará el suministro eléctrico según Dec. 1886.'
            : `¿Confirma la emisión de Alerta Operativa para ${sectorName} y la suspensión inmediata de todas las actividades en el sector?`}
        </p>

        <div className="p-3 rounded bg-surface-container-lowest border border-[#2D3239] font-code-badge text-[12px] text-secondary">
          <p>• Notificación automática a: <strong>Ing. C. Mendoza</strong></p>
          <p>• Alerta a brigada de ventilación subterránea</p>
          <p>• Registro en bitácora inmutable de seguridad</p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] px-4 rounded bg-surface-container-high text-secondary hover:text-on-surface font-action-label text-[13px] uppercase border border-[#2D3239]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="min-h-[48px] px-5 rounded bg-[#B2533E] hover:bg-[#d97575] text-white font-action-label text-[13px] uppercase font-bold transition-all shadow-md"
          >
            Confirmar Activación
          </button>
        </div>
      </div>
    </div>
  );
}

