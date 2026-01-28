import api from './api';

type CloudinaryConfig = {
  cloudName: string;
  apiKey?: string;
};

const getCloudinaryConfig = async (): Promise<CloudinaryConfig> => {
  try {
    const response = await api.get('/api/cloudinary/config');
    return response.data;
  } catch {
    const legacy = await api.get('/api/cloudinary');
    if (typeof legacy.data === 'string') {
      return { cloudName: legacy.data };
    }
    return legacy.data;
  }
};

export default { getCloudinaryConfig };
