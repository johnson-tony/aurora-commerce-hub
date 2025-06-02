
import { useState, useEffect } from 'react';

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  discount?: number;
}

const WISHLIST_STORAGE_KEY = 'ecommerce_wishlist';

export const useWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (savedWishlist) {
        setWishlistItems(JSON.parse(savedWishlist));
      }
    } catch (error) {
      console.error('Error loading wishlist from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage whenever wishlist changes
  const saveToStorage = (items: WishlistItem[]) => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving wishlist to localStorage:', error);
    }
  };

  const removeFromWishlist = (id: string) => {
    const updatedItems = wishlistItems.filter(item => item.id !== id);
    setWishlistItems(updatedItems);
    saveToStorage(updatedItems);
  };

  const addToWishlist = (item: WishlistItem) => {
    const existingItem = wishlistItems.find(wishlistItem => wishlistItem.id === item.id);
    if (!existingItem) {
      const updatedItems = [...wishlistItems, item];
      setWishlistItems(updatedItems);
      saveToStorage(updatedItems);
    }
  };

  const clearWishlist = () => {
    setWishlistItems([]);
    saveToStorage([]);
  };

  const isInWishlist = (id: string) => {
    return wishlistItems.some(item => item.id === id);
  };

  const moveToCart = (item: WishlistItem) => {
    // Add to cart logic would go here
    // For now, we'll just remove from wishlist
    removeFromWishlist(item.id);
    
    // Add to cart in localStorage
    try {
      const existingCart = localStorage.getItem('ecommerce_cart');
      const cartItems = existingCart ? JSON.parse(existingCart) : [];
      
      const existingCartItem = cartItems.find((cartItem: any) => cartItem.id === item.id);
      if (existingCartItem) {
        existingCartItem.quantity += 1;
      } else {
        cartItems.push({ ...item, quantity: 1 });
      }
      
      localStorage.setItem('ecommerce_cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return {
    wishlistItems,
    isLoading,
    removeFromWishlist,
    addToWishlist,
    clearWishlist,
    isInWishlist,
    moveToCart,
    wishlistCount: wishlistItems.length,
  };
};
