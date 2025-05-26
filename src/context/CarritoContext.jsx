import React, { createContext, useState, useContext, useEffect } from 'react';

const CarritoContext = createContext();

export const CarritoProvider = ({ children }) => {
  const [carrito, setCarrito] = useState(() => {
    const carritoGuardado = localStorage.getItem('carrito');
    return carritoGuardado ? JSON.parse(carritoGuardado) : [];
  });
  
  const [mostrarCarrito, setMostrarCarrito] = useState(false);

  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(carrito));
  }, [carrito]);

  const agregarAlCarrito = (evento) => {
    setCarrito(prevCarrito => {
      const itemExistente = prevCarrito.find(item => item.id === evento.id);
      if (itemExistente) {
        return prevCarrito.map(item =>
          item.id === evento.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prevCarrito, { 
        ...evento, 
        cantidad: 1,
        tipo: 'reserva',
        fechaReserva: new Date().toISOString()
      }];
    });
  };

  const eliminarDelCarrito = (eventoId) => {
    setCarrito(prevCarrito => prevCarrito.filter(item => item.id !== eventoId));
  };

  const aumentarCantidad = (eventoId) => {
    setCarrito(prevCarrito =>
      prevCarrito.map(item =>
        item.id === eventoId
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      )
    );
  };

  const disminuirCantidad = (eventoId) => {
    setCarrito(prevCarrito =>
      prevCarrito.map(item =>
        item.id === eventoId && item.cantidad > 1
          ? { ...item, cantidad: item.cantidad - 1 }
          : item
      ).filter(item => item.cantidad > 0)
    );
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const cantidadTotal = carrito.reduce((total, item) => total + item.cantidad, 0);

  const limpiarCarrito = () => {
    setCarrito([]);
    localStorage.removeItem('carrito');
  };

  return (
    <CarritoContext.Provider
      value={{
        carrito,
        mostrarCarrito,
        setMostrarCarrito,
        agregarAlCarrito,
        eliminarDelCarrito,
        aumentarCantidad,
        disminuirCantidad,
        calcularTotal,
        cantidadTotal,
        limpiarCarrito
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
};

export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (!context) {
    throw new Error('useCarrito debe ser usado dentro de un CarritoProvider');
  }
  return context;
}; 