import {useState, React, useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Cliente from "./pages/Cliente";
import Categorias from "./pages/Categorias";
import Destacados from "./pages/Destacados";
import HistorialReservas from "./pages/HistorialReservas";
import Soporte from "./pages/Soporte";
import Conciertos from "./pages/Secciones/Conciertos";
import Restaurantes from "./pages/Secciones/Restaurantes";
import Teatro from "./pages/Secciones/Teatro";
import Cine from "./pages/Secciones/Cine";
import Spa from "./pages/Secciones/Spa";
import Picnic from "./pages/Secciones/Picnic";
import Cocteleria from "./pages/Secciones/Cocteleria";
import Museo from "./pages/Secciones/Museo";
import Busqueda from "./pages/Busqueda";
import BusquedaInv from "./pages/Invitado/BusquedaInv";
import { CarritoProvider } from './context/CarritoContext';
import { PerfilProvider } from './context/PerfilContext';
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from './pages/AdminDashboard';
import DetalleProducto from "./pages/DetalleProducto";
import Perfil from './pages/Perfil';
import CambiarContrasena from './pages/CambiarContrasena';
import ClienteInv from './pages/Invitado/ClienteInv'; 
import CategoriasInv from './pages/Invitado/CategoriasInv';  
import DestacadosInv from './pages/Invitado/DestacadosInv';
import SoporteInv from './pages/Invitado/SoporteInv';
import ConciertosInv from './pages/Invitado/ConciertosInv';
import RestaurantesInv from './pages/Invitado/RestaurantesInv';
import TeatroInv from './pages/Invitado/TeatroInv';
import CineInv from './pages/Invitado/CineInv';
import SpaInv from './pages/Invitado/SpaInv';
import PicnicInv from './pages/Invitado/PicnicInv';
import CocteleriaInv from './pages/Invitado/CocteleriaInv';
import MuseoInv from './pages/Invitado/MuseoInv';
import ProcesarPago from './components/ProcesarPago';
import PagoExitoso from './components/PagoExitoso';

//importacion de modulos de firebase
import { appFirebase } from './credenciales';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
const auth = getAuth(appFirebase);

function App() {
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Detectar cambios en el estado de autenticación
        const unsubscribe = onAuthStateChanged(auth, (usuarioFirebase) => {
            if (usuarioFirebase) {
                setUsuario(usuarioFirebase);
            } else {
                setUsuario(null);
            }
            setLoading(false);
        });

        // Limpiar el suscriptor cuando el componente se desmonte
        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div>Cargando...</div>;
    }

    return (
        <PerfilProvider>
        <CarritoProvider>
    <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/AdminDashboard" element={
                    <ProtectedRoute>
                        <AdminDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/Cliente" element={<Cliente />} />
                <Route path="/Inicio" element={<Cliente/>} />
                <Route path="/Categorias" element={<Categorias/>} />
                <Route path="/Destacados" element={<Destacados/>} />
                <Route path="/HistorialReservas" element={<HistorialReservas/>} />
                <Route path="/Soporte" element={<Soporte/>} />
                <Route path="/Conciertos" element={<Conciertos/>} />
                <Route path="/Restaurantes" element={<Restaurantes/>} />
                <Route path="/Teatro" element={<Teatro/>} />
                <Route path="/Cine" element={<Cine/>} />
                <Route path="/Spa" element={<Spa/>} />
                <Route path="/Picnic" element={<Picnic/>} />
                <Route path="/Cocteleria" element={<Cocteleria/>} />
                <Route path="/Museo" element={<Museo/>} />
                <Route path="/producto/:id" element={<DetalleProducto/>} />
                <Route path="/perfil" element={<Perfil />} />
                <Route path="/cambiar-contrasena" element={<CambiarContrasena />} />
                <Route path="/ClienteInv" element={<ClienteInv />} />
                <Route path="/CategoriasInv" element={<CategoriasInv />} />
                <Route path="/DestacadosInv" element={<DestacadosInv />} />
                <Route path="/SoporteInv" element={<SoporteInv />} />
                <Route path="/ConciertosInv" element={<ConciertosInv />} />
                <Route path="/RestaurantesInv" element={<RestaurantesInv />} />
                <Route path="/TeatroInv" element={<TeatroInv />} />
                <Route path="/CineInv" element={<CineInv />} />
                <Route path="/SpaInv" element={<SpaInv />} />
                <Route path="/PicnicInv" element={<PicnicInv />} />
                <Route path="/CocteleriaInv" element={<CocteleriaInv />} />
                <Route path="/MuseoInv" element={<MuseoInv />} />
                <Route path="/buscar/:termino" element={<Busqueda />} />
                <Route path="/buscar-invitado/:termino" element={<BusquedaInv />} />
                <Route path="/pagos/procesar/:reservaId" element={<ProcesarPago />} />
                <Route path="/pago-exitoso/:reservaId" element={<PagoExitoso />} />
            </Routes>
        </Router>
        </CarritoProvider>
        </PerfilProvider>
    );
}

export default App;
