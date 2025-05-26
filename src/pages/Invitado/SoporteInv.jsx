import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Secciones.css";
import "../../styles/Soporte.css";
import HeaderInvitado from "../../components/HeaderInvitado";
import Alerta from "../../components/Alerta";

const SoporteInv = () => {
  const navigate = useNavigate();
  const [mensaje, setMensaje] = useState('');
  const [redirigiendo, setRedirigiendo] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMensaje('Para enviar un mensaje de soporte, necesitas iniciar sesión. Serás redirigido al login...');
    setRedirigiendo(true);
    
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  return (
    <div className="app-container">
      <HeaderInvitado />
      <Alerta 
        mensaje={mensaje} 
        onClose={() => {
          setMensaje('');
          if (redirigiendo) {
            navigate('/');
          }
        }} 
      />

      <main className="soporte-container">
        <h2 className="section-title">Soporte</h2>
        
        <div className="soporte-content">
          <div className="soporte-info">
            <h3>¿Necesitas ayuda?</h3>
            <p>Nuestro equipo de soporte está aquí para ayudarte. Puedes contactarnos a través del formulario o por los siguientes medios:</p>
            
            <div className="contacto-info">
              <div className="contacto-item">
                <i className="fas fa-phone"></i>
                <p>+57 300 123 4567</p>
              </div>
              <div className="contacto-item">
                <i className="fas fa-envelope"></i>
                <p>soporte@sistematic.com</p>
              </div>
              <div className="contacto-item">
                <i className="fas fa-clock"></i>
                <p>Lunes a Viernes: 8:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>

          <form className="soporte-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nombre">Nombre</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="asunto">Asunto</label>
              <input
                type="text"
                id="asunto"
                name="asunto"
                value={formData.asunto}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="mensaje">Mensaje</label>
              <textarea
                id="mensaje"
                name="mensaje"
                value={formData.mensaje}
                onChange={handleInputChange}
                rows="5"
                required
              ></textarea>
            </div>

            <button type="submit" className="btn-enviar">
              Enviar Mensaje
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default SoporteInv; 