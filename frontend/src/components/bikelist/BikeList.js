import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './BikeList.css';
import AuthContext from '../context/AuthContext';
import api from '../services/api';

const BikeList = () => {
  const { user, setUser } = useContext(AuthContext); 
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHub, setSelectedHub] = useState('all');
  const [reservationSuccess, setReservationSuccess] = useState(null);
  const [cancelReservationSuccess, setCancelReservationSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bikes, setBikes] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [selectedBike, setSelectedBike] = useState(null);
  const [reservationDetails, setReservationDetails] = useState({
    date: '',
    time: '',
  });
  const [showModal, setShowModal] = useState(false);

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

  const handleSignOut = () => {
    setUser(null); 
    navigate('/login'); 
  };

  const filteredBikes = bikes.filter((bike) => {
    const matchesFilter = filter === 'all' || bike.type === filter;
    const matchesSearch =
      bike.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bike.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesHub = selectedHub === 'all' || bike.hub._id === selectedHub;
    return matchesFilter && matchesSearch && matchesHub;
  });

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
      alert('Please select a date and time.');
      return;
    }

    setLoading(true);
    try {
      await api.updateBike(selectedBike._id, {
        status: 'reserved',
        reservedUntil: `${reservationDetails.date} ${reservationDetails.time}`,
      });
      setBikes(
        bikes.map((bike) =>
          bike._id === selectedBike._id
            ? { ...bike, status: 'reserved' }
            : bike
        )
      );
      setReservationSuccess('Bike reserved successfully!');
      setTimeout(() => setReservationSuccess(null), 3000);
      closeModal();
    } catch (err) {
      console.error('Reservation failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bikeId) => {
    try {
      await api.updateBike(bikeId, { status: 'available' });
      setBikes(
        bikes.map((bike) =>
          bike._id === bikeId ? { ...bike, status: 'available' } : bike
        )
      );
      setCancelReservationSuccess('Reservation cancelled successfully!');
      setTimeout(() => setCancelReservationSuccess(null), 3000);
    } catch (err) {
      console.error('Cancellation failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bike-list-container">
      <div className="bike-list-header">
        <h1>Available Bikes</h1>
        <button className="signout-btn" onClick={handleSignOut}>
          Sign Out
        </button>
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
                {hubs.map((hub) => (
                  <option key={hub._id} value={hub._id}>
                    {hub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {reservationSuccess && (
        <div className="reservation-success">{reservationSuccess}</div>
      )}

      {cancelReservationSuccess && (
        <div className="cancel-reservation-success">
          {cancelReservationSuccess}
        </div>
      )}

      <div className="bike-grid">
        {filteredBikes.length > 0 ? (
          filteredBikes.map((bike) => (
            <div key={bike._id} className="bike-card">
              <div className="bike-image">
                <img src={bike.image} alt={bike.name} />
                <div
                  className={`availability-badge ${
                    bike.status === 'available' ? 'available' : 'unavailable'
                  }`}
                >
                  {bike.status === 'available'
                    ? 'Available'
                    : bike.status === 'reserved'
                    ? 'Reserved'
                    : 'Maintenance'}
                </div>
              </div>
              <div className="bike-info">
                <h3>{bike.name}</h3>
                <div className="bike-meta">
                  <span className="bike-type">
                    {bike.type?.charAt(0)?.toUpperCase() + bike.type?.slice(1)}{' '}
                    Bike
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
                      {loading ? 'Processing...' : '✖️Cancel'}
                    </button>
                  ) : (
                    <button
                      className={`reserve-btn ${
                        bike.status !== 'available' ? 'disabled' : ''
                      }`}
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

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Reserve Bike</h2>
            <label>
              Date:
              <input
                type="date"
                value={reservationDetails.date}
                onChange={(e) =>
                  setReservationDetails({
                    ...reservationDetails,
                    date: e.target.value,
                  })
                }
              />
            </label>
            <label>
              Time:
              <input
                type="time"
                value={reservationDetails.time}
                onChange={(e) =>
                  setReservationDetails({
                    ...reservationDetails,
                    time: e.target.value,
                  })
                }
              />
            </label>
            <div className="modal-actions">
              <button onClick={handleReserve} disabled={loading}>
                {loading ? 'Processing...' : 'Confirm Reservation'}
              </button>
              <button onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BikeList;