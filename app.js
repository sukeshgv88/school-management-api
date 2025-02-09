require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const morgan = require('morgan');

const config = require('./config/index.config.js');
const { authenticateJWT } = require('./middleware/authMiddleware');
const Cortex = require('ion-cortex');

// Load Managers
const ManagersLoader = require('./loaders/ManagersLoader');
const cache = require('./cache/cache.dbh')({
    prefix: config.dotEnv.CACHE_PREFIX,
    url: config.dotEnv.CACHE_REDIS
});
const cortex = new Cortex({
    prefix: config.dotEnv.CORTEX_PREFIX,
    url: config.dotEnv.CORTEX_REDIS,
    type: config.dotEnv.CORTEX_TYPE
});
const managersLoader = new ManagersLoader({ config, cache, cortex });
const managers = managersLoader.load();

// Import Routes
const authRoutes = require('./routes/authRoutes');
const schoolRoutes = require('./routes/schools');
const classroomRoutes = require('./routes/classrooms');
const studentRoutes = require('./routes/students');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev')); // Logging Requests

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many login attempts, please try again later.',
});
app.use(limiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/schools', authenticateJWT, schoolRoutes);
app.use('/api/classrooms', authenticateJWT, classroomRoutes);
app.use('/api/students', authenticateJWT, studentRoutes);

// Default Route
app.get('/', (req, res) => {
    res.send('🚀 School Management API is Running...');
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('🔥 Error:', err.message);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// MongoDB Connection (Handled in `server.js`)
mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB Disconnected');
});

// Export app for testing
module.exports = app;