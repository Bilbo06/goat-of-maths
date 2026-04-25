/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { api, setToken } from '../utils/api';

interface AuthState {
  isLoggedIn: boolean;
  username: string;
  displayName: string;
  isAdmin: boolean;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => {
    const saved = localStorage.getItem('goat-auth');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return { isLoggedIn: false, username: '', displayName: '', isAdmin: false };
  });

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      const result = await api.auth.login(username, password);
      setToken(result.token);
      const state: AuthState = {
        isLoggedIn: true,
        username: result.user.username,
        displayName: result.user.displayName,
        isAdmin: result.user.isAdmin,
      };
      setAuth(state);
      localStorage.setItem('goat-auth', JSON.stringify(state));
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setAuth({ isLoggedIn: false, username: '', displayName: '', isAdmin: false });
    localStorage.removeItem('goat-auth');
  }, []);

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
