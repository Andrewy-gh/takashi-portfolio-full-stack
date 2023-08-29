import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { theme } from '../styles/styles';
import ProfileCover from '../assets/profile-cover.webp';
import { saveToken } from '../utils/authStorage';
import { setToken } from '../services/api';

import { AuthContext } from '../contexts/AuthContext';

const flex = {
  display: 'flex',
  flexDirection: 'column',
  marginInline: 'auto',
  height: '100vh',
};

// focused outline color styles
const fieldStyle = {
  marginInline: 'auto',
  '& label.Mui-focused': {
    color: theme.palette.custom.main,
  },
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.custom.main,
    },
  },
};

const formStyle = {
  placeSelf: 'center center',
  width: 'min(80ch, 100% - 2rem)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  gap: '10px',
  mt: '8px',
  padding: 2,
};

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loggedIn, token, handleLogin } = useContext(AuthContext);

  useEffect(() => {
    if (loggedIn && token) {
      saveToken(token);
      setToken(token);
      navigate('/');
    }
  }, [loggedIn, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleLogin({ email, password });
  };

  return (
    <div style={flex}>
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
      <div style={formStyle}>
        <h1 style={{ marginBottom: '1rem' }}>Log In</h1>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            required
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={fieldStyle}
          ></TextField>
          <TextField
            label="Password"
            type="password"
            required
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={fieldStyle}
          ></TextField>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2, mb: 3 }}
          >
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
}
