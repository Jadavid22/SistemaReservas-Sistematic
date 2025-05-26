import React, { useState } from "react"; // Importar React y useState para manejar el estado
import "../styles/Soporte.css"; // Importar estilos específicos para la página de soporte
import Carrito from "../components/Carrito"; // Importar componente Carrito
import CarritoFlotante from "../components/CarritoFlotante"; // Importar componente Carrito Flotante
import Header from "../components/Header"; // Importar componente Header
import { useCarrito } from '../context/CarritoContext';

// Componente principal de Soporte
const Soporte = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: ''
  });
  const { mostrarCarrito, setMostrarCarrito, carrito } = useCarrito();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí puedes implementar la lógica para enviar el formulario
    console.log('Formulario enviado:', formData);
    // Limpiar el formulario después del envío
    setFormData({
      nombre: '',
      email: '',
      asunto: '',
      mensaje: ''
    });
  };

  return (
    <div className="app-container">
      <Header /> 

      <main className="soporte-container"> 
        <h1>Centro de Soporte</h1> 
        <div className="soporte-grid"> 
          
          {/* Sección de Preguntas Frecuentes */}
          <div className="soporte-section">
            <h2>Preguntas Frecuentes</h2>
            <div className="faq-container"> 
              <div className="faq-item">
                <h3>¿Cómo realizo un pedido?</h3>
                <p>Selecciona los productos que desees, agrégalos al carrito y sigue el proceso de pago.</p>
              </div>
              <div className="faq-item">
                <h3>¿Cuáles son los métodos de pago?</h3>
                <p>Aceptamos tarjetas de crédito, débito, transferencias y efectivo contra entrega.</p>
              </div>
              <div className="faq-item">
                <h3>¿Cuál es el tiempo de entrega?</h3>
                <p>Las entregas se realizan el mismo día para pedidos antes de las 6 PM.</p>
              </div>
            </div>
          </div>

          {/* Sección de Contacto */}
          <div className="soporte-section">
            <h2>Contáctanos</h2>
            <form className="contact-form" onSubmit={handleSubmit}> 
              <div className="form-group">
                <label htmlFor="nombre">Nombre:</label>
                <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required /> 
              </div>
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required /> 
              </div>
              <div className="form-group">
                <label htmlFor="asunto">Asunto:</label>
                <input type="text" id="asunto" name="asunto" value={formData.asunto} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="mensaje">Mensaje:</label>
                <textarea id="mensaje" name="mensaje" value={formData.mensaje} onChange={handleChange} rows="5" required></textarea> 
              </div>
              <button type="submit" className="submit-btn">Enviar Mensaje</button> 
            </form>
          </div>

          {/* Sección de Información de Contacto */}
          <div className="soporte-section">
            <h2>Información de Contacto</h2>
            <div className="contact-info"> 
              <div className="contact-item">
                <span className="icon">📞</span>
                <div className="contact-details">
                  <h3>Teléfono</h3>
                  <p>+57 300 123 4567</p>
                  <p>Lunes a Domingo: 8:00 AM - 8:00 PM</p>
                </div>
              </div>
              <div className="contact-item">
                <span className="icon">✉️</span>
                <div className="contact-details">
                  <h3>Email</h3>
                  <p>soporte@rapidmart.com</p>
                  <p>Respuesta en menos de 24 horas</p>
                </div>
              </div>
              <div className="contact-item">
                <span className="icon">💬</span>
                <div className="contact-details">
                  <h3>Chat en Vivo</h3>
                  <p>Disponible en horario de atención</p>
                  <button className="chat-btn">Iniciar Chat</button> 
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Carrito Flotante */}
      <CarritoFlotante 
        cantidad={carrito.length}
        onClick={() => setMostrarCarrito(true)}
      />

      {/* Componente Carrito */}
      <Carrito
        visible={mostrarCarrito} // Controlar la visibilidad del carrito
        onClose={() => setMostrarCarrito(false)} // Manejar el cierre del carrito
        productos={carrito} // Pasar los productos al carrito
      />
    </div>
  );
};

export default Soporte; 