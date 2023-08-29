import { Link } from 'react-router-dom';
import Default from '../../assets/default.webp';
import { renderLink } from '../../utils/navigation';
import { theme } from '../../styles/styles';

const activeStyle = {
  color: theme.palette.custom.main,
};

const inActiveStyle = {
  color: theme.palette.custom.light,
};

const flexColumns = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const sticky = {
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

export default function MenuDesktop({
  filter,
  handleFilterChange,
  handleLogout,
  loggedIn,
  navigation,
  token,
}) {
  return (
    <div style={sticky}>
      <div style={{ ...flexColumns, padding: theme.spacing(6) }}>
        <div style={{ minWidth: 200 }} onClick={() => handleFilterChange(null)}>
          <Link to="/">
            <img src={Default} alt="logo" />
          </Link>
        </div>
        <ul style={flexColumns}>
          {navigation.map((nav) =>
            nav.type === 'filter' ? (
              <li
                key={nav.id}
                style={{
                  ...typographyStyle,
                  ...(filter === nav.filter ? activeStyle : inActiveStyle),
                }}
                onClick={() => handleFilterChange(nav.filter)}
              >
                {nav.name}
              </li>
            ) : renderLink(nav, loggedIn, token) ? (
              <li key={nav.id} style={typographyStyle}>
                <Link to={nav.path}>{nav.name}</Link>
              </li>
            ) : null
          )}
          {loggedIn && token && (
            <li style={typographyStyle} onClick={handleLogout}>
              Logout
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
