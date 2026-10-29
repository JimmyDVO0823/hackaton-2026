import { useAlertasContext } from '../context/AlertasContext.jsx';

/**
 * Hook para obtener los nodos sensores con su evaluación normativa calculada en tiempo real.
 * REGLA: Los componentes NUNCA leen un estado escrito a mano; siempre usan la evaluación calculada.
 */
export function useNodos() {
  const { nodos, activarSirenasTodosLosNodos } = useAlertasContext();
  return {
    nodos,
    activarSirenasTodosLosNodos,
  };
}
