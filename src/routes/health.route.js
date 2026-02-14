const express = require('express');
const router = express.Router();

router.use('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'vendoza-api',
  });
});

module.exports = router;
