// C:\xampp\htdocs\aurora-commerce-hub\src\pages\admin\form\ProductForm.tsx

import React from 'react';
import { Product } from '../../../types/product'; // Ensure this path is correct

// Define the props that ProductForm will accept
interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: Product) => void;
  currentProduct: Product | null;
  isEditing: boolean;
  categories: string[];
  setCurrentProduct: React.Dispatch<React.SetStateAction<Product | null>>;
}

const ProductForm: React.FC<ProductFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentProduct,
  isEditing,
  categories,
  setCurrentProduct,
}) => {
  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setCurrentProduct(prevProduct => {
      if (!prevProduct) return null;
      return { ...prevProduct, [name]: type === 'checkbox' ? checked : value };
    });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentProduct(prevProduct => {
      if (!prevProduct) return null;
      return {
        ...prevProduct,
        [name]: name === 'price' ? parseFloat(value) : parseInt(value, 10) || 0,
      };
    });
  };

  const handleStockChange = (delta: number) => {
    setCurrentProduct(prevProduct => {
      if (!prevProduct) return null;
      return { ...prevProduct, stock: Math.max(0, (prevProduct.stock || 0) + delta) };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentProduct) {
      onSubmit(currentProduct);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Background overlay */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Main pop-up container */}
      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                    w-full max-w-lg max-h-[90vh] bg-white rounded-lg shadow-xl
                    transform transition-all duration-300 ease-in-out p-6
                    flex flex-col {/* Added flex-col to enable internal scrolling */}
                    ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#333]">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            {/* Close Icon (SVG) */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form content - THIS IS THE KEY CHANGE FOR SCROLLING */}
        <div className="flex-1 overflow-y-auto py-6 -mx-6 px-6"> {/* py-6 for top/bottom padding, -mx-6 and px-6 to offset scrollbar */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Product Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={currentProduct?.name || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-[#4B0082] focus:border-[#4B0082]"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={currentProduct?.description || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-[#4B0082] focus:border-[#4B0082]"
                />
              </div>

              {/* Price & Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    min="0"
                    step="0.01"
                    value={currentProduct?.price || 0}
                    onChange={handleNumberChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-[#4B0082] focus:border-[#4B0082]"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                  <input
                    type="number"
                    id="discount"
                    name="discount"
                    min="0"
                    max="100"
                    value={currentProduct?.discount || 0}
                    onChange={handleNumberChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-[#4B0082] focus:border-[#4B0082]"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <div className="relative">
                  <select
                    id="category"
                    name="category"
                    value={currentProduct?.category || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl appearance-none focus:ring-[#4B0082] focus:border-[#4B0082]"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    {/* Dropdown Icon (SVG) */}
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Stock */}
              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => handleStockChange(-1)}
                    className="px-3 py-1 bg-gray-200 rounded-l-lg hover:bg-gray-300"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    min="0"
                    value={currentProduct?.stock || 0}
                    onChange={handleNumberChange}
                    className="flex-1 px-4 py-2 border-t border-b border-gray-300 text-center"
                  />
                  <button
                    type="button"
                    onClick={() => handleStockChange(1)}
                    className="px-3 py-1 bg-gray-200 rounded-r-lg hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Availability */}
              <div className="flex items-center justify-between">
                <label htmlFor="available" className="block text-sm font-medium text-gray-700">Availability</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="available"
                    name="available"
                    checked={currentProduct?.available || false}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer
                                   peer-checked:after:translate-x-full peer-checked:after:border-white
                                   after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                                   after:bg-white after:border-gray-300 after:border after:rounded-full
                                   after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4B0082]">
                  </div>
                </label>
              </div>

              {/* Image Upload */}
              <div>
                <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl">
                  <div className="space-y-1 text-center">
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#4B0082] hover:text-[#4B0082]/80 focus-within:outline-none">
                        <span>Upload images</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions (Buttons) */}
            <div className="mt-6 flex justify-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-[#4B0082] text-white rounded-xl hover:bg-[#4B0082]/90
                                 transition-all duration-300 hover:shadow-md"
              >
                {isEditing ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;