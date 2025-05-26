import React, { useState, useEffect } from "react"; // Importar React y useState para manejar el estado
import "../styles/Cliente.css"; // Importar estilos específicos para la página del cliente
import "../styles/Secciones.css"; // Importar estilos generales para secciones
import "bootstrap/dist/css/bootstrap.min.css"; // Importar estilos de Bootstrap
import Header from "../components/Header"; // Importar componente Header
import Slider from "react-slick"; // Importar componente Slider para carrusel
import 'slick-carousel/slick/slick.css'; // Importar estilos para el carrusel
import 'slick-carousel/slick/slick-theme.css'; // Importar estilos de tema para el carrusel
import { jwtDecode } from "jwt-decode";
import { getEventos } from "../services/eventosService";
import ReservaForm from "../components/ReservaForm";
import { crearReserva } from "../services/reservasService";
import Alerta from "../components/Alerta";
import { useNavigate } from 'react-router-dom';

const EventosPage = () => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [reservando, setReservando] = useState(false);

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

  // Cargar eventos desde la base de datos
  useEffect(() => {
    const cargarEventos = async () => {
      try {
        setLoading(true);
        const listaEventos = await getEventos();
        console.log('Eventos cargados:', listaEventos);
        // Tomar 9 eventos aleatorios
        const eventosAleatorios = listaEventos
          .sort(() => Math.random() - 0.5)
          .slice(0, 9);
        setEventos(eventosAleatorios || []);
      } catch (error) {
        console.error('Error al cargar eventos:', error);
        setError('Error al cargar los eventos');
      } finally {
        setLoading(false);
      }
    };

    cargarEventos();
  }, []);

  // Configuración del carrusel
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    adaptiveHeight: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false
        }
      }
    ]
  };

  // Función para manejar la selección de evento
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

  // Función para confirmar la reserva
  const handleConfirmarReserva = async (eventoConDatos) => {
    try {
      setReservando(true);
      console.log('Datos de la reserva:', eventoConDatos); // Debug
      await crearReserva(eventoConDatos);
      setMensaje('¡Reserva realizada con éxito!');
      setShowReservationForm(false);
      // Recargar los eventos
      const listaEventos = await getEventos();
      const eventosAleatorios = listaEventos
        .sort(() => Math.random() - 0.5)
        .slice(0, 9);
      setEventos(eventosAleatorios || []);
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
          <p>Cargando eventos...</p>
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
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header /> {/* Renderizar el encabezado */}
      <Alerta mensaje={mensaje} onClose={() => setMensaje('')} />
      
      <main className="eventos-container">
        <div className="carousel-container">
          <Slider {...settings}> {/* Renderizar el carrusel con las configuraciones */}
            <div>
              <img 
                src={require('../images/CARRUSEL/FEID.png')} 
                alt="Concierto" 
                className="carousel-image"
              />
            </div>
            <div>
              <img 
                src={require('../images/CARRUSEL/RESTAURANTE.jpg')} 
                alt="Restaurante" 
                className="carousel-image"
              />
            </div>
            <div>
              <img 
                src={require('../images/CARRUSEL/TEATRO.jpg')} 
                alt="Teatro" 
                className="carousel-image"
              />
            </div>
            <div>
              <img 
                src={require('../images/CARRUSEL/CINE.jpg')} 
                alt="Cine" 
                className="carousel-image"
              />
            </div>
            <div>
              <img 
                src={require('../images/CARRUSEL/MUSEO.jpg')} 
                alt="Museo" 
                className="carousel-image"
              />
            </div>
            <div>
              <img 
                src={require('../images/CARRUSEL/PICNIC.jpg')} 
                alt="Picnic" 
                className="carousel-image"
              />
            </div>
            <div>
              <img 
                src={require('../images/CARRUSEL/SPA.jpg')} 
                alt="Spa" 
                className="carousel-image"
              />
            </div>
            <div>
              <img 
                src={require('../images/CARRUSEL/COCTELERIA.jpeg')} 
                alt="Cocteleria" 
                className="carousel-image"
              />
            </div>
          </Slider>
        </div>

        <div className="eventos-section">
          <h2 className="section-title">Nuestros Eventos</h2>
          
          <div className="eventos-grid">
            {eventos.length > 0 ? (
              eventos.map((evento) => (
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
                    {evento.destacado && <span className="destacado-badge">Destacado</span>}
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
              <p className="no-eventos">No hay eventos disponibles en este momento</p>
            )}
          </div>
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

export default EventosPage; 