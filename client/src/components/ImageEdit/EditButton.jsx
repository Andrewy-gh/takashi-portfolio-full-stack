import { useState } from 'react';
import { useDispatch } from 'react-redux';
import ButtonDialog from '../ButtonDialog';
import EditForm from './EditForm';
import { updateOneImage } from '../../features/imageSlice';

export default function EditButton({ image, type }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  const updateImage = (newData) => dispatch(updateOneImage(image.id, newData));

  const buttonStyle = {
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  return (
    <ButtonDialog
      variant={'text'}
      buttonText={'EDIT'}
      buttonStyle={buttonStyle}
      handleOpen={handleOpen}
      open={open}
    >
      <EditForm
        handleClose={handleClose}
        image={image}
        type={type}
        updateImage={updateImage}
      />
    </ButtonDialog>
  );
}
