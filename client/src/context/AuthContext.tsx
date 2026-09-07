'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api';

interface User {
  _id: string;
  email: string;
  phone: string;
  fullName: string;
  name?: string;
  role: 'BEEKEEPER' | 'ADMIN' | 'LAB_TESTER' | 'DISTRIBUTOR';
  isApproved: boolean;
  isActive: boolean;
  walletAddress?: string;
  beekeeper?: any;
  profile?: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; user?: User }>;
  register: (data: any) => Promise<{ success: boolean; message?: string; user?: User }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('honeychain_token');
    if (savedToken) {
      setToken(savedToken);
      fetchUser(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (authToken?: string) => {
    try {
      if (authToken) {
        localStorage.setItem('honeychain_token', authToken);
      }
      const res = await authApi.getMe();
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        localStorage.removeItem('honeychain_token');
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      localStorage.removeItem('honeychain_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await authApi.login({ email, password });
      if (res.success && res.data) {
        const newToken = res.token || '';
        const userData = res.data;
        setToken(newToken);
        localStorage.setItem('honeychain_token', newToken);
        setUser(userData);
        return { success: true, user: userData };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  const register = async (data: any) => {
    try {
      const res = await authApi.register(data);
      if (res.success && res.data) {
        const newToken = res.token || '';
        const userData = res.data;
        setToken(newToken);
        localStorage.setItem('honeychain_token', newToken);
        setUser(userData);
        return { success: true, user: userData };
      }
      return { success: false, message: res.message || 'Registration failed' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Registration failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('honeychain_token');
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
