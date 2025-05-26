import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStripe, useElements } from '@stripe/react-stripe-js';

const CheckoutForm = ({ amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvc: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Formatear número de tarjeta (agregar espacios cada 4 dígitos)
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    }
    // Formatear fecha de vencimiento (MM/YY)
    else if (name === 'expiryDate') {
      formattedValue = value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d{0,2})/, '$1/$2')
        .substr(0, 5);
    }
    // Limitar CVC a 3 o 4 dígitos
    else if (name === 'cvc') {
      formattedValue = value.replace(/\D/g, '').substr(0, 4);
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!stripe || !elements) {
      setErrorMessage('Error al inicializar el pago');
      return;
    }

    setIsProcessing(true);

    try {
      // Validar fecha de vencimiento
      const [month, year] = formData.expiryDate.split('/');
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;

      if (parseInt(month) < 1 || parseInt(month) > 12) {
        throw new Error('Mes de vencimiento inválido');
      }

      if (parseInt(year) < currentYear || 
          (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        throw new Error('Tarjeta vencida');
      }

      // Crear el intent de pago en el backend
      const response = await fetch('http://localhost:5000/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: amount * 100 }), // Stripe usa centavos
      });

      const { clientSecret } = await response.json();

      // Crear el método de pago con los datos de la tarjeta
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: {
          number: formData.cardNumber.replace(/\s/g, ''),
          exp_month: parseInt(month),
          exp_year: parseInt('20' + year),
          cvc: formData.cvc,
        },
        billing_details: {
          name: formData.cardholderName,
        },
      });

      if (paymentMethodError) {
        throw new Error(paymentMethodError.message);
      }

      // Confirmar el pago con el método de pago creado
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: paymentMethod.id,
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      if (paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent);
      }

    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card-payment-form">
      <div className="form-group">
        <label htmlFor="cardholderName">Nombre del titular</label>
        <input
          id="cardholderName"
          name="cardholderName"
          type="text"
          value={formData.cardholderName}
          onChange={handleInputChange}
          placeholder="Como aparece en la tarjeta"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="cardNumber">Número de tarjeta</label>
        <input
          id="cardNumber"
          name="cardNumber"
          type="text"
          value={formData.cardNumber}
          onChange={handleInputChange}
          placeholder="1234 5678 9012 3456"
          maxLength="19"
          required
        />
      </div>

      <div className="form-row half">
        <div className="form-group">
          <label htmlFor="expiryDate">Fecha de vencimiento</label>
          <input
            id="expiryDate"
            name="expiryDate"
            type="text"
            value={formData.expiryDate}
            onChange={handleInputChange}
            placeholder="MM/YY"
            maxLength="5"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="cvc">Código de seguridad (CVC)</label>
          <input
            id="cvc"
            name="cvc"
            type="text"
            value={formData.cvc}
            onChange={handleInputChange}
            placeholder="123"
            maxLength="4"
            required
          />
        </div>
      </div>

      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isProcessing || !formData.cardholderName || !formData.cardNumber || !formData.expiryDate || !formData.cvc}
        className="payment-button"
      >
        {isProcessing ? 'Procesando...' : `Pagar $${amount}`}
      </button>
    </form>
  );
};

export default CheckoutForm; 