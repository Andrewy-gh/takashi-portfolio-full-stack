import { useEffect, useState } from 'react';
import cloudinaryServices from '../services/cloudinary';

export function useCloudinary() {
  const [cloudName, setCloudName] = useState('');
  const getCloudName = async () => {
    const cloudinary = await cloudinaryServices.getCloudName();
    setCloudName(cloudinary);
  };

  useEffect(() => {
    getCloudName();
  }, []);

  return { cloudName };
}
