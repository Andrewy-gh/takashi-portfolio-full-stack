// import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
// import { useDispatch } from 'react-redux';
// import { useTheme } from '@mui/material/styles';

import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';

import CloseIcon from '@mui/icons-material/Close';

// import Preview from './Preview';
// import { createPost } from '../reducers/postReducer';
// import { logout } from '../reducers/userReducer';

import navigation from '../../data/navigation';

import { theme } from '../../styles/styles';

// focused outline color styles
const fieldStyle = {
  width: '150px',
  margin: '5px',
  '& label.Mui-focused': {
    color: theme.palette.custom.main,
  },
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.custom.main,
    },
  },
};

const autoCompleteOptionStyles = {
  background: theme.palette.custom.extraDark,
  color: theme.palette.custom.light,
};

export default function UploadForm({ handleClose }) {
  // const projects = useSelector(({ posts }) => posts.data).reduce(
  //   (acc, curr) => {
  //     if (!acc.includes(curr.project)) {
  //       return [...acc, curr.project];
  //     }
  //     return acc;
  //   },
  //   []
  // );
  // TODO: change projects
  const projects = navigation
    .filter((n) => n.type === 'filter')
    .map((n) => n.name);

  const types = navigation
    .filter((n) => n.type === 'filter')
    .map((n) => ({ id: n.id, name: n.name }));

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
      project: '',
      file: undefined,
    },
  });
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset({ title: '', type: '', project: '', file: undefined });
    }
  }, [formState, reset]);

  const onSubmit = (data) => {
    const formData = new FormData();
    for (const image of images) {
      formData.append('file', image.data);
    }
    formData.append('title', data.title);
    formData.append('type', data.type);
    formData.append('project', data.project);
    setImages([]);

    console.log('submit successful');
    // dispatch(createPost(formData));
  };

  // const removePreview = (updatedObj) => {
  //   setImages(updatedObj);
  // };

  const onClickHandler = () => {
    handleClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form">
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          onClick={onClickHandler}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
        <DialogTitle id="responsive-dialog-title">Upload Image</DialogTitle>
        <Button
          type="button"
          onClick={() => {
            reset();
            setImages([]);
          }}
          variant="contained"
        >
          Reset
        </Button>
      </Toolbar>
      <DialogContent>
        <div>
          <TextField
            label="Title"
            variant="outlined"
            {...register('title')}
            sx={fieldStyle}
          />
        </div>
        <div>
          <Controller
            name="type"
            render={({ field }) => (
              <>
                <FormControl sx={fieldStyle}>
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
        </div>
        <div>
          <Controller
            control={control}
            name="project"
            render={({ field: { onChange, value } }) => (
              <Autocomplete
                freeSolo
                options={projects}
                onChange={(event, values) => onChange(values)}
                value={value}
                PaperComponent={({ children }) => (
                  <Paper sx={autoCompleteOptionStyles}>{children}</Paper>
                )}
                renderInput={(params) => (
                  <TextField
                    sx={fieldStyle}
                    {...params}
                    label="Project"
                    variant="outlined"
                    onChange={onChange}
                  />
                )}
              />
            )}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <div>
          <Button variant="contained" component="label">
            Upload File
            <input
              type="file"
              hidden
              multiple
              {...register('file')}
              onChange={(event) => {
                setImages([]);
                let arr = [];
                for (const file of event.target.files) {
                  const img = {
                    preview: URL.createObjectURL(file),
                    data: file,
                  };
                  arr.push(img);
                }
                setImages(arr);
                register('file').onChange(event);
              }}
            />
          </Button>
        </div>
        <div>
          <Button type="submit" variant="contained">
            Submit
          </Button>
        </div>
      </DialogActions>
    </form>
    // <DialogContent>
    //   {images.length > 0 && (
    //     <Preview images={images} removePreview={removePreview} />
    //   )}
    // </DialogContent>
  );
}
