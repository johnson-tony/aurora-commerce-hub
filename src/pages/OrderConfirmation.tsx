// src/pages/OrderConfirmation.tsx

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface OrderDetails {
  id: string;
  items: Array<{ name: string; quantity: number; price: number; image: string }>;
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress: string;
  paymentMethod: string;
  estimatedDelivery: string;
  // ... more details
}

const OrderConfirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const idFromState = (location.state as { orderId?: string })?.orderId;
    if (idFromState) {
      setOrderId(idFromState);
      // In a real application, you would now fetch the full order details from your backend
      // using this orderId. Example:
      const fetchOrderDetails = async () => {
        try {
          // const response = await fetch(`/api/orders/${idFromState}`); // Replace with your actual API endpoint
          // if (!response.ok) {
          //   throw new Error('Failed to fetch order details');
          // }
          // const data = await response.json();
          // setOrderDetails(data);

          // --- Mock data for demonstration without a backend ---
          setTimeout(() => {
            setOrderDetails({
              id: idFromState,
              items: [
                { name: 'Wireless Bluetooth Headphones', quantity: 1, price: 99.99, image: 'https://via.placeholder.com/60/0000FF/FFFFFF?text=H' },
                { name: 'Ergonomic Office Chair', quantity: 1, price: 249.99, image: 'https://via.placeholder.com/60/FF0000/FFFFFF?text=C' },
              ],
              subtotal: 349.98,
              shippingCost: 0.00,
              total: 349.98,
              shippingAddress: '123 Main St, Anytown, CA 90210, USA',
              paymentMethod: 'Credit Card (**** 1234)',
              estimatedDelivery: 'June 10, 2025',
            });
            setLoading(false);
          }, 1000); // Simulate API call
          // --- End Mock data ---

        } catch (err) {
          setError('Could not load order details.');
          setLoading(false);
        }
      };

      fetchOrderDetails();
    } else {
      // If no orderId in state (e.g., user refreshed or direct navigated)
      setError('No order ID provided. Please complete a checkout.');
      setLoading(false);
    }
  }, [location.state]); // Dependency on location.state

  if (loading) {
    return (
      <div className="container mx-auto p-8 text-center">
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 text-center text-red-600">
        <p>{error}</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded-md"
        >
          Go to Homepage
        </button>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="container mx-auto p-8 text-center">
        <p>Order details not found.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded-md"
        >
          Go to Homepage
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-2xl bg-white rounded-lg shadow-lg my-8">
      <div className="text-center mb-8">
        <svg className="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <h1 className="text-3xl font-bold text-gray-800 mt-4">Order Placed Successfully!</h1>
        <p className="text-gray-600 mt-2">Thank you for your purchase.</p>
      </div>

      <div className="border-t border-b py-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Order #{orderDetails.id}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Shipping Information</h3>
            <p className="text-gray-600">{orderDetails.shippingAddress}</p>
            <p className="text-gray-600">Method: {orderDetails.shippingCost === 0 ? 'Free Standard' : 'Express'}</p>
            <p className="text-gray-600">Estimated Delivery: {orderDetails.estimatedDelivery}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Payment Information</h3>
            <p className="text-gray-600">{orderDetails.paymentMethod}</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-4">Order Details</h3>
        <div className="space-y-4">
          {orderDetails.items.map(item => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                <div>
                  <p className="font-medium text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
              </div>
              <p className="font-semibold text-gray-800">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-6 space-y-2">
        <div className="flex justify-between text-gray-700">
          <span>Subtotal</span>
          <span>${orderDetails.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Shipping</span>
          <span>${orderDetails.shippingCost.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-gray-800">
          <span>Total</span>
          <span>${orderDetails.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={() => navigate('/')}
          className="bg-indigo-600 text-white py-3 px-8 rounded-md hover:bg-indigo-700 transition-colors text-lg"
        >
          Continue Shopping
        </button>
        {/* You might add a "Track Order" button here later */}
      </div>
    </div>
  );
};

export default OrderConfirmation;