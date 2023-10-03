import { lazy, Suspense, useContext, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Notification from "./components/Notification";
import { setToken } from "./services/api";
import { getToken } from "./services/authStorage";
import { AuthContext } from "./contexts/AuthContext";
import { useCloudinary } from "./hooks/useCloudinary";
import { useImage } from "./hooks/useImage";

import { disableReactDevTools } from "@fvilers/disable-react-devtools";
if (process.env.NODE_ENV === "production") disableReactDevTools();

const Edit = lazy(() => import("./pages/Edit"));
const Login = lazy(() => import("./pages/Login"));
const Profile = lazy(() => import("./pages/Profile"));
const RequireAuth = lazy(() => import("./components/RequireAuth"));

export default function App() {
  const { cloudName } = useCloudinary();
  const {
    images,
    updateImageOrder,
    uploadNewImage,
    updateImageDetails,
    removeOneImage,
  } = useImage();
  const { setCredentials } = useContext(AuthContext);

  useEffect(() => {
    const loggedUser = getToken();
    if (loggedUser) {
      setCredentials(loggedUser);
      setToken(loggedUser);
    }
  }, []);

  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route
            path="/"
            element={<Home cloudName={cloudName} images={images} />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route element={<RequireAuth />}>
            <Route
              path="/edit"
              element={
                <Edit
                  cloudName={cloudName}
                  images={images}
                  updateImageOrder={updateImageOrder}
                  updateImageDetails={updateImageDetails}
                  uploadNewImage={uploadNewImage}
                  removeOneImage={removeOneImage}
                />
              }
            />
          </Route>
        </Routes>
        <Notification />
      </Suspense>
    </BrowserRouter>
  );
}
