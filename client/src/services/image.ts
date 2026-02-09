import api from './api';

export type ImageRecord = {
  id: string;
  title?: string | null;
  url?: string | null;
  publicId?: string | null;
  cloudinaryId?: string | null;
  width?: number | null;
  height?: number | null;
  category?: string | null;
  type?: string | null;
};

const getAllImages = async (): Promise<ImageRecord[]> => {
  const response = await api.get('/api/images');
  const data = response.data as unknown;

  // Legacy API: `ImageRecord[]`
  if (Array.isArray(data)) return data as ImageRecord[];

  // Current API: `{ images: ImageRecord[]; ...pagination }`
  if (data && typeof data === 'object' && 'images' in data) {
    const images = (data as { images?: unknown }).images;
    return Array.isArray(images) ? (images as ImageRecord[]) : [];
  }

  return [];
};

export default {
  getAllImages,
};
