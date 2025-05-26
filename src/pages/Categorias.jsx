import React, { useState, useEffect } from "react"; // Importar React y useState para manejar el estado
import { useNavigate } from "react-router-dom";
import { getAuth } from 'firebase/auth';
import "../styles/Categorias.css"; // Importar estilos específicos para la página de categorías
import "../styles/Secciones.css"; // Importar estilos generales para secciones
import conciertos from "../images/CARRUSEL/FEID.png"; // Importar imagen de conciertos
import restaurantes from "../images/CARRUSEL/RESTAURANTE.jpg"; // Importar imagen de restaurantes
import teatro from "../images/CARRUSEL/TEATRO.jpg"; // Importar imagen de teatro
import cine from "../images/CARRUSEL/CINE.jpg"; // Importar imagen de cine
import spa from "../images/CARRUSEL/SPA.jpg"; // Importar imagen de spa
import picnic from "../images/CARRUSEL/PICNIC.jpg"; // Importar imagen de picnic
import cocteleria from "../images/CARRUSEL/COCTELERIA.jpeg"; // Importar imagen de cocteleria
import museo from "../images/CARRUSEL/MUSEO.jpg"; // Importar imagen de museo
import Header from "../components/Header"; // Importar componente Header
import { getEventosPorTipo } from "../services/eventosService"; // Importar servicio para obtener eventos por tipo
import ReservaForm from "../components/ReservaForm";
import { crearReserva } from "../services/reservasService";
import Alerta from "../components/Alerta";

// Componente principal de Categorías
const Categorias = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [eventos, setEventos] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [reservando, setReservando] = useState(false);

  const cargarEventosPorCategoria = async (categoria) => {
    try {
      setLoading(true);
      const eventosCategoria = await getEventosPorTipo(categoria);
      setEventos(eventosCategoria);
      setCategoriaSeleccionada(categoria);
      
      const eventosSection = document.getElementById('eventos-categoria');
      if (eventosSection) {
        eventosSection.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error al cargar eventos:', error);
      setMensaje('Error al cargar los eventos. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoriaClick = (categoria) => {
    navigate(`/${categoria}`);
  };

  const handleReservarClick = (event, evento) => {
    event.stopPropagation(); // Evitar que el evento se propague al div padre
    if (!auth.currentUser) {
      setMensaje('Debe iniciar sesión para realizar una reserva');
      navigate('/');
      return;
    }
    console.log('Evento seleccionado:', evento); // Debug
    setSelectedEvent(evento);
    setShowReservationForm(true);
  };

  const handleConfirmarReserva = async (eventoConDatos) => {
    try {
      setReservando(true);
      console.log('Datos de la reserva:', eventoConDatos); // Debug
      await crearReserva(eventoConDatos);
      setMensaje('¡Reserva realizada con éxito!');
      setShowReservationForm(false);
      // Recargar los eventos para actualizar la capacidad disponible
      if (categoriaSeleccionada) {
        await cargarEventosPorCategoria(categoriaSeleccionada);
      }
    } catch (error) {
      console.error('Error al crear la reserva:', error);
      setMensaje('Error al crear la reserva. Por favor, intente nuevamente.');
    } finally {
      setReservando(false);
    }
  };

  // Definición de categorías de eventos
  const categories = [
    { 
      name: "CONCIERTOS", 
      img: conciertos, 
      link: "Conciertos" 
    },
    { 
      name: "RESTAURANTES", 
      img: restaurantes, 
      link: "Restaurantes" 
    },
    { 
      name: "TEATRO", 
      img: teatro, 
      link: "Teatro" 
    },
    { 
      name: "CINE", 
      img: cine, 
      link: "Cine" 
    },
    { 
      name: "SPA", 
      img: spa, 
      link: "Spa" 
    },
    { 
      name: "PICNIC", 
      img: picnic, 
      link: "Picnic" 
    },
    { 
      name: "COCTELERÍA", 
      img: cocteleria, 
      link: "Cocteleria" 
    },
    { 
      name: "MUSEO", 
      img: museo, 
      link: "Museo" 
    }
  ];

  return (
    <div className="app-container">
      <Header /> 
      <Alerta mensaje={mensaje} onClose={() => setMensaje('')} />
      
      <main className="productos-container">
        <div className="categories">
          {categories.map((category, index) => ( 
            <div 
              key={index} 
              className="category-item" 
              onClick={() => handleCategoriaClick(category.link)}
            >
              <img src={category.img} alt={category.name} className="category-icon" /> 
              <div className="category-info">
                <div className="category-text">{category.name}</div>
                <div className="category-desc">{category.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Sección de eventos de la categoría seleccionada */}
        {categoriaSeleccionada && (
          <div id="eventos-categoria" className="eventos-categoria">
            <h2>Eventos de {categoriaSeleccionada}</h2>
            {loading ? (
              <div className="loading">Cargando eventos...</div>
            ) : eventos.length > 0 ? (
              <div className="eventos-grid">
                {eventos.map((evento) => (
                  <div key={evento.id} className="evento-card">
                    {evento.imagen && (
                      <img src={evento.imagen} alt={evento.nombre} className="evento-image" />
                    )}
                    <div className="evento-info">
                      <h3>{evento.nombre}</h3>
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
                ))}
              </div>
            ) : (
              <p className="no-eventos">No hay eventos disponibles en esta categoría</p>
            )}
          </div>
        )}

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

export default Categorias; 