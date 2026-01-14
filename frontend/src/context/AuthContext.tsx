import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

export interface User {
  id: string; // ID from backend
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: string;
  avatar?: string;
  billing_address?: any;
  shipping_address?: any;
  name?: string; // Helpers for UI compatibility
  phone?: string;
  isVerified?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoading: boolean;
  login: (phone: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  requestOtp: (phone: string) => Promise<{ success: boolean; error?: string; directLogin?: boolean }>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  checkOrCreateUser: (phone: string, name?: string, address?: any) => User; // Legacy support for Checkout
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from API on mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Verify token and get user data
          const response = await api.get('/users/me/');
          const userData = mapBackendUser(response.data);
          setUser(userData);
        } catch (error) {
          console.error("Token invalid or expired", error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await api.get('/users/me/');
        const userData = mapBackendUser(response.data);
        setUser(userData);
        // console.log("[Auth] User profile refreshed:", userData);
      } catch (error) {
        console.error("[Auth] Failed to refresh user profile", error);
      }
    }
  };

  const mapBackendUser = (data: any): User => {
    // Helper to get field regardless of case
    const get = (k1: string, k2: string) => data[k1] || data[k2] || '';

    const first_name = get('first_name', 'firstName');
    const last_name = get('last_name', 'lastName');
    const phone = get('phone_number', 'phone');
    const shipping_address = get('shipping_address', 'shippingAddress');
    const billing_address = get('billing_address', 'billingAddress');

    return {
      ...data,
      first_name,
      last_name,
      phone_number: phone,
      shipping_address,
      billing_address,
      name: ((first_name || '') + ' ' + (last_name || '')).trim() || data.username || phone || 'User',
      phone: phone,
      isVerified: true
    };
  };

  const requestOtp = async (phone: string) => {
    try {
      const response = await api.post('/users/generate-otp/', { phone_number: phone });
      console.log("OTP Response Data:", response.data);

      // Handle Direct Login (SMS Inactive)
      if (response.data.direct_login || response.data.directLogin) {
        const { token, user: userData } = response.data;
        localStorage.setItem('token', token);
        setUser(mapBackendUser(userData));
        return { success: true, directLogin: true };
      }

      if (response.data.debug_otp) {
        console.log(`%c[DEV] OTP Code: ${response.data.debug_otp}`, 'color: #10B981; font-weight: bold; font-size: 14px;');
      } else {
        console.warn("OTP Response missing debug_otp field");
      }
      return { success: true, directLogin: false };
    } catch (error: any) {
      console.error("OTP Request failed", error);
      return { success: false, error: error.response?.data?.error || "Failed to send OTP" };
    }
  };

  const login = async (phone: string, otp: string) => {
    try {
      const response = await api.post('/users/verify-otp/', { phone_number: phone, otp });
      const { token, user: userData } = response.data;

      localStorage.setItem('token', token);
      setUser(mapBackendUser(userData));
      return { success: true };
    } catch (error: any) {
      console.error("Login failed", error);
      const msg = error.response?.data?.error || "Login failed. Invalid OTP.";
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = async (data: Partial<User>) => {
    try {
      // Map UI fields back to backend fields
      const payload: any = { ...data };
      if (data.name) {
        const parts = data.name.split(' ');
        payload.first_name = parts[0];
        payload.last_name = parts.slice(1).join(' ') || '';
        delete payload.name;
      }
      if (data.phone) {
        payload.phone_number = data.phone;
        delete payload.phone;
      }

      const response = await api.patch('/users/me/', payload);
      setUser(prev => prev ? { ...prev, ...mapBackendUser(response.data) } : null);
    } catch (error) {
      console.error("Update failed", error);
      throw error;
    }
  };

  // Used by Checkout to link order to user without forcing login
  // For now, we return a temporary object, but ideally we should prompt login/guest checkout.
  // If we return a fake user, it won't be saved to backend unless they register.
  const checkOrCreateUser = (phone: string, name?: string, address?: any): User => {
    // Create guest user object
    const guestUser: User = {
      id: 'guest_' + Date.now(),
      username: 'guest',
      email: '',
      first_name: name || 'Guest',
      last_name: '',
      phone_number: phone,
      role: 'Guest',
      address: address, // legacy
      name: name || 'Guest',
      phone: phone,
      isVerified: false
    };
    // We don't set this as global auth user to avoid confusing state
    return guestUser;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, requestOtp, logout, updateUser, checkOrCreateUser, refreshUser }}>
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
