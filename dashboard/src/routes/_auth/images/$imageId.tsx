import { Suspense } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  ConfirmDialogContent,
  ConfirmDialogRoot,
  ConfirmDialogTrigger,
} from '@/components/confirm-dialog';
import { EditImageForm } from './-components/edit-image-form';
import { toast } from 'sonner';
import { Trash2, ZoomIn } from 'lucide-react';

import {
  imageQueryOptions,
  useDeleteImageMutation,
} from '@/lib/images.queries';

export const Route = createFileRoute('/_auth/images/$imageId')({
  params: {
    parse: (params) => ({
      imageId: z.string().min(1).parse(params.imageId),
    }),
  },
  loader(opts) {
    opts.context.queryClient.ensureQueryData(
      imageQueryOptions(opts.params.imageId)
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  const navigate = useNavigate();
  const { data: image } = useSuspenseQuery(imageQueryOptions(params.imageId));
  const deleteImage = useDeleteImageMutation(image.id);

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
        <h1 className="text-2xl">{image.title ?? 'Image'}</h1>
        <ConfirmDialogRoot onConfirm={handleDeleteImage} confirmLabel="Delete">
          <nav className="flex gap-4">
            <Button
              onClick={() => {
                window.open(image.url, '_blank', 'noopener,noreferrer');
              }}
            >
              <ZoomIn className="h-4 w-4" />
              View
            </Button>
            <ConfirmDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </ConfirmDialogTrigger>
          </nav>
          <ConfirmDialogContent
            description="Are you sure you want to delete this image? This action cannot be undone."
          />
        </ConfirmDialogRoot>
      </div>
      <img src={image?.url} alt={image?.title ?? 'Image'} />

      {/* MARK: Edit Image Form */}
      <Suspense fallback={<p>Loading...</p>}>
        <EditImageForm image={image} />
      </Suspense>
    </section>
  );
}
