import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/images',
});

let token = null;

const setToken = (newToken) => {
  token = `bearer ${newToken}`;
};

api.interceptors.request.use((config) => {
  if (token) {
    config.headers.Authorization = token;
    config.headers['Cache-Control'] = 'public';
    config.headers['max-age'] = '3600';
  }
  return config;
});

const getAllImages = async () => {
  const response = await api.get('/');
  return response.data;
};

const uploadNewImage = async (content) => {
  const response = await api.post('/', content);
  return response.data;
};

const updateOneImage = async (id, newObject) => {
  const response = await api.put(`/${id}`, newObject);
  return response.data;
};

const updateImageOrder = async (order) => {
  const response = await api.put('/', order);
  return response.data;
};

const removeOneImage = async (id) => {
  const response = await api.delete(`/${id}`);
  return response;
};

export default {
  getAllImages,
  uploadNewImage,
  updateOneImage,
  updateImageOrder,
  removeOneImage,
  setToken,
};
