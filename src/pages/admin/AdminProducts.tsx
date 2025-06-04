import { useState, useEffect } from "react";
import ProductForm from "./form/ProductForm";
import { Product } from "../../types/product"; // Ensure this path is correct

const AdminProducts = () => {
  // State variables
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState<string | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(true); // New loading state for products
  const [errorProducts, setErrorProducts] = useState<string | null>(null); // New error state for products

  // --- Fetch Categories from Backend ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        setErrorCategories(null);
        const response = await fetch(
          "http://localhost:5000/api/admin/categories"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const categoryNames = data.map((cat: { name: string }) => cat.name);
        setCategories(categoryNames);
      } catch (error: any) {
        console.error("Error fetching categories:", error);
        setErrorCategories(`Failed to load categories: ${error.message}`);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // --- Fetch Products from Backend ---
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      setErrorProducts(null);
      const response = await fetch("http://localhost:5000/api/admin/products");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProducts(data);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      setErrorProducts(`Failed to load products: ${error.message}`);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts(); // Call fetchProducts when component mounts
  }, []);

  // Event handler to open the drawer for adding a new product
  const handleAddProduct = () => {
    // No need for client-side ID generation if DB handles it
    setCurrentProduct({
      id: 0, // Placeholder, actual ID will come from DB
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
    setIsDrawerOpen(true);
  };

  // Event handler to open the drawer for editing an existing product
  const handleEditProduct = (product: Product) => {
    setCurrentProduct({ ...product });
    setIsEditing(true);
    setIsDrawerOpen(true);
  };

  // Event handler to delete a product
  const handleDeleteProduct = async (productId: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/products/${productId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // If successful, update state to remove the product
      setProducts(products.filter((product) => product.id !== productId));
      console.log("Product deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting product:", error);
      alert(`Failed to delete product: ${error.message}`);
    }
  };

  // Event handler to toggle product availability
  const toggleAvailability = async (product: Product) => {
    const updatedAvailability = !product.available;
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/products/${product.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...product, available: updatedAvailability }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // If successful, update state
      setProducts(
        products.map((p) =>
          p.id === product.id ? { ...p, available: updatedAvailability } : p
        )
      );
      console.log(`Product availability toggled for ID: ${product.id}`);
    } catch (error: any) {
      console.error("Error toggling product availability:", error);
      alert(`Failed to toggle product availability: ${error.message}`);
    }
  };

  // Event handler for submitting the product form (add/edit)
  const handleProductFormSubmit = async (product: Product) => {
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing
      ? `http://localhost:5000/api/admin/products/${product.id}`
      : "http://localhost:5000/api/admin/products";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        // Attempt to parse JSON error message from backend
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      // Re-fetch products after successful operation to ensure UI is in sync with DB
      // This is generally safer than optimistic updates for complex forms
      await fetchProducts();
      setIsDrawerOpen(false);
      console.log(`Product ${isEditing ? "updated" : "added"} successfully!`);
    } catch (error: any) {
      console.error(
        `Error ${isEditing ? "updating" : "adding"} product:`,
        error
      );
      alert(
        `Failed to ${isEditing ? "update" : "add"} product: ${error.message}`
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F6F2] font-['Inter']">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#333]">Product Management</h1>
          <button
            onClick={handleAddProduct}
            className="bg-[#4B0082] text-white px-6 py-2 rounded-full font-medium
                      hover:shadow-lg hover:shadow-[#4B0082]/30 transition-all duration-300
                      flex items-center gap-2"
          >
            Add Product
          </button>
        </div>

        {/* Display loading or error messages for categories */}
        {loadingCategories && (
          <p className="text-center text-gray-500">Loading categories...</p>
        )}
        {errorCategories && (
          <p className="text-center text-red-500">{errorCategories}</p>
        )}

        {/* Display loading or error messages for products */}
        {loadingProducts && (
          <p className="text-center text-gray-500">Loading products...</p>
        )}
        {errorProducts && (
          <p className="text-center text-red-500">{errorProducts}</p>
        )}

        {/* Product Grid */}
        {!loadingProducts && !errorProducts && products.length === 0 && (
          <p className="text-center text-gray-600 mt-8">
            No products found. Add a new product!
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {!loadingProducts &&
            !errorProducts &&
            products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg
                        transition-all duration-300 hover:-translate-y-1 relative"
              >
                {/* Product Image */}
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={
                      product.images && product.images.length > 0
                        ? product.images[0]
                        : "https://via.placeholder.com/150?text=No+Image"
                    }
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.discount > 0 && (
                    <div
                      className="absolute top-3 right-3 bg-[#FF6B6B] text-white px-2 py-1
                                  rounded-full text-xs font-bold"
                    >
                      {product.discount}% OFF
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-[#333]">
                      {product.name}
                    </h3>
                    <div className="text-right">
                      {product.discount > 0 ? (
                        <>
                          <span className="text-[#FF6B6B] font-bold">
                            $
                            {(
                              product.price *
                              (1 - product.discount / 100)
                            ).toFixed(2)}
                          </span>
                          <span className="text-gray-400 line-through text-sm ml-2">
                            ${product.price.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="font-bold text-[#333]">
                          ${product.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                    <span className="bg-[#F0F0F0] px-2 py-1 rounded-full">
                      {product.category}
                    </span>
                    <span
                      className={
                        product.stock > 0 ? "text-green-600" : "text-red-600"
                      }
                    >
                      {product.stock > 0
                        ? `${product.stock} in stock`
                        : "Out of stock"}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={product.available}
                          onChange={() => toggleAvailability(product)} // Pass entire product
                          className="sr-only peer"
                        />
                        <div
                          className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer
                                      peer-checked:after:translate-x-full peer-checked:after:border-white
                                      after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                                      after:bg-white after:border-gray-300 after:border after:rounded-full
                                      after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4B0082]"
                        ></div>
                        <span className="ml-2 text-sm font-medium text-gray-700">
                          {product.available ? "Active" : "Inactive"}
                        </span>
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="p-2 bg-[#F0F0F0] rounded-full hover:bg-[#4B0082] hover:text-white
                                  transition-all duration-300"
                      >
                        {/* Edit Icon (SVG) */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zm-3.116 10.092a.5.5 0 01-.137.561l-3.32 3.32a.5.5 0 01-.707 0l-1.5-1.5a.5.5 0 010-.707l3.32-3.32a.5.5 0 01.561-.137l2.828 2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 bg-[#F0F0F0] rounded-full hover:bg-[#FF6B6B] hover:text-white
                                  transition-all duration-300"
                      >
                        {/* Delete Icon (SVG) */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm1 3a1 1 0 100 2h4a1 1 0 100-2H8z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Product Form Drawer rendered as a separate component */}
      <ProductForm
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
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
