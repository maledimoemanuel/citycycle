import React, { useContext } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <h1>CityCycle Admin Dashboard</h1>
        <div className="admin-header-actions">
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>
      
      <nav className="admin-sidebar">
        <ul>
          <li>
            <button onClick={() => navigate('/admin/dashboard')}>
              Dashboard
            </button>
          </li>
          <li>
            <button onClick={() => navigate('/admin/bikes')}>
              Bike Management
            </button>
          </li>
          <li>
            <button onClick={() => navigate('/admin/hubs')}>
              Hub Management
            </button>
          </li>
          <li>
            <button onClick={() => navigate('/admin/reservations')}>
              Reservations
            </button>
          </li>
        </ul>
      </nav>
      
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;