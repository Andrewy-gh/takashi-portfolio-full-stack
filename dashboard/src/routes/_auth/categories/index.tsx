import { createFileRoute, Link } from '@tanstack/react-router';
import { categoriesQueryOptions } from '@/lib/categories.queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { CategoriesGrid } from './-components/categories-grid';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/empty-state';
import { Eye, ListOrdered, PlusIcon } from 'lucide-react';

export const Route = createFileRoute('/_auth/categories/')({
  component: RouteComponent,
  loader({ context }) {
    context.queryClient.ensureQueryData(categoriesQueryOptions());
  },
});

function RouteComponent() {
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions());
  return (
    <section className="container space-y-12 p-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <h1 className="scroll-m-20 pb-2 text-3xl font-bold leading-relaxed first:mt-0">
            Categories
          </h1>
          <p className="text-sm text-muted-foreground">
            Organize the portfolio navigation and control the Home page order.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/categories/new">
              <PlusIcon className="mr-2 h-4 w-4" /> New Category
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/categories/preview">
              <Eye className="mr-2 h-4 w-4" /> Preview
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/categories/order">
              <ListOrdered className="mr-2 h-4 w-4" /> Category Order
            </Link>
          </Button>
        </div>
      </div>
      {categories.length ? (
        <CategoriesGrid categories={categories} />
      ) : (
        <EmptyState
          title="No categories yet"
          description="Create your first category to drive the sidebar order and portfolio groups."
          icon={PlusIcon}
          action={
            <Button asChild>
              <Link to="/categories/new">Create Category</Link>
            </Button>
          }
        />
      )}
    </section>
  );
}
