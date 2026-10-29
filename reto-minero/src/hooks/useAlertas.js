import { useAlertasContext } from '../context/AlertasContext.jsx';

/**
 * Hook para la orquestación de alertas y control de audio del tablero.
 * Conectado directamente a AlertasContext para mantener el estado unificado en memoria.
 */
export function useAlertas() {
  return useAlertasContext();
}
