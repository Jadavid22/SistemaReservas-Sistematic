import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { obtenerReservasUsuario, cancelarReserva } from '../services/reservasService';
import Header from '../components/Header';
import '../styles/HistorialReservas.css';

const HistorialReservas = () => {
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [cancelando, setCancelando] = useState(false);

    useEffect(() => {
        cargarReservas();
    }, []);

    const cargarReservas = async () => {
        try {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay sesión activa');
            }

            const decoded = jwtDecode(token);
            const userEmail = decoded.sub || decoded.email;
            
            if (!userEmail) {
                throw new Error('No se encontró el email del usuario');
            }

            const reservasData = await obtenerReservasUsuario(userEmail);
            console.log('Datos de reservas recibidos:', reservasData); // Debug

            // Asegurarse de que reservasData sea un array
            const reservasArray = Array.isArray(reservasData) ? reservasData : 
                               (reservasData?.data ? reservasData.data : []);

            // Filtrar las reservas canceladas
            const reservasActivas = reservasArray.filter(reserva => 
                reserva && reserva.estado && reserva.estado.toLowerCase() !== 'cancelada'
            );
            
            console.log('Reservas activas:', reservasActivas); // Debug
            setReservas(reservasActivas);
        } catch (error) {
            console.error('Error completo:', error);
            setError('Error al cargar las reservas: ' + (error.message || 'Error desconocido'));
        } finally {
            setLoading(false);
        }
    };

    const handleCancelarReserva = async (reservaId) => {
        try {
            setCancelando(true);
            await cancelarReserva(reservaId);
            setMensaje('Reserva cancelada exitosamente');
            // Recargar las reservas
            await cargarReservas();
        } catch (error) {
            setError('Error al cancelar la reserva: ' + error.message);
        } finally {
            setCancelando(false);
        }
    };

    const getEstadoClass = (estado) => {
        switch (estado?.toLowerCase()) {
            case 'confirmada':
                return 'estado-confirmada';
            case 'pendiente':
                return 'estado-pendiente';
            case 'cancelada':
                return 'estado-cancelada';
            default:
                return '';
        }
    };

    const puedeCancelar = (reserva) => {
        const estado = reserva.estado?.toLowerCase();
        const fechaReserva = new Date(reserva.fechaReserva);
        const ahora = new Date();
        const horasAntes = 24; // Permitir cancelar hasta 24 horas antes
        
        return estado === 'pendiente' && 
               (fechaReserva - ahora) > (horasAntes * 60 * 60 * 1000);
    };

    if (loading) {
        return <div className="loading">Cargando reservas...</div>;
    }

    return (
        <div className="historial-reservas-container">
            <Header />
            <h1>Historial de Reservas</h1>
            
            {error && <div className="error-message">{error}</div>}
            {mensaje && <div className="success-message">{mensaje}</div>}
            
            {reservas.length === 0 ? (
                <div className="no-reservas">No tienes reservas activas</div>
            ) : (
                <div className="reservas-grid">
                    {reservas.map((reserva) => (
                        <div key={reserva.id} className="reserva-card">
                            <h3>{reserva.evento?.nombre || 'Evento no disponible'}</h3>
                            <span className={`estado ${getEstadoClass(reserva.estado)}`}>
                                {reserva.estado?.toUpperCase() || 'PENDIENTE'}
                            </span>
                            <p><strong>Fecha:</strong> {new Date(reserva.fechaReserva).toLocaleDateString()}</p>
                            <p><strong>Hora:</strong> {new Date(reserva.fechaReserva).toLocaleTimeString()}</p>
                            <p><strong>Personas:</strong> {reserva.cantidad}</p>
                            <p><strong>Precio total:</strong> ${reserva.evento?.precio * reserva.cantidad || 0}</p>
                            {reserva.evento?.ubicacion && (
                                <p><strong>Ubicación:</strong> {reserva.evento.ubicacion}</p>
                            )}
                            
                            {reserva.estado !== 'CANCELADA' && (
                                <button 
                                    onClick={() => handleCancelarReserva(reserva.id)}
                                    disabled={cancelando}
                                    className="cancelar-btn"
                                >
                                    {cancelando ? 'Cancelando...' : 'Cancelar Reserva'}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HistorialReservas; 