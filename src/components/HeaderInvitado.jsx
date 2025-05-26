import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Secciones.css';

const HeaderInvitado = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;
        navigate(`/buscar-invitado/${encodeURIComponent(searchTerm.trim())}`);
        setSearchTerm('');
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
                <nav>
                    <Link to="/" className="login-btn">INICIAR SESIÓN</Link>
                </nav>
            </header>

            <nav className="navbar">
                <ul className="menu">
                    <li><Link to="/ClienteInv">Inicio</Link></li>
                    <li><Link to="/CategoriasInv">Categorías</Link></li>
                    <li><Link to="/DestacadosInv">Destacados</Link></li>
                    <li><Link to="/SoporteInv">Soporte</Link></li>
                </ul>
            </nav>
        </>
    );
};

export default HeaderInvitado; 