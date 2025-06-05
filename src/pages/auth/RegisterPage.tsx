// src/pages/auth/RegisterPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState(''); // NEW: State for phone number
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // UPDATED: Include phone in the request body
        body: JSON.stringify({ name, email, password, phone }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Registration successful:', data);
        navigate('/login'); // Redirect to login page after successful registration
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Network error during registration:', err);
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-header-light">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md border border-border-light">
        <h2 className="text-2xl font-bold text-center text-text-dark">Register</h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-dark mb-1">
              Name
            </label>
            <Input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              required
              className="bg-search-bar-light text-text-dark border-border-light focus:ring-accent-blue"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-dark mb-1">
              Email
            </label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="bg-search-bar-light text-text-dark border-border-light focus:ring-accent-blue"
            />
          </div>
          {/* NEW: Phone Number Input */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-text-dark mb-1">
              Phone Number
            </label>
            <Input
              type="tel" // Use type="tel" for phone numbers
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              // `required` attribute removed as per your table schema allowing NULL
              className="bg-search-bar-light text-text-dark border-border-light focus:ring-accent-blue"
            />
          </div>
          {/* END NEW */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-dark mb-1">
              Password
            </label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="bg-search-bar-light text-text-dark border-border-light focus:ring-accent-blue"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-dark mb-1">
              Confirm Password
            </label>
            <Input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="bg-search-bar-light text-text-dark border-border-light focus:ring-accent-blue"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <Button
            type="submit"
            className="w-full bg-accent-blue text-white hover:bg-accent-blue/90"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </form>
        <p className="text-sm text-center text-icon-grey">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-blue hover:underline">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;