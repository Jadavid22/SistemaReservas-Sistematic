import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { jwtDecode } from 'jwt-decode';
import '../styles/Secciones.css';
import '../styles/Cliente.css';
import Header from '../components/Header';
import HeaderInvitado from '../components/HeaderInvitado';
import { getEventos } from '../services/eventosService';
import ReservaForm from '../components/ReservaForm';
import { crearReserva } from '../services/reservasService';
import Alerta from '../components/Alerta';

const Busqueda = () => {
  const { termino } = useParams();
  const navigate = useNavigate();
  const auth = getAuth();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [reservando, setReservando] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          setIsAuthenticated(decoded.exp > currentTime);
        } catch (error) {
          console.error('Error al verificar el token:', error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
    cargarEventos();
  }, [termino]);

  const cargarEventos = async () => {
    try {
      setLoading(true);
      const listaEventos = await getEventos();
      const eventosFiltrados = listaEventos.filter(evento => 
        evento.nombre.toLowerCase().includes(termino.toLowerCase()) ||
        evento.categoria.toLowerCase().includes(termino.toLowerCase()) ||
        evento.tipo.toLowerCase().includes(termino.toLowerCase()) ||
        evento.ubicacion.toLowerCase().includes(termino.toLowerCase())
      );
      setEventos(eventosFiltrados);
    } catch (error) {
      console.error('Error al cargar eventos:', error);
      setError('Error al cargar los eventos');
    } finally {
      setLoading(false);
    }
  };

  const handleReservarClick = (event, evento) => {
    event.stopPropagation();
    if (!isAuthenticated) {
      setMensaje('Debe iniciar sesión para realizar una reserva');
      setTimeout(() => {
        navigate('/');
      }, 2000);
      return;
    }
    setSelectedEvent(evento);
    setShowReservationForm(true);
  };

  const handleConfirmarReserva = async (eventoConDatos) => {
    try {
      setReservando(true);
      await crearReserva(eventoConDatos);
      setMensaje('¡Reserva realizada con éxito!');
      setShowReservationForm(false);
      await cargarEventos();
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
        {isAuthenticated ? <Header /> : <HeaderInvitado />}
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Buscando eventos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        {isAuthenticated ? <Header /> : <HeaderInvitado />}
        <div className="error-container">
          <p>{error}</p>
          <button onClick={cargarEventos}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {isAuthenticated ? <Header /> : <HeaderInvitado />}
      <Alerta mensaje={mensaje} onClose={() => setMensaje('')} />
      
      <main className="seccion-container">
        <div className="seccion-header">
          <h1 className="seccion-titulo">Resultados de búsqueda: "{termino}"</h1>
          <p className="seccion-descripcion">Encontramos {eventos.length} eventos relacionados con tu búsqueda</p>
        </div>
        
        <div className="eventos-grid">
          {eventos.length > 0 ? (
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
                    <p><strong>Tipo:</strong> {evento.tipo}</p>
                    <p><strong>Categoría:</strong> {evento.categoria}</p>
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
              <p>No se encontraron eventos relacionados con "{termino}"</p>
              <p className="no-eventos-sub">Intenta con otra búsqueda</p>
            </div>
          )}
        </div>

        {showReservationForm && selectedEvent && (
          <ReservaForm
            evento={selectedEvent}
            onClose={() => {
              setShowReservationForm(false);
              setSelectedEvent(null);
            }}
            onConfirm={handleConfirmarReserva}
          />
        )}
      </main>
    </div>
  );
};

export default Busqueda; 