import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const PrivateRoute = ({ roles }) => {
  const { user, isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;

  return <Outlet />;
};

export default PrivateRoute;