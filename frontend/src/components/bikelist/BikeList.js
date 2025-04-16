import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './BikeList.css';
import AuthContext from '../context/AuthContext';
import api from '../services/api';

const BikeList = () => {
  const { user, setUser } = useContext(AuthContext); 
  const navigate = useNavigate();
  
  // State variables
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHub, setSelectedHub] = useState('all');
  const [loading, setLoading] = useState(false);
  const [bikes, setBikes] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState('name-asc');
  const [favorites, setFavorites] = useState([]);
  
  // Reservation related states
  const [selectedBike, setSelectedBike] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [reservationDetails, setReservationDetails] = useState({
    date: '',
    time: '',
  });
  const [reservationSuccess, setReservationSuccess] = useState(null);
  const [cancelReservationSuccess, setCancelReservationSuccess] = useState(null);
  
  // User profile states
  const [showProfile, setShowProfile] = useState(false);
  const [reservationHistory, setReservationHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Bike details modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailedBike, setDetailedBike] = useState(null);

  // Constants
  const bikesPerPage = 6;

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bikesResponse, hubsResponse] = await Promise.all([
          api.getBikes(),
          api.getHubs(),
        ]);
        setBikes(bikesResponse.data);
        setHubs(hubsResponse.data);
        setError(null);
        
        // Load favorites from localStorage if user is logged in
        if (user) {
          const savedFavorites = localStorage.getItem(`favorites_${user._id}`);
          if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
          
          // Load reservation history
          const res = await api.getUserReservations(user._id);
          setReservationHistory(res.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load data. Please try again later.');
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Save favorites to localStorage when they change
  useEffect(() => {
    if (user) {
      localStorage.setItem(`favorites_${user._id}`, JSON.stringify(favorites));
    }
  }, [favorites, user]);

  // Filter and sort bikes
  const filteredBikes = bikes.filter((bike) => {
    const matchesFilter = filter === 'all' || bike.type === filter || (filter === 'favorites' && favorites.includes(bike._id));
    const matchesSearch = bike.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bike.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesHub = selectedHub === 'all' || bike.hub?._id === selectedHub;
    return matchesFilter && matchesSearch && matchesHub;
  }).sort((a, b) => {
    switch (sortOption) {
      case 'name-asc': return a.name.localeCompare(b.name);
      case 'name-desc': return b.name.localeCompare(a.name);
      case 'type-asc': return a.type.localeCompare(b.type);
      case 'type-desc': return b.type.localeCompare(a.type);
      default: return 0;
    }
  });

  // Pagination logic
  const indexOfLastBike = currentPage * bikesPerPage;
  const indexOfFirstBike = indexOfLastBike - bikesPerPage;
  const currentBikes = filteredBikes.slice(indexOfFirstBike, indexOfLastBike);
  const totalPages = Math.ceil(filteredBikes.length / bikesPerPage);

  // Handlers
  const handleSignOut = () => {
    setUser(null); 
    navigate('/login'); 
  };

  const toggleFavorite = (bikeId) => {
    setFavorites(prev => 
      prev.includes(bikeId) 
        ? prev.filter(id => id !== bikeId) 
        : [...prev, bikeId]
    );
  };

  const openModal = (bike) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedBike(bike);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBike(null);
    setReservationDetails({ date: '', time: '' });
  };

  const handleReserve = async () => {
    if (!reservationDetails.date || !reservationDetails.time) {
      setError('Please select a date and time.');
      return;
    }

    setLoading(true);
    try {
      await api.updateBike(selectedBike._id, {
        status: 'reserved',
        reservedUntil: `${reservationDetails.date} ${reservationDetails.time}`,
      });
      
      setBikes(bikes.map(bike => 
        bike._id === selectedBike._id ? { ...bike, status: 'reserved' } : bike
      ));
      
      // Update reservation history
      const res = await api.getUserReservations(user._id);
      setReservationHistory(res.data);
      
      setReservationSuccess('Bike reserved successfully!');
      setTimeout(() => setReservationSuccess(null), 3000);
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Reservation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bikeId) => {
    setLoading(true);
    try {
      await api.updateBike(bikeId, { status: 'available' });
      
      setBikes(bikes.map(bike => 
        bike._id === bikeId ? { ...bike, status: 'available' } : bike
      ));
      
      // Update reservation history
      const res = await api.getUserReservations(user._id);
      setReservationHistory(res.data);
      
      setCancelReservationSuccess('Reservation cancelled successfully!');
      setTimeout(() => setCancelReservationSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Cancellation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bike-list-container">
      {/* Loading overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      )}
      
      {/* Header section */}
      <div className="bike-list-header">
        <h1>Available Bikes</h1>
        
        {/* User controls */}
        <div className="user-controls">
          <button onClick={() => setShowProfile(!showProfile)}>
            👤 {user?.name}
          </button>
          {showProfile && (
            <div className="profile-dropdown">
              <p>Email: {user?.email}</p>
              <p>Member since: {new Date(user?.createdAt).toLocaleDateString()}</p>
              <button onClick={() => setShowHistory(true)}>My Reservations</button>
              <button onClick={handleSignOut}>Sign Out</button>
            </div>
          )}
        </div>
        
        {/* Filter controls */}
        <div className="filter-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search bikes..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <i className="search-icon">🔍</i>
          </div>

          <div className="filter-row">
            <div className="filter-buttons">
              <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
                All Bikes
              </button>
              <button className={filter === 'road' ? 'active' : ''} onClick={() => setFilter('road')}>
                Road
              </button>
              <button className={filter === 'mountain' ? 'active' : ''} onClick={() => setFilter('mountain')}>
                Mountain
              </button>
              <button className={filter === 'gravel' ? 'active' : ''} onClick={() => setFilter('gravel')}>
                Gravel
              </button>
              {user && (
                <button 
                  className={filter === 'favorites' ? 'active' : ''} 
                  onClick={() => setFilter('favorites')}
                >
                  Favorites
                </button>
              )}
            </div>

            <div className="filter-selectors">
              <div className="hub-selector">
                <select
                  value={selectedHub}
                  onChange={(e) => setSelectedHub(e.target.value)}
                >
                  <option value="all">All Hubs</option>
                  {hubs.map((hub) => (
                    <option key={hub._id} value={hub._id}>
                      {hub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sort-controls">
                <select 
                  value={sortOption} 
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="type-asc">Type (A-Z)</option>
                  <option value="type-desc">Type (Z-A)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error and success messages */}
      {error && <div className="error-message">{error}</div>}
      {reservationSuccess && <div className="success-message">{reservationSuccess}</div>}
      {cancelReservationSuccess && <div className="success-message">{cancelReservationSuccess}</div>}

      {/* Bike grid */}
      <div className="bike-grid">
        {currentBikes.length > 0 ? (
          currentBikes.map((bike) => (
            <div key={bike._id} className="bike-card">
              <div 
                className="bike-image"
                onClick={() => {
                  setDetailedBike(bike);
                  setShowDetailModal(true);
                }}
              >
                <img src={bike.image} alt={bike.name} />
                <div className={`availability-badge ${bike.status.toLowerCase()}`}>
                  {bike.status === 'available' ? 'Available' : 
                   bike.status === 'reserved' ? 'Reserved' : 'Maintenance'}
                </div>
                <button 
                  className={`favorite-btn ${favorites.includes(bike._id) ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(bike._id);
                  }}
                >
                  {favorites.includes(bike._id) ? '❤️' : '🤍'}
                </button>
              </div>
              
              <div className="bike-info">
                <h3>{bike.name}</h3>
                <div className="bike-meta">
                  <span className="bike-type">
                    {bike.type?.charAt(0)?.toUpperCase() + bike.type?.slice(1)} Bike
                  </span>
                  <span className="bike-hub">
                    <i className="location-icon">📍</i>
                    {bike.hub?.name}
                  </span>
                </div>
                <p className="bike-description">{bike.description}</p>
                
                <div className="bike-footer">
                  {bike.status === 'reserved' ? (
                    <button
                      className="cancel-btn"
                      onClick={() => handleCancel(bike._id)}
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : '✖️ Cancel'}
                    </button>
                  ) : (
                    <button
                      className={`reserve-btn ${bike.status !== 'available' ? 'disabled' : ''}`}
                      onClick={() => openModal(bike)}
                      disabled={bike.status !== 'available' || loading}
                    >
                      {loading ? 'Processing...' : 'Reserve Now'}
                    </button>
                  )}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            Previous
          </button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={currentPage === pageNum ? 'active' : ''}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* Reservation Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Reserve {selectedBike?.name}</h2>
            <div className="form-group">
              <label>Date:</label>
              <input
                type="date"
                value={reservationDetails.date}
                onChange={(e) => setReservationDetails({
                  ...reservationDetails,
                  date: e.target.value
                })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="form-group">
              <label>Time:</label>
              <input
                type="time"
                value={reservationDetails.time}
                onChange={(e) => setReservationDetails({
                  ...reservationDetails,
                  time: e.target.value
                })}
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleReserve} disabled={loading}>
                {loading ? 'Processing...' : 'Confirm Reservation'}
              </button>
              <button onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Bike Details Modal */}
      {showDetailModal && detailedBike && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setShowDetailModal(false)}>
              &times;
            </button>
            <h2>{detailedBike.name}</h2>
            <img src={detailedBike.image} alt={detailedBike.name} className="detail-image" />
            
            <div className="bike-specs">
              <p><strong>Type:</strong> {detailedBike.type}</p>
              <p><strong>Hub:</strong> {detailedBike.hub?.name}</p>
              <p><strong>Status:</strong> 
                <span className={`status-badge ${detailedBike.status.toLowerCase()}`}>
                  {detailedBike.status}
                </span>
              </p>
              {detailedBike.frameSize && <p><strong>Frame Size:</strong> {detailedBike.frameSize}</p>}
              {detailedBike.gears && <p><strong>Gears:</strong> {detailedBike.gears}</p>}
              {detailedBike.weight && <p><strong>Weight:</strong> {detailedBike.weight} kg</p>}
              <p><strong>Description:</strong> {detailedBike.description}</p>
            </div>
            
            <div className="modal-footer">
              {detailedBike.status === 'available' ? (
                <button 
                  className="reserve-btn"
                  onClick={() => {
                    setShowDetailModal(false);
                    openModal(detailedBike);
                  }}
                >
                  Reserve This Bike
                </button>
              ) : (
                <button 
                  className="cancel-btn"
                  onClick={() => handleCancel(detailedBike._id)}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Cancel Reservation'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reservation History Modal */}
      {showHistory && (
        <div className="modal">
          <div className="modal-content">
            <h2>My Reservations</h2>
            <button className="close-btn" onClick={() => setShowHistory(false)}>
              &times;
            </button>
            
            {reservationHistory.length > 0 ? (
              <ul className="reservation-list">
                {reservationHistory.map(res => (
                  <li key={res._id}>
                    <div className="reservation-item">
                      <img src={res.bike.image} alt={res.bike.name} />
                      <div>
                        <h4>{res.bike.name}</h4>
                        <p>Reserved until: {new Date(res.reservedUntil).toLocaleString()}</p>
                        <p>Hub: {res.bike.hub?.name}</p>
                      </div>
                      <button 
                        onClick={() => handleCancel(res.bike._id)}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No reservations found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BikeList;