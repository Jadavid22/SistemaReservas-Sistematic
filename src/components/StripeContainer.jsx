import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from './PaymentForm';

// Reemplaza 'tu_clave_publicable' con tu clave publicable de Stripe
const stripePromise = loadStripe('pk_test_51ROkIPQWQZ4ZSt9gIqrCo6YvbI8IQzm24SxPG7ecouL5bMJ7Nuf2MxBajxCHTabkT9NDrDRO8jj5qnV9Ksg8ApiU00gK5oNSqy');

const StripeContainer = ({ amount, onSuccess }) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm amount={amount} onSuccess={onSuccess} />
    </Elements>
  );
};

export default StripeContainer; 