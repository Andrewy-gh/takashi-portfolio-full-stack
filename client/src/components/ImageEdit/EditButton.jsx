import ButtonDialog from '../ButtonDialog';
import EditForm from './EditForm';
import { useDialog } from '../../hooks/useDialog';

export default function EditButton({ image, updateImageDetails }) {
  const { open, handleClose, handleOpen } = useDialog();

  const updateImage = (newData) => updateImageDetails(image.id, newData);

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
        updateImage={updateImage}
      />
    </ButtonDialog>
  );
}
