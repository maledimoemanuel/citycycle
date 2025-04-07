require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/citycycle', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));

// Schemas
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
});

const HubSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  capacity: { type: Number, required: true }
});

const BikeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['road', 'mountain', 'gravel'], required: true },
  hub: { type: mongoose.Schema.Types.ObjectId, ref: 'Hub', required: true },
  status: { 
    type: String, 
    enum: ['available', 'reserved', 'maintenance'], 
    default: 'available' 
  },
  image: { type: String },
  description: { type: String },
  lastMaintenance: { type: Date }
});

const User = mongoose.model('User', UserSchema);
const Hub = mongoose.model('Hub', HubSchema);
const Bike = mongoose.model('Bike', BikeSchema);

// Auth Middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findOne({ _id: decoded.id });
    if (!user) throw new Error();
    req.user = user;
    next();
  } catch (err) {
    res.status(401).send({ error: 'Please authenticate' });
  }
};

// Routes

app.post('/api/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);
    const user = new User({ email, password: hashedPassword, role });
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret');
    res.status(201).send({ user, token });
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new Error('Invalid credentials');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials');
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret');
    res.send({ user, token });
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

// Hub Routes
app.get('/api/hubs', async (req, res) => {
  try {
    const hubs = await Hub.find();
    res.send(hubs);
  } catch (err) {
    res.status(500).send();
  }
});

// Bike Routes
app.get('/api/bikes', async (req, res) => {
  try {
    const bikes = await Bike.find().populate('hub');
    res.send(bikes);
  } catch (err) {
    res.status(500).send();
  }
});

app.post('/api/bikes', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).send();
  
  try {
    const bike = new Bike(req.body);
    await bike.save();
    const populatedBike = await Bike.findById(bike._id).populate('hub');
    res.status(201).send(populatedBike);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.patch('/api/bikes/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  try {
    const bike = await Bike.findById(req.params.id);
    updates.forEach(update => bike[update] = req.body[update]);
    await bike.save();
    const populatedBike = await Bike.findById(bike._id).populate('hub');
    res.send(populatedBike);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.delete('/api/bikes/:id', auth, async (req, res) => {
  try {
    const bike = await Bike.findByIdAndDelete(req.params.id);
    if (!bike) return res.status(404).send();
    res.send(bike);
  } catch (err) {
    res.status(500).send();
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));