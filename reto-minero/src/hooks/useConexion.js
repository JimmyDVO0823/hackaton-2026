import { useState, useEffect } from 'react';

/**
 * Hook para monitorear el estado de conexión de red en tiempo real
 * Responde inmediatamente a eventos 'online' y 'offline' de la ventana
 */
export function useConexion() {
  const [estaEnLinea, setEstaEnLinea] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setEstaEnLinea(true);
    const handleOffline = () => setEstaEnLinea(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    estaEnLinea,
    sinConexion: !estaEnLinea
  };
}

