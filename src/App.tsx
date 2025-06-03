// C:\xampp\htdocs\aurora-commerce-hub\src\App.tsx

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom"; // Import Outlet
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

// Admin Pages and Layout
import AdminLayout from './layouts/AdminLayout'; // The layout for admin section
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
            {/* Public Routes - These pages will NOT use the AdminLayout */}
            <Route path="/" element={<Index />} />
            <Route path="/products" element={<ProductListing />} />
            <Route path="/products/:category" element={<ProductListing />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/live-chat" element={<LiveChat />} />
            <Route path="/support" element={<Support />} />

            {/* Admin Login Route - This typically does NOT use the AdminLayout */}
            <Route path="/admin" element={<AdminLogin />} />

            {/* --- Admin Routes using AdminLayout --- */}
            {/* All routes nested inside this will render within the AdminLayout.
                The <Outlet /> component inside AdminLayout will render the specific child page. */}
            <Route path="/admin" element={<AdminLayout><Outlet /></AdminLayout>}>
              {/* Dashboard is often the default page after admin login.
                  'index' makes it render when the parent path '/admin' is matched exactly.
                  We'll also keep a specific '/admin/dashboard' path for clarity and direct access. */}
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} /> {/* No duplicate route now */}

              <Route path="users" element={<AdminUsers />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="coupons" element={<AdminCoupons />} />
              <Route path="feedback" element={<AdminFeedback />} />
              <Route path="returns" element={<AdminReturns />} />

              {/* Admin 404 - For any unmatched paths within /admin/* */}
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Global 404 Route - This catches any other paths that haven't been matched */}
            {/* Place this last to ensure all other specific routes are checked first */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;