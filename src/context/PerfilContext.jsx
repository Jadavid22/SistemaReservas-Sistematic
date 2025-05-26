import React, { createContext, useContext, useState } from 'react';

const PerfilContext = createContext();

export const PerfilProvider = ({ children }) => {
  const [perfilMenuActivo, setPerfilMenuActivo] = useState(false);

  const togglePerfilMenu = () => {
    setPerfilMenuActivo(!perfilMenuActivo);
  };

  // Cerrar el menú cuando se hace clic fuera
  const cerrarMenu = () => {
    setPerfilMenuActivo(false);
  };

  return (
    <PerfilContext.Provider value={{ perfilMenuActivo, togglePerfilMenu, cerrarMenu }}>
      {children}
    </PerfilContext.Provider>
  );
};

export const usePerfil = () => {
  const context = useContext(PerfilContext);
  if (!context) {
    throw new Error('usePerfil debe ser usado dentro de un PerfilProvider');
  }
  return context;
}; 