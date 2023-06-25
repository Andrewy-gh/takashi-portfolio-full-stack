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

  return (
    <ButtonDialog buttonText={'DELETE'} handleOpen={handleOpen} open={open}>
      <DeleteDialog handleClose={handleClose} removeImage={removeImage} />
    </ButtonDialog>
  );
}
