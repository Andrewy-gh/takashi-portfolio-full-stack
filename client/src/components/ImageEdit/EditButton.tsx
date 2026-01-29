import ButtonDialog from '../ButtonDialog';
import EditForm from './EditForm';
import { useDialog } from '../../hooks/useDialog';
import type { ImageRecord } from '../../services/image';

export default function EditButton({
  image,
  updateImageDetails,
}: {
  image: ImageRecord;
  updateImageDetails: (id: string, updates: Partial<ImageRecord>) => void;
}) {
  const { open, handleClose, handleOpen } = useDialog();

  const updateImage = (newData: Partial<ImageRecord>) =>
    updateImageDetails(image.id, newData);

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
      handleClose={handleClose}
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
