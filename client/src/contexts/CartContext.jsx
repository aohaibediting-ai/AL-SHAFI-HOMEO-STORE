import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      setCart(res.cart);
    } catch (err) {
      console.error('Fetch cart error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId, quantity = 1, showToast = true) => {
    try {
      const res = await api.post('/cart/items', { product_id: productId, quantity });
      setCart(res.cart);
      if (showToast) {
        toast.success('Added to your basket');
      }
      return res.cart;
    } catch (err) {
      toast.error(err.message || 'Failed to add item to cart');
      throw err;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const res = await api.put(`/cart/items/${itemId}`, { quantity });
      setCart(res.cart);
      return res.cart;
    } catch (err) {
      toast.error(err.message || 'Failed to update quantity');
      throw err;
    }
  };

  const removeItem = async (itemId) => {
    try {
      const res = await api.delete(`/cart/items/${itemId}`);
      setCart(res.cart);
      toast.success('Item removed');
      return res.cart;
    } catch (err) {
      toast.error(err.message || 'Failed to remove item');
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      const res = await api.delete('/cart');
      setCart(res.cart);
    } catch (err) {
      console.error('Clear cart error:', err);
    }
  };

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const subtotal = cart?.subtotal || 0;

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      itemCount,
      subtotal,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      refreshCart: fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
