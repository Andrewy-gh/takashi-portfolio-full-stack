import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';

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
import { types } from '../../data';
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

type UploadFormData = {
  title: string;
  type: string;
  file?: FileList;
};

export default function UploadForm({
  clearImages,
  handleClose,
  previewImages,
  submitImageData,
}: {
  clearImages: () => void;
  handleClose: () => void;
  previewImages: (images: { id: number; preview: string; data: File }[]) => void;
  submitImageData: (data: UploadFormData) => void;
}) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful },
  } = useForm<UploadFormData>({
    defaultValues: {
      title: '',
      type: '',
      file: undefined,
    },
  });

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset({ title: '', type: '', file: undefined });
      handleClose();
    }
  }, [handleClose, isSubmitSuccessful, reset]);

  const isMobile = useMediaQuery(theme.breakpoints.down('tablet'));

  const onSubmit = (data: UploadFormData) => {
    submitImageData(data);
  };

  const prepareImagePreview = (files: FileList | null) => {
    if (!files) return;
    clearImages();
    const arr: { id: number; preview: string; data: File }[] = [];
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

  const fileRegister = register('file', { required: 'Image is required' });

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
        {errors.file?.type === 'required' && (
          <p role="alert">Image is required</p>
        )}
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
            {...fileRegister}
            onChange={(e) => {
              prepareImagePreview(e.target.files);
              fileRegister.onChange(e);
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
