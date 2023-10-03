import { createContext, useState } from 'react';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('success');
  const handleSuccess = (message) => {
    setOpen(true);
    setMessage(message);
  };
  const handleError = (error) => {
    const errorMessage = error?.response?.data?.error || error;
    setOpen(true);
    setSeverity('error');
    setMessage(`Error: ${errorMessage}`);
  };

  const resetMessages = () => {
    setOpen(false);
    setMessage('');
    setSeverity('success');
  };

  return (
    <NotificationContext.Provider
      value={{
        open,
        message,
        severity,
        handleSuccess,
        handleError,
        resetMessages,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
