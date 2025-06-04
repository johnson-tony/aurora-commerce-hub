
import React from 'react';
import Navigation from '@/components/Navigation';
import WishlistCard from '@/components/WishlistCard';
import EmptyWishlist from '@/components/EmptyWishlist';
import { useWishlist } from '@/hooks/useWishlist';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

// Mock data for demonstration - in real app this would come from API/localStorage
const mockWishlistItems = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    price: 79.99,
    originalPrice: 99.99,
    image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=400&q=80',
    discount: 20,
  },
  {
    id: '2',
    name: 'Smart Fitness Watch',
    price: 199.99,
    originalPrice: 249.99,
    image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=400&q=80',
    discount: 20,
  },
  {
    id: '3',
    name: 'Laptop Computer',
    price: 899.99,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: '4',
    name: 'Professional Camera',
    price: 1299.99,
    originalPrice: 1599.99,
    image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=400&q=80',
    discount: 19,
  },
];

const Wishlist = () => {
  const { wishlistItems, isLoading, removeFromWishlist, moveToCart, clearWishlist } = useWishlist();

  // Use mock data if no items in localStorage (for demonstration)
  const displayItems = wishlistItems.length > 0 ? wishlistItems : mockWishlistItems;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-soft-ivory">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-80"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-ivory">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Heart className="w-8 h-8 text-coral-pink fill-coral-pink" />
              {displayItems.length > 0 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-deep-indigo rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">{displayItems.length}</span>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-charcoal-gray">My Wishlist</h1>
              <p className="text-gray-600 mt-1">
                {displayItems.length} {displayItems.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
          </div>

          {displayItems.length > 0 && (
            <Button
              onClick={clearWishlist}
              variant="outline"
              className="border-coral-pink text-coral-pink hover:bg-coral-pink hover:text-white transition-all duration-200"
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Content Section */}
        {displayItems.length === 0 ? (
          <EmptyWishlist />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayItems.map((item, index) => (
              <div
                key={item.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <WishlistCard
                  item={item}
                  onRemove={removeFromWishlist}
                  onMoveToCart={moveToCart}
                />
              </div>
            ))}
          </div>
        )}

        {/* Additional Info */}
        {displayItems.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              Keep shopping to discover more amazing products!
            </p>
            <Button
              onClick={() => window.location.href = '/products'}
              className="bg-deep-indigo hover:bg-deep-indigo/90 text-white px-8 py-3 transition-all duration-200 hover:scale-105"
            >
              Continue Shopping
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
