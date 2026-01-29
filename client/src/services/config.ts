import api from './api';

export type AdminStatusResponse = {
  status: string;
};

export type AdminCreateResponse = {
  success: boolean;
  message: string;
};

export type AdminCredentials = {
  email: string;
  password: string;
};

const checkAdmin = async (): Promise<AdminStatusResponse> => {
  const res = await api.get('/api/config/admin');
  return res.data;
};

const createAdmin = async (
  credentials: AdminCredentials
): Promise<AdminCreateResponse> => {
  const res = await api.post('/api/config/admin', credentials);
  return res.data;
};

export default {
  checkAdmin,
  createAdmin,
};
