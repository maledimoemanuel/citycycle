const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    bicycleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bicycle', required: true },
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, enum: ['upcoming', 'completed', 'completed'], default: 'active' },
});

module.exports = mongoose.model('Reservation', reservationSchema);