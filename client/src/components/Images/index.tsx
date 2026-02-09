import type { ReactNode } from 'react';
import Masonry from '@mui/lab/Masonry';
import CldImage from './CldImage';
import ImageWithSkeleton from './ImageWithSkeleton';

type GalleryImage = {
  id?: string | null;
  title?: string | null;
  url?: string | null;
  publicId?: string | null;
  cloudinaryId?: string | null;
  width?: number | null;
  height?: number | null;
};

const stateContainer = {
  display: 'grid',
  placeItems: 'center',
  height: '100%',
  paddingInline: '1rem',
};

function ImagesState({ children }: { children: ReactNode }) {
  return <div style={stateContainer}>{children}</div>;
}

export function ImagesLoading({ message = 'Loading...' }: { message?: string }) {
  return (
    <ImagesState>
      <h1>{message}</h1>
    </ImagesState>
  );
}

export function ImagesError({ message }: { message: string }) {
  return (
    <ImagesState>
      <h1>{message}</h1>
    </ImagesState>
  );
}

export function ImagesEmpty({
  message = 'Please check back later for content',
}: {
  message?: string;
}) {
  return (
    <ImagesState>
      <h1>{message}</h1>
    </ImagesState>
  );
}

export function ImagesGrid({
  cloudName,
  images,
}: {
  cloudName: string;
  images: GalleryImage[];
}) {
  return (
    <Masonry
      columns={{ mobile: 1, tablet: 1, laptop: 2, desktop: 3 }}
      spacing={2}
      sx={{
        marginInline: 'auto',
        paddingInline: { mobile: 1, tablet: 1, laptop: 2 },
      }}
    >
      {images.map((image, index) => {
        const cloudId = image.publicId ?? image.cloudinaryId ?? null;
        const key = image.id ?? cloudId ?? image.url ?? `image-${index}`;
        return (
          <div key={key}>
            {image.url ? (
              <ImageWithSkeleton
                src={image.url}
                alt={image.title ?? 'photo'}
                width={image.width}
                height={image.height}
              />
            ) : cloudName && cloudId ? (
              <CldImage cloudName={cloudName} publicId={cloudId} />
            ) : null}
          </div>
        );
      })}
    </Masonry>
  );
}
