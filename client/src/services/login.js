import api from './api';

export const getLoginUrl = async () => {
  const response = await api.get('/login');
  return response.data.url;
};
