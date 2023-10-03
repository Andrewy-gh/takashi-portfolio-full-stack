import ButtonDialog from '../ButtonDialog';
import DeleteDialog from './DeleteDialog';
import { useDialog } from '../../hooks/useDialog';

export default function DeleteButton({ image, removeOneImage }) {
  const { open, handleClose, handleOpen } = useDialog();

  const removeImage = () => removeOneImage(image.id);

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
