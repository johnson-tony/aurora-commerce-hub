// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// 1. Define the shape of your authentication context state
interface AuthContextType {
  isAuthenticated: boolean;
  user: { id: number; name: string; email: string } | null;
  token: string | null;
  login: (userData: { id: number; name: string; email: string }, userToken: string) => void;
  logout: () => void;
  loadingAuth: boolean; // Added loading state for initial token check
}

// 2. Create the context with a default (null) value
// We use a type assertion here because the actual value will be provided by AuthProvider
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Create the AuthProvider component
interface AuthProviderProps {
  children: ReactNode; // Represents the child components that will consume the context
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true); // Initially true

  // On component mount, check for existing token and user in localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user'); // This should be a JSON string of the user object

    if (storedToken && storedUser) {
      try {
        // Attempt to parse the stored user data
        const parsedUser = JSON.parse(storedUser);

        // Basic validation for parsedUser to ensure it matches expected structure
        if (parsedUser && typeof parsedUser.id === 'number' &&
            typeof parsedUser.name === 'string' && typeof parsedUser.email === 'string') {
          setToken(storedToken);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } else {
          // If stored user data is malformed, clear it
          console.warn("Stored user data was malformed, clearing it.");
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          setUser(null);
          setToken(null);
        }
      } catch (e) {
        console.error("Error parsing stored user data or token:", e);
        // If parsing fails (e.g., malformed JSON), clear storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
      }
    }
    setLoadingAuth(false); // Authentication check is complete
  }, []); // Run only once on mount

  // Function to handle user login
  const login = (userData: { id: number; name: string; email: string }, userToken: string) => {
    setIsAuthenticated(true);
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('authToken', userToken);
    localStorage.setItem('user', JSON.stringify(userData)); // Store user data as a JSON string
  };

  // Function to handle user logout
  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken'); // Clear token from localStorage
    localStorage.removeItem('user'); // Clear user data
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout, loadingAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. Custom hook to consume the AuthContext
// This hook provides a convenient way for components to access the auth state and functions.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // This error helps catch bugs where useAuth is called outside of an AuthProvider
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};