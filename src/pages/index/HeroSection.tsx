import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button'; // Button is a global UI component

const HeroSection: React.FC = () => {
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

  // Effect for hero slider auto-play
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  return (
    <section className="relative h-64 md:h-[300px] overflow-hidden"> {/* Height reduced further here */}
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
                <h1 className="text-3xl md:text-5xl font-bold mb-2 animate-fade-in"> {/* Adjusted text size */}
                  {slide.title}
                </h1>
                <p className="text-base md:text-lg mb-4 animate-fade-in"> {/* Adjusted text size */}
                  {slide.subtitle}
                </p>
                <Link to={slide.link}>
                  <Button  className="bg-coral-pink hover:bg-coral-pink/90 text-white"> {/* Adjusted button size */}
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
  );
};

export default HeroSection;
