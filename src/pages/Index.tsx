
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star, Heart, ShoppingCart } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Index = () => {
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  const heroSlides = [
    {
      title: "Fashion Forward 2025",
      subtitle: "Discover the latest trends in fashion",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      cta: "Shop Fashion",
      link: "/products/fashion"
    },
    {
      title: "Tech That Matters",
      subtitle: "Latest electronics and gadgets",
      image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      cta: "Shop Electronics",
      link: "/products/electronics"
    },
    {
      title: "Beautiful Homes",
      subtitle: "Transform your space with our decor",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2158&q=80",
      cta: "Shop Home Decor",
      link: "/products/home-decor"
    }
  ];

  const categories = [
    {
      name: "Fashion",
      description: "Latest trends & styles",
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80",
      link: "/products/fashion",
      items: "2000+ items"
    },
    {
      name: "Electronics",
      description: "Cutting-edge technology",
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      link: "/products/electronics",
      items: "500+ items"
    },
    {
      name: "Home Decor",
      description: "Beautiful living spaces",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      link: "/products/home-decor",
      items: "1200+ items"
    }
  ];

  const featuredProducts = [
    {
      id: 1,
      name: "Premium Wireless Headphones",
      price: 299,
      originalPrice: 399,
      rating: 4.8,
      reviews: 124,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      category: "Electronics",
      discount: 25
    },
    {
      id: 2,
      name: "Designer Leather Jacket",
      price: 199,
      originalPrice: 299,
      rating: 4.6,
      reviews: 89,
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      category: "Fashion",
      discount: 33
    },
    {
      id: 3,
      name: "Modern Table Lamp",
      price: 89,
      originalPrice: 129,
      rating: 4.7,
      reviews: 156,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      category: "Home Decor",
      discount: 31
    },
    {
      id: 4,
      name: "Smart Fitness Watch",
      price: 249,
      originalPrice: 299,
      rating: 4.9,
      reviews: 203,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2099&q=80",
      category: "Electronics",
      discount: 17
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const ProductCard = ({ product }: { product: any }) => (
    <Card className="group overflow-hidden bg-soft-ivory hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 bg-coral-pink text-white px-2 py-1 rounded-lg text-sm font-medium">
          -{product.discount}%
        </div>
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" variant="outline" className="bg-white/90 hover:bg-white">
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="p-4">
        <div className="text-xs text-electric-aqua font-medium mb-1">{product.category}</div>
        <h3 className="font-semibold text-charcoal-gray mb-2 line-clamp-2">{product.name}</h3>
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-charcoal-gray ml-1">{product.rating}</span>
            <span className="text-xs text-gray-500 ml-1">({product.reviews})</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-deep-indigo">${product.price}</span>
            <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
          </div>
          <Button size="sm" className="bg-deep-indigo hover:bg-deep-indigo/90">
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-soft-ivory">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative h-96 md:h-[500px] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-transform duration-500 ${
              index === currentHeroSlide ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="relative h-full">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="text-center text-white px-4">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
                    {slide.title}
                  </h1>
                  <p className="text-lg md:text-xl mb-8 animate-fade-in">
                    {slide.subtitle}
                  </p>
                  <Link to={slide.link}>
                    <Button size="lg" className="bg-coral-pink hover:bg-coral-pink/90 text-white">
                      {slide.cta}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Hero Navigation */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentHeroSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentHeroSlide ? 'bg-coral-pink' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-charcoal-gray mb-8 text-center">Shop by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link key={category.name} to={category.link} className="group">
              <Card className="overflow-hidden bg-white hover:shadow-xl transition-all duration-300">
                <div className="relative h-48">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-bold mb-1">{category.name}</h3>
                    <p className="text-sm opacity-90">{category.description}</p>
                    <p className="text-xs opacity-75 mt-1">{category.items}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-charcoal-gray">Featured Products</h2>
          <Link to="/products" className="text-electric-aqua hover:underline">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <Link key={product.id} to={`/product/${product.id}`}>
              <ProductCard product={product} />
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-deep-indigo text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-lg mb-8 opacity-90">
            Get the latest deals and new arrivals delivered to your inbox
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-charcoal-gray"
            />
            <Button className="bg-coral-pink hover:bg-coral-pink/90">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
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

      {/* Floating Chat Support */}
      <div className="fixed bottom-6 right-6 z-50">
      <Link to="/live-chat"> 
        <Button
          size="lg"
          className="rounded-full w-14 h-14 bg-coral-pink hover:bg-coral-pink/90 shadow-lg"
        >
          <span className="text-lg">💬</span>
        </Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;
