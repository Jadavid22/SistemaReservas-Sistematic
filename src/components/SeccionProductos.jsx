import React, { useState, useEffect } from "react";
import { getProductosPorCategoria } from "../services/productosService";
import { useCarrito } from "../context/CarritoContext";
import Alerta from "./Alerta";
import Header from "./Header";
import Carrito from "./Carrito";
import CarritoFlotante from "./CarritoFlotante";
import "../styles/Secciones.css";

const ITEMS_PER_PAGE = 4;

const SeccionProductos = ({ titulo, categoria }) => {
    const { agregarAlCarrito } = useCarrito();
    const [productos, setProductos] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [mensaje, setMensaje] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mostrarCarrito, setMostrarCarrito] = useState(false);

    useEffect(() => {
        cargarProductos();
    }, [categoria]);

    const cargarProductos = async () => {
        try {
            setLoading(true);
            const productosData = await getProductosPorCategoria(categoria);
            setProductos(productosData);
            setError(null);
        } catch (error) {
            console.error('Error al cargar productos:', error);
            setError('Error al cargar los productos');
        } finally {
            setLoading(false);
        }
    };

    const indexOfLastProduct = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstProduct = indexOfLastProduct - ITEMS_PER_PAGE;
    const currentProducts = productos.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(productos.length / ITEMS_PER_PAGE);

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
                    <p>Cargando productos...</p>
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
                <h1>{titulo}</h1>
                <div className="productos-grid">
                    {currentProducts.map((producto) => (
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
                        <p>No hay productos disponibles en esta categoría</p>
                    </div>
                )}

                {productos.length > 0 && (
                    <div className="pagination">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                            disabled={currentPage === 1}
                        >
                            Anterior
                        </button>
                        <span>Página {currentPage} de {totalPages}</span>
                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                            disabled={currentPage === totalPages}
                        >
                            Siguiente
                        </button>
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

export default SeccionProductos; 