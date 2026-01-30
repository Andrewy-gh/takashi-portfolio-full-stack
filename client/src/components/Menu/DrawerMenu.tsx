import { useState } from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Drawer from '@mui/material/Drawer';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { theme } from '../../styles/styles';
import MenuItems, { type MenuItemRenderProps } from './MenuItems';

const activeStyle = {
  color: theme.palette.custom.main,
};

const inActiveStyle = {
  color: theme.palette.custom.light,
};

const menuStyle = {
  backgroundColor: theme.palette.custom.extraDark,
  padding: '1em',
};

const buttonStyle = {
  fontSize: 'clamp(1.20rem, calc(1.11rem + 0.47vw), 1.67rem)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundImage:
    'linear-gradient(90deg, rgba(104,94,80,1) 0%, rgba(149,129,111,1) 35%, rgba(179,153,132,1) 100%)',
};

export default function DrawerMenu() {
  const [open, setOpen] = useState(false);

  const getList = () => (
    <Box sx={menuStyle} onClick={() => setOpen(false)}>
      <MenuItems Item={MenuDrawerItem} />
    </Box>
  );
  return (
    <>
      <ButtonBase sx={buttonStyle} onClick={() => setOpen(true)}>
        MENU
      </ButtonBase>
      <Drawer open={open} anchor={'top'} onClose={() => setOpen(false)}>
        {getList()}
      </Drawer>
    </>
  );
}

function MenuDrawerItem({ item, isActive, onSelect }: MenuItemRenderProps) {
  if (item.type === 'filter') {
    return (
      <ListItem sx={{ cursor: 'pointer' }} onClick={onSelect}>
        <ListItemText
          primary={item.name}
          primaryTypographyProps={{ variant: 'h4' }}
          sx={isActive ? activeStyle : inActiveStyle}
        />
      </ListItem>
    );
  }

  if (item.path) {
    return (
      <ListItem>
        <Link to={item.path}>
          <ListItemText
            primary={item.name}
            primaryTypographyProps={{ variant: 'h4' }}
          />
        </Link>
      </ListItem>
    );
  }

  return null;
}
