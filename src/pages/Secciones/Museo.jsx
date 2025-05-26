import React, { useState, useEffect } from "react";
import "../../styles/Secciones.css";
import Header from "../../components/Header";
import { getEventosPorCategoria } from "../../services/eventosService";

const Museo = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarEventos = async () => {
      try {
        setLoading(true);
        console.log('Iniciando carga de eventos de museo...');
        const eventosMuseo = await getEventosPorCategoria("Museo");
        console.log('Respuesta del servidor:', eventosMuseo);
        
        if (!eventosMuseo) {
          console.warn('No se recibieron eventos del servidor');
          setEventos([]);
          return;
        }

        if (!Array.isArray(eventosMuseo)) {
          console.error('La respuesta no es un array:', eventosMuseo);
          setError('Error en el formato de los datos recibidos');
          return;
        }

        console.log('Eventos de museo cargados:', eventosMuseo);
        setEventos(eventosMuseo);
      } catch (error) {
        console.error('Error detallado al cargar eventos:', error);
        setError(error.message || 'Error al cargar los eventos');
      } finally {
        setLoading(false);
      }
    };

    cargarEventos();
  }, []);

  if (loading) {
    return (
      <div className="app-container">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando eventos de museo...</p>
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
      <main className="seccion-container">
        <div className="seccion-header">
          <h1 className="seccion-titulo">Museo</h1>
          <p className="seccion-descripcion">Descubre las mejores exposiciones y eventos culturales</p>
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
                  <button className="btn-reservar">Reservar Ahora</button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-eventos">
              <p>No hay eventos de museo disponibles en este momento</p>
              <p className="no-eventos-sub">¡Vuelve pronto para ver nuevos eventos!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Museo; 