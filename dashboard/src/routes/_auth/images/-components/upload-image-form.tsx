import { useAppForm, withForm } from '@/hooks/form';
import { useCanGoBack, useRouter } from '@tanstack/react-router';
import { formOptions } from '@tanstack/react-form';

import { Button } from '@/components/ui/button';
import { CancelButton } from '@/components/form/cancel-button';
import { toast } from 'sonner';
import { X } from 'lucide-react';

import type { ImageFile } from '@/lib/types';
import { uploadImageSchema } from '@/lib/schema';
import { useUploadImageMutation } from '@/lib/images.queries';

const formOpts = formOptions({
  defaultValues: {
    files: [] as ImageFile[],
  },
  validators: {
    onChangeAsync: uploadImageSchema,
  },
});

const FilesField = withForm({
  ...formOpts,
  render: ({ form }) => {
    return (
      <>
        <form.AppField name="files" mode="array">
          {(field) => (
            <field.ImageInput>
              <div className="grid grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                {field.state.value?.map((_, index) => (
                  <div key={index} className="relative group">
                    <form.AppField
                      key={`files[${index}].url`}
                      name={`files[${index}].url`}
                      children={(field) => <field.ImagePreviews />}
                    />
                    <form.AppField
                      key={`files[${index}].file`}
                      name={`files[${index}].file`}
                      children={(field) => <field.ImageSize />}
                    />
                    <form.AppField
                      key={`files[${index}].dimensions`}
                      name={`files[${index}].dimensions`}
                      children={(field) => <field.ImageMegaPixels />}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        field.removeValue(index);
                      }}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove image</span>
                    </Button>
                  </div>
                ))}
              </div>
            </field.ImageInput>
          )}
        </form.AppField>
      </>
    );
  },
});

export function UploadImageForm() {
  const router = useRouter();
  const canGoBack = useCanGoBack();

  const uploadImage = useUploadImageMutation();

  const form = useAppForm({
    ...formOpts,
    onSubmit: async ({ value }) => {
      toast.loading('Uploading images...');
      const files = value.files.map((file) => file.file);
      await uploadImage.mutateAsync(
        { files },
        {
          onSuccess() {
            toast.dismiss();
            toast.success('Images uploaded successfully');
            router.navigate({
              to: '/images',
            });
          },
          onError(error) {
            toast.dismiss();
            toast.error(error.message);
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
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-8"
    >
      <FilesField form={form} />
      {/* MARK: Submit */}
      <div className="flex gap-4">
        <form.AppForm>
          <form.SubscribeButton label="Upload" />
        </form.AppForm>
        <CancelButton handleCancel={handleCancel} />
      </div>
    </form>
  );
}
