import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Minus, Plus, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';

const ProductDetail = () => {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Black');

  // Mock product data
  const product = {
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

  const reviews = [
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

  const relatedProducts = [
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

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, Math.min(product.stockCount, quantity + delta)));
  };

  return (
    <div className="min-h-screen bg-soft-ivory">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm mb-6">
          <ol className="flex items-center space-x-2">
            <li><Link to="/" className="text-electric-aqua hover:underline">Home</Link></li>
            <li className="text-gray-400">/</li>
            <li><Link to="/products/electronics" className="text-electric-aqua hover:underline">Electronics</Link></li>
            <li className="text-gray-400">/</li>
            <li className="text-charcoal-gray font-medium">Headphones</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative bg-white rounded-lg overflow-hidden group">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
              <div className="absolute top-4 left-4">
                <Badge className="bg-coral-pink text-white">
                  -{product.discount}% OFF
                </Badge>
              </div>
              <button
                onClick={() => setSelectedImage(Math.max(0, selectedImage - 1))}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={selectedImage === 0}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSelectedImage(Math.min(product.images.length - 1, selectedImage + 1))}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={selectedImage === product.images.length - 1}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            {/* Thumbnail Images */}
            <div className="flex space-x-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-electric-aqua' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="text-sm text-electric-aqua font-medium mb-2">{product.brand}</div>
              <h1 className="text-3xl font-bold text-charcoal-gray mb-4">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm font-medium">{product.rating}</span>
                </div>
                <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
                <button className="text-sm text-electric-aqua hover:underline">Write a review</button>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-deep-indigo">${product.price}</span>
                <span className="text-xl text-gray-500 line-through">${product.originalPrice}</span>
                <Badge className="bg-coral-pink text-white">Save ${product.originalPrice - product.price}</Badge>
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {product.inStock ? (
                  <div className="flex items-center text-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                    <span className="text-sm font-medium">In Stock ({product.stockCount} available)</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <div className="w-2 h-2 bg-red-600 rounded-full mr-2"></div>
                    <span className="text-sm font-medium">Out of Stock</span>
                  </div>
                )}
              </div>
            </div>

            {/* Product Variants */}
            {product.colors && (
              <div>
                <Label className="text-sm font-medium text-charcoal-gray mb-3 block">Color</Label>
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
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div>
              <Label className="text-sm font-medium text-charcoal-gray mb-3 block">Quantity</Label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 border-x">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stockCount}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  {product.stockCount} available
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex space-x-4">
                <Button 
                  size="lg" 
                  className="flex-1 bg-deep-indigo hover:bg-deep-indigo/90"
                  disabled={!product.inStock}
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
                disabled={!product.inStock}
              >
                Buy Now
              </Button>
            </div>

            {/* Shipping Info */}
            <Card className="p-4 bg-white">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-charcoal-gray">Shipping</span>
                  <span className="text-sm font-medium text-green-600">
                    {product.shipping.free ? 'Free' : '$9.99'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-charcoal-gray">Delivery</span>
                  <span className="text-sm font-medium">{product.shipping.days}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-charcoal-gray">Returns</span>
                  <span className="text-sm font-medium">{product.shipping.returnDays} days</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Card className="mb-16 bg-white">
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
                    {product.features.map((feature, index) => (
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
                    {Object.entries(product.specifications).map(([key, value]) => (
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
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-charcoal-gray">{review.name}</span>
                          {review.verified && (
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
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <h4 className="font-medium text-charcoal-gray mb-2">{review.title}</h4>
                    <p className="text-gray-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="shipping" className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-charcoal-gray mb-4">Shipping Information</h3>
                  <div className="space-y-3 text-sm text-gray-600">
                    <p>• Free shipping on orders over $99</p>
                    <p>• Standard delivery: 3-5 business days</p>
                    <p>• Express delivery: 1-2 business days (+$15)</p>
                    <p>• Order by 2 PM for same-day processing</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-charcoal-gray mb-4">Returns & Exchanges</h3>
                  <div className="space-y-3 text-sm text-gray-600">
                    <p>• 30-day return policy</p>
                    <p>• Items must be in original condition</p>
                    <p>• Free return shipping on defective items</p>
                    <p>• Exchanges processed within 2-3 business days</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Related Products */}
        <section>
          <h2 className="text-2xl font-bold text-charcoal-gray mb-8">Related Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProducts.map((product) => (
              <Link key={product.id} to={`/product/${product.id}`}>
                <Card className="group overflow-hidden bg-white hover:shadow-lg transition-all duration-300">
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-charcoal-gray mb-2">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-deep-indigo">${product.price}</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-charcoal-gray ml-1">{product.rating}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductDetail;
