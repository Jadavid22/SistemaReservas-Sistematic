import React from 'react'; // Importar React
import '../styles/Modal.css'; // Importar estilos específicos para el modal

// Componente Modal que muestra un cuadro de diálogo para confirmar el pago
const Modal = ({ isOpen, onClose, onConfirm, title, message }) => {
    // Si el modal no está abierto, no renderizar nada
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}> 
            <div className="modal-container" onClick={(e) => e.stopPropagation()}> 
                <h3>{title}</h3> 
                <div className="modal-content"> 
                    <p>{message}</p>
                </div>
                <div className="modal-footer"> {/* Contenedor para los botones del modal */}
                    <button className="btn-cancelar" onClick={onClose}>Cancelar</button> {/* Botón para cancelar */}
                    <button className="btn-confirmar" onClick={onConfirm}>Confirmar</button> {/* Botón para confirmar */}
                </div>
            </div>
        </div>
    );
};

export default Modal; 