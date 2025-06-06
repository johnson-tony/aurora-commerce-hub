import React from 'react';
import { Card } from '@/components/ui/card'; // Adjust path if necessary
import { Button } from '@/components/ui/button'; // Adjust path if necessary
import { X, SlidersHorizontal } from 'lucide-react'; // For close button and filter icon
import { Input } from '@/components/ui/input'; // Assuming you have an Input component
import { Label } from '@/components/ui/label'; // Assuming you have a Label component
import { Slider } from '@/components/ui/slider'; // Assuming you have a Slider component from shadcn/ui

interface ProductFiltersProps {
  category?: string;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
  inStockFilter: boolean | null;
  setInStockFilter: (value: boolean | null) => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  category,
  showFilters,
  setShowFilters,
  priceRange,
  setPriceRange,
  inStockFilter,
  setInStockFilter,
}) => {
  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
  };

  return (
    <>
      {/* Overlay for mobile filter sidebar */}
      {showFilters && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setShowFilters(false)}
        ></div>
      )}

      {/* Filter Sidebar */}
      <Card
        className={`fixed top-0 left-0 h-full w-64 bg-white z-50 transform md:relative md:translate-x-0 md:w-auto md:flex-shrink-0
          ${showFilters ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:static md:block`}
      >
        <div className="p-4 border-b flex justify-between items-center md:hidden">
          <h4 className="font-semibold text-lg">Filters</h4>
          <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4">
          <h4 className="font-semibold text-charcoal-gray mb-4">Price Range</h4>
          <div className="mb-4">
            <Slider
              min={0}
              max={1000} // Adjust max based on your product data
              step={1}
              value={priceRange}
              onValueChange={handlePriceChange}
              className="w-full"
            />
            <div className="flex justify-between text-sm mt-2">
              <span>${priceRange[0].toFixed(0)}</span>
              <span>${priceRange[1].toFixed(0)}</span>
            </div>
          </div>

          <h4 className="font-semibold text-charcoal-gray mb-4 mt-6">Stock Status</h4>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="radio"
                id="stock-all"
                name="stock"
                className="mr-2"
                checked={inStockFilter === null}
                onChange={() => setInStockFilter(null)}
              />
              <Label htmlFor="stock-all">All</Label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="stock-in"
                name="stock"
                className="mr-2"
                checked={inStockFilter === true}
                onChange={() => setInStockFilter(true)}
              />
              <Label htmlFor="stock-in">In Stock</Label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="stock-out"
                name="stock"
                className="mr-2"
                checked={inStockFilter === false}
                onChange={() => setInStockFilter(false)}
              />
              <Label htmlFor="stock-out">Out of Stock</Label>
            </div>
          </div>

          {/* Add more filter options here (e.g., Brand, Rating, etc.) */}
          <h4 className="font-semibold text-charcoal-gray mb-4 mt-6">Brand</h4>
          <Input type="text" placeholder="Search brands..." className="mb-2" />
          {/* Example brand checkboxes */}
          <div className="space-y-2">
            <div className="flex items-center">
              <input type="checkbox" id="brand-a" className="mr-2" />
              <Label htmlFor="brand-a">Brand A</Label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="brand-b" className="mr-2" />
              <Label htmlFor="brand-b">Brand B</Label>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};

export default ProductFilters;