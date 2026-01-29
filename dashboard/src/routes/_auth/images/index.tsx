import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useDebouncedCallback } from 'use-debounce';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useState, useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { ImageOptionsMenu } from '@/components/image-options-menu';
import Masonry from 'react-masonry-css';
import { Pagination } from '@/components/pagination';
import {
  PlusIcon,
  Sparkles,
  CheckSquare,
  X,
  Trash2,
  Download,
  MoreHorizontal,
} from 'lucide-react';
import { SearchBar } from '@/components/search-bar';
import { SortDropdown } from '@/components/sort-dropdown';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

  // Multi-select state
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedImageIds, setSelectedImageIds] = useState<Set<number>>(
    new Set()
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

  // MARK: Selection handlers
  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    if (isSelectMode) {
      setSelectedImageIds(new Set());
    }
  };

  const toggleImageSelection = useCallback((imageId: number) => {
    setSelectedImageIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  }, []);

  const handleBulkDelete = () => {
    // Implement bulk delete logic
    console.log('Deleting images:', Array.from(selectedImageIds));
    // After successful deletion, reset selection
    setSelectedImageIds(new Set());
    setIsSelectMode(false);
  };

  const handleBulkSave = () => {
    // Implement bulk save/download logic
    console.log('Saving images:', Array.from(selectedImageIds));
  };

  const handleBulkAction = (action: string) => {
    console.log('Bulk action:', action, Array.from(selectedImageIds));
  };

  return (
    <section className="container space-y-12 p-6">
      <header className="space-y-6">
        <div className="flex justify-between">
          <h1 className="scroll-m-20 pb-2 text-3xl font-bold leading-relaxed first:mt-0">
            Images
          </h1>
          <nav className="flex items-center gap-2">
            {/* MARK: Select toggle */}
            <Button
              variant="outline"
              onClick={toggleSelectMode}
              className="flex items-center gap-2"
            >
              {isSelectMode ? (
                <>
                  <X className="h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <CheckSquare className="h-4 w-4" />
                  Select
                </>
              )}
            </Button>
            <Button asChild>
              <Link to="/images/upload">
                <PlusIcon className="mr-2 h-4 w-4" />
                Upload
              </Link>
            </Button>
          </nav>
        </div>

        {/* MARK: Select options */}
        {isSelectMode && (
          <div className="flex items-center justify-between rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-blue-900 dark:text-blue-100">
                {selectedImageIds.size} image
                {selectedImageIds.size !== 1 ? 's' : ''} selected
              </span>
            </div>

            {selectedImageIds.size > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkSave}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleBulkAction('move')}>
                      Move to Album
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('copy')}>
                      Copy Links
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleBulkAction('export')}
                    >
                      Export Metadata
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        )}

        {/* MARK: Search and sort controls - hidden in select mode */}
        {!isSelectMode && (
          <nav className="flex flex-col gap-4 sm:flex-row">
            <SearchBar onChange={handleSearch} />
            <SortDropdown
              sort={sort}
              direction={direction}
              onChange={handleSort}
            />
          </nav>
        )}
      </header>

      <Pagination
        currentPage={page}
        pageSize={pageSize}
        pageCount={Math.ceil(totalImages / pageSize)}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

{/* MARK: Masonry */}
      <Masonry
        breakpointCols={{
          default: 4,
          1280: 4,
          1024: 3,
          768: 2,
          640: 1,
        }}
        className="ml-[-2rem] flex w-auto"
        columnClassName="pl-[2rem] bg-clip-border"
      >
        {images.map((image) => (
          <div key={image.id} className="mb-[2rem]">
            <div
              className={`group relative overflow-hidden rounded-lg cursor-pointer transition-all duration-200 ${
                isSelectMode
                  ? selectedImageIds.has(image.id)
                    ? 'ring-4 ring-blue-500 ring-offset-2'
                    : 'hover:ring-2 hover:ring-gray-300'
                  : ''
              }`}
              onClick={
                isSelectMode ? () => toggleImageSelection(image.id) : undefined
              }
            >
              <img
                src={image.thumbnailUrl}
                alt={image?.description ?? image?.name ?? 'Image'}
                className={`w-full ${isSelectMode && selectedImageIds.has(image.id) ? 'opacity-90' : ''}`}
              />

              {/* MARK: Selection indicator circle */}
              {isSelectMode && (
                <div className="absolute top-2 left-2">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      selectedImageIds.has(image.id)
                        ? 'bg-blue-500 border-blue-500'
                        : 'bg-white/80 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {selectedImageIds.has(image.id) && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              )}

              {/* MARK: Regular options menu - only shown when not in select mode */}
              {!isSelectMode && (
                <ImageOptionsMenu
                  image={{
                    id: image.id,
                    name: image.name,
                    url: image.url,
                    featuredImageId: image.featuredImageId,
                  }}
                />
              )}

              {/* MARK: Featured image indicator */}
              {image.featuredImageId && (
                <div className="absolute bottom-2 right-2">
                  <Sparkles
                    className="text-yellow-400"
                    size={32}
                    fill="rgb(253 224 71)"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </Masonry>
    </section>
  );
}
