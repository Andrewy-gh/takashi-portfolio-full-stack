import Masonry from '@mui/lab/Masonry';
import CldImage from './CldImage';
import type { ImageRecord } from '../../services/image';

type ImagesProps = {
  cloudName: string;
  images: ImageRecord[];
  isLoading: boolean;
  error: string | null;
};

export default function Images({
  cloudName,
  images,
  isLoading,
  error,
}: ImagesProps) {
  let content;
  if (isLoading) {
    content = (
      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          height: '100%',
          paddingInline: '1rem',
        }}
      >
        <h1>Loading...</h1>
      </div>
    );
  } else if (error) {
    content = (
      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          height: '100%',
          paddingInline: '1rem',
        }}
      >
        <h1>{error}</h1>
      </div>
    );
  } else if (!images.length) {
    content = (
      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          height: '100%',
          paddingInline: '1rem',
        }}
      >
        <h1>Please check back later for content</h1>
      </div>
    );
  } else {
    content = (
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
              {cloudName && cloudId ? (
                <CldImage cloudName={cloudName} publicId={cloudId} />
              ) : (
                image.url && (
                  <img
                    src={image.url}
                    alt={image.title ?? 'photo'}
                    style={{ maxWidth: '100%' }}
                    loading="lazy"
                  />
                )
              )}
            </div>
          );
        })}
      </Masonry>
    );
  }
  return <>{content}</>;
}
