/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import { login } from '../services/auth';
import type { LoginCredentials } from '../services/auth';
import { removeToken } from '../services/authStorage';
import { useNotification } from './NotificationContext';

type AuthContextValue = {
  loggedIn: boolean;
  token: string | null;
  handleLogin: (credentials: LoginCredentials) => Promise<void>;
  handleLogout: () => void;
  setCredentials: (token: string) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const { handleSuccess, handleError } = useNotification();

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      const userToken = await login(credentials);
      if (userToken) {
        setLoggedIn(true);
        setToken(userToken);
        handleSuccess('Successfully logged in');
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleLogout = () => {
    handleSuccess('Successfully logged out');
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
        loggedIn,
        token,
        handleLogin,
        handleLogout,
        setCredentials,
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
