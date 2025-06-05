// src/pages/auth/LoginPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner'; // Assuming you use sonner for toasts

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user, data.token);
        console.log('Login successful:', data);
        toast.success("Logged in successfully!"); // Add a success toast
        navigate('/');
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
        toast.error(data.message || 'Login failed!'); // Add an error toast
      }
    } catch (err) {
      console.error('Network error during login:', err);
      setError('A network error occurred. Please try again.');
      toast.error('A network error occurred.'); // Add an error toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-header-light">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md border border-border-light">
        <h2 className="text-2xl font-bold text-center text-text-dark">Log In</h2>
        <form onSubmit={handleLogin} className="space-y-4">
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
          {/* Add the Forgot Password link here */}
          <div className="text-right text-sm">
            <Link to="/forgot-password" className="text-accent-blue hover:underline">
              Forgot Password?
            </Link>
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <Button
            type="submit"
            className="w-full bg-accent-blue text-white hover:bg-accent-blue/90"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </Button>
        </form>
        <p className="text-sm text-center text-icon-grey">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent-blue hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;