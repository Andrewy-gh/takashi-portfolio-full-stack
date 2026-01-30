/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import { login } from '../services/auth';
import type { LoginCredentials } from '../services/auth';
import { removeToken } from '../services/authStorage';
import { useNotification } from './NotificationContext';

type AuthState = {
  loggedIn: boolean;
  token: string | null;
};

type AuthActions = {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  setCredentials: (token: string) => void;
};

type AuthMeta = {
  isAuthenticated: boolean;
};

type AuthContextValue = {
  state: AuthState;
  actions: AuthActions;
  meta: AuthMeta;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const { actions: notification } = useNotification();

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      const userToken = await login(credentials);
      if (userToken) {
        setLoggedIn(true);
        setToken(userToken);
        notification.success('Successfully logged in');
      }
    } catch (error) {
      notification.error(error);
    }
  };

  const handleLogout = () => {
    notification.success('Successfully logged out');
    setLoggedIn(false);
    setToken(null);
    removeToken();
  };

  const setCredentials = (credentials: string) => {
    setLoggedIn(true);
    setToken(credentials);
  };

  return (
    <AuthContext.Provider
      value={{
        state: { loggedIn, token },
        actions: {
          login: handleLogin,
          logout: handleLogout,
          setCredentials,
        },
        meta: { isAuthenticated: loggedIn && Boolean(token) },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export { AuthContext };
