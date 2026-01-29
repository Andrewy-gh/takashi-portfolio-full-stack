import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/projects/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <section className="container space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Projects retired</h1>
      <p className="text-muted-foreground">
        Projects are no longer used. Manage images inside categories instead.
      </p>
    </section>
  );
}
