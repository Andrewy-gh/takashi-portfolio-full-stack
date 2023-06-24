import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import ImageUpload from '../ImageUpload';
import CoverMobile from '../../assets/cover-mobile-cropped.png';
import DrawerMenu from './DraweMenu';
import { Typography } from '@mui/material';

const flex = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingInline: 3,
  margin: '.25rem',
  // paddingTop: '.625rem',
};

const logoContainer = {
  paddingTop: '.625rem',
  maxWidth: '70vw',
};

const logoStyle = {
  fontSize: 'clamp(1.73rem, calc(1.48rem + 1.23vw), 2.96rem)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundImage:
    'linear-gradient(90deg, rgba(104,94,80,1) 0%, rgba(149,129,111,1) 35%, rgba(179,153,132,1) 100%)',
};

export default function MenuMobile({ navigation }) {
  return (
    <Box sx={{ px: 1 }}>
      <Box sx={{ flex }}>
        <Link to="/">
          <Box
          // onClick={() => handleClick(null)}
          >
            <Typography as="h1" sx={logoStyle}>
              TAKASHI MIYAZAKI
            </Typography>
          </Box>
        </Link>
        <DrawerMenu
          navigation={navigation}
          //  filter={filter} setImageFilter={setImageFilter}
        />
      </Box>
      <ImageUpload />
    </Box>
  );
}
