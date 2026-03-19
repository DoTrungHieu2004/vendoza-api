const express = require('express');
const router = express.Router();

const cartCtrl = require('../controllers/cart.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All cart routes require authentication
router.use(authMiddleware);

router.get('/', cartCtrl.getCart);
router.post('/items', cartCtrl.addItem);
router.put('/items/:variantSku', cartCtrl.updateItem);
router.delete('/items/:variantSku', cartCtrl.removeItem);
router.delete('/', cartCtrl.clearCart);

module.exports = router;
