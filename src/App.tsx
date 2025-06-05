import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { useState } from "react";

// Public Pages
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider
import { ProtectedRoute } from './pages/auth/ProtectedRoute'; // Import ProtectedRoute
import Index from "./pages/Index";
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'; // <--- NEW IMPORT
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
import NotFound from "./pages/NotFound"; // For general 404

// Layouts
import PublicLayout from './layouts/PublicLayout'; // Import the new PublicLayout
import AdminLayout from './layouts/AdminLayout'; // The layout for admin section

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
          {/* Wrap your entire application (or at least the public-facing part) with AuthProvider */}
          {/* This ensures that all components rendered within it can access authentication state */}
          <AuthProvider>
            <Routes>
              {/* Public Routes - These pages will use the PublicLayout, which includes the Footer */}
              {/* Routes inside PublicLayout that don't need authentication */}
              <Route path="/" element={<PublicLayout><Outlet /></PublicLayout>}>
                <Route index element={<Index />} />
                <Route path="products" element={<ProductListing />} />
                <Route path="products/:category" element={<ProductListing />} />
                <Route path="product/:id" element={<ProductDetail />} />
                <Route path="live-chat" element={<LiveChat />} />
                <Route path="support" element={<Support />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />

                  {/* --- New Forgot/Reset Password Routes --- */}
                  <Route path="forgot-password" element={<ForgotPasswordPage />} />
                <Route path="reset-password" element={<ResetPasswordPage />} />

                <Route path="order-confirmation" element={<OrderConfirmation />} />

                {/* --- Protected Public Routes --- */}
                {/* Wrap these components with ProtectedRoute. They will only render if isAuthenticated is true. */}
                <Route path="cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                <Route path="wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                {/* Public 404 - Catches any unmatched paths within the public layout */}
                <Route path="*" element={<NotFound />} />
              </Route>

              {/* Admin Login Route - This typically does NOT use any specific layout */}
              {/* This route should ideally be separate from the public layout */}
              <Route path="/admin" element={<AdminLogin />} />

              {/* --- Admin Routes using AdminLayout --- */}
              {/* All routes nested inside this will render within the AdminLayout. */}
              {/* You might want a separate AdminAuthContext and AdminProtectedRoute for admin security */}
              <Route path="/admin" element={<AdminLayout><Outlet /></AdminLayout>}>
                <Route index element={<AdminDashboard />} /> {/* /admin */}
                <Route path="dashboard" element={<AdminDashboard />} />

                <Route path="users" element={<AdminUsers />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="coupons" element={<AdminCoupons />} />
                <Route path="feedback" element={<AdminFeedback />} />
                <Route path="returns" element={<AdminReturns />} />

                {/* Admin 404 - For any unmatched paths within /admin/* */}
                {/* This is still useful for admin-specific 404 behavior/UI */}
                <Route path="*" element={<NotFound />} /> {/* You might create a specific AdminNotFound */}
              </Route>

              {/* Optional: A global catch-all for routes not handled by any specific layout */}
              {/* If you have a top-level PublicLayout catch-all, this might be redundant for public paths,
                  but could catch direct attempts to /admin/nonexistent-path if not caught by AdminLayout's catch-all. */}
              {/* <Route path="*" element={<NotFound />} /> */}
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;