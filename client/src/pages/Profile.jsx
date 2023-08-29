import { useContext } from 'react';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import IconButton from '@mui/material/IconButton';
import { theme } from '../styles/styles';
import ProfileCover from '../assets/profile-cover.webp';
import { AuthContext } from '../contexts/AuthContext';

const BodyStyle = {
  fontFamily: 'Judson',
  fontSize: '1rem',
  lineHeight: '1.6',
};

const HeaderStyle = {
  lineHeight: '1.6',
  fontFamily: 'Quando',
  marginTop: '1rem',
  marginBottom: '.25rem',
};

const typographyStyle = {
  fontSize: '1rem',
  lineHeight: '1.6',
  fontFamily: 'Quando',
  cursor: 'pointer',
};

export default function Profile() {
  const { loggedIn, token } = useContext(AuthContext);
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
        <p style={BodyStyle}>
          My name is Takashi Miyazaki. I&apos;m a university student in Tokyo,
          studying language and international relations. I&apos;ve a photograper
          for 5 years with published work on various platforms. Nature shots are
          my preference. My aim is to create images with colors that are not
          over-processed, and invokes emotions and memories of a scene as if you
          were present.
        </p>
        <h3 style={HeaderStyle}>Genres:</h3>
        <p style={BodyStyle}>Macro, Landscape, Animals, Nature, etc.</p>
        <h3 style={HeaderStyle}>Equipment:</h3>
        <p style={BodyStyle}>
          Camera: Nikon D500, Nikon D7000 Lens: Nikkor 50mm F1.4G, Nikkor 50mm
          F1.8D, Nikkor 35mm F1.8G, Nikkor 24mm F2.8D, Nikkor 105mm F2.8D,
          Nikkor 18-135mm F3.5-F5.6G , Nikkor 16-80mm F2.8-4E VR, F2.8, Nikkor
          10-24mm F3.5-4.5G, Nikkor 70-200mm F2.8G VRII
        </p>
        <h3 style={HeaderStyle}>Software:</h3>
        <p style={BodyStyle}>DxO Photolab, Nik Collection</p>
      </div>
      <div style={{ flexGrow: 1 }}></div>
      {loggedIn && token ? null : (
        <div
          style={{
            placeSelf: 'center end',
            padding: '2rem',
          }}
        >
          <div style={typographyStyle}>
            <Link to="/login">Login</Link>
          </div>
        </div>
      )}
    </div>
  );
}
