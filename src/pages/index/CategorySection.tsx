import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// Removed Card import as it's no longer used for individual category items
// import { Card } from '@/components/ui/card';

// Define a type for your category data for better type safety
interface Category {
  id: number;
  name: string;
  image: string;
  display_order: number;
  // Add other properties if your backend sends them, e.g., description, items
}

const CategorySection: React.FC = () => {
  // State for categories fetched from the backend
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // useEffect to fetch categories from your backend
  useEffect(() => {
    const fetchCategoriesFromBackend = async () => {
      try {
        setLoadingCategories(true); // Start loading
        setCategoriesError(null); // Clear previous errors

        // Your Node.js public API endpoint for categories
        const response = await fetch('http://localhost:5000/api/categories');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: Category[] = await response.json(); // Type assertion for fetched data
        setCategories(data); // Update the state with fetched categories
      } catch (error: any) { // Use 'any' or check 'error instanceof Error'
        console.error("Error fetching categories:", error);
        setCategoriesError("Failed to load categories. Please try again later.");
      } finally {
        setLoadingCategories(false); // End loading
      }
    };

    fetchCategoriesFromBackend(); // Call the fetch function when the component mounts
  }, []); // Empty dependency array means this runs once after the initial render

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      {loadingCategories ? (
        <p className="text-center text-gray-700">Loading categories...</p>
      ) : categoriesError ? (
        <p className="text-center text-red-600">{categoriesError}</p>
      ) : categories.length === 0 ? (
        <p className="text-center text-gray-700">No categories found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products/${category.name.toLowerCase().replace(/\s/g, '-')}`}
              className="group flex flex-col items-center text-center p-2 rounded-lg transition-all duration-300 hover:bg-gray-100 hover:shadow-md"
            >
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden mb-2">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Optional overlay for text readability */}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-charcoal-gray group-hover:text-deep-indigo transition-colors">
                {category.name}
              </h3>
              {/* Removed category.items as it's not provided by your API */}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default CategorySection;
