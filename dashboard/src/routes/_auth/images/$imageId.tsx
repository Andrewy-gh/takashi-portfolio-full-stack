import { Suspense, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { ActionButtons } from '@/components/action-buttons';
import { Button } from '@/components/ui/button';
import { DialogBase } from '@/components/dialog-base';
import { EditImageForm } from './-components/edit-image-form';
import { toast } from 'sonner';
import { CircleX, Sparkles, Trash2, ZoomIn } from 'lucide-react';

import {
  useAddFeaturedImageMutation,
  useRemoveFeaturedImageMutation,
} from '@/lib/featured-images.queries';
import {
  imageQueryOptions,
  useDeleteImageMutation,
} from '@/lib/images.queries';
import { projectsSelectQueryOptions } from '@/lib/projects.queries';

export const Route = createFileRoute('/_auth/images/$imageId')({
  params: {
    parse: (params) => ({
      imageId: z.coerce.number().int().parse(params.imageId),
    }),
  },
  loader(opts) {
    opts.context.queryClient.ensureQueryData(
      imageQueryOptions(opts.params.imageId)
    );
    opts.context.queryClient.ensureQueryData(projectsSelectQueryOptions());
  },
  component: RouteComponent,
});

function RouteComponent() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const params = Route.useParams();
  const navigate = useNavigate();
  const { data: image } = useSuspenseQuery(imageQueryOptions(params.imageId));
  const { data: projects } = useSuspenseQuery(projectsSelectQueryOptions());
  const deleteImage = useDeleteImageMutation(image.id);
  const addFeaturedImage = useAddFeaturedImageMutation();
  const removeFeaturedImage = useRemoveFeaturedImageMutation();

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

  const handleDeleteImage = () => {
    deleteImage.mutate(undefined, {
      onSuccess: () => {
        toast.success('Image deleted');
        navigate({
          to: '/images',
        });
      },
      onError: () => {
        toast.error('Failed to delete image');
      },
    });
  };

  return (
    <section className="container space-y-12 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between">
        <h1 className="text-2xl">{image.name}</h1>
        <nav className="flex gap-4">
          <Button
            onClick={() => {
              window.open(image.url, '_blank', 'noopener,noreferrer');
            }}
          >
            <ZoomIn className="h-4 w-4" />
            View
          </Button>
          <Button variant="outline" onClick={handleUpdateFeaturedImage}>
            {image.featuredImageId ? (
              <>
                <CircleX className="mr-2 h-4 w-4" /> Featured
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Featured
              </>
            )}
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </nav>
      </div>
      <img
        src={image?.url}
        alt={image?.description ?? image?.name ?? 'Image'}
      />

      {/* MARK: Edit Image Form */}
      <Suspense fallback={<p>Loading...</p>}>
        <EditImageForm image={image} projects={projects} />
      </Suspense>

      {isDeleteDialogOpen && (
        <DialogBase
          isOpen={isDeleteDialogOpen}
          description="Are you sure you want to delete this image? This action cannot be undone."
        >
          <ActionButtons
            onCancel={() => setIsDeleteDialogOpen(false)}
            onConfirm={handleDeleteImage}
          >
            Delete
          </ActionButtons>
        </DialogBase>
      )}
    </section>
  );
}
