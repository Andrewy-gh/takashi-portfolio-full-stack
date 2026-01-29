import { Suspense } from 'react';
import {
  createFileRoute,
  useCanGoBack,
  useRouter,
} from '@tanstack/react-router';
import { useAppForm } from '@/hooks/form';

import { CancelButton } from '@/components/form/cancel-button';
import { toast } from 'sonner';

import { nameDescriptionSchema } from '@/lib/schema';
import { useCreateCategoryMutation } from '@/lib/categories.queries';

export const Route = createFileRoute('/_auth/categories/new')({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const createCategory = useCreateCategoryMutation();
  const form = useAppForm({
    defaultValues: {
      name: '',
      description: '',
    },
    validators: {
      onSubmit: nameDescriptionSchema,
    },
    onSubmit: async ({ value }) => {
      await createCategory.mutateAsync(
        {
          name: value.name,
          description: value.description,
        },
        {
          onSuccess() {
            toast.success('Category created successfully 🎉');
            router.navigate({
              to: '/categories',
            });
          },
          onError() {
            toast.error('Failed to created category');
          },
        }
      );
    },
  });

  const handleCancel = () =>
    canGoBack
      ? router.history.back()
      : router.navigate({
          to: '/categories',
        });

  return (
    <section className="container space-y-12 p-6">
      <h1 className="scroll-m-20 pb-2 text-3xl font-bold leading-relaxed first:mt-0">
        New Category
      </h1>
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
