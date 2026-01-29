import {
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

type DialogActionProps = {
  onCancel: () => void;
  onConfirm: () => void;
  children: React.ReactNode;
};

export const ActionButtons = ({
  onCancel,
  onConfirm,
  children,
}: DialogActionProps) => {
  return (
    <>
      <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
      <AlertDialogAction
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        onClick={onConfirm}
      >
        {children}
      </AlertDialogAction>
    </>
  );
};
