import api from './api';

const checkAdmin = async () => {
  const res = await api.get('/api/config/admin');
  return res.data;
};

const createAdmin = async (credentials) => {
  const res = await api.post('/api/config/admin', credentials);
  return res.data;
};

export default {
  checkAdmin,
  createAdmin,
};
