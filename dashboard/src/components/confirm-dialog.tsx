import type { ComponentProps, ReactNode } from 'react';
import { createContext, useContext } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type ConfirmDialogContextValue = {
  onConfirm: () => void;
  onCancel?: () => void;
  confirmLabel: string;
  cancelLabel: string;
};

const ConfirmDialogContext = createContext<ConfirmDialogContextValue | undefined>(
  undefined
);

function useConfirmDialogContext() {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error('useConfirmDialogContext must be used within ConfirmDialog');
  }
  return context;
}

export function ConfirmDialogRoot({
  children,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  open,
  onOpenChange,
}: {
  children: ReactNode;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <ConfirmDialogContext.Provider
      value={{ onConfirm, onCancel, confirmLabel, cancelLabel }}
    >
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        {children}
      </AlertDialog>
    </ConfirmDialogContext.Provider>
  );
}

export function ConfirmDialogTrigger({
  children,
  ...props
}: ComponentProps<typeof AlertDialogTrigger>) {
  return <AlertDialogTrigger {...props}>{children}</AlertDialogTrigger>;
}

export function ConfirmDialogContent({
  title = 'Are you absolutely sure?',
  description,
  children,
  confirmLabel,
  cancelLabel,
}: {
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
}) {
  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        {description ? (
          <AlertDialogDescription>{description}</AlertDialogDescription>
        ) : null}
      </AlertDialogHeader>
      {children}
      <ConfirmDialogActions
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
      />
    </AlertDialogContent>
  );
}

export function ConfirmDialogActions({
  confirmLabel,
  cancelLabel,
}: {
  confirmLabel?: string;
  cancelLabel?: string;
}) {
  const { onConfirm, onCancel, confirmLabel: defaultConfirm, cancelLabel: defaultCancel } =
    useConfirmDialogContext();
  return (
    <AlertDialogFooter>
      <AlertDialogCancel onClick={onCancel}>
        {cancelLabel ?? defaultCancel}
      </AlertDialogCancel>
      <AlertDialogAction
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        onClick={onConfirm}
      >
        {confirmLabel ?? defaultConfirm}
      </AlertDialogAction>
    </AlertDialogFooter>
  );
}
