import { createContext, useContext, useState, ReactNode } from 'react';
import { queryClient } from '../queryClient';
import {
  loadSession,
  setSession,
  setUser as persistUser,
  clearSession,
  SessionUser,
} from '../utils/session';

type User = SessionUser & {
  id: string | number;
  email: string;
  firstName: string;
  lastName: string;
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  updateUser: (partial: Partial<User>) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Hydrate from the VALIDATED session: a stale/foreign/expired/inconsistent
  // session is rejected (loadSession clears it) so we never start half-logged-in.
  const initial = loadSession();

  const [user, setUser] = useState<User | null>(
    (initial?.user as User) ?? null,
  );
  const [token, setToken] = useState<string | null>(initial?.token ?? null);

  const login = (newToken: string, newUser: User) => {
    setSession(newToken, newUser);
    setToken(newToken);
    setUser(newUser);
  };

  const updateUser = (partial: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...partial };
      persistUser(next);
      return next;
    });
  };

  const logout = () => {
    clearSession();
    setToken(null);
    setUser(null);
    queryClient.clear();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};