import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Profile from './pages/Profile';
import { useCloudinary } from './hooks/useCloudinary';
import { useCategories } from './hooks/useCategories';

import { disableReactDevTools } from '@fvilers/disable-react-devtools';

if (import.meta.env.PROD) disableReactDevTools();

export default function App() {
  const { cloudName } = useCloudinary();
  const { categories, isLoading, error } = useCategories();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Home
              cloudName={cloudName}
              categories={categories}
              isLoading={isLoading}
              error={error}
            />
          }
        />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}
