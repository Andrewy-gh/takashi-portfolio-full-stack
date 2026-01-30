/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import type { AlertColor } from '@mui/material';

type NotificationState = {
  open: boolean;
  message: string;
  severity: AlertColor;
};

type NotificationActions = {
  success: (message: string) => void;
  error: (error: unknown) => void;
  reset: () => void;
};

type NotificationMeta = {
  hasMessage: boolean;
};

type NotificationContextValue = {
  state: NotificationState;
  actions: NotificationActions;
  meta: NotificationMeta;
};

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined
);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertColor>('success');

  const handleSuccess = (message: string) => {
    setOpen(true);
    setMessage(message);
    setSeverity('success');
  };

  const handleError = (error: unknown) => {
    const errorMessage =
      (error as { response?: { data?: { error?: string } } })?.response?.data
        ?.error ?? (error as { message?: string })?.message ?? String(error);
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
        state: { open, message, severity },
        actions: {
          success: handleSuccess,
          error: handleError,
          reset: resetMessages,
        },
        meta: { hasMessage: message.length > 0 },
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export { NotificationContext };
