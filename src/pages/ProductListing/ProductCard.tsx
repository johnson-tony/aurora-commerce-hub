// src/components/ProductCard.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

// Define the Product interface specific to what ProductCard needs
export interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  discount: number;
  stock: number;
  images: string[];
  originalPrice?: number;
  rating: number;
  reviews: number;
  brand?: string;
}

interface ProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { addCartItem } = useCart();

  const calculatedOriginalPrice = product.originalPrice
    ? product.originalPrice
    : (product.discount > 0 ? product.price / (1 - product.discount / 100) : undefined);

  // --- MODIFIED: handleAddToCartFromCard function to stop event propagation ---
  const handleAddToCartFromCard = async (event: React.MouseEvent<HTMLButtonElement>) => {
    // Stop the click event from bubbling up to parent elements (like a Link)
    event.stopPropagation();
    // Prevent any default behavior for the button itself, though usually not needed for simple buttons
    event.preventDefault();

    // 1. Basic validation (product available and in stock)
    if (!product || product.stock <= 0) {
      toast({
        title: 'Error',
        description: 'Product is not available or out of stock.',
        variant: 'destructive',
      });
      return;
    }

    // 2. Call the addCartItem from CartContext directly
    console.log(`ProductCard: Calling addCartItem for product ID ${product.id}`);
    await addCartItem(product.id, 1, null, null);
    // The CartContext's addCartItem should handle success/failure toasts and cart state updates.
  };

  return (
    <Card className={`group overflow-hidden bg-white hover:shadow-lg transition-all duration-300 ${viewMode === 'list' ? 'flex flex-row items-center p-4' : ''}`}>
      {/*
        Wrap the main clickable content of the card (image, name, description, rating, price)
        with the Link component. The Add to Cart button will be placed outside or handled
        with event.stopPropagation() if nested.
      */}
      <Link to={`/product/${product.id}`} className={`block ${viewMode === 'grid' ? 'h-full w-full' : 'flex-grow flex items-center'}`}>
        <div className={`relative ${viewMode === 'list' ? 'w-1/3 flex-shrink-0' : 'w-full'}`}>
          <img
            src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.jpg'}
            alt={product.name}
            className={`w-full ${viewMode === 'grid' ? 'h-48' : 'h-32'} object-cover group-hover:scale-105 transition-transform duration-300`}
          />
          {product.discount > 0 && (
            <div className="absolute top-3 left-3 bg-coral-pink text-black px-2 py-1 rounded-lg text-sm font-medium">
              -{product.discount}%
            </div>
          )}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Wishlist Button - Also needs stopPropagation if it's nested within the Link */}
            <Button
              size="sm"
              variant="outline"
              className="bg-white/90 hover:bg-white"
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); }} // Stop propagation for wishlist too
            >
              <Heart className="w-4 h-4" />
            </Button>
          </div>
          {!(product.stock > 0) && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-medium">Out of Stock</span>
            </div>
          )}
        </div>
        <div className={`p-4 ${viewMode === 'list' ? 'flex-1 ml-4' : ''}`}>
          <div className="text-xs text-electric-aqua font-medium mb-1">{product.category || 'N/A'}</div>
          <h3 className="font-semibold text-charcoal-gray mb-2 line-clamp-2">{product.name}</h3>
          {viewMode === 'list' && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
          )}
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-charcoal-gray ml-1">{product.rating?.toFixed(1) || 'N/A'}</span>
              <span className="text-xs text-gray-500 ml-1">({product.reviews || 0} reviews)</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-deep-indigo">${product.price.toFixed(2)}</span>
              {calculatedOriginalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ${calculatedOriginalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link> {/* End of Link wrapping */}

      {/* The Add to Cart Button is now placed strategically outside the direct link area
          or uses stopPropagation if it *must* be inside the Link's rendered output due to styling.
          Given your original code structure, it was effectively inside the clickable area of the card.
          The `event.stopPropagation()` on its onClick is the key to preventing unwanted navigation.
      */}
      <div className={`p-4 pt-0 ${viewMode === 'list' ? 'w-1/4 flex-shrink-0 flex justify-end items-center' : 'w-full flex justify-end'}`}>
        <Button
          size="sm"
          className="bg-black hover:text-yellow-400"
          onClick={handleAddToCartFromCard} // This now correctly stops propagation
          disabled={!(product.stock > 0)}
        >
          <ShoppingCart className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};

export default ProductCard;