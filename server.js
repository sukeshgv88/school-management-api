const mongoose = require('mongoose');
const express = require('express');
const app = require('./app');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school-mgmt';

if (process.env.NODE_ENV !== 'test') {
    mongoose.connect(MONGO_URI)
        .then(() => console.log('✅ Connected to MongoDB'))
        .catch(err => console.error('❌ MongoDB Connection Error:', err));

    const server = app.listen(5001, () => console.log('🚀 Server running on port 5001'));

    process.on('SIGTERM', () => {
        server.close(() => {
            console.log('🛑 Server closed.');
        });
    });
}

module.exports = app; // Export for testing