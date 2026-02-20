import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import Default from '../../assets/default.webp';
import { theme } from '../../styles/styles';
import MenuItems, { type MenuItemRenderProps } from './MenuItems';
import { useMenuContext } from './MenuContext';

const activeStyle: CSSProperties = {
  color: theme.palette.custom.main,
};

const inActiveStyle: CSSProperties = {
  color: theme.palette.custom.light,
};

const flexColumns: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const menuListStyle: CSSProperties = {
  ...flexColumns,
  listStyle: 'none',
  margin: 0,
  padding: 0,
};

const sticky: CSSProperties = {
  position: 'sticky',
  top: theme.spacing(1),
};

const typographyStyle: CSSProperties = {
  fontSize: 'clamp(1.00rem, calc(0.85rem + 0.30vw), 1.25rem)',
  fontWeight: '300',
  lineHeight: '1.6',
  fontFamily: 'Quando',
  marginBottom: theme.spacing(1),
  cursor: 'pointer',
};

const categoryTypographyStyle: CSSProperties = {
  ...typographyStyle,
  fontSize: 'clamp(0.94rem, calc(0.80rem + 0.26vw), 1.12rem)',
};

const profileTypographyStyle: CSSProperties = {
  ...typographyStyle,
  marginTop: theme.spacing(1),
};

export default function MenuDesktop() {
  const { handleFilterChange } = useMenuContext();
  return (
    <div style={sticky}>
      <div
        style={{
          ...flexColumns,
          paddingTop: theme.spacing(4),
          paddingBottom: theme.spacing(6),
          paddingInline: theme.spacing(6),
        }}
      >
        <div style={{ minWidth: 200 }} onClick={() => handleFilterChange(null)}>
          <Link to="/">
            <img src={Default} alt="logo" />
          </Link>
        </div>
        <ul style={menuListStyle}>
          <MenuItems Item={MenuDesktopItem} />
        </ul>
      </div>
    </div>
  );
}

function MenuDesktopItem({ item, isActive, onSelect }: MenuItemRenderProps) {
  if (item.type === 'filter') {
    return (
      <li
        style={{
          ...categoryTypographyStyle,
          ...(isActive ? activeStyle : inActiveStyle),
        }}
        onClick={onSelect}
      >
        {item.name}
      </li>
    );
  }

  if (item.path) {
    return (
      <li style={profileTypographyStyle}>
        <Link to={item.path}>{item.name}</Link>
      </li>
    );
  }

  return null;
}
