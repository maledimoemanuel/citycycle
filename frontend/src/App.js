import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './components/context/AuthContext';
import AuthContext from './components/context/AuthContext'; 
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import BikeList from './components/bikelist/BikeList';
import Dashboard from './components/dashboard/Dashboard';
import './App.css';

// Fixed PrivateRoute implementation
const PrivateRoute = ({ roles = [] }) => {
  const { user } = React.useContext(AuthContext);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected User Routes */}
              <Route element={<PrivateRoute />}>
                <Route path="/" element={<BikeList />} />
              </Route>
              
              {/* Protected Admin Routes */}
              <Route element={<PrivateRoute roles={['admin']} />}>
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>

            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;