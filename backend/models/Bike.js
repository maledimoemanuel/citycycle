const mongoose = require('mongoose');

const BikeSchema = new mongoose.Schema({
  model: { type: String, required: true },
  hub: { type: mongoose.Schema.Types.ObjectId, ref: 'Hub', required: true },
  status: { 
    type: String, 
    enum: ['available', 'reserved', 'in_maintenance'], 
    default: 'available' 
  },
  lastMaintenance: { type: Date }
});

module.exports = mongoose.model('Bike', BikeSchema);