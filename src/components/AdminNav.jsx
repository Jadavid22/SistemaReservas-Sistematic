import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminNav.css';

const AdminNav = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav className="admin-nav">
      <div className="admin-nav-content">
        <h1>Panel de Administración</h1>
        <button onClick={handleLogout} className="logout-button">
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
};

export default AdminNav; 