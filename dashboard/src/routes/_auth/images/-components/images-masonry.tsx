import Masonry from 'react-masonry-css';

import { ImageOptionsMenu } from '@/components/image-options-menu';
import { useImageSelection } from './image-selection-context';

type ImageSummary = {
  id: string;
  url: string;
  title?: string | null;
};

export function ImagesMasonry({ images }: { images: ImageSummary[] }) {
  const { mode, isSelected, toggleSelection } = useImageSelection();
  const isSelectMode = mode === 'select';

  return (
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
      {images.map((image) => {
        const selected = isSelected(image.id);
        return (
          <div key={image.id} className="mb-[2rem]">
            <div
              className={`group relative overflow-hidden rounded-lg cursor-pointer transition-all duration-200 ${
                isSelectMode
                  ? selected
                    ? 'ring-4 ring-primary ring-offset-2 ring-offset-background'
                    : 'hover:ring-2 hover:ring-secondary'
                  : ''
              }`}
              onClick={isSelectMode ? () => toggleSelection(image.id) : undefined}
            >
              <img
                src={image.url}
                alt={image?.title ?? 'Image'}
                className={`w-full ${isSelectMode && selected ? 'opacity-90' : ''}`}
              />

              {isSelectMode ? (
                <SelectionIndicator selected={selected} />
              ) : (
                <ImageOptionsMenu
                  image={{
                    id: image.id,
                    title: image.title,
                    url: image.url,
                  }}
                />
              )}
            </div>
          </div>
        );
      })}
    </Masonry>
  );
}

function SelectionIndicator({ selected }: { selected: boolean }) {
  return (
    <div className="absolute top-2 left-2">
      <div
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
          selected
            ? 'bg-primary border-primary'
            : 'bg-white/80 border-muted-foreground hover:border-primary'
        }`}
      >
        {selected ? (
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
        ) : null}
      </div>
    </div>
  );
}
