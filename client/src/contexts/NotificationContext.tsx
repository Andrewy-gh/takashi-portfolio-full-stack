import { createContext, useState, type ReactNode } from 'react';
import type { ErrorResponse, NotificationContextType } from '../utils/types';

export const NotificationContext =
  createContext<NotificationContextType | null>(null);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('success');
  const handleSuccess = (message: string) => {
    setOpen(true);
    setMessage(message);
  };

  const handleError = (error: ErrorResponse | string) => {
    let errorMessage: string;
    if (typeof error === 'string') {
      errorMessage = error;
    } else {
      errorMessage = error.response?.data?.error || 'An unknown error occurred';
    }
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
