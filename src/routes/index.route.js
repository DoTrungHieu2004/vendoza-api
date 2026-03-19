const express = require('express');
const router = express.Router();

router.use('/health', require('./health.route'));
router.use('/auth', require('../routes/auth.route'));
router.use('/admin', require('../routes/admin.route'));
router.use('/categories', require('../routes/category.route'));
router.use('/products', require('../routes/product.route'));
router.use('/cart', require('./cart.route'));

module.exports = router;
