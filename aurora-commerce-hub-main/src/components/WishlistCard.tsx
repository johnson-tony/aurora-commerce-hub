
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  discount?: number;
}

interface WishlistCardProps {
  item: WishlistItem;
  onRemove: (id: string) => void;
  onMoveToCart: (item: WishlistItem) => void;
}

const WishlistCard: React.FC<WishlistCardProps> = ({ item, onRemove, onMoveToCart }) => {
  const { toast } = useToast();

  const handleRemove = () => {
    onRemove(item.id);
    toast({
      title: "Removed from wishlist",
      description: `${item.name} has been removed from your wishlist.`,
    });
  };

  const handleMoveToCart = () => {
    onMoveToCart(item);
    toast({
      title: "Added to cart",
      description: `${item.name} has been moved to your cart.`,
    });
  };

  return (
    <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 bg-white border border-gray-200 animate-fade-in">
      <CardContent className="p-0">
        {/* Image Section */}
        <div className="relative overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Discount Badge */}
          {item.discount && (
            <Badge 
              variant="destructive" 
              className="absolute top-3 left-3 bg-coral-pink text-white font-semibold"
            >
              -{item.discount}% OFF
            </Badge>
          )}

          {/* Heart Icon */}
          <button
            onClick={handleRemove}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 group/heart"
          >
            <Heart 
              className="w-5 h-5 text-coral-pink fill-coral-pink group-hover/heart:scale-110 transition-transform duration-200" 
            />
          </button>
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3">
          {/* Product Name */}
          <h3 className="font-semibold text-charcoal-gray text-sm sm:text-base line-clamp-2 group-hover:text-deep-indigo transition-colors duration-200">
            {item.name}
          </h3>

          {/* Price Section */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-charcoal-gray">
              ${item.price.toFixed(2)}
            </span>
            {item.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ${item.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              onClick={handleMoveToCart}
              className="flex-1 bg-deep-indigo hover:bg-deep-indigo/90 text-white transition-all duration-200 hover:scale-105"
              size="sm"
            >
              Move to Cart
            </Button>
            <Button
              onClick={handleRemove}
              variant="outline"
              className="flex-1 border-gray-300 text-charcoal-gray hover:bg-gray-50 hover:border-coral-pink hover:text-coral-pink transition-all duration-200"
              size="sm"
            >
              Remove
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WishlistCard;
