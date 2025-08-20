import { useMediaQuery } from '@mui/material/';
import { MenuDesktop } from './menu-desktop';
import { MenuMobile } from './menu-mobile';
// import { AuthContext } from '../../contexts/AuthContext';
// import { useContext } from 'react';
import { theme } from '@/theme';

export function Menu() {
  const isMobile = useMediaQuery(theme.breakpoints.down('tablet'));
  // const { loggedIn, token, handleLogout } = useContext(AuthContext);

  return <>{isMobile ? <MenuMobile /> : <MenuDesktop />}</>;
}
