import React from 'react';
import './Hub.css';

const Hub = ({ hubs, selectedHub, onSelectHub }) => {
  return (
    <div className="hub-container">
      <div className="hub-selector">
        <label className="hub-label">
          <span className="hub-icon">📍</span>
          Select your hub
        </label>
        <select
          value={selectedHub}
          onChange={(e) => onSelectHub(e.target.value)}
          className="hub-select"
        >
          <option value="">Choose a location</option>
          {hubs.map(hub => (
            <option key={hub._id} value={hub._id}>
              {hub.name} • {hub.capacity} bikes
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Hub;