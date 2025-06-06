// src/pages/Checkout.tsx

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast as shadcnToast } from '@/components/ui/use-toast'; // Assuming you have Shadcn UI toasts configured
import OrderSummaryCard, { CartItem, AppliedCoupon } from './checkout/OrderSummaryCard'; // Import OrderSummaryCard and the types
import ShippingStep, { ShippingDetails } from './checkout/ShippingStep';
import PaymentStep, { PaymentDetails } from './checkout/PaymentStep';
import ReviewStep from './checkout/ReviewStep';
import Navigation from '@/components/Navigation'; // Assuming you have a Navigation component
import { Button } from '@/components/ui/button'; // Assuming you have a Button component

// --- Placeholder for useToast (replace with your actual Shadcn useToast import and implementation) ---
const useToast = () => {
    return {
        toast: ({ title, description, variant }: { title: string; description: string; variant: "default" | "destructive" }) => {
            console.log(`Toast: ${title} - ${description} (Variant: ${variant})`);
            shadcnToast({ title, description, variant });
        }
    };
};
// --- End Placeholder ---

// Define core types for Checkout data
// These should ideally match your CartContext's CartItem if coming from there
// For simplicity, I'm keeping the original Checkout.tsx CartItem and aligning if possible
// The CartContext's CartItem looks like this:
/*
interface CartItem {
  cart_item_id: number;
  product_id: number;
  quantity: number;
  selected_size: string | null;
  selected_color: string | null;
  product_name: string;
  product_price: number;
  product_images: string[];
  product_stock: number;
}
*/
// You need to map the CartContext's CartItem to OrderSummaryCard's CartItem
// The CartContext's CartItem has product_name, product_price, product_images[0]
// The OrderSummaryCard's CartItem expects: id, name, price, quantity, image
// Let's create a mapper function or adjust the CheckoutData's CartItem definition.

// To align types, let's redefine Checkout's CartItem based on what OrderSummaryCard expects,
// and make sure the data mapping handles this.
// For the purpose of passing to OrderSummaryCard, we need:
// id, name, price, quantity, image, originalPrice (optional)
interface OrderCardCartItem { // Renamed to avoid conflict with CartContext's CartItem
  id: number; // This can be product_id or cart_item_id
  name: string; // product_name
  price: number; // product_price
  originalPrice?: number; // No direct equivalent in CartContext, keep as optional
  quantity: number;
  image: string; // product_images[0]
  inStock?: boolean; // No direct equivalent in CartContext, keep as optional
}

export interface CheckoutData {
  cartItems: OrderCardCartItem[]; // Use the new type here
  shipping: ShippingDetails;
  payment: PaymentDetails;
  appliedCoupon: AppliedCoupon | null;
  subtotal: number;
  savings: number;
  finalShipping: number;
  total: number;
}

// Initial default state for checkout
const initialCheckoutData: CheckoutData = {
  cartItems: [], // Start with an empty array, it will be populated from location.state
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
  appliedCoupon: null, // Start with no applied coupon
  subtotal: 0,
  savings: 0,
  finalShipping: 0,
  total: 0,
};

const Checkout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [checkoutData, setCheckoutData] = useState<CheckoutData>(() => {
    // Attempt to get cartItems from location.state (from Cart page)
    const stateCartItems = (location.state as { cartItems?: any[] })?.cartItems; // Use 'any[]' initially

    let mappedCartItems: OrderCardCartItem[] = [];
    if (stateCartItems && stateCartItems.length > 0) {
      mappedCartItems = stateCartItems.map(item => ({
        id: item.product_id, // Or item.cart_item_id, depending on what ID you prefer to show
        name: item.product_name,
        price: item.product_price,
        quantity: item.quantity,
        image: item.product_images && item.product_images.length > 0 ? item.product_images[0] : '/placeholder.jpg',
        // originalPrice and inStock are not directly from CartContext's CartItem, keep them undefined or add defaults
      }));
    }

    return { ...initialCheckoutData, cartItems: mappedCartItems };
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
      return;
    }
  }, [checkoutData.cartItems, navigate, toast]);


  // Effect to calculate totals whenever relevant data changes
  useEffect(() => {
    const newSubtotal = checkoutData.cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity, 0
    );

    // Calculate savings based on originalPrice if available
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
    // Add validation logic here before proceeding to the next step
    if (currentStep === 1) {
        // Validate shipping details
        const { fullName, address1, city, state, zip, country, email, phone } = checkoutData.shipping;
        if (!fullName || !address1 || !city || !state || !zip || !country || !email || !phone) {
            toast({
                title: "Missing Shipping Information",
                description: "Please fill in all required shipping details.",
                variant: "destructive",
            });
            return;
        }
    } else if (currentStep === 2) {
        // Validate payment details
        const { method, cardDetails, isBillingSameAsShipping, billingAddress } = checkoutData.payment;
        if (method === 'card') {
            const { cardNumber, cardName, expiryDate, cvv } = cardDetails;
            if (!cardNumber || !cardName || !expiryDate || !cvv) {
                toast({
                    title: "Missing Card Details",
                    description: "Please provide all required credit card information.",
                    variant: "destructive",
                });
                return;
            }
        }
        if (!isBillingSameAsShipping) {
            const { fullName, address1, city, state, zip, country, email, phone } = billingAddress;
            if (!fullName || !address1 || !city || !state || !zip || !country || !email || !phone) {
                toast({
                    title: "Missing Billing Information",
                    description: "Please fill in all required billing details.",
                    variant: "destructive",
                });
                return;
            }
        }
    }

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
    navigate('/order-confirmation', { state: { orderId: 'ABC123XYZ', checkoutData: checkoutData } }); // Pass checkoutData for confirmation page if needed
  };

  // If cart is truly empty (e.g., after a redirect by useEffect), don't render anything
  if (!checkoutData.cartItems || checkoutData.cartItems.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area (Steps) */}
        <div className="lg:col-span-2 bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Checkout</h2>

          {/* Stepper/Progress Indicator */}
          <div className="flex justify-between items-center mb-8 border-b pb-4">
            <div className={`flex-1 text-center ${currentStep === 1 ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
              1. Shipping
            </div>
            <div className={`flex-1 text-center ${currentStep === 2 ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
              2. Payment
            </div>
            <div className={`flex-1 text-center ${currentStep === 3 ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
              3. Review
            </div>
          </div>

          {/* Render Current Step */}
          <div>
            {currentStep === 1 && (
              <ShippingStep
                shippingDetails={checkoutData.shipping}
                onUpdateShipping={handleUpdateShipping}
              />
            )}
            {currentStep === 2 && (
              <PaymentStep
                paymentDetails={checkoutData.payment}
                shippingDetails={checkoutData.shipping} // Pass shipping for billing address logic
                onUpdatePayment={handleUpdatePayment}
              />
            )}
            {currentStep === 3 && (
              <ReviewStep
                checkoutData={checkoutData}
              />
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <Button onClick={handlePrevStep} variant="outline">
                Previous
              </Button>
            )}
            {currentStep < 3 && (
              <Button onClick={handleNextStep} className="ml-auto bg-blue-600 hover:bg-blue-700 text-white">
                Next
              </Button>
            )}
            {currentStep === 3 && (
              <Button onClick={handlePlaceOrder} className="ml-auto bg-green-600 hover:bg-green-700 text-white">
                Place Order
              </Button>
            )}
          </div>
        </div>

        {/* Order Summary Card Area */}
        <div className="lg:col-span-1">
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