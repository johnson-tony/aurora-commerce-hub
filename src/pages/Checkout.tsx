// src/pages/Checkout.tsx

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast as shadcnToast } from '@/components/ui/use-toast'; // Assuming you have Shadcn UI toasts configured
import OrderSummaryCard from './checkout/OrderSummaryCard';
import ShippingStep, { ShippingDetails } from './checkout/ShippingStep';
import PaymentStep, { PaymentDetails } from './checkout/PaymentStep';
import ReviewStep from './checkout/ReviewStep';

// --- Placeholder for useToast (replace with your actual Shadcn useToast import and implementation) ---
// This simple mock is for demonstration if Shadcn's useToast is not yet hooked up.
const useToast = () => {
  return {
      // CORRECTED type for 'variant' - only 'default' and 'destructive' allowed by your toast.tsx
      toast: ({ title, description, variant }: { title: string; description: string; variant: "default" | "destructive" }) => { // <--- THIS IS THE FINAL CHANGE
          console.log(`Toast: ${title} - ${description} (Variant: ${variant})`);
          shadcnToast({ title, description, variant });
      }
  };
};
// --- End Placeholder ---

// Define core types for Checkout data
interface CartItem {
  id: number;
  name: string;
  price: number;
  originalPrice?: number; // Optional
  quantity: number;
  image: string;
  inStock: boolean;
}

interface AppliedCoupon {
  code: string;
  discount: number;
  type: 'fixed' | 'percentage';
}

interface CheckoutData {
  cartItems: CartItem[];
  shipping: ShippingDetails;
  payment: PaymentDetails;
  appliedCoupon: AppliedCoupon | null;
  subtotal: number;
  savings: number;
  finalShipping: number;
  total: number;
}

// Initial default state for checkout (useful for development without a backend)
const initialCheckoutData: CheckoutData = {
  cartItems: [
    // --- TEMPORARY MOCK CART ITEMS FOR DEVELOPMENT ---
    // Remove these once you connect a backend to fetch real cart data.
    { id: 101, name: 'Wireless Bluetooth Headphones', price: 99.99, originalPrice: 120.00, quantity: 1, image: 'https://via.placeholder.com/80/0000FF/FFFFFF?text=Headphones', inStock: true },
    { id: 102, name: 'Ergonomic Office Chair', price: 249.99, originalPrice: 280.00, quantity: 1, image: 'https://via.placeholder.com/80/FF0000/FFFFFF?text=Chair', inStock: true },
    { id: 103, name: '4K Ultra HD Monitor', price: 399.99, originalPrice: 450.00, quantity: 1, image: 'https://via.placeholder.com/80/00FF00/FFFFFF?text=Monitor', inStock: true },
  ],
  // --- END TEMPORARY MOCK ---
  shipping: {
    email: '', phone: '', fullName: '', address1: '', address2: '',
    city: '', state: '', zip: '', country: '', shippingMethod: 'standard'
  },
  payment: {
    isBillingSameAsShipping: true,
    billingAddress: {
      email: '', phone: '', fullName: '', address1: '', address2: '',
      city: '', state: '', zip: '', country: '', shippingMethod: 'standard'
    },
    method: 'card', // Default to card
    cardDetails: { cardNumber: '', cardName: '', expiryDate: '', cvv: '' },
  },
  appliedCoupon: { code: 'DISCOUNT10', discount: 10, type: 'fixed' }, // Example applied coupon
  subtotal: 0, // Will be calculated
  savings: 0,   // Will be calculated
  finalShipping: 0, // Will be calculated
  total: 0,     // Will be calculated
};

const Checkout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [checkoutData, setCheckoutData] = useState<CheckoutData>(() => {
    // Attempt to get cartItems from location.state, otherwise use mock data
    const stateCartItems = (location.state as { cartItems?: CartItem[] })?.cartItems;
    if (stateCartItems && stateCartItems.length > 0) {
      // If we have actual cart items from navigation, use them
      return { ...initialCheckoutData, cartItems: stateCartItems };
    }
    // Otherwise, fall back to initial mock data
    return initialCheckoutData;
  });

  // Effect to handle redirection if cart is empty
  useEffect(() => {
    if (!checkoutData.cartItems || checkoutData.cartItems.length === 0) {
      toast({
        title: "Cart Empty",
        description: "Your cart is empty. Please add items to proceed to checkout.",
        variant: "destructive",
      });
      navigate('/cart');
      // Returning null from component to prevent render while redirect happens
      return;
    }
  }, [checkoutData.cartItems, navigate, toast]);

  // Effect to calculate totals whenever relevant data changes
  useEffect(() => {
    const newSubtotal = checkoutData.cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity, 0
    );

    const newSavings = checkoutData.cartItems.reduce(
        (sum, item) => sum + (item.originalPrice ? (item.originalPrice - item.price) * item.quantity : 0), 0
    );

    let shippingCost = 0;
    if (checkoutData.shipping.shippingMethod === 'express') {
      shippingCost = 15.00; // Example express shipping cost
    }
    // Apply free shipping coupon if applicable
    if (checkoutData.appliedCoupon?.code === 'FREESHIP') {
        shippingCost = 0;
    }

    let couponDiscount = 0;
    if (checkoutData.appliedCoupon) {
      if (checkoutData.appliedCoupon.type === 'fixed') {
        couponDiscount = checkoutData.appliedCoupon.discount;
      } else if (checkoutData.appliedCoupon.type === 'percentage') {
        couponDiscount = newSubtotal * (checkoutData.appliedCoupon.discount / 100);
      }
    }

    const newTotal = newSubtotal + shippingCost - couponDiscount;

    setCheckoutData(prevData => ({
      ...prevData,
      subtotal: newSubtotal,
      savings: newSavings,
      finalShipping: shippingCost,
      total: Math.max(0, newTotal), // Ensure total doesn't go negative
    }));
  }, [
    checkoutData.cartItems,
    checkoutData.shipping.shippingMethod,
    checkoutData.appliedCoupon,
  ]);

  const handleUpdateShipping = (details: ShippingDetails) => {
    setCheckoutData(prevData => ({ ...prevData, shipping: details }));
  };

  const handleUpdatePayment = (details: PaymentDetails) => {
    setCheckoutData(prevData => ({ ...prevData, payment: details }));
  };

  const handleNextStep = () => {
    setCurrentStep(prevStep => prevStep + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(prevStep => prevStep - 1);
  };

  const handlePlaceOrder = () => {
    // This is where you would typically send data to your backend API
    // for actual order processing and payment gateway integration.
    console.log("Placing order with data:", checkoutData);
    toast({
      title: "Order Placed!",
      description: "Your order has been successfully placed. (Simulated)",
      variant: "default",
    });
    // In a real app, navigate to an order confirmation page
    navigate('/order-confirmation', { state: { orderId: 'ABC123XYZ' } });
  };

  // If cart is truly empty (e.g., after a redirect by useEffect), don't render anything
  if (!checkoutData.cartItems || checkoutData.cartItems.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 lg:p-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content Area */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-6 flex items-center">
            Checkout
            <span className="text-sm font-normal text-gray-500 ml-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
              Secure Checkout
            </span>
          </h1>

          {/* Progress Indicator */}
          <div className="mb-8 flex justify-around items-center text-center">
            {/* Replace with Shadcn Tabs/Segmented Control or custom component */}
            <div className={`flex flex-col items-center p-2 rounded-md ${currentStep === 1 ? 'bg-indigo-100 text-indigo-800 font-semibold' : 'text-gray-500'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 16V4h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2v12h8z"/><path d="M12 12V4"/></svg>
              Shipping
            </div>
            <div className="flex-1 border-t border-gray-300 mx-2"></div>
            <div className={`flex flex-col items-center p-2 rounded-md ${currentStep === 2 ? 'bg-indigo-100 text-indigo-800 font-semibold' : 'text-gray-500'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              Payment
            </div>
            <div className="flex-1 border-t border-gray-300 mx-2"></div>
            <div className={`flex flex-col items-center p-2 rounded-md ${currentStep === 3 ? 'bg-indigo-100 text-indigo-800 font-semibold' : 'text-gray-500'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-8.63"/><path d="M22 4L12 14.01l-3-3"/></svg>
              Review
            </div>
          </div>

          {/* Render current step component */}
          {currentStep === 1 && (
            <ShippingStep
              shippingDetails={checkoutData.shipping}
              onUpdate={handleUpdateShipping}
              onNext={handleNextStep}
              useToast={useToast} // Pass the toast utility
            />
          )}
          {currentStep === 2 && (
            <PaymentStep
              paymentDetails={checkoutData.payment}
              shippingDetails={checkoutData.shipping} // Pass for billing address pre-fill
              onUpdate={handleUpdatePayment}
              onNext={handleNextStep}
              onPrev={handlePrevStep}
              useToast={useToast} // Pass the toast utility
            />
          )}
          {currentStep === 3 && (
            <ReviewStep
              shippingDetails={checkoutData.shipping}
              paymentDetails={checkoutData.payment}
              cartItems={checkoutData.cartItems}
              onEditShipping={() => setCurrentStep(1)}
              onEditPayment={() => setCurrentStep(2)}
              onPlaceOrder={handlePlaceOrder}
              useToast={useToast} // Pass the toast utility
            />
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="w-full lg:w-96">
          <OrderSummaryCard
            cartItems={checkoutData.cartItems}
            subtotal={checkoutData.subtotal}
            savings={checkoutData.savings}
            appliedCoupon={checkoutData.appliedCoupon}
            finalShipping={checkoutData.finalShipping}
            total={checkoutData.total}
          />
        </div>
      </div>
    </div>
  );
};

export default Checkout;