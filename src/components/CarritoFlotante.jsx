import React from 'react'; // Importar React
import '../styles/Carrito.css'; // Importar estilos específicos para el carrito flotante
import { useCarrito } from '../context/CarritoContext'; // Importar el contexto del carrito

// Componente CarritoFlotante que muestra un ícono de carrito y la cantidad total de productos
const CarritoFlotante = () => {
  const { cantidadTotal, setMostrarCarrito } = useCarrito(); // Obtener la cantidad total y la función para mostrar el carrito del contexto

  return (
    <div className="carrito-flotante" onClick={() => setMostrarCarrito(true)}> {/* Contenedor del carrito flotante */}
      🛒 {/* Icono del carrito */}
      {cantidadTotal > 0 && <span className="carrito-contador">{cantidadTotal}</span>} {/* Mostrar contador si hay productos en el carrito */}
    </div>
  );
};

export default CarritoFlotante; 