import { createFileRoute } from '@tanstack/react-router';
import Grid from '@mui/material/Grid2';
import Masonry from '@mui/lab/Masonry';
import { Menu } from '@/components/home/menu';
import { fetchImages } from '@/api';
import { FloatingButton } from '@/components/shared/floating-button';
import { ImageType } from '@server/src/schemas';

export const Route = createFileRoute('/')({
  component: HomeComponent,
  validateSearch: (search) =>
    search as {
      filter: ImageType;
    },
  loaderDeps: ({ search: { filter } }) => ({
    filter,
  }),
  loader: async ({ deps: { filter } }) => fetchImages(filter),
});

function HomeComponent() {
  const images = Route.useLoaderData();
  return (
    <main>
      <Grid
        container
        columns={12}
        sx={{ gap: { mobile: '1.25rem', tablet: '0' } }}
      >
        <Grid size={{ mobile: 12, tablet: 3 }}>
          {/* <Menu filter={filter} handleFilterChange={handleFilterChange} /> */}
          <Menu />
        </Grid>
        <Grid
          size={{ mobile: 12, tablet: 9 }}
          sx={{ tablet: { padding: '.5em' } }}
        >
          {/* <Images cloudName={cloudName} images={filteredImages} /> */}
          <Masonry
            columns={{ mobile: 1, tablet: 1, laptop: 2, desktop: 3 }}
            spacing={2}
            sx={{
              marginInline: 'auto',
              paddingInline: { mobile: 1, tablet: 1, laptop: 2 },
            }}
          >
            {images.map((image) => (
              <div key={image.id}>
                {/* <CldImage
                  cloudName={cloudName}
                  cloudinaryId={image.cloudinaryId}
                /> */}
                <img
                  src={image.url}
                  alt={image.title}
                  style={{ maxWidth: '100%' }}
                />
              </div>
            ))}
          </Masonry>
          <FloatingButton />
        </Grid>
      </Grid>
    </main>
  );
}
