// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { useState } from "react";
import { CartProvider } from '@/context/CartContext'; // Keep this import

// Public Pages
import { AuthProvider } from './context/AuthContext'; // Keep this import
import { ProtectedRoute } from './pages/auth/ProtectedRoute';
import Index from "./pages/Index";

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import ProductListing from "./pages/ProductListing";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import Support from "./pages/Support";
import LiveChat from '@/pages/LiveChat';
import OrderConfirmation from './pages/OrderConfirmation';
import NotFound from "./pages/NotFound";

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminFeedback from "./pages/admin/AdminFeedback";
import AdminReturns from "./pages/admin/AdminReturns";


const App = () => {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            {/* <CartProvider> should wrap ALL <Routes> that need cart context */}
            <CartProvider>
              <Routes>
                {/* Public Routes - These pages will use the PublicLayout */}
                {/* PublicLayout likely contains Navigation, which uses useCart */}
                <Route path="/" element={<PublicLayout><Outlet /></PublicLayout>}>
                  <Route index element={<Index />} />
                  <Route path="products" element={<ProductListing />} />
                  <Route path="products/:category" element={<ProductListing />} />
                  <Route path="product/:id" element={<ProductDetail />} />
                  <Route path="live-chat" element={<LiveChat />} />
                  <Route path="support" element={<Support />} />
                  <Route path="login" element={<LoginPage />} />
                  <Route path="register" element={<RegisterPage />} />
                  <Route path="forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="reset-password" element={<ResetPasswordPage />} />
                  <Route path="order-confirmation" element={<OrderConfirmation />} />

                  {/* Protected Public Routes */}
                  <Route path="cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                  <Route path="wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                  <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                  <Route path="orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                  <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                  {/* Public 404 - Catches any unmatched paths within the public layout */}
                  <Route path="*" element={<NotFound />} />
                </Route>

                {/* Admin Login Route - This MUST be outside the AdminLayout nesting */}
                <Route path="/admin" element={<AdminLogin />} />

                {/* Admin Routes using AdminLayout */}
                {/* If AdminLayout also renders Navigation (or a similar component that needs cart context),
                    it needs to be inside the CartProvider as well. Which it now is. */}
                <Route path="/admin/*" element={<AdminLayout><Outlet /></AdminLayout>}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="coupons" element={<AdminCoupons />} />
                  <Route path="feedback" element={<AdminFeedback />} />
                  <Route path="returns" element={<AdminReturns />} />

                  {/* Admin 404 */}
                  <Route path="*" element={<NotFound />} />
                </Route>

                {/* Global 404 - Catches any unmatched paths that don't fit into public or admin layouts */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;