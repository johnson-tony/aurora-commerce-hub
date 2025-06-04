import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Card } from '@/components/ui/card';

// Define a type for related product data (simplified)
interface RelatedProduct {
  id: number;
  name: string;
  price: number;
  image: string;
  rating: number;
}

// Define props for RelatedProductsSection
interface RelatedProductsSectionProps {
  products: RelatedProduct[];
}

const RelatedProductsSection: React.FC<RelatedProductsSectionProps> = ({ products }) => {
  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold text-charcoal-gray mb-8">Related Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link key={product.id} to={`/product/${product.id}`}>
            <Card className="group overflow-hidden bg-white hover:shadow-lg transition-all duration-300 rounded-lg shadow-sm">
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-charcoal-gray mb-2 line-clamp-2">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-deep-indigo">${product.price.toFixed(2)}</span>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-charcoal-gray ml-1">{product.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RelatedProductsSection;
