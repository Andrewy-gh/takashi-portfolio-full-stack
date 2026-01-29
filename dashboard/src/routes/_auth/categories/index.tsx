import { createFileRoute, Link } from '@tanstack/react-router';
import { categoriesQueryOptions } from '@/lib/categories.queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { CategoriesGrid } from './-components/categories-grid';
import { Button } from '@/components/ui/button';
import { ListOrdered, PlusIcon } from 'lucide-react';

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
        <h1 className="scroll-m-20 pb-2 text-3xl font-bold leading-relaxed first:mt-0">
          Categories
        </h1>
        <div className="flex gap-4">
          <Button asChild>
            <Link to="/categories/new">
              <PlusIcon className="mr-2 h-4 w-4" /> New Category
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
        <p>No categories</p>
      )}
    </section>
  );
}
