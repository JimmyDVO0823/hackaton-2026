/* oxlint-disable react/only-export-components */
import React, { createContext, useState } from 'react';

export const MinaContext = createContext(null);

export function MinaProvider({ children }) {
  const [configMina, setConfigMina] = useState({
    nombre: 'Mina El Carbón – Nivel 2',
    cota: 'COTA -420M · SECTOR GALERÍA SUR',
    categoria: 'II',
    turno: 'Turno 2 (14:00 - 22:00)',
    operador: 'Ing. C. Mendoza'
  });

  const [alertasActivas, setAlertasActivas] = useState([]);

  const actualizarConfiguracion = (nuevaCfg) => {
    setConfigMina((prev) => ({ ...prev, ...nuevaCfg }));
  };

  const agregarAlertaActiva = (alerta) => {
    setAlertasActivas((prev) => [alerta, ...prev.slice(0, 9)]);
  };

  const limpiarAlertas = () => {
    setAlertasActivas([]);
  };

  return (
    <MinaContext.Provider
      value={{
        configMina,
        actualizarConfiguracion,
        alertasActivas,
        agregarAlertaActiva,
        limpiarAlertas
      }}
    >
      {children}
    </MinaContext.Provider>
  );
}
