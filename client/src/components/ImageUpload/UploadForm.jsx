// import { useSelector } from 'react-redux';
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
// import { useDispatch } from 'react-redux';
// import { useTheme } from '@mui/material/styles';

import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Toolbar from "@mui/material/Toolbar";

import CloseIcon from "@mui/icons-material/Close";

// import Preview from './Preview';
// import { createPost } from '../reducers/postReducer';
// import { logout } from '../reducers/userReducer';

import navigation from "../../data/navigation";

import { theme } from "../../styles/styles";
import { Typography } from "@mui/material";

// focused outline color styles
const fieldStyle = {
  width: "30vw",
  marginInline: "auto",
  "& label.Mui-focused": {
    color: theme.palette.custom.main,
  },
  "& .MuiOutlinedInput-root": {
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.custom.main,
    },
  },
};

const autoCompleteOptionStyles = {
  background: theme.palette.custom.extraDark,
  color: theme.palette.custom.light,
};

export default function UploadForm({
  clearImages,
  handleClose,
  images,
  previewImages,
  uploadImages,
  submitImageData
}) {
  const types = navigation
    .filter((n) => n.type === "filter")
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
      title: "",
      type: "",
      file: undefined,
    },
  });

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      console.log("form state: form submit is successful");
      reset({ title: "", type: "", file: undefined });
    }
  }, [formState, reset]);

  const onSubmit = (data) => {
    // const formData = new FormData();
    // for (const image of images) {
    //   formData.append('file', image.data);
    // }
    // formData.append('title', data.title);
    // formData.append('type', data.type);
    // formData.append('project', data.project);
    // setImages([]);
    console.log(data);
    console.log("submit successful");
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
          display: "flex",
          justifyContent: "space-between",
          aligntItems: "center",
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
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: ".5em",
        }}
      >
        {/* TITLE */}

        <TextField
          label="Title"
          variant="outlined"
          {...register("title")}
          sx={fieldStyle}
        />

        {/* TYPE */}

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
                      "&& .Mui-selected": {
                        backgroundColor: "#b39984",
                        color: "#202020",
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
      <DialogActions sx={{ display: "flex", justifyContent: "center" }}>
        {/* UPLOAD  */}
        <div>
          <Button variant="contained" component="label">
            Upload File
            <input
              type="file"
              hidden
              multiple
              {...register("file")}
              onChange={(e) => {
                prepareImagePreview(e.target.files);
                register("file").onChange(e);
              }}
            />
          </Button>
        </div>
        {/* SUBMIT */}
        <div>
          <Button type="submit" variant="contained">
            Submit
          </Button>
        </div>
      </DialogActions>
    </form>
  );
}
