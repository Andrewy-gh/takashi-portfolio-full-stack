import { createContext, useContext, useState, type ReactNode } from 'react';
import { login } from '../services/auth';
import { removeToken } from '../services/authStorage';
import { NotificationContext } from './NotificationContext';
import type { AuthContextType, Credentials } from '../utils/types';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [token, setToken] = useState<Credentials | null>(null);
  const { handleSuccess, handleError } = useContext(NotificationContext);

  const handleLogin = async (credentials: Credentials) => {
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

  const setCredentials = (credentials: Credentials) => {
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
