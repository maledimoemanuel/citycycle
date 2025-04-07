import React, { useState, useEffect } from 'react';
import './MaintenanceAdmin.css';

const MaintenanceAdmin = () => {
  // Sample data with maintenance status
  const hubs = [
    { id: 'downtown', name: 'Downtown Hub' },
    { id: 'university', name: 'University Hub' },
    { id: 'lakeside', name: 'Lakeside Hub' },
    { id: 'central', name: 'Central Station Hub' },
  ];

  const maintenanceTypes = [
    { id: 'inspection', name: 'Routine Inspection' },
    { id: 'tuneup', name: 'Full Tune-Up' },
    { id: 'repair', name: 'Repair Needed' },
    { id: 'cleaning', name: 'Deep Cleaning' },
  ];

  const [bikes, setBikes] = useState([
    {
      id: 1,
      name: 'Trek Domane SL 7',
      hub: 'downtown',
      lastMaintenance: '2023-05-15',
      nextInspection: '2023-08-15',
      maintenanceStatus: 'inspection',
      notes: 'Due for routine safety check',
      image: 'https://trek.scene7.com/is/image/TrekBicycleProducts/DomaneSL7eTap_23_36180_A_Primary?$responsive-pjpg$'
    },
    {
      id: 2,
      name: 'Specialized Stumpjumper',
      hub: 'university',
      lastMaintenance: '2023-04-20',
      nextInspection: '2023-07-20',
      maintenanceStatus: 'repair',
      notes: 'Brakes need adjustment',
      image: 'https://www.specialized.com/medias/22-SJ-Comp-Alloy-29-Carbon-MR-Black-Blk-28351.jpg'
    },
    {
      id: 3,
      name: 'Cannondale Topstone Carbon',
      hub: 'central',
      lastMaintenance: '2023-06-01',
      nextInspection: '2023-09-01',
      maintenanceStatus: 'tuneup',
      notes: 'Full drivetrain service needed',
      image: 'https://www.cannondale.com/-/media/images/bikes/2022/overviews/topstonecarbonleft.ashx'
    },
    // Add more bikes...
  ]);

  const [selectedHub, setSelectedHub] = useState('all');
  const [selectedMaintenanceType, setSelectedMaintenanceType] = useState('all');
  const [editingBike, setEditingBike] = useState(null);
  const [updatedStatus, setUpdatedStatus] = useState('');
  const [updatedNotes, setUpdatedNotes] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Filter bikes based on hub and maintenance type
  const filteredBikes = bikes.filter(bike => {
    const matchesHub = selectedHub === 'all' || bike.hub === selectedHub;
    const matchesType = selectedMaintenanceType === 'all' || bike.maintenanceStatus === selectedMaintenanceType;
    return matchesHub && matchesType;
  });

  const handleUpdateStatus = (bike) => {
    setEditingBike(bike);
    setUpdatedStatus(bike.maintenanceStatus);
    setUpdatedNotes(bike.notes);
  };

  const submitUpdate = () => {
    // In a real app, you would call your API here
    setBikes(bikes.map(bike => 
      bike.id === editingBike.id 
        ? { ...bike, maintenanceStatus: updatedStatus, notes: updatedNotes }
        : bike
    ));

    setSuccessMessage(`Updated ${editingBike.name} successfully!`);
    setEditingBike(null);
    
    // Reset success message after 3 seconds
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="maintenance-admin">
      <h1>Bike Maintenance Dashboard</h1>
      
      <div className="filters">
        <div className="filter-group">
          <label htmlFor="hub-filter">Filter by Hub:</label>
          <select 
            id="hub-filter"
            value={selectedHub}
            onChange={(e) => setSelectedHub(e.target.value)}
          >
            <option value="all">All Hubs</option>
            {hubs.map(hub => (
              <option key={hub.id} value={hub.id}>{hub.name}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="maintenance-filter">Filter by Maintenance Type:</label>
          <select 
            id="maintenance-filter"
            value={selectedMaintenanceType}
            onChange={(e) => setSelectedMaintenanceType(e.target.value)}
          >
            <option value="all">All Types</option>
            {maintenanceTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>
      </div>

      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      <div className="bike-maintenance-list">
        {filteredBikes.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Bike</th>
                <th>Hub</th>
                <th>Last Maintenance</th>
                <th>Next Inspection</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBikes.map(bike => (
                <tr key={bike.id}>
                  <td>
                    <div className="bike-info-cell">
                      <img src={bike.image} alt={bike.name} className="bike-thumbnail" />
                      <span>{bike.name}</span>
                    </div>
                  </td>
                  <td>{hubs.find(h => h.id === bike.hub)?.name || bike.hub}</td>
                  <td>{formatDate(bike.lastMaintenance)}</td>
                  <td>{formatDate(bike.nextInspection)}</td>
                  <td>
                    <span className={`status-badge ${bike.maintenanceStatus}`}>
                      {maintenanceTypes.find(t => t.id === bike.maintenanceStatus)?.name || bike.maintenanceStatus}
                    </span>
                  </td>
                  <td className="notes-cell">{bike.notes}</td>
                  <td>
                    <button 
                      className="update-btn"
                      onClick={() => handleUpdateStatus(bike)}
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-results">
            <p>No bikes found matching your filters.</p>
          </div>
        )}
      </div>

      {/* Update Modal */}
      {editingBike && (
        <div className="modal-overlay">
          <div className="update-modal">
            <h2>Update Maintenance Status</h2>
            <div className="modal-content">
              <div className="form-group">
                <label>Bike:</label>
                <p>{editingBike.name}</p>
              </div>
              
              <div className="form-group">
                <label>Current Hub:</label>
                <p>{hubs.find(h => h.id === editingBike.hub)?.name || editingBike.hub}</p>
              </div>
              
              <div className="form-group">
                <label htmlFor="status-select">Maintenance Status:</label>
                <select
                  id="status-select"
                  value={updatedStatus}
                  onChange={(e) => setUpdatedStatus(e.target.value)}
                >
                  {maintenanceTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="maintenance-notes">Notes:</label>
                <textarea
                  id="maintenance-notes"
                  value={updatedNotes}
                  onChange={(e) => setUpdatedNotes(e.target.value)}
                  rows="3"
                />
              </div>
              
              <div className="modal-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setEditingBike(null)}
                >
                  Cancel
                </button>
                <button 
                  className="submit-btn"
                  onClick={submitUpdate}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceAdmin;