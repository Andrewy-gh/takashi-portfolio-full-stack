import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Edit from './pages/Edit';
import Home from './pages/Home';
import Profile from './pages/Profile';
// import imageServices from './services/image';
import { setToken } from './services/api';
import { getAllImages } from './features/imageSlice';
import { getCloudName } from './features/cloudinarySlice';

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getCloudName());
    dispatch(getAllImages());
  }, [dispatch]);

  const user = useSelector(({ user }) => user);
  if (user.loggedIn) {
    console.log(user.userToken);
    setToken(user.userToken);
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<Home />} />
        <Route path="/edit" element={<Edit />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}
