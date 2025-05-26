import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../credenciales';
import { useCarrito } from '../context/CarritoContext';
import Header from '../components/Header';
import Alerta from '../components/Alerta';
import '../styles/DetalleProducto.css';

const DetalleProducto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agregarAlCarrito } = useCarrito();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const cargarProducto = async () => {
      try {
        const docRef = doc(db, 'productos', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProducto({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError('Producto no encontrado');
        }
      } catch (error) {
        console.error('Error al cargar el producto:', error);
        setError('Error al cargar el producto');
      } finally {
        setLoading(false);
      }
    };

    cargarProducto();
  }, [id]);

  const handleAgregarAlCarrito = () => {
    if (producto) {
      agregarAlCarrito(producto);
      setMensaje('Producto añadido al carrito');
      setTimeout(() => {
        setMensaje('');
      }, 4000);
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando producto...</p>
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
          <button onClick={() => navigate(-1)}>Volver</button>
        </div>
      </div>
    );
  }

  if (!producto) {
    return null;
  }

  return (
    <div className="app-container">
      <Header />
      <Alerta mensaje={mensaje} onClose={() => setMensaje('')} />

      <main className="detalle-producto-container">
        <div className="detalle-producto">
          <div className="imagen-container">
            <img src={producto.imagen} alt={producto.nombre} />
          </div>
          <div className="informacion-producto">
            <h1>{producto.nombre}</h1>
            <p className="descripcion">{producto.descripcion}</p>
            <div className="precios">
              {producto.enPromocion && (
                <>
                  <p className="precio-original">${producto.precioOriginal}</p>
                  <p className="descuento">-{producto.descuento}%</p>
                </>
              )}
              <p className="precio">${producto.precio}</p>
            </div>
            <p className="stock">Stock disponible: {producto.stock}</p>
            <p className="categoria">Categoría: {producto.categoria}</p>
            <button 
              className="agregar-carrito"
              onClick={handleAgregarAlCarrito}
              disabled={producto.stock <= 0}
            >
              {producto.stock > 0 ? 'Agregar al Carrito' : 'Sin Stock'}
            </button>
            <button 
              className="volver"
              onClick={() => navigate(-1)}
            >
              Volver
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DetalleProducto; 