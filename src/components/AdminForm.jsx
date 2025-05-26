import React, { useState } from 'react';
import { agregarProducto } from '../services/productosService';
import '../styles/AdminForm.css';

const AdminForm = () => {
  const [producto, setProducto] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    categoria: '',
    imagen: ''
  });
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProducto(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const validarFormulario = () => {
    if (!producto.nombre.trim()) {
      throw new Error('El nombre del producto es requerido');
    }
    if (!producto.precio || parseFloat(producto.precio) <= 0) {
      throw new Error('El precio debe ser mayor a 0');
    }
    if (!producto.stock || parseInt(producto.stock) < 0) {
      throw new Error('El stock no puede ser negativo');
    }
    if (!producto.categoria) {
      throw new Error('Debes seleccionar una categoría');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMensaje({ texto: '', tipo: '' });

    try {
      // Validar el formulario antes de enviar
      validarFormulario();

      // Intentar agregar el producto
      await agregarProducto(producto);
      
      setMensaje({
        texto: 'Producto agregado exitosamente',
        tipo: 'exito'
      });

      // Limpiar el formulario
      setProducto({
        nombre: '',
        descripcion: '',
        precio: '',
        stock: '',
        categoria: '',
        imagen: ''
      });
    } catch (error) {
      console.error('Error en el formulario:', error);
      setMensaje({
        texto: error.message || 'Error al agregar el producto',
        tipo: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-form">
      <h2>Agregar Nuevo Producto</h2>
      
      {mensaje.texto && (
        <div className={`mensaje ${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nombre">Nombre del Producto:</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={producto.nombre}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="descripcion">Descripción:</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={producto.descripcion}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="precio">Precio:</label>
          <input
            type="number"
            id="precio"
            name="precio"
            value={producto.precio}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="stock">Stock:</label>
          <input
            type="number"
            id="stock"
            name="stock"
            value={producto.stock}
            onChange={handleChange}
            min="0"
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="categoria">Categoría:</label>
          <select
            id="categoria"
            name="categoria"
            value={producto.categoria}
            onChange={handleChange}
            required
            disabled={isLoading}
          >
            <option value="">Seleccionar categoría</option>
            <option value="Lácteos">Lácteos</option>
            <option value="Abarrotes">Abarrotes</option>
            <option value="Aseo">Aseo</option>
            <option value="Droguería">Droguería</option>
            <option value="Frutas y Verduras">Frutas y Verduras</option>
            <option value="Licores">Licores</option>
            <option value="Mascotas">Mascotas</option>
            <option value="Panadería">Panadería</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="imagen">URL de la Imagen:</label>
          <input
            type="url"
            id="imagen"
            name="imagen"
            value={producto.imagen}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Agregando...' : 'Agregar Producto'}
        </button>
      </form>
    </div>
  );
};

export default AdminForm; 