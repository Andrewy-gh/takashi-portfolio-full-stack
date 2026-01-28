import api from './api';

export type ImageRecord = {
  id: string;
  title?: string | null;
  url?: string | null;
  publicId?: string | null;
  cloudinaryId?: string | null;
  category?: string | null;
  type?: string | null;
};

const getAllImages = async (): Promise<ImageRecord[]> => {
  const response = await api.get('/api/images');
  return response.data;
};

export default {
  getAllImages,
};
