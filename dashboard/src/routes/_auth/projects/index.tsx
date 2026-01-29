import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useDebouncedCallback } from 'use-debounce';
import { useSuspenseQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/pagination';
import { PlusIcon } from 'lucide-react';
import { ProjectGrid } from '@/components/project-grid';
import { SearchBar } from '@/components/search-bar';
import { SortDropdown } from '@/components/sort-dropdown';

import {
  paginationSortSchema,
  type SortType,
  type DirectionType,
} from '@server/lib/shared-types';
import { projectsQueryOptions } from '@/lib/projects.queries';

export const Route = createFileRoute('/_auth/projects/')({
  component: RouteComponent,
  loader({ context }) {
    context.queryClient.ensureQueryData(
      projectsQueryOptions({
        page: 1,
        pageSize: 10,
        search: undefined,
        sort: 'updatedAt',
        direction: 'desc',
      })
    );
  },
  validateSearch: paginationSortSchema,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { page, pageSize, search, sort, direction } = Route.useSearch();
  const {
    data: { totalProjects, projects },
  } = useSuspenseQuery(
    projectsQueryOptions({ page, pageSize, search, sort, direction })
  );

  const handleSearch = useDebouncedCallback(
    (searchTerm: string) => {
      navigate({
        to: '.',
        search: (prev) => ({
          ...prev,
          page: 1,
          search: searchTerm || undefined,
        }),
      });
    },
    // delay in ms
    1000
  );

  const handlePageChange = (page: number) => {
    navigate({
      to: '.',
      search: (prev) => ({ ...prev, page }),
    });
  };

  const handlePageSizeChange = (pageSize: number) => {
    navigate({
      to: '.',
      search: (prev) => ({ ...prev, pageSize }),
    });
  };

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

  return (
    <section className="container space-y-12 p-6">
      <header className="space-y-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="scroll-m-20 pb-2 text-3xl font-bold leading-relaxed first:mt-0">
            Projects
          </h1>
          <nav>
            <Button asChild>
              <Link to="/projects/new">
                <PlusIcon className="mr-2 h-4 w-4" /> New Project
              </Link>
            </Button>
          </nav>
        </div>
        <nav className="flex flex-col gap-4 sm:flex-row">
          <SearchBar onChange={handleSearch} />
          <SortDropdown
            sort={sort}
            direction={direction}
            onChange={handleSort}
          />
        </nav>
      </header>
      <section className="space-y-6">
        {projects.length ? (
          <>
            <Pagination
              currentPage={page}
              pageSize={pageSize}
              pageCount={Math.ceil(totalProjects / pageSize)}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
            <ProjectGrid projects={projects} />
          </>
        ) : (
          <p>No Projects Found</p>
        )}
      </section>
    </section>
  );
}
