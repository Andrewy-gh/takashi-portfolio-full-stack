import { useMediaQuery } from '@mui/material/';
import MenuDesktop from './MenuDesktop';
import MenuMobile from './MenuMobile';
import { theme } from '../../styles/styles';
import { navigation } from '../../data';

type MenuProps = {
  filter: string | null;
  handleFilterChange: (filter: string | null) => void;
};

export default function Menu({ filter, handleFilterChange }: MenuProps) {
  const isMobile = useMediaQuery(theme.breakpoints.down('tablet'));

  return (
    <>
      {isMobile ? (
        <MenuMobile
          filter={filter}
          handleFilterChange={handleFilterChange}
          navigation={navigation}
        />
      ) : (
        <MenuDesktop
          filter={filter}
          handleFilterChange={handleFilterChange}
          navigation={navigation}
        />
      )}
    </>
  );
}
