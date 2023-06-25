import { createSlice } from '@reduxjs/toolkit';
import imageService from '../services/image';

const initialState = {
  data: [],
  //   message: '',
};

const imageSlice = createSlice({
  name: 'images',
  initialState,
  reducers: {
    addNewImage(state, action) {
      const { message, images } = action.payload;
      console.log('upload successful', { message, images });
      // state.message = message;
      // console.log(action.payload);
      state.data.push(...images);
    },
    removeImage(state, action) {
      const id = action.payload;
      //   state.message = "image removed";
      state.data = state.data.filter((image) => image.id !== id);
    },
    setImages(state, action) {
      state.data = action.payload;
    },
    updateOneImage(state, action) {
      const updatedimage = action.payload;
      state.data = state.data.map((image) =>
        image.id === updatedimage.id ? updatedimage : image
      );
    },
    updateOrder(state, action) {
      const updatedOrder = action.payload;
      //   state.message = "Order updated";
      state.data = state.data.map((image, i) => (image = updatedOrder[i]));
    },
    // setMessage(state, action) {
    //   state.message = action.payload;
    // },
  },
});

export const {
  updateOrder,
  updateImage,
  removeImage,
  addNewImage,
  setImages,
  //   setMessage,
} = imageSlice.actions;
export const getAllImages = () => {
  return async (dispatch) => {
    const images = await imageService.getAllImages();
    dispatch(setImages(images));
  };
};
export const updateOneImage = (id, content) => {
  return async (dispatch) => {
    console.log('thunk received');
    const updatedimage = await imageService.updateOneImage(id, content);
    console.log('thunk response: ', updatedimage);
    dispatch(updateImage(updatedimage));
  };
};
export const updateImageOrder = (order) => {
  return async (dispatch) => {
    const updatedOrder = await imageService.updateImageOrder(order);
    dispatch(updateOrder(updatedOrder));
  };
};
export const uploadNewImage = (content) => {
  return async (dispatch) => {
    const response = await imageService.uploadNewImage(content);
    if (response.success) {
      dispatch(addNewImage(response));
    }
  };
};
export const removeOneImage = (id) => {
  return async (dispatch) => {
    await imageService.removeOneImage(id);
    dispatch(removeImage(id));
  };
};
export default imageSlice.reducer;
