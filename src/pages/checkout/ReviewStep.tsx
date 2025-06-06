// src/pages/checkout/ReviewStep.tsx

import React from 'react';
import { CheckoutData } from '../Checkout'; // Import CheckoutData from parent Checkout.tsx
import { Link } from 'react-router-dom'; // For potential "Edit" links

interface ReviewStepProps {
    checkoutData: CheckoutData;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ checkoutData }) => {
    const { cartItems, shipping, payment, subtotal, savings, appliedCoupon, finalShipping, total } = checkoutData;

    return (
        <div>
            <h3 className="text-2xl font-semibold mb-4">Review Your Order</h3>

            {/* Order Summary (Condensed) - You could reuse OrderSummaryCard here if you want*/}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-bold text-lg mb-3">Items ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
                    {cartItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                            <span>{item.name} x {item.quantity}</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                <div className="border-t pt-2 space-y-1 text-sm">
                    <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    {savings > 0 && (
                        <div className="flex justify-between text-green-600">
                            <span>Savings:</span>
                            <span>-${savings.toFixed(2)}</span>
                        </div>
                    )}
                    {appliedCoupon && (
                        <div className="flex justify-between text-green-600">
                            <span>Coupon ({appliedCoupon.code}):</span>
                            <span>-${appliedCoupon.discount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>{finalShipping === 0 ? 'Free' : `$${finalShipping.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t mt-2 pt-2">
                        <span>Total:</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Shipping Details */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-bold text-lg mb-3">Shipping Details</h4>
                <p><strong>Name:</strong> {shipping.fullName}</p>
                <p><strong>Address:</strong> {shipping.address1}, {shipping.address2 && `${shipping.address2}, `}{shipping.city}, {shipping.state} {shipping.zip}, {shipping.country}</p>
                <p><strong>Email:</strong> {shipping.email}</p>
                <p><strong>Phone:</strong> {shipping.phone}</p>
                <p><strong>Method:</strong> {shipping.shippingMethod === 'standard' ? 'Standard Shipping' : 'Express Shipping'}</p>
                {/* You might want an "Edit" link here */}
            </div>

            {/* Payment Details */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-bold text-lg mb-3">Payment Details</h4>
                <p><strong>Method:</strong> {payment.method === 'card' ? 'Credit Card' : payment.method}</p>
                {payment.method === 'card' && (
                    <>
                        <p><strong>Card ending:</strong> {payment.cardDetails.cardNumber.slice(-4)}</p>
                        <p><strong>Name on Card:</strong> {payment.cardDetails.cardName}</p>
                    </>
                )}
                {!payment.isBillingSameAsShipping && (
                    <div className="mt-4">
                        <h5 className="font-semibold text-md mb-2">Billing Address:</h5>
                        <p><strong>Name:</strong> {payment.billingAddress.fullName}</p>
                        <p><strong>Address:</strong> {payment.billingAddress.address1}, {payment.billingAddress.address2 && `${payment.billingAddress.address2}, `}{payment.billingAddress.city}, {payment.billingAddress.state} {payment.billingAddress.zip}, {payment.billingAddress.country}</p>
                        <p><strong>Email:</strong> {payment.billingAddress.email}</p>
                        <p><strong>Phone:</strong> {payment.billingAddress.phone}</p>
                    </div>
                )}
                {/* You might want an "Edit" link here */}
            </div>

            {/* Final Confirmation / Terms and Conditions (Optional) */}
            <div className="mt-6 text-sm text-gray-600">
                <p>By clicking "Place Order", you agree to our <Link to="/terms" className="text-blue-600 hover:underline">Terms and Conditions</Link> and <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.</p>
            </div>
        </div>
    );
};

export default ReviewStep;