import { useState } from 'react';
import ButtonDialog from '../ButtonDialog';
import UploadForm from './UploadForm';

export default function ImageUpload() {
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <ButtonDialog
      buttonText={'Image Upload'}
      handleClose={handleClose}
      handleOpen={handleOpen}
      open={open}
    >
      <UploadForm handleClose={handleClose} />
    </ButtonDialog>
  );
}
