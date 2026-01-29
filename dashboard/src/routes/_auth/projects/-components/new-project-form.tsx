import { useAppForm, withForm } from '@/hooks/form';
import { useCanGoBack, useRouter } from '@tanstack/react-router';
import { formOptions } from '@tanstack/react-form';

import { Button } from '@/components/ui/button';
import { CancelButton } from '@/components/form/cancel-button';
import { toast } from 'sonner';
import { X } from 'lucide-react';

import type { GetCategoriesSelectResponse } from '@/lib/categories.queries';
import type { ImageFile } from '@/lib/types';
import { projectSchemaWithFiles } from '@/lib/schema';
import { useCreateProjectMutation } from '@/lib/projects.queries';

const formOpts = formOptions({
  defaultValues: {
    name: '',
    description: '',
    credits: '',
    categoryId: '',
    files: [] as ImageFile[],
  },
  validators: {
    onChangeAsync: projectSchemaWithFiles,
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

export function NewProjectForm({
  categories,
}: {
  categories: GetCategoriesSelectResponse;
}) {
  const router = useRouter();
  const canGoBack = useCanGoBack();

  const createProject = useCreateProjectMutation();

  const form = useAppForm({
    ...formOpts,
    onSubmit: async ({ value }) => {
      toast.loading('Creating projects...');
      const files = value.files.map((file) => file.file);
      await createProject.mutateAsync(
        { ...value, files },
        {
          onSuccess() {
            toast.dismiss();
            toast.success('Project created successfully 🎉');
            router.navigate({
              to: '/projects',
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
          to: '/projects',
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
      <form.AppField
        name="name"
        children={(field) => <field.TextField label="Name:" />}
      />
      <form.AppField
        name="description"
        children={(field) => <field.TextArea label="Description:" />}
      />
      <form.AppField
        name="credits"
        children={(field) => <field.TextArea label="Credits:" />}
      />
      <form.AppField
        name="categoryId"
        children={(field) => <field.CategorySelect categories={categories} />}
      />
      <FilesField form={form} />
      <div className="flex gap-4">
        <form.AppForm>
          <form.SubscribeButton label="Submit" />
        </form.AppForm>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            form.reset();
          }}
        >
          Reset
        </Button>
        <CancelButton handleCancel={handleCancel} />
      </div>
    </form>
  );
}
