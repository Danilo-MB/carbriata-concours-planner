import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api, getAuthToken, setAuthToken, UserResponse } from '../utils/api';

export interface User {
  id: string;
  email: string;
  name: string;
  role?: 'admin' | 'user';
  isAdmin?: boolean;
  emailVerified?: boolean;
}

const USER_KEY = 'mapflex_user';

export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User | null): void {
  try {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  } catch {
    // no-op
  }
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (email: string, password?: string) => Promise<UserResponse>;
  register: (email: string, password: string, name: string) => Promise<UserResponse>;
  verifyEmail: (email: string, code: string) => Promise<UserResponse>;
  resendCode: (email: string) => Promise<{ success: boolean; message: string }>;
  loginWithGoogle: (data: { credential?: string; email?: string; name?: string; sub?: string }) => Promise<void>;
  loginWithApple: (data: { credential?: string; email?: string; name?: string; sub?: string }) => Promise<void>;
  sendMagicLink: (email: string) => Promise<{ success: boolean; email: string; devCode?: string; devLink?: string }>;
  verifyMagicToken: (token: string) => Promise<void>;
  verifyMagicCode: (email: string, code: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const applyAuthResponse = (data: UserResponse) => {
    setAuthToken(data.token);
    setStoredUser(data.user);
    setToken(data.token);
    setUser(data.user);
    setIsAuthModalOpen(false);
  };

  useEffect(() => {
    async function initAuth() {
      // 1. Check if returning from a Link de acceso in the URL
      if (typeof window !== 'undefined' && window.location.search) {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get('access_token') || params.get('magic_token');
        if (accessToken) {
          try {
            const data = await api.auth.verifyMagicToken(accessToken);
            applyAuthResponse(data);
            toast.success(`¡Bienvenido a MapFlex, ${data.user.name}!`);
            // Clean URL query param without full page reload
            params.delete('access_token');
            params.delete('magic_token');
            params.delete('email');
            const newSearch = params.toString();
            const cleanUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash;
            window.history.replaceState({}, document.title, cleanUrl);
            return;
          } catch (err: any) {
            toast.error(err.message || 'El enlace de acceso ha expirado.');
          }
        }
      }

      // 2. Verify or refresh active session with backend
      const savedToken = getAuthToken();
      if (!savedToken) {
        return;
      }
      try {
        const profile = await api.auth.me();
        setUser(profile);
        setStoredUser(profile);
        setToken(savedToken);
      } catch (err: any) {
        // Only clear if server explicitly rejects as expired or invalid
        if (err?.message?.includes('expirada') || err?.message?.includes('inválido')) {
          setAuthToken(null);
          setStoredUser(null);
          setToken(null);
          setUser(null);
        }
      }
    }

    initAuth();
  }, []);

  const login = async (email: string, password?: string) => {
    const data = await api.auth.login(email, password || '');
    if (!data.needsVerification) {
      applyAuthResponse(data);
    }
    return data;
  };

  const register = async (email: string, password: string, name: string) => {
    const data = await api.auth.register(email, password, name);
    if (!data.needsVerification) {
      applyAuthResponse(data);
    }
    return data;
  };

  const verifyEmail = async (email: string, code: string) => {
    const data = await api.auth.verifyEmail(email, code);
    applyAuthResponse(data);
    return data;
  };

  const resendCode = async (email: string) => {
    return api.auth.resendCode(email);
  };

  const loginWithGoogle = async (data: { credential?: string; email?: string; name?: string; sub?: string }) => {
    const res = await api.auth.google(data);
    applyAuthResponse(res);
  };

  const loginWithApple = async (data: { credential?: string; email?: string; name?: string; sub?: string }) => {
    const res = await api.auth.apple(data);
    applyAuthResponse(res);
  };

  const sendMagicLink = async (email: string) => {
    return api.auth.sendMagicLink(email);
  };

  const verifyMagicToken = async (tokenString: string) => {
    const data = await api.auth.verifyMagicToken(tokenString);
    applyAuthResponse(data);
  };

  const verifyMagicCode = async (email: string, code: string) => {
    const data = await api.auth.verifyMagicCode(email, code);
    applyAuthResponse(data);
  };

  const logout = () => {
    setAuthToken(null);
    setStoredUser(null);
    setToken(null);
    setUser(null);
    toast('Sesión cerrada');
  };

  const cleanEmail = user?.email?.toLowerCase().trim() || '';
  const isAdmin = Boolean(
    user?.isAdmin ||
    user?.role === 'admin' ||
    cleanEmail === 'dmarinobata@gmail.com' ||
    cleanEmail.includes('danilo')
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user),
        isAdmin,
        isLoading,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        login,
        register,
        verifyEmail,
        resendCode,
        loginWithGoogle,
        loginWithApple,
        sendMagicLink,
        verifyMagicToken,
        verifyMagicCode,
        logout
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
