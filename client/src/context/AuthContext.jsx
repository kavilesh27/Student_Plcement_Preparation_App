import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { getRoleTheme } from '../utils/themeConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('placement_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('placement_token') || null);
  const [loading, setLoading] = useState(true);

  // Apply theme dynamically to documentElement based strictly on user's role
  useEffect(() => {
    const role = user?.role || 'student';
    document.documentElement.setAttribute('data-theme', role);
  }, [user]);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await authAPI.getMe();
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('placement_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('Session verification failed:', err);
          logout();
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  const login = async (identifier, password) => {
    const res = await authAPI.login({ loginIdentifier: identifier, password });
    if (res.data.success) {
      const authenticatedUser = res.data.user;
      setToken(res.data.token);
      setUser(authenticatedUser);
      localStorage.setItem('placement_token', res.data.token);
      localStorage.setItem('placement_user', JSON.stringify(authenticatedUser));
      document.documentElement.setAttribute('data-theme', authenticatedUser.role);
      return authenticatedUser;
    }
  };

  const register = async (studentData) => {
    const res = await authAPI.register(studentData);
    if (res.data.success) {
      const newUser = res.data.user;
      setToken(res.data.token);
      setUser(newUser);
      localStorage.setItem('placement_token', res.data.token);
      localStorage.setItem('placement_user', JSON.stringify(newUser));
      document.documentElement.setAttribute('data-theme', 'student');
      return newUser;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('placement_token');
    localStorage.removeItem('placement_user');
    document.documentElement.setAttribute('data-theme', 'student');
  };

  const currentTheme = getRoleTheme(user?.role);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        role: user?.role,
        theme: currentTheme,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
