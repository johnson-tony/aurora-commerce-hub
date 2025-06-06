import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Define a type for your product data for better type safety
interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  discount: number;
}

// ProductCard component (moved here as it's specific to rendering products in this section)
const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
  <Card className="group overflow-hidden bg-soft-ivory hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
    <div className="relative">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <div className="absolute top-3 left-3 bg-coral-pink text-white px-2 py-1 rounded-lg text-sm font-medium">
        -{product.discount}%
      </div>
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="sm" variant="outline" className="bg-white/90 hover:bg-white">
          <Heart className="w-4 h-4" />
        </Button>
      </div>
    </div>
    <div className="p-4">
      <div className="text-xs text-electric-aqua font-medium mb-1">{product.category}</div>
      <h3 className="font-semibold text-charcoal-gray mb-2 line-clamp-2">{product.name}</h3>
      <div className="flex items-center mb-2">
        <div className="flex items-center">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm text-charcoal-gray ml-1">{product.rating}</span>
          <span className="text-xs text-gray-500 ml-1">({product.reviews})</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-deep-indigo">${product.price}</span>
          <span className="text-sm text-gray-500 line-through">${product.price}</span>
        </div>
        <Button size="sm" className="bg-black hover:text-yellow-400">
          <ShoppingCart className="w-4 h-4" />
        </Button>
      </div>
    </div>
  </Card>
);

const FeaturedProductsSection: React.FC = () => {
  // This data is now local to this component
  const featuredProducts: Product[] = [
    {
      id: 1,
      name: "Premium Wireless Headphones",
      price: 299,
      originalPrice: 399,
      rating: 4.8,
      reviews: 124,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      category: "Electronics",
      discount: 25
    },
    {
      id: 2,
      name: "Designer Leather Jacket",
      price: 199,
      originalPrice: 299,
      rating: 4.6,
      reviews: 89,
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      category: "Fashion",
      discount: 33
    },
    {
      id: 3,
      name: "Modern Table Lamp",
      price: 89,
      originalPrice: 129,
      rating: 4.7,
      reviews: 156,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      category: "Home Decor",
      discount: 31
    },
    {
      id: 4,
      name: "Smart Fitness Watch",
      price: 249,
      originalPrice: 299,
      rating: 4.9,
      reviews: 203,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2099&q=80",
      category: "Electronics",
      discount: 17
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-charcoal-gray">Featured Products</h2>
        <Link to="/products" className="text-electric-aqua hover:underline">
          View All
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredProducts.map((product) => (
          <Link key={product.id} to={`/product/${product.id}`}>
            <ProductCard product={product} />
          </Link>
        ))}
      </div>
    </section>
  );
};

export default FeaturedProductsSection;
