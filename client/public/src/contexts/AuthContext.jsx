import { createContext, useContext, useState } from 'react';
import { login } from '../services/auth';
import { removeToken } from '../services/authStorage';
import { NotificationContext } from './NotificationContext';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const { handleSuccess, handleError } = useContext(NotificationContext);

  const handleLogin = async (credentials) => {
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

  const setCredentials = (credentials) => {
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
