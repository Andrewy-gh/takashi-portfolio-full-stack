import { createSlice } from '@reduxjs/toolkit';
import { getToken } from '../utils/index';

const userToken = document.cookie ? getToken() : null;
const loggedIn = document.cookie ? true : false;

const initialState = {
  loggedIn,
  userToken,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout(state) {
      document.cookie =
        'jwtPortfolioApp= ; expires = Thu, 01 Jan 1970 00:00:00 GMT';
      state.loggedIn = false;
      state.userToken = null;
    },
  },
});

export const { logout } = userSlice.actions;

export default userSlice.reducer;
