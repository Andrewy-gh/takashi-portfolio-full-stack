import { useRouter } from '@tanstack/react-router';

import type { Breakpoint } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { theme } from '@/theme';

import { client } from '@/api';
import { IImage } from '@server/src/models/image';
import { useDialog } from '@/hooks/use-dialog';

export function DeleteButtonDialog({
  fullScreen,
  image,
}: {
  fullScreen: boolean;
  image: IImage;
}) {
  const router = useRouter();
  const { open, handleOpen, handleClose } = useDialog();

  const handleAgree = async () => {
    const res = await client.api.images[':id'].$delete({
      param: { id: image.id },
    });
    if (res.status === 404 || res.status === 500) {
      const data: { error: string } = await res.json();
      console.log(data.error);
    }
    if (res.ok) {
      const data: { image: IImage } = await res.json();
      console.log(data.image);
      handleClose();
    }
  };

  return (
    <>
      <Button variant="contained" onClick={handleOpen}>
        Delete
      </Button>
      <Dialog
        fullScreen={fullScreen}
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
        maxWidth={'lg' as Breakpoint}
      >
        <DialogContent>
          <DialogTitle sx={{ textAlign: 'center' }}>
            Remove this image from your portfolio?
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: theme.palette.custom.light }}>
              Please note this action is permanent and can not be reversed. You
              will have to upload the image again.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Disagree</Button>
            <Button onClick={handleAgree} autoFocus>
              Agree
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </>
  );
}
