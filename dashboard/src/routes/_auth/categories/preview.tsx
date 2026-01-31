import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';

import { ImageOff, LayoutGrid, ListOrdered } from 'lucide-react';

import { categoriesPreviewQueryOptions } from '@/lib/categories.queries';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';

export const Route = createFileRoute('/_auth/categories/preview')({
  component: RouteComponent,
  loader({ context }) {
    context.queryClient.ensureQueryData(categoriesPreviewQueryOptions());
  },
});

function RouteComponent() {
  const { data: categories } = useSuspenseQuery(
    categoriesPreviewQueryOptions()
  );

  const { observeElements } = useIntersectionObserver();

  useEffect(() => {
    const faders = document.querySelectorAll('.fade-in');
    if (faders.length > 0) {
      observeElements(Array.from(faders));
    }
  }, [observeElements]);

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

  return (
    <section className="container space-y-12 p-6">
      <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <h1 className="scroll-m-20 pb-2 text-3xl font-bold leading-relaxed first:mt-0">
            Category Preview
          </h1>
          <p className="text-sm text-muted-foreground">
            See how categories will read on the portfolio home page.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="secondary">
            <Link to="/categories">
              <LayoutGrid className="mr-2 h-4 w-4" /> Manage Categories
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/categories/order">
              <ListOrdered className="mr-2 h-4 w-4" /> Category Order
            </Link>
          </Button>
        </div>
      </header>
      {categories.length === 0 ? (
        <EmptyState
          title="No categories to preview"
          description="Create categories to populate the portfolio navigation."
          icon={LayoutGrid}
          action={
            <Button asChild>
              <Link to="/categories/new">Create Category</Link>
            </Button>
          }
        />
      ) : null}
      {categories.map((category) => (
        <section
          key={category.id}
          className="opacity-0 transition-opacity duration-700 ease-in fade-in"
        >
          {/* Title */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              to="/categories/$categoryId"
              params={{ categoryId: category.id }}
            >
              <h2 className="scroll-m-20 pb-2 text-2xl font-bold leading-relaxed first:mt-0">
                {category.name}
              </h2>
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{formatSortMode(category.sortMode)}</Badge>
              <Badge variant="outline">{category.images.length} images</Badge>
            </div>
          </div>
          {category.images.length > 0 ? (
            <>
              {/* Grid */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                {category.images.map((image) => (
                  <Link
                    key={image.id}
                    to="/images/$imageId"
                    params={{ imageId: image.id }}
                  >
                    {image.url ? (
                      <div className="group relative aspect-[3/4]">
                        {/* Thumbnail */}
                        <img
                          src={image.url}
                          alt={image.title ?? 'Image'}
                          className="absolute inset-0 h-full w-full rounded-lg object-cover"
                        />
                        {/* Overlay */}
                        <div className="mouse">
                          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-gray-800 bg-opacity-0 transition-opacity duration-300 group-hover:bg-opacity-70">
                            <p className="text-center font-header text-2xl text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                              {image.title ?? 'Untitled'}
                            </p>
                          </div>
                        </div>
                        {/* Caption for touch devices */}
                        <div className="touch mt-2">
                          <p className="font-body text-xl">
                            {image.title ?? 'Untitled'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      // No thumbnail placeholder
                      <div className="flex aspect-[3/4] h-full w-full flex-col items-center justify-center rounded-lg bg-gray-200 text-gray-400">
                        <ImageOff className="mb-2 h-12 w-12" />
                        <p className="px-2 text-center text-sm">
                          {image.title ?? 'Untitled'}
                        </p>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
              <ImageOff className="h-5 w-5" />
              <span>No images in this category yet.</span>
            </div>
          )}
        </section>
      ))}
    </section>
  );
}
