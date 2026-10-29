import { useState, useMemo } from 'react';
import { obtenerNodosEjemplo } from '../demo/datosEjemplo.js';
import { evaluarNodo } from '../core/evaluador.js';

/**
 * Hook para obtener los nodos sensores con su evaluación normativa calculada en tiempo real.
 * REGLA: Los componentes NUNCA leen un estado escrito a mano; siempre usan la evaluación calculada.
 */
export function useNodos() {
  const [nodos] = useState(() => obtenerNodosEjemplo());

  const nodosConEvaluacion = useMemo(() => {
    const ahora = new Date();
    return nodos.map((nodo) => {
      const evaluacion = evaluarNodo(nodo, ahora);
      return {
        ...nodo,
        evaluacion
      };
    });
  }, [nodos]);

  return {
    nodos: nodosConEvaluacion
  };
}

