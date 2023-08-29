import { useMediaQuery } from '@mui/material/';
import MenuDesktop from './MenuDesktop';
import MenuMobile from './MenuMobile';
import { theme } from '../../styles/styles';
import { navigation } from '../../data/index';

import { AuthContext } from '../../contexts/AuthContext';
import { useContext } from 'react';

export default function Menu({ filter, handleFilterChange }) {
  const isMobile = useMediaQuery(theme.breakpoints.down('tablet'));
  const { loggedIn, token, handleLogout } = useContext(AuthContext);

  return (
    <>
      {isMobile ? (
        <MenuMobile
          filter={filter}
          handleFilterChange={handleFilterChange}
          handleLogout={handleLogout}
          loggedIn={loggedIn}
          navigation={navigation}
          token={token}
        />
      ) : (
        <MenuDesktop
          filter={filter}
          handleFilterChange={handleFilterChange}
          handleLogout={handleLogout}
          loggedIn={loggedIn}
          navigation={navigation}
          token={token}
        />
      )}
    </>
  );
}
