import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ash_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('ash_auth_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.user) {
          setUser(res.user);
          localStorage.setItem('ash_user', JSON.stringify(res.user));
        }
      } catch (err) {
        console.error('Session verify error:', err);
        localStorage.removeItem('ash_auth_token');
        localStorage.removeItem('ash_user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.token && res.user) {
      localStorage.setItem('ash_auth_token', res.token);
      localStorage.setItem('ash_user', JSON.stringify(res.user));
      setUser(res.user);
    }
    return res;
  };

  const register = async (name, email, password, phone) => {
    const res = await api.post('/auth/register', { name, email, password, phone });
    if (res.token && res.user) {
      localStorage.setItem('ash_auth_token', res.token);
      localStorage.setItem('ash_user', JSON.stringify(res.user));
      setUser(res.user);
    }
    return res;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('ash_auth_token');
    localStorage.removeItem('ash_user');
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await api.put('/auth/profile', data);
    if (res.user) {
      setUser(res.user);
      localStorage.setItem('ash_user', JSON.stringify(res.user));
    }
    return res;
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
