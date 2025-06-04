// src/pages/checkout/PaymentStep.tsx

import React from 'react';
import { ShippingDetails } from './ShippingStep'; // Import ShippingDetails for billing address type

// Placeholder types for payment details.
export interface PaymentDetails {
  isBillingSameAsShipping: boolean;
  billingAddress: ShippingDetails; // Or a simpler address type if preferred
  method: 'card' | 'upi' | 'cod' | 'bnpl';
  cardDetails: {
    cardNumber: string;
    cardName: string;
    expiryDate: string;
    cvv: string;
  };
}

interface PaymentStepProps {
  paymentDetails: PaymentDetails;
  shippingDetails: ShippingDetails; // Needed to pre-fill billing if same
  onUpdate: (details: PaymentDetails) => void;
  onNext: () => void;
  onPrev: () => void;
  // Replace `useToast` with your actual toast implementation (e.g., from Shadcn)
  useToast: () => { toast: (options: { title: string; description: string; variant: string }) => void };
}

const PaymentStep: React.FC<PaymentStepProps> = ({
  paymentDetails,
  shippingDetails,
  onUpdate,
  onNext,
  onPrev,
  useToast,
}) => {
  const { toast } = useToast();

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onUpdate({ ...paymentDetails, method: value as PaymentDetails['method'] });
  };

  const handleCardDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onUpdate({
      ...paymentDetails,
      cardDetails: {
        ...paymentDetails.cardDetails,
        [name]: value,
      },
    });
  };

  const handleBillingSameAsShippingChange = (isChecked: boolean) => {
    onUpdate({
      ...paymentDetails,
      isBillingSameAsShipping: isChecked,
      billingAddress: isChecked ? shippingDetails : { // Pre-fill if checked
        email: '', phone: '', fullName: '', address1: '', address2: '',
        city: '', state: '', zip: '', country: '', shippingMethod: 'standard' // Default method
      },
    });
  };

  const handleBillingAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onUpdate({
      ...paymentDetails,
      billingAddress: {
        ...paymentDetails.billingAddress,
        [name]: value,
      },
    });
  };

  const validateAndProceed = () => {
    if (paymentDetails.method === 'card') {
      const { cardNumber, cardName, expiryDate, cvv } = paymentDetails.cardDetails;
      if (!cardNumber || !cardName || !expiryDate || !cvv) {
        toast({
          title: "Card Details Missing",
          description: "Please fill in all credit card details.",
          variant: "destructive",
        });
        return;
      }
      // Add more rigorous regex validation for card number, expiry, CVV
      if (cardNumber.replace(/\s/g, '').length !== 16) { // Basic length check
         toast({ title: "Invalid Card Number", description: "Card number must be 16 digits.", variant: "destructive" });
         return;
      }
      // ... more validation
    }
    // Add validation for other payment methods if necessary

    if (!paymentDetails.isBillingSameAsShipping && !paymentDetails.billingAddress.fullName) { // Example check
        toast({ title: "Billing Address Missing", description: "Please complete billing address.", variant: "destructive" });
        return;
    }

    onNext();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-4">2. Payment Information</h2>

      {/* Billing Address */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium">Billing Address</h3>
        <label className="flex items-center space-x-2">
          {/* Replace with Shadcn Checkbox */}
          <input
            type="checkbox"
            checked={paymentDetails.isBillingSameAsShipping}
            onChange={(e) => handleBillingSameAsShippingChange(e.target.checked)}
            className="form-checkbox h-5 w-5 text-indigo-600"
          />
          <span>Billing address is same as shipping address</span>
        </label>

        {!paymentDetails.isBillingSameAsShipping && (
          <div className="space-y-4 pt-3">
            {/* These fields are similar to ShippingStep's address fields */}
            {/* You might consider a reusable AddressForm component */}
            <div>
              <label htmlFor="billingFullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" id="billingFullName" name="fullName" value={paymentDetails.billingAddress.fullName} onChange={handleBillingAddressChange} className="w-full p-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label htmlFor="billingAddress1" className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
              <input type="text" id="billingAddress1" name="address1" value={paymentDetails.billingAddress.address1} onChange={handleBillingAddressChange} className="w-full p-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label htmlFor="billingAddress2" className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
              <input type="text" id="billingAddress2" name="address2" value={paymentDetails.billingAddress.address2} onChange={handleBillingAddressChange} className="w-full p-2 border border-gray-300 rounded-md" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="billingCity" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input type="text" id="billingCity" name="city" value={paymentDetails.billingAddress.city} onChange={handleBillingAddressChange} className="w-full p-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label htmlFor="billingState" className="block text-sm font-medium text-gray-700 mb-1">State / Province</label>
                <input type="text" id="billingState" name="state" value={paymentDetails.billingAddress.state} onChange={handleBillingAddressChange} className="w-full p-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label htmlFor="billingZip" className="block text-sm font-medium text-gray-700 mb-1">ZIP / Postal Code</label>
                <input type="text" id="billingZip" name="zip" value={paymentDetails.billingAddress.zip} onChange={handleBillingAddressChange} className="w-full p-2 border border-gray-300 rounded-md" />
              </div>
            </div>
            <div>
              <label htmlFor="billingCountry" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <select id="billingCountry" name="country" value={paymentDetails.billingAddress.country} onChange={handleBillingAddressChange} className="w-full p-2 border border-gray-300 rounded-md bg-white">
                <option value="">Select Country</option>
                <option value="USA">United States</option>
                <option value="CAN">Canada</option>
                <option value="IND">India</option>
                {/* Add more countries */}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Payment Method */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium">Payment Method</h3>
        {/* Replace with Shadcn RadioGroup */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 p-3 border rounded-md cursor-pointer">
            <input type="radio" name="paymentMethod" value="card" checked={paymentDetails.method === 'card'} onChange={handlePaymentChange} className="form-radio h-4 w-4 text-indigo-600" />
            <span>Credit/Debit Card</span>
          </label>
          <label className="flex items-center space-x-2 p-3 border rounded-md cursor-pointer">
            <input type="radio" name="paymentMethod" value="upi" checked={paymentDetails.method === 'upi'} onChange={handlePaymentChange} className="form-radio h-4 w-4 text-indigo-600" />
            <span>UPI / Net Banking</span>
          </label>
          <label className="flex items-center space-x-2 p-3 border rounded-md cursor-pointer">
            <input type="radio" name="paymentMethod" value="bnpl" checked={paymentDetails.method === 'bnpl'} onChange={handlePaymentChange} className="form-radio h-4 w-4 text-indigo-600" />
            <span>Buy Now, Pay Later (e.g., Klarna, Afterpay)</span>
          </label>
          <label className="flex items-center space-x-2 p-3 border rounded-md cursor-pointer">
            <input type="radio" name="paymentMethod" value="cod" checked={paymentDetails.method === 'cod'} onChange={handlePaymentChange} className="form-radio h-4 w-4 text-indigo-600" />
            <span>Cash on Delivery (COD)</span>
          </label>
        </div>
      </div>

      {/* Card Details (Conditionally Rendered) */}
      {paymentDetails.method === 'card' && (
        <div className="space-y-4 p-4 border rounded-md bg-gray-50">
          <h3 className="font-medium">Enter Card Details</h3>
          <div>
            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              value={paymentDetails.cardDetails.cardNumber}
              onChange={handleCardDetailsChange}
              maxLength={19} // For 'XXXX XXXX XXXX XXXX' format
              placeholder="XXXX XXXX XXXX XXXX"
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
            <input
              type="text"
              id="cardName"
              name="cardName"
              value={paymentDetails.cardDetails.cardName}
              onChange={handleCardDetailsChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (MM/YY)</label>
              <input
                type="text"
                id="expiryDate"
                name="expiryDate"
                value={paymentDetails.cardDetails.expiryDate}
                onChange={handleCardDetailsChange}
                maxLength={5} // For 'MM/YY' format
                placeholder="MM/YY"
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
              <input
                type="text"
                id="cvv"
                name="cvv"
                value={paymentDetails.cardDetails.cvv}
                onChange={handleCardDetailsChange}
                maxLength={4}
                placeholder="XXX"
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 flex items-center mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Your payment details are encrypted and secure.
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        {/* Replace with Shadcn Button */}
        <button
          onClick={onPrev}
          className="border border-gray-300 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-100 transition-colors"
        >
          Back to Shipping
        </button>
        {/* Replace with Shadcn Button */}
        <button
          onClick={validateAndProceed}
          className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Continue to Review
        </button>
      </div>
    </div>
  );
};

export default PaymentStep;