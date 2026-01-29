import { useState } from 'react';
import ButtonDialog from '../ButtonDialog';
import Preview from './Preview';
import UploadForm from './UploadForm';
import type { SxProps, Theme } from '@mui/material/styles';

export type PreviewImage = {
  id: number;
  preview: string;
  data: File;
};

type UploadFormData = {
  title: string;
  type: string;
  file?: FileList;
};

export default function ImageUpload({
  uploadNewImage,
  buttonStyle,
  style,
}: {
  uploadNewImage: (data: FormData) => void | Promise<void>;
  buttonStyle?: SxProps<Theme>;
  style?: SxProps<Theme>;
}) {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<PreviewImage[]>([]);
  const resolvedButtonStyle = buttonStyle ?? style;

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

  const submitImageData = (data: UploadFormData) => {
    const formData = new FormData();
    for (const image of images) {
      formData.append('file', image.data);
    }
    formData.append('title', data.title);
    formData.append('type', data.type);
    uploadNewImage(formData);
    setImages([]);
  };

  const previewImages = (images: PreviewImage[]) => {
    setImages(images);
  };

  const removeImage = (id: number) =>
    setImages(images.filter((image) => image.id !== id));

  return (
    <ButtonDialog
      buttonText={'Image Upload'}
      handleClose={handleClose}
      handleOpen={handleOpen}
      open={open}
      buttonStyle={resolvedButtonStyle}
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
