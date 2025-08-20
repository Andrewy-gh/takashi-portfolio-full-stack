import { Link } from '@tanstack/react-router';
import { DrawerMenu } from './drawer-menu';

const flex = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingInline: 3,
  margin: '.25rem',
  paddingTop: '.625rem',
};

const logoStyle = {
  fontSize: 'clamp(1.73rem, calc(1.48rem + 1.23vw), 2.96rem)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundImage:
    'linear-gradient(90deg, rgba(104,94,80,1) 0%, rgba(149,129,111,1) 35%, rgba(179,153,132,1) 100%)',
};

export function MenuMobile() {
  return (
    <div style={flex}>
      <Link to="/" search={{ filter: undefined }}>
        <h1 style={logoStyle}>TAKASHI MIYAZAKI</h1>
      </Link>
      <DrawerMenu />
    </div>
  );
}
