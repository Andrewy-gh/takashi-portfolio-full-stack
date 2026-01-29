import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_auth/categories/$categoryId_/project-order'
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <section className="container space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Image ordering</h1>
      <p className="text-muted-foreground">
        Category-level image ordering is not wired yet. Use the default sort
        mode for now.
      </p>
    </section>
  );
}
