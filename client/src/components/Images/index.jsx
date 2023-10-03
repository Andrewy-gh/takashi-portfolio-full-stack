import Masonry from '@mui/lab/Masonry';
import CldImage from './CldImage';

export default function Images({ cloudName, images }) {
  let content;
  if (!images.length > 0) {
    content = (
      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          height: '100%',
          paddingInline: '1rem',
        }}
      >
        <h1>Please check back later for more content</h1>
      </div>
    );
  } else {
    content = (
      <Masonry
        variant="masonry"
        columns={{ mobile: 1, tablet: 1, laptop: 2, desktop: 3 }}
        spacing={2}
        sx={{
          marginInline: 'auto',
          paddingInline: { mobile: 1, tablet: 1, laptop: 2 },
        }}
      >
        {images.map((image) => (
          <div key={image.id}>
            <CldImage cloudName={cloudName} cloudinaryId={image.cloudinaryId} />
          </div>
        ))}
      </Masonry>
    );
  }
  return <>{content}</>;
}
