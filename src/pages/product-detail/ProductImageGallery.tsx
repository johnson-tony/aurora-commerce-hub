import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge'; // Assuming Badge is a global UI component

// Define props for ProductImageGallery
interface ProductImageGalleryProps {
  images: string[];
  selectedImage: number;
  discount: number;
  productName: string;
  setSelectedImage: (index: number) => void;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  selectedImage,
  discount,
  productName,
  setSelectedImage,
}) => {
  return (
    <div className="space-y-4">
      <div className="relative bg-white rounded-lg overflow-hidden group">
        <img
          src={images[selectedImage]}
          alt={`${productName} - Image ${selectedImage + 1}`}
          className="w-full h-96 object-cover"
        />
        {discount > 0 && (
          <div className="absolute top-4 left-4">
            <Badge className="bg-coral-pink text-white">
              -{discount}% OFF
            </Badge>
          </div>
        )}
        <button
          onClick={() => setSelectedImage(Math.max(0, selectedImage - 1))}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
          disabled={selectedImage === 0}
          aria-label="Previous image"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setSelectedImage(Math.min(images.length - 1, selectedImage + 1))}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
          disabled={selectedImage === images.length - 1}
          aria-label="Next image"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Thumbnail Images */}
      <div className="flex space-x-4 overflow-x-auto pb-2"> {/* Added overflow-x-auto for many thumbnails */}
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
              selectedImage === index ? 'border-electric-aqua' : 'border-gray-200'
            }`}
          >
            <img
              src={image}
              alt={`${productName} thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductImageGallery;
