import api from './api';

export const login = async (credentials) => {
  const response = await api.post('/auth', credentials);
  return response.data;
};
