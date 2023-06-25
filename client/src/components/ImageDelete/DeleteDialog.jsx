import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { theme } from '../../styles/styles';

export default function DeleteDialog({ handleClose, removeImage }) {
  const handleAgree = () => {
    removeImage();
    handleClose();
  };
  return (
    <>
      <DialogTitle sx={{ textAlign: 'center' }}>
        Remove this image from your portfolio?
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: theme.palette.custom.light }}>
          Please note this action is permanent and can not be reversed. You will
          have to upload the image again.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Disagree</Button>
        <Button onClick={handleAgree} autoFocus>
          Agree
        </Button>
      </DialogActions>
    </>
  );
}
