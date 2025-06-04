import React, { useState, useEffect, useCallback } from "react";
import ProductForm from "./form/ProductForm"; // Adjust path if necessary
import { Product } from "../../types/product"; // Adjust path if necessary

// SVG Icon for Edit (Pencil)
const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-gray-600 hover:text-[#4B0082]"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zm-3.109 3.107L3.107 13.586A2 2 0 002 15v2a1 1 0 001 1h2a2 2 0 001.414-.586l7.303-7.303-2.828-2.828z" />
  </svg>
);

// SVG Icon for Delete (Trash Can)
const DeleteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-gray-600 hover:text-red-600"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
      clipRule="evenodd"
    />
  </svg>
);

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [categories, setCategories] = useState<string[]>([]); // State for categories

  // Function to fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:5000/api/admin/products");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Product[] = await response.json();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch products");
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to fetch categories (for ProductForm dropdown)
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/categories"
      ); // Your categories endpoint
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCategories(data.map((cat: { name: string }) => cat.name));
    } catch (err: any) {
      console.error("Failed to fetch categories:", err);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const handleAddProduct = () => {
    setCurrentProduct({
      id: 0, // Temp ID for new product
      name: "",
      description: "",
      price: 0,
      discount: 0,
      stock: 0,
      category: "",
      available: true,
      images: [],
    });
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/products/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      fetchProducts();
    } catch (err: any) {
      setError(err.message || "Failed to delete product");
      console.error("Failed to delete product:", err);
    }
  };

  const handleProductFormSubmit = async (productData: Product) => {
    setError(null);
    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing
        ? `http://localhost:5000/api/admin/products/${productData.id}`
        : "http://localhost:5000/api/admin/products";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      fetchProducts();
      setIsFormOpen(false);
      setCurrentProduct(null);
    } catch (err: any) {
      setError(err.message || "Failed to save product");
      console.error("Failed to save product:", err);
    }
  };

  if (loading)
    return <div className="text-center py-8">Loading products...</div>;
  if (error)
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Admin Products</h1>
          <button
            onClick={handleAddProduct}
            className="px-6 py-2 bg-[#4B0082] text-white rounded-lg shadow-md hover:bg-[#4B0082]/90 transition-colors"
          >
            Add New Product
          </button>
        </div>

        {/* Products Grid (Card Style - Image & Name only with icons) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="relative bg-white rounded-lg shadow-md overflow-hidden transform transition-transform duration-200 hover:scale-105 hover:shadow-lg"
            >
              {/* Product Image */}
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-40 object-cover" // Slightly reduced height for image
                />
              ) : (
                <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                  No Image
                </div>
              )}

              {/* Product Name and Icons */}
              <div className="p-3 flex justify-between items-center">
                <h3 className="text-md font-semibold text-gray-800 truncate">
                  {product.name}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click if there's one
                      handleEditProduct(product);
                    }}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label={`Edit ${product.name}`}
                  >
                    <EditIcon />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click if there's one
                      handleDeleteProduct(product.id);
                    }}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label={`Delete ${product.name}`}
                  >
                    <DeleteIcon />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Form Modal */}
      <ProductForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleProductFormSubmit}
        currentProduct={currentProduct}
        isEditing={isEditing}
        categories={categories}
        setCurrentProduct={setCurrentProduct}
      />
    </div>
  );
};

export default AdminProducts;
