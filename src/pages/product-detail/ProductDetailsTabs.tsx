import React from 'react';
import { Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button'; // <--- NEW: Import Button for "Write a Review"

// Define the Product interface (subset of what's needed for tabs)
interface Product {
  description: string;
  features?: string[];
  specifications?: { [key: string]: string };
  reviews: number; // Total number of reviews (from backend)
  rating: number; // Average rating (from backend)
  shipping?: {
    free: boolean;
    days: string;
    returnDays: number;
  };
}

// Define the Review interface (matches backend table structure)
interface Review {
  id: number;
  reviewer_name: string; // Matches backend column name
  rating: number;
  created_at: string; // Matches backend column name
  title?: string;
  comment: string;
  verified_purchase: number; // Matches backend column name (0 or 1)
}

// Define props for ProductDetailsTabs
interface ProductDetailsTabsProps {
  product: Product;
  reviewsData: Review[];
  onWriteReviewClick: () => void; // <--- NEW: Prop to open review modal
}

const ProductDetailsTabs: React.FC<ProductDetailsTabsProps> = ({ product, reviewsData, onWriteReviewClick }) => {
  return (
    <Card className="mb-16 bg-white rounded-lg shadow-sm">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({product.reviews})</TabsTrigger>
          <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-charcoal-gray mb-4">Description</h3>
              <p className="text-gray-600 mb-6">{product.description}</p>

              <h4 className="font-semibold text-charcoal-gray mb-3">Key Features</h4>
              <ul className="space-y-2">
                {(product.features || []).map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-electric-aqua rounded-full mr-3"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-charcoal-gray mb-4">Specifications</h3>
              <div className="space-y-3">
                {Object.entries(product.specifications || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-600">{key}</span>
                    <span className="text-sm font-medium text-charcoal-gray">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="p-6">
          <div className="space-y-6">
            <div className="flex justify-end mb-4">
              <Button onClick={onWriteReviewClick}>Write a Review</Button> {/* <--- NEW: "Write a review" button */}
            </div>

            {reviewsData.length === 0 ? (
              <p className="text-center text-gray-700">No reviews yet. Be the first to review!</p>
            ) : (
              reviewsData.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-charcoal-gray">{review.reviewer_name}</span> {/* Use reviewer_name */}
                        {review.verified_purchase === 1 && ( // Check for 1 (true)
                          <Badge variant="outline" className="text-xs">Verified Purchase</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span> {/* Format date */}
                      </div>
                    </div>
                  </div>
                  {review.title && <h4 className="font-medium text-charcoal-gray mb-2">{review.title}</h4>} {/* Optional title */}
                  <p className="text-gray-600">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="shipping" className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-charcoal-gray mb-4">Shipping Information</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>• Free shipping on orders over $99</p>
                <p>• Standard delivery: {product.shipping?.days || 'N/A'}</p> {/* Added fallback */}
                <p>• Express delivery: 1-2 business days (+$15)</p>
                <p>• Order by 2 PM for same-day processing</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-charcoal-gray mb-4">Returns & Exchanges</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>• {product.shipping?.returnDays || 'N/A'}-day return policy</p> {/* Added fallback */}
                <p>• Items must be in original condition</p>
                <p>• Free return shipping on defective items</p>
                <p>• Exchanges processed within 2-3 business days</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ProductDetailsTabs;