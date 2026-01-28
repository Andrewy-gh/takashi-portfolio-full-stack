import { useEffect, useState } from 'react';
import imageServices, { ImageRecord } from '../services/image';

export function useImage() {
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAllImages = async () => {
    try {
      const initialImages = await imageServices.getAllImages();
      setImages(Array.isArray(initialImages) ? initialImages : []);
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to load images';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllImages();
  }, []);

  return {
    images,
    isLoading,
    error,
  };
}
