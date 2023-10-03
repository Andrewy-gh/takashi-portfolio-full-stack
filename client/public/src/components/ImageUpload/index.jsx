import { useState } from 'react';
import ButtonDialog from '../ButtonDialog';
import Preview from './Preview';
import UploadForm from './UploadForm';

export default function ImageUpload({ uploadNewImage }) {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState([]);

  const clearImages = () => {
    setImages([]);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setImages([]);
  };

  const submitImageData = (data) => {
    const formData = new FormData();
    for (const image of images) {
      formData.append('file', image.data);
    }
    formData.append('title', data.title);
    formData.append('type', data.type);
    uploadNewImage(formData);
    setImages([]);
  };

  const previewImages = (images) => {
    setImages(images);
  };

  const removeImage = (id) =>
    setImages(images.filter((image) => image.id !== id));

  return (
    <ButtonDialog
      buttonText={'Image Upload'}
      handleClose={handleClose}
      handleOpen={handleOpen}
      open={open}
    >
      <UploadForm
        clearImages={clearImages}
        handleClose={handleClose}
        previewImages={previewImages}
        submitImageData={submitImageData}
      />
      {images.length > 0 && (
        <Preview images={images} removeImage={removeImage} />
      )}
    </ButtonDialog>
  );
}
