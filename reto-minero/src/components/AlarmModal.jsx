import React, { useState, useEffect } from 'react';
import { useAlertasContext } from '../context/AlertasContext.jsx';
import { useMina } from '../hooks/useMina.js';
import { trabajadoresRepo } from '../data/repositorio.js';

/**
 * Modal unificado de gestión de alarmas del tablero.
 * Cumple con los requisitos de la Fase 4:
 * 1. Muestra datos REALES calculados (nada de valores inventados).
 * 2. Reconocer alarma: silencia el tablero, registra supervisor y hora, y abre la siguiente sin reconocer.
 * 3. EVACUACION usa modal rojo a pantalla completa.
 * 4. Advierte explícitamente: "La sirena del nodo sigue activa hasta que el CH4 baje del límite".
 * 5. Maneja la confirmación previa para el Protocolo de Evacuación General (SOS).
 */
export function AlarmModal() {
  const {
    alertaModal,
    reconocerAlerta,
    isConfirmEvacuacionOpen,
    cerrarConfirmEvacuacion,
    confirmarEvacuacionGeneral,
  } = useAlertasContext();

  const { configMina } = useMina();
  const supervisor = configMina?.operador || 'Supervisor de turno';

  const [personalSector, setPersonalSector] = useState([]);

  useEffect(() => {
    if (!alertaModal?.nodoId) return undefined;
    let activo = true;
    trabajadoresRepo.listarPorSector(alertaModal.nodoId)
      .then((lista) => {
        if (activo) setPersonalSector(lista);
      })
      .catch(() => {
        if (activo) setPersonalSector([]);
      });

    return () => {
      activo = false;
    };
  }, [alertaModal?.nodoId]);

  // ── 1. Modal de Confirmación de Evacuación General (SOS desde Sidebar) ──────
  if (isConfirmEvacuacionOpen) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <div className="bg-surface-container border-2 border-[#8B3232] rounded-xl w-full max-w-lg p-6 shadow-2xl flex flex-col gap-4 text-on-surface">
          {/* Cabecera */}
          <div className="flex items-center gap-3 text-[#D97575]">
            <div className="w-12 h-12 rounded bg-[#5C2222] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[32px] animate-pulse">sos</span>
            </div>
            <div>
              <span className="font-code-badge text-[11px] uppercase tracking-wider text-[#D97575] font-bold">
                PROTOCOLO DE EMERGENCIA · DEC. 1886 DE 2015
              </span>
              <h3 className="font-headline-md text-[19px] font-bold text-white uppercase leading-tight">
                Evacuación General de la Mina
              </h3>
            </div>
          </div>

          <p className="font-body-md text-[14px] text-on-surface leading-relaxed">
            ¿Confirma la emisión del Protocolo de Evacuación General para todos los niveles y sectores subterráneos?
          </p>

          <div className="p-3.5 rounded bg-surface-container-lowest border border-[#8B3232]/40 font-code-badge text-[12px] text-secondary flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-[#D97575]">
              <span className="material-symbols-outlined text-[16px]">campaign</span>
              <span className="font-bold">Comando simulado a todos los nodos:</span>
            </div>
            <p>• Se encenderán las sirenas y balizas locales de todos los nodos de la mina.</p>
            <p>• Sonará la sirena continua de evacuación en la estación de control.</p>
            <p>• Orden de salida inmediata del personal hacia superficie por tiros y galerías de acceso.</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={cerrarConfirmEvacuacion}
              className="min-h-[46px] px-4 rounded bg-surface-container-high text-secondary hover:text-on-surface font-action-label text-[13px] uppercase border border-[#2D3239]"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmarEvacuacionGeneral}
              className="min-h-[46px] px-5 rounded bg-[#8B3232] hover:bg-[#a63d3d] text-white font-action-label text-[13px] uppercase font-bold transition-all shadow-lg flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">sos</span>
              <span>Confirmar Evacuación</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Si no hay alerta que mostrar, no renderiza nada
  if (!alertaModal) return null;

  const esEvacuacion = alertaModal.nivel === 'EVACUACION';

  // ── 2. Modal ROJO A PANTALLA COMPLETA para EVACUACIÓN ─────────────────────
  if (esEvacuacion) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#2E0B0B]/98 backdrop-blur-xl flex flex-col justify-between p-6 sm:p-10 text-white overflow-y-auto">
        {/* Cabecera superior */}
        <div className="flex items-center justify-between border-b border-[#8B3232] pb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg bg-[#8B3232] flex items-center justify-center shrink-0 animate-bounce">
              <span className="material-symbols-outlined text-[38px] text-white">sos</span>
            </div>
            <div>
              <span className="font-code-badge text-[12px] tracking-widest text-[#FFA5A5] uppercase font-bold">
                MÁXIMA PRIORIDAD · REGLAMENTO DE SEGURIDAD MINERA
              </span>
              <h1 className="font-headline-md text-[24px] sm:text-[30px] font-black uppercase text-white tracking-wide">
                Protocolo de Evacuación Inmediata
              </h1>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded bg-[#8B3232]/50 border border-[#FFA5A5]/40 font-code-badge text-[12px]">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
            <span>SIRENA CONTINUA ACTIVA</span>
          </div>
        </div>

        {/* Cuerpo central con datos REALES */}
        <div className="my-auto py-6 max-w-4xl mx-auto w-full flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-black/40 rounded-lg border border-[#8B3232]">
              <span className="font-code-badge text-[11px] text-[#FFA5A5] uppercase">Sector Afectado</span>
              <p className="font-headline-md text-[20px] font-bold text-white mt-1 uppercase">
                {alertaModal.nombre}
              </p>
            </div>
            <div className="p-4 bg-black/40 rounded-lg border border-[#8B3232]">
              <span className="font-code-badge text-[11px] text-[#FFA5A5] uppercase">Lectura de Gas</span>
              <p className="font-telemetry-value-lg text-[24px] font-bold text-white mt-1">
                {alertaModal.gas} {alertaModal.valor} {typeof alertaModal.valor === 'number' ? '%Vol' : ''}
              </p>
              <span className="font-code-badge text-[11px] text-[#FFA5A5]">
                Límite normativo: {alertaModal.limite} ({alertaModal.articulo})
              </span>
            </div>
            <div className="p-4 bg-black/40 rounded-lg border border-[#8B3232]">
              <span className="font-code-badge text-[11px] text-[#FFA5A5] uppercase">Hora de Registro</span>
              <p className="font-telemetry-value-lg text-[22px] font-bold text-white mt-1">
                {alertaModal.hora}
              </p>
              <span className="font-code-badge text-[11px] text-[#FFA5A5]">Turno operativo actual</span>
            </div>
          </div>

          {/* Acción obligatoria */}
          <div className="p-4 bg-black/50 rounded-lg border-l-4 border-l-white border border-[#8B3232]">
            <span className="font-code-badge text-[12px] text-[#FFA5A5] uppercase font-bold">
              Instrucción Normativa Obligatoria:
            </span>
            <p className="font-body-md text-[16px] text-white font-semibold mt-1">
              {alertaModal.accion}
            </p>
          </div>

          {/* Personal en el sector para rescate/evacuación */}
          {personalSector.length > 0 && (
            <div className="p-4 bg-black/60 rounded-lg border border-[#8B3232]">
              <span className="font-code-badge text-[12px] text-[#FFA5A5] uppercase font-bold flex items-center gap-1.5 mb-2">
                <span className="material-symbols-outlined text-[16px]">groups</span>
                Personal Asignado en este Sector (Fichas de Emergencia SOS):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {personalSector.map((p) => (
                  <div key={p.id} className="p-2.5 rounded bg-[#3B1212] border border-[#8B3232] flex items-center justify-between">
                    <div>
                      <p className="font-action-label text-[13px] font-bold text-white leading-tight">{p.nombre}</p>
                      <p className="font-code-badge text-[11px] text-[#FFA5A5]">{p.rol}</p>
                      <p className="font-code-badge text-[10px] text-gray-300">SOS: {p.contactoEmergencia?.nombre} ({p.contactoEmergencia?.telefono})</p>
                    </div>
                    <div className="px-2 py-1 rounded bg-[#8B3232] text-white text-center font-bold font-headline-md text-[13px] shrink-0">
                      <span className="text-[9px] block text-[#FFA5A5]">RH</span>
                      {p.fichaMedica?.tipoSangre}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AVISO MANDATORIO: Sirena local sigue activa */}
          <div className="p-4 bg-[#8B3232]/40 rounded-lg border border-dashed border-[#FFA5A5] flex items-start gap-3">
            <span className="material-symbols-outlined text-[26px] text-[#FFA5A5] shrink-0 mt-0.5">
              campaign
            </span>
            <div>
              <p className="font-action-label text-[14px] font-bold text-white">
                La sirena del nodo sigue activa hasta que el CH₄ baje del límite
              </p>
              <p className="font-body-md text-[13px] text-[#FFD0D0] mt-1 leading-relaxed">
                Reconocer la alarma en el tablero silencia el audio de la estación de control para permitir
                la coordinación de la emergencia, pero <strong>NO apaga las sirenas ni balizas locales de los nodos</strong>,
                las cuales continuarán alertando al personal en mina hasta que la atmósfera sea segura.
              </p>
            </div>
          </div>
        </div>

        {/* Pie con botón Reconocer Alarma */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#8B3232]">
          <div className="font-code-badge text-[12px] text-[#FFA5A5]">
            Reconocimiento quedará firmado por: <strong className="text-white">{supervisor}</strong>
          </div>

          <button
            type="button"
            onClick={() => reconocerAlerta(alertaModal.id, supervisor)}
            className="min-h-[52px] px-8 rounded-lg bg-white hover:bg-[#F3F4F6] text-[#8B3232] font-action-label text-[15px] uppercase font-black transition-all shadow-2xl flex items-center gap-2 active:scale-98"
          >
            <span className="material-symbols-outlined text-[22px]">verified</span>
            <span>Reconocer Alarma y Silenciar Tablero</span>
          </button>
        </div>
      </div>
    );
  }

  // ── 3. Modal Centrado para ALARMA (Suspensión de labores) ─────────────────
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-surface-container border-2 border-[#B2533E] rounded-xl w-full max-w-lg p-6 shadow-2xl flex flex-col gap-4 text-on-surface">
        {/* Cabecera */}
        <div className="flex items-center gap-3 text-[#D87661]">
          <div className="w-12 h-12 rounded bg-[#5C2222] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[30px] animate-pulse">report</span>
          </div>
          <div>
            <span className="font-code-badge text-[11px] uppercase tracking-wider text-[#D87661] font-bold">
              SUSPENSIÓN DE LABORES · {alertaModal.articulo} DEC. 1886
            </span>
            <h3 className="font-headline-md text-[19px] font-bold text-white uppercase leading-tight">
              Alarma: {alertaModal.nombre}
            </h3>
          </div>
        </div>

        {/* Métricas reales */}
        <div className="grid grid-cols-2 gap-2.5 p-3 rounded bg-surface-container-lowest border border-[#2D3239]">
          <div>
            <span className="font-code-badge text-[11px] text-secondary">
              {alertaModal.gas ? `${alertaModal.gas} MEDIDO` : 'CONCENTRACIÓN MEDIDA'}
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-telemetry-value-md text-[24px] font-bold text-[#D87661]">
                {typeof alertaModal.valor === 'number' ? alertaModal.valor.toFixed(1) : alertaModal.valor}
              </span>
              <span className="font-telemetry-unit text-[12px] text-secondary">
                {alertaModal.unidad || (alertaModal.gas === 'CH4' ? '%Vol' : '')}
              </span>
            </div>
            <span className="font-code-badge text-[10px] text-secondary">
              Límite de seguridad: {alertaModal.limite} {alertaModal.unidad || (alertaModal.gas === 'CH4' ? '%Vol' : '')}
            </span>
          </div>

          <div>
            <span className="font-code-badge text-[11px] text-secondary">HORA DE DISPARO</span>
            <div className="font-telemetry-value-md text-[20px] font-bold text-on-surface mt-1">
              {alertaModal.hora}
            </div>
            <span className="font-code-badge text-[10px] text-secondary">
              Supervisor: {supervisor}
            </span>
          </div>
        </div>

        {/* Acción requerida */}
        <div className="p-3 rounded bg-surface-container-lowest border border-[#2D3239]">
          <span className="font-code-badge text-[11px] text-[#C2A855] uppercase font-bold">
            Medida Preventiva Inmediata:
          </span>
          <p className="font-body-md text-[13px] text-on-surface mt-1 leading-snug">
            {alertaModal.accion}
          </p>
        </div>

        {/* Personal en el sector */}
        {personalSector.length > 0 && (
          <div className="p-3 rounded bg-surface-container-lowest border border-[#2D3239]">
            <span className="font-code-badge text-[11px] text-[#D87661] uppercase font-bold flex items-center gap-1.5 mb-1.5">
              <span className="material-symbols-outlined text-[15px]">badge</span>
              Personal en este sector (Ficha de Emergencia):
            </span>
            <div className="flex flex-col gap-1.5">
              {personalSector.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-[12px] p-2 rounded bg-surface-container border border-[#2D3239]">
                  <div>
                    <span className="font-semibold text-on-surface">{p.nombre}</span>
                    <span className="text-secondary text-[11px] block">{p.rol}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#5C2222] text-white font-bold text-[11px] border border-[#8B3232]">
                      RH {p.fichaMedica?.tipoSangre}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AVISO MANDATORIO: Sirena local del nodo sigue activa */}
        <div className="p-3 rounded bg-[#2E1A17] border border-[#B2533E]/50 flex items-start gap-2.5">
          <span className="material-symbols-outlined text-[20px] text-[#D87661] shrink-0 mt-0.5">
            campaign
          </span>
          <p className="font-code-badge text-[11px] text-[#FFA5A5] leading-relaxed">
            <strong>La sirena del nodo sigue activa hasta que el CH₄ baje del límite.</strong> Reconocer
            la alarma en el tablero silencia el audio de la consola, pero la sirena local continúa protegiendo el sitio.
          </p>
        </div>

        {/* Botón Reconocer Alarma */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => reconocerAlerta(alertaModal.id, supervisor)}
            className="min-h-[48px] px-6 rounded-lg bg-[#B2533E] hover:bg-[#c65e47] text-white font-action-label text-[13px] uppercase font-bold transition-all shadow-md flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>Reconocer Alarma</span>
          </button>
        </div>
      </div>
    </div>
  );
}
