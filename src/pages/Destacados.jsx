import React, { useState, useEffect } from "react";
import "../styles/Secciones.css";
import "../styles/Cliente.css";
import Header from "../components/Header";
import { getEventos } from "../services/eventosService";
import Alerta from "../components/Alerta";
import ReservaForm from "../components/ReservaForm";
import { crearReserva } from "../services/reservasService";

const Destacados = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showReservationForm, setShowReservationForm] = useState(false);

  useEffect(() => {
    cargarEventosDestacados();
  }, []);

  const cargarEventosDestacados = async () => {
    try {
      setLoading(true);
      const eventosData = await getEventos();
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

  const handleEventSelect = (evento) => {
    setSelectedEvent(evento);
    setShowReservationForm(true);
  };

  const handleConfirmarReserva = async (eventoConDatos) => {
    try {
      await crearReserva(eventoConDatos);
      setMensaje('¡Reserva realizada con éxito!');
      setShowReservationForm(false);
    } catch (error) {
      console.error('Error al crear la reserva:', error);
      setMensaje('Error al crear la reserva. Por favor, intente nuevamente.');
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <Header />
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
        <Header />
        <div className="error-container">
          <p>{error}</p>
          <button onClick={cargarEventosDestacados}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header />
      <Alerta mensaje={mensaje} onClose={() => setMensaje('')} />

      <main className="productos-container">
        <h2 className="section-title">Eventos Destacados</h2>
        
        <div className="eventos-grid">
          {eventos.map((evento) => (
            <div key={evento.id} className="evento-card" onClick={() => handleEventSelect(evento)} style={{ minHeight: '650px' }}>
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
                <button className="btn-reservar">Reservar Ahora</button>
              </div>
            </div>
          ))}
        </div>

        {eventos.length === 0 && (
          <div className="no-eventos">
            <p>No hay eventos destacados en este momento</p>
          </div>
        )}

        {showReservationForm && selectedEvent && (
          <ReservaForm
            evento={selectedEvent}
            onClose={() => setShowReservationForm(false)}
            onConfirm={handleConfirmarReserva}
          />
        )}
      </main>
    </div>
  );
};

export default Destacados; 