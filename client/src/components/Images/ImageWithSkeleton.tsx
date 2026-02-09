import { useMemo, useState } from 'react';
import { withCloudinaryAutoFormatQuality } from '../../utils/cloudinary-url';

type ImageWithSkeletonProps = {
  src: string;
  alt: string;
  width?: number | null;
  height?: number | null;
  loading?: 'eager' | 'lazy';
  decoding?: 'async' | 'sync' | 'auto';
};

export default function ImageWithSkeleton({
  src,
  alt,
  width,
  height,
  loading = 'lazy',
  decoding = 'async',
}: ImageWithSkeletonProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const resolvedSrc = useMemo(
    () => withCloudinaryAutoFormatQuality(src),
    [src]
  );

  const aspectRatio = useMemo(() => {
    const w = typeof width === 'number' && width > 0 ? width : null;
    const h = typeof height === 'number' && height > 0 ? height : null;
    if (w && h) return `${w} / ${h}`;
    return '4 / 3';
  }, [width, height]);

  return (
    <div
      className="image-frame"
      style={{
        aspectRatio,
      }}
    >
      {!loaded && !failed ? <div className="image-skeleton" /> : null}
      {failed ? (
        <div className="image-fallback" aria-label={alt}>
          Image failed to load
        </div>
      ) : (
        <img
          src={resolvedSrc}
          alt={alt}
          loading={loading}
          decoding={decoding}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={loaded ? 'image-el image-el--loaded' : 'image-el'}
        />
      )}
    </div>
  );
}
