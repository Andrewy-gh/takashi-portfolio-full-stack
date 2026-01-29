import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { categoryQueryOptions } from '@/lib/categories.queries';
import { CategoryImageOrderForm } from './-components/category-image-order-form';

export const Route = createFileRoute(
  '/_auth/categories/$categoryId_/project-order'
)({
  params: {
    parse: (params) => ({
      categoryId: z.string().min(1).parse(params.categoryId),
    }),
  },
  loader(opts) {
    opts.context.queryClient.ensureQueryData(
      categoryQueryOptions(opts.params.categoryId)
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  const { data: category } = useSuspenseQuery(
    categoryQueryOptions(params.categoryId)
  );
  return <CategoryImageOrderForm category={category} />;
}
