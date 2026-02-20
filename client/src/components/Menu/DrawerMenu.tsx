import { useState } from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import CloseIcon from '@mui/icons-material/Close';
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
  maxHeight: '100dvh',
  overflowY: 'auto',
  WebkitOverflowScrolling: 'touch',
  padding: '0.5em 1em 1em',
};

const buttonStyle = {
  fontSize: 'clamp(1.20rem, calc(1.11rem + 0.47vw), 1.67rem)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundImage:
    'linear-gradient(90deg, rgba(104,94,80,1) 0%, rgba(149,129,111,1) 35%, rgba(179,153,132,1) 100%)',
};

const closeButtonRowStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  position: 'sticky',
  top: 0,
  zIndex: 1,
  backgroundColor: theme.palette.custom.extraDark,
};

const itemTypographyStyle = {
  fontSize: 'clamp(0.95rem, calc(0.86rem + 0.44vw), 1.25rem)',
  lineHeight: 1.45,
  fontFamily: 'Quando',
  fontWeight: 300,
};

export default function DrawerMenu() {
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);

  const DrawerItem = (props: MenuItemRenderProps) => (
    <MenuDrawerItem {...props} onClose={handleClose} />
  );

  const getList = () => (
    <Box sx={menuStyle}>
      <Box sx={closeButtonRowStyle}>
        <IconButton
          aria-label="Close menu"
          onClick={handleClose}
          sx={{ color: theme.palette.custom.light }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <MenuItems Item={DrawerItem} />
    </Box>
  );
  return (
    <>
      <ButtonBase sx={buttonStyle} onClick={() => setOpen(true)}>
        MENU
      </ButtonBase>
      <Drawer open={open} anchor={'top'} onClose={handleClose}>
        {getList()}
      </Drawer>
    </>
  );
}

type MenuDrawerItemProps = MenuItemRenderProps & {
  onClose: () => void;
};

function MenuDrawerItem({ item, isActive, onSelect, onClose }: MenuDrawerItemProps) {
  if (item.type === 'filter') {
    return (
      <ListItem
        sx={{ cursor: 'pointer', py: 0.3 }}
        onClick={() => {
          onSelect();
          onClose();
        }}
      >
        <ListItemText
          primary={item.name}
          primaryTypographyProps={{ sx: itemTypographyStyle }}
          sx={isActive ? activeStyle : inActiveStyle}
        />
      </ListItem>
    );
  }

  if (item.path) {
    return (
      <ListItem sx={{ py: 0.3 }}>
        <Link to={item.path} onClick={onClose}>
          <ListItemText
            primary={item.name}
            primaryTypographyProps={{ sx: itemTypographyStyle }}
          />
        </Link>
      </ListItem>
    );
  }

  return null;
}
