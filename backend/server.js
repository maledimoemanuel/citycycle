const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');  
const bicycleRoutes = require('./routes/bicycleRoutes');
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

app.use('/api/bicycles', bicycleRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})