// src/pages/product-detail/ProductInfo.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Minus, Plus, ShoppingCart, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

// Define the Product interface (should match your backend product structure)
interface Product {
  id: number;
  name: string;
  price: number;
  rating: number;
  reviews: number;
  category: string;
  discount: number; // Assuming discount is a number (e.g., 10 for 10%, 0.15 for 15%)
  stock: number;
  sizes?: string[]; // Optional sizes array
  colors?: string[]; // Optional colors array
  shipping?: { // Make shipping optional as well for robustness
    free: boolean;
    days: string;
    returnDays: number;
  };
}

// Define props for ProductInfo
interface ProductInfoProps {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  handleQuantityChange: (delta: number) => void;
  setSelectedSize: (size: string) => void;
  setSelectedColor: (color: string) => void;
  onWriteReviewClick: () => void;
  // This prop is now correctly defined and will receive the handleAddToCart function from ProductDetail
  onAddToCart: (product: Product, quantity: number, selectedSize: string, selectedColor: string) => void;
}

const ProductInfo: React.FC<ProductInfoProps> = ({
  product,
  quantity,
  selectedSize,
  selectedColor,
  handleQuantityChange,
  setSelectedSize,
  setSelectedColor,
  onWriteReviewClick,
  onAddToCart, // <-- Correctly destructured
}) => {
  // Ensure rating is a number, default to 0 if undefined or null
  const displayRating = product.rating !== undefined && product.rating !== null ? product.rating : 0;
  // Ensure reviews is also treated as a number, default to 0
  const displayReviews = product.reviews !== undefined && product.reviews !== null ? product.reviews : 0;

  // --- CALCULATE ORIGINAL PRICE AND SAVED AMOUNT ---
  let calculatedOriginalPrice = product.price; // Default to current price
  let savedAmount = 0;

  // Choose the calculation that matches how 'discount' is stored in your DB:
  if (product.discount > 0) {
    // Option A: If 'discount' is a whole percentage (e.g., 10 for 10%, 20 for 20%)
    if (product.discount <= 100) {
        calculatedOriginalPrice = product.price / (1 - (product.discount / 100));
        savedAmount = calculatedOriginalPrice - product.price;
    }
    // Option B: If 'discount' is a decimal percentage (e.g., 0.15 for 15%)
    // else if (product.discount < 1) {
    //     calculatedOriginalPrice = product.price / (1 - product.discount);
    //     savedAmount = calculatedOriginalPrice - product.price;
    // }
    // Option C: If 'discount' column stores the *actual amount* saved (e.g., $10 off)
    // else { // This would imply product.discount is the absolute amount saved
    //   savedAmount = product.discount;
    //   calculatedOriginalPrice = product.price + savedAmount;
    // }
  }


  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-electric-aqua font-medium mb-2">{product.category}</div>
        <h1 className="text-3xl font-bold text-charcoal-gray mb-4">{product.name}</h1>

        {/* Rating */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.floor(displayRating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="ml-2 text-sm font-medium">{displayRating.toFixed(1)}</span>
          </div>
          <span className="text-sm text-gray-500">({displayReviews} reviews)</span>
          <button
            className="text-sm text-electric-aqua hover:underline"
            onClick={onWriteReviewClick}
          >
            Write a review
          </button>
        </div>

        {/* Price */}
        <div className="flex items-center space-x-4 mb-6">
          <span className="text-3xl font-bold text-deep-indigo">${product.price.toFixed(2)}</span>
          {/* Display original price if there's a significant saved amount */}
          {savedAmount > 0.01 && (
            <span className="text-xl text-gray-500 line-through">${calculatedOriginalPrice.toFixed(2)}</span>
          )}
          {/* Display Save badge if there's a significant saved amount */}
          {savedAmount > 0.01 && (
            <Badge className="bg-coral-pink text-white">Save ${savedAmount.toFixed(2)}</Badge>
          )}
        </div>

        {/* Stock Status */}
        <div className="mb-6">
          {product.stock ? (
            <div className="flex items-center text-green-600">
              <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
              <span className="text-sm font-medium">In Stock ({product.stock} available)</span>
            </div>
          ) : (
            <div className="flex items-center text-red-600">
              <div className="w-2 h-2 bg-red-600 rounded-full mr-2"></div>
              <span className="text-sm font-medium">Out of Stock</span>
            </div>
          )}
        </div>
      </div>

      {/* Product Variants (Colors) */}
      {product.colors && product.colors.length > 0 && (
        <div>
          <Label htmlFor="color-select" className="text-sm font-medium text-charcoal-gray mb-3 block">Color</Label>
          <div className="flex space-x-3">
            {product.colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  selectedColor === color
                    ? 'border-electric-aqua bg-electric-aqua/10 text-electric-aqua'
                    : 'border-gray-300 text-charcoal-gray hover:border-electric-aqua'
                }`}
                aria-label={`Select color ${color}`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Product Variants (Sizes) */}
      {product.sizes && product.sizes.length > 0 && (
        <div>
          <Label htmlFor="size-select" className="text-sm font-medium text-charcoal-gray mb-3 block">Size</Label>
          <div className="flex space-x-3">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  selectedSize === size
                    ? 'border-electric-aqua bg-electric-aqua/10 text-electric-aqua'
                    : 'border-gray-300 text-charcoal-gray hover:border-electric-aqua'
                }`}
                aria-label={`Select size ${size}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity Selector */}
      <div>
        <Label htmlFor="quantity-selector" className="text-sm font-medium text-charcoal-gray mb-3 block">Quantity</Label>
        <div className="flex items-center space-x-4">
          <div className="flex items-center border rounded-lg">
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 border-x min-w-[50px] text-center">{quantity}</span>
            <button
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= product.stock}
              className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <span className="text-sm text-gray-500">
            {product.stock} available
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <div className="flex space-x-4">
          <Button
            size="lg"
            className="flex-1bg-black hover:text-yellow-400"
            disabled={!product.stock}
            // This is the "Add to Cart" button, now correctly wired!
            onClick={() => onAddToCart(product, quantity, selectedSize, selectedColor)}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Add to Cart
          </Button>
          <Button size="lg" variant="outline" className="border-coral-pink text-coral-pink hover:bg-coral-pink hover:text-white">
            <Heart className="w-5 h-5" />
          </Button>
          <Button size="lg" variant="outline">
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
        <Button
          size="lg"
          className="w-full bg-coral-pink hover:bg-coral-pink/90"
          disabled={!product.stock}
        >
          Buy Now
        </Button>
      </div>

      {/* Shipping Info */}
      <Card className="p-4 bg-white rounded-lg shadow-sm">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-charcoal-gray">Shipping</span>
            <span className="text-sm font-medium text-green-600">
              {product.shipping?.free ? 'Free' : '$9.99'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-charcoal-gray">Delivery</span>
            <span className="text-sm font-medium">{product.shipping?.days}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{product.shipping?.returnDays} days</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProductInfo;