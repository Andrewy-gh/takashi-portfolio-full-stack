import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Profile from './pages/Profile';
import imageServices from './services/image';
import { getAllImages } from './features/imageSlice';
import { getCloudName } from './features/cloudinarySlice';

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getCloudName());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getAllImages());
  }, [dispatch]);

  const user = useSelector(({ user }) => user);
  if (user.loggedIn) {
    imageServices.setToken(user.userToken);
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}
