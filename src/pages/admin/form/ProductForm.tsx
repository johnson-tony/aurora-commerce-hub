import React, { useState, useEffect } from "react";
import { Product } from "../../../types/product"; // Ensure this path is correct

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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  // Effect to reset form state when opening/closing or changing product
  useEffect(() => {
    if (isOpen) {
      setSelectedFiles([]); // Clear selected files when opening the form
      setImageUploadError(null); // Clear any previous errors
      // You might also want to reset currentProduct if it's null when opening for 'add new'
      // But AdminProducts usually manages currentProduct state for new/edit
    }
  }, [isOpen, currentProduct]); // Add currentProduct to dependency array

  // Effect to clean up Object URLs when component unmounts or files change
  useEffect(() => {
    // Collect URLs to revoke from currently selected files
    const urlsToRevoke = selectedFiles.map((file) => URL.createObjectURL(file));

    // When the component unmounts, or selectedFiles changes, revoke old URLs
    return () => {
      urlsToRevoke.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedFiles]); // Re-run this effect when selectedFiles changes

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setCurrentProduct((prevProduct) => {
      if (!prevProduct) return null;
      return { ...prevProduct, [name]: type === "checkbox" ? checked : value };
    });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentProduct((prevProduct) => {
      if (!prevProduct) return null;
      // Use Number() for better handling of empty string to 0 or parseFloat for price
      return {
        ...prevProduct,
        [name]:
          name === "price"
            ? parseFloat(value || "0")
            : parseInt(value || "0", 10),
      };
    });
  };

  const handleStockChange = (delta: number) => {
    setCurrentProduct((prevProduct) => {
      if (!prevProduct) return null;
      return {
        ...prevProduct,
        stock: Math.max(0, (prevProduct.stock || 0) + delta),
      };
    });
  };

  // --- Image Handling ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUploadError(null); // Clear previous errors
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const validFiles = filesArray.filter((file) => {
        const isValidType =
          file.type.startsWith("image/jpeg") ||
          file.type.startsWith("image/png");
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB

        if (!isValidType) {
          setImageUploadError(
            `File ${file.name} is not a valid image type (PNG/JPG).`
          );
          return false;
        }
        if (!isValidSize) {
          setImageUploadError(`File ${file.name} exceeds the 5MB size limit.`);
          return false;
        }
        return true;
      });
      setSelectedFiles((prevFiles) => [...prevFiles, ...validFiles]);
      // Clear the input value so the same file can be selected again after removal
      e.target.value = "";
    }
  };

  const handleRemoveExistingImage = (imageUrlToRemove: string) => {
    setCurrentProduct((prevProduct) => {
      if (!prevProduct) return null;
      return {
        ...prevProduct,
        images: prevProduct.images.filter((img) => img !== imageUrlToRemove),
      };
    });
  };

  const handleRemoveNewFile = (fileToRemove: File) => {
    setSelectedFiles((prevFiles) =>
      prevFiles.filter((file) => file !== fileToRemove)
    );
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Essential to allow drop
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setImageUploadError(null); // Clear previous errors on drop
    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const validDroppedFiles = droppedFiles.filter((file) => {
        const isValidType =
          file.type.startsWith("image/jpeg") ||
          file.type.startsWith("image/png");
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB

        if (!isValidType) {
          setImageUploadError(
            `File ${file.name} is not a valid image type (PNG/JPG).`
          );
          return false;
        }
        if (!isValidSize) {
          setImageUploadError(`File ${file.name} exceeds the 5MB size limit.`);
          return false;
        }
        return true;
      });
      setSelectedFiles((prevFiles) => [...prevFiles, ...validDroppedFiles]);
    }
  };

  const uploadImagesToServer = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return [];

    setUploadingImages(true);
    setImageUploadError(null); // Clear error before new upload attempt
    const uploadedImageUrls: string[] = [];

    // Assuming your backend expects 'productImage' as the field name
    const backendUploadEndpoint = `http://localhost:${5000}/api/upload/image`; // Ensure this matches your backend

    for (const file of files) {
      const formData = new FormData();
      formData.append("productImage", file); // <--- Make sure this matches backend multer.single() field name

      try {
        const response = await fetch(backendUploadEndpoint, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to upload image ${file.name}: ${response.statusText} - ${errorText}`
          );
        }
        const data = await response.json();
        // Assuming your backend returns an object with an 'imageUrl' property
        if (data.imageUrl) {
          uploadedImageUrls.push(data.imageUrl);
        } else {
          throw new Error(`Upload response missing imageUrl for ${file.name}`);
        }
      } catch (error: any) {
        console.error("Error uploading image:", error);
        setImageUploadError(`Error uploading ${file.name}: ${error.message}`);
        // If an error occurs, you might want to stop further uploads or just log.
        // For this example, we log the error and allow others to proceed.
        // But if `imageUploadError` is set, the form submission will be blocked.
      }
    }
    setUploadingImages(false);
    return uploadedImageUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct) return;

    let newImageUrls: string[] = [];
    if (selectedFiles.length > 0) {
      newImageUrls = await uploadImagesToServer(selectedFiles);
      if (imageUploadError) {
        // If there was an error during upload, block form submission
        return;
      }
    }

    const finalProductData = {
      ...currentProduct,
      // Combine existing images (if editing) with newly uploaded ones
      images: isEditing
        ? [...(currentProduct.images || []), ...newImageUrls]
        : newImageUrls,
    };

    // Ensure price and discount are numbers, even if they were empty strings
    finalProductData.price = parseFloat(String(finalProductData.price)) || 0;
    finalProductData.discount =
      parseFloat(String(finalProductData.discount)) || 0;
    finalProductData.stock = parseInt(String(finalProductData.stock)) || 0;

    onSubmit(finalProductData); // Call the parent onSubmit with the product data including image URLs
  };

  if (!isOpen) return null;

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
                    flex flex-col
                    ${
                      isOpen
                        ? "scale-100 opacity-100"
                        : "scale-95 opacity-0 pointer-events-none"
                    }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#333]">
            {isEditing ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            {/* Close Icon (SVG) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form content */}
        <div className="flex-1 overflow-y-auto py-6 -mx-6 px-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Product Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Product Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={currentProduct?.name || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-[#4B0082] focus:border-[#4B0082]"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={currentProduct?.description || ""}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-[#4B0082] focus:border-[#4B0082]"
                />
              </div>

              {/* Price & Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Price ($)
                  </label>
                  <input
                    type="text"
                    id="price"
                    name="price"
                    min="0"
                    step="0.01"
                    value={currentProduct?.price || ""}
                    onChange={handleNumberChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-[#4B0082] focus:border-[#4B0082]"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="discount"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Discount (%)
                  </label>
                  <input
                    type="text"
                    id="discount"
                    name="discount"
                    min="0"
                    max="100"
                    value={currentProduct?.discount || ""}
                    onChange={handleNumberChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-[#4B0082] focus:border-[#4B0082]"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category
                </label>
                <div className="relative">
                  <select
                    id="category"
                    name="category"
                    value={currentProduct?.category || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl appearance-none focus:ring-[#4B0082] focus:border-[#4B0082]"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    {/* Dropdown Icon (SVG) */}
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Stock */}
              <div>
                <label
                  htmlFor="stock"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Stock Quantity
                </label>
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
                <label
                  htmlFor="available"
                  className="block text-sm font-medium text-gray-700"
                >
                  Availability
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="available"
                    name="available"
                    checked={currentProduct?.available || false}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div
                    className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer
                                 peer-checked:after:translate-x-full peer-checked:after:border-white
                                 after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                                 after:bg-white after:border-gray-300 after:border after:rounded-full
                                 after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4B0082]"
                  ></div>
                </label>
              </div>

              {/* Image Upload Area */}
              <div>
                <label
                  htmlFor="file-upload"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Product Images
                </label>
                <div
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 rounded-xl
                              ${
                                isDragging
                                  ? "border-[#4B0082] bg-indigo-50"
                                  : "border-dashed"
                              }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="space-y-1 text-center">
                    {uploadingImages ? (
                      <p className="text-sm text-gray-500">
                        Uploading images...
                      </p>
                    ) : (
                      <>
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-[#4B0082] hover:text-[#4B0082]/80 focus-within:outline-none"
                          >
                            <span>Upload images</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              multiple
                              onChange={handleFileChange}
                              accept=".png,.jpg,.jpeg" // Restrict file types
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG up to 5MB
                        </p>
                      </>
                    )}
                    {imageUploadError && (
                      <p className="text-xs text-red-500 mt-2">
                        {imageUploadError}
                      </p>
                    )}
                  </div>
                </div>

                {/* Image Previews Section */}
                {(currentProduct?.images?.length > 0 ||
                  selectedFiles.length > 0) && (
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    {/* Existing Images */}
                    {isEditing &&
                      currentProduct?.images &&
                      currentProduct.images.map((imageUrl, index) => (
                        <div
                          key={`existing-${imageUrl}-${index}`}
                          className="relative group overflow-hidden rounded-lg shadow-sm"
                        >
                          <img
                            src={imageUrl}
                            alt={`Product Image ${index + 1}`}
                            className="w-full h-24 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(imageUrl)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove existing image"
                          >
                            &times;
                          </button>
                          <span className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity truncate">
                            {imageUrl.substring(imageUrl.lastIndexOf("/") + 1)}{" "}
                            {/* Show filename */}
                          </span>
                        </div>
                      ))}

                    {/* New Files */}
                    {selectedFiles.map((file, index) => (
                      <div
                        key={`new-${file.name}-${index}`}
                        className="relative group overflow-hidden rounded-lg shadow-sm"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-24 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveNewFile(file)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove new image"
                        >
                          &times;
                        </button>
                        <span className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity truncate">
                          {file.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions (Buttons) */}
            <div className="mt-6 flex justify-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
                disabled={uploadingImages}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-[#4B0082] text-white rounded-xl hover:bg-[#4B0082]/90
                                 transition-all duration-300 hover:shadow-md"
                disabled={uploadingImages}
              >
                {uploadingImages
                  ? "Uploading Images..."
                  : isEditing
                  ? "Update Product"
                  : "Add Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
