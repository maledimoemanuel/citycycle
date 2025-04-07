import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BikeList.css';
import AuthContext from '../context/AuthContext';
import { useContext } from 'react';

const BikeList = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHub, setSelectedHub] = useState('all');
  const [reservationSuccess, setReservationSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  // Sample data with hubs and availability
  const hubs = [
    { id: 'downtown', name: 'Downtown Hub' },
    { id: 'university', name: 'University Hub' },
    { id: 'lakeside', name: 'Lakeside Hub' },
    { id: 'central', name: 'Central Station Hub' },
  ];

  const bikes = [
    {
      id: 1,
      name: 'Trek Domane SL 7',
      type: 'road',
      price: 5499,
      hub: 'downtown',
      available: true,
      image: 'https://biket.co.za/cdn/shop/files/DomaneSLR7_23_37059_A_Primary.webp?v=1704186482&width=1445',
      description: 'Endurance road bike with IsoSpeed decoupler for smooth rides'
    },
    {
      id: 2,
      name: 'Specialized Stumpjumper',
      type: 'mountain',
      price: 3299,
      hub: 'university',
      available: false,
      image: 'https://assets.specialized.com/i/specialized/93321-71_SJ-ALLOY-BLZ-BLK_HERO-SQUARE?$scom-plp-product-image-square$&fmt=webp',
      description: 'Full-suspension trail bike with 140mm of travel'
    },
    {
      id: 3,
      name: 'Cannondale Topstone Carbon',
      type: 'gravel',
      price: 3999,
      hub: 'central',
      available: true,
      image: 'https://embed.widencdn.net/img/dorelrl/unnrtn2x3g/1100px@1x/C23_C15203U_Topstone_Crb_2_Lefty_GRN_PD.webp?color=def1c9&q=99',
      description: 'Carbon gravel bike with Kingpin suspension for rough roads'
    },
  ];

  const filteredBikes = bikes.filter(bike => {
    const matchesFilter = filter === 'all' || bike.type === filter;
    const matchesSearch = bike.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         bike.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesHub = selectedHub === 'all' || bike.hub === selectedHub;
    return matchesFilter && matchesSearch && matchesHub;
  });

  const handleReserve = (bikeId) => {
    if (!user) {
      navigate('/');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // In a real app, you would call your backend API here
      console.log(`Reserving bike ${bikeId} for user ${user.email}`);
      setReservationSuccess(`Bike #${bikeId} reserved successfully!`);
      setLoading(false);
      
      // Reset success message after 3 seconds
      setTimeout(() => setReservationSuccess(null), 3000);
    }, 1000);
  };

  return (
    <div className="bike-list-container">
      <h1>🚲CycleCity🏙️</h1>
      <div className="bike-list-header">
        <h1>Our Bike Collection</h1>
        <div className="filter-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search bikes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="search-icon">🔍</i>
          </div>
          
          <div className="filter-row">
            <div className="filter-buttons">
              <button 
                className={filter === 'all' ? 'active' : ''}
                onClick={() => setFilter('all')}
              >
                All Bikes
              </button>
              <button 
                className={filter === 'road' ? 'active' : ''}
                onClick={() => setFilter('road')}
              >
                Road
              </button>
              <button 
                className={filter === 'mountain' ? 'active' : ''}
                onClick={() => setFilter('mountain')}
              >
                Mountain
              </button>
              <button 
                className={filter === 'gravel' ? 'active' : ''}
                onClick={() => setFilter('gravel')}
              >
                Gravel
              </button>
            </div>
            
            <div className="hub-selector">
              <select 
                value={selectedHub} 
                onChange={(e) => setSelectedHub(e.target.value)}
              >
                <option value="all">All Hubs</option>
                {hubs.map(hub => (
                  <option key={hub.id} value={hub.id}>{hub.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {reservationSuccess && (
        <div className="reservation-success">
          {reservationSuccess}
        </div>
      )}

      <div className="bike-grid">
        {filteredBikes.length > 0 ? (
          filteredBikes.map(bike => (
            <div key={bike.id} className="bike-card">
              <div className="bike-image">
                <img src={bike.image} alt={bike.name} />
                <div className={`availability-badge ${bike.available ? 'available' : 'unavailable'}`}>
                  {bike.available ? 'Available' : 'Unavailable'}
                </div>
              </div>
              <div className="bike-info">
                <h3>{bike.name}</h3>
                <div className="bike-meta">
                  <span className="bike-type">{bike.type.charAt(0).toUpperCase() + bike.type.slice(1)} Bike</span>
                  <span className="bike-hub">
                    <i className="location-icon">📍</i> 
                    {hubs.find(h => h.id === bike.hub)?.name || bike.hub}
                  </span>
                </div>
                <p className="bike-description">{bike.description}</p>
                <div className="bike-footer">
                  {/*<span className="bike-price">R{bike.price.toLocaleString()}</span>*/}
                  <button 
                    className={`reserve-btn ${!bike.available ? 'disabled' : ''}`}
                    onClick={() => bike.available && handleReserve(bike.id)}
                    disabled={!bike.available || loading}
                  >
                    {loading ? 'Processing...' : 'Reserve Now'}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>No bikes match your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BikeList;