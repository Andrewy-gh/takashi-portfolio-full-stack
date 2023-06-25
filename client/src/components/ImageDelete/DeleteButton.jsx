import { useState } from 'react';
import { useDispatch } from 'react-redux';
import ButtonDialog from '../ButtonDialog';
import DeleteDialog from './DeleteDialog';
import { removeOneImage } from '../../features/imageSlice';
export default function DeleteButton({ image }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  const removeImage = () => dispatch(removeOneImage(image.id));

  const buttonStyle = {
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  return (
    <ButtonDialog
      buttonStyle={buttonStyle}
      buttonText={'DELETE'}
      handleOpen={handleOpen}
      open={open}
      variant={'text'}
    >
      <DeleteDialog handleClose={handleClose} removeImage={removeImage} />
    </ButtonDialog>
  );
}
