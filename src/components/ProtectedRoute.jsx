import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ children }) => {
  // Verifica si hay un token JWT en localStorage
  const token = localStorage.getItem('token');

  if (!token) {
    console.log('No hay token de autenticación');
    return <Navigate to="/" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    console.log('Token decodificado:', decoded);
    
    // Verificar el rol de diferentes maneras posibles
    const rol = decoded.rol || 
                (decoded.authorities && decoded.authorities[0]?.authority) ||
                (decoded.roles && decoded.roles[0]);
    
    console.log('Rol detectado:', rol);

    // Verificar si es administrador (considerando diferentes formatos posibles)
    const esAdmin = rol === 'ADMINISTRADOR' || 
                   rol === 'ROLE_ADMINISTRADOR' ||
                   rol === 'ADMIN' ||
                   rol === 'ROLE_ADMIN';
    
    if (!esAdmin) {
      console.log('Usuario no tiene rol de administrador');
      return <Navigate to="/" replace />;
    }

    return children;
  } catch (error) {
    console.error('Error al decodificar el token:', error);
    localStorage.removeItem('token');
    return <Navigate to="/" replace />;
  }
};

export default ProtectedRoute; 