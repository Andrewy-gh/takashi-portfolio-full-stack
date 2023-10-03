import api from './api';

const getCloudName = async () => {
  const response = await api.get('/api/cloudinary');
  return response.data;
};

export default { getCloudName };
