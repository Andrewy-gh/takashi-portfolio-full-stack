import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { DeleteCategoryDialog } from './-components/delete-category-dialog';
import { EditCategoryForm } from './-components/edit-category-form';
import { ListOrdered, Pencil, Trash2 } from 'lucide-react';
import { ProjectGrid } from '@/components/project-grid';

import {
  type SortType,
  type DirectionType,
  SortTypeSchema,
  DirectionTypeSchema,
} from '@server/lib/shared-types';
import { categoryQueryOptions } from '@/lib/categories.queries';
import { projectsSelectQueryOptions } from '@/lib/projects.queries';
import { SortDropdown } from '@/components/sort-dropdown';

const categoryOptionsSchema = z.object({
  edit: z.boolean().default(false),
  delete: z.boolean().default(false),
  sort: SortTypeSchema,
  direction: DirectionTypeSchema,
});

export const Route = createFileRoute('/_auth/categories/$categoryId')({
  params: {
    parse: (params) => ({
      categoryId: z.coerce.number().int().parse(params.categoryId),
    }),
  },
  loader(opts) {
    opts.context.queryClient.ensureQueryData(
      categoryQueryOptions(opts.params.categoryId)
    );
    opts.context.queryClient.ensureQueryData(projectsSelectQueryOptions());
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

  const sortedProjects = category.projects
    ? [...category.projects].sort((a, b) => {
        if (!sort) return 0;

        const modifier = direction === 'asc' ? 1 : -1;

        switch (sort) {
          case 'name':
            return a.name.localeCompare(b.name) * modifier;
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

  return (
    <section className="container space-y-12 p-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="scroll-m-20 pb-2 text-3xl font-bold leading-relaxed first:mt-0">
          {category?.name}
        </h1>
        <nav className="flex gap-4">
          <Button asChild>
            <Link to="." search={{ edit: true }}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link
              to="/categories/$categoryId/project-order"
              params={{ categoryId: category.id }}
            >
              <ListOrdered className="mr-2 h-4 w-4" /> Order
            </Link>
          </Button>
          <Button asChild variant="destructive">
            <Link to="." search={{ delete: true }}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Link>
          </Button>
        </nav>
      </div>
      <nav>
        <SortDropdown sort={sort} direction={direction} onChange={handleSort} />
      </nav>
      {sortedProjects.length ? (
        <ProjectGrid projects={sortedProjects} />
      ) : (
        <p>No Projects Found</p>
      )}
    </section>
  );
}
