import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  token: string | null;
  role: UserRole | null;
  unreadCount: number;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: any) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  switchDemoAccount: (role: 'admin' | 'customer' | 'provider', specificEmail?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('svt_user');
      if (!saved || saved === 'undefined' || saved === 'null') return null;
      return JSON.parse(saved);
    } catch {
      localStorage.removeItem('svt_user');
      return null;
    }
  });
  const [profile, setProfile] = useState<any | null>(() => {
    try {
      const saved = localStorage.getItem('svt_profile');
      if (!saved || saved === 'undefined' || saved === 'null') return null;
      return JSON.parse(saved);
    } catch {
      localStorage.removeItem('svt_profile');
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('svt_token'));
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        setProfile(res.data.profile);
        setUnreadCount(res.data.unreadNotifications || 0);
        localStorage.setItem('svt_user', JSON.stringify(res.data.user));
        if (res.data.profile) {
          localStorage.setItem('svt_profile', JSON.stringify(res.data.profile));
        }
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      refreshUser();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: newUser, profile: newProfile, unreadNotifications } = res.data;

    localStorage.setItem('svt_token', newToken);
    localStorage.setItem('svt_user', JSON.stringify(newUser));
    if (newProfile) {
      localStorage.setItem('svt_profile', JSON.stringify(newProfile));
    }

    setToken(newToken);
    setUser(newUser);
    setProfile(newProfile);
    setUnreadCount(unreadNotifications || 0);

    return newUser;
  };

  const register = async (payload: any): Promise<User> => {
    const res = await api.post('/auth/register', payload);
    const { token: newToken, user: newUser, profile: newProfile } = res.data;

    localStorage.setItem('svt_token', newToken);
    localStorage.setItem('svt_user', JSON.stringify(newUser));
    if (newProfile) {
      localStorage.setItem('svt_profile', JSON.stringify(newProfile));
    }

    setToken(newToken);
    setUser(newUser);
    setProfile(newProfile);
    setUnreadCount(1); // Welcome notification

    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('svt_token');
    localStorage.removeItem('svt_user');
    localStorage.removeItem('svt_profile');
    setToken(null);
    setUser(null);
    setProfile(null);
    setUnreadCount(0);
  };

  const switchDemoAccount = async (role: 'admin' | 'customer' | 'provider', specificEmail?: string) => {
    let email = '';
    let password = '';

    if (role === 'admin') {
      email = 'admin@servicevisit.com';
      password = 'AdminPass123!';
    } else if (role === 'customer') {
      email = specificEmail || 'alex@example.com';
      password = 'Customer123!';
    } else if (role === 'provider') {
      email = specificEmail || 'marcus@vanceelectric.com';
      password = 'Provider123!';
    }

    await login(email, password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        role: user?.role || null,
        unreadCount,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        switchDemoAccount,
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

