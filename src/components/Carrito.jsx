import React, { useRef, useState } from 'react'; // Importar React, useRef y useState
import '../styles/Carrito.css'; // Importar estilos específicos para el carrito
import { useCarrito } from '../context/CarritoContext'; // Importar el contexto del carrito
import Modal from './Modal'; // Importar el componente Modal
import Alerta from './Alerta'; // Importar el componente Alerta
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getAuth } from 'firebase/auth';
import { crearReserva } from '../services/reservasService';

// Inicializar Stripe con tu clave pública
const stripePromise = loadStripe('pk_test_51ROkIPQWQZ4ZSt9gIqrCo6YvbI8IQzm24SxPG7ecouL5bMJ7Nuf2MxBajxCHTabkT9NDrDRO8jj5qnV9Ksg8ApiU00gK5oNSqy');

// Componente para el mensaje de pago exitoso
const PaymentSuccessMessage = ({ onClose }) => {
  return (
    <div className="payment-success-overlay">
      <div className="payment-success-container">
        <div className="payment-success-icon">
          <i className="fas fa-check-circle"></i>
        </div>
        <div className="payment-success-message">
          <h2>¡Reserva Exitosa!</h2>
          <p>Gracias por tu reserva. Tu evento ha sido confirmado correctamente.</p>
        </div>
        <button className="payment-success-button" onClick={onClose}>
          <i className="fas fa-calendar-check"></i>
          Ver Mis Reservas
        </button>
      </div>
    </div>
  );
};

// Componente para el formulario de pago con Stripe
const CheckoutForm = ({ amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);

    if (!stripe || !elements) {
      return;
    }

    try {
      // Crear el intent de pago en el backend
      const response = await fetch('http://localhost:5000/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: amount * 100 }), // Stripe usa centavos
      });

      const { clientSecret } = await response.json();

      // Confirmar el pago con Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message);
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent);
      }
    } catch (err) {
      setError('Ocurrió un error al procesar el pago. Por favor, intente nuevamente.');
      console.error('Error:', err);
    }

    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="card-payment-form">
      <div className="form-group">
        <label htmlFor="card-element">Detalles de la tarjeta</label>
        <div className="card-element-container">
          <CardElement
            id="card-element"
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="payment-button"
      >
        {processing ? 'Procesando...' : `Pagar $${amount}`}
      </button>
    </form>
  );
};

// Componente Carrito que muestra los productos en el carrito de compras
const Carrito = () => {
  const carritoRef = useRef(null); 
  const {
    carrito, // Lista de productos en el carrito
    mostrarCarrito, // Estado que controla la visibilidad del carrito
    setMostrarCarrito, // Función para mostrar/ocultar el carrito
    eliminarDelCarrito, // Función para eliminar un producto del carrito
    aumentarCantidad, // Función para aumentar la cantidad de un producto
    disminuirCantidad, // Función para disminuir la cantidad de un producto
    calcularTotal, // Función para calcular el total del carrito
    limpiarCarrito // Función para limpiar el carrito
  } = useCarrito(); // Obtener valores y funciones del contexto del carrito

  const [modalOpen, setModalOpen] = useState(false); // Estado para controlar la visibilidad del modal
  const [mensajeAlerta, setMensajeAlerta] = useState(''); // Estado para el mensaje de alerta
  const [showPayment, setShowPayment] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const auth = getAuth();

  // Función para manejar la confirmación del pago
  const handleConfirmarPago = () => {
    setModalOpen(false);
    setShowPayment(true);
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No hay usuario autenticado');
      }

      // Crear las reservas en Firestore
      const reservasPromises = carrito.map(evento => {
        const reservaData = {
        usuarioId: user.uid,
          eventoId: evento.id,
          nombreEvento: evento.nombre,
          fechaEvento: evento.fecha,
          horaInicio: evento.horaInicio,
          horaFinal: evento.horaFinal,
          cantidad: evento.cantidad,
          precio: evento.precio,
          total: evento.precio * evento.cantidad,
          estado: 'confirmada',
          fechaReserva: new Date(),
          ubicacion: evento.ubicacion,
        metodoPago: 'tarjeta',
        idPago: paymentIntent.id
      };
        return crearReserva(reservaData);
      });

      await Promise.all(reservasPromises);

      setShowPaymentSuccess(true);
      setShowPayment(false);
      setMostrarCarrito(false);
      limpiarCarrito();
    } catch (error) {
      console.error('Error al crear las reservas:', error);
      setMensajeAlerta('Error al procesar las reservas. Por favor, intente nuevamente.');
    }
  };

  const handleBack = () => {
    setShowPayment(false);
  };

  const handleClosePaymentSuccess = () => {
    setShowPaymentSuccess(false);
  };

  // Si el carrito no está visible y no hay mensaje de éxito, no renderizar nada
  if (!mostrarCarrito && !showPaymentSuccess) return null;

  return (
    <>
      {showPaymentSuccess && (
        <PaymentSuccessMessage onClose={handleClosePaymentSuccess} />
      )}

      {mostrarCarrito && (
    <div className="carrito-overlay" onClick={(e) => {
      if (e.target.className === 'carrito-overlay') {
            setMostrarCarrito(false);
      }
    }}>
      <Alerta mensaje={mensajeAlerta} onClose={() => setMensajeAlerta('')} /> {/* Componente de alerta */}
      <div className="carrito-container" ref={carritoRef}> {/* Contenedor del carrito */}
        <div className="carrito-header"> 
          <h3>Carrito de Reservas</h3> 
          <span className="cart-count">{carrito.length} eventos</span>
          <button className="cerrar-carrito" onClick={() => setMostrarCarrito(false)}>✕</button>
        </div>

            {!showPayment && (
          <>
            {/* Contenedor de los items del carrito */}
            <div className="carrito-items"> 
              {carrito.length === 0 ? ( // Verificar si el carrito está vacío
                <p className="carrito-vacio">El carrito está vacío</p> // Mensaje si el carrito está vacío
              ) : (
                carrito.map(item => ( // Iterar sobre los productos en el carrito
                  <div key={item.id} className="carrito-item"> {/* Contenedor de cada item */}
                    <div className="item-imagen">
                      <img src={item.imagen} alt={item.nombre} /> {/* Imagen del producto */}
                    </div>
                    <div className="item-detalles"> {/* Detalles del producto */}
                      <h4>{item.nombre}</h4> {/* Nombre del producto */}
                      <p className="item-precio">${item.precio}</p> {/* Precio del producto */}
                      <div className="item-controles"> {/* Controles para la cantidad */}
                        <div className="cantidad-controles">
                          <button onClick={() => disminuirCantidad(item.id)}>-</button> {/* Botón para disminuir cantidad */}
                          <span>{item.cantidad}</span> {/* Mostrar cantidad actual */}
                          <button onClick={() => aumentarCantidad(item.id)}>+</button> {/* Botón para aumentar cantidad */}
                        </div>
                        <button 
                          className="eliminar-item"
                          onClick={() => eliminarDelCarrito(item.id)} // Botón para eliminar el item
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                    <div className="item-total"> {/* Total del item */}
                      ${(item.precio * item.cantidad).toFixed(2)} {/* Calcular y mostrar el total */}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="carrito-footer"> 
              <div className="carrito-total"> 
                <span>Total:</span>
                <span>${calcularTotal().toFixed(2)}</span> 
              </div>
              <button className="btn-pagar" onClick={() => setModalOpen(true)}>Proceder al pago</button> 
            </div>
          </>
        )}

            {showPayment && (
          <div className="payment-container">
            <button className="btn-volver" onClick={handleBack}>
              <i className="fas fa-arrow-left"></i> Volver
            </button>
              <div className="card-payment-section">
                <h3>Pago con Tarjeta</h3>
                <div className="test-cards-info">
                  <p>Tarjetas de prueba:</p>
                  <ul>
                    <li>Visa: 4242 4242 4242 4242</li>
                    <li>Mastercard: 5555 5555 5555 4444</li>
                      <li>Cualquier fecha futura</li>
                    <li>Cualquier CVC de 3 dígitos</li>
                  </ul>
                  </div>
                  <div className="card-payment-form">
                    <Elements stripe={stripePromise}>
                      <CheckoutForm
                        amount={calcularTotal()}
                        onSuccess={handlePaymentSuccess}
                      />
                    </Elements>
                  </div>
              </div>
              </div>
            )}
          </div>
          </div>
        )}

      <Modal 
        isOpen={modalOpen} // Controlar la visibilidad del modal
        onClose={() => setModalOpen(false)} // Función para cerrar el modal
        onConfirm={handleConfirmarPago} // Función para manejar la confirmación del pago
        title="Confirmar Pago"
        message={`¿Deseas proceder con el pago de $${calcularTotal().toFixed(2)}?`}
      />
    </>
  );
};

export default Carrito;