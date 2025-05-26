import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://localhost:8080';

// Crear una nueva reserva
export const crearReserva = async (datosReserva) => {
    try {
        // Obtener el token del login
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No hay sesión activa');
        }

        // Decodificar el token para verificar el rol
        const decoded = jwtDecode(token);
        console.log('Token decodificado:', decoded); // Debug

        // Verificar que el token tenga el rol correcto
        let rol = decoded.rol;
        if (!rol && decoded.authorities && decoded.authorities.length > 0) {
            rol = decoded.authorities[0].authority.replace('ROLE_', '');
        }

        if (!rol) {
            rol = 'USUARIO';
        }

        console.log('Rol detectado:', rol);

        if (rol !== 'USUARIO') {
            console.error('Rol incorrecto:', rol);
            throw new Error('Solo los usuarios registrados pueden hacer reservas');
        }

        // Formatear los datos según lo espera el backend
        const datosFormateados = {
            reserva: {
                cantidad: parseInt(datosReserva.cantidad),
                fechaReserva: new Date().toISOString().split('.')[0], // Formato: "2024-03-20T10:00:00"
                estado: "CONFIRMADA",
                userEmail: decoded.sub || decoded.email,
                evento_id: parseInt(datosReserva.evento.id)
            },
            pago: {
                metodo: "TARJETA",
                monto: parseFloat(datosReserva.evento.precio * parseInt(datosReserva.cantidad)),
                metodoPago: "ONLINE",
                estado: "CONFIRMADO"
            }
        };

        console.log('Enviando datos formateados:', datosFormateados); // Debug
        console.log('URL de la petición:', `${API_URL}/reservas`); // Debug
        console.log('Token usado:', token); // Debug

        const response = await fetch(`${API_URL}/reservas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(datosFormateados)
        });

        console.log('Status de la respuesta:', response.status); // Debug
        console.log('Status text:', response.statusText); // Debug

        // Manejar diferentes códigos de estado
        if (response.status === 403) {
            throw new Error('No tiene permisos para realizar esta acción. Por favor, verifique sus credenciales.');
        }
        if (response.status === 401) {
            localStorage.removeItem('token');
            throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al crear la reserva');
        }

        const resultado = await response.json();
        console.log('Reserva creada exitosamente:', resultado); // Debug
        
        // Si la reserva se creó exitosamente y tenemos una URL de pago, redirigir
        if (resultado.success && resultado.data && resultado.data.urlPago) {
            window.location.href = resultado.data.urlPago;
        }
        
        return resultado;
    } catch (error) {
        console.error('Error en crearReserva:', error);
        throw error;
    }
};

// Obtener reservas de un usuario
export const obtenerReservasUsuario = async (userEmail) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No hay sesión activa');
        }

        console.log('Obteniendo reservas para usuario:', userEmail); // Debug

        const response = await fetch(`${API_URL}/reservas/usuario/${userEmail}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
            }
            if (response.status === 403) {
                throw new Error('No tiene permisos para ver estas reservas');
            }

            const errorText = await response.text();
            let errorMessage;
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.message || 'Error al obtener las reservas';
            } catch (e) {
                errorMessage = 'Error al obtener las reservas';
            }
            throw new Error(errorMessage);
        }

        const responseText = await response.text();
        console.log('Respuesta del servidor:', responseText); // Debug

        let reservas;
        try {
            reservas = responseText ? JSON.parse(responseText) : [];
        } catch (e) {
            console.error('Error al parsear la respuesta:', e);
            return [];
        }

        // Asegurarse de que la respuesta sea un array
        if (!Array.isArray(reservas)) {
            console.log('La respuesta no es un array, intentando extraer data:', reservas);
            reservas = reservas?.data || [];
        }

        console.log('Reservas procesadas:', reservas); // Debug
        return reservas;
    } catch (error) {
        console.error('Error en obtenerReservasUsuario:', error);
        throw error;
    }
};

// Obtener una reserva específica
export const obtenerReserva = async (id) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/reservas/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al obtener la reserva');
        }

        return await response.json();
    } catch (error) {
        console.error('Error en obtenerReserva:', error);
        throw error;
    }
};

// Actualizar una reserva
export const actualizarReserva = async (id, datosReserva) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/reservas/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(datosReserva)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al actualizar la reserva');
        }

        return await response.json();
    } catch (error) {
        console.error('Error en actualizarReserva:', error);
        throw error;
    }
};

// Cancelar una reserva
export const cancelarReserva = async (id) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No hay sesión activa');
        }

        // Decodificar el token para obtener la información del usuario
        const decoded = jwtDecode(token);
        console.log('Token decodificado:', decoded); // Debug

        // Obtener el email del usuario del token
        const userEmail = decoded.sub || decoded.email;
        if (!userEmail) {
            throw new Error('No se pudo obtener el email del usuario');
        }

        console.log('Email del usuario:', userEmail); // Debug
        console.log('Cancelando reserva:', id); // Debug

        const response = await fetch(`${API_URL}/reservas/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Status de la respuesta:', response.status); // Debug

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
            }
            if (response.status === 403) {
                throw new Error('No tiene permisos para cancelar esta reserva');
            }

            const errorText = await response.text();
            console.log('Texto de error:', errorText); // Debug
            
            let errorMessage;
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.message || 'Error al cancelar la reserva';
            } catch (e) {
                errorMessage = 'Error al cancelar la reserva';
            }
            throw new Error(errorMessage);
        }

        // Intentar obtener la respuesta como texto primero
        const responseText = await response.text();
        console.log('Respuesta del servidor:', responseText); // Debug

        // Si la respuesta está vacía, devolver un objeto simple
        if (!responseText) {
            return { message: 'Reserva cancelada exitosamente' };
        }

        // Intentar parsear la respuesta como JSON
        try {
            return JSON.parse(responseText);
        } catch (e) {
            console.error('Error al parsear la respuesta:', e);
            return { message: 'Reserva cancelada exitosamente' };
        }
    } catch (error) {
        console.error('Error en cancelarReserva:', error);
        throw error;
    }
};

export const eliminarReserva = async (id) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No hay token de autenticación');
        }

        // Decodificar el token para verificar el rol
        const decoded = jwtDecode(token);
        console.log('Token decodificado completo:', decoded);

        // Verificar que el token tenga el rol correcto
        let rol = null;
        
        // Intentar obtener el rol de diferentes formas
        if (decoded.rol) {
            rol = decoded.rol;
            console.log('Rol encontrado en decoded.rol:', rol);
        } else if (decoded.authorities && decoded.authorities.length > 0) {
            rol = decoded.authorities[0].authority.replace('ROLE_', '');
            console.log('Rol encontrado en authorities:', rol);
        } else if (decoded.roles && decoded.roles.length > 0) {
            rol = decoded.roles[0].replace('ROLE_', '');
            console.log('Rol encontrado en roles:', rol);
        } else if (decoded.role) {
            rol = decoded.role;
            console.log('Rol encontrado en role:', rol);
        }

        console.log('Rol final detectado:', rol);
        console.log('¿Es administrador?:', rol === 'ADMINISTRADOR');

        // Verificar si es administrador
        if (rol !== 'ADMINISTRADOR') {
            console.error('Rol incorrecto:', rol);
            throw new Error('No tiene permisos para eliminar reservas');
        }

        // Usar PUT para actualizar el estado de la reserva
        const response = await fetch(`${API_URL}/reservas/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ 
                estado: 'ELIMINADA',
                id: id
            })
        });

        console.log('Status de la respuesta:', response.status);
        console.log('Headers de la respuesta:', response.headers);
        console.log('Token usado:', token);

        if (response.status === 403) {
            throw new Error('No tiene permisos para modificar esta reserva');
        }

        if (response.status === 401) {
            localStorage.removeItem('token');
            throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
        }

        // Si la respuesta es exitosa pero no tiene contenido JSON
        if (response.ok && response.headers.get('content-length') === '0') {
            return { message: 'Reserva marcada como eliminada exitosamente' };
        }

        // Si hay contenido JSON, intentar parsearlo
        if (response.headers.get('content-type')?.includes('application/json')) {
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Error al marcar la reserva como eliminada');
            }
            return data;
        }

        // Si no hay contenido JSON pero la respuesta es exitosa
        if (response.ok) {
            return { message: 'Reserva marcada como eliminada exitosamente' };
        }

        throw new Error('Error al marcar la reserva como eliminada');
    } catch (error) {
        console.error('Error en eliminarReserva:', error);
        throw error;
    }
};

export const actualizarEstadoReserva = async (id, nuevoEstado) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            return {
                success: false,
                error: 'No hay token de autenticación. Por favor, inicie sesión nuevamente.'
            };
        }

        // Validar que el estado sea válido
        const estadosValidos = ['PENDIENTE', 'CONFIRMADA', 'CANCELADA'];
        if (!estadosValidos.includes(nuevoEstado)) {
            return {
                success: false,
                error: 'Estado no válido. Los estados permitidos son: PENDIENTE, CONFIRMADA, CANCELADA'
            };
        }

        // Decodificar el token para verificar el rol
        const decoded = jwtDecode(token);
        console.log('Token decodificado:', decoded);

        // Verificar que el token tenga el rol correcto
        let rol = null;
        if (decoded.authorities && decoded.authorities.length > 0) {
            rol = decoded.authorities[0].authority.replace('ROLE_', '');
        } else if (decoded.rol) {
            rol = decoded.rol;
        }

        console.log('Rol detectado:', rol);

        if (rol !== 'ADMINISTRADOR') {
            return {
                success: false,
                error: 'No tiene permisos para actualizar el estado de las reservas.'
            };
        }

        // Preparar los datos de actualización
        const datosActualizacion = {
            id: parseInt(id),
            estado: nuevoEstado,
            userEmail: decoded.sub || decoded.email // Incluir el email del usuario que hace la actualización
        };

        console.log('Enviando actualización:', {
            url: `${API_URL}/reservas/${id}`,
            metodo: 'PUT',
            datos: datosActualizacion
        });

        const response = await fetch(`${API_URL}/reservas/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosActualizacion)
        });

        console.log('Respuesta del servidor:', {
            status: response.status,
            statusText: response.statusText
        });

        if (response.status === 204 || response.status === 200) {
            return {
                success: true,
                data: { mensaje: 'Estado actualizado correctamente' }
            };
        }

        try {
            const errorText = await response.text();
            console.log('Texto de error:', errorText);
            
            let errorMessage = 'Error al actualizar el estado de la reserva';
            if (errorText) {
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorMessage;
                } catch (e) {
                    errorMessage = errorText;
                }
            }

            return {
                success: false,
                error: errorMessage
            };
        } catch (error) {
            return {
                success: false,
                error: 'Error al actualizar el estado de la reserva'
            };
        }
    } catch (error) {
        console.error('Error en actualizarEstadoReserva:', error);
        return {
            success: false,
            error: 'Error al procesar la solicitud. Por favor, intente nuevamente.'
        };
    }
};

// Completar una reserva después del pago exitoso
export const completarReserva = async (reservaId) => {
    try {
        const token = localStorage.getItem('token');
        console.log('Token encontrado:', token ? 'Sí' : 'No');
        
        if (!token) {
            console.error('No se encontró token en localStorage');
            return {
                success: false,
                error: 'No hay sesión activa'
            };
        }

        // Decodificar el token para obtener el email del usuario
        try {
            const decoded = jwtDecode(token);
            console.log('Token decodificado:', {
                sub: decoded.sub,
                exp: decoded.exp,
                authorities: decoded.authorities,
                rol: decoded.rol,
                email: decoded.email
            });

            const currentTime = Date.now() / 1000;
            console.log('Tiempo actual:', currentTime);
            console.log('Tiempo de expiración del token:', decoded.exp);
            
            if (decoded.exp && decoded.exp < currentTime) {
                console.error('Token expirado');
                localStorage.removeItem('token');
                return {
                    success: false,
                    error: 'Su sesión ha expirado'
                };
            }

            // Verificar rol del usuario
            let userRole = null;
            if (decoded.authorities && decoded.authorities.length > 0) {
                userRole = decoded.authorities[0].authority;
            } else if (decoded.rol) {
                userRole = decoded.rol;
            }
            console.log('Rol del usuario:', userRole);

            // Obtener el email del usuario del token
            const userEmail = decoded.sub || decoded.email;
            if (!userEmail) {
                throw new Error('No se pudo obtener el email del usuario del token');
            }

            console.log('Iniciando petición al backend para completar reserva:', reservaId);
            console.log('URL:', `${API_URL}/reservas/${reservaId}/completar`);
            console.log('Headers:', {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token.substring(0, 20)}...` // Solo mostramos parte del token por seguridad
            });

            const response = await fetch(`${API_URL}/reservas/${reservaId}/completar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ userEmail }) // Incluir el email del usuario en el cuerpo
            });

            console.log('Respuesta del servidor:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries([...response.headers.entries()])
            });

            // Manejar diferentes tipos de errores
            if (!response.ok) {
                const responseText = await response.text();
                console.log('Texto de respuesta de error:', responseText);

                let errorData;
                try {
                    errorData = JSON.parse(responseText);
                    console.log('Error parseado:', errorData);
                } catch (e) {
                    console.log('No se pudo parsear la respuesta como JSON');
                    errorData = { message: responseText };
                }

                if (response.status === 401) {
                    console.error('Error 401: Token no válido o expirado');
                    localStorage.removeItem('token');
                    return {
                        success: false,
                        error: 'Sesión expirada. Por favor, inicie sesión nuevamente.'
                    };
                }
                if (response.status === 403) {
                    console.error('Error 403: Sin permisos necesarios');
                    return {
                        success: false,
                        error: 'No tiene permisos para completar esta reserva'
                    };
                }

                return {
                    success: false,
                    error: errorData.message || 'Error al completar la reserva'
                };
            }

            const responseData = await response.json();
            console.log('Respuesta exitosa:', responseData);
            
            return {
                success: true,
                data: responseData
            };
        } catch (e) {
            console.error('Error al decodificar token:', e);
            localStorage.removeItem('token');
            return {
                success: false,
                error: 'Token inválido'
            };
        }
    } catch (error) {
        console.error('Error en completarReserva:', error);
        return {
            success: false,
            error: error.message || 'Error al completar la reserva'
        };
    }
}; 