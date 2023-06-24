import { createSlice } from '@reduxjs/toolkit';
import cloudinary from '../services/cloudinary';

const cloudinarySlice = createSlice({
  name: 'cloudName',
  initialState: '',
  reducers: {
    setCloudName(state, action) {
      return (state = action.payload);
    },
  },
});

export const { setCloudName } = cloudinarySlice.actions;

export const getCloudName = () => {
  return async (dispatch) => {
    const cloudName = await cloudinary.getCloudName();
    dispatch(setCloudName(cloudName));
  };
};

export default cloudinarySlice.reducer;
