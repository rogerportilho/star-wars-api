const express = require('express');
const userController = require('../controller/userController');
const characterRoutes = require('./routes/characterRoutes');
const { authenticateJWT } = require('../service/authService');

const router = express.Router();

// Public routes
router.post('/auth/token', userController.login);
router.post('/users/register', userController.register);

// Auth middleware for protected routes
router.use(authenticateJWT);

// Protected REST routes
const checkoutController = require('../controller/checkoutController');
router.post('/auth/logout', checkoutController.logout);
router.post('/checkout', checkoutController.checkout);
router.get('/users', userController.getAll);
router.use('/characters', characterRoutes);

module.exports = router;
