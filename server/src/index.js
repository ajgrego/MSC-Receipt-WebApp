require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Import routes and database
const { init } = require('./config/database');

// Initialize database
init();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Function to emit donation updates
const emitDonationUpdate = () => {
  io.emit('donationUpdate');
};

// Make io and emitDonationUpdate available to routes
app.set('io', io);
app.set('emitDonationUpdate', emitDonationUpdate);

// Import routes after setting up io
const donationRoutes = require('./routes/donations');
const { router: authRoutes } = require('./routes/auth');

// Routes
app.use('/api/donations', donationRoutes);
app.use('/api/auth', authRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 5002;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 