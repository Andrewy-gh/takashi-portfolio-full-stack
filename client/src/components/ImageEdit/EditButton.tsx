import EditForm from './EditForm';
import { DialogContent, DialogRoot, DialogTrigger } from '../Dialog';
import type { ImageRecord } from '../../services/image';

export default function EditButton({
  image,
  updateImageDetails,
}: {
  image: ImageRecord;
  updateImageDetails: (id: string, updates: Partial<ImageRecord>) => void;
}) {
  const updateImage = (newData: Partial<ImageRecord>) =>
    updateImageDetails(image.id, newData);

  const buttonStyle = {
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  return (
    <DialogRoot>
      <DialogTrigger variant="text" sx={buttonStyle}>
        EDIT
      </DialogTrigger>
      <DialogContent maxWidth="desktop">
        <EditForm image={image} updateImage={updateImage} />
      </DialogContent>
    </DialogRoot>
  );
}
