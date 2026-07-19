import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  price: number;
  imageUrl: string;
  quantity: number;
  savedForLater: boolean;
}

interface CartContextType {
  cartItems: CartItem[];
  savedItems: CartItem[];
  totalAmount: number;
  loading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: number, quantity: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  toggleSaveForLater: (productId: number) => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [savedItems, setSavedItems] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user || !user.customerId) return;
    setLoading(true);
    try {
      const res = await API.get(`/cart/${user.customerId}`);
      const items: CartItem[] = res.data.items || [];
      setCartItems(items.filter(item => !item.savedForLater));
      setSavedItems(items.filter(item => item.savedForLater));
      setTotalAmount(res.data.totalAmount || 0);
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.customerId) {
      fetchCart();
    } else {
      setCartItems([]);
      setSavedItems([]);
      setTotalAmount(0);
    }
  }, [user]);

  const addItem = async (productId: number, quantity: number) => {
    if (!user || !user.customerId) return;
    try {
      const res = await API.post(`/cart/${user.customerId}/add?productId=${productId}&quantity=${quantity}`);
      const items: CartItem[] = res.data.items || [];
      setCartItems(items.filter(item => !item.savedForLater));
      setSavedItems(items.filter(item => item.savedForLater));
      setTotalAmount(res.data.totalAmount || 0);
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (!user || !user.customerId) return;
    try {
      const res = await API.put(`/cart/${user.customerId}/update?productId=${productId}&quantity=${quantity}`);
      const items: CartItem[] = res.data.items || [];
      setCartItems(items.filter(item => !item.savedForLater));
      setSavedItems(items.filter(item => item.savedForLater));
      setTotalAmount(res.data.totalAmount || 0);
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };

  const removeItem = async (productId: number) => {
    if (!user || !user.customerId) return;
    try {
      const res = await API.delete(`/cart/${user.customerId}/remove?productId=${productId}`);
      const items: CartItem[] = res.data.items || [];
      setCartItems(items.filter(item => !item.savedForLater));
      setSavedItems(items.filter(item => item.savedForLater));
      setTotalAmount(res.data.totalAmount || 0);
    } catch (err) {
      console.error('Error removing item:', err);
    }
  };

  const toggleSaveForLater = async (productId: number) => {
    if (!user || !user.customerId) return;
    try {
      const res = await API.post(`/cart/${user.customerId}/toggle-save?productId=${productId}`);
      const items: CartItem[] = res.data.items || [];
      setCartItems(items.filter(item => !item.savedForLater));
      setSavedItems(items.filter(item => item.savedForLater));
      setTotalAmount(res.data.totalAmount || 0);
    } catch (err) {
      console.error('Error saving for later:', err);
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setSavedItems([]);
    setTotalAmount(0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        savedItems,
        totalAmount,
        loading,
        fetchCart,
        addItem,
        updateQuantity,
        removeItem,
        toggleSaveForLater,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
