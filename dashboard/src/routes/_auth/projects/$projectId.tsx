import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

export const Route = createFileRoute('/_auth/projects/$projectId')({
  params: {
    parse: (params) => ({
      projectId: z.string().min(1).parse(params.projectId),
    }),
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <section className="container space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Projects retired</h1>
      <p className="text-muted-foreground">
        Project detail is no longer available. Use category images instead.
      </p>
    </section>
  );
}
