import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CarritoProvider } from './context/CarritoContext';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Productos from './pages/Productos';
import Promociones from './pages/Promociones';
import Servicios from './pages/Servicios';
import DetalleProducto from './pages/DetalleProducto';
import HistorialPedidos from './pages/HistorialReservas';
import ProtectedRoute from './components/ProtectedRoute';
import ClienteInv from './pages/Invitado/ClienteInv';
import Conciertos from "./pages/Secciones/Conciertos";
import PasarelaPago from './components/PasarelaPago';
import PagoExitoso from './components/PagoExitoso';
import './styles/App.css';

function App() {
  return (
    <CarritoProvider>
      <Router>
        <div className="app">
          <Header />
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/promociones" element={<Promociones />} />
            <Route path="/servicios" element={<Servicios />} />
            <Route path="/producto/:id" element={<DetalleProducto />} />
            <Route path="/ClienteInv" element={<ClienteInv />} />
            <Route path="/secciones/conciertos" element={<Conciertos />} />

            {/* Rutas protegidas */}
            <Route 
              path="/historial-pedidos" 
              element={
                <ProtectedRoute>
                  <HistorialPedidos />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/pasarela" 
              element={
                <ProtectedRoute>
                  <PasarelaPago />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/pago-exitoso/:reservaId" 
              element={
                <ProtectedRoute>
                  <PagoExitoso />
                </ProtectedRoute>
              } 
            />

            {/* Ruta por defecto */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </CarritoProvider>
  );
}

export default App; 