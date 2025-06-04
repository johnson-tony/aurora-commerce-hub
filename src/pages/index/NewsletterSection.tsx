import React from 'react';
import { Button } from '@/components/ui/button'; // Assuming Button is imported from shadcn/ui or similar

const NewsletterSection: React.FC = () => {
  return (
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
  );
};

export default NewsletterSection;
