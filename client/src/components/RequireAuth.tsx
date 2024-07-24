import { useContext } from 'react';
import { useLocation, Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function RequireAuth() {
  const location = useLocation();
  const { loggedIn, token } = useContext(AuthContext);
  return (
    <>
      {token && loggedIn ? (
        <Outlet />
      ) : (
        <Navigate to="/login" state={{ from: location }} replace />
      )}
    </>
  );
}
