import React from 'react'; // Only React is needed here for JSX
import { Link } from 'react-router-dom';
// Global components
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button'; // Button is still used for the chat button
// Page-specific components (from the 'index' subfolder)
import HeroSection from './index/HeroSection';
import CategorySection from './index/CategorySection';
import FeaturedProductsSection from './index/FeaturedProductsSection';
import NewsletterSection from './index/NewsletterSection';
const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-soft-ivory">
      <Navigation />
      <HeroSection/>
      <CategorySection />
      <FeaturedProductsSection />
      <NewsletterSection />
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






