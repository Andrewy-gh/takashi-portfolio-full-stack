import { Suspense } from 'react';
import { useAppForm } from '@/hooks/form';
import { useCanGoBack, useRouter } from '@tanstack/react-router';

import { CancelButton } from '@/components/form/cancel-button';
import { toast } from 'sonner';

import {
  type GetCategoryByIdResponse,
  useUpdateCategoryMutation,
} from '@/lib/categories.queries';
import { nameDescriptionSchema } from '@/lib/schema';

export function EditCategoryForm({
  category,
}: {
  category: GetCategoryByIdResponse;
}) {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const updateCategory = useUpdateCategoryMutation(category.id);
  const form = useAppForm({
    defaultValues: {
      name: category?.name ?? '',
      description: category?.description ?? '',
    },
    validators: {
      onSubmit: nameDescriptionSchema,
    },
    onSubmit: async ({ value }) => {
      await updateCategory.mutateAsync(
        {
          name: value.name,
          description: value.description,
        },
        {
          onSuccess() {
            toast.success('Category updated.');
            router.navigate({
              to: '/categories',
            });
          },
          onError() {
            toast.error('Failed to update category');
          },
        }
      );
    },
  });

  const handleCancel = () =>
    canGoBack
      ? router.history.back()
      : router.navigate({
          to: '/categories/$categoryId',
          params: {
            categoryId: category.id,
          },
        });

  return (
    <section className="container space-y-12 p-6">
      <div className="space-y-2">
        <h1 className="scroll-m-20 pb-2 text-3xl font-bold leading-relaxed first:mt-0">
          {category.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          Update the category name or description.
        </p>
      </div>
      <Suspense fallback={<p>Loading...</p>}>
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
          <div className="flex gap-4">
            <form.AppForm>
              <form.SubscribeButton label="Submit" />
            </form.AppForm>
            <CancelButton handleCancel={handleCancel} />
          </div>
        </form>
      </Suspense>
    </section>
  );
}
