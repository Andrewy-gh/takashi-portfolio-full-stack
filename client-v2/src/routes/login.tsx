import { type CSSProperties, type FormEvent, useState } from 'react';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { SxProps, Theme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import HomeIcon from '@mui/icons-material/Home';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import ProfileCover from '@/assets/profile-cover.webp';
import { theme } from '../theme';

export const Route = createFileRoute('/login')({
  component: RouteComponent,
});

const flex: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  marginInline: 'auto',
  height: '100vh',
};

// focused outline color styles
const fieldStyle: SxProps<Theme> = {
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

const formStyle: CSSProperties = {
  placeSelf: 'center center',
  width: 'min(80ch, 100% - 2rem)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  gap: '10px',
  marginTop: '8px',
  padding: 2,
};

function RouteComponent() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // if (adminStatus === 'No admin present') {
    //   await createAdmin({ email, password });
    //   setEmail('');
    //   setPassword('');
    // } else {
    //   await handleLogin({ email, password });
    // }
    console.log('submitted');
  };

  return (
    <div style={flex}>
      <Link to="/" search={{ filter: undefined }}>
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
        <h1 style={{ marginBottom: '1rem' }}>
          {/* {title} */}
          Title
        </h1>
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
            Button
          </Button>
        </form>
      </div>
    </div>
  );
}
