import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { ActionButtons } from '@/components/action-buttons';
import { DialogBase } from '@/components/dialog-base';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  CirclePlus,
  CircleX,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { useUpdateProjectThumbnailMutation } from '@/lib/projects.queries';
import {
  useDeleteImageMutation,
  useUpdateImageMutation,
} from '@/lib/images.queries';

export function ProjectOptionsMenu({
  image,
  project,
}: {
  image: { id: number; name: string; url: string };
  project: { id: number; thumbnailId: number | null };
}) {
  const navigate = useNavigate();
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const updateProjectThumbnail = useUpdateProjectThumbnailMutation(project.id);
  const updateImage = useUpdateImageMutation(image.id);
  const deleteImage = useDeleteImageMutation(image.id);

  const handleUpdateProjectThumbnail = () => {
    if (project.thumbnailId === image.id) {
      updateProjectThumbnail.mutate(null, {
        onSuccess: () => {
          toast.success('Thumbnail removed 🎉');
        },
        onError: (error) => {
          toast.error(error.message);
        },
      });
    } else {
      updateProjectThumbnail.mutate(image.id, {
        onSuccess: () => {
          toast.success('Thumbnail added 🎉');
        },
        onError: (error) => {
          toast.error(error.message);
        },
      });
    }
  };

  const handleRemoveImage = () => {
    setIsRemoveDialogOpen(false);
    updateImage.mutate(
      { projectId: null },
      {
        onSuccess: () => {
          toast.success('Image updated');
        },
        onError: () => {
          toast.error('Failed to delete image');
        },
      }
    );
  };

  const handleDeleteImage = () => {
    setIsDeleteDialogOpen(false);
    deleteImage.mutate(undefined, {
      onSuccess: () => {
        toast.success('Image deleted');
      },
      onError: () => {
        toast.error('Failed to delete image');
      },
    });
  };

  return (
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
            {/* MARK: View */}
            <DropdownMenuItem
              onClick={() =>
                window.open(image.url, '_blank', 'noopener,noreferrer')
              }
            >
              View
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {/* MARK: Edit */}
            <DropdownMenuItem
              onClick={() =>
                navigate({
                  to: `/images/$imageId`,
                  params: {
                    imageId: image.id,
                  },
                })
              }
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            {/* MARK: Thumbnail */}
            <DropdownMenuItem
              onClick={handleUpdateProjectThumbnail}
              className={cn(
                project.thumbnailId &&
                  project.thumbnailId === image.id &&
                  'text-red-500'
              )}
            >
              {project.thumbnailId && project.thumbnailId === image.id ? (
                <>
                  <CircleX className="mr-2 h-4 w-4" /> Thumbnail
                </>
              ) : (
                <>
                  <CirclePlus className="mr-2 h-4 w-4" />
                  Thumbnail
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setIsRemoveDialogOpen(true)}
              className="text-red-500"
            >
              <CircleX className="mr-2 h-4 w-4" />
              Remove
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-red-500"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* MARK: Dialogs */}
        {isRemoveDialogOpen && (
          <DialogBase
            isOpen={isRemoveDialogOpen}
            description={
              <>
                Are you sure you want to remove <b>{image.name}</b> from the
                project?
              </>
            }
          >
            <ActionButtons
              onCancel={() => setIsRemoveDialogOpen(false)}
              onConfirm={handleRemoveImage}
            >
              Remove
            </ActionButtons>
          </DialogBase>
        )}
        {isDeleteDialogOpen && (
          <DialogBase
            isOpen={isDeleteDialogOpen}
            description={
              <>
                Are you sure you want to delete <b>{image.name}</b>? This action
                cannot be undone.
              </>
            }
          >
            <ActionButtons
              onCancel={() => setIsDeleteDialogOpen(false)}
              onConfirm={handleDeleteImage}
            >
              Delete
            </ActionButtons>
          </DialogBase>
        )}
      </div>
    </div>
  );
}
