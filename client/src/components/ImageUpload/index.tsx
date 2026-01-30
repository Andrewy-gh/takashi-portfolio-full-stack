import { useEffect, useState } from 'react';
import Preview from './Preview';
import UploadForm from './UploadForm';
import type { SxProps, Theme } from '@mui/material/styles';
import { DialogContent, DialogRoot, DialogTrigger, useDialogContext } from '../Dialog';

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
  triggerSx,
}: {
  uploadNewImage: (data: FormData) => void | Promise<void>;
  triggerSx?: SxProps<Theme>;
}) {
  return (
    <DialogRoot>
      <ImageUploadDialog uploadNewImage={uploadNewImage} triggerSx={triggerSx} />
    </DialogRoot>
  );
}

function ImageUploadDialog({
  uploadNewImage,
  triggerSx,
}: {
  uploadNewImage: (data: FormData) => void | Promise<void>;
  triggerSx?: SxProps<Theme>;
}) {
  const [images, setImages] = useState<PreviewImage[]>([]);
  const { open } = useDialogContext();

  const clearImages = () => {
    setImages([]);
  };

  useEffect(() => {
    if (!open) {
      setImages([]);
    }
  }, [open]);

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
    <>
      <DialogTrigger sx={triggerSx}>Image Upload</DialogTrigger>
      <DialogContent maxWidth="desktop">
        <UploadForm
          clearImages={clearImages}
          previewImages={previewImages}
          submitImageData={submitImageData}
        />
        {images.length > 0 && (
          <Preview images={images} removeImage={removeImage} />
        )}
      </DialogContent>
    </>
  );
}
