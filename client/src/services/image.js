import api from './api';

const getAllImages = async () => {
  const response = await api.get('/api/images');
  return response.data;
};

const uploadNewImage = async (content) => {
  const response = await api.post('/api/images', content);
  return response.data;
};

const updateImageDetails = async (id, newObject) => {
  const response = await api.put(`/api/images/${id}`, newObject);
  return response.data;
};

const updateImageOrder = async (order) => {
  const response = await api.put('/api/images', order);
  return response.data;
};

const removeOneImage = async (id) => {
  const response = await api.delete(`/api/images/${id}`);
  return response;
};

export default {
  getAllImages,
  uploadNewImage,
  updateImageOrder,
  updateImageDetails,
  removeOneImage,
};
