import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// The path for Card is still relative to your project's root or alias
import { Card } from '@/components/ui/card';

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
    <section className="max-w-7xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-charcoal-gray mb-8 text-center">Shop by Category</h2>
      {loadingCategories ? (
        <p className="text-center text-gray-700">Loading categories...</p>
      ) : categoriesError ? (
        <p className="text-center text-red-600">{categoriesError}</p>
      ) : categories.length === 0 ? (
        <p className="text-center text-gray-700">No categories found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category) => (
            // Use category.id for the key (unique from DB)
            // Link to a dynamic path using category name (slugified)
            <Link key={category.id} to={`/products/${category.name.toLowerCase().replace(/\s/g, '-')}`} className="group">
              <Card className="overflow-hidden bg-white hover:shadow-xl transition-all duration-300">
                <div className="relative h-48">
                  <img
                    src={category.image} // Use the 'image' field from your SQLite DB
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-bold mb-1">{category.name}</h3>
                    {/* The 'items' count is not directly available from your current API.
                        You would need a separate API endpoint to fetch item counts per category,
                        or include it in the category object if your backend provides it.
                        For now, this line is removed or can be a placeholder. */}
                    {/* <p className="text-xs opacity-75 mt-1">{category.items}</p> */}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default CategorySection;
