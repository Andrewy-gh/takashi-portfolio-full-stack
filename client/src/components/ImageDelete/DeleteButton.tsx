import DeleteDialog from './DeleteDialog';
import { DialogContent, DialogRoot, DialogTrigger } from '../Dialog';
import type { ImageRecord } from '../../services/image';

export default function DeleteButton({
  image,
  removeOneImage,
}: {
  image: ImageRecord;
  removeOneImage: (id: string) => void;
}) {
  const removeImage = () => removeOneImage(image.id);

  const buttonStyle = {
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  return (
    <DialogRoot>
      <DialogTrigger variant="text" sx={buttonStyle}>
        DELETE
      </DialogTrigger>
      <DialogContent maxWidth="desktop">
        <DeleteDialog removeImage={removeImage} />
      </DialogContent>
    </DialogRoot>
  );
}
