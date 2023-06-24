import { configureStore } from '@reduxjs/toolkit';
import cloudinaryReducer from '../features/cloudinarySlice';
import userReducer from '../features/userSlice';
import imageReducer from '../features/imageSlice';

const store = configureStore({
  reducer: {
    cloudName: cloudinaryReducer,
    images: imageReducer,
    user: userReducer,
  },
});

export default store;
