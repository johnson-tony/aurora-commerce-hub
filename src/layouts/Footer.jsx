// C:\xampp\htdocs\aurora-commerce-hub\src\layouts\Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Assuming you are using react-router-dom for navigation

const Footer = () => {
  return (
    <footer className="bg-charcoal-gray text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">EcomStore</h3>
            <p className="text-gray-300 text-sm">
              Your one-stop destination for fashion, electronics, and home decor.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products/fashion" className="text-gray-300 hover:text-electric-aqua">Fashion</Link></li>
              <li><Link to="/products/electronics" className="text-gray-300 hover:text-electric-aqua">Electronics</Link></li>
              <li><Link to="/products/home-decor" className="text-gray-300 hover:text-electric-aqua">Home Decor</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/support" className="text-gray-300 hover:text-electric-aqua">Contact Us</Link></li>
              <li><Link to="/orders" className="text-gray-300 hover:text-electric-aqua">Track Order</Link></li>
              <li><a href="#" className="text-gray-300 hover:text-electric-aqua">Returns</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-electric-aqua">Facebook</a>
              <a href="#" className="text-gray-300 hover:text-electric-aqua">Twitter</a>
              <a href="#" className="text-gray-300 hover:text-electric-aqua">Instagram</a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-300">
          © 2025 EcomStore. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;