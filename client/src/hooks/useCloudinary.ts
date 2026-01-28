import { useEffect, useState } from 'react';
import cloudinaryServices from '../services/cloudinary';

export function useCloudinary() {
  const [cloudName, setCloudName] = useState('');
  const getCloudName = async () => {
    const fallback = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? '';
    try {
      const cloudinary = await cloudinaryServices.getCloudinaryConfig();
      setCloudName(cloudinary.cloudName || fallback);
    } catch {
      setCloudName(fallback);
    }
  };

  useEffect(() => {
    getCloudName();
  }, []);

  return { cloudName };
}
