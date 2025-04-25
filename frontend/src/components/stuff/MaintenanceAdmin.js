import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './MaintenanceAdmin.css';
import AuthContext from '../context/AuthContext';
import api from '../services/api';

const MaintenanceAdmin = () => {
  const { user, isAdmin, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('all');
  const [bikes, setBikes] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [isAddingBike, setIsAddingBike] = useState(false);
  const [isAddingHub, setIsAddingHub] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [newBike, setNewBike] = useState({
    name: '',
    type: 'road',
    hub: '',
    status: 'available',
    image: '',
    description: '',
    frameSize: '',
    gears: '',
    weight: ''
  });

  const [newHub, setNewHub] = useState({
    name: '',
    location: '',
    capacity: 20,
  });

  // Redirect if not admin
  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/admin/login');
    }
  }, [user, isAdmin, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bikesResponse, hubsResponse] = await Promise.all([
          viewMode === 'maintenance-due' 
            ? api.getMaintenanceDueBikes() 
            : api.getBikes(),
          api.getHubs(),
        ]);

        setBikes(bikesResponse.data);
        setHubs(hubsResponse.data);
        setError(null);
      } catch (err) {
        if (err.response?.status === 401) {
          logout();
          navigate('/admin/login');
        }
        setError(err.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [viewMode, logout, navigate]);

  const handleBikeInputChange = (e) => {
    const { name, value } = e.target;
    setNewBike(prev => ({ ...prev, [name]: value }));
  };

  const handleHubInputChange = (e) => {
    const { name, value } = e.target;
    setNewHub(prev => ({ ...prev, [name]: value }));
  };

  const handleAddBike = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.addBike(newBike);
      
      setBikes([...bikes, response.data]);
      setHubs(hubs.map(hub => 
        hub._id === newBike.hub 
          ? { ...hub, bikes: [...hub.bikes, response.data._id] } 
          : hub
      ));
      
      setIsAddingBike(false);
      setNewBike({
        name: '',
        type: 'road',
        hub: '',
        status: 'available',
        image: '',
        description: '',
        frameSize: '',
        gears: '',
        weight: ''
      });
      setSuccess('Bike added successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add bike');
    } finally {
      setLoading(false);
    }
  };

  const handleAddHub = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.addHub(newHub);
      
      setHubs([...hubs, response.data]);
      setIsAddingHub(false);
      setNewHub({
        name: '',
        location: '',
        capacity: 20,
      });
      setSuccess('Hub added successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add hub');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBike = async (bikeId) => {
    if (!window.confirm('Are you sure you want to delete this bike?')) return;
    
    try {
      setLoading(true);
      setError(null);
      await api.deleteBike(bikeId);
      
      setBikes(bikes.filter(bike => bike._id !== bikeId));
      setHubs(hubs.map(hub => ({
        ...hub,
        bikes: hub.bikes.filter(id => id !== bikeId)
      })));
      
      setSuccess('Bike deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete bike');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkMaintenance = async (bikeId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.updateBike(bikeId, {
        status: 'maintenance',
        lastMaintenance: new Date()
      });
      
      setBikes(bikes.map(bike => 
        bike._id === bikeId ? response.data : bike
      ));
      
      setSuccess('Bike marked for maintenance!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update bike');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-bike-management">
      <h1>CityCycle Amsterdam - Maintenance Dashboard</h1>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      {loading && <div className="loading-overlay">Loading...</div>}

      <div className="controls">
        <div className="view-controls">
          <button
            className={viewMode === 'all' ? 'active' : ''}
            onClick={() => setViewMode('all')}
            disabled={loading}
          >
            All Bikes
          </button>
          <button
            className={viewMode === 'maintenance-due' ? 'active' : ''}
            onClick={() => setViewMode('maintenance-due')}
            disabled={loading}
          >
            Maintenance Due
          </button>
        </div>

        <div className="action-buttons">
          <button 
            onClick={() => setIsAddingBike(true)}
            disabled={loading}
          >
            + Add New Bike
          </button>
          <button 
            onClick={() => setIsAddingHub(true)}
            disabled={loading}
          >
            + Add New Hub
          </button>
        </div>
      </div>

      {isAddingBike && (
        <div className="add-form">
          <h2>Add New Bike</h2>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={newBike.name}
              onChange={handleBikeInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Type:</label>
            <select
              name="type"
              value={newBike.type}
              onChange={handleBikeInputChange}
              required
            >
              <option value="road">Road Bike</option>
              <option value="mountain">Mountain Bike</option>
              <option value="gravel">Gravel Bike</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Hub:</label>
            <select
              name="hub"
              value={newBike.hub}
              onChange={handleBikeInputChange}
              required
            >
              <option value="">Select Hub</option>
              {hubs.map(hub => (
                <option key={hub._id} value={hub._id}>{hub.name}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Image URL:</label>
            <input
              type="text"
              name="image"
              value={newBike.image}
              onChange={handleBikeInputChange}
            />
          </div>
          
          <div className="form-group">
            <label>Description:</label>
            <textarea
              name="description"
              value={newBike.description}
              onChange={handleBikeInputChange}
            />
          </div>
          
          <div className="form-group">
            <label>Frame Size:</label>
            <input
              type="text"
              name="frameSize"
              value={newBike.frameSize}
              onChange={handleBikeInputChange}
            />
          </div>
          
          <div className="form-group">
            <label>Gears:</label>
            <input
              type="text"
              name="gears"
              value={newBike.gears}
              onChange={handleBikeInputChange}
            />
          </div>
          
          <div className="form-group">
            <label>Weight (kg):</label>
            <input
              type="number"
              name="weight"
              value={newBike.weight}
              onChange={handleBikeInputChange}
              min="0"
              step="0.1"
            />
          </div>
          
          <div className="form-actions">
            <button 
              onClick={() => setIsAddingBike(false)}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleAddBike}
              disabled={loading || !newBike.name || !newBike.hub}
            >
              {loading ? 'Adding...' : 'Save Bike'}
            </button>
          </div>
        </div>
      )}

      {isAddingHub && (
        <div className="add-form">
          <h2>Add New Hub</h2>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={newHub.name}
              onChange={handleHubInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Location:</label>
            <input
              type="text"
              name="location"
              value={newHub.location}
              onChange={handleHubInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Capacity:</label>
            <input
              type="number"
              name="capacity"
              value={newHub.capacity}
              onChange={handleHubInputChange}
              min="1"
              required
            />
          </div>
          
          <div className="form-actions">
            <button 
              onClick={() => setIsAddingHub(false)}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              onClick={handleAddHub}
              disabled={loading || !newHub.name || !newHub.location}
            >
              {loading ? 'Adding...' : 'Save Hub'}
            </button>
          </div>
        </div>
      )}

      <div className="bikes-list">
        {bikes.length === 0 ? (
          <p className="no-bikes">No bikes found</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Bike</th>
                <th>Type</th>
                <th>Hub</th>
                <th>Last Maintenance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bikes.map(bike => (
                <tr key={bike._id}>
                  <td>{bike.name}</td>
                  <td>{bike.type}</td>
                  <td>{bike.hub?.name || 'Unknown'}</td>
                  <td>
                    {bike.lastMaintenance 
                      ? new Date(bike.lastMaintenance).toLocaleDateString() 
                      : 'Never'}
                  </td>
                  <td className={`status-${bike.status.toLowerCase()}`}>
                    {bike.status}
                  </td>
                  <td className="actions">
                    <button 
                      onClick={() => handleMarkMaintenance(bike._id)}
                      disabled={loading || bike.status === 'maintenance'}
                    >
                      Maintenance
                    </button>
                    <button 
                      onClick={() => handleDeleteBike(bike._id)}
                      disabled={loading}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MaintenanceAdmin;