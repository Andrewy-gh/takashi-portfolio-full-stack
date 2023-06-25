import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import useMediaQuery from '@mui/material/useMediaQuery';
import { theme } from '../styles/styles';

export default function ButtonDialog({
  children,
  buttonStyle,
  variant = 'contained',
  buttonText,
  handleOpen,
  handleClose,
  open,
}) {
  const fullScreen = useMediaQuery(theme.breakpoints.down('tablet'));

  return (
    <>
      <Button variant={variant} onClick={handleOpen} sx={buttonStyle}>
        {buttonText}
      </Button>

      <Dialog
        fullScreen={fullScreen}
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
        maxWidth="lg"
      >
        <DialogContent>{children}</DialogContent>
      </Dialog>
    </>
  );
}
