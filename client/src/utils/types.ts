export type Credentials = { email: string; password: string };

// Context types
export type AuthContextType = {
  loggedIn: boolean;
  token: Credentials | null;
  handleLogin: (credentials: Credentials) => Promise<void>;
  handleLogout: () => void;
  setCredentials: (credentials: Credentials) => void;
};

export type ErrorResponse = {
  response?: {
    data?: {
      error?: string;
    };
  };
};

export type NotificationContextType = {
  open: boolean;
  message: string;
  severity: string;
  handleSuccess: (message: string) => void;
  handleError: (error: ErrorResponse | string) => void;
  resetMessages: () => void;
};
