import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useDebouncedCallback } from 'use-debounce';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { Pagination } from '@/components/pagination';
import { ImagesMasonry } from './-components/images-masonry';
import { ImagesToolbar } from './-components/images-toolbar';
import {
  ImageSelectionProvider,
  useImageSelection,
} from './-components/image-selection-context';

import {
  paginationSortSchema,
  type SortType,
  type DirectionType,
} from '@server/lib/shared-types';
import { imagesQueryOptions } from '@/lib/images.queries';

export const Route = createFileRoute('/_auth/images/')({
  component: RouteComponent,
  loader({ context }) {
    context.queryClient.ensureQueryData(
      imagesQueryOptions({
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
    data: { totalImages, images },
  } = useSuspenseQuery(
    imagesQueryOptions({ page, pageSize, search, sort, direction })
  );

  // MARK: Search, pagination, sorting
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
      search: (prev) => ({ ...prev, page: 1, pageSize }),
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
    <ImageSelectionProvider>
      <ImagesRouteContent
        images={images}
        totalImages={totalImages}
        page={page}
        pageSize={pageSize}
        sort={sort}
        direction={direction}
        onSearch={handleSearch}
        onSort={handleSort}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </ImageSelectionProvider>
  );
}

function ImagesRouteContent({
  images,
  totalImages,
  page,
  pageSize,
  sort,
  direction,
  onSearch,
  onSort,
  onPageChange,
  onPageSizeChange,
}: {
  images: { id: string; url: string; title?: string | null }[];
  totalImages: number;
  page: number;
  pageSize: number;
  sort: SortType;
  direction: DirectionType;
  onSearch: (value: string) => void;
  onSort: (params: { sort: SortType; direction: DirectionType }) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  const { selectedIds, stopSelection } = useImageSelection();

  const handleBulkDelete = useCallback(() => {
    console.log('Deleting images:', Array.from(selectedIds));
    stopSelection();
  }, [selectedIds, stopSelection]);

  const handleBulkSave = useCallback(() => {
    console.log('Saving images:', Array.from(selectedIds));
  }, [selectedIds]);

  const handleBulkAction = useCallback(
    (action: string) => {
      console.log('Bulk action:', action, Array.from(selectedIds));
    },
    [selectedIds]
  );

  return (
    <section className="container space-y-12 p-6">
      <ImagesToolbar
        sort={sort}
        direction={direction}
        onSearch={onSearch}
        onSort={onSort}
        onBulkDelete={handleBulkDelete}
        onBulkSave={handleBulkSave}
        onBulkAction={handleBulkAction}
      />

      <Pagination
        currentPage={page}
        pageSize={pageSize}
        pageCount={Math.ceil(totalImages / pageSize)}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />

      <ImagesMasonry images={images} />
    </section>
  );
}
