import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Secciones.css";
import HeaderInvitado from "../../components/HeaderInvitado";
import { getEventosPorCategoria } from "../../services/eventosService";
import Alerta from "../../components/Alerta";

const PicnicInv = () => {
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [redirigiendo, setRedirigiendo] = useState(false);

  useEffect(() => {
    const cargarEventos = async () => {
      try {
        setLoading(true);
        const eventosPicnic = await getEventosPorCategoria("Picnic");
        
        if (!eventosPicnic) {
          setEventos([]);
          return;
        }

        if (!Array.isArray(eventosPicnic)) {
          setError('Error en el formato de los datos recibidos');
          return;
        }

        setEventos(eventosPicnic);
      } catch (error) {
        setError(error.message || 'Error al cargar los eventos');
      } finally {
        setLoading(false);
      }
    };

    cargarEventos();
  }, []);

  const handleReservarClick = (event, evento) => {
    event.stopPropagation();
    setMensaje('Para realizar una reserva, necesitas iniciar sesión. Serás redirigido al login...');
    setRedirigiendo(true);
    
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  if (loading) {
    return (
      <div className="app-container">
        <HeaderInvitado />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando eventos de picnic...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <HeaderInvitado />
        <div className="error-container">
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </div>
    );
  }

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
      
      <main className="seccion-container">
        <div className="seccion-header">
          <h1 className="seccion-titulo">Picnic</h1>
          <p className="seccion-descripcion">Descubre los mejores lugares para disfrutar de un picnic</p>
        </div>
        
        <div className="eventos-grid">
          {eventos && eventos.length > 0 ? (
            eventos.map((evento) => (
              <div key={evento.id} className="evento-card">
                {evento.imagen ? (
                  <img src={evento.imagen} alt={evento.nombre} className="evento-image" />
                ) : (
                  <div className="evento-image-placeholder">
                    <span>Sin imagen</span>
                  </div>
                )}
                <div className="evento-info">
                  <h3>{evento.nombre}</h3>
                  <div className="evento-detalles">
                    <p><strong>Fecha:</strong> {new Date(evento.fecha).toLocaleDateString()}</p>
                    <p><strong>Hora:</strong> {evento.horaInicio} - {evento.horaFinal}</p>
                    <p><strong>Capacidad:</strong> {evento.capacidadDisponible}/{evento.capacidad}</p>
                    <p><strong>Precio:</strong> ${evento.precio}</p>
                    <p><strong>Ubicación:</strong> {evento.ubicacion}</p>
                  </div>
                  {evento.destacado && (
                    <span className="destacado-badge">Evento Destacado</span>
                  )}
                  <button 
                    className="btn-reservar"
                    onClick={(e) => handleReservarClick(e, evento)}
                    disabled={evento.capacidadDisponible <= 0}
                  >
                    {evento.capacidadDisponible <= 0 ? 'Agotado' : 'Reservar Ahora'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-eventos">
              <p>No hay eventos de picnic disponibles en este momento</p>
              <p className="no-eventos-sub">¡Vuelve pronto para ver nuevos eventos!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PicnicInv; 