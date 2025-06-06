// src/auth/AuthContext.tsx

import React, { createContext, useState, useEffect, useContext } from "react";

// Define the CurrentUser interface here, or import it if defined elsewhere
interface CurrentUser {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
}

interface AuthContextType {
  currentUser: CurrentUser | null;
  loadingAuth: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      const storedToken = localStorage.getItem("authToken");
      const storedUserId = localStorage.getItem("loggedInUserId"); // Still useful for initial load validation

      if (storedToken) {
        // Only need token if /api/profile is authenticated
        try {
          // RECOMMENDED: Fetch user details directly using the token
          const response = await fetch("http://localhost:5000/api/profile", {
            headers: { Authorization: `Bearer ${storedToken}` },
          });

          if (response.ok) {
            const userData = await response.json();
            setCurrentUser(userData); // Set the full user object from the API response
          } else {
            console.error("Token invalid or user not found. Logging out.");
            localStorage.removeItem("authToken");
            localStorage.removeItem("loggedInUserId");
            setCurrentUser(null);
          }
        } catch (error) {
          console.error("Error loading user from storage:", error);
          localStorage.removeItem("authToken");
          localStorage.removeItem("loggedInUserId");
          setCurrentUser(null);
        }
      } else {
        // If no token, then no user is logged in
        setCurrentUser(null);
      }
      setLoadingAuth(false);
    };
    loadUserFromStorage();
  }, []); // Empty dependency array, runs once on mount

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("authToken", data.token);
        // It's good practice to also store the user ID, though not strictly needed if /api/profile works
        localStorage.setItem("loggedInUserId", data.user.id.toString());
        setCurrentUser(data.user); // Update currentUser state directly
        return true;
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Login failed");
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Network error during login.");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("loggedInUserId");
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loadingAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
