import { Link } from 'react-router-dom';
import { Container, Typography, useMediaQuery } from '@mui/material/';

import { styled } from '@mui/material/styles';
import { theme } from '../../styles//styles';
import navigation from '../../data/navigation';
import Default from '../../assets/default.png';
import CoverMobile from '../../assets/cover-mobile-cropped.png';

const MenuDesktopContainer = styled(Container)(() => ({
  position: 'sticky',
  top: theme.spacing(2),
}));

const MenuFixedContent = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(6),
}));

const CustomFlexContainer = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const TypographyStyle = {
  lineHeight: '1.6',
  fontFamily: 'Quando',
  marginBottom: theme.spacing(1),
  cursor: 'pointer',
};

const activeStyle = {
  color: theme.palette.custom.main,
};

const inActiveStyle = {
  color: theme.palette.custom.light,
};
