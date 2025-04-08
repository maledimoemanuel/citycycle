import React, { useState, useEffect, useContext } from 'react';
import './MaintenanceAdmin.css';
import AuthContext from '../context/AuthContext';
import api from '../services/api';

const MaintenanceAdmin = () => {
  const { user } = useContext(AuthContext);
  const [viewMode, setViewMode] = useState('all');
  const [bikes, setBikes] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [isAddingBike, setIsAddingBike] = useState(false);
  const [isAddingHub, setIsAddingHub] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newBike, setNewBike] = useState({
    name: '',
    type: 'road',
    hub: '',
    status: 'available',
    image: '',
    description: '',
  });

  const [newHub, setNewHub] = useState({
    name: '',
    location: '',
    capacity: 20,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bikesResponse, hubsResponse] = await Promise.all([
          api.getBikes(),
          api.getHubs(),
        ]);

        setBikes(bikesResponse.data);
        setHubs(hubsResponse.data);
      } catch (err) {
        console.error('Failed to fetch data', err);
      }
    };
    fetchData();
  }, []);

  const handleBikeInputChange = (e) => {
    const { name, value } = e.target;
    setNewBike(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleHubInputChange = (e) => {
    const { name, value } = e.target;
    setNewHub(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleAddBike = async () => {
    setLoading(true);
    try {
      const response = await api.addBike(newBike);
      setBikes([...bikes, response.data]);
      setIsAddingBike(false);
      setNewBike({
        name: '',
        type: 'road',
        hub: '',
        status: 'available',
        image: '',
        description: '',
      });
    } catch (err) {
      console.error('Failed to add bike', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHub = async () => {
    setLoading(true);
    try {
      const response = await api.addHub(newHub);
      setHubs([...hubs, response.data]);
      setIsAddingHub(false);
      setNewHub({
        name: '',
        location: '',
        capacity: 20,
      });
    } catch (err) {
      console.error('Failed to add hub', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-bike-management">
      <h1>CityCycle Amsterdam - Maintenance Dashboard</h1>

      <div className="controls">
        <div className="view-controls">
          <button
            className={viewMode === 'all' ? 'active' : ''}
            onClick={() => setViewMode('all')}
          >
            All Bikes
          </button>
          <button
            className={viewMode === 'maintenance-due' ? 'active' : ''}
            onClick={() => setViewMode('maintenance-due')}
          >
            Maintenance Due
          </button>
        </div>

        <div className="action-buttons">
          <button onClick={() => setIsAddingBike(true)}>
            + Add New Bike
          </button>
          <button onClick={() => setIsAddingHub(true)}>
            + Add New Hub
          </button>
        </div>
      </div>

      {isAddingBike && (
        <div className="add-form">
          <h2>Add New Bike</h2>
          <input
            type="text"
            name="name"
            placeholder="Bike Name"
            value={newBike.name}
            onChange={handleBikeInputChange}
          />
          <select
            name="type"
            value={newBike.type}
            onChange={handleBikeInputChange}
          >
            <option value="road">Road Bike</option>
            <option value="mountain">Mountain Bike</option>
            <option value="gravel">Gravel Bike</option>
          </select>
          <select
            name="hub"
            value={newBike.hub}
            onChange={handleBikeInputChange}
          >
            <option value="">Select Hub</option>
            {hubs.map(hub => (
              <option key={hub._id} value={hub._id}>{hub.name}</option>
            ))}
          </select>
          <input
            type="text"
            name="image"
            placeholder="Image URL"
            value={newBike.image}
            onChange={handleBikeInputChange}
          />
          <textarea
            name="description"
            placeholder="Description"
            value={newBike.description}
            onChange={handleBikeInputChange}
          />
          <div className="form-actions">
            <button onClick={() => setIsAddingBike(false)}>Cancel</button>
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
          <input
            type="text"
            name="name"
            placeholder="Hub Name"
            value={newHub.name}
            onChange={handleHubInputChange}
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={newHub.location}
            onChange={handleHubInputChange}
          />
          <input
            type="number"
            name="capacity"
            placeholder="Capacity"
            value={newHub.capacity}
            onChange={handleHubInputChange}
            min="1"
          />
          <div className="form-actions">
            <button onClick={() => setIsAddingHub(false)}>Cancel</button>
            <button onClick={handleAddHub} disabled={loading || !newHub.name || !newHub.location}>
              {loading ? 'Adding...' : 'Save Hub'}
            </button>
          </div>
        </div>
      )}

      <div className="bikes-list">
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
                <td>{bike.hub?.name}</td>
                <td>{bike.lastMaintenance ? new Date(bike.lastMaintenance).toLocaleDateString() : 'Never'}</td>
                <td>{bike.status}</td>
                <td>
                  <button onClick={() => {/* handle bike removal */}}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MaintenanceAdmin;