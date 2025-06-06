import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { ShoppingCart, ArrowLeft, Minus, Plus, Trash2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/context/CartContext';

const Cart: React.FC = () => {
  const {
    cartItems,
    loadingCart,
    errorCart,
    updateCartItemQuantity,
    removeCartItem,
  } = useCart();

  const navigate = useNavigate(); // Initialize useNavigate hook
  const { toast } = useToast();

  useEffect(() => {
    console.log("Cart.tsx: cartItems updated! Current items:", cartItems);
  }, [cartItems]);

  const handleQuantityChange = async (cartItemId: number, newQuantity: number) => {
    await updateCartItemQuantity(cartItemId, newQuantity);
  };

  const handleRemoveItem = async (cartItemId: number) => {
    await removeCartItem(cartItemId);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product_price * item.quantity), 0);
  const savings = 0; // Placeholder for now
  const shipping = subtotal > 99 ? 0 : 9.99;
  const total = subtotal + shipping;

  // Function to handle proceeding to checkout
  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart is Empty",
        description: "Please add items to your cart before proceeding to checkout.",
        variant: "destructive",
      });
      return;
    }
    // Navigate to checkout and pass cartItems as state
    navigate('/checkout', { state: { cartItems: cartItems } });
  };

  if (loadingCart) {
    return (
      <div className="min-h-screen bg-soft-ivory">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <p className="text-xl text-gray-700">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (errorCart) {
    return (
      <div className="min-h-screen bg-soft-ivory">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <p className="text-xl text-red-500">Error loading cart: {errorCart}</p>
        </div>
      </div>
    );
  }

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
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.cart_item_id} className="p-6 bg-white rounded-lg shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
                  <div className="flex-shrink-0">
                    <img
                      src={item.product_images && item.product_images.length > 0 ? item.product_images[0] : '/placeholder.jpg'}
                      alt={item.product_name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.product_id}`} className="hover:text-electric-aqua">
                      <h3 className="text-lg font-semibold text-charcoal-gray mb-2">{item.product_name}</h3>
                    </Link>
                    <div className="text-sm text-gray-600 space-y-1">
                      {item.selected_color && <p>Color: {item.selected_color}</p>}
                      {item.selected_size && <p>Size: {item.selected_size}</p>}
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end space-y-4">
                    <div className="text-right">
                      <div className="text-lg font-bold text-deep-indigo">${item.product_price.toFixed(2)}</div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="flex items-center border rounded-lg">
                        <button
                          className="p-2 hover:bg-gray-100 rounded-l-lg"
                          onClick={() => handleQuantityChange(item.cart_item_id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || loadingCart}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-2 border-x min-w-[50px] text-center">{item.quantity}</span>
                        <button
                          className="p-2 hover:bg-gray-100 rounded-r-lg"
                          onClick={() => handleQuantityChange(item.cart_item_id, item.quantity + 1)}
                          disabled={item.quantity >= item.product_stock || loadingCart}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        onClick={() => handleRemoveItem(item.cart_item_id)}
                        disabled={loadingCart}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-right font-semibold text-charcoal-gray">
                      ${(item.product_price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="p-6 bg-white rounded-lg shadow-sm sticky top-8">
              <h2 className="text-xl font-bold text-charcoal-gray mb-6">Order Summary</h2>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
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

                <div className="border-t pt-4 mt-4 flex justify-between text-lg font-bold">
                  <span className="text-charcoal-gray">Total</span>
                  <span className="text-deep-indigo">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {/* Changed Link to Button and added onClick handler */}
                <Button
                  size="lg"
                  className="w-full bg-black hover:bg-deep-indigo/90 mb-2"
                  onClick={handleProceedToCheckout}
                >
                  Proceed to Checkout
                </Button>

                <Link to="/products">
                  <Button size="lg" variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>

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

              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <div className="text-xs text-gray-500">
                  🔒 Secure checkout with SSL encryption
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;