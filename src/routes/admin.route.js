const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

const categoryCtrl = require('../controllers/admin/category.controller');
const productCtrl = require('../controllers/admin/product.controller');
const variantCtrl = require('../controllers/admin/variant.controller');

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(authorize('admin'));

// Category routes
router.post('/categories', categoryCtrl.createCategory);
router.get('/categories', categoryCtrl.getCategories);
router.get('/categories/:id', categoryCtrl.getCategoryById);
router.put('/categories/:id', categoryCtrl.updateCategory);
router.delete('/categories/:id', categoryCtrl.deleteCategory);

// Product routes
router.post('/products', productCtrl.createProduct);
router.get('/products', productCtrl.getProducts);
router.get('/products/:id', productCtrl.getProductById);
router.put('/products/:id', productCtrl.updateProduct);
router.delete('/products/:id', productCtrl.deleteProduct);

// Product variant routes
router.post('/variants', variantCtrl.createVariant);
router.get('/variants', variantCtrl.getVariants);
router.get('/variants/:id', variantCtrl.getVariantById);
router.put('/variants/:id', variantCtrl.updateVariant);
router.delete('/variants/:id', variantCtrl.deleteVariant);

module.exports = router;
