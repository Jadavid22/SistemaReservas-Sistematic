import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CambiarContrasena.css';
import { jwtDecode } from 'jwt-decode';

const CambiarContrasena = () => {
    const [formData, setFormData] = useState({
        passwordActual: '',
        passwordNueva: '',
        confirmarPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Verificar el token al cargar el componente
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                console.log('Token decodificado:', decoded);
                console.log('Rol del usuario:', decoded.rol);
                console.log('Email del usuario:', decoded.sub);
            } catch (error) {
                console.error('Error al decodificar el token:', error);
                setError('Error de autenticación');
                navigate('/');
            }
        } else {
            console.error('No hay token');
            setError('No hay sesión activa');
            navigate('/');
        }
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMensaje('');

        // Validaciones
        if (!formData.passwordActual || !formData.passwordNueva || !formData.confirmarPassword) {
            setError('Todos los campos son obligatorios');
            return;
        }

        if (formData.passwordNueva !== formData.confirmarPassword) {
            setError('Las contraseñas nuevas no coinciden');
            return;
        }

        if (formData.passwordNueva.length < 6) {
            setError('La contraseña nueva debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay sesión activa');
            }

            console.log('Enviando solicitud de cambio de contraseña...');
            const response = await fetch('http://localhost:8080/usuarios/me/cambiar-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    oldPassword: formData.passwordActual,
                    newPassword: formData.passwordNueva
                })
            });

            console.log('Respuesta del servidor:', response.status);
            const data = await response.text();
            console.log('Datos de respuesta:', data);

            if (!response.ok) {
                throw new Error(data || 'Error al cambiar la contraseña');
            }

            setMensaje('Contraseña actualizada exitosamente');
            // Limpiar el formulario
            setFormData({
                passwordActual: '',
                passwordNueva: '',
                confirmarPassword: ''
            });

            // Redirigir después de 2 segundos
            setTimeout(() => {
                navigate('/perfil');
            }, 2000);

        } catch (error) {
            console.error('Error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVolver = () => {
        navigate('/perfil');
    };

    return (
        <div className="cambiar-contrasena-container">
            <div className="cambiar-contrasena-header">
                <h1>Cambiar Contraseña</h1>
                <button onClick={handleVolver} className="btn-volver">
                    Volver al Perfil
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}
            {mensaje && <div className="success-message">{mensaje}</div>}

            <form onSubmit={handleSubmit} className="cambiar-contrasena-form">
                <div className="form-group">
                    <label>Contraseña Actual</label>
                    <input
                        type="password"
                        name="passwordActual"
                        value={formData.passwordActual}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Nueva Contraseña</label>
                    <input
                        type="password"
                        name="passwordNueva"
                        value={formData.passwordNueva}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Confirmar Nueva Contraseña</label>
                    <input
                        type="password"
                        name="confirmarPassword"
                        value={formData.confirmarPassword}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <button type="submit" className="btn-guardar" disabled={loading}>
                    {loading ? 'Guardando...' : 'Cambiar Contraseña'}
                </button>
            </form>
        </div>
    );
};

export default CambiarContrasena; 