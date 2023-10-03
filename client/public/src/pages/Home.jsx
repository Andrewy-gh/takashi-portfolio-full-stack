import Grid from '@mui/material/Grid';
import Menu from '../components/Menu';
import Images from '../components/Images/index';
import { useFilter } from '../hooks/useFilter';
import FloatingButton from '../components/FloatingButton';

export default function Home({ cloudName, images }) {
  const { filter, handleFilterChange } = useFilter();
  const filteredImages =
    filter === null ? images : images.filter((image) => image.type === filter);
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
          <Images cloudName={cloudName} images={filteredImages} />
          <FloatingButton />
        </Grid>
      </Grid>
    </>
  );
}
