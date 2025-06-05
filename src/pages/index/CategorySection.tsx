import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Category {
  id: number;
  name: string;
  image: string;
  display_order: number;
}

const CategorySection: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategoriesFromBackend = async () => {
      try {
        setLoadingCategories(true);
        setCategoriesError(null);
        const response = await fetch('http://localhost:5000/api/categories');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data: Category[] = await response.json();
        setCategories(data);
      } catch (error: any) {
        console.error("Error fetching categories:", error);
        setCategoriesError("Failed to load categories");
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategoriesFromBackend();
  }, []);

  return (
    <section className="max-w-7xl mx-auto bg-white py-4">
      <div className="flex overflow-x-auto hide-scrollbar px-4">
        {loadingCategories ? (
          <div className="flex space-x-8">
            {[...Array(10)].map((_, index) => (
              <div key={index} className="flex flex-col items-center min-w-[80px]">
                <div className="w-16 h-16 bg-gray-200 rounded-md mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : categoriesError ? (
          <p className="text-red-500 text-sm px-4">{categoriesError}</p>
        ) : categories.length === 0 ? (
          <p className="text-gray-500 text-sm px-4">No categories available</p>
        ) : (
          <div className="flex space-x-8">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products/${category.name.toLowerCase().replace(/\s/g, '-')}`}
                className="flex flex-col items-center min-w-[80px] group"
              >
                <div className="w-16 h-16 bg-white rounded-md mb-2 overflow-hidden flex items-center justify-center p-1">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-xs font-medium text-gray-800 text-center group-hover:text-blue-500">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategorySection;