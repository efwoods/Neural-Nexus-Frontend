import React, { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../context/AuthContext';
import PaymentForm from './PaymentForm';

const stripePromise = loadStripe('pk_test_YOUR_PUBLIC_KEY');

const BillingDashboard = () => {
  const [activeTab, setActiveTab] = useState('usage');
  const [apiUsage, setApiUsage] = useState([]);
  const [billingHistory, setBillingHistory] = useState([]);
  const accessToken = useAuth();
  useEffect(() => {
    const fetchData = async () => {
      if (activeTab === 'usage') {
        const res = await fetch('/api/usage', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setApiUsage(await res.json());
      } else if (activeTab === 'billing') {
        const res = await fetch('/api/billing', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setBillingHistory(await res.json());
      }
    };
    fetchData();
  }, [activeTab, accessToken]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-white">Billing Dashboard</h1>

      <div className="flex space-x-4 border-b border-gray-600">
        <button
          className={`px-4 py-2 ${
            activeTab === 'usage' ? 'border-b-2 border-teal-500' : ''
          }`}
          onClick={() => setActiveTab('usage')}
        >
          API Usage
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === 'billing' ? 'border-b-2 border-teal-500' : ''
          }`}
          onClick={() => setActiveTab('billing')}
        >
          Billing History
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === 'add-card' ? 'border-b-2 border-teal-500' : ''
          }`}
          onClick={() => setActiveTab('add-card')}
        >
          Add Card
        </button>
      </div>

      {activeTab === 'usage' && (
        <div className="bg-gray-900/50 p-4 rounded-lg shadow-md">
          {apiUsage.length === 0 ? (
            <p className="text-gray-400">No usage data yet.</p>
          ) : (
            <table className="w-full text-left text-white">
              <thead>
                <tr>
                  <th className="px-2 py-1">Date</th>
                  <th className="px-2 py-1">Endpoint</th>
                  <th className="px-2 py-1">Requests</th>
                </tr>
              </thead>
              <tbody>
                {apiUsage.map((u) => (
                  <tr key={u.id}>
                    <td className="px-2 py-1">
                      {new Date(u.date).toLocaleDateString()}
                    </td>
                    <td className="px-2 py-1">{u.endpoint}</td>
                    <td className="px-2 py-1">{u.requests}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="bg-gray-900/50 p-4 rounded-lg shadow-md">
          {billingHistory.length === 0 ? (
            <p className="text-gray-400">No billing history available.</p>
          ) : (
            <ul className="space-y-2 text-white">
              {billingHistory.map((b) => (
                <li key={b.id} className="flex justify-between">
                  <span>{new Date(b.date).toLocaleDateString()}</span>
                  <span>${b.amount / 100}</span>
                  <span>{b.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {activeTab === 'add-card' && (
        <div className="bg-gray-900/50 p-4 rounded-lg shadow-md">
          <h2 className="font-semibold text-lg text-white mb-4">
            Add Credit/Debit Card
          </h2>
          <Elements stripe={stripePromise}>
            <PaymentForm accessToken={accessToken} />
          </Elements>
        </div>
      )}
    </div>
  );
};

export default BillingDashboard;
