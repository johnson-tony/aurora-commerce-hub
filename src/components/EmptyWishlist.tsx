
import React from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const EmptyWishlist: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
          <Heart className="w-12 h-12 text-gray-400" />
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 bg-coral-pink rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">0</span>
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-charcoal-gray mb-3">
        Your Wishlist is Empty
      </h2>
      
      <p className="text-gray-600 mb-8 max-w-md">
        Save your favorite items here. When you find something you love, tap the heart icon to add it to your wishlist.
      </p>
      
      <Button
        onClick={() => navigate('/products')}
        className="bg-deep-indigo hover:bg-deep-indigo/90 text-white px-8 py-3 rounded-lg transition-all duration-200 hover:scale-105"
      >
        Start Shopping
      </Button>
    </div>
  );
};

export default EmptyWishlist;
