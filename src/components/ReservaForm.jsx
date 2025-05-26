import React, { useState } from 'react';
import { crearReserva } from '../services/reservasService';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import '../styles/ReservaForm.css';

const ReservaForm = ({ evento, onClose, onConfirm }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        cantidad: 1
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validación del evento
            if (!evento || !evento.id || !evento.precio) {
                throw new Error('Información del evento incompleta');
            }

            // Obtener el token del login
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay sesión activa');
            }

            // Obtener la información del usuario guardada
            const userInfo = JSON.parse(localStorage.getItem('user'));
            if (!userInfo) {
                throw new Error('No se encontró la información del usuario');
            }

            const decoded = jwtDecode(token);

            // Verificar si el usuario tiene el rol USUARIO
            if (decoded.rol !== 'USUARIO') {
                throw new Error('Solo los usuarios registrados pueden hacer reservas');
            }

            // Calcular el precio total
            const precioTotal = parseFloat(evento.precio) * parseInt(formData.cantidad);

            // Formato exacto que espera el backend
            const datosReserva = {
                evento: {
                    id: parseInt(evento.id),
                    precio: parseFloat(evento.precio)
                },
                cantidad: parseInt(formData.cantidad)
            };

            console.log('Enviando datos de reserva:', datosReserva); // Debug

            const resultado = await crearReserva(datosReserva);
            
            console.log('Respuesta del servidor:', resultado); // Debug
            
            if (resultado.success) {
                // Si tenemos URL de pago, redirigir
                if (resultado.data.pago && resultado.data.pago.urlPago) {
                    window.location.href = resultado.data.pago.urlPago;
                } else {
                    // Preparar los datos para la pasarela de pago
                    const pagoData = {
                        reservaId: resultado.data.id,
                        monto: precioTotal,
                        token: token,
                        evento: evento,
                        cantidad: formData.cantidad
                    };

                    // Guardar en sessionStorage
                    sessionStorage.setItem('pagoExitosoData', JSON.stringify(pagoData));

                    // Navegar a la pasarela de pago
                    navigate('/pasarela', { 
                        state: pagoData,
                        replace: true 
                    });
                }

                // Cerrar el formulario
                onClose();
            } else {
                throw new Error(resultado.error || 'Error al crear la reserva');
            }
        } catch (error) {
            console.error('Error al crear la reserva:', error);
            setError(error.message || 'Error al crear la reserva');
        } finally {
            setLoading(false);
        }
    };

    // Si no hay evento o no tiene ID, mostrar mensaje de error
    if (!evento || !evento.id) {
        return (
            <div className="reserva-form-overlay">
                <div className="reserva-form-container">
                    <h2>Error</h2>
                    <p>No se pudo cargar la información del evento.</p>
                    <div className="form-buttons">
                        <button type="button" onClick={onClose} className="cancel-btn">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const precioTotal = evento.precio * formData.cantidad;

    return (
        <div className="reserva-form-overlay">
            <div className="reserva-form-container">
                <h2>Reservar {evento.nombre}</h2>
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Cantidad de personas:</label>
                        <input
                            type="number"
                            name="cantidad"
                            value={formData.cantidad}
                            onChange={handleChange}
                            min="1"
                            max={evento.capacidadDisponible}
                            required
                        />
                        <small>Capacidad disponible: {evento.capacidadDisponible} personas</small>
                    </div>

                    <div className="form-group">
                        <label>Precio por persona:</label>
                        <p>${evento.precio}</p>
                    </div>

                    <div className="form-group">
                        <label>Precio total:</label>
                        <p>${precioTotal}</p>
                    </div>

                    <div className="form-buttons">
                        <button type="button" onClick={onClose} className="cancel-btn">
                            Cancelar
                        </button>
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Procesando...' : 'Continuar al Pago'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReservaForm; 