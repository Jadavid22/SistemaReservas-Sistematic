import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Categorias.css";
import "../../styles/Secciones.css";
import HeaderInvitado from "../../components/HeaderInvitado";
import { getEventosPorTipo } from "../../services/eventosService";
import Alerta from "../../components/Alerta";

// Importar imágenes
import conciertos from "../../images/CARRUSEL/FEID.png";
import restaurantes from "../../images/CARRUSEL/RESTAURANTE.jpg";
import teatro from "../../images/CARRUSEL/TEATRO.jpg";
import cine from "../../images/CARRUSEL/CINE.jpg";
import spa from "../../images/CARRUSEL/SPA.jpg";
import picnic from "../../images/CARRUSEL/PICNIC.jpg";
import cocteleria from "../../images/CARRUSEL/COCTELERIA.jpeg";
import museo from "../../images/CARRUSEL/MUSEO.jpg";

const CategoriasInv = () => {
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [redirigiendo, setRedirigiendo] = useState(false);

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
    switch(categoria) {
      case 'Conciertos':
        navigate('/ConciertosInv');
        break;
      case 'Restaurantes':
        navigate('/RestaurantesInv');
        break;
      case 'Teatro':
        navigate('/TeatroInv');
        break;
      case 'Cine':
        navigate('/CineInv');
        break;
      case 'Spa':
        navigate('/SpaInv');
        break;
      case 'Picnic':
        navigate('/PicnicInv');
        break;
      case 'Cocteleria':
        navigate('/CocteleriaInv');
        break;
      case 'Museo':
        navigate('/MuseoInv');
        break;
      default:
        cargarEventosPorCategoria(categoria);
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
              </div>
            </div>
          ))}
        </div>

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
                      <img 
                        src={evento.imagen} 
                        alt={evento.nombre} 
                        className="evento-image"
                        style={{ height: '500px', objectFit: 'cover' }}
                      />
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
                        disabled={evento.capacidadDisponible <= 0}
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
      </main>
    </div>
  );
};

export default CategoriasInv; 