import { useNavigate } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  ConfirmDialogContent,
  ConfirmDialogRoot,
  ConfirmDialogTrigger,
} from '@/components/confirm-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

import { useDeleteImageMutation } from '@/lib/images.queries';

export function ImageOptionsMenu({
  image,
}: {
  image: {
    id: string;
    title?: string | null;
    url: string;
  };
}) {
  const navigate = useNavigate();
  const deleteImage = useDeleteImageMutation(image.id);

  const handleDeleteImage = () => {
    deleteImage.mutate(undefined, {
      onSuccess: () => {
        toast.success('Image deleted');
      },
      onError: () => {
        toast.error('Failed to delete image');
      },
    });
  };


  const handleViewClick = () => {
    window.open(image.url, '_blank', 'noopener,noreferrer');
  };

  const handleEditClick = () => {
    navigate({
      to: `/images/$imageId`,
      params: {
        imageId: image.id,
      },
    });
  };

  return (
    <ConfirmDialogRoot onConfirm={handleDeleteImage} confirmLabel="Delete">
      <div className="absolute inset-0 cursor-pointer bg-black bg-opacity-0 text-white opacity-0 transition-opacity duration-300 group-hover:bg-opacity-25 group-hover:opacity-100">
        <div className="right-2 p-2">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={handleViewClick}>View</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleEditClick}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <ConfirmDialogTrigger asChild>
                <DropdownMenuItem className="text-red-500">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </ConfirmDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <ConfirmDialogContent
            description={
              <>
                Are you sure you want to delete{' '}
                <b>{image.title ?? 'this image'}</b>? This action cannot be
                undone.
              </>
            }
          />
        </div>
      </div>
    </ConfirmDialogRoot>
  );
}



