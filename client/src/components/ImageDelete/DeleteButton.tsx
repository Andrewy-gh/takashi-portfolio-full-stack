import ButtonDialog from '../ButtonDialog';
import DeleteDialog from './DeleteDialog';
import { useDialog } from '../../hooks/useDialog';
import type { ImageRecord } from '../../services/image';

export default function DeleteButton({
  image,
  removeOneImage,
}: {
  image: ImageRecord;
  removeOneImage: (id: string) => void;
}) {
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
      handleClose={handleClose}
      open={open}
      variant={'text'}
    >
      <DeleteDialog handleClose={handleClose} removeImage={removeImage} />
    </ButtonDialog>
  );
}
