import React from 'react';
import './BikeList.css';

const BikeList = ({ bikes, onReserve }) => {
  return (
    <div className="bike-list-container">
      <h2 className="bike-list-header">
        <span className="bike-icon">🚲</span>
        Available Bicycles
      </h2>
      
      {bikes.length === 0 ? (
        <div className="empty-state">
          <p>No bikes available at this hub</p>
          <small>Check back later or try another location</small>
        </div>
      ) : (
        <div className="bike-grid">
          {bikes.map(bike => (
            <article key={bike._id} className={`bike-card ${bike.status}`}>
              <div className="bike-model">{bike.model}</div>
              <div className="bike-status">
                <span className="status-dot"></span>
                {bike.status.charAt(0).toUpperCase() + bike.status.slice(1)}
              </div>
              <button
                className="reserve-btn"
                onClick={() => onReserve(bike._id)}
                disabled={bike.status !== 'available'}
              >
                {bike.status === 'available' ? 'Reserve Now' : 'Unavailable'}
                <span className="btn-icon">→</span>
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default BikeList;