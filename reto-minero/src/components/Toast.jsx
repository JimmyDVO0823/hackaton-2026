/* oxlint-disable react/only-export-components */
import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removerToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const mostrarToast = useCallback((mensaje, tipo = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const nuevo = { id, mensaje, tipo };
    setToasts((prev) => [...prev, nuevo]);

    setTimeout(() => {
      removerToast(id);
    }, 4500);
  }, [removerToast]);

  return (
    <ToastContext.Provider value={{ mostrarToast }}>
      {children}
      {/* Contenedor flotante de notificaciones Toast */}
      <div
        aria-live="polite"
        className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-2.5 max-w-md pointer-events-none"
      >
        {toasts.map((toast) => {
          const { id, mensaje, tipo } = toast;

          const estilos = {
            success: {
              border: 'border-l-4 border-l-[#4A7A5B] border-[#2D3239]',
              bg: 'bg-[#18231C]/95 text-[#6DAA81]',
              icon: 'check_circle',
            },
            warning: {
              border: 'border-l-4 border-l-[#A38A3A] border-[#2D3239]',
              bg: 'bg-[#2A261A]/95 text-[#C2A855]',
              icon: 'warning_amber',
            },
            danger: {
              border: 'border-l-4 border-l-[#B2533E] border-[#2D3239]',
              bg: 'bg-[#2D1A17]/95 text-[#D87661]',
              icon: 'report',
            },
            info: {
              border: 'border-l-4 border-l-[#3B82F6] border-[#2D3239]',
              bg: 'bg-[#141C2B]/95 text-[#93C5FD]',
              icon: 'info',
            },
          };

          const e = estilos[tipo] ?? estilos.info;

          return (
            <div
              key={id}
              role="alert"
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded shadow-2xl backdrop-blur-md border ${e.border} ${e.bg} transition-all duration-200 animate-slide-in`}
            >
              <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">
                {e.icon}
              </span>
              <p className="font-body-md text-[13px] text-on-surface leading-snug flex-1">
                {mensaje}
              </p>
              <button
                type="button"
                onClick={() => removerToast(id)}
                className="text-secondary hover:text-on-surface p-0.5 rounded shrink-0 transition-colors"
                title="Cerrar notificación"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      mostrarToast: (msg) => console.log('Toast:', msg),
    };
  }
  return ctx;
}

