/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  AuthSessionError,
  getSessionUser,
  signInWithEmail,
  signOutSession,
  type AuthUser,
} from '@/lib/api';

export type AuthContextValue = {
  state: {
    user: AuthUser | null;
    status: 'loading' | 'authenticated' | 'unauthenticated';
  };
  actions: {
    signIn: (credentials: { email: string; password: string }) => Promise<AuthUser>;
    signOut: () => Promise<void>;
    refresh: () => Promise<AuthUser | null>;
  };
  meta: {
    isSignedIn: boolean;
  };
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  const refresh = useCallback(async () => {
    try {
      const nextUser = await getSessionUser();
      setUser(nextUser);
      setStatus('authenticated');
      return nextUser;
    } catch (error) {
      setUser(null);
      setStatus('unauthenticated');
      if (error instanceof AuthSessionError && error.status === 403) {
        throw error;
      }
      return null;
    }
  }, []);

  const signIn = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      const nextUser = await signInWithEmail({ email, password });
      setUser(nextUser);
      setStatus('authenticated');
      return nextUser;
    },
    []
  );

  const signOut = useCallback(async () => {
    try {
      await signOutSession();
    } finally {
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  useEffect(() => {
    void refresh().catch(() => undefined);
  }, [refresh]);

  const value = useMemo(
    () => ({
      state: { user, status },
      actions: { signIn, signOut, refresh },
      meta: { isSignedIn: status === 'authenticated' && user !== null },
    }),
    [refresh, signIn, signOut, status, user]
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
