import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { categoriesSelectQueryOptions } from '@/lib/categories.queries';
import { NewProjectForm } from './-components/new-project-form';

export const Route = createFileRoute('/_auth/projects/new')({
  component: RouteComponent,
  loader({ context }) {
    context.queryClient.ensureQueryData(categoriesSelectQueryOptions());
  },
});

function RouteComponent() {
  const { data: categories } = useSuspenseQuery(categoriesSelectQueryOptions());

  return (
    <section className="container space-y-12 p-6">
      <h1 className="scroll-m-20 pb-2 text-3xl font-bold leading-relaxed first:mt-0">
        New Project
      </h1>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="space-y-8">
          <NewProjectForm categories={categories} />
        </div>
      </Suspense>
    </section>
  );
}
