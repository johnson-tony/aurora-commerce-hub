import Navigation from '@/components/Navigation';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProductInfo from './product-detail/ProductInfo';
import ProductDetailsTabs from './product-detail/ProductDetailsTabs';
import ReviewFormModal from '../components/ReviewFormModal';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext'; // Import useCart hook

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  category: string;
  discount: number;
  stock: number;
  sizes?: string[];
  colors?: string[];
  description: string;
  features?: string[];
  specifications?: { [key: string]: string };
  images: string | string[];
  shipping?: {
    free: boolean;
    days: string;
    returnDays: number;
  };
}

interface Review {
  id: number;
  reviewer_name: string;
  rating: number;
  created_at: string;
  title?: string;
  comment: string;
  verified_purchase: number;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const productId = id ? parseInt(id) : undefined;

  const [product, setProduct] = useState<Product | null>(null);
  const [reviewsData, setReviewsData] = useState<Review[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();
  const { addCartItem } = useCart(); // Get addCartItem from useCart

  /**
   * Fetches product details and associated reviews from the backend.
   * Parses product images if they are stored as a JSON string.
   */
  const fetchProductAndReviews = async () => {
    if (!productId) return;

    try {
      // Fetch product data
      const productResponse = await fetch(`http://localhost:5000/api/products/${productId}`);
      if (!productResponse.ok) {
        throw new Error('Failed to fetch product data');
      }
      const productData: Product = await productResponse.json();

      // Parse images string to array if necessary
      if (productData.images && typeof productData.images === 'string') {
        try {
          productData.images = JSON.parse(productData.images);
          console.log('Parsed product images (from ProductDetail):', productData.images);
        } catch (parseError) {
          console.error('Failed to parse product images:', parseError);
          productData.images = []; // Default to empty array on parse error
        }
      } else if (!Array.isArray(productData.images)) {
        productData.images = []; // Ensure it's an array for consistency
      }
      setProduct(productData);

      // Fetch reviews data for the product
      const reviewsResponse = await fetch(`http://localhost:5000/api/reviews/product/${productId}`);
      if (!reviewsResponse.ok) {
        throw new Error('Failed to fetch reviews data');
      }
      const { reviews } = await reviewsResponse.json();
      setReviewsData(reviews);

      // Set initial selected size and color if available
      if (productData.sizes && productData.sizes.length > 0) {
        setSelectedSize(productData.sizes[0]);
      }
      if (productData.colors && productData.colors.length > 0) {
        setSelectedColor(productData.colors[0]);
      }

    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Could not load product details.',
        variant: 'destructive',
      });
    }
  };

  // Effect hook to fetch data when productId changes
  useEffect(() => {
    fetchProductAndReviews();
  }, [productId]);

  /**
   * Handles changes to the product quantity.
   * Ensures quantity stays within valid range (1 to product stock).
   * @param delta The change in quantity (e.g., +1 or -1).
   */
  const handleQuantityChange = (delta: number) => {
    console.log('handleQuantityChange called. Delta:', delta);
    if (product) {
      setQuantity((prev) => {
        const newQuantity = Math.max(1, Math.min(prev + delta, product.stock));
        console.log('Old quantity:', prev, 'New quantity:', newQuantity, 'Product Stock:', product.stock);
        return newQuantity;
      });
    } else {
      console.log('Product is null, cannot change quantity.');
    }
  };

  /**
   * Handles adding the selected product with its quantity, size, and color to the cart.
   * Utilizes the `addCartItem` function from the `CartContext`.
   * Includes authentication check.
   */
  const handleAddToCart = async (
    productToAdd: Product,
    qty: number,
    size: string,
    color: string
  ) => {
    if (!productToAdd || qty <= 0) {
      toast({
        title: 'Error',
        description: 'Invalid product or quantity to add to cart.',
        variant: 'destructive',
      });
      return;
    }

    // Authentication check before adding to cart
    if (!user || !user.id) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to add items to your cart.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Call the addCartItem function from CartContext to handle the cart logic
      await addCartItem(
        productToAdd.id,
        qty,
        size,
        color
      );

      // Display a success toast notification
      toast({
        title: 'Added to Cart!',
        description: `${qty} x ${productToAdd.name} added to your cart.`,
        variant: 'default',
      });

    } catch (error: any) {
      console.error('Error adding to cart via context:', error);
      toast({
        title: 'Error',
        description: error.message || 'Could not add item to cart.',
        variant: 'destructive',
      });
    }
  };

  // Display loading state if product data is not yet available
  if (!product) {
    return <div className="text-center py-10">Loading product details...</div>;
  }

  return (
    <div className="min-h-screen bg-soft-ivory">
      <Navigation />
      <div className="container mx-auto px-4 py-8">

        {/* Product Information Section (Image and Details) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          <div className="flex justify-center items-center h-96 bg-gray-100 rounded-lg overflow-hidden">
            {Array.isArray(product.images) && product.images.length > 0 ? (
              <img
                src={product.images[0]} // Display the first image
                alt={product.name}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-gray-500">No Image</span> // Fallback for no images
            )}
          </div>

          {/* ProductInfo component to display product details and controls */}
          <ProductInfo
            product={product}
            quantity={quantity}
            selectedSize={selectedSize}
            selectedColor={selectedColor}
            handleQuantityChange={handleQuantityChange}
            setSelectedSize={setSelectedSize}
            setSelectedColor={setSelectedColor}
            onWriteReviewClick={() => setIsReviewModalOpen(true)} // Opens review modal
            onAddToCart={handleAddToCart} // Passes the add to cart functionality
          />
        </div>

        {/* Product Details Tabs (Description, Features, Reviews) */}
        <div className="mt-16">
          <ProductDetailsTabs
            product={product}
            reviewsData={reviewsData}
            onWriteReviewClick={() => setIsReviewModalOpen(true)} // Opens review modal from tabs
          />
        </div>

        {/* Review Form Modal */}
        <ReviewFormModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          productId={product.id}
          onReviewSubmitted={fetchProductAndReviews} // Refreshes data after a new review
        />
      </div>
    </div>
  );
};

export default ProductDetail;