const mongoose = require('mongoose');

const hubSchema = new mongoose.Schema({
    locationName: { type: String, required: true },
    address: { type: String, required: true },
    capacity: { type: Number, required: true },
})

module.exports = mongoose.model('Hub', hubSchema)