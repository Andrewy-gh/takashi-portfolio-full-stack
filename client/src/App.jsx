import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Edit from './pages/Edit';
import Home from './pages/Home';
import Profile from './pages/Profile';
import { setToken } from './services/api';
import { getAllImages } from './features/imageSlice';
import { getCloudName } from './features/cloudinarySlice';
import { disableReactDevTools } from '@fvilers/disable-react-devtools';

if (process.env.NODE_ENV === 'production') disableReactDevTools();

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getCloudName());
    dispatch(getAllImages());
  }, [dispatch]);

  const user = useSelector(({ user }) => user);

  useEffect(() => {
    if (user.loggedIn && user.userToken) {
      setToken(user.userToken);
    }
  }, [user.loggedIn, user.userToken]);

  if (user.loggedIn) {
    console.log('user logged in');
  } else {
    console.log('user not logged in');
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
