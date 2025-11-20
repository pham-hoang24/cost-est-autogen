'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, getDefaultRouteForRole } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<boolean>;
  refreshUser: () => Promise<void>;
  getAuthHeaders: () => HeadersInit;
}

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  organization: string;
  role: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Start with false to bypass loading

  useEffect(() => {
    // For now, just set loading to false immediately to bypass authentication
    console.log('🔍 Auth - Bypassing authentication check for now');
    console.log('🔍 Auth - Current loading state:', loading);
    setLoading(false);
    console.log('🔍 Auth - Set loading to false');
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.token) {
          localStorage.setItem('token', data.token);
          setToken(data.token);
          setUser(data.user);
          console.log('🔍 Auth - Login successful:', data.user);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('🔍 Registration successful:', data.user);
        return true;
      } else {
        console.error('🔍 Registration failed:', data.message || 'Unknown error');
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      // Validate token with backend
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
          setToken(storedToken);
          console.log('🔍 Auth - User refreshed:', data.user);
        }
      } else {
        // Invalid token, remove it
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        console.log('🔍 Auth - Invalid token during refresh, cleared');
      }
    } catch (error) {
      console.log('Auth refresh error:', error);
      if ((error as any)?.name === 'AbortError') {
        console.log('Auth refresh timed out');
      }
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const getAuthHeaders = (): HeadersInit => {
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      register,
      refreshUser,
      getAuthHeaders,
    }}>
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
