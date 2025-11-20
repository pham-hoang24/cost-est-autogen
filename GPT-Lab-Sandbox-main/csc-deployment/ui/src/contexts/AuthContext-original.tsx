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
  console.log('🏗️ AuthProvider component initializing...');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('🔍 AuthProvider state:', { user: user?.email, token: !!token, loading });

  // Initialize authentication immediately
  useEffect(() => {
    console.log('🚀 AuthContext useEffect triggered!');
    
    // Use setTimeout to ensure this runs after component mount
    const timeoutId = setTimeout(async () => {
      console.log('🔍 Starting auth check...');
      const storedToken = localStorage.getItem('token');
      console.log('🔐 Stored token exists:', !!storedToken);
      
      if (!storedToken) {
        console.log('❌ No token found, user not authenticated');
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch('http://localhost:8080/api/auth/me', {
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache',
            'Authorization': `Bearer ${storedToken}`
          }
        });
        
        console.log('📡 Auth response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📦 Auth response data:', JSON.stringify(data, null, 2));
          
          // Handle the user data from backend
          if (data.success && data.user) {
            console.log('✅ User authenticated successfully');
            console.log('📦 User data:', data.user);
            setUser({
              id: data.user.id,
              email: data.user.email,
              firstName: data.user.firstName,
              lastName: data.user.lastName,
              role: data.user.role,
              status: data.user.status,
              subscription_tier: data.user.subscription_tier
            });
            setToken(storedToken);
            console.log('🔐 User set in AuthContext');
          } else {
            console.log('❌ No valid user in response, data.success:', data.success, 'data.user:', data.user);
            setUser(null);
            setToken(null);
            localStorage.removeItem('token');
          }
        } else {
          console.log('❌ Auth response not ok:', response.status);
          setUser(null);
          setToken(null);
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('💥 Auth check failed:', error);
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
      } finally {
        console.log('🏁 Auth check complete, setting loading to false');
        setLoading(false);
      }
    }, 100); // Small delay to ensure component is mounted

    return () => clearTimeout(timeoutId);
  }, []);

  const checkAuthStatus = async () => {
    console.log('🔍 Starting auth check...');
    const storedToken = localStorage.getItem('token');
    console.log('🔐 Stored token exists:', !!storedToken);
    
    if (!storedToken) {
      console.log('❌ No token found, user not authenticated');
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch('http://localhost:8080/api/auth/me', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('📡 Auth response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📦 Auth response data:', JSON.stringify(data, null, 2));
        
        // Handle the nested user structure from the backend
        if (data.success && data.user) {
          // The backend returns { success: true, user: { valid: true, user: {...} } }
          let actualUser;
          if (data.user.user) {
            // Nested structure: data.user.user
            actualUser = data.user.user;
          } else {
            // Direct structure: data.user
            actualUser = data.user;
          }
          console.log('✅ User authenticated:', actualUser);
          setUser(actualUser);
          // Store token if provided
          if (data.token) {
            setToken(data.token);
            localStorage.setItem('token', data.token);
            console.log('🔐 Token stored in localStorage');
          }
        } else {
          console.log('❌ No valid user in response, data.success:', data.success, 'data.user:', data.user);
          setUser(null);
          setToken(null);
          localStorage.removeItem('token');
        }
      } else {
        console.log('❌ Auth response not ok:', response.status);
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('💥 Auth check failed:', error);
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
    } finally {
      console.log('🏁 Auth check complete, setting loading to false');
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔑 Login response:', data);
        if (data.success && data.user) {
          // Handle potential nested user structure
          const actualUser = data.user.user || data.user;
          console.log('✅ Login successful, user:', actualUser);
          setUser(actualUser);
          if (data.token) {
            setToken(data.token);
            localStorage.setItem('token', data.token);
            console.log('🔐 Token stored in localStorage');
          }
          return true;
        } else {
          console.error('Login failed:', data.message);
          return false;
        }
      } else {
        const error = await response.json();
        console.error('Login failed:', error instanceof Error ? error.message : String(error));
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        // Registration successful, but user needs approval
        return true;
      } else {
        const error = await response.json();
        console.error('Registration failed:', error instanceof Error ? error.message : String(error));
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('http://localhost:8080/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      console.log('🔐 Token cleared from localStorage');
    }
  };

  const refreshUser = async () => {
    await checkAuthStatus();
  };

  const getAuthHeaders = (): HeadersInit => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    register,
    refreshUser,
    getAuthHeaders,
  };

  return (
    <AuthContext.Provider value={value}>
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
