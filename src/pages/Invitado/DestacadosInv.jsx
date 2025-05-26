import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Secciones.css";
import "../../styles/Cliente.css";
import HeaderInvitado from "../../components/HeaderInvitado";
import { getEventos } from "../../services/eventosService";
import Alerta from "../../components/Alerta";

const DestacadosInv = () => {
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [redirigiendo, setRedirigiendo] = useState(false);

  useEffect(() => {
    cargarEventosDestacados();
  }, []);

  const cargarEventosDestacados = async () => {
    try {
      setLoading(true);
      const eventosData = await getEventos();
      // Filtrar eventos destacados
      const eventosDestacados = eventosData.filter(evento => evento.destacado);
      setEventos(eventosDestacados);
      setError(null);
    } catch (error) {
      console.error('Error al cargar Eventos Destacados:', error);
      setError('Error al cargar los Eventos Destacados');
    } finally {
      setLoading(false);
    }
  };

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
          <p>Cargando Eventos Destacados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <HeaderInvitado />
        <div className="error-container">
          <p>{error}</p>
          <button onClick={cargarEventosDestacados}>Reintentar</button>
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

      <main className="productos-container">
        <h2 className="section-title">Eventos Destacados</h2>
        
        <div className="eventos-grid">
          {eventos.map((evento) => (
            <div key={evento.id} className="evento-card" style={{ minHeight: '650px' }}>
              {evento.imagen && (
                <img 
                  src={evento.imagen} 
                  alt={evento.nombre} 
                  className="evento-image" 
                  style={{ height: '500px', objectFit: 'cover' }}
                />
              )}
              <div className="evento-info">
                <h3>{evento.nombre}</h3>
                <p><strong>Tipo:</strong> {evento.tipo}</p>
                <p><strong>Categoría:</strong> {evento.categoria}</p>
                <p><strong>Fecha:</strong> {new Date(evento.fecha).toLocaleDateString()}</p>
                <p><strong>Hora:</strong> {evento.horaInicio} - {evento.horaFinal}</p>
                <p><strong>Capacidad:</strong> {evento.capacidadDisponible}/{evento.capacidad}</p>
                <p><strong>Precio:</strong> ${evento.precio}</p>
                <p><strong>Ubicación:</strong> {evento.ubicacion}</p>
                <span className="destacado-badge">Destacado</span>
                <button 
                  className="btn-reservar"
                  onClick={(e) => handleReservarClick(e, evento)}
                  disabled={evento.capacidadDisponible <= 0}
                >
                  {evento.capacidadDisponible <= 0 ? 'Agotado' : 'Reservar Ahora'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {eventos.length === 0 && (
          <div className="no-eventos">
            <p>No hay eventos destacados en este momento</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default DestacadosInv; 