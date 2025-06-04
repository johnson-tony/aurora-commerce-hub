import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';

// Import page-specific components directly from the 'product-detail' subfolder
import ProductImageGallery from './product-detail/ProductImageGallery';
import ProductInfo from './product-detail/ProductInfo';
import ProductDetailsTabs from './product-detail/ProductDetailsTabs';
import RelatedProductsSection from './product-detail/RelatedProductsSection';

// Define Product and Review interfaces at the page level for clarity and reusability
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number; // Total count of reviews
  images: string[];
  category: string;
  brand: string;
  discount: number;
  inStock: boolean;
  stockCount: number;
  features: string[];
  specifications: { [key: string]: string };
  sizes?: string[];
  colors?: string[];
  shipping: {
    free: boolean;
    days: string;
    returnDays: number;
  };
}

interface Review {
  id: number;
  name: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams(); // Get product ID from URL
  const [productData, setProductData] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for product details (managed locally or passed down)
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M'); // Default size
  const [selectedColor, setSelectedColor] = useState('Black'); // Default color

  // Mock product data (replace with actual fetch from backend)
  const mockProduct: Product = {
    id: 1,
    name: "Premium Wireless Headphones with Advanced Noise Cancellation",
    price: 299,
    originalPrice: 399,
    rating: 4.8,
    reviews: 124,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2084&q=80"
    ],
    category: "Electronics",
    brand: "AudioPro",
    discount: 25,
    inStock: true,
    stockCount: 15,
    description: "Experience exceptional audio quality with our premium wireless headphones featuring industry-leading noise cancellation technology. Perfect for music lovers, professionals, and anyone seeking superior sound quality.",
    features: [
      "Advanced Active Noise Cancellation",
      "40-hour battery life",
      "Premium comfort design",
      "Hi-Res Audio certified",
      "Quick charge technology",
      "Voice assistant compatible"
    ],
    specifications: {
      "Driver Size": "40mm",
      "Frequency Response": "4Hz - 40kHz",
      "Battery Life": "40 hours",
      "Charging Time": "3 hours",
      "Weight": "250g",
      "Connectivity": "Bluetooth 5.0, USB-C"
    },
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'White', 'Silver'],
    shipping: {
      free: true,
      days: "2-3 business days",
      returnDays: 30
    }
  };

  const mockReviews: Review[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      rating: 5,
      date: "2025-01-15",
      title: "Absolutely Amazing!",
      comment: "The sound quality is incredible and the noise cancellation really works. Best purchase I've made this year!",
      verified: true
    },
    {
      id: 2,
      name: "Mike Chen",
      rating: 4,
      date: "2025-01-10",
      title: "Great value for money",
      comment: "Very comfortable to wear for long periods. The battery life is exactly as advertised.",
      verified: true
    },
    {
      id: 3,
      name: "Emily Davis",
      rating: 5,
      date: "2025-01-08",
      title: "Perfect for work",
      comment: "These headphones are perfect for working from home. The noise cancellation blocks out all distractions.",
      verified: true
    }
  ];

  const mockRelatedProducts = [
    {
      id: 2,
      name: "Wireless Earbuds Pro",
      price: 199,
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2132&q=80",
      rating: 4.6
    },
    {
      id: 3,
      name: "Studio Monitor Headphones",
      price: 349,
      image: "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
      rating: 4.9
    },
    {
      id: 4,
      name: "Gaming Headset RGB",
      price: 149,
      image: "https://images.unsplash.com/photo-1599669454699-248893623440?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      rating: 4.4
    }
  ];

  // --- Real Product Fetching Logic (Uncomment and implement when ready) ---
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError("Product ID is missing.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`http://localhost:5000/api/products/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Product = await response.json();
        setProductData(data);
        // Set initial selected image, size, color based on fetched data
        if (data.images && data.images.length > 0) setSelectedImage(0);
        if (data.sizes && data.sizes.length > 0) setSelectedSize(data.sizes[0]);
        if (data.colors && data.colors.length > 0) setSelectedColor(data.colors[0]);

      } catch (err: any) {
        console.error("Error fetching product:", err);
        setError("Failed to load product details. Please try again later.");
        setProductData(mockProduct); // Fallback to mock data on error for development
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]); // Re-fetch when ID changes

  // Use mock data if productData is null (e.g., during initial load or on error fallback)
  const product = productData || mockProduct;
  const reviews = mockReviews; // For now, reviews are static mock data
  const relatedProducts = mockRelatedProducts; // For now, related products are static mock data


  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, Math.min(product.stockCount, quantity + delta)));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-ivory flex items-center justify-center">
        <p className="text-gray-700">Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-soft-ivory">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <p className="text-red-600 text-lg">{error}</p>
          <Link to="/products" className="mt-4 inline-block">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-ivory">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm mb-6">
          <ol className="flex items-center space-x-2">
            <li><Link to="/" className="text-electric-aqua hover:underline">Home</Link></li>
            <li className="text-gray-400">/</li>
            {/* Dynamically link to category page */}
            <li><Link to={`/products/${product.category.toLowerCase().replace(/\s/g, '-')}`} className="text-electric-aqua hover:underline">{product.category}</Link></li>
            <li className="text-gray-400">/</li>
            <li className="text-charcoal-gray font-medium">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <ProductImageGallery
            images={product.images}
            selectedImage={selectedImage}
            discount={product.discount}
            productName={product.name}
            setSelectedImage={setSelectedImage}
          />

          {/* Product Info */}
          <ProductInfo
            product={product}
            quantity={quantity}
            selectedSize={selectedSize}
            selectedColor={selectedColor}
            handleQuantityChange={handleQuantityChange}
            setSelectedSize={setSelectedSize}
            setSelectedColor={setSelectedColor}
          />
        </div>

        {/* Product Details Tabs */}
        <ProductDetailsTabs product={product} reviewsData={reviews} />

        {/* Related Products */}
        <RelatedProductsSection products={relatedProducts} />
      </div>
    </div>
  );
};

export default ProductDetail;
