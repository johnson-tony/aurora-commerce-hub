import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Define the interface for a single cart item
interface CartItem {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  quantity: number;
  image: string;
  color: string;
  size: string;
  inStock: boolean;
}

// Define props for the CartItemCard component
interface CartItemCardProps {
  item: CartItem;
  updateQuantity: (id: number, newQuantity: number) => void;
  removeItem: (id: number) => void;
}

const CartItemCard: React.FC<CartItemCardProps> = ({ item, updateQuantity, removeItem }) => {
  return (
    <Card className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className="w-24 h-24 object-cover rounded-lg"
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <Link to={`/product/${item.id}`} className="hover:text-electric-aqua">
            <h3 className="text-lg font-semibold text-charcoal-gray mb-2">{item.name}</h3>
          </Link>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Color: {item.color}</p>
            <p>Size: {item.size}</p>
            {item.inStock ? (
              <p className="text-green-600 font-medium">In Stock</p>
            ) : (
              <p className="text-red-600 font-medium">Out of Stock</p>
            )}
          </div>
        </div>

        {/* Price and Quantity Controls */}
        <div className="flex flex-col md:items-end space-y-4">
          <div className="text-right">
            <div className="text-lg font-bold text-deep-indigo">${item.price.toFixed(2)}</div>
            {item.originalPrice > item.price && (
              <div className="text-sm text-gray-500 line-through">${item.originalPrice.toFixed(2)}</div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {/* Quantity Controls */}
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="p-2 hover:bg-gray-100 rounded-l-lg"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 border-x min-w-[50px] text-center">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="p-2 hover:bg-gray-100 rounded-r-lg"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => removeItem(item.id)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              aria-label="Remove item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Item Total */}
          <div className="text-right font-semibold text-charcoal-gray">
            ${(item.price * item.quantity).toFixed(2)}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CartItemCard;
