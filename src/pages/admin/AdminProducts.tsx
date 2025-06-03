// C:\xampp\htdocs\aurora-commerce-hub\src\pages\admin\AdminProducts.tsx

import { useState, useEffect } from 'react';
import ProductForm from './form/ProductForm';
import { Product } from '../../types/product'; // Ensure this path is correct

const AdminProducts = () => {
  // State variables
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState(['Electronics', 'Clothing', 'Home', 'Beauty', 'Sports']);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Mock data - in a real app, you'd fetch this from an API
  useEffect(() => {
    const mockProducts: Product[] = [
      {
        id: 1,
        name: 'Wireless Headphones',
        price: 129.99,
        discount: 15,
        stock: 42,
        category: 'Electronics',
        available: true,
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop'],
        description: 'High-quality wireless headphones with noise cancellation.'
      },
      {
        id: 2,
        name: 'Organic Cotton T-Shirt',
        price: 29.99,
        discount: 0,
        stock: 15,
        category: 'Clothing',
        available: true,
        images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop'],
        description: 'Soft and comfortable organic cotton t-shirt.'
      },
      {
        id: 3,
        name: 'Ceramic Coffee Mug',
        price: 19.99,
        discount: 10,
        stock: 0,
        category: 'Home',
        available: false,
        images: ['https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=500&auto=format&fit=crop'],
        description: 'Stylish ceramic mug for your daily coffee.'
      },
      {
        id: 4,
        name: 'Vitamin C Serum',
        price: 34.99,
        discount: 5,
        stock: 28,
        category: 'Beauty',
        available: true,
        images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop'],
        description: 'Brightening serum for a healthy glow.'
      },
    ];
    setProducts(mockProducts);
  }, []);

  // Event handler to open the drawer for adding a new product
  const handleAddProduct = () => {
    setCurrentProduct({
      id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
      name: '',
      description: '',
      price: 0,
      discount: 0,
      stock: 0,
      category: '',
      available: true,
      images: []
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
  const handleDeleteProduct = (productId: number) => {
    setProducts(products.filter(product => product.id !== productId));
  };

  // Event handler to toggle product availability
  const toggleAvailability = (productId: number) => {
    setProducts(products.map(product =>
      product.id === productId ? { ...product, available: !product.available } : product
    ));
  };

  // Event handler for submitting the product form (add/edit)
  const handleProductFormSubmit = (product: Product) => {
    if (isEditing) {
      setProducts(products.map(p =>
        p.id === product.id ? product : p
      ));
    } else {
      setProducts([...products, product]);
    }
    setIsDrawerOpen(false);
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

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg
                        transition-all duration-300 hover:-translate-y-1 relative"
            >
              {/* Product Image */}
              <div className="h-48 overflow-hidden relative">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.discount > 0 && (
                  <div className="absolute top-3 right-3 bg-[#FF6B6B] text-white px-2 py-1
                                  rounded-full text-xs font-bold">
                    {product.discount}% OFF
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-[#333]">{product.name}</h3>
                  <div className="text-right">
                    {product.discount > 0 ? (
                      <>
                        <span className="text-[#FF6B6B] font-bold">${(product.price * (1 - product.discount / 100)).toFixed(2)}</span>
                        <span className="text-gray-400 line-through text-sm ml-2">${product.price.toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="font-bold text-[#333]">${product.price.toFixed(2)}</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                  <span className="bg-[#F0F0F0] px-2 py-1 rounded-full">{product.category}</span>
                  <span className={product.stock > 0 ? "text-green-600" : "text-red-600"}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={product.available}
                        onChange={() => toggleAvailability(product.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer
                                       peer-checked:after:translate-x-full peer-checked:after:border-white
                                       after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                                       after:bg-white after:border-gray-300 after:border after:rounded-full
                                       after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4B0082]">
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        {product.available ? 'Active' : 'Inactive'}
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
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zm-3.116 10.092a.5.5 0 01-.137.561l-3.32 3.32a.5.5 0 01-.707 0l-1.5-1.5a.5.5 0 010-.707l3.32-3.32a.5.5 0 01.561-.137l2.828 2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 bg-[#F0F0F0] rounded-full hover:bg-[#FF6B6B] hover:text-white
                                     transition-all duration-300"
                    >
                      {/* Delete Icon (SVG) */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm1 3a1 1 0 100 2h4a1 1 0 100-2H8z" clipRule="evenodd" />
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