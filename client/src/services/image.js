import api from './api';

const getAllImages = async () => {
  const response = await api.get('/images');
  return response.data;
};

const updateImageOrder = async (order) => {
  const response = await api.put('/images', order);
  return response.data;
};

const uploadNewImage = async (content) => {
  // having an issue here the token is not being found in my middleware but other requests are fine
  console.log('services: ', content);
  const response = await api.post('/images', content);
  console.log('service response: ', response);
  return response.data;
};

const updateOneImage = async (id, newObject) => {
  const response = await api.put(`/images/${id}`, newObject);
  return response.data;
};

const removeOneImage = async (id) => {
  const response = await api.delete(`/images/${id}`);
  return response;
};

export default {
  getAllImages,
  uploadNewImage,
  updateOneImage,
  updateImageOrder,
  removeOneImage,
};
