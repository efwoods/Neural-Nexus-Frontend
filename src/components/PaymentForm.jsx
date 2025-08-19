import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

const PaymentForm = ({ accessToken }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    try {
      // 1. Request PaymentIntent client secret from your backend
      const res = await fetch('/api/create-setup-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const { client_secret } = await res.json();

      // 2. Confirm card setup
      const result = await stripe.confirmCardSetup(client_secret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        setError(result.error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CardElement
        options={{
          style: {
            base: { color: 'white', '::placeholder': { color: 'gray' } },
            invalid: { color: 'red' },
          },
        }}
      />
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">Card added successfully!</p>}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg text-white font-semibold"
      >
        {loading ? 'Processing...' : 'Add Card'}
      </button>
    </form>
  );
};

export default PaymentForm;
