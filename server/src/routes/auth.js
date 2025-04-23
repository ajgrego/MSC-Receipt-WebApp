const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/database');

// Admin login
router.post('/login', async (req, res) => {
  console.log('Login attempt received:', { username: req.body.username });
  const { username, password } = req.body;

  if (!username || !password) {
    console.log('Missing credentials:', { username: !!username, password: !!password });
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    console.log('Querying database for user:', username);
    db.get(
      'SELECT * FROM admin WHERE username = ?',
      [username],
      async (err, user) => {
        if (err) {
          console.error('Database error during login:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        if (!user) {
          console.log('Login failed - User not found:', username);
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log('User found, verifying password...');
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          console.log('Login failed - Invalid password for user:', username);
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!process.env.JWT_SECRET) {
          console.error('JWT_SECRET is not set in environment variables');
          return res.status(500).json({ error: 'Server configuration error' });
        }

        const token = jwt.sign(
          { id: user.id, username: user.username },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );

        console.log('Login successful for user:', username);
        res.json({ token });
      }
    );
  } catch (error) {
    console.error('Server error during login:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify token middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    console.log('No token provided in request');
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Protected route example
router.get('/verify', verifyToken, (req, res) => {
  console.log('Token verified for user:', req.user.username);
  res.json({ valid: true, user: req.user });
});

module.exports = { router, verifyToken }; 