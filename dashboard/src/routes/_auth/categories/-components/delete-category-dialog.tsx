import { useNavigate } from '@tanstack/react-router';

import {
  ConfirmDialogContent,
  ConfirmDialogRoot,
} from '@/components/confirm-dialog';
import { toast } from 'sonner';

import { useDeleteCategoryMutation } from '@/lib/categories.queries';

export function DeleteCategoryDialog({
  isOpen,
  id,
}: {
  isOpen: boolean;
  id: string;
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
    <ConfirmDialogRoot
      open={isOpen}
      onConfirm={handleDelete}
      onCancel={handleCancel}
      confirmLabel="Delete"
    >
      <ConfirmDialogContent
        description={
          <>
            This action cannot be undone. This category will be permanently
            deleted. The images will <b>not be deleted</b> but will have{' '}
            <b>no associated category</b>.
          </>
        }
        confirmLabel="Delete"
      />
    </ConfirmDialogRoot>
  );
}
