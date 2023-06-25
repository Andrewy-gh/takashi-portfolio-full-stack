import api from './api';

const getCloudName = async () => {
  const response = await api.get('cloudinary');
  return response.data;
};

export default { getCloudName };
