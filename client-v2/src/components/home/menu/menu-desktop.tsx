import { type CSSProperties } from 'react';
import { Link } from '@tanstack/react-router';
import Default from '@/assets/default.webp';
import { theme } from '@/theme';
import { navigation } from '@/constants';
import { ImageType } from '@server/src/schemas';

const activeStyle = {
  color: theme.palette.custom.main,
};

const flexColumns: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const sticky: CSSProperties = {
  position: 'sticky',
  top: theme.spacing(2),
};

const typographyStyle = {
  fontSize: 'clamp(1.00rem, calc(0.85rem + 0.30vw), 1.25rem)',
  fontWeight: '300',
  lineHeight: '1.6',
  fontFamily: 'Quando',
  marginBottom: theme.spacing(1),
  cursor: 'pointer',
};

export function MenuDesktop() {
  return (
    <div style={sticky}>
      <div style={{ ...flexColumns, padding: theme.spacing(6) }}>
        <div
          style={{ minWidth: 200 }}
          // onClick={() => handleFilterChange(null)}
        >
          <Link to="/" search={{ filter: undefined }}>
            <img src={Default} alt="logo" />
          </Link>
        </div>
        <ul style={flexColumns}>
          {navigation.map(
            (nav) =>
              nav.type === 'filter' ? (
                <li
                  key={nav.id}
                  style={{
                    ...typographyStyle,
                    // ...(filter === nav.filter ? activeStyle : inActiveStyle),
                  }}
                  // onClick={() => handleFilterChange(nav.filter)}
                >
                  <Link
                    to="/"
                    search={{ filter: nav.filter as ImageType }}
                    activeProps={{ style: activeStyle }}
                  >
                    {nav.name}
                  </Link>
                </li>
              ) : (
                // renderLink(nav, loggedIn, token) ?
                <li key={nav.id} style={typographyStyle}>
                  <Link to={nav.path} activeProps={{ style: activeStyle }}>
                    {nav.name}
                  </Link>
                </li>
              )
            // : null
          )}
          {/* {loggedIn && token && (
            <li style={typographyStyle} onClick={handleLogout}>
              Logout
            </li>
          )} */}
        </ul>
      </div>
    </div>
  );
}
