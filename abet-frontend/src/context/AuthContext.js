import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext({
  currentUser: null,
  setCurrentUser: () => {},
  loading: false,
  login: () => {},
  logout: () => {},
  hasPermission: () => false
});

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadUser = () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      if (token && user) {
        api.defaults.headers.common['Authorization'] = `Token ${token}`;  // ✅ fixed interpolation
        setCurrentUser(JSON.parse(user));
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Token ${token}`;  // ✅ fixed interpolation
    setCurrentUser(userData);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      setCurrentUser(null);
    }
  };

  const hasPermission = (requiredRole) => {
    if (!currentUser) return false;
    if (currentUser.userType === 'admin') return true; // Admin has all permissions
    return currentUser.userType === requiredRole;
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, loading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};
