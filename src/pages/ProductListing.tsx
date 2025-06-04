
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Filter, Grid, List, Star, Heart, ShoppingCart, ChevronDown } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

const ProductListing = () => {
  const { category } = useParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState('newest');

  const products = [
    {
      id: 1,
      name: "Premium Wireless Headphones with Noise Cancellation",
      price: 299,
      originalPrice: 399,
      rating: 4.8,
      reviews: 124,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      category: "Electronics",
      discount: 25,
      inStock: true,
      brand: "AudioPro",
      description: "Experience crystal-clear audio with advanced noise cancellation technology."
    },
    {
      id: 2,
      name: "Designer Leather Jacket - Premium Quality",
      price: 199,
      originalPrice: 299,
      rating: 4.6,
      reviews: 89,
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      category: "Fashion",
      discount: 33,
      inStock: true,
      brand: "StyleCraft",
      description: "Genuine leather jacket with contemporary design and perfect fit."
    },
    {
      id: 3,
      name: "Modern Minimalist Table Lamp",
      price: 89,
      originalPrice: 129,
      rating: 4.7,
      reviews: 156,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      category: "Home Decor",
      discount: 31,
      inStock: true,
      brand: "LightCo",
      description: "Elegant design that complements any modern living space."
    },
    {
      id: 4,
      name: "Smart Fitness Watch with Health Monitoring",
      price: 249,
      originalPrice: 299,
      rating: 4.9,
      reviews: 203,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2099&q=80",
      category: "Electronics",
      discount: 17,
      inStock: true,
      brand: "FitTech",
      description: "Advanced fitness tracking with heart rate and sleep monitoring."
    },
    {
      id: 5,
      name: "Casual Cotton T-Shirt - Comfortable Fit",
      price: 29,
      originalPrice: 39,
      rating: 4.4,
      reviews: 67,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80",
      category: "Fashion",
      discount: 26,
      inStock: true,
      brand: "ComfortWear",
      description: "Soft, breathable cotton fabric perfect for everyday wear."
    },
    {
      id: 6,
      name: "Decorative Wall Art Set",
      price: 79,
      originalPrice: 99,
      rating: 4.5,
      reviews: 92,
      image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      category: "Home Decor",
      discount: 20,
      inStock: true,
      brand: "ArtSpace",
      description: "Beautiful abstract art prints to enhance your wall decor."
    }
  ];

  const getFilterOptions = () => {
    const currentCategory = category || 'all';
    
    const fashionFilters = {
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Black', 'White', 'Blue', 'Red', 'Green', 'Yellow'],
      styles: ['Casual', 'Formal', 'Sports', 'Vintage']
    };

    const electronicsFilters = {
      brands: ['Apple', 'Samsung', 'Sony', 'AudioPro', 'FitTech'],
      features: ['Wireless', 'Noise Cancellation', 'Waterproof', 'Fast Charging'],
      categories: ['Headphones', 'Smartphones', 'Laptops', 'Watches']
    };

    const homeDecorFilters = {
      rooms: ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Office'],
      materials: ['Wood', 'Metal', 'Glass', 'Fabric', 'Ceramic'],
      styles: ['Modern', 'Traditional', 'Minimalist', 'Industrial']
    };

    switch (currentCategory) {
      case 'fashion':
        return fashionFilters;
      case 'electronics':
        return electronicsFilters;
      case 'home-decor':
        return homeDecorFilters;
      default:
        return {};
    }
  };

  const ProductCard = ({ product }: { product: any }) => (
    <Card className="group overflow-hidden bg-white hover:shadow-lg transition-all duration-300">
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full ${viewMode === 'grid' ? 'h-48' : 'h-32'} object-cover group-hover:scale-105 transition-transform duration-300`}
        />
        <div className="absolute top-3 left-3 bg-coral-pink text-white px-2 py-1 rounded-lg text-sm font-medium">
          -{product.discount}%
        </div>
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" variant="outline" className="bg-white/90 hover:bg-white">
            <Heart className="w-4 h-4" />
          </Button>
        </div>
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-medium">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="text-xs text-electric-aqua font-medium mb-1">{product.brand}</div>
        <h3 className="font-semibold text-charcoal-gray mb-2 line-clamp-2">{product.name}</h3>
        {viewMode === 'list' && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
        )}
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-charcoal-gray ml-1">{product.rating}</span>
            <span className="text-xs text-gray-500 ml-1">({product.reviews} reviews)</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-deep-indigo">${product.price}</span>
            <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
          </div>
          <Button 
            size="sm" 
            className="bg-deep-indigo hover:bg-deep-indigo/90"
            disabled={!product.inStock}
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );

  const filteredProducts = products.filter(product => {
    if (category && category !== 'all') {
      const categoryMap: { [key: string]: string } = {
        'fashion': 'Fashion',
        'electronics': 'Electronics',
        'home-decor': 'Home Decor'
      };
      return product.category === categoryMap[category];
    }
    return true;
  });

  const filterOptions = getFilterOptions();

  return (
    <div className="min-h-screen bg-soft-ivory">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm mb-6">
          <ol className="flex items-center space-x-2">
            <li><Link to="/" className="text-electric-aqua hover:underline">Home</Link></li>
            <li className="text-gray-400">/</li>
            <li className="text-charcoal-gray font-medium">
              {category ? category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ') : 'All Products'}
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-charcoal-gray mb-2">
              {category ? category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ') : 'All Products'}
            </h1>
            <p className="text-gray-600">{filteredProducts.length} products found</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="discount">Biggest Discount</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex border rounded-lg bg-white">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-deep-indigo text-white' : ''}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-deep-indigo text-white' : ''}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Filter Toggle (Mobile) */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`w-full md:w-64 space-y-6 ${showFilters || window.innerWidth >= 768 ? 'block' : 'hidden'}`}>
            <Card className="p-6 bg-white">
              <h3 className="font-semibold text-charcoal-gray mb-4 flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </h3>
              
              {/* Price Range */}
              <div className="mb-6">
                <Label className="text-sm font-medium text-charcoal-gray mb-3 block">
                  Price Range: ${priceRange[0]} - ${priceRange[1]}
                </Label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={1000}
                  step={10}
                  className="w-full"
                />
              </div>

              {/* Category-specific filters */}
              {Object.entries(filterOptions).map(([filterType, options]) => (
                <div key={filterType} className="mb-6">
                  <Label className="text-sm font-medium text-charcoal-gray mb-3 block capitalize">
                    {filterType}
                  </Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {(options as string[]).map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox id={option} />
                        <Label htmlFor={option} className="text-sm text-gray-600">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Stock Status */}
              <div className="mb-6">
                <Label className="text-sm font-medium text-charcoal-gray mb-3 block">
                  Availability
                </Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="in-stock" />
                    <Label htmlFor="in-stock" className="text-sm text-gray-600">
                      In Stock
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="out-of-stock" />
                    <Label htmlFor="out-of-stock" className="text-sm text-gray-600">
                      Out of Stock
                    </Label>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-coral-pink hover:bg-coral-pink/90">
                Apply Filters
              </Button>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {filteredProducts.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`}>
                  <ProductCard product={product} />
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center space-x-2 mt-12">
              <Button variant="outline" disabled>Previous</Button>
              <Button className="bg-deep-indigo text-white">1</Button>
              <Button variant="outline">2</Button>
              <Button variant="outline">3</Button>
              <Button variant="outline">Next</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListing;
