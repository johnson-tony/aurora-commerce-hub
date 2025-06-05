// src/components/auth/ProtectedRoute.tsx
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Import useAuth hook

interface ProtectedRouteProps {
  children: ReactNode; // The component(s) that this route protects
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loadingAuth } = useAuth(); // Get auth state and loading state

  // While checking auth status, you might show a loading spinner
  if (loadingAuth) {
    return (
      <div className="flex justify-center items-center h-screen bg-header-light">
        <p className="text-text-dark">Loading authentication...</p> {/* Or a proper spinner */}
      </div>
    );
  }

  // If not authenticated, redirect to the login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />; // 'replace' prevents going back to the protected route
  }

  // If authenticated, render the children (the protected component)
  return <>{children}</>;
};