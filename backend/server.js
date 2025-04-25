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
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));

// Schemas
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

const HubSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  capacity: { type: Number, required: true },
  bikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bike' }]
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
  frameSize: { type: String },
  gears: { type: String },
  weight: { type: Number },
  lastMaintenance: { type: Date }
});

const ReservationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bike: { type: mongoose.Schema.Types.ObjectId, ref: 'Bike', required: true },
  reservedFrom: { type: Date, required: true },
  reservedUntil: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['active', 'completed', 'cancelled'], 
    default: 'active' 
  },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Hub = mongoose.model('Hub', HubSchema);
const Bike = mongoose.model('Bike', BikeSchema);
const Reservation = mongoose.model('Reservation', ReservationSchema);

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

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findOne({ _id: decoded.id });
    if (!user || user.role !== 'admin') throw new Error();
    req.user = user;
    next();
  } catch (err) {
    res.status(403).send({ error: 'Admin access required' });
  }
};

// Routes

// Auth Routes
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ error: 'Email already in use' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 8);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();
    
    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    
    res.status(201).send({ user: { ...user.toObject(), password: undefined }, token });
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
    
    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    
    res.send({ 
      user: { 
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }, 
      token 
    });
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

// User Routes
app.get('/api/user', auth, async (req, res) => {
  try {
    res.send(req.user);
  } catch (err) {
    res.status(500).send();
  }
});

// Hub Routes
app.get('/api/hubs', async (req, res) => {
  try {
    const hubs = await Hub.find().populate('bikes');
    res.send(hubs);
  } catch (err) {
    res.status(500).send();
  }
});

app.post('/api/hubs', adminAuth, async (req, res) => {
  try {
    const hub = new Hub(req.body);
    await hub.save();
    res.status(201).send(hub);
  } catch (err) {
    res.status(400).send(err);
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

app.post('/api/bikes', adminAuth, async (req, res) => {
  try {
    const bike = new Bike(req.body);
    await bike.save();
    
    // Add bike to hub's bikes array
    await Hub.findByIdAndUpdate(bike.hub, { 
      $push: { bikes: bike._id } 
    });
    
    const populatedBike = await Bike.findById(bike._id).populate('hub');
    res.status(201).send(populatedBike);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.patch('/api/bikes/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['status', 'lastMaintenance'];
  
  if (req.user.role !== 'admin') {
    // Users can only update status for reservation purposes
    if (updates.length !== 1 || updates[0] !== 'status') {
      return res.status(403).send({ error: 'Admin access required for this operation' });
    }
  }
  
  try {
    const bike = await Bike.findById(req.params.id);
    if (!bike) return res.status(404).send();
    
    updates.forEach(update => bike[update] = req.body[update]);
    await bike.save();
    
    const populatedBike = await Bike.findById(bike._id).populate('hub');
    res.send(populatedBike);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.delete('/api/bikes/:id', adminAuth, async (req, res) => {
  try {
    const bike = await Bike.findByIdAndDelete(req.params.id);
    if (!bike) return res.status(404).send();
    
    // Remove bike from hub's bikes array
    await Hub.findByIdAndUpdate(bike.hub, { 
      $pull: { bikes: bike._id } 
    });
    
    res.send(bike);
  } catch (err) {
    res.status(500).send();
  }
});

// Reservation Routes
app.post('/api/reservations', auth, async (req, res) => {
  try {
    const { bikeId, reservedFrom, reservedUntil } = req.body;
    
    // Check if bike exists and is available
    const bike = await Bike.findById(bikeId);
    if (!bike) {
      return res.status(404).send({ error: 'Bike not found' });
    }
    
    if (bike.status !== 'available') {
      return res.status(400).send({ error: 'Bike is not available for reservation' });
    }
    
    // Create reservation
    const reservation = new Reservation({
      user: req.user._id,
      bike: bikeId,
      reservedFrom: new Date(reservedFrom),
      reservedUntil: new Date(reservedUntil),
      status: 'active'
    });
    
    await reservation.save();
    
    // Update bike status
    bike.status = 'reserved';
    await bike.save();
    
    // bike and user details
    const populatedReservation = await Reservation.findById(reservation._id)
      .populate('user', 'name email')
      .populate('bike');
    
    res.status(201).send(populatedReservation);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

app.get('/api/reservations/user', auth, async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate('bike')
      .sort({ createdAt: -1 });
      
    res.send(reservations);
  } catch (err) {
    res.status(500).send();
  }
});

app.delete('/api/reservations/:id', auth, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('bike');
      
    if (!reservation) {
      return res.status(404).send({ error: 'Reservation not found' });
    }
    
    // Check if user owns the reservation or is admin
    if (reservation.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).send({ error: 'Not authorized to cancel this reservation' });
    }
    
    // Update reservation status
    reservation.status = 'cancelled';
    await reservation.save();
    
    // Update bike status if it's currently reserved
    if (reservation.bike.status === 'reserved') {
      reservation.bike.status = 'available';
      await reservation.bike.save();
    }
    
    res.send(reservation);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

// Admin Routes
app.get('/api/admin/reservations', adminAuth, async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    const reservations = await Reservation.find(query)
      .populate('user', 'name email')
      .populate('bike')
      .sort({ createdAt: -1 });
      
    res.send(reservations);
  } catch (err) {
    res.status(500).send();
  }
});

app.get('/api/admin/bikes/maintenance-due', adminAuth, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const bikes = await Bike.find({
      $or: [
        { lastMaintenance: { $lt: thirtyDaysAgo } },
        { lastMaintenance: { $exists: false } }
      ]
    }).populate('hub');

    res.send(bikes);
  } catch (err) {
    res.status(500).send();
  }
});

app.patch('/api/admin/bikes/:id/maintenance', adminAuth, async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);
    if (!bike) return res.status(404).send();
    
    bike.lastMaintenance = new Date();
    bike.status = 'available';
    await bike.save();
    
    const populatedBike = await Bike.findById(bike._id).populate('hub');
    res.send(populatedBike);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));