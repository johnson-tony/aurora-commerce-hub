import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, X, LogIn, LogOut } from 'lucide-react'; // Import LogOut icon
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '../context/AuthContext'; // <--- Import useAuth

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth(); // <--- Get auth state and logout function

  const categories = [
    { name: 'Fashion', path: '/products/fashion' },
    { name: 'Electronics', path: '/products/electronics' },
    { name: 'Home Decor', path: '/products/home-decor' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-header-light text-text-dark sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <span className="text-accent-blue font-bold text-xl">E</span>
            </div>
            <span className="text-xl font-bold text-text-dark">EcomStore</span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-icon-grey w-5 h-5" />
              <Input
                type="search"
                placeholder="Search products across fashion, electronics, home decor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-search-bar-light text-text-dark border border-transparent rounded-lg focus:ring-2 focus:ring-accent-blue placeholder-icon-grey"
              />
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/wishlist"
              className="flex items-center space-x-1 text-text-dark hover:text-accent-blue transition-colors text-sm"
            >
              <Heart className="w-5 h-5 text-icon-grey" />
              <span>Wishlist</span>
            </Link>
            <Link
              to="/cart"
              className="flex items-center space-x-1 text-text-dark hover:text-accent-blue transition-colors relative text-sm"
            >
              <ShoppingCart className="w-5 h-5 text-icon-grey" />
              <span>Cart</span>
              <span className="absolute -top-2 -right-2 bg-accent-blue text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </Link>

            {/* Conditional rendering based on authentication status */}
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center space-x-1 text-text-dark hover:text-accent-blue transition-colors text-sm"
                >
                  <User className="w-5 h-5 text-icon-grey" />
                  <span>{user?.name || 'Profile'}</span> {/* Display user name if available */}
                </Link>
                <button
                  onClick={logout} // <--- Call logout function from context
                  className="flex items-center space-x-1 text-text-dark hover:text-accent-blue transition-colors text-sm bg-transparent border-none cursor-pointer"
                >
                  <LogOut className="w-5 h-5 text-icon-grey" />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1 text-text-dark hover:text-accent-blue transition-colors text-sm"
              >
                <LogIn className="w-5 h-5 text-icon-grey" />
                <span>Log In</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-search-bar-light rounded-lg text-icon-grey"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Category Links - These are typically text-text-dark with accent-blue on hover/active */}
        <div className="hidden md:flex items-center space-x-8 pb-3 border-t border-border-light pt-3">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={category.path}
              className={`text-sm font-medium ${isActive(category.path) ? 'text-accent-blue' : 'text-text-dark'} hover:text-accent-blue transition-colors`}
            >
              {category.name}
            </Link>
          ))}
          <Link
            to="/orders"
            className={`text-sm font-medium ${isActive('/orders') ? 'text-accent-blue' : 'text-text-dark'} hover:text-accent-blue transition-colors`}
          >
            My Orders
          </Link>
          <Link
            to="/support"
            className={`text-sm font-medium ${isActive('/support') ? 'text-accent-blue' : 'text-text-dark'} hover:text-accent-blue transition-colors`}
          >
            Support
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-header-light border-t border-border-light">
          <div className="px-4 py-3 space-y-3">
            {/* Mobile Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-icon-grey w-5 h-5" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-search-bar-light text-text-dark border border-border-light rounded-lg placeholder-icon-grey"
              />
            </div>

            {/* Mobile Navigation Links */}
            <div className="space-y-2">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  to={category.path}
                  className="block py-2 text-text-dark hover:text-accent-blue transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
              <Link
                to="/wishlist"
                className="block py-2 text-text-dark hover:text-accent-blue transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Wishlist
              </Link>
              <Link
                to="/cart"
                className="block py-2 text-text-dark hover:text-accent-blue transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Cart
              </Link>
              <Link
                to="/orders"
                className="block py-2 text-text-dark hover:text-accent-blue transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                My Orders
              </Link>
              <Link
                to="/profile"
                className="block py-2 text-text-dark hover:text-accent-blue transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {user?.name || 'Profile'} {/* Display user name */}
              </Link>
              <Link
                to="/support"
                className="block py-2 text-text-dark hover:text-accent-blue transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Support
              </Link>
              {/* Conditional rendering for Login/Logout in mobile menu */}
              {isAuthenticated ? (
                <button
                  onClick={() => { logout(); setIsMenuOpen(false); }}
                  className="block w-full text-left py-2 text-text-dark hover:text-accent-blue transition-colors bg-transparent border-none cursor-pointer"
                >
                  Log Out
                </button>
              ) : (
                <Link
                  to="/login"
                  className="block py-2 text-text-dark hover:text-accent-blue transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;