import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// Define props for the OrderSummary component
interface OrderSummaryProps {
  cartItemsCount: number; // Number of unique items in cart
  subtotal: number;
  savings: number;
  shipping: number;
  total: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  cartItemsCount,
  subtotal,
  savings,
  shipping,
  total,
}) => {
  return (
    <div className="lg:col-span-1">
      <Card className="p-6 bg-white rounded-lg shadow-sm sticky top-8">
        <h2 className="text-xl font-bold text-charcoal-gray mb-6">Order Summary</h2>

        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal ({cartItemsCount} items)</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>

          {savings > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Savings</span>
              <span className="font-medium text-green-600">-${savings.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium">
              {shipping === 0 ? (
                <span className="text-green-600">Free</span>
              ) : (
                `$${shipping.toFixed(2)}`
              )}
            </span>
          </div>

          {shipping > 0 && (
            <div className="text-xs text-gray-500">
              Add ${(99 - subtotal).toFixed(2)} more for free shipping
            </div>
          )}

          <Separator />

          <div className="flex justify-between text-lg font-bold">
            <span className="text-charcoal-gray">Total</span>
            <span className="text-deep-indigo">${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <Link to="/checkout">
            <Button size="lg" className="w-full bg-deep-indigo hover:bg-deep-indigo/90">
              Proceed to Checkout
            </Button>
          </Link>

          <Link to="/products">
            <Button size="lg" variant="outline" className="w-full">
              Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Promo Code */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="font-medium text-charcoal-gray mb-3">Promo Code</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Enter code"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-electric-aqua"
            />
            <Button size="sm" variant="outline" className="text-coral-pink border-coral-pink hover:bg-coral-pink hover:text-white">
              Apply
            </Button>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <div className="text-xs text-gray-500">
            🔒 Secure checkout with SSL encryption
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OrderSummary;
