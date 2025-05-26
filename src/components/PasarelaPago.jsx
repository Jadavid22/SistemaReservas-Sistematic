import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/PasarelaPago.css';

const PasarelaPago = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [metodoPago, setMetodoPago] = useState('TARJETA');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [reservaData, setReservaData] = useState(null);

    useEffect(() => {
        // Si tenemos location.state, usarlo
        if (location.state) {
            setReservaData(location.state);
        } else {
            // Si no hay state, redirigir al inicio
            navigate('/', { replace: true });
        }
    }, [location, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Obtener el token del localStorage
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay sesión activa');
            }

            const response = await fetch(`http://localhost:8080/pagos/procesar/${reservaData.reservaId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    metodoPago: metodoPago,
                    monto: reservaData.monto
                })
            });

            if (!response.ok) {
                throw new Error('Error al procesar el pago');
            }

            const resultado = await response.json();
            if (resultado.success) {
                // Navegar a la página de éxito usando el ID de reserva como parámetro
                navigate(`/pago-exitoso/${reservaData.reservaId}`, { replace: true });
            } else {
                throw new Error(resultado.error || 'Error al procesar el pago');
            }
        } catch (error) {
            console.error('Error al procesar el pago:', error);
            setError('Error al procesar el pago. Por favor, intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/', { replace: true });
    };

    if (!reservaData) {
        return <div className="pasarela-pago">Cargando...</div>;
    }

    return (
        <div className="pasarela-pago">
            <div className="pasarela-contenido">
                <h2>Pasarela de Pago</h2>
                
                <div className="detalles-reserva">
                    <h3>Detalles del Pago</h3>
                    <p><strong>ID de Reserva:</strong> {reservaData.reservaId}</p>
                    <p><strong>Total a pagar:</strong> ${reservaData.monto}</p>
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

                    {error && <div className="error-message">{error}</div>}

                    <div className="botones-accion">
                        <button 
                            type="button" 
                            onClick={handleCancel}
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

export default PasarelaPago; 