import { useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { client } from '@/api';
import { IImage } from '@server/src/models/image';
import { theme } from '@/theme';
import { types } from '@/constants';

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

export function EditForm({
  onClose,
  image,
}: {
  onClose: () => void;
  image: IImage;
}) {
  const [title, setTitle] = useState(image.title);
  const [type, setType] = useState(image.type);
  const isMobile = useMediaQuery(theme.breakpoints.down('tablet'));

  const handleSubmit = async () => {
    const res = await client.api.images[':id'].$put({
      param: { id: image.id },
      form: { title, type },
    });
    if (res.status === 404 || res.status === 500) {
      const data: { error: string } = await res.json();
      console.log(data.error);
    }
    if (res.ok) {
      const data: { image: IImage } = await res.json();
      console.log(data.image);
      onClose();
    }
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
        <Button variant="contained" onClick={() => onClose()}>
          CANCEL
        </Button>
        <Button variant="contained" onClick={handleSubmit}>
          Submit
        </Button>
      </DialogActions>
    </div>
  );
}
