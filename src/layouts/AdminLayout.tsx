// C:\xampp\htdocs\aurora-commerce-hub\src\pages\Admin\AdminLayout.tsx
// OR C:\xampp\htdocs\aurora-commerce-hub\src\layouts\AdminLayout.tsx
// Choose the path that makes sense for your project structure.

import React from 'react';
import { Link } from 'react-router-dom';
// Ensure this path is correct for your Button component
// If your Button component is in src/components/ui/button, this path is correct.
import { Button } from '@/components/ui/button';

// Define the props that AdminLayout will accept.
// 'children' is a special prop in React that represents whatever
// you nest inside the component when you use it.
interface AdminLayoutProps {
  children: React.ReactNode; // React.ReactNode means it can be anything renderable (elements, strings, etc.)
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    // The main container for your admin layout.
    // 'min-h-screen' ensures it takes at least the full height of the viewport.
    <div className="min-h-screen bg-soft-ivory font-poppins text-charcoal-gray">
      {/* --- This is your shared Admin Navigation Header --- */}
      <header className="bg-deep-indigo text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-coral-pink rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
                <span className="text-xl font-bold">EcomStore Admin</span>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link to="/admin/dashboard" className="text-electric-aqua font-medium">Dashboard</Link>
              <Link to="/admin/products" className="hover:text-electric-aqua transition-colors">Products</Link>
              <Link to="/admin/orders" className="hover:text-electric-aqua transition-colors">Orders</Link>
              <Link to="/admin/users" className="hover:text-electric-aqua transition-colors">Users</Link>
              <Link to="/admin/categories" className="hover:text-electric-aqua transition-colors">Categories</Link>
              <Link to="/admin/coupons" className="hover:text-electric-aqua transition-colors">Coupons</Link>
              <Link to="/admin/feedback" className="hover:text-electric-aqua transition-colors">Chat</Link>

            </nav>

            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="border-white text-white hover:bg-white hover:text-deep-indigo">
                <Link to="/">View Store</Link>
              </Button>
              <div className="w-8 h-8 bg-coral-pink rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- This is where the specific page content (AdminOrders, AdminUsers, etc.) will be rendered --- */}
      {children}
    </div>
  );
};

export default AdminLayout;