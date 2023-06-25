// import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
// import { useDispatch } from 'react-redux';
// import { useTheme } from '@mui/material/styles';

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

import CloseIcon from '@mui/icons-material/Close';

// import Preview from './Preview';
// import { createPost } from '../reducers/postReducer';
// import { logout } from '../reducers/userReducer';

import navigation from '../../data/navigation';

import { theme } from '../../styles/styles';

const fieldSpacing = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '.5em',
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

const desktopWidth = {
  width: '30vw',
};

const mobileWidth = {
  width: '100%',
};

export default function UploadForm({
  clearImages,
  handleClose,
  previewImages,
  submitImageData,
}) {
  // const dispatch = useDispatch();
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState,
    formState: { isSubmitSuccessful },
  } = useForm({
    defaultValues: {
      title: '',
      type: '',
      file: undefined,
    },
  });

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      console.log('form state: form submit is successful');
      reset({ title: '', type: '', file: undefined });
      handleClose();
    }
  }, [formState, reset]);

  const isMobile = useMediaQuery(theme.breakpoints.down('tablet'));
  const types = navigation
    .filter((n) => n.type === 'filter')
    .map((n) => ({ id: n.id, name: n.name }));

  const onSubmit = (data) => {
    // const formData = new FormData();
    // for (const image of images) {
    //   formData.append('file', image.data);
    // }
    // formData.append('title', data.title);
    // formData.append('type', data.type);
    // formData.append('project', data.project);
    // setImages([]);
    console.log('submitting data: ', data);
    submitImageData(data);
    // dispatch(createPost(formData));
  };

  const prepareImagePreview = (files) => {
    clearImages();
    let arr = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const img = {
        id: i + 1,
        preview: URL.createObjectURL(file),
        data: file,
      };
      arr.push(img);
    }
    previewImages(arr);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form">
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          aligntItems: 'center',
        }}
      >
        {/* CLOSE */}

        <IconButton
          edge="start"
          color="inherit"
          onClick={handleClose}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>

        <DialogTitle id="responsive-dialog-title">Upload Image</DialogTitle>

        {/* RESET */}

        <Button
          type="button"
          onClick={() => {
            reset();
            clearImages();
          }}
          variant="contained"
        >
          Reset
        </Button>
      </Toolbar>
      <DialogContent sx={fieldSpacing}>
        {/* TITLE */}

        <TextField
          label="Title"
          variant="outlined"
          {...register('title')}
          sx={{ ...fieldStyle, ...(isMobile ? mobileWidth : desktopWidth) }}
        />

        {/* TYPE */}

        <Controller
          name="type"
          render={({ field }) => (
            <>
              <FormControl
                sx={{
                  ...fieldStyle,
                  ...(isMobile ? mobileWidth : desktopWidth),
                }}
              >
                <InputLabel>Type</InputLabel>
                <Select
                  {...field}
                  label="type"
                  MenuProps={{
                    sx: {
                      '&& .Mui-selected': {
                        backgroundColor: '#b39984',
                        color: '#202020',
                      },
                    },
                  }}
                >
                  {types.map((type) => (
                    <MenuItem value={type.name.toLowerCase()} key={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}
          control={control}
          defaultValue=""
        />
      </DialogContent>
      <DialogActions
        sx={{ display: 'flex', justifyContent: 'center', gap: '1.25rem' }}
      >
        {/* UPLOAD  */}
        <Button variant="contained" component="label">
          Upload File
          <input
            type="file"
            hidden
            multiple
            {...register('file')}
            onChange={(e) => {
              prepareImagePreview(e.target.files);
              register('file').onChange(e);
            }}
          />
        </Button>
        {/* SUBMIT */}
        <Button type="submit" variant="contained">
          Submit
        </Button>
      </DialogActions>
    </form>
  );
}
