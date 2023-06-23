import { useState } from 'react';
import ButtonDialog from '../ButtonDialog';
import Preview from './Preview';
import UploadForm from './UploadForm';

export default function ImageUpload() {
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
      />
      {images.length > 0 && (
        <Preview images={images} removeImage={removeImage} />
      )}
    </ButtonDialog>
  );
}
