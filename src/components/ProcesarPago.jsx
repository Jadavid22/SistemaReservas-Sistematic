import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerReserva } from '../services/reservasService';
import '../styles/ProcesarPago.css';
import { jwtDecode } from 'jwt-decode';

const ProcesarPago = () => {
    const { reservaId } = useParams();
    const navigate = useNavigate();
    const [reserva, setReserva] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [metodoPago, setMetodoPago] = useState('TARJETA');

    const cargarReserva = useCallback(async () => {
        try {
            const resultado = await obtenerReserva(reservaId);
            if (resultado.success) {
                setReserva(resultado.data);
            } else {
                setError('No se pudo cargar la información de la reserva');
            }
        } catch (error) {
            setError(error.message || 'Error al cargar la reserva');
        } finally {
            setLoading(false);
        }
    }, [reservaId]);

    useEffect(() => {
        cargarReserva();
    }, [reservaId, cargarReserva]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Simular procesamiento de pago
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Redirigir a la página de éxito con el ID de la reserva
            navigate(`/pago-exitoso/${reservaId}`);
        } catch (error) {
            setError('Error al procesar el pago');
        } finally {
            setLoading(false);
        }
    };

    const token = localStorage.getItem('token');
    const decoded = jwtDecode(token);
    console.log(decoded);

    if (loading) {
        return (
            <div className="procesar-pago-container">
                <div className="loading">Cargando...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="procesar-pago-container">
                <div className="error">{error}</div>
                <button onClick={() => navigate('/')} className="btn-volver">
                    Volver al inicio
                </button>
            </div>
        );
    }

    if (!reserva) {
        return (
            <div className="procesar-pago-container">
                <div className="error">No se encontró la reserva</div>
                <button onClick={() => navigate('/')} className="btn-volver">
                    Volver al inicio
                </button>
            </div>
        );
    }

    return (
        <div className="procesar-pago-container">
            <div className="pago-content">
                <h2>Procesar Pago</h2>
                
                <div className="detalles-reserva">
                    <h3>Detalles de la Reserva</h3>
                    <p><strong>Evento:</strong> {reserva.evento.nombre}</p>
                    <p><strong>Cantidad:</strong> {reserva.cantidad} personas</p>
                    <p><strong>Total a pagar:</strong> ${reserva.pago.monto}</p>
                </div>

                <form onSubmit={handleSubmit} className="form-pago">
                    <div className="form-group">
                        <label>Método de Pago</label>
                        <select 
                            value={metodoPago}
                            onChange={(e) => setMetodoPago(e.target.value)}
                            required
                        >
                            <option value="TARJETA">Tarjeta de Crédito/Débito</option>
                            <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                            <option value="PAYPAL">PayPal</option>
                        </select>
                    </div>

                    {metodoPago === 'TARJETA' && (
                        <>
                            <div className="form-group">
                                <label>Número de Tarjeta</label>
                                <input 
                                    type="text" 
                                    placeholder="1234 5678 9012 3456"
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Fecha de Vencimiento</label>
                                    <input 
                                        type="text" 
                                        placeholder="MM/AA"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>CVV</label>
                                    <input 
                                        type="text" 
                                        placeholder="123"
                                        required
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {metodoPago === 'TRANSFERENCIA' && (
                        <div className="info-transferencia">
                            <p>Datos para transferencia:</p>
                            <p>Banco: Banco Ejemplo</p>
                            <p>Cuenta: 1234-5678-9012-3456</p>
                            <p>Titular: Sistematic Events</p>
                        </div>
                    )}

                    {metodoPago === 'PAYPAL' && (
                        <div className="info-paypal">
                            <p>Serás redirigido a PayPal para completar el pago.</p>
                        </div>
                    )}

                    <div className="botones-accion">
                        <button 
                            type="button" 
                            onClick={() => navigate('/')}
                            className="btn-cancelar"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="btn-confirmar"
                            disabled={loading}
                        >
                            {loading ? 'Procesando...' : 'Completar Pago'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProcesarPago; 