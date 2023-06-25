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

  return (
    <ButtonDialog buttonText={'EDIT'} handleOpen={handleOpen} open={open}>
      <EditForm
        handleClose={handleClose}
        image={image}
        type={type}
        updateImage={updateImage}
      />
    </ButtonDialog>
  );
}
