import { useCanGoBack, useRouter } from '@tanstack/react-router';

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

import { useDeleteProjectMutation } from '@/lib/projects.queries';

export function DeleteProjectDialog({
  isOpen,
  id,
}: {
  isOpen: boolean;
  id: number;
}) {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const deleteProject = useDeleteProjectMutation(id);

  const handleDelete = () => {
    deleteProject.mutate(undefined, {
      onSuccess() {
        toast.success('Project deleted');
        router.navigate({
          to: '/projects',
        });
      },
      onError() {
        toast.error('Failed to delete project');
      },
    });
  };

  const handleCancel = () =>
    canGoBack
      ? router.history.back()
      : router.navigate({
          to: '/projects/$projectId',
          params: {
            projectId: id,
          },
        });

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This project will be permanently
            deleted. The images will <b>not be deleted</b> but will have{' '}
            <b>no associated project</b>.
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
