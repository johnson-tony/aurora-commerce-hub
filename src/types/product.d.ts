// C:\xampp\htdocs\aurora-commerce-hub\src\types\product.d.ts

// Define the type for a product for consistent use across components
export interface Product {
  id: number;
  name: string;
  description: string; // Ensure this is present if your forms expect it
  price: number;
  discount: number;
  stock: number;
  category: string;
  available: boolean;
  images: string[];
}