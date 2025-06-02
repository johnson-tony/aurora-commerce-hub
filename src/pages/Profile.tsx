
import Navigation from '@/components/Navigation';

const Profile = () => {
  return (
    <div className="min-h-screen bg-soft-ivory">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-charcoal-gray mb-8">Profile</h1>
        <p className="text-gray-600">User profile management will be implemented here.</p>
      </div>
    </div>
  );
};

export default Profile;
