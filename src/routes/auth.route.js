const express = require('express');
const router = express.Router();

const authCtrl = require('../controllers//auth.controller');
const authMdw = require('../middleware/auth.middleware');

router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);
router.get('/me', authMdw, authCtrl.getMe);

module.exports = router;
