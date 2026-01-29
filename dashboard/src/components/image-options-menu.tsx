import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import {
  CirclePlus,
  CircleX,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
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
import { toast } from 'sonner';

import {
  useAddFeaturedImageMutation,
  useRemoveFeaturedImageMutation,
} from '@/lib/featured-images.queries';
import { useDeleteImageMutation } from '@/lib/images.queries';
import { cn } from '@/lib/utils';

export function ImageOptionsMenu({
  image,
}: {
  image: {
    id: number;
    name: string;
    url: string;
    featuredImageId: number | null;
  };
}) {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const deleteImage = useDeleteImageMutation(image.id);
  const removeFeaturedImage = useRemoveFeaturedImageMutation();
  const addFeaturedImage = useAddFeaturedImageMutation();

  const handleOpenDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
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

  const handleUpdateFeaturedImage = () => {
    if (image.featuredImageId) {
      removeFeaturedImage.mutate(image.featuredImageId, {
        onSuccess: () => {
          toast.success('Image removed from featured images');
        },
        onError: () => {
          toast.error('Failed to remove image from featured images');
        },
      });
    } else {
      addFeaturedImage.mutate(image.id, {
        onSuccess: () => {
          toast.success('Image added to featured images 🎉');
        },
        onError: () => {
          toast.error('Failed to add image to featured images');
        },
      });
    }
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
            <DropdownMenuItem
              onClick={handleUpdateFeaturedImage}
              className={cn(image.featuredImageId && 'text-red-500')}
            >
              {image.featuredImageId ? (
                <>
                  <CircleX className="mr-2 h-4 w-4" /> Featured
                </>
              ) : (
                <>
                  <CirclePlus className="mr-2 h-4 w-4" />
                  Featured
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleOpenDeleteDialog}
              className="text-red-500"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* MARK: Dialog */}
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
              onCancel={handleCloseDeleteDialog}
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
