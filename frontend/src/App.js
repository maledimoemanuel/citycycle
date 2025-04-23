import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './components/context/AuthContext';

// Public Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import BikeList from './components/bikelist/BikeList';

// Admin Components
import AdminLogin from './components/auth/admin/AdminLogin';
import MaintenanceAdmin from './components/stuff/MaintenanceAdmin';
import AdminLayout from './components/auth/admin/AdminLayout';
import AdminRoute from './components/auth/admin/AdminRoute';

function App() {
  return (
    <AuthProvider>
      <div className="app-container">
        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/bikelist" element={<BikeList />} />
            
            {/* Admin Authentication */}
            <Route path="/admin/login" element={<AdminLogin />} />
            
            {/* Protected Admin Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<MaintenanceAdmin />} />
                <Route path="bikes" element={<MaintenanceAdmin />} />
                <Route path="reservations" element={<MaintenanceAdmin />} />
                <Route path="hubs" element={<MaintenanceAdmin />} />
              </Route>
            </Route>
            
            {/* Fallback routes */}
            <Route path="/unauthorized" element={<div>403 - Unauthorized</div>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;