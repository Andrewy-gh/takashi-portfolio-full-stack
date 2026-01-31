import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import { DeleteCategoryDialog } from './-components/delete-category-dialog';
import { EditCategoryForm } from './-components/edit-category-form';
import { ArrowLeft, ImageIcon, ListOrdered, Pencil, Trash2 } from 'lucide-react';

import {
  type SortType,
  type DirectionType,
  SortTypeSchema,
  DirectionTypeSchema,
} from '@server/lib/shared-types';
import { categoryQueryOptions } from '@/lib/categories.queries';
import { SortDropdown } from '@/components/sort-dropdown';

const categoryOptionsSchema = z.object({
  edit: z.boolean().default(false),
  delete: z.boolean().default(false),
  sort: SortTypeSchema,
  direction: DirectionTypeSchema,
});

const formatSortMode = (value?: string | null) => {
  if (!value) return 'Custom order';
  switch (value) {
    case 'custom':
      return 'Custom order';
    case 'created_at':
    case 'created_at_desc':
      return 'Newest first';
    case 'created_at_asc':
      return 'Oldest first';
    case 'title':
    case 'title_asc':
      return 'Title A-Z';
    case 'title_desc':
      return 'Title Z-A';
    default:
      return value.replaceAll('_', ' ');
  }
};

export const Route = createFileRoute('/_auth/categories/$categoryId')({
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
  validateSearch: categoryOptionsSchema,
});

function RouteComponent() {
  const navigate = useNavigate();
  const params = Route.useParams();
  const { edit, delete: deleteAction, sort, direction } = Route.useSearch();
  const { data: category } = useSuspenseQuery(
    categoryQueryOptions(params.categoryId)
  );

  const handleSort = ({
    sort,
    direction,
  }: {
    sort: SortType;
    direction: DirectionType;
  }) => {
    navigate({
      to: '.',
      search: (prev) => ({ ...prev, sort, direction }),
    });
  };

  const sortedImages = category.images
    ? [...category.images].sort((a, b) => {
        if (!sort) return 0;

        const modifier = direction === 'asc' ? 1 : -1;

        switch (sort) {
          case 'name':
            return (a.title ?? '').localeCompare(b.title ?? '') * modifier;
          case 'createdAt':
            return (
              (new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()) *
              modifier
            );
          case 'updatedAt': {
            const aDate = a.updatedAt || a.createdAt;
            const bDate = b.updatedAt || b.createdAt;
            return (
              (new Date(aDate).getTime() - new Date(bDate).getTime()) * modifier
            );
          }
          default:
            return 0;
        }
      })
    : [];

  if (edit) {
    return <EditCategoryForm category={category} />;
  }

  if (deleteAction) {
    return <DeleteCategoryDialog isOpen={deleteAction} id={category.id} />;
  }

  const totalImages = sortedImages.length;

  return (
    <section className="container space-y-12 p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <Button asChild variant="ghost" size="sm">
            <Link to="/categories">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to categories
            </Link>
          </Button>
          <Badge variant="secondary">{formatSortMode(category.sortMode)}</Badge>
          <Badge variant="outline">{totalImages} images</Badge>
        </div>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-2">
            <h1 className="scroll-m-20 pb-2 text-3xl font-bold leading-relaxed first:mt-0">
              {category?.name}
            </h1>
            {category.description ? (
              <p className="text-sm text-muted-foreground max-w-2xl">
                {category.description}
              </p>
            ) : null}
          </div>
          <nav className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link to="/categories/$categoryId/project-order" params={params}>
                <ListOrdered className="mr-2 h-4 w-4" /> Image Order
              </Link>
            </Button>
            <Button asChild>
              <Link to="." search={{ edit: true }}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Link>
            </Button>
            <Button asChild variant="destructive">
              <Link to="." search={{ delete: true }}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Link>
            </Button>
          </nav>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          Sort preview controls category view only. Custom order lives in Image Order.
        </p>
        <SortDropdown sort={sort} direction={direction} onChange={handleSort} />
      </div>
      {sortedImages.length ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {sortedImages.map((image) => (
            <Link
              key={image.id}
              to="/images/$imageId"
              params={{ imageId: image.id }}
              className="group"
            >
              <div className="relative h-64 w-full overflow-hidden rounded-md bg-slate-900">
                <img
                  src={image.url}
                  alt={image.title ?? 'Image'}
                  className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {image.title ?? 'Untitled'}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No images yet"
          description="Upload images to the library, then assign them to this category."
          icon={ImageIcon}
          action={
            <Button asChild variant="secondary">
              <Link to="/images">Go to Images</Link>
            </Button>
          }
        />
      )}
    </section>
  );
}
