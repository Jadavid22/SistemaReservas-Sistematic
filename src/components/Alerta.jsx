import React from 'react'; // Importar React
import '../styles/Alerta.css'; // Importar estilos específicos para la alerta

// Componente Alerta que muestra un mensaje y un botón para cerrarla
const Alerta = ({ mensaje, onClose }) => {
    // Si no hay mensaje, no renderizar nada
    if (!mensaje) return null;

    return (
        <div className="alerta"> {/* Contenedor de la alerta */}
            {mensaje} {/* Mostrar el mensaje de alerta */}
            <button className="cerrar-alerta" onClick={onClose}>✕</button> {/* Botón para cerrar la alerta */}
        </div>
    );
};

export default Alerta;