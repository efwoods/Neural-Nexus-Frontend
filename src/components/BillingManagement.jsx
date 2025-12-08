import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const BillingManagement = () => {
  const { accessToken } = useAuth();
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState('');

  const cancelSubscription = async () => {
    const res = await fetch('/api/billing/cancel', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    setMessage(data.message);
  };

  const deleteCard = async () => {
    const res = await fetch('/api/billing/delete-card', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    setMessage(data.message);
  };

  const updateCard = async () => {
    const res = await fetch('/api/billing/update-card', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const { client_secret } = await res.json();
    const card = elements.getElement(CardElement);
    const result = await stripe.confirmCardSetup(client_secret, {
      payment_method: { card },
    });
    if (result.error) setMessage(result.error.message);
    else setMessage('Card updated successfully!');
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-white">Billing</h1>
      <button
        onClick={cancelSubscription}
        className="px-4 py-2 bg-red-600 rounded-lg"
      >
        Cancel Subscription
      </button>
      <button onClick={updateCard} className="px-4 py-2 bg-teal-600 rounded-lg">
        Update Card
      </button>
      <button onClick={deleteCard} className="px-4 py-2 bg-red-600 rounded-lg">
        Delete Payment Info
      </button>
      {message && <p className="text-white mt-2">{message}</p>}
    </div>
  );
};

export default BillingManagement;
