
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  const categories = [
    { name: 'Fashion', path: '/products/fashion' },
    { name: 'Electronics', path: '/products/electronics' },
    { name: 'Home Decor', path: '/products/home-decor' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-deep-indigo text-white sticky top-0 z-50 shadow-lg">
      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-coral-pink rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-bold">EcomStore</span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-gray w-5 h-5" />
              <Input
                type="text"
                placeholder="Search products across fashion, electronics, home decor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-soft-ivory text-charcoal-gray border-0 rounded-lg focus:ring-2 focus:ring-electric-aqua"
              />
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/wishlist"
              className="flex items-center space-x-1 hover:text-electric-aqua transition-colors"
            >
              <Heart className="w-5 h-5" />
              <span>Wishlist</span>
            </Link>
            <Link
              to="/cart"
              className="flex items-center space-x-1 hover:text-electric-aqua transition-colors relative"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Cart</span>
              <span className="absolute -top-2 -right-2 bg-coral-pink text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </Link>
            <Link
              to="/profile"
              className="flex items-center space-x-1 hover:text-electric-aqua transition-colors"
            >
              <User className="w-5 h-5" />
              <span>Profile</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-deep-indigo/80 rounded-lg"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Category Links */}
        <div className="hidden md:flex items-center space-x-8 pb-3 border-t border-deep-indigo/20 pt-3">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={category.path}
              className={`text-sm font-medium hover:text-electric-aqua transition-colors ${
                isActive(category.path) ? 'text-electric-aqua' : ''
              }`}
            >
              {category.name}
            </Link>
          ))}
          <Link
            to="/orders"
            className={`text-sm font-medium hover:text-electric-aqua transition-colors ${
              isActive('/orders') ? 'text-electric-aqua' : ''
            }`}
          >
            My Orders
          </Link>
          <Link
            to="/support"
            className={`text-sm font-medium hover:text-electric-aqua transition-colors ${
              isActive('/support') ? 'text-electric-aqua' : ''
            }`}
          >
            Support
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-deep-indigo border-t border-deep-indigo/20">
          <div className="px-4 py-3 space-y-3">
            {/* Mobile Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-gray w-5 h-5" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-soft-ivory text-charcoal-gray border-0 rounded-lg"
              />
            </div>

            {/* Mobile Navigation Links */}
            <div className="space-y-2">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  to={category.path}
                  className="block py-2 hover:text-electric-aqua transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
              <Link
                to="/wishlist"
                className="block py-2 hover:text-electric-aqua transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Wishlist
              </Link>
              <Link
                to="/cart"
                className="block py-2 hover:text-electric-aqua transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Cart
              </Link>
              <Link
                to="/orders"
                className="block py-2 hover:text-electric-aqua transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                My Orders
              </Link>
              <Link
                to="/profile"
                className="block py-2 hover:text-electric-aqua transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>
              <Link
                to="/support"
                className="block py-2 hover:text-electric-aqua transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Support
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
