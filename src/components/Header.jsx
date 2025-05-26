import React, { useEffect, useRef, useState } from 'react'; // Importar React, useEffect, useRef y useState
import '../styles/Secciones.css'; // Importar estilos específicos para el encabezado
import { usePerfil } from '../context/PerfilContext'; // Importar el contexto de perfil
import { getAuth, signOut } from 'firebase/auth';
import { appFirebase } from '../credenciales';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { useCarrito } from '../context/CarritoContext';

const auth = getAuth(appFirebase);
const db = getFirestore(appFirebase);

// Componente Header que representa la barra de navegación superior
const Header = () => {
  const { perfilMenuActivo, togglePerfilMenu, cerrarMenu } = usePerfil(); // Obtener estado y funciones del contexto de perfil
  const { agregarAlCarrito } = useCarrito();
  const menuRef = useRef(); // Referencia para el menú de perfil
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Efecto para cerrar el menú de perfil al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        cerrarMenu(); // Cerrar el menú si se hace clic fuera
      }
    };

    document.addEventListener('mousedown', handleClickOutside); // Agregar el evento de clic
    return () => {
      document.removeEventListener('mousedown', handleClickOutside); // Limpiar el evento al desmontar
    };
  }, [cerrarMenu]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    // Redirigir a la página de búsqueda con el término de búsqueda
    navigate(`/buscar/${encodeURIComponent(searchTerm.trim())}`);
    setSearchTerm(''); // Limpiar el campo de búsqueda
  };

  return (
    <>
      <header>
        <div className="logo"> 
          <img src="../Sistematic Logo.png" width="200" height="70" alt="Logo" /> 
        </div>
        <div className="search-container"> 
          <form onSubmit={handleSearch}>
            <input 
              type="text" 
              placeholder="¿Qué estás buscando?" 
              className="search-box"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            /> 
            <button type="submit" className="search-btn">🔍</button> 
          </form>
        </div>
        <nav ref={menuRef}>
          <button className="perfil-btn" onClick={togglePerfilMenu}>PERFIL</button>
          <div className={`perfil-dropdown ${perfilMenuActivo ? 'active' : ''}`}>
            <ul>

              <li><a href="/" onClick={() => signOut(auth)}>Cerrar sesión</a></li> 
            </ul>
          </div>
        </nav>
      </header>

      <nav className="navbar"> 
        <ul className="menu"> 
          <li><a href="/Cliente">Inicio</a></li>
          <li><a href="/Categorias">Categorías</a></li>
          <li><a href="/Destacados">Destacados</a></li>
          <li><a href="/HistorialReservas">Historial de Reservas</a></li>
          <li><a href="/Soporte">Soporte</a></li>
        </ul>
      </nav>
    </>
  );
};

export default Header; 