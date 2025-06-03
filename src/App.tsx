import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { useState } from "react";

// Public Pages
import Index from "./pages/Index";
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
          <Routes>
            {/* Public Routes - These pages will use the PublicLayout, which includes the Footer */}
            <Route path="/" element={<PublicLayout><Outlet /></PublicLayout>}>
              <Route index element={<Index />} /> {/* Renders for exact path "/" */}
              <Route path="products" element={<ProductListing />} />
              <Route path="products/:category" element={<ProductListing />} />
              <Route path="product/:id" element={<ProductDetail />} />
              <Route path="cart" element={<Cart />} />
              <Route path="wishlist" element={<Wishlist />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="orders" element={<Orders />} />
              <Route path="order-confirmation" element={<OrderConfirmation />} />
              <Route path="profile" element={<Profile />} />
              <Route path="live-chat" element={<LiveChat />} />
              <Route path="support" element={<Support />} />
              {/* Public 404 - Catches any unmatched paths within the public layout */}
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Admin Login Route - This typically does NOT use any specific layout */}
            <Route path="/admin" element={<AdminLogin />} />

            {/* --- Admin Routes using AdminLayout --- */}
            {/* All routes nested inside this will render within the AdminLayout. */}
            <Route path="/admin" element={<AdminLayout><Outlet /></AdminLayout>}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />

              <Route path="users" element={<AdminUsers />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="coupons" element={<AdminCoupons />} />
              <Route path="feedback" element={<AdminFeedback />} />
              <Route path="returns" element={<AdminReturns />} />

              {/* Admin 404 - For any unmatched paths within /admin/* */}
              {/* This is redundant if the parent PublicLayout already has a catch-all, but good for admin-specific 404s */}
              {/* <Route path="*" element={<NotFound />} /> // Removed as the public layout's catch-all will handle it */}
            </Route>

            {/* Global 404 Route - This catches any other paths that haven't been matched
                (e.g., if someone tries to go to /nonexistent-admin-page directly, it will hit the public 404) */}
            {/* This route is now effectively covered by the PublicLayout's catch-all, but keeping it here
                as a fallback for any routes that might not be under a specific layout. */}
            {/* <Route path="*" element={<NotFound />} /> // This can be removed if the PublicLayout's catch-all is sufficient */}
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
