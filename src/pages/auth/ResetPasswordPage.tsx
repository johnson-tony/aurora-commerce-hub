// src/pages/auth/ResetPasswordPage.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Extract the token from the URL query parameters
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    } else {
      setError('No reset token found in the URL.');
      toast.error('No reset token found.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!token) {
      setError('Missing password reset token.');
      toast.error('Missing reset token.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      toast.error('Passwords do not match.');
      return;
    }

    if (password.length < 6) { // Basic password length validation
        setError('Password must be at least 6 characters long.');
        toast.error('Password too short.');
        return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Your password has been reset successfully!');
        toast.success(data.message || 'Password reset successful!');
        setTimeout(() => {
          navigate('/login'); // Redirect to login page after successful reset
        }, 3000); // Redirect after 3 seconds
      } else {
        setError(data.message || 'Failed to reset password. The token might be invalid or expired.');
        toast.error(data.message || 'Password reset failed!');
      }
    } catch (err) {
      console.error('Network error during password reset:', err);
      setError('A network error occurred. Please try again.');
      toast.error('A network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (!token && !error) { // Show loading until token is processed or error is set
      return (
        <div className="flex justify-center items-center min-h-[calc(100vh-64px)] bg-header-light">
            <p className="text-text-dark">Loading...</p>
        </div>
      );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-header-light">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md border border-border-light">
        <h2 className="text-2xl font-bold text-center text-text-dark">Reset Password</h2>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        {message && <p className="text-green-600 text-sm text-center">{message}</p>}

        {!message && !error && ( // Only show form if no success message or critical error
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-dark mb-1">
                  New Password
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
                  Confirm New Password
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
              <Button
                type="submit"
                className="w-full bg-accent-blue text-white hover:bg-accent-blue/90"
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;