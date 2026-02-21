const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

router.use('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'vendoza-api',
  });
});

router.use('/db', async (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
  };

  try {
    // 1️⃣ Check MongoDB connection state
    const dbState = mongoose.connection.readyState;
    const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];

    healthcheck.database = {
      status: dbStates[dbState] || 'unknown',
      name: mongoose.connection.name,
      host: mongoose.connection.host,
    };

    // 2️⃣ List collections
    if (dbState === 1) {
      const collections = await mongoose.connection.db.listCollections().toArray();

      healthcheck.database.collections = collections.map((c) => c.name);
    }

    res.status(200).json(healthcheck);
  } catch (error) {
    healthcheck.message = 'ERROR';
    healthcheck.error = err.message;
    res.status(503).json(healthcheck);
  }
});

module.exports = router;
