import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/projects/new')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <section className="container space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Projects retired</h1>
      <p className="text-muted-foreground">
        Project creation has been removed. Use categories and images instead.
      </p>
    </section>
  );
}
