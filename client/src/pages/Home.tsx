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
import type { NavigationItem } from '../data';
import type { CategoryPreview } from '../services/categories';

type HomeProps = {
  categories: CategoryPreview[];
  isLoading: boolean;
  error: string | null;
};

export default function Home({
  categories,
  isLoading,
  error,
}: HomeProps) {
  const { filter, handleFilterChange } = useFilter();

  const homeCategory =
    categories.find((category) => category.slug === 'home') ?? categories[0] ?? null;
  const selectedCategory =
    filter === null
      ? homeCategory
      : categories.find((category) => category.id === filter) ?? homeCategory;

  const filteredImages = selectedCategory?.images ?? [];

  const navigation: NavigationItem[] = [
    ...categories.map((category) => ({
      id: category.id,
      name: category.name,
      type: 'filter' as const,
      filter: category.id,
    })),
    { id: 'profile', name: 'Profile', type: 'link', path: '/profile' },
  ];

  let content;
  if (isLoading) {
    content = <ImagesLoading message="Loading categories..." />;
  } else if (error) {
    content = <ImagesError message={error} />;
  } else if (!filteredImages.length) {
    content = <ImagesEmpty />;
  } else {
    content = <ImagesGrid images={filteredImages} />;
  }
  return (
    <>
      <Grid
        container
        columns={12}
        sx={{ gap: { mobile: '1.25rem', tablet: '0' } }}
      >
        <Grid item mobile={12} tablet={3}>
          <Menu
            filter={filter}
            handleFilterChange={handleFilterChange}
            navigation={navigation}
          />
        </Grid>
        <Grid item mobile={12} tablet={9} sx={{ tablet: { padding: '.5em' } }}>
          {content}
          <FloatingButton />
        </Grid>
      </Grid>
    </>
  );
}
