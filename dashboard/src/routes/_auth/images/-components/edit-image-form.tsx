import { useAppForm } from '@/hooks/form';
import { useCanGoBack, useRouter } from '@tanstack/react-router';

import { CancelButton } from '@/components/form/cancel-button';
import { toast } from 'sonner';

import { editImageSchema } from '@/lib/schema';
import {
  type GetImageByIdResponse,
  useUpdateImageMutation,
} from '@/lib/images.queries';

export function EditImageForm({ image }: { image: GetImageByIdResponse }) {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const updateImage = useUpdateImageMutation(image.id);

  const form = useAppForm({
    defaultValues: {
      name: image?.title ?? '',
      description: '',
    },
    validators: {
      onSubmit: editImageSchema,
    },
    onSubmit: async ({ value }) => {
      await updateImage.mutateAsync(
        {
          name: value.name,
          description: value.description,
        },
        {
          onSuccess: () => {
            toast.success('Image updated');
          },
          onError: () => {
            toast.error('Failed to update image');
          },
        }
      );
    },
  });

  const handleCancel = () =>
    canGoBack
      ? router.history.back()
      : router.navigate({
          to: '/images',
        });

  return (
    <section className="space-y-8">
      <h2 className="text-2xl">Edit Image</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-8"
      >
        <form.AppField
          name="name"
          children={(field) => <field.TextField label="Title:" />}
        />
        <form.AppField
          name="description"
          children={(field) => <field.TextArea label="Description:" />}
        />
        <div className="flex gap-4">
          <form.AppForm>
            <form.SubscribeButton label="Submit" />
          </form.AppForm>
          <CancelButton handleCancel={handleCancel} />
        </div>
      </form>
    </section>
  );
}
