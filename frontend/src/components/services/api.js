import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Add auth token to requests
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default {
    // Auth
    register: (name, email, password, role) => api.post('/register', { name, email, password, role }),
    login: (email, password) => api.post('/login', { email, password }),
    adminLogin: (email, password) => api.post('/admin/login', { email, password })
    .then(response => {
      return {
        data: {
          token: response.data.token,
          admin: response.data.admin
        }
      };
    }),
    // Hubs
    getHubs: () => api.get('/hubs'),
    getMaintenanceDue: () => api.get('/bikes/maintenance-due'),
    addHub: (hubData) => api.post('/hubs', hubData),

    // Reservations
    getUserReservations: () => api.get('/reservations/user'),
    getAllReservations: () => api.get('/admin/reservations'),
    createReservation: (reservationData) => api.post('/reservations', reservationData),
    cancelReservation: (reservationId) => api.delete(`/reservations/${reservationId}`),

    // Bikes
    getBikes: () => api.get('/bikes'),
    addBike: (bikeData) => api.post('/bikes', bikeData),
    updateBike: (id, updates) => api.patch(`/bikes/${id}`, updates),
    deleteBike: (id) => api.delete(`/bikes/${id}`),
    updateBikeMaintenance: (id) => api.patch(`/admin/bikes/${id}/maintenance`),

    // Admin specific
    getAdminData: () => api.get('/admin/data'),

    addBikeWithHub: async (bikeData, hubData) => {
        try {
            let hubId;
            if (!bikeData.hub) {
                const response = await api.addHub(hubData);
                hubId = response.data._id;
            } else {
                hubId = bikeData.hub;
            }

            const newBikeData = { ...bikeData, hub: hubId };
            const bikeResponse = await api.addBike(newBikeData);

            return bikeResponse.data;
        } catch (err) {
            console.error('Error adding bike with hub:', err);
            throw err;
        }
    }
};