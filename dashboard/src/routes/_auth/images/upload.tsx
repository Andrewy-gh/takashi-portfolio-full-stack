import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';

import { UploadImageForm } from './-components/upload-image-form';

import { projectsSelectQueryOptions } from '@/lib/projects.queries';

export const Route = createFileRoute('/_auth/images/upload')({
  component: RouteComponent,
  loader({ context }) {
    context.queryClient.ensureQueryData(projectsSelectQueryOptions());
  },
});

function RouteComponent() {
  const { data: projects } = useSuspenseQuery(projectsSelectQueryOptions());

  return (
    <section className="container space-y-12 p-6">
      <h1 className="scroll-m-20 pb-2 text-3xl font-bold leading-relaxed first:mt-0">
        Upload Images
      </h1>
      <Suspense fallback={<div>Loading...</div>}>
        <UploadImageForm projects={projects} />
      </Suspense>
    </section>
  );
}