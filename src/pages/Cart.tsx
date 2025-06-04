import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
// Card, Separator, Badge are now used within the new sub-components,
// so they are removed from here to keep imports clean.
// import { Card } from '@/components/ui/card';
// import { Separator } from '@/components/ui/separator';
// import { Badge } from '@/components/ui/badge';

// --- CORRECT IMPORTS for Cart-specific components (from the 'cart' subfolder) ---
import CartItemCard from './cart/CartItemCard'; // Path to the lowercase 'cart' folder
import OrderSummary from './cart/OrderSummary';   // Path to the lowercase 'cart' folder

const Cart = () => {
  // State for cart items remains in the main Cart component
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Premium Wireless Headphones",
      price: 299,
      originalPrice: 399,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      color: "Black",
      size: "One Size",
      inStock: true
    },
    {
      id: 2,
      name: "Designer Leather Jacket",
      price: 199,
      originalPrice: 299,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      color: "Brown",
      size: "M",
      inStock: true
    },
    {
      id: 3,
      name: "Modern Table Lamp",
      price: 89,
      originalPrice: 129,
      quantity: 2,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      color: "White",
      size: "Standard",
      inStock: true
    }
  ]);

  // Functions to update/remove items also remain here as they manipulate the main state
  const updateQuantity = (id: number, newQuantity: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: Math.max(0, newQuantity) } : item
      ).filter(item => item.quantity > 0)
    );
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  // Calculations also remain here as they depend on the main state
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const savings = cartItems.reduce((sum, item) => sum + ((item.originalPrice - item.price) * item.quantity), 0);
  const shipping = subtotal > 99 ? 0 : 9.99;
  const total = subtotal + shipping;

  // Conditional rendering for empty cart
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-soft-ivory">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="mb-8">
            <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-charcoal-gray mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
            <Link to="/products">
              <Button size="lg" className="bg-deep-indigo hover:bg-deep-indigo/90">
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-ivory">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link to="/products" className="mr-4">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-charcoal-gray">Shopping Cart</h1>
          <span className="ml-4 text-gray-600">({cartItems.length} items)</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                updateQuantity={updateQuantity}
                removeItem={removeItem}
              />
            ))}
          </div>

          {/* Order Summary Section */}
          <OrderSummary
            cartItemsCount={cartItems.length}
            subtotal={subtotal}
            savings={savings}
            shipping={shipping}
            total={total}
          />
        </div>
      </div>
    </div>
  );
};

export default Cart;
