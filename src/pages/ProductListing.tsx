import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navigation from '@/components/Navigation'; // Assuming this exists
import { Button } from '@/components/ui/button'; // Assuming this exists
import { Card } from '@/components/ui/card';     // Assuming this exists

// Import the new components
import ProductCard from './ProductListing/ProductCard';
import ProductFilters from './ProductListing/ProductFilters';
import ProductHeader from './ProductListing/ProductHeader';

// Define the Product interface to match your backend's output
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discount: number;
  stock: number;
  category: string; // Ensure this matches your backend's category field
  images: string[];
  originalPrice?: number;
  rating: number;
  reviews: number;
  brand?: string;
}

const ProductListing: React.FC = () => {
  const { category } = useParams<{ category?: string }>();

  // --- States for fetched products ---
  const [fetchedProducts, setFetchedProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  // --- Filter and Sort States (managed in ProductListing) ---
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  // Initial price range can be set more dynamically based on fetched products
  const [priceRange, setPriceRange] = useState([0, 1000]); // Assuming max price 1000 for demo
  const [sortBy, setSortBy] = useState('newest');
  const [inStockFilter, setInStockFilter] = useState<boolean | null>(null); // null: show all, true: in stock, false: out of stock

  // --- useEffect to fetch products from backend ---
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      setProductsError(null);
      try {
        // Adjust category param for URL: lowercase and replace spaces with hyphens
        const categoryParam = category ? category.toLowerCase().replace(/\s/g, '-') : 'all';
        const url = categoryParam === 'all'
          ? 'http://localhost:5000/api/products' // Endpoint for all products
          : `http://localhost:5000/api/products/category/${categoryParam}`; // Endpoint for specific category

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Product[] = await response.json();
        setFetchedProducts(data);

        // Optionally, dynamically set the initial price range based on fetched products
        if (data.length > 0) {
          const maxPrice = Math.max(...data.map(p => p.price));
          setPriceRange([0, Math.ceil(maxPrice)]); // Set max price to slightly above the highest product price
        } else {
          setPriceRange([0, 1000]); // Reset to default if no products
        }

      } catch (error: any) {
        console.error("Error fetching products:", error);
        setProductsError("Failed to load products. Please try again.");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [category]); // Re-fetch when the category changes in the URL

  // --- Memoized products after applying filters and sorting ---
  const displayedProducts = useMemo(() => {
    let tempProducts = [...fetchedProducts];

    // 1. Apply Price Range Filter
    tempProducts = tempProducts.filter(product =>
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // 2. Apply Stock Status Filter
    if (inStockFilter !== null) {
      tempProducts = tempProducts.filter(product => (product.stock > 0) === inStockFilter);
    }

    // 3. Apply Sorting
    tempProducts.sort((a, b) => {
      if (sortBy === 'newest') {
        return b.id - a.id; // Assuming higher ID means newer
      } else if (sortBy === 'price-low') {
        return a.price - b.price;
      } else if (sortBy === 'price-high') {
        return b.price - a.price;
      } else if (sortBy === 'rating') {
        // Handle undefined ratings by treating them as 0 for sorting purposes
        return (b.rating || 0) - (a.rating || 0);
      } else if (sortBy === 'discount') {
        return b.discount - a.discount;
      }
      return 0; // No change for unknown sort option
    });

    return tempProducts;
  }, [fetchedProducts, priceRange, sortBy, inStockFilter]);

  return (
    <div className="min-h-screen bg-soft-ivory">
      <Navigation /> {/* Assuming Navigation component exists and is imported */}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm mb-6">
          <ol className="flex items-center space-x-2">
            <li><Link to="/" className="text-electric-aqua hover:underline">Home</Link></li>
            <li className="text-gray-400">/</li>
            <li className="text-charcoal-gray font-medium">
              {/* Capitalize first letter and replace hyphens with spaces for display */}
              {category ? category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ') : 'All Products'}
            </li>
          </ol>
        </nav>

        {/* Product Header Component */}
        <ProductHeader
          category={category}
          productCount={displayedProducts.length}
          sortBy={sortBy}
          setSortBy={setSortBy}
          viewMode={viewMode}
          setViewMode={setViewMode}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
        />

        <div className="flex flex-col md:flex-row gap-8">
          {/* Product Filters Component */}
          <ProductFilters
            category={category}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            inStockFilter={inStockFilter}
            setInStockFilter={setInStockFilter}
          />

          {/* Products Grid / List Display */}
          <div className="flex-1">
            {loadingProducts ? (
              // Loading Skeleton
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {[...Array(viewMode === 'grid' ? 6 : 3)].map((_, index) => (
                  <Card key={index} className={`animate-pulse bg-gray-200 ${viewMode === 'grid' ? 'h-72' : 'h-48'}`}></Card>
                ))}
              </div>
            ) : productsError ? (
              // Error Message
              <p className="text-red-500 text-lg text-center">{productsError}</p>
            ) : displayedProducts.length === 0 ? (
              // No Products Found Message
              <p className="text-gray-500 text-lg text-center">No products found for this category or filter.</p>
            ) : (
              // Actual Product Cards
              <div className={`grid gap-6 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' // Grid layout
                  : 'grid-cols-1' // List layout (single column)
              }`}>
                {displayedProducts.map((product) => (
                  <Link key={product.id} to={`/product/${product.id}`}>
                    <ProductCard product={product} viewMode={viewMode} />
                  </Link>
                ))}
            </div>
            )}

            {/* Pagination (placeholder for now) */}
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