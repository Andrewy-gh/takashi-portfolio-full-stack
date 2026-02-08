/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export const TOKEN_STORAGE_KEY = 'takashi.dashboard.token';

export type AuthContextValue = {
  state: {
    token: string | null;
  };
  actions: {
    getToken: () => Promise<string | null>;
    setToken: (token: string) => void;
    signOut: () => void;
  };
  meta: {
    isSignedIn: boolean;
  };
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const readStoredToken = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(readStoredToken);

  const setToken = useCallback((nextToken: string) => {
    setTokenState(nextToken);
    window.localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
  }, []);

  const signOut = useCallback(() => {
    setTokenState(null);
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }, []);

  const getToken = useCallback(async () => token, [token]);

  const value = useMemo(
    () => ({
      state: { token },
      actions: { getToken, setToken, signOut },
      meta: { isSignedIn: Boolean(token) },
    }),
    [getToken, signOut, setToken, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
