import { Link, useCanGoBack, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import { toast } from 'sonner';
import type { GetCategoryByIdResponse } from '@/lib/categories.queries';
import { useUpdateCategoryImagePositionsMutation } from '@/lib/categories.queries';

const sortByPositionThenCreatedAt = (
  images: GetCategoryByIdResponse['images']
) => {
  return [...images].sort((a, b) => {
    const aPos = a.position ?? Number.POSITIVE_INFINITY;
    const bPos = b.position ?? Number.POSITIVE_INFINITY;
    if (aPos !== bPos) return aPos - bPos;
    return (
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  });
};

export function CategoryImageOrderForm({
  category,
}: {
  category: GetCategoryByIdResponse;
}) {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const updatePositions = useUpdateCategoryImagePositionsMutation(category.id);
  const initialImages = sortByPositionThenCreatedAt(category.images ?? []);
  const [images, setImages] = useState(initialImages);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const moveUp = (index: number) => {
    if (index <= 0) return;
    const next = [...images];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setImages(next);
    if (focusedIndex === index) {
      setFocusedIndex(index - 1);
    }
  };

  const moveDown = (index: number) => {
    if (index >= images.length - 1) return;
    const next = [...images];
    [next[index + 1], next[index]] = [next[index], next[index + 1]];
    setImages(next);
    if (focusedIndex === index) {
      setFocusedIndex(index + 1);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        moveUp(index);
        break;
      case 'ArrowDown':
        event.preventDefault();
        moveDown(index);
        break;
      case 'Home':
        event.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setFocusedIndex(images.length - 1);
        break;
    }
  };

  const handleSave = () => {
    const payload = images.map((image, index) => ({
      id: image.id,
      position: index + 1,
    }));
    updatePositions.mutate(payload, {
      onSuccess: () => {
        toast.success('Image order updated.');
        router.navigate({
          to: '/categories/$categoryId',
          params: { categoryId: category.id },
        });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  const handleReset = () => {
    setImages(initialImages);
    toast('Image order reset.');
  };

  const handleCancel = () =>
    canGoBack
      ? router.history.back()
      : router.navigate({
          to: '/categories/$categoryId',
          params: { categoryId: category.id },
        });

  if (!images.length) {
    return (
      <section className="container space-y-6 p-6">
        <h1 className="text-2xl font-semibold">Image ordering</h1>
        <EmptyState
          title="No images to reorder"
          description="Upload images first, then return here to set the custom order."
          icon={ImageIcon}
          action={
            <Button asChild variant="outline">
              <Link
                to="/categories/$categoryId"
                params={{ categoryId: category.id }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Link>
            </Button>
          }
        />
      </section>
    );
  }

  return (
    <section className="container space-y-6 p-6 overflow-x-hidden">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Image ordering</h1>
          <p className="text-sm text-muted-foreground">
            Drag with buttons or arrow keys. Saving sets sort mode to custom.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{images.length} images</Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link
              to="/categories/$categoryId"
              params={{ categoryId: category.id }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Link>
          </Button>
          <Button onClick={handleSave}>Save Order</Button>
        </div>
      </header>

      <div className="space-y-2">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`flex w-full min-w-0 items-center gap-3 overflow-hidden rounded-lg border p-3 transition-colors ${
              focusedIndex === index
                ? 'bg-blue-50 border-blue-200'
                : 'bg-white'
            }`}
            tabIndex={0}
            role="listitem"
            aria-label={`${image.title ?? 'Image'}, position ${index + 1} of ${
              images.length
            }. Use arrow keys to reorder.`}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(null)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
              {index + 1}
            </div>
            <div className="h-16 w-24 shrink-0 overflow-hidden rounded border bg-slate-100">
              {image.url ? (
                <img
                  src={image.url}
                  alt={image.title ?? 'Image'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-400">
                  <ImageIcon className="h-5 w-5" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 break-words text-sm font-medium leading-snug">
                {image.title ?? 'Untitled'}
              </p>
              <p className="text-xs text-muted-foreground">
                Position {index + 1} of {images.length}
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-1">
              <button
                onClick={() => moveUp(index)}
                disabled={index === 0}
                className={`rounded border p-1 transition-colors ${
                  index === 0
                    ? 'cursor-not-allowed text-slate-300 border-slate-200'
                    : 'text-slate-600 border-slate-300 hover:border-blue-300 hover:text-blue-600'
                }`}
                title="Move up"
              >
                <ChevronUp size={16} />
              </button>
              <button
                onClick={() => moveDown(index)}
                disabled={index === images.length - 1}
                className={`rounded border p-1 transition-colors ${
                  index === images.length - 1
                    ? 'cursor-not-allowed text-slate-300 border-slate-200'
                    : 'text-slate-600 border-slate-300 hover:border-blue-300 hover:text-blue-600'
                }`}
                title="Move down"
              >
                <ChevronDown size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleSave}>Save</Button>
        <Button variant="secondary" onClick={handleReset}>
          Reset
        </Button>
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
      </div>
    </section>
  );
}
