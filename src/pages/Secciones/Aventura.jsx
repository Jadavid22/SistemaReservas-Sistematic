import React, { useState, useEffect } from "react";
import "../../styles/Secciones.css";
import Header from "../../components/Header";
import { getEventosPorCategoria } from "../../services/eventosService";
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import ReservaForm from "../../components/ReservaForm";
import Alerta from "../../components/Alerta";
import { crearReserva } from "../../services/reservasService";
import { jwtDecode } from "jwt-decode";

const Aventura = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [reservando, setReservando] = useState(false);
  const auth = getAuth();
  const navigate = useNavigate();

  // Verificar si el usuario está autenticado
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      console.error('Error al verificar el token:', error);
      return false;
    }
  };

  useEffect(() => {
    const cargarEventos = async () => {
      try {
        setLoading(true);
        console.log('Iniciando carga de aventuras...');
        const eventosAventura = await getEventosPorCategoria("Aventura");
        console.log('Respuesta del servidor:', eventosAventura);
        
        if (!eventosAventura) {
          console.warn('No se recibieron eventos del servidor');
          setEventos([]);
          return;
        }

        if (!Array.isArray(eventosAventura)) {
          console.error('La respuesta no es un array:', eventosAventura);
          setError('Error en el formato de los datos recibidos');
          return;
        }

        console.log('Aventuras cargadas:', eventosAventura);
        setEventos(eventosAventura);
      } catch (error) {
        console.error('Error detallado al cargar eventos:', error);
        setError(error.message || 'Error al cargar los eventos');
      } finally {
        setLoading(false);
      }
    };

    cargarEventos();
  }, []);

  const handleReservarClick = (event, evento) => {
    event.stopPropagation(); // Evitar que el evento se propague al div padre
    if (!isAuthenticated()) {
      setMensaje('Debe iniciar sesión para realizar una reserva');
      setTimeout(() => {
        navigate('/');
      }, 2000);
      return;
    }
    console.log('Evento seleccionado:', evento); // Debug
    setSelectedEvent(evento);
    setShowReservationForm(true);
    console.log('Estado del formulario:', { selectedEvent: evento, showForm: true }); // Debug adicional
  };

  const handleConfirmarReserva = async (eventoConDatos) => {
    try {
      setReservando(true);
      console.log('Datos de la reserva:', eventoConDatos); // Debug
      await crearReserva(eventoConDatos);
      setMensaje('¡Reserva realizada con éxito!');
      setShowReservationForm(false);
      // Recargar los eventos para actualizar la capacidad disponible
      const eventosAventura = await getEventosPorCategoria("Aventura");
      setEventos(eventosAventura);
    } catch (error) {
      console.error('Error al crear la reserva:', error);
      setMensaje('Error al crear la reserva. Por favor, intente nuevamente.');
    } finally {
      setReservando(false);
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando aventuras...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <Header />
        <div className="error-container">
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header />
      <Alerta mensaje={mensaje} onClose={() => setMensaje('')} />
      <main className="seccion-container">
        <div className="seccion-header">
          <h1 className="seccion-titulo">Aventura</h1>
          <p className="seccion-descripcion">Descubre las mejores aventuras y experiencias extremas</p>
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
                    disabled={evento.capacidadDisponible <= 0 || reservando}
                  >
                    {evento.capacidadDisponible <= 0 ? 'Agotado' : 'Reservar Ahora'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-eventos">
              <p>No hay aventuras disponibles en este momento</p>
              <p className="no-eventos-sub">¡Vuelve pronto para ver nuevas aventuras!</p>
            </div>
          )}
        </div>

        {showReservationForm && selectedEvent && (
          <div className="modal-overlay">
            <ReservaForm
              evento={selectedEvent}
              onClose={() => {
                console.log('Cerrando formulario de reserva'); // Debug
                setShowReservationForm(false);
                setSelectedEvent(null);
              }}
              onConfirm={handleConfirmarReserva}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Aventura; 