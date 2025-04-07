import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import './App.css';
import BikeList from './components/bikelist/BikeList';
import MaintenanceAdmin from './components/stuff/MaintenanceAdmin';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path='/bikelist' element={<BikeList />} />
        <Route path='/admin' element={<MaintenanceAdmin/>} />
      </Routes>
    </>
  );
}

export default App;
