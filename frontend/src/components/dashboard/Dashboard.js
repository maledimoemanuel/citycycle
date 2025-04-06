import React, { useState } from 'react';
import './Dashboard.css';

const Dashboard = ({ bikes, onCompleteMaintenance }) => {
  const [notes, setNotes] = useState('');

  const handleSubmit = (bikeId) => {
    if (!notes.trim()) return;
    onCompleteMaintenance(bikeId, notes);
    setNotes('');
  };

  return (
    <div className="maintenance-container">
      <header className="maintenance-header">
        <h2>
          <span className="wrench-icon">🔧</span>
          Maintenance Dashboard
        </h2>
        <p className="subtitle">Bicycles needing attention</p>
      </header>
      
      {bikes.length === 0 ? (
        <div className="all-clear">
          <div className="checkmark">✓</div>
          <h3>All bicycles are operational!</h3>
          <p>No maintenance required at this time</p>
        </div>
      ) : (
        <div className="maintenance-list">
          {bikes.map(bike => (
            <article key={bike._id} className="maintenance-card">
              <div className="bike-info">
                <h3>{bike.model}</h3>
                <div className="bike-meta">
                  <span className="status-badge">
                    {bike.status.replace('_', ' ')}
                  </span>
                  <span>
                    Last maintained: {bike.lastMaintenanceDate ? 
                      new Date(bike.lastMaintenanceDate).toLocaleDateString() : 
                      'Never'}
                  </span>
                </div>
              </div>
              
              <div className="maintenance-actions">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe maintenance performed..."
                  className="notes-input"
                />
                <button
                  onClick={() => handleSubmit(bike._id)}
                  className="complete-btn"
                >
                  Mark as Completed
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;