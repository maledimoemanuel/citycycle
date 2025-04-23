import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const AdminRoute = () => {
  const { user, isAdmin, loading } = useContext(AuthContext);
  
  if (loading) return <div>Loading...</div>;
  if (!user || !isAdmin) return <Navigate to="/admin/login" replace />;
  
  return <Outlet />;
};

export default AdminRoute;