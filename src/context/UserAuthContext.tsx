'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  provider: 'google' | 'email' | 'phone';
  createdAt: string;
}

interface UserAuthContextType {
  user: CustomerUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  loginWithGoogle: (customData?: Partial<CustomerUser>) => Promise<CustomerUser>;
  loginWithEmail: (email: string, name?: string) => Promise<CustomerUser>;
  loginWithPhone: (phone: string, name?: string) => Promise<CustomerUser>;
  logout: () => void;
  updateProfile: (data: Partial<CustomerUser>) => void;
}

const STORAGE_KEY = 'jevansrot_user_client_session';
const AUTH_EVENT = 'jevansrot_user_auth_changed';

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.email) {
          setUser(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load user auth from storage', e);
    } finally {
      setIsLoading(false);
    }

    const handleAuthChange = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setUser(JSON.parse(stored));
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    };

    window.addEventListener(AUTH_EVENT, handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener(AUTH_EVENT, handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const saveUserSession = (newUser: CustomerUser | null) => {
    setUser(newUser);
    if (typeof window !== 'undefined') {
      if (newUser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
      window.dispatchEvent(new Event(AUTH_EVENT));
    }
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const loginWithGoogle = async (customData?: Partial<CustomerUser>): Promise<CustomerUser> => {
    // Generate or use provided Google profile
    const googleUser: CustomerUser = {
      id: customData?.id || 'usr_g_' + Math.random().toString(36).substring(2, 9),
      name: customData?.name || 'Customer',
      email: customData?.email || 'user@gmail.com',
      avatar: customData?.avatar || '',
      phone: customData?.phone || '',
      provider: 'google',
      createdAt: new Date().toISOString(),
    };

    saveUserSession(googleUser);
    closeLoginModal();
    return googleUser;
  };

  const loginWithEmail = async (email: string, name?: string): Promise<CustomerUser> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name?.trim() || cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Valued Customer';

    const emailUser: CustomerUser = {
      id: 'usr_em_' + Math.random().toString(36).substring(2, 9),
      name: cleanName,
      email: cleanEmail,
      provider: 'email',
      createdAt: new Date().toISOString(),
    };

    saveUserSession(emailUser);
    closeLoginModal();
    return emailUser;
  };

  const loginWithPhone = async (phone: string, name?: string): Promise<CustomerUser> => {
    const cleanPhone = phone.trim();
    const phoneUser: CustomerUser = {
      id: 'usr_ph_' + Math.random().toString(36).substring(2, 9),
      name: name?.trim() || 'Verified Customer',
      email: `${cleanPhone.replace(/[^0-9]/g, '')}@phone.jevansrot.in`,
      phone: cleanPhone,
      provider: 'phone',
      createdAt: new Date().toISOString(),
    };

    saveUserSession(phoneUser);
    closeLoginModal();
    return phoneUser;
  };

  const logout = () => {
    saveUserSession(null);
  };

  const updateProfile = (data: Partial<CustomerUser>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    saveUserSession(updated);
  };

  return (
    <UserAuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isLoading,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        loginWithGoogle,
        loginWithEmail,
        loginWithPhone,
        logout,
        updateProfile,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error('useUserAuth must be used within a UserAuthProvider');
  }
  return context;
}

