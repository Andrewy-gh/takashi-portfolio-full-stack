import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import useMediaQuery from '@mui/material/useMediaQuery';
import { theme } from '../../styles/styles';
import navigation from '../../data/navigation';

const fieldSpacing = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '1em',
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

const selectItemStyle = {
  '&& .Mui-selected': {
    backgroundColor: '#b39984',
    color: '#202020',
  },
};

const desktopWidth = {
  width: '30vw',
};

const mobileWidth = {
  width: '100%',
};

export default function EditForm({ handleClose, image, updateImage }) {
  const [title, setTitle] = useState(image.title);
  const [type, setType] = useState(image.type);
  const isMobile = useMediaQuery(theme.breakpoints.down('tablet'));
  const types = navigation
    .filter((n) => n.type === 'filter')
    .map((n) => ({ id: n.id, name: n.name }));

  const handleSubmit = () => {
    updateImage({ title, type });
    handleClose();
  };

  return (
    <div>
      <div>
        <DialogTitle sx={{ textAlign: 'center' }}>Edit Details</DialogTitle>
      </div>
      <DialogContent sx={fieldSpacing}>
        <TextField
          label="Title"
          variant="outlined"
          defaultValue={image.title}
          sx={{ ...fieldStyle, ...(isMobile ? mobileWidth : desktopWidth) }}
          onChange={(e) => setTitle(e.target.value)}
        />

        <FormControl
          sx={{
            ...fieldStyle,
            ...(isMobile ? mobileWidth : desktopWidth),
          }}
        >
          <InputLabel>Type</InputLabel>
          <Select
            label="type"
            value={image.type}
            MenuProps={{
              sx: {
                selectItemStyle,
              },
            }}
            onChange={(e) => setType(e.target.value)}
          >
            {types.map((type) => (
              <MenuItem value={type.name.toLowerCase()} key={type.id}>
                {type.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions
        sx={{ display: 'flex', justifyContent: 'center', gap: '1.25rem' }}
      >
        {/* Cancel  */}
        <Button variant="contained" onClick={handleClose}>
          CANCEL
        </Button>
        {/* SUBMIT */}
        <Button variant="contained" onClick={handleSubmit}>
          Submit
        </Button>
      </DialogActions>
    </div>
  );
}
