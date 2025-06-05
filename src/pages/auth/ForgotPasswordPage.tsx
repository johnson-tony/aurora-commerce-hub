// src/pages/auth/ForgotPasswordPage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'If an account with that email exists, a password reset link has been sent.');
        toast.success(data.message || 'Reset link sent if email found!');
        // In development, you might want to log the devLink from the backend response
        if (data.devLink) {
            console.log("DEV LINK:", data.devLink);
        }
      } else {
        setError(data.message || 'Failed to send password reset link.');
        toast.error(data.message || 'Failed to send reset link!');
      }
    } catch (err) {
      console.error('Network error during forgot password request:', err);
      setError('A network error occurred. Please try again.');
      toast.error('A network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-header-light">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md border border-border-light">
        <h2 className="text-2xl font-bold text-center text-text-dark">Forgot Password</h2>
        <p className="text-sm text-center text-icon-grey">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          {message && <p className="text-green-600 text-sm text-center">{message}</p>}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <Button
            type="submit"
            className="w-full bg-accent-blue text-white hover:bg-accent-blue/90"
            disabled={loading}
          >
            {loading ? 'Sending Link...' : 'Send Reset Link'}
          </Button>
        </form>
        <p className="text-sm text-center text-icon-grey">
          Remembered your password?{' '}
          <Link to="/login" className="text-accent-blue hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;