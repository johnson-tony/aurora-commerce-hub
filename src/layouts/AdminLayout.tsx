// C:\xampp\htdocs\aurora-commerce-hub\src\pages\Admin\AdminLayout.tsx
// OR C:\xampp\htdocs\aurora-commerce-hub\src\layouts\AdminLayout.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button'; // Ensure this path is correct

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    // Use the new page background and primary text color
    <div className="min-h-screen bg-admin-page-bg font-poppins text-admin-text-primary">
      {/* --- This is your shared Admin Navigation Header --- */}
      {/* Use the new header background */}
      <header className="bg-admin-header-bg text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                {/* Use the new logo accent color */}
                <div className="w-8 h-8 bg-admin-logo-accent rounded-lg flex items-center justify-center">
                  <span className="text-admin-text-primary font-bold text-lg">E</span> {/* Text inside logo should be primary text color */}
                </div>
                <span className="text-xl font-bold">EcomStore Admin</span>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-6">
              {/* Use the new link accent color for active/hover states */}
              <Link to="/admin/dashboard" className="text-admin-link-accent font-medium">Dashboard</Link>
              <Link to="/admin/products" className="hover:text-admin-link-accent transition-colors">Products</Link>
              <Link to="/admin/orders" className="hover:text-admin-link-accent transition-colors">Orders</Link>
              <Link to="/admin/users" className="hover:text-admin-link-accent transition-colors">Users</Link>
              <Link to="/admin/categories" className="hover:text-admin-link-accent transition-colors">Categories</Link>
              <Link to="/admin/coupons" className="hover:text-admin-link-accent transition-colors">Coupons</Link>
              <Link to="/admin/feedback" className="hover:text-admin-link-accent transition-colors">Chat</Link>
            </nav>

            <div className="flex items-center space-x-4">
              {/* Adjust button styling to fit the new palette */}
              <Button variant="outline" size="sm" className="border-admin-button-outline-text text-admin-button-outline-text hover:bg-admin-button-outline-hover-bg hover:text-admin-header-bg">
                <Link to="/">View Store</Link>
              </Button>
              {/* Use the new logo accent color for the admin initial */}
              <div className="w-8 h-8 bg-admin-logo-accent rounded-full flex items-center justify-center">
                <span className="text-admin-text-primary text-sm font-medium">A</span> {/* Text inside initial should be primary text color */}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- This is where the specific page content will be rendered --- */}
      {children}
    </div>
  );
};

export default AdminLayout;