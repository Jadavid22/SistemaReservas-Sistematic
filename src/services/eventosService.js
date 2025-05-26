// Servicio para gestionar eventos con el backend
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://localhost:8080/eventos';

export async function getEventos() {
  try {
    console.log('Iniciando petición GET a:', API_URL);
    const token = localStorage.getItem('token');
    const res = await fetch(API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Respuesta recibida:', res.status, res.statusText);
    
    const data = await res.json();
    console.log('Datos recibidos:', data);
    
    if (!res.ok) {
      throw new Error(data.error || 'Error al obtener eventos');
    }
    
    if (!data.data) {
      console.warn('La respuesta no contiene el campo data:', data);
      return [];
    }
    
    console.log('Eventos obtenidos:', data.data);
    return data.data;
  } catch (error) {
    console.error('Error en getEventos:', error);
    throw error;
  }
}

export async function crearEvento(evento) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    // Validar campos requeridos
    const camposRequeridos = ['nombre', 'tipo', 'fecha', 'capacidad', 'precio'];
    const camposFaltantes = camposRequeridos.filter(campo => !evento[campo]);
    if (camposFaltantes.length > 0) {
      throw new Error(`Campos requeridos faltantes: ${camposFaltantes.join(', ')}`);
    }

    // Asegurar que los campos numéricos sean del tipo correcto y los nombres coincidan con la BD
    const eventoProcesado = {
      nombre: evento.nombre,
      tipo: evento.tipo,
      categoria: evento.categoria || null,
      descripcion: evento.descripcion || null,
      fecha: evento.fecha,
      horaInicio: evento.horaInicio || null,
      horaFinal: evento.horaFinal || null,
      capacidad: parseInt(evento.capacidad),
      capacidadDisponible: parseInt(evento.capacidadDisponible || evento.capacidad),
      precio: parseFloat(evento.precio),
      ubicacion: evento.ubicacion || null,
      imagen: evento.imagen || null,
      destacado: Boolean(evento.destacado)
    };

    console.log('Enviando evento al backend:', eventoProcesado);

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(eventoProcesado)
    });

    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Error al crear evento');
    }

    return data.data;
  } catch (error) {
    console.error('Error en crearEvento:', error);
    throw error;
  }
}

export async function actualizarEvento(id, evento) {
  try {
    console.log('Iniciando actualización de evento en el servicio...');
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    console.log('Token encontrado, procediendo con la validación...');

    // Decodificar el token para verificar el rol
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Token inválido');
      }
      const payload = JSON.parse(atob(tokenParts[1]));
      console.log('Payload del token:', payload);
      
      // Verificar el rol
      const rol = payload.rol;
      console.log('Rol del usuario:', rol);
      
      if (!rol) {
        console.error('No se encontró el rol en el token');
        throw new Error('Token inválido: no contiene información de rol');
      }

      if (rol !== 'ADMINISTRADOR') {
        console.error('Rol insuficiente:', rol);
        throw new Error(`El usuario tiene el rol ${rol}, se requiere ADMINISTRADOR`);
      }

      console.log('Token y rol validados correctamente');
    } catch (error) {
      console.error('Error al validar token:', error);
      if (error.message.includes('Token inválido')) {
        localStorage.removeItem('token');
        throw new Error('Sesión expirada o inválida. Por favor, inicie sesión nuevamente.');
      }
      throw error;
    }

    // Validar campos requeridos
    const camposRequeridos = ['nombre', 'tipo', 'fecha', 'capacidad', 'precio'];
    const camposFaltantes = camposRequeridos.filter(campo => !evento[campo]);
    if (camposFaltantes.length > 0) {
      throw new Error(`Campos requeridos faltantes: ${camposFaltantes.join(', ')}`);
    }
    console.log('Campos requeridos validados correctamente');

    // Asegurar que los campos numéricos sean del tipo correcto
    const eventoProcesado = {
      ...evento,
      nombre: evento.nombre.trim(),
      tipo: evento.tipo.trim(),
      categoria: evento.categoria?.trim() || null,
      descripcion: evento.descripcion?.trim() || null,
      fecha: evento.fecha,
      horaInicio: evento.horaInicio?.trim() || null,
      horaFinal: evento.horaFinal?.trim() || null,
      capacidad: parseInt(evento.capacidad, 10),
      capacidadDisponible: parseInt(evento.capacidadDisponible || evento.capacidad, 10),
      precio: parseFloat(evento.precio),
      ubicacion: evento.ubicacion?.trim() || null,
      imagen: evento.imagen?.trim() || null,
      destacado: Boolean(evento.destacado)
    };

    // Validaciones adicionales
    if (isNaN(eventoProcesado.capacidad) || eventoProcesado.capacidad <= 0) {
      throw new Error('La capacidad debe ser un número positivo');
    }
    if (isNaN(eventoProcesado.capacidadDisponible) || eventoProcesado.capacidadDisponible < 0) {
      throw new Error('La capacidad disponible debe ser un número no negativo');
    }
    if (isNaN(eventoProcesado.precio) || eventoProcesado.precio < 0) {
      throw new Error('El precio debe ser un número no negativo');
    }
    if (eventoProcesado.capacidadDisponible > eventoProcesado.capacidad) {
      throw new Error('La capacidad disponible no puede ser mayor que la capacidad total');
    }
    console.log('Validaciones numéricas completadas');

    console.log('Enviando petición PUT a:', `${API_URL}/${id}`);
    console.log('Datos a enviar:', eventoProcesado);
    console.log('Headers de la petición:', {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token.substring(0, 20)}...` // Solo mostramos el inicio del token por seguridad
    });

    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(eventoProcesado)
    });

    console.log('Respuesta recibida:', res.status, res.statusText);
    console.log('Headers de respuesta:', Object.fromEntries(res.headers.entries()));

    // Manejar diferentes códigos de estado
    if (res.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
    }
    if (res.status === 403) {
      throw new Error('No tiene permisos para actualizar eventos. Por favor, verifique sus credenciales.');
    }
    if (res.status === 404) {
      throw new Error('El evento no fue encontrado.');
    }
    if (res.status === 500) {
      throw new Error('Error en el servidor. Por favor, intente nuevamente.');
    }

    // Verificar si hay contenido en la respuesta
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Respuesta no es JSON:', contentType);
      throw new Error('Error en el servidor: respuesta inválida');
    }

    let data;
    try {
      data = await res.json();
      console.log('Datos de respuesta:', data);
    } catch (error) {
      console.error('Error al parsear JSON:', error);
      throw new Error('Error al procesar la respuesta del servidor');
    }
    
    if (!res.ok) {
      throw new Error(data.error || 'Error al actualizar evento');
    }

    if (!data.data) {
      console.warn('La respuesta no contiene el campo data:', data);
      throw new Error('Respuesta inválida del servidor');
    }

    console.log('Evento actualizado exitosamente:', data.data);
    return data.data;
  } catch (error) {
    console.error('Error en actualizarEvento:', error);
    throw error;
  }
}

export async function eliminarEvento(id) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    // Decodificar el token para verificar el rol
    const decoded = jwtDecode(token);
    console.log('Token decodificado:', decoded);

    // Verificar que el token tenga el rol correcto
    let rol = null;
    
    // Intentar obtener el rol de diferentes formas
    if (decoded.rol) {
      rol = decoded.rol;
    } else if (decoded.authorities && decoded.authorities.length > 0) {
      rol = decoded.authorities[0].authority;
    } else if (decoded.roles && decoded.roles.length > 0) {
      rol = decoded.roles[0];
    }

    console.log('Rol detectado:', rol);

    // Verificar si es administrador
    if (rol !== 'ADMINISTRADOR') {
      console.error('Rol incorrecto:', rol);
      throw new Error('No tiene permisos para eliminar eventos');
    }

    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Status de la respuesta:', res.status);
    console.log('Headers de la respuesta:', res.headers);

    if (res.status === 403) {
      throw new Error('No tiene permisos para eliminar este evento');
    }

    if (res.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
    }

    // Si la respuesta es exitosa pero no tiene contenido JSON
    if (res.ok && res.headers.get('content-length') === '0') {
      return { message: 'Evento eliminado exitosamente' };
    }

    // Si hay contenido JSON, intentar parsearlo
    if (res.headers.get('content-type')?.includes('application/json')) {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al eliminar evento');
      }
      return data;
    }

    // Si no hay contenido JSON pero la respuesta es exitosa
    if (res.ok) {
      return { message: 'Evento eliminado exitosamente' };
    }

    throw new Error('Error al eliminar evento');
  } catch (error) {
    console.error('Error en eliminarEvento:', error);
    throw error;
  }
}

export async function getEventosPorTipo(tipo) {
  try {
    console.log('Iniciando petición GET a:', `${API_URL}/tipo/${tipo}`);
    const res = await fetch(`${API_URL}/tipo/${tipo}`);
    console.log('Respuesta recibida:', res.status, res.statusText);
    
    if (!res.ok) {
      const errorData = await res.json();
      console.error('Error en la respuesta:', errorData);
      throw new Error(errorData.error || 'Error al obtener eventos por tipo');
    }
    
    const data = await res.json();
    console.log('Datos recibidos:', data);
    
    if (!data.data) {
      console.warn('La respuesta no contiene el campo data:', data);
      return [];
    }
    
    console.log('Eventos obtenidos:', data.data);
    return data.data;
  } catch (error) {
    console.error('Error en getEventosPorTipo:', error);
    throw error;
  }
}

export async function getEventosPorCategoria(categoria) {
  try {
    console.log('Iniciando petición GET a:', `${API_URL}/categoria/${categoria}`);
    const token = localStorage.getItem('token');
    
    const res = await fetch(`${API_URL}/categoria/${categoria}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Respuesta recibida:', res.status, res.statusText);
    
    if (!res.ok) {
      if (res.status === 403) {
        throw new Error('No tienes permisos para acceder a esta información');
      }
      const errorData = await res.json();
      console.error('Error en la respuesta:', errorData);
      throw new Error(errorData.error || 'Error al obtener eventos por categoría');
    }
    
    const data = await res.json();
    console.log('Datos recibidos:', data);
    
    if (!data.data) {
      console.warn('La respuesta no contiene el campo data:', data);
      return [];
    }
    
    console.log('Eventos obtenidos:', data.data);
    return data.data;
  } catch (error) {
    console.error('Error en getEventosPorCategoria:', error);
    throw error;
  }
}