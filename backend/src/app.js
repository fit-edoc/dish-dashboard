const express = require('express');
const cors = require('cors');
require('dotenv').config();

const dishRoutes = require('./routes/dishRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Dish Resource Routes
app.use('/dishes', dishRoutes);

// Catch-all for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
});

// Centralized error handling
app.use(errorHandler);

module.exports = app;
