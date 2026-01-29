import type { ReactNode } from 'react';
import Button from '@mui/material/Button';
import type { ButtonProps } from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import type { SxProps, Theme } from '@mui/material/styles';
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
}: {
  children: ReactNode;
  buttonStyle?: SxProps<Theme>;
  variant?: ButtonProps['variant'];
  buttonText: string;
  handleOpen: () => void;
  handleClose: () => void;
  open: boolean;
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
        maxWidth="desktop"
      >
        <DialogContent>{children}</DialogContent>
      </Dialog>
    </>
  );
}
