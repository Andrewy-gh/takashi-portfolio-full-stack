// import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import IconButton from '@mui/material/IconButton';
import { theme } from '../styles/styles';
import Typography from '@mui/material/Typography';
// import Admin from '../components/Menu/Admin';
// import LogoutButton from '../components/Menu/LogoutButton';
import LoginButton from '../components/Menu/LoginButton';
import ProfileCover from '../assets/profile-cover.png';
// import postServices from '../services/posts';

const HeaderStyle = {
  lineHeight: '1.6',
  fontFamily: 'Quando',
  marginTop: '1rem',
  marginBottom: '.25rem',
};

const BodyStyle = {
  fontFamily: 'Judson',
  lineHeight: '1.6',
};

export default function Profile() {
  // const user = useSelector(({ user }) => user);
  // if (user.loggedIn) {
  //   postServices.setToken(user.userToken);
  // }
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        marginInline: 'auto',
        height: '100vh',
      }}
    >
      <Link to="/">
        <IconButton style={{ placeSelf: 'start start' }}>
          <HomeIcon
            fontSize="large"
            sx={{ color: theme.palette.custom.light }}
          />
        </IconButton>
      </Link>
      <div style={{ maxWidth: 750, placeSelf: 'center center' }}>
        <img src={ProfileCover} alt="logo" />
      </div>
      <div
        style={{
          placeSelf: 'center center',
          width: 'min(80ch, 100% - 2rem)',
        }}
      >
        <Typography variant="body1" sx={BodyStyle}>
          My name is Takashi Miyazaki. I&apos;m a university student in Tokyo,
          studying language and international relations. I been in photography
          for 5 years and has published his work on various platforms. I usually
          shoots nature. I aim to create colors and images that are not
          over-processed, just memories and colors that make you remember the
          scene when you look at it.
        </Typography>
        <Typography variant="h5" sx={HeaderStyle}>
          Genres:
        </Typography>
        <Typography variant="body1" sx={BodyStyle}>
          Macro, Landscape, Animals, Nature, etc.
        </Typography>
        <Typography variant="h5" sx={HeaderStyle}>
          Equipment:
        </Typography>
        <Typography variant="body1" sx={BodyStyle}>
          Camera: Nikon D500, Nikon D7000 Lens: Nikkor 50mm F1.4G, Nikkor 50mm
          F1.8D, Nikkor 35mm F1.8G, Nikkor 24mm F2.8D, Nikkor 105mm F2.8D,
          Nikkor 18-135mm F3.5-F5.6G , Nikkor 16-80mm F2.8-4E VR, F2.8, Nikkor
          10-24mm F3.5-4.5G, Nikkor 70-200mm F2.8G VRII
        </Typography>
        <Typography variant="h5" sx={HeaderStyle}>
          Software:
        </Typography>
        <Typography variant="body1" sx={BodyStyle}>
          DxO Photolab, Nik Collection
        </Typography>
      </div>
      <div style={{ flexGrow: 1 }}></div>
      {/* Spacing */}
      <div
        style={{
          placeSelf: 'center end',
          padding: '2rem',
        }}
      >
        {/* {user.loggedIn ? <LogoutButton /> : <LoginButton />} */}
        <LoginButton />
      </div>
    </div>
  );
}
