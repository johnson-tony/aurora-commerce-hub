// src/pages/checkout/OrderSummaryCard.tsx

import React from 'react';
import { Link } from 'react-router-dom';

// Placeholder types for your data. Adjust these based on your actual data structure.
// ADD 'export' HERE
export interface CartItem { // <--- ADD 'export'
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string; // Assuming an image URL
}

export interface AppliedCoupon { // <--- Also export AppliedCoupon if you plan to use it elsewhere
  code: string;
  discount: number; // The actual discount amount
  type: 'fixed' | 'percentage'; // Type of discount
}

interface OrderSummaryCardProps {
  cartItems: CartItem[];
  subtotal: number;
  savings: number;
  appliedCoupon: AppliedCoupon | null;
  finalShipping: number;
  total: number;
}

const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({
  cartItems,
  subtotal,
  savings,
  appliedCoupon,
  finalShipping,
  total,
}) => {
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="w-full lg:w-96 p-6 border rounded-lg shadow-sm lg:sticky lg:top-4 bg-white">
      <h3 className="text-xl font-semibold mb-4">Order Summary</h3>

      {/* Cart Items List */}
      <div className="space-y-4 mb-4 max-h-60 overflow-y-auto">
        {cartItems.length === 0 ? (
          <p className="text-gray-500">No items in cart.</p>
        ) : (
          cartItems.map((item) => (
            <div key={item.id} className="flex items-center space-x-3">
              <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
              <div className="flex-1">
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-gray-600 text-xs">Qty: {item.quantity}</p>
              </div>
              <p className="font-semibold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))
        )}
      </div>

      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal ({itemCount} items)</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        {savings > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Savings</span>
            <span>-${savings.toFixed(2)}</span>
          </div>
        )}

        {appliedCoupon && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Coupon ({appliedCoupon.code})</span>
            <span>-${appliedCoupon.discount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span>Shipping</span>
          <span>
            {finalShipping === 0 ? 'Free' : `$${finalShipping.toFixed(2)}`}
          </span>
        </div>

        <div className="border-t border-dashed my-3"></div> {/* Dashed line for visual separation */}

        <div className="flex justify-between text-lg font-bold">
          <span>Order Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-6">
        {/* Replace with your Shadcn Button component */}
        <Link to="/cart" className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-accent text-accent-foreground h-10 px-4 py-2 border">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          Edit Cart
        </Link>
      </div>
    </div>
  );
};

export default OrderSummaryCard;