import {
  type ChangeEvent,
  type CSSProperties,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useForm, Controller } from 'react-hook-form';

import useMediaQuery from '@mui/material/useMediaQuery';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import CloseIcon from '@mui/icons-material/Close';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';

import { IImage } from '@server/src/models/image';
import { client } from '@/api';
import { imageTypes } from '@server/src/schemas';
import { theme } from '@/theme';

type ImagePreview = {
  file: File;
  url: string;
};

type FormData = {
  title: string;
  type: string;
  files: File | File[];
};

// MARK: Styles
const fieldSpacing: CSSProperties = {
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

const desktopWidth: CSSProperties = {
  width: '30vw',
};

const mobileWidth: CSSProperties = {
  width: '100%',
};

const flex: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '.3125rem',
  width: '100%',
};

const imageItem: CSSProperties = {
  position: 'relative',
  width: '100px',
  flex: '0 1 auto',
};

const removeButton: CSSProperties = {
  position: 'absolute',
  left: '1.25%',
  top: '1.25%',
  color: 'black',
  backgroundColor: 'rgba(255,255,255,0.5)',
};

export function UploadForm({ onClose }: { onClose: () => void }) {
  const [previews, setPreviews] = useState<ImagePreview[]>([]);
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful },
    setValue,
    trigger,
  } = useForm<FormData>({
    defaultValues: {
      title: '',
      type: '',
      files: [],
    },
  });
  register('files', { required: 'Image is required' });
  // console.log('errors', errors);
  // useEffect(() => {
  //   if (formState.isSubmitSuccessful) {
  //     reset({ title: '', type: '', files: [] });
  // handleClose();
  //   }
  // }, [formState, reset]);

  const isMobile = useMediaQuery(theme.breakpoints.down('tablet'));

  // MARK: form functions
  const onSubmit = async (data: FormData) => {
    const res = await client.api.images.$post({ form: data });
    console.log('res', res);
    if (res.status === 500) {
      const data: { error: string } = await res.json();
      console.log(data.error);
    }
    if (res.ok) {
      const data: { images: IImage[] } = await res.json();
      console.log('data', data.images);
      console.log('isSubmitSuccessful', isSubmitSuccessful);
      reset({ title: '', type: '', files: [] });
      handleClose();
    }
  };

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files) {
        const newPreviews = Array.from(files).map((file) => ({
          file,
          url: URL.createObjectURL(file),
        }));
        const updatedPreviews = [...previews, ...newPreviews];
        setPreviews(updatedPreviews);
        const updatedValues = updatedPreviews.map((preview) => preview.file);
        setValue('files', updatedValues);
      }
    },
    [previews, setValue]
  );

  // MARK: preview state/functions
  const handleClose = () => {
    onClose();
    setPreviews([]);
  };

  const removePreview = useCallback(
    async (url: string) => {
      const updatedPreviews = previews.filter((preview) => preview.url !== url);
      const removedPreview = previews.find((preview) => preview.url === url);
      if (removedPreview) {
        URL.revokeObjectURL(removedPreview.url);
      }
      setPreviews(updatedPreviews);
      const updatedValues = updatedPreviews.map((preview) => preview.file);
      setValue('files', updatedValues);
    },
    [previews, setValue]
  );

  return (
    <div style={{ padding: isMobile ? '1rem' : '2rem' }}>
      {/* MARK: Form */}
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
              setPreviews([]);
            }}
            variant="contained"
          >
            Reset
          </Button>
        </Toolbar>

        <DialogContent sx={fieldSpacing}>
          {/*  TITLE */}
          <TextField
            label="Title"
            variant="outlined"
            {...register('title')}
            sx={{ ...fieldStyle, ...(isMobile ? mobileWidth : desktopWidth) }}
          />

          {/*  TYPE */}
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
                    {imageTypes.map((type) => (
                      <MenuItem value={type.value} key={type.id}>
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
          {errors.files?.type === 'required' && (
            <p role="alert">Image is required</p>
          )}
        </DialogContent>
        <DialogActions
          sx={{ display: 'flex', justifyContent: 'center', gap: '1.25rem' }}
        >
          {/* MARK: Upload  */}
          <Button variant="contained" component="label">
            Upload File
            <Controller
              control={control}
              name="files"
              rules={{ required: 'Image is required' }}
              render={({ field: { value, onChange, ...field } }) => {
                return (
                  <input
                    {...field}
                    onChange={(event) => {
                      handleFileChange(event);
                    }}
                    hidden
                    type="file"
                    multiple
                  />
                );
              }}
            />
          </Button>

          {/* SUBMIT */}
          <Button type="submit" variant="contained">
            Submit
          </Button>
        </DialogActions>
      </form>

      {/* MARK: Preview */}
      {previews.length > 0 && (
        <div>
          <h3 style={{ marginBottom: '.5rem' }}>Preview</h3>
          <div style={flex}>
            {previews.map((preview) => (
              <div key={preview.url} style={imageItem}>
                <img src={preview.url} alt="image preview" />
                <IconButton
                  sx={removeButton}
                  onClick={() => removePreview(preview.url)}
                >
                  <CloseIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
