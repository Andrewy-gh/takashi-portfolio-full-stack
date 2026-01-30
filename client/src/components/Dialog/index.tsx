/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import type { ButtonProps } from '@mui/material/Button';
import MuiDialog from '@mui/material/Dialog';
import type { DialogProps } from '@mui/material/Dialog';
import MuiDialogContent from '@mui/material/DialogContent';
import type { SxProps, Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { theme } from '../../styles/styles';

type DialogContextValue = {
  open: boolean;
  openDialog: () => void;
  closeDialog: () => void;
};

const DialogContext = createContext<DialogContextValue | undefined>(undefined);

export function useDialogContext(): DialogContextValue {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialogContext must be used within DialogRoot');
  }
  return context;
}

type DialogRootProps = {
  children: ReactNode;
  defaultOpen?: boolean;
};

export function DialogRoot({ children, defaultOpen = false }: DialogRootProps) {
  const [open, setOpen] = useState(defaultOpen);

  const value = useMemo(
    () => ({
      open,
      openDialog: () => setOpen(true),
      closeDialog: () => setOpen(false),
    }),
    [open]
  );

  return (
    <DialogContext.Provider value={value}>{children}</DialogContext.Provider>
  );
}

type DialogTriggerProps = ButtonProps & {
  sx?: SxProps<Theme>;
};

export function DialogTrigger({
  children,
  onClick,
  ...props
}: DialogTriggerProps) {
  const { openDialog } = useDialogContext();

  const handleClick: ButtonProps['onClick'] = (event) => {
    onClick?.(event);
    openDialog();
  };

  return (
    <Button {...props} onClick={handleClick}>
      {children}
    </Button>
  );
}

type DialogContentProps = {
  children: ReactNode;
  maxWidth?: DialogProps['maxWidth'];
  'aria-labelledby'?: string;
};

export function DialogContent({
  children,
  maxWidth = 'desktop',
  'aria-labelledby': ariaLabelledby,
}: DialogContentProps) {
  const { open, closeDialog } = useDialogContext();
  const fullScreen = useMediaQuery(theme.breakpoints.down('tablet'));

  return (
    <MuiDialog
      fullScreen={fullScreen}
      open={open}
      onClose={closeDialog}
      aria-labelledby={ariaLabelledby}
      maxWidth={maxWidth}
    >
      <MuiDialogContent>{children}</MuiDialogContent>
    </MuiDialog>
  );
}
