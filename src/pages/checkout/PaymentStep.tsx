// src/pages/checkout/PaymentStep.tsx

import React from 'react';
import { ShippingDetails } from './ShippingStep'; // Import ShippingDetails if not already defined

// Assuming PaymentDetails interface is defined here or imported
export interface CardDetails {
    cardNumber: string;
    cardName: string;
    expiryDate: string; // MM/YY
    cvv: string;
}

export interface PaymentDetails {
    isBillingSameAsShipping: boolean;
    billingAddress: ShippingDetails; // Reusing ShippingDetails for billing address structure
    method: 'card' | 'paypal' | 'other'; // Example payment methods
    cardDetails: CardDetails;
}

interface PaymentStepProps {
    paymentDetails: PaymentDetails;
    shippingDetails: ShippingDetails; // To pre-fill billing address if same as shipping
    onUpdatePayment: (details: PaymentDetails) => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({ paymentDetails, shippingDetails, onUpdatePayment }) => {
    // Implement your payment form here
    const handleMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdatePayment({ ...paymentDetails, method: e.target.value as 'card' | 'paypal' | 'other' });
    };

    const handleBillingSameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isSame = e.target.checked;
        onUpdatePayment({
            ...paymentDetails,
            isBillingSameAsShipping: isSame,
            billingAddress: isSame ? shippingDetails : paymentDetails.billingAddress // Copy shipping to billing if checked
        });
    };

    const handleCardDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        onUpdatePayment({
            ...paymentDetails,
            cardDetails: { ...paymentDetails.cardDetails, [name]: value }
        });
    };

    const handleBillingAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        onUpdatePayment({
            ...paymentDetails,
            billingAddress: { ...paymentDetails.billingAddress, [name]: value }
        });
    };


    return (
        <div>
            <h3 className="text-2xl font-semibold mb-4">Payment Information</h3>
            <div className="mb-4">
                <label className="inline-flex items-center">
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentDetails.method === 'card'}
                        onChange={handleMethodChange}
                        className="form-radio"
                    />
                    <span className="ml-2">Credit Card</span>
                </label>
                <label className="inline-flex items-center ml-4">
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="paypal"
                        checked={paymentDetails.method === 'paypal'}
                        onChange={handleMethodChange}
                        className="form-radio"
                    />
                    <span className="ml-2">PayPal</span>
                </label>
                {/* Add more payment method options */}
            </div>

            {paymentDetails.method === 'card' && (
                <div className="space-y-4">
                    <input
                        type="text"
                        name="cardNumber"
                        placeholder="Card Number"
                        value={paymentDetails.cardDetails.cardNumber}
                        onChange={handleCardDetailsChange}
                        className="p-2 border rounded w-full"
                    />
                    <input
                        type="text"
                        name="cardName"
                        placeholder="Name on Card"
                        value={paymentDetails.cardDetails.cardName}
                        onChange={handleCardDetailsChange}
                        className="p-2 border rounded w-full"
                    />
                    <div className="flex gap-4">
                        <input
                            type="text"
                            name="expiryDate"
                            placeholder="MM/YY"
                            value={paymentDetails.cardDetails.expiryDate}
                            onChange={handleCardDetailsChange}
                            className="p-2 border rounded w-1/2"
                        />
                        <input
                            type="text"
                            name="cvv"
                            placeholder="CVV"
                            value={paymentDetails.cardDetails.cvv}
                            onChange={handleCardDetailsChange}
                            className="p-2 border rounded w-1/2"
                        />
                    </div>
                </div>
            )}

            <div className="mt-6">
                <label className="inline-flex items-center">
                    <input
                        type="checkbox"
                        checked={paymentDetails.isBillingSameAsShipping}
                        onChange={handleBillingSameChange}
                        className="form-checkbox"
                    />
                    <span className="ml-2">Billing address same as shipping address</span>
                </label>
            </div>

            {!paymentDetails.isBillingSameAsShipping && (
                <div className="mt-4 space-y-4">
                    <h4 className="text-xl font-semibold mb-2">Billing Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Re-use similar inputs as ShippingStep for billing address */}
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={paymentDetails.billingAddress.email}
                            onChange={handleBillingAddressChange}
                            className="p-2 border rounded"
                        />
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Phone"
                            value={paymentDetails.billingAddress.phone}
                            onChange={handleBillingAddressChange}
                            className="p-2 border rounded"
                        />
                        <input
                            type="text"
                            name="fullName"
                            placeholder="Full Name"
                            value={paymentDetails.billingAddress.fullName}
                            onChange={handleBillingAddressChange}
                            className="p-2 border rounded col-span-full"
                        />
                        <input
                            type="text"
                            name="address1"
                            placeholder="Address Line 1"
                            value={paymentDetails.billingAddress.address1}
                            onChange={handleBillingAddressChange}
                            className="p-2 border rounded col-span-full"
                        />
                        <input
                            type="text"
                            name="address2"
                            placeholder="Address Line 2 (Optional)"
                            value={paymentDetails.billingAddress.address2}
                            onChange={handleBillingAddressChange}
                            className="p-2 border rounded col-span-full"
                        />
                        <input
                            type="text"
                            name="city"
                            placeholder="City"
                            value={paymentDetails.billingAddress.city}
                            onChange={handleBillingAddressChange}
                            className="p-2 border rounded"
                        />
                        <input
                            type="text"
                            name="state"
                            placeholder="State/Province"
                            value={paymentDetails.billingAddress.state}
                            onChange={handleBillingAddressChange}
                            className="p-2 border rounded"
                        />
                        <input
                            type="text"
                            name="zip"
                            placeholder="Zip/Postal Code"
                            value={paymentDetails.billingAddress.zip}
                            onChange={handleBillingAddressChange}
                            className="p-2 border rounded"
                        />
                        <input
                            type="text"
                            name="country"
                            placeholder="Country"
                            value={paymentDetails.billingAddress.country}
                            onChange={handleBillingAddressChange}
                            className="p-2 border rounded"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentStep;