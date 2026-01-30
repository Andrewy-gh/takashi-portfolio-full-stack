import { useMediaQuery } from '@mui/material/';
import MenuDesktop from './MenuDesktop';
import MenuMobile from './MenuMobile';
import { theme } from '../../styles/styles';
import { navigation } from '../../data';
import { MenuProvider } from './MenuContext';

type MenuProps = {
  filter: string | null;
  handleFilterChange: (filter: string | null) => void;
};

export default function Menu({ filter, handleFilterChange }: MenuProps) {
  const isMobile = useMediaQuery(theme.breakpoints.down('tablet'));

  return (
    <MenuProvider
      filter={filter}
      handleFilterChange={handleFilterChange}
      navigation={navigation}
    >
      {isMobile ? <MenuMobile /> : <MenuDesktop />}
    </MenuProvider>
  );
}
