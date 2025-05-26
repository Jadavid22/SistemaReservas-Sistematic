import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEventos, crearEvento, eliminarEvento, actualizarEvento } from '../services/eventosService';
import { getReservas, eliminarReserva, actualizarEstadoReserva } from '../services/reservasService';
import AdminNav from '../components/AdminNav';
import '../styles/AdminDashboard.css';

const API_URL = 'http://localhost:8080';

const AdminDashboard = () => {
  const [eventos, setEventos] = useState([]);
  const [eventosFiltrados, setEventosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    tipo: '',
    categoria: '',
    destacado: '',
    busqueda: ''
  });
  const [filtroReservas, setFiltroReservas] = useState({
    estado: ''
  });
  const [nuevoEvento, setNuevoEvento] = useState({
    nombre: '',
    tipo: '',
    categoria: '',
    descripcion: '',
    fecha: '',
    horaInicio: '',
    horaFinal: '',
    capacidad: '',
    capacidadDisponible: '',
    precio: '',
    ubicacion: '',
    imagen: '',
    destacado: false
  });
  const [eventoEditando, setEventoEditando] = useState(null);
  const [mostrarFormularioEdicion, setMostrarFormularioEdicion] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [reservas, setReservas] = useState([]);
  const [loadingReservas, setLoadingReservas] = useState(true);
  const [errorReservas, setErrorReservas] = useState('');
  const navigate = useNavigate();

  // Cargar eventos
  const cargarEventos = async () => {
    try {
      setLoading(true);
      console.log('Iniciando carga de eventos...');
      const listaEventos = await getEventos();
      console.log('Eventos recibidos:', listaEventos);
      setEventos(listaEventos || []);
      setEventosFiltrados(listaEventos || []);
      console.log('Estado de eventos actualizado:', listaEventos || []);
    } catch (error) {
      console.error('Error al cargar eventos:', error);
      mostrarMensaje('Error al cargar eventos', 'error');
      setEventos([]);
      setEventosFiltrados([]);
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  const aplicarFiltros = () => {
    console.log('Aplicando filtros:', filtros);
    console.log('Eventos antes de filtrar:', eventos);
    
    let resultado = [...eventos];

    if (filtros.tipo) {
      resultado = resultado.filter(evento => 
        evento.tipo && evento.tipo.toUpperCase() === filtros.tipo.toUpperCase()
      );
    }

    if (filtros.categoria) {
      resultado = resultado.filter(evento => 
        evento.categoria && evento.categoria.toUpperCase() === filtros.categoria.toUpperCase()
      );
    }

    if (filtros.destacado !== '') {
      const esDestacado = filtros.destacado === 'true';
      resultado = resultado.filter(evento => evento.destacado === esDestacado);
    }

    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase().trim();
      resultado = resultado.filter(evento => 
        (evento.nombre && evento.nombre.toLowerCase().includes(busqueda)) ||
        (evento.descripcion && evento.descripcion.toLowerCase().includes(busqueda)) ||
        (evento.ubicacion && evento.ubicacion.toLowerCase().includes(busqueda))
      );
    }

    console.log('Eventos después de filtrar:', resultado);
    setEventosFiltrados(resultado);
  };

  // Manejar cambios en los filtros
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    console.log('Cambio en filtro:', name, value);
    setFiltros(prev => {
      const nuevosFiltros = {
        ...prev,
        [name]: value
      };
      console.log('Nuevos filtros:', nuevosFiltros);
      return nuevosFiltros;
    });
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    console.log('Limpiando filtros');
    setFiltros({
      tipo: '',
      categoria: '',
      destacado: '',
      busqueda: ''
    });
    setEventosFiltrados(eventos);
  };

  // Efecto para aplicar filtros cuando cambian los filtros o los eventos
  useEffect(() => {
    console.log('Efecto de filtros activado');
    console.log('Estado actual de filtros:', filtros);
    console.log('Estado actual de eventos:', eventos);
    aplicarFiltros();
  }, [filtros, eventos]);

  // Efecto para cargar eventos inicialmente
  useEffect(() => {
    console.log('Cargando eventos iniciales');
    cargarEventos();
  }, []);

  // Efecto para cargar reservas inicialmente
  useEffect(() => {
    console.log('Cargando reservas iniciales');
    cargarReservas();
  }, []);

  // Mostrar mensajes
  const mostrarMensaje = (texto, tipo) => {
    console.log('Mostrando mensaje:', { texto, tipo });
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // Añadir nuevo evento
  const handleAgregarEvento = async (e) => {
    e.preventDefault();
    try {
      console.log('Iniciando creación de evento...');
      const eventoAEnviar = {
        ...nuevoEvento,
        fecha: nuevoEvento.fecha ? new Date(nuevoEvento.fecha).toISOString() : null,
        capacidad: parseInt(nuevoEvento.capacidad, 10),
        capacidadDisponible: parseInt(nuevoEvento.capacidadDisponible, 10),
        precio: parseFloat(nuevoEvento.precio),
        destacado: Boolean(nuevoEvento.destacado)
      };
      console.log('Evento a enviar:', eventoAEnviar);
      await crearEvento(eventoAEnviar);
      console.log('Evento creado exitosamente');
      setNuevoEvento({
        nombre: '',
        tipo: '',
        categoria: '',
        descripcion: '',
        fecha: '',
        horaInicio: '',
        horaFinal: '',
        capacidad: '',
        capacidadDisponible: '',
        precio: '',
        ubicacion: '',
        imagen: '',
        destacado: false
      });
      mostrarMensaje('Evento agregado exitosamente', 'exito');
      cargarEventos();
    } catch (error) {
      console.error('Error al agregar evento:', error);
      mostrarMensaje('Error al agregar evento', 'error');
    }
  };

  // Eliminar evento
  const handleEliminarEvento = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este evento?')) {
      try {
        await eliminarEvento(id);
        mostrarMensaje('Evento eliminado exitosamente', 'exito');
        cargarEventos();
      } catch (error) {
        console.error('Error al eliminar evento:', error);
        mostrarMensaje('Error al eliminar evento', 'error');
      }
    }
  };

  // Editar evento
  const handleEditarEvento = (evento) => {
    setEventoEditando({
      ...evento,
      fecha: evento.fecha ? new Date(evento.fecha).toISOString().split('T')[0] : '',
    });
    setMostrarFormularioEdicion(true);
  };

  const handleGuardarEdicion = async (e) => {
    e.preventDefault();
    try {
      console.log('Iniciando actualización de evento...');
      console.log('Evento a actualizar:', eventoEditando);
      
      // Validar que el ID exista
      if (!eventoEditando.id) {
        throw new Error('ID del evento no encontrado');
      }

      // Verificar el token antes de hacer la petición
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación. Por favor, inicie sesión nuevamente.');
      }

      // Procesar el evento antes de enviarlo
      const eventoActualizado = {
        ...eventoEditando,
        fecha: eventoEditando.fecha ? new Date(eventoEditando.fecha).toISOString() : null,
        capacidad: parseInt(eventoEditando.capacidad, 10),
        capacidadDisponible: parseInt(eventoEditando.capacidadDisponible, 10),
        precio: parseFloat(eventoEditando.precio),
        destacado: Boolean(eventoEditando.destacado)
      };

      // Validar campos requeridos
      const camposRequeridos = ['nombre', 'tipo', 'fecha', 'capacidad', 'precio'];
      const camposFaltantes = camposRequeridos.filter(campo => !eventoActualizado[campo]);
      if (camposFaltantes.length > 0) {
        throw new Error(`Por favor complete los siguientes campos: ${camposFaltantes.join(', ')}`);
      }

      console.log('Evento procesado para actualizar:', eventoActualizado);
      const resultado = await actualizarEvento(eventoEditando.id, eventoActualizado);
      console.log('Resultado de la actualización:', resultado);

      if (!resultado) {
        throw new Error('No se recibió respuesta del servidor');
      }

      mostrarMensaje('Evento actualizado exitosamente', 'exito');
      setMostrarFormularioEdicion(false);
      setEventoEditando(null);
      
      console.log('Recargando lista de eventos...');
      await cargarEventos();
      console.log('Lista de eventos actualizada');
    } catch (error) {
      console.error('Error al actualizar evento:', error);
      let mensajeError = error.message;
      
      // Manejar errores específicos
      if (error.message.includes('token')) {
        // Si hay error de token, cerrar sesión
        localStorage.removeItem('token');
        navigate('/login');
        mensajeError = 'Sesión expirada. Por favor, inicie sesión nuevamente.';
      }
      
      mostrarMensaje(mensajeError, 'error');
    }
  };

  useEffect(() => {
    cargarReservas();
  }, []);

  const cargarReservas = async () => {
    try {
        setLoadingReservas(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('No hay token de autenticación');
        }

        const response = await fetch('http://localhost:8080/reservas', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('No tienes permisos para ver las reservas');
            }
            throw new Error(`Error del servidor: ${response.status}`);
        }

        const data = await response.json();
        // Asegurarse de que data.data sea un array, si no lo es, usar un array vacío
        const reservasArray = Array.isArray(data.data) ? data.data : [];
        console.log('Reservas cargadas:', reservasArray);
        setReservas(reservasArray);
        setErrorReservas('');
    } catch (error) {
        console.error('Error:', error);
        setErrorReservas(error.message || 'Error al cargar las reservas');
        if (error.message.includes('token')) {
            // Si hay error de token, redirigir al login
            navigate('/');
        }
    } finally {
        setLoadingReservas(false);
    }
  };

  // Eliminar reserva
  const handleEliminarReserva = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta reserva?')) {
      try {
        await eliminarReserva(id);
        mostrarMensaje('Reserva eliminada exitosamente', 'exito');
        cargarReservas(); // Recargar la lista de reservas
      } catch (error) {
        console.error('Error al eliminar reserva:', error);
        mostrarMensaje('Error al eliminar la reserva', 'error');
      }
    }
  };

  // Manejar cambios en el filtro de reservas
  const handleFiltroReservasChange = (e) => {
    const { name, value } = e.target;
    setFiltroReservas(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Filtrar reservas
  const reservasFiltradas = reservas.filter(reserva => {
    if (filtroReservas.estado && reserva.estado !== filtroReservas.estado) {
      return false;
    }
    return true;
  });

  // Manejar cambios en el estado de una reserva
  const handleCambiarEstadoReserva = async (id, nuevoEstado) => {
    try {
      setLoadingReservas(true); // Mostrar loading mientras se procesa
      const resultado = await actualizarEstadoReserva(id, nuevoEstado);
      
      if (resultado.success) {
        mostrarMensaje('Estado de reserva actualizado exitosamente', 'exito');
        await cargarReservas(); // Recargar la lista de reservas
      } else {
        // Mostrar el error específico que viene del servidor
        mostrarMensaje(resultado.error || 'Error al actualizar el estado de la reserva', 'error');
      }
    } catch (error) {
      console.error('Error al actualizar estado de reserva:', error);
      // Mostrar mensaje de error detallado
      mostrarMensaje(
        error.message || 'Error al actualizar el estado de la reserva. Por favor, intente nuevamente.',
        'error'
      );
    } finally {
      setLoadingReservas(false); // Ocultar loading al terminar
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard-container">
        <AdminNav />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando eventos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
        <AdminNav />
        {mensaje.texto && (
            <div className={`mensaje ${mensaje.tipo}`}>
                {mensaje.texto}
            </div>
        )}
        
        <div className="admin-dashboard">
            <h2>Panel de Administración</h2>
            
            <div className="admin-stats">
                <div className="stat-card">
                    <h3>Total Eventos</h3>
                    <p>{eventos.length}</p>
                </div>
                <div className="stat-card">
                    <h3>Eventos Destacados</h3>
                    <p>{eventos.filter(e => e.destacado).length}</p>
                </div>
            </div>

            <div className="admin-content">
                {/* Formulario de Gestión de Eventos */}
                <div className="formulario-evento">
                    <h3>{eventoEditando ? 'Editar Evento' : 'Nuevo Evento'}</h3>
                    <form onSubmit={eventoEditando ? handleGuardarEdicion : handleAgregarEvento} className="evento-form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Nombre del Evento</label>
                                <input
                                    type="text"
                                    value={eventoEditando ? eventoEditando.nombre : nuevoEvento.nombre}
                                    onChange={(e) => eventoEditando 
                                        ? setEventoEditando({ ...eventoEditando, nombre: e.target.value })
                                        : setNuevoEvento({ ...nuevoEvento, nombre: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Tipo</label>
                                <select
                                    value={eventoEditando ? eventoEditando.tipo : nuevoEvento.tipo}
                                    onChange={(e) => eventoEditando
                                        ? setEventoEditando({ ...eventoEditando, tipo: e.target.value })
                                        : setNuevoEvento({ ...nuevoEvento, tipo: e.target.value })}
                                    required
                                >
                                    <option value="">Seleccione un tipo</option>
                                    <option value="PRESENCIAL">Presencial</option>
                                    <option value="VIRTUAL">Virtual</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Categoría</label>
                                <input
                                    type="text"
                                    value={eventoEditando ? eventoEditando.categoria : nuevoEvento.categoria}
                                    onChange={(e) => eventoEditando
                                        ? setEventoEditando({ ...eventoEditando, categoria: e.target.value })
                                        : setNuevoEvento({ ...nuevoEvento, categoria: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Descripción</label>
                                <textarea
                                    value={eventoEditando ? eventoEditando.descripcion : nuevoEvento.descripcion}
                                    onChange={(e) => eventoEditando
                                        ? setEventoEditando({ ...eventoEditando, descripcion: e.target.value })
                                        : setNuevoEvento({ ...nuevoEvento, descripcion: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Fecha</label>
                                <input
                                    type="date"
                                    value={eventoEditando ? eventoEditando.fecha : nuevoEvento.fecha}
                                    onChange={(e) => eventoEditando
                                        ? setEventoEditando({ ...eventoEditando, fecha: e.target.value })
                                        : setNuevoEvento({ ...nuevoEvento, fecha: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Hora Inicio</label>
                                <input
                                    type="time"
                                    value={eventoEditando ? eventoEditando.horaInicio : nuevoEvento.horaInicio}
                                    onChange={(e) => eventoEditando
                                        ? setEventoEditando({ ...eventoEditando, horaInicio: e.target.value })
                                        : setNuevoEvento({ ...nuevoEvento, horaInicio: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Hora Final</label>
                                <input
                                    type="time"
                                    value={eventoEditando ? eventoEditando.horaFinal : nuevoEvento.horaFinal}
                                    onChange={(e) => eventoEditando
                                        ? setEventoEditando({ ...eventoEditando, horaFinal: e.target.value })
                                        : setNuevoEvento({ ...nuevoEvento, horaFinal: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Capacidad Total</label>
                                <input
                                    type="number"
                                    value={eventoEditando ? eventoEditando.capacidad : nuevoEvento.capacidad}
                                    onChange={(e) => eventoEditando
                                        ? setEventoEditando({ ...eventoEditando, capacidad: e.target.value })
                                        : setNuevoEvento({ ...nuevoEvento, capacidad: e.target.value })}
                                    required
                                    min="1"
                                />
                            </div>

                            <div className="form-group">
                                <label>Capacidad Disponible</label>
                                <input
                                    type="number"
                                    value={eventoEditando ? eventoEditando.capacidadDisponible : nuevoEvento.capacidadDisponible}
                                    onChange={(e) => eventoEditando
                                        ? setEventoEditando({ ...eventoEditando, capacidadDisponible: e.target.value })
                                        : setNuevoEvento({ ...nuevoEvento, capacidadDisponible: e.target.value })}
                                    required
                                    min="0"
                                />
                            </div>

                            <div className="form-group">
                                <label>Precio</label>
                                <input
                                    type="number"
                                    value={eventoEditando ? eventoEditando.precio : nuevoEvento.precio}
                                    onChange={(e) => eventoEditando
                                        ? setEventoEditando({ ...eventoEditando, precio: e.target.value })
                                        : setNuevoEvento({ ...nuevoEvento, precio: e.target.value })}
                                    required
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            <div className="form-group">
                                <label>Ubicación</label>
                                <input
                                    type="text"
                                    value={eventoEditando ? eventoEditando.ubicacion : nuevoEvento.ubicacion}
                                    onChange={(e) => eventoEditando
                                        ? setEventoEditando({ ...eventoEditando, ubicacion: e.target.value })
                                        : setNuevoEvento({ ...nuevoEvento, ubicacion: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>URL de la Imagen</label>
                                <input
                                    type="url"
                                    value={eventoEditando ? eventoEditando.imagen : nuevoEvento.imagen}
                                    onChange={(e) => eventoEditando
                                        ? setEventoEditando({ ...eventoEditando, imagen: e.target.value })
                                        : setNuevoEvento({ ...nuevoEvento, imagen: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={eventoEditando ? eventoEditando.destacado : nuevoEvento.destacado}
                                        onChange={(e) => eventoEditando
                                            ? setEventoEditando({ ...eventoEditando, destacado: e.target.checked })
                                            : setNuevoEvento({ ...nuevoEvento, destacado: e.target.checked })}
                                    />
                                    Evento Destacado
                                </label>
                            </div>
                        </div>

                        <div className="form-buttons">
                            {eventoEditando && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMostrarFormularioEdicion(false);
                                        setEventoEditando(null);
                                    }}
                                    className="btn-cancelar"
                                >
                                    Cancelar
                                </button>
                            )}
                            <button type="submit" className="btn-guardar">
                                {eventoEditando ? 'Guardar Cambios' : 'Crear Evento'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Lista de Eventos con Filtros */}
                <div className="lista-eventos">
                    <h3>Eventos Registrados</h3>
                    
                    {/* Filtros */}
                    <div className="filtros-eventos">
                        <div className="filtro-grupo">
                            <input
                                type="text"
                                name="busqueda"
                                value={filtros.busqueda}
                                onChange={handleFiltroChange}
                                placeholder="Buscar por nombre, descripción o ubicación..."
                                className="filtro-busqueda"
                            />
                        </div>
                        
                        <div className="filtro-grupo">
                            <select
                                name="tipo"
                                value={filtros.tipo}
                                onChange={handleFiltroChange}
                                className="filtro-select"
                            >
                                <option value="">Todos los tipos</option>
                                <option value="PRESENCIAL">Presencial</option>
                                <option value="VIRTUAL">Virtual</option>
                            </select>

                            <select
                                name="categoria"
                                value={filtros.categoria}
                                onChange={handleFiltroChange}
                                className="filtro-select"
                            >
                                <option value="">Todas las categorías</option>
                                <option value="CONCIERTOS">Conciertos</option>
                                <option value="RESTAURANTES">Restaurantes</option>
                                <option value="TEATRO">Teatro</option>
                                <option value="CINE">Cine</option>
                                <option value="SPA">Spa</option>
                                <option value="PICNIC">Picnic</option>
                                <option value="COCTELERIA">Coctelería</option>
                                <option value="MUSEO">Museo</option>
                            </select>

                            <select
                                name="destacado"
                                value={filtros.destacado}
                                onChange={handleFiltroChange}
                                className="filtro-select"
                            >
                                <option value="">Todos los eventos</option>
                                <option value="true">Destacados</option>
                                <option value="false">No destacados</option>
                            </select>
                        </div>

                        <button 
                            onClick={limpiarFiltros}
                            className="btn-limpiar-filtros"
                        >
                            Limpiar Filtros
                        </button>
                    </div>

                    <div className="eventos-grid">
                        {Array.isArray(eventosFiltrados) && eventosFiltrados.length > 0 ? (
                            eventosFiltrados.map((evento) => (
                                <div key={evento.id} className="evento-card">
                                    <div className="evento-info">
                                        <h4>{evento.nombre}</h4>
                                        <p><strong>Tipo:</strong> {evento.tipo}</p>
                                        <p><strong>Categoría:</strong> {evento.categoria}</p>
                                        <p><strong>Fecha:</strong> {new Date(evento.fecha).toLocaleDateString()}</p>
                                        <p><strong>Hora:</strong> {evento.horaInicio} - {evento.horaFinal}</p>
                                        <p><strong>Capacidad:</strong> {evento.capacidadDisponible}/{evento.capacidad}</p>
                                        <p><strong>Precio:</strong> ${evento.precio}</p>
                                        <p><strong>Ubicación:</strong> {evento.ubicacion}</p>
                                        <div className="evento-status">
                                            {evento.destacado && <span className="badge destacado">Destacado</span>}
                                            <span className={`badge ${evento.estado === 'ACTIVO' ? 'activo' : 'inactivo'}`}>
                                                {evento.estado}
                                            </span>
                                        </div>
                                        <div className="evento-actions">
                                            <button 
                                                className="btn-editar"
                                                onClick={() => handleEditarEvento(evento)}
                                            >
                                                Editar
                                            </button>
                                            <button 
                                                className="btn-eliminar"
                                                onClick={() => handleEliminarEvento(evento.id)}
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-eventos">No hay eventos que coincidan con los filtros</p>
                        )}
                    </div>
                </div>

                {/* Sección de Reservas */}
                <div className="admin-section">
                    <h2>Reservas de Usuarios</h2>
                    {loadingReservas ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                        </div>
                    ) : errorReservas ? (
                        <p className="error-mensaje">{errorReservas}</p>
                    ) : (
                        <div className="reservas-table-container">
                            {/* Filtro de estado para reservas */}
                            <div className="filtros-reservas">
                                <select
                                    name="estado"
                                    value={filtroReservas.estado}
                                    onChange={handleFiltroReservasChange}
                                    className="filtro-select"
                                >
                                    <option value="">Todos los estados</option>
                                    <option value="PENDIENTE">Pendiente</option>
                                    <option value="CONFIRMADA">Confirmada</option>
                                    <option value="CANCELADA">Cancelada</option>
                                </select>
                            </div>

                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Usuario</th>
                                        <th>Evento</th>
                                        <th>Fecha</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reservasFiltradas
                                        .filter(reserva => reserva.estado !== 'ELIMINADA')
                                        .map((reserva) => (
                                        <tr key={reserva.id}>
                                            <td>{reserva.id}</td>
                                            <td>{reserva.usuario?.email || 'N/A'}</td>
                                            <td>{reserva.evento?.nombre || 'N/A'}</td>
                                            <td>{new Date(reserva.fechaReserva).toLocaleDateString()}</td>
                                            <td>
                                                <select
                                                    value={reserva.estado}
                                                    onChange={(e) => handleCambiarEstadoReserva(reserva.id, e.target.value)}
                                                    className={`estado-select ${reserva.estado?.toLowerCase()}`}
                                                >
                                                    <option value="PENDIENTE">Pendiente</option>
                                                    <option value="CONFIRMADA">Confirmada</option>
                                                    <option value="CANCELADA">Cancelada</option>
                                                </select>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn-actualizar"
                                                    onClick={() => handleCambiarEstadoReserva(reserva.id, reserva.estado)}
                                                >
                                                    Actualizar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default AdminDashboard; 