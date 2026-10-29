import { useContext } from 'react';
import { MinaContext } from '../context/MinaContext.jsx';

/**
 * Hook para consumir el estado global de la mina
 * REGLA: hooks/ conecta pantallas y contexto de datos.
 */
export function useMina() {
  const ctx = useContext(MinaContext);
  if (!ctx) {
    throw new Error('useMina debe utilizarse dentro de un MinaProvider');
  }
  return ctx;
}

