import type { Breakpoint } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';

import { IImage } from '@server/src/models/image';
import { useDialog } from '@/hooks/use-dialog';
import { EditForm } from './edit-form';

export function EditButtonDialog({
  fullScreen,
  image,
}: {
  fullScreen: boolean;
  image: IImage;
}) {
  const { open, handleOpen, handleClose } = useDialog();
  return (
    <>
      <Button variant="contained" onClick={handleOpen}>
        Edit
      </Button>
      <Dialog
        fullScreen={fullScreen}
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
        maxWidth={'lg' as Breakpoint}
      >
        <DialogContent>
          <EditForm image={image} onClose={() => handleClose()} />
        </DialogContent>
      </Dialog>
    </>
  );
}
