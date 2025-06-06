// C:\path\to\your\frontend\src\contexts\CartContext.tsx (or similar)

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext"; // Assuming AuthContext provides user info
import { useToast } from "@/components/ui/use-toast"; // Assuming you're using a shadcn/ui toast notification system

// Define the shape of a single cart item
interface CartItem {
  cart_item_id: number;
  product_id: number;
  quantity: number;
  selected_size: string | null;
  selected_color: string | null;
  product_name: string;
  product_price: number;
  product_images: string[]; // Assuming this is an array of image URLs
  product_stock: number;
}

// Define the shape of the CartContext state and functions
interface CartContextType {
  cartItems: CartItem[];
  loadingCart: boolean;
  errorCart: string | null;
  totalCartItems: number; // Added for convenience
  fetchCart: () => Promise<void>;
  addCartItem: (
    productId: number,
    quantity: number,
    selectedSize: string | null,
    selectedColor: string | null
  ) => Promise<void>;
  updateCartItemQuantity: (
    cartItemId: number,
    newQuantity: number
  ) => Promise<void>;
  removeCartItem: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart Provider Component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth(); // Get user from AuthContext
  const { toast } = useToast(); // Initialize toast

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState<boolean>(true);
  const [errorCart, setErrorCart] = useState<string | null>(null);
  const [isMutatingCart, setIsMutatingCart] = useState<boolean>(false); // NEW STATE VARIABLE

  // Helper to parse product_images (if stored as JSON string from backend)
  const parseProductImages = useCallback((items: any[]): CartItem[] => {
    return items.map((item) => {
      if (item.product_images && typeof item.product_images === "string") {
        try {
          item.product_images = JSON.parse(item.product_images);
        } catch (e) {
          console.error("Failed to parse product images:", e);
          item.product_images = []; // Default to empty array on parse error
        }
      } else if (!Array.isArray(item.product_images)) {
        item.product_images = []; // Ensure it's an array if not a string
      }
      return item as CartItem;
    });
  }, []); // useCallback for memoization

  // --- fetchCart Function (for initial load and when user changes) ---
  const fetchCart = useCallback(async () => {
    console.log("CartContext: fetchCart initiated. User:", user);
    if (!user || !user.id) {
      console.log("CartContext: User logged out or null. Clearing cart items.");
      setCartItems([]); // Clear cart if no user
      setLoadingCart(false);
      return;
    }

    setLoadingCart(true);
    setErrorCart(null);
    console.log("fetchCart: Initiating fetch for user ID:", user.id);
    try {
      const response = await fetch(`http://localhost:5000/api/cart/${user.id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch cart.");
      }
      const data = await response.json();
      console.log("fetchCart: API Response data received:", data);

      const parsedCartItems = parseProductImages(data.cartItems);
      setCartItems(parsedCartItems);
      console.log("fetchCart: Parsed cart items and updated state:", parsedCartItems);
    } catch (err: any) {
      console.error("fetchCart: Error fetching cart:", err);
      setErrorCart(err.message || "Could not fetch cart items.");
    } finally {
      setLoadingCart(false);
      console.log("fetchCart: Loading set to false.");
    }
  }, [user, parseProductImages]); // Re-run if user object or parseProductImages changes

  // --- addCartItem Function ---
  const addCartItem = useCallback(
    async (
      productId: number,
      quantity: number,
      selectedSize: string | null,
      selectedColor: string | null
    ) => {
      if (!user || !user.id) {
        toast({
          title: "Not logged in",
          description: "Please log in to add items to your cart.",
          variant: "destructive",
        });
        return;
      }
      setLoadingCart(true); // Start loading state
      setIsMutatingCart(true); // NEW: Set mutation flag
      setErrorCart(null);
      console.log("addCartItem: Attempting to add item to backend...");
      try {
        const response = await fetch("http://localhost:5000/api/cart/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            productId,
            quantity,
            selectedSize,
            selectedColor,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to add item to cart.");
        }

        const data = await response.json(); // Backend now returns { message, cartItems: [...] }
        console.log("addCartItem: Backend responded with updated cart:", data);

        // Crucial: Use the cartItems directly from the response
        if (!data.cartItems || !Array.isArray(data.cartItems)) {
          console.error("addCartItem: Backend response did not contain a valid 'cartItems' array. Falling back to fetchCart.");
          // Fallback: If backend didn't send cartItems, then *maybe* re-fetch
          await fetchCart(); // This fallback should ideally not be needed if backend is perfect
          setLoadingCart(false); // Ensure loading is off even if fallback occurs
          return; // Exit after fallback fetch
        }

        const parsedCartItems = parseProductImages(data.cartItems);
        setCartItems(parsedCartItems); // DIRECTLY UPDATE STATE WITH THE DATA FROM THIS RESPONSE
        console.log("addCartItem: Frontend cartItems state updated to:", parsedCartItems);

        toast({
          title: "Item Added",
          description: data.message || "Product successfully added to cart.",
          variant: "default",
        });

      } catch (err: any) {
        console.error("addCartItem: Error adding item to cart:", err);
        setErrorCart(err.message || "Could not add item to cart.");
        toast({
          title: "Error",
          description: err.message || "Failed to add item to cart.",
          variant: "destructive",
        });
      } finally {
        setLoadingCart(false); // End loading state
        setIsMutatingCart(false); // NEW: Reset mutation flag
      }
    },
    [user, toast, parseProductImages, fetchCart]
  );

  // --- updateCartItemQuantity Function ---
  const updateCartItemQuantity = useCallback(
    async (cartItemId: number, newQuantity: number) => {
      if (!user || !user.id) {
        toast({
          title: "Not logged in",
          description: "Please log in to update your cart.",
          variant: "destructive",
        });
        return;
      }
      setLoadingCart(true);
      setIsMutatingCart(true); // NEW: Set mutation flag
      setErrorCart(null);
      console.log("updateCartItemQuantity: Attempting to update item quantity to backend...");
      try {
        const response = await fetch(
          "http://localhost:5000/api/cart/update-quantity",
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: user.id, // Ensure userId is sent in the body for security
              cartItemId,
              newQuantity,
            }),
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to update item quantity."
          );
        }
        const data = await response.json(); // Backend should return { message, cartItems: [...] }
        console.log("updateCartItemQuantity: Backend responded with updated cart:", data);

        if (!data.cartItems || !Array.isArray(data.cartItems)) {
          console.error("updateCartItemQuantity: Backend response did not contain a valid 'cartItems' array. Falling back to fetchCart.");
          await fetchCart();
          setLoadingCart(false); // Ensure loading is off even if fallback occurs
          return;
        }

        const parsedCartItems = parseProductImages(data.cartItems);
        setCartItems(parsedCartItems); // DIRECTLY UPDATE STATE WITH THE DATA FROM THIS RESPONSE
        console.log("updateCartItemQuantity: Frontend cartItems state updated to:", parsedCartItems);

        toast({
          title: "Cart Updated",
          description: data.message || "Cart item quantity updated.",
          variant: "default",
        });
      } catch (err: any) {
        console.error(
          "updateCartItemQuantity: Error updating item quantity:",
          err
        );
        setErrorCart(err.message || "Could not update item quantity.");
        toast({
          title: "Error",
          description:
            err.message || "Failed to update cart item quantity.",
          variant: "destructive",
        });
      } finally {
        setLoadingCart(false);
        setIsMutatingCart(false); // NEW: Reset mutation flag
      }
    },
    [user, toast, parseProductImages, fetchCart]
  );

  // --- removeCartItem Function ---
  const removeCartItem = useCallback(
    async (cartItemId: number) => {
      if (!user || !user.id) {
        toast({
          title: "Not logged in",
          description: "Please log in to remove items from your cart.",
          variant: "destructive",
        });
        return;
      }
      setLoadingCart(true);
      setIsMutatingCart(true); // NEW: Set mutation flag
      setErrorCart(null);
      console.log("removeCartItem: Attempting to remove item from backend...");
      try {
        const response = await fetch("http://localhost:5000/api/cart/remove", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id, // Ensure userId is sent in the body for security
            cartItemId,
          }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to remove item.");
        }
        const data = await response.json(); // Backend should return { message, cartItems: [...] }
        console.log("removeCartItem: Backend responded with updated cart:", data);

        if (!data.cartItems || !Array.isArray(data.cartItems)) {
          console.error("removeCartItem: Backend response did not contain a valid 'cartItems' array. Falling back to fetchCart.");
          await fetchCart();
          setLoadingCart(false); // Ensure loading is off even if fallback occurs
          return;
        }

        const parsedCartItems = parseProductImages(data.cartItems);
        setCartItems(parsedCartItems); // DIRECTLY UPDATE STATE WITH THE DATA FROM THIS RESPONSE
        console.log("removeCartItem: Frontend cartItems state updated to:", parsedCartItems);

        toast({
          title: "Item Removed",
          description: data.message || "Product removed from cart.",
          variant: "default",
        });
      } catch (err: any) {
        console.error("removeCartItem: Error removing item:", err);
        setErrorCart(err.message || "Could not remove item.");
        toast({
          title: "Error",
          description: err.message || "Failed to remove item from cart.",
          variant: "destructive",
        });
      } finally {
        setLoadingCart(false);
        setIsMutatingCart(false); // NEW: Reset mutation flag
      }
    },
    [user, toast, parseProductImages, fetchCart]
  );

  // --- clearCart Function ---
  const clearCart = useCallback(async () => {
    if (!user || !user.id) {
      toast({
        title: "Not logged in",
        description: "Please log in to clear your cart.",
        variant: "destructive",
      });
      return;
    }
    setLoadingCart(true);
    setIsMutatingCart(true); // NEW: Set mutation flag
    setErrorCart(null);
    try {
      const response = await fetch(
        `http://localhost:5000/api/cart/clear/${user.id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to clear cart.");
      }
      const data = await response.json(); // Backend should return { message, cartItems: [] }
      console.log("clearCart: Backend responded with empty cart:", data);

      setCartItems([]); // Explicitly set to empty array as per backend's clear response
      console.log("clearCart: Cart items cleared in frontend state.");

      toast({
        title: "Cart Cleared",
        description: data.message || "Your cart has been cleared.",
        variant: "default",
      });
    } catch (err: any) {
      console.error("clearCart: Error clearing cart:", err);
      setErrorCart(err.message || "Could not clear cart.");
      toast({
        title: "Error",
        description: err.message || "Failed to clear cart.",
        variant: "destructive",
      });
    } finally {
      setLoadingCart(false);
      setIsMutatingCart(false); // NEW: Reset mutation flag
    }
  }, [user, toast]);

  // --- useEffect to fetch cart on user change (login/logout) ---
  useEffect(() => {
    console.log("CartContext: useEffect triggered for user. User:", user, "isMutatingCart:", isMutatingCart);
    // NEW: Only fetch cart if not currently performing a mutation and user is logged in
    if (user?.id && !isMutatingCart) {
      fetchCart();
    } else if (!user?.id) {
        // If user logs out, ensure cart is cleared
        setCartItems([]);
    }
  }, [user?.id, isMutatingCart, fetchCart]); // Depend on user.id, isMutatingCart, and fetchCart

  // totalCartItems must be declared *after* cartItems is defined
  const totalCartItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // DEBUG LOG: Add this to see the state before context provides it
  console.log("CartContext: Rendering with totalCartItems:", totalCartItems, "cartItems:", cartItems);

  const contextValue = {
    cartItems,
    loadingCart,
    errorCart,
    fetchCart,
    addCartItem,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
    totalCartItems,
  };

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};