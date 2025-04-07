import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add auth token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default {
  // Auth
  register: (email, password, role) => api.post('/register', { email, password, role }),
  login: (email, password) => api.post('/login', { email, password }),

  // Hubs
  getHubs: () => api.get('/hubs'),

  // Bikes
  getBikes: () => api.get('/bikes'),
  addBike: (bikeData) => api.post('/bikes', bikeData),
  updateBike: (id, updates) => api.patch(`/bikes/${id}`, updates),
  deleteBike: (id) => api.delete(`/bikes/${id}`),
};