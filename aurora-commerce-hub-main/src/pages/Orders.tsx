
import Navigation from '@/components/Navigation';

const Orders = () => {
  return (
    <div className="min-h-screen bg-soft-ivory">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-charcoal-gray mb-8">My Orders</h1>
        <p className="text-gray-600">Order history will be displayed here.</p>
      </div>
    </div>
  );
};

export default Orders;
