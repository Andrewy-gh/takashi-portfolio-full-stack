import api from './api';

export type LoginCredentials = {
  email: string;
  password: string;
};

export const login = async (
  credentials: LoginCredentials
): Promise<string> => {
  const response = await api.post('/auth', credentials);
  return response.data;
};
