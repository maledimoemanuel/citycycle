import React, { useState, useEffect, useContext } from 'react';
import './MaintenanceAdmin.css';
import AuthContext from '../context/AuthContext';
import api from '../services/api';

const MaintenanceAdmin = () => {
  const { user } = useContext(AuthContext);
  const [bikes, setBikes] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [selectedHub, setSelectedHub] = useState('all');
  const [isAddingBike, setIsAddingBike] = useState(false);
  const [newBike, setNewBike] = useState({
    name: '',
    type: 'road',
    hub: '',
    status: 'available',
    image: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bikesResponse, hubsResponse] = await Promise.all([
          api.getBikes(),
          api.getHubs()
        ]);
        setBikes(bikesResponse.data);
        setHubs(hubsResponse.data);
        if (hubsResponse.data.length > 0) {
          setNewBike(prev => ({ ...prev, hub: hubsResponse.data[0]._id }));
        }
      } catch (err) {
        console.error('Failed to fetch data', err);
      }
    };
    fetchData();
  }, []);

  const filteredBikes = selectedHub === 'all' 
    ? bikes 
    : bikes.filter(bike => bike.hub._id === selectedHub);

  const handleAddBike = async () => {
    setLoading(true);
    try {
      const response = await api.addBike(newBike);
      setBikes([...bikes, response.data]);
      setIsAddingBike(false);
      setNewBike({
        name: '',
        type: 'road',
        hub: hubs[0]?._id || '',
        status: 'available',
        image: '',
        description: ''
      });
    } catch (err) {
      console.error('Failed to add bike', err);
    } finally {
      setLoading(false);
    }
  };

  const updateBikeStatus = async (bikeId, newStatus) => {
    try {
      const updatedBike = await api.updateBike(bikeId, { status: newStatus });
      setBikes(bikes.map(bike => 
        bike._id === bikeId ? updatedBike.data : bike
      ));
    } catch (err) {
      console.error('Update failed', err);
    }
  };

  const removeBike = async (bikeId) => {
    try {
      await api.deleteBike(bikeId);
      setBikes(bikes.filter(bike => bike._id !== bikeId));
    } catch (err) {
      console.error('Failed to remove bike', err);
    }
  };

  return (
    <div className="admin-bike-management">
      <h1>CityCycle Amsterdam - Admin Dashboard</h1>
      
      <div className="controls">
        <select 
          value={selectedHub} 
          onChange={(e) => setSelectedHub(e.target.value)}
        >
          <option value="all">All Hubs</option>
          {hubs.map(hub => (
            <option key={hub._id} value={hub._id}>{hub.name}</option>
          ))}
        </select>
        
        <button onClick={() => setIsAddingBike(true)}>
          + Add New Bike
        </button>
      </div>

      {isAddingBike && (
        <div className="add-bike-form">
          <h2>Add New Bike</h2>
          <input
            type="text"
            placeholder="Bike Name"
            value={newBike.name}
            onChange={(e) => setNewBike({ ...newBike, name: e.target.value })}
            required
          />
          <select
            value={newBike.type}
            onChange={(e) => setNewBike({ ...newBike, type: e.target.value })}
            required
          >
            <option value="road">Road Bike</option>
            <option value="mountain">Mountain Bike</option>
            <option value="gravel">Gravel Bike</option>
          </select>
          <select
            value={newBike.hub}
            onChange={(e) => setNewBike({ ...newBike, hub: e.target.value })}
            required
          >
            {hubs.map(hub => (
              <option key={hub._id} value={hub._id}>{hub.name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Image URL"
            value={newBike.image}
            onChange={(e) => setNewBike({ ...newBike, image: e.target.value })}
          />
          <textarea
            placeholder="Description"
            value={newBike.description}
            onChange={(e) => setNewBike({ ...newBike, description: e.target.value })}
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

      <div className="bikes-list">
        <table>
          <thead>
            <tr>
              <th>Bike</th>
              <th>Type</th>
              <th>Hub</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBikes.map(bike => (
              <tr key={bike._id}>
                <td>
                  <div className="bike-info">
                    {bike.image && <img src={bike.image} alt={bike.name} />}
                    <div>
                      <strong>{bike.name}</strong>
                      <p>{bike.description}</p>
                    </div>
                  </div>
                </td>
                <td>{bike.type.charAt(0).toUpperCase() + bike.type.slice(1)}</td>
                <td>{bike.hub?.name}</td>
                <td>
                  <select
                    value={bike.status}
                    onChange={(e) => updateBikeStatus(bike._id, e.target.value)}
                  >
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </td>
                <td>
                  <button 
                    className="remove-btn"
                    onClick={() => removeBike(bike._id)}
                  >
                    Remove
                  </button>
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