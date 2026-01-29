import { useAppForm } from '@/hooks/form';
import { useCanGoBack, useRouter } from '@tanstack/react-router';

import { CancelButton } from '@/components/form/cancel-button';
import { toast } from 'sonner';

import type { GetCategoriesSelectResponse } from '@/lib/categories.queries';
import {
  type GetProjectResponse,
  useUpdateProjectMutation,
} from '@/lib/projects.queries';
import { projectSchema } from '@/lib/schema';

export function EditProjectForm({
  categories,
  project,
}: {
  categories: GetCategoriesSelectResponse;
  project: GetProjectResponse;
}) {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const updateProject = useUpdateProjectMutation(project.id);
  const form = useAppForm({
    defaultValues: {
      name: project?.name ?? '',
      description: project?.description ?? '',
      credits: project?.credits ?? '',
      categoryId: project?.categoryId ? String(project?.categoryId) : '',
    },
    validators: {
      onSubmit: projectSchema,
    },
    onSubmit: async ({ value }) => {
      await updateProject.mutateAsync(
        {
          name: value.name,
          description: value.description,
          credits: value.credits,
          categoryId: value.categoryId,
        },
        {
          onSuccess() {
            toast.success('Project updated');
            router.navigate({
              to: '/projects',
            });
          },
          onError() {
            toast.error('Failed to update project');
          },
        }
      );
    },
  });

  const handleCancel = () =>
    canGoBack
      ? router.history.back()
      : router.navigate({
          to: '/projects/$projectId',
          params: {
            projectId: project.id,
          },
        });

  return (
    <section className="space-y-12 p-6">
      <h1 className="scroll-m-20 pb-2 text-3xl font-bold leading-relaxed first:mt-0">
        {project.name}
      </h1>
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
