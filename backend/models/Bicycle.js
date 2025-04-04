const mongoose = require('mongoose');

const bicycleSchema = new mongoose.Schema({
    hubId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hub', required: true },
    model: { type: String, required: true },
    purchaseDate: { type: Date, required: true },
    lastMaintenanceDate: { type: Date},
    status: { type: String, enum: ['available', 'reserved', 'in_maintenance'], default: 'available' },
})

module.exports = mongoose.model('Bicycle', bicycleSchema)