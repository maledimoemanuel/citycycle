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
    getMaintenanceDue: () => api.get('/bikes/maintenance-due'),
    addHub: (hubData) => api.post('/hubs', hubData),

    //reservations
    getUserReservations: () => api.get('/reservations/user'),
    createReservation: (reservationData) => api.post('/reservations', reservationData),
    cancelReservation: (reservationId) => api.delete(`/reservations/${reservationId}`),

    // Bikes
    getBikes: () => api.get('/bikes'),
    addBike: (bikeData) => api.post('/bikes', bikeData),
    updateBike: (id, updates) => api.patch(`/bikes/${id}`, updates),
    deleteBike: (id) => api.delete(`/bikes/${id}`),

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
