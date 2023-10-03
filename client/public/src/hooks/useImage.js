import { useContext, useEffect, useState } from 'react';
import imageServices from '../services/image';
import { AuthContext } from '../contexts/AuthContext';
import { NotificationContext } from '../contexts/NotificationContext';

export function useImage() {
  const [images, setImages] = useState([]);
  const { handleSuccess, handleError } = useContext(NotificationContext);
  const { handleLogout } = useContext(AuthContext);

  const getAllImages = async () => {
    const initialImages = await imageServices.getAllImages();
    if (initialImages) setImages(initialImages);
  };

  useEffect(() => {
    getAllImages();
  }, []);

  const uploadNewImage = async (content) => {
    try {
      const newImage = await imageServices.uploadNewImage(content);
      if (newImage.success) {
        handleSuccess(newImage.message);
        setImages(images.concat(newImage.data));
      }
    } catch (error) {
      if (error === 'token expired') {
        handleLogout();
      } else {
        handleError(error);
      }
    }
  };

  const updateImageDetails = async (id, content) => {
    try {
      const updatedImage = await imageServices.updateImageDetails(id, content);
      if (updatedImage.success) {
        handleSuccess(updatedImage.message);
        const newImages = images.map((image) =>
          image.id === id ? updatedImage.data : image
        );
        setImages(newImages.data);
      }
    } catch (error) {
      if (error === 'token expired') {
        handleLogout();
      } else {
        handleError(error);
      }
    }
  };

  const removeOneImage = async (id) => {
    try {
      const response = await imageServices.removeOneImage(id);
      if (response.status === 204) {
        handleSuccess('Successfully removed image');
        const newState = images.filter((image) => image.id !== id);
        setImages(newState);
      }
    } catch (error) {
      if (error === 'token expired') {
        handleLogout();
      } else {
        handleError(error);
      }
    }
  };

  const updateImageOrder = async (order) => {
    try {
      const updatedImageOrder = await imageServices.updateImageOrder(order);
      if (updatedImageOrder.success) {
        handleSuccess(updatedImageOrder.message);
        setImages(updatedImageOrder.data);
        return { success: true };
      }
    } catch (error) {
      if (error === 'token expired') {
        handleLogout();
      } else {
        handleError(error);
      }
    }
  };

  return {
    images,
    uploadNewImage,
    updateImageOrder,
    updateImageDetails,
    removeOneImage,
  };
}
