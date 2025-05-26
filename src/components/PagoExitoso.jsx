import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { completarReserva } from '../services/reservasService';
import { jwtDecode } from 'jwt-decode';
import '../styles/PagoExitoso.css';

const PagoExitoso = () => {
    const navigate = useNavigate();
    const { reservaId } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processingStep, setProcessingStep] = useState('iniciando');
    const [debugInfo, setDebugInfo] = useState(null);

    useEffect(() => {
        const finalizarProceso = async () => {
            if (!reservaId) {
                setError('ID de reserva no proporcionado');
                setLoading(false);
                return;
            }

            try {
                // Verificar y mostrar información del token
                const token = localStorage.getItem('token');
                let tokenInfo = null;
                
                if (token) {
                    try {
                        const decoded = jwtDecode(token);
                        tokenInfo = {
                            sub: decoded.sub,
                            exp: decoded.exp,
                            authorities: decoded.authorities,
                            rol: decoded.rol,
                            email: decoded.email,
                            isExpired: decoded.exp < Date.now() / 1000
                        };
                    } catch (e) {
                        tokenInfo = { error: 'Error al decodificar token' };
                    }
                }

                setDebugInfo({
                    tokenPresent: !!token,
                    tokenInfo,
                    reservaId
                });

                setProcessingStep('completando_reserva');
                console.log('Iniciando proceso de finalización para reserva:', reservaId);
                
                const resultado = await completarReserva(reservaId);
                console.log('Resultado de completarReserva:', resultado);

                if (!resultado.success) {
                    // Actualizar la información de debug con el error
                    setDebugInfo(prev => ({
                        ...prev,
                        error: resultado.error,
                        fullResponse: resultado
                    }));

                    if (resultado.error.includes('sesión') || resultado.error.includes('token')) {
                        throw new Error('Sesión inválida o expirada. Por favor, inicie sesión nuevamente.');
                    } else if (resultado.error.includes('permisos')) {
                        throw new Error('No tiene los permisos necesarios. Por favor, inicie sesión con una cuenta válida.');
                    }
                    throw new Error(resultado.error);
                }

                setProcessingStep('completado');
                setLoading(false);

                // Redirigir después de un breve delay
                setTimeout(() => {
                    navigate('/HistorialReservas', { replace: true });
                }, 1500);
            } catch (error) {
                console.error('Error en finalizarProceso:', error);
                setError(error.message || 'Error al procesar la reserva');
                setLoading(false);
            }
        };

        finalizarProceso();
    }, [reservaId, navigate]);

    const handleContinuar = () => {
        navigate('/HistorialReservas', { replace: true });
    };

    const handleLogin = () => {
        // Guardar el reservaId en sessionStorage para recuperarlo después del login
        sessionStorage.setItem('pendingReservaId', reservaId);
        navigate('/login', { replace: true });
    };

    const handleReload = () => {
        window.location.reload();
    };

    if (loading) {
        return (
            <div className="pago-exitoso-container">
                <div className="loading">
                    {processingStep === 'iniciando' && 'Iniciando proceso...'}
                    {processingStep === 'completando_reserva' && 'Completando su reserva...'}
                    {processingStep === 'enviando_email' && 'Enviando confirmación por email...'}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="pago-exitoso-container">
                <div className="error-message">
                    <h2>Error en el Proceso</h2>
                    <p>{error}</p>
                    
                    {/* Mostrar información de debug en desarrollo */}
                    {process.env.NODE_ENV === 'development' && debugInfo && (
                        <div className="debug-info" style={{ 
                            marginTop: '20px', 
                            padding: '10px', 
                            background: '#f5f5f5', 
                            borderRadius: '4px',
                            fontSize: '12px',
                            textAlign: 'left'
                        }}>
                            <h4>Información de Debug:</h4>
                            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                        </div>
                    )}

                    <div className="error-actions">
                        {error.includes('sesión') || error.includes('permisos') ? (
                            <button onClick={handleLogin} className="btn-login">
                                Iniciar Sesión
                            </button>
                        ) : (
                            <>
                                <button onClick={() => navigate('/', { replace: true })} className="btn-volver">
                                    Volver al Inicio
                                </button>
                                <button onClick={handleReload} className="btn-reintentar">
                                    Reintentar
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pago-exitoso-container">
            <div className="success-content">
                <div className="success-icon">
                    <i className="fas fa-check-circle"></i>
                </div>
                <h2>¡Pago Exitoso!</h2>
                <p>Tu reserva ha sido confirmada y procesada correctamente.</p>
                <p>Hemos enviado un correo electrónico con los detalles de tu reserva.</p>
                <div className="success-actions">
                    <button onClick={handleContinuar} className="btn-continuar">
                        Ver Mis Reservas
                    </button>
                    <button onClick={() => navigate('/', { replace: true })} className="btn-inicio">
                        Volver al Inicio
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PagoExitoso; 