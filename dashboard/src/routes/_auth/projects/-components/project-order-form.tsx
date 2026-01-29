import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { ArrowLeft, Eye } from 'lucide-react';
import type { GetProjectResponse } from '@/lib/projects.queries';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUpdateImageSequenceMutation } from '@/lib/images.queries';
import { toast } from 'sonner';

export function ProjectOrderForm({
  projectImages,
}: {
  projectImages: GetProjectResponse['images'];
}) {
  const [images, setImages] = useState<GetProjectResponse['images']>(
    projectImages.length > 0 ? projectImages : []
  );
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const updateImageSequence = useUpdateImageSequenceMutation();

  const moveUp = (index: number) => {
    if (index > 0) {
      const newImages = [...images];
      [newImages[index], newImages[index - 1]] = [
        newImages[index - 1],
        newImages[index],
      ];
      setImages(newImages);
      // onReorder?.(newImages);
      // Update focus to follow the moved item
      if (focusedIndex === index) {
        setFocusedIndex(index - 1);
      }
    }
  };

  const moveDown = (index: number) => {
    if (index < images.length - 1) {
      const newImages = [...images];
      [newImages[index], newImages[index + 1]] = [
        newImages[index + 1],
        newImages[index],
      ];
      setImages(newImages);
      // onReorder?.(newImages);
      // Update focus to follow the moved item
      if (focusedIndex === index) {
        setFocusedIndex(index + 1);
      }
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
    const updatedImageSequence = images.map((image, index) => ({
      id: image.id,
      sequence: index + 1,
    }));
    updateImageSequence.mutate(
      { images: updatedImageSequence },
      {
        onSuccess: () => {
          toast.success('Category order updated. 🎉');
        },
        onError: (error) => {
          toast.error(error.message);
        },
      }
    );
  };

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-lg space-y-6">
      <h1 className="text-2xl font-semibold mb-4 text-gray-800">
        Reorder Images
      </h1>

      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>Keyboard shortcuts:</strong> Focus an item and use ↑/↓ arrows
          to reorder, Home/End to jump to first/last
        </p>
      </div>
      <nav>
        <div className="flex gap-4 justify-between">
          <div className="flex gap-4">
            <Button asChild>
              <Link to="." search={{ order: false }}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Main
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="." search={{ preview: true }}>
                <Eye className="mr-2 h-4 w-4" /> Preview
              </Link>
            </Button>
          </div>
          <Button onClick={handleSave}>Save Order</Button>
        </div>
      </nav>
      <div className="space-y-2">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
              focusedIndex === index
                ? 'bg-blue-100 border-blue-400 ring-2 ring-blue-200'
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
            tabIndex={0}
            role="listitem"
            aria-label={`${image.description || image.name}, position ${index + 1} of ${images.length}. Use arrow keys to reorder.`}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(null)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            {/* Sequence Number */}
            <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
              {index + 1}
            </div>

            {/* Thumbnail */}
            <div className="flex-shrink-0">
              <img
                src={image.thumbnailUrl}
                alt={image.name}
                className="w-20 h-15 object-cover rounded border border-gray-300"
              />
            </div>

            {/* Image Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {image.name}
              </p>
              <p className="text-xs text-gray-500">
                Position {index + 1} of {images.length}
              </p>
            </div>

            {/* Control Buttons */}
            <div className="flex flex-col gap-1">
              <button
                onClick={() => moveUp(index)}
                disabled={index === 0}
                className={`p-1 rounded border transition-colors ${
                  index === 0
                    ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                    : 'text-gray-600 border-gray-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300'
                }`}
                title="Move up"
              >
                <ChevronUp size={16} />
              </button>

              <button
                onClick={() => moveDown(index)}
                disabled={index === images.length - 1}
                className={`p-1 rounded border transition-colors ${
                  index === images.length - 1
                    ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                    : 'text-gray-600 border-gray-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300'
                }`}
                title="Move down"
              >
                <ChevronDown size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
