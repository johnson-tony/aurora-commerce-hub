// src/pages/checkout/ReviewStep.tsx

import React from 'react';
import { Link } from 'react-router-dom'; // <--- ADD THIS LINE
import { ShippingDetails } from './ShippingStep';
import { PaymentDetails } from './PaymentStep';
import { CartItem } from './OrderSummaryCard'; // Re-use CartItem type

interface ReviewStepProps {
  shippingDetails: ShippingDetails;
  paymentDetails: PaymentDetails;
  cartItems: CartItem[]; // To display items in the review section
  onEditShipping: () => void;
  onEditPayment: () => void;
  onPlaceOrder: () => void;
  // Replace `useToast` with your actual toast implementation (e.g., from Shadcn)
  useToast: () => { toast: (options: { title: string; description: string; variant: string }) => void };
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  shippingDetails,
  paymentDetails,
  cartItems,
  onEditShipping,
  onEditPayment,
  onPlaceOrder,
  useToast,
}) => {
  const { toast } = useToast();
  const [termsAccepted, setTermsAccepted] = React.useState(false);

  const handlePlaceOrderClick = () => {
    if (!termsAccepted) {
      toast({
        title: "Terms & Conditions",
        description: "Please accept the Terms & Conditions to place your order.",
        variant: "destructive",
      });
      return;
    }
    onPlaceOrder();
  };

  const getMaskedCardNumber = (cardNumber: string) => {
    if (!cardNumber) return 'N/A';
    const cleaned = cardNumber.replace(/\s/g, '');
    if (cleaned.length < 4) return 'N/A';
    return `**** **** **** ${cleaned.slice(-4)}`;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-4">3. Review Your Order</h2>

      {/* Review Contact & Shipping */}
      <div className="border p-4 rounded-md space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Contact & Shipping</h3>
          {/* Replace with Shadcn Button */}
          <button onClick={onEditShipping} className="text-indigo-600 hover:underline text-sm">Edit</button>
        </div>
        <p><span className="font-semibold">Email:</span> {shippingDetails.email}</p>
        <p><span className="font-semibold">Phone:</span> {shippingDetails.phone}</p>
        <p><span className="font-semibold">Recipient:</span> {shippingDetails.fullName}</p>
        <p><span className="font-semibold">Address:</span> {shippingDetails.address1}, {shippingDetails.address2 && `${shippingDetails.address2}, `}{shippingDetails.city}, {shippingDetails.state}, {shippingDetails.zip}, {shippingDetails.country}</p>
        <p><span className="font-semibold">Shipping Method:</span> {shippingDetails.shippingMethod === 'standard' ? 'Standard' : 'Express'}</p>
      </div>

      {/* Review Payment & Billing */}
      <div className="border p-4 rounded-md space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Payment & Billing</h3>
          {/* Replace with Shadcn Button */}
          <button onClick={onEditPayment} className="text-indigo-600 hover:underline text-sm">Edit</button>
        </div>
        <p><span className="font-semibold">Payment Method:</span> {paymentDetails.method === 'card' ? 'Credit/Debit Card' : paymentDetails.method.toUpperCase()}</p>
        {paymentDetails.method === 'card' && (
          <p><span className="font-semibold">Card Number:</span> {getMaskedCardNumber(paymentDetails.cardDetails.cardNumber)}</p>
        )}
        <p><span className="font-semibold">Billing Address:</span> {paymentDetails.isBillingSameAsShipping ? 'Same as shipping address' :
          `${paymentDetails.billingAddress.fullName}, ${paymentDetails.billingAddress.address1}, ${paymentDetails.billingAddress.address2 && `${paymentDetails.billingAddress.address2}, `}${paymentDetails.billingAddress.city}, ${paymentDetails.billingAddress.state}, ${paymentDetails.billingAddress.zip}, ${paymentDetails.billingAddress.country}`
        }</p>
      </div>

      {/* Items in Cart */}
      <div className="border p-4 rounded-md space-y-3">
        <h3 className="text-lg font-medium">Items in Cart</h3>
        {cartItems.length === 0 ? (
          <p className="text-gray-500">No items to review.</p>
        ) : (
          cartItems.map(item => (
            <div key={item.id} className="flex items-center space-x-3 py-1">
              <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
              <div className="flex-1">
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-gray-600 text-xs">Qty: {item.quantity} x ${item.price.toFixed(2)}</p>
              </div>
              <p className="font-semibold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))
        )}
        {/* Replace with Shadcn Button */}
        {/* This is the line that required the <Link> import */}
        <Link to="/cart" className="inline-flex items-center text-indigo-600 hover:underline text-sm mt-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          Edit Cart
        </Link>
      </div>

      {/* Terms and Conditions */}
      <div className="flex items-center space-x-2 mt-4">
        {/* Replace with Shadcn Checkbox */}
        <input
          type="checkbox"
          id="terms"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          className="form-checkbox h-5 w-5 text-indigo-600"
        />
        <label htmlFor="terms" className="text-sm">
          I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Terms & Conditions</a> and <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Privacy Policy</a>.
        </label>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        {/* Replace with Shadcn Button */}
        <button
          onClick={onEditPayment}
          className="border border-gray-300 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-100 transition-colors"
        >
          Back to Payment
        </button>
        {/* Replace with Shadcn Button */}
        <button
          onClick={handlePlaceOrderClick}
          disabled={!termsAccepted}
          className={`py-2 px-6 rounded-md transition-colors ${
            termsAccepted ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Place Order
        </button>
      </div>
    </div>
  );
};

export default ReviewStep;