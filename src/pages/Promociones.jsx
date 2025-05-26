import React, { useState, useEffect } from "react";
import "../styles/Secciones.css";
import "../styles/Cliente.css";
import Carrito from "../components/Carrito";
import CarritoFlotante from "../components/CarritoFlotante";
import { useCarrito } from "../context/CarritoContext";
import Header from "../components/Header";
import { getProductosEnPromocion } from "../services/productosService";
import Alerta from "../components/Alerta";

const Promociones = () => {
  const { agregarAlCarrito } = useCarrito();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [mostrarCarrito, setMostrarCarrito] = useState(false);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const productosData = await getProductosEnPromocion();
      setProductos(productosData);
      setError(null);
    } catch (error) {
      console.error('Error al cargar Eventos:', error);
      setError('Error al cargar los Eventos');
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarAlCarrito = (producto) => {
    agregarAlCarrito(producto);
    setMensaje('Producto añadido al carrito');
    setTimeout(() => {
      setMensaje('');
    }, 4000);
  };

  if (loading) {
    return (
      <div className="app-container">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando Eventos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <Header />
        <div className="error-container">
          <p>{error}</p>
          <button onClick={cargarProductos}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header />
      <Alerta mensaje={mensaje} onClose={() => setMensaje('')} />

      <main className="productos-container">
        <h1>Promociones</h1>
        <div className="productos-grid">
          {productos.map((producto) => (
            <div className="producto-card" key={producto.id}>
              {producto.descuento && <div className="descuento-badge">-{producto.descuento}%</div>}
              <img src={producto.imagen} alt={producto.nombre} />
              <h3>{producto.nombre}</h3>
              <p className="descripcion">{producto.descripcion}</p>
              {producto.precioOriginal && <p className="precio-original">${producto.precioOriginal}</p>}
              <p className="precio">${producto.precio}</p>
              <button 
                className="agregar-carrito" 
                onClick={() => handleAgregarAlCarrito(producto)}
              >
                Agregar al Carrito
              </button>
            </div>
          ))}
        </div>

        {productos.length === 0 && (
          <div className="no-productos">
            <p>No hay productos en promoción en este momento</p>
          </div>
        )}
      </main>

      <CarritoFlotante 
        onClick={() => setMostrarCarrito(true)}
      />
      <Carrito 
        visible={mostrarCarrito}
        onClose={() => setMostrarCarrito(false)}
      />
    </div>
  );
};

export default Promociones; 