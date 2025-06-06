import React from 'react';
import { Button } from '@/components/ui/button'; // Adjust path if necessary
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'; // Assuming you have these from shadcn/ui
import { Grid, List, SlidersHorizontal } from 'lucide-react'; // Icons for view mode and filter toggle

interface ProductHeaderProps {
  category?: string;
  productCount: number;
  sortBy: string;
  setSortBy: (sort: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({
  category,
  productCount,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  setShowFilters,
}) => {
  const displayCategoryName = category
    ? category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')
    : 'All Products';

  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-charcoal-gray mb-4 md:mb-0">
        {displayCategoryName}
      </h1>

      <div className="flex items-center space-x-4">
        {/* Filter Toggle for Mobile */}
        <Button
          variant="outline"
          className="md:hidden"
          onClick={() => setShowFilters(true)}
        >
          <SlidersHorizontal className="h-5 w-5 mr-2" /> Filters
        </Button>

        {/* Product Count */}
        <span className="text-gray-600 text-sm md:text-base">
          {productCount} products found
        </span>

        {/* Sort By Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center">
              Sort By: <span className="font-medium ml-1">{sortBy === 'newest' ? 'Newest' : sortBy === 'price-low' ? 'Price: Low to High' : sortBy === 'price-high' ? 'Price: High to Low' : sortBy === 'rating' ? 'Rating' : sortBy === 'discount' ? 'Discount' : 'Newest'}</span>
              <svg
                className="ml-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSortBy('newest')}>Newest</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('price-low')}>Price: Low to High</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('price-high')}>Price: High to Low</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('rating')}>Rating</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('discount')}>Discount</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View Mode Toggle */}
        <div className="flex border rounded-md overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-none ${viewMode === 'grid' ? 'bg-gray-100 text-deep-indigo' : 'text-gray-500'}`}
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
          >
            <Grid className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-none ${viewMode === 'list' ? 'bg-gray-100 text-deep-indigo' : 'text-gray-500'}`}
            onClick={() => setViewMode('list')}
            aria-label="List view"
          >
            <List className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductHeader;