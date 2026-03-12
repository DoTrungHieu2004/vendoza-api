const express = require('express');
const router = express.Router();

router.use('/health', require('./health.route'));
router.use('/auth', require('../routes/auth.route'));
router.use('/admin', require('../routes/admin.route'));

module.exports = router;
