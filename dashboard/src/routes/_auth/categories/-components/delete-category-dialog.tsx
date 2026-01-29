import { useNavigate } from '@tanstack/react-router';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

import { useDeleteCategoryMutation } from '@/lib/categories.queries';

export function DeleteCategoryDialog({
  isOpen,
  id,
}: {
  isOpen: boolean;
  id: number;
}) {
  const navigate = useNavigate();
  const deleteCategory = useDeleteCategoryMutation(id);

  const handleDelete = () => {
    deleteCategory.mutate(undefined, {
      onSuccess() {
        toast.success('Category deleted');
        navigate({
          to: '/categories',
        });
      },
      onError() {
        toast.error('Failed to delete category');
      },
    });
  };

  const handleCancel = () =>
    navigate({
      to: '/categories/$categoryId',
      params: {
        categoryId: id,
      },
    });

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This category will be permanently
            deleted. The projects will <b>not be deleted</b> but will have{' '}
            <b>no associated category</b>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleDelete}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
