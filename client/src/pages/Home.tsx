import Grid from '@mui/material/Grid';
import Menu from '../components/Menu';
import {
  ImagesEmpty,
  ImagesError,
  ImagesGrid,
  ImagesLoading,
} from '../components/Images';
import { useFilter } from '../hooks/useFilter';
import FloatingButton from '../components/FloatingButton';
import type { ImageRecord } from '../services/image';

type HomeProps = {
  cloudName: string;
  images: ImageRecord[];
  isLoading: boolean;
  error: string | null;
};

export default function Home({
  cloudName,
  images,
  isLoading,
  error,
}: HomeProps) {
  const { filter, handleFilterChange } = useFilter();
  const filteredImages =
    filter === null
      ? images
      : images.filter(
          (image) => (image.category ?? image.type ?? null) === filter
        );

  let content;
  if (isLoading) {
    content = <ImagesLoading />;
  } else if (error) {
    content = <ImagesError message={error} />;
  } else if (!filteredImages.length) {
    content = <ImagesEmpty />;
  } else {
    content = <ImagesGrid cloudName={cloudName} images={filteredImages} />;
  }
  return (
    <>
      <Grid
        container
        columns={12}
        sx={{ gap: { mobile: '1.25rem', tablet: '0' } }}
      >
        <Grid item mobile={12} tablet={3}>
          <Menu filter={filter} handleFilterChange={handleFilterChange} />
        </Grid>
        <Grid item mobile={12} tablet={9} sx={{ tablet: { padding: '.5em' } }}>
          {content}
          <FloatingButton />
        </Grid>
      </Grid>
    </>
  );
}
