const express = require('express');
const userController = require('../controller/userController');
const characterRoutes = require('./routes/characterRoutes');
const { authenticateJWT } = require('../service/authService');

const router = express.Router();

router.post('/auth/token', userController.login);
// Public route
router.post('/auth/token', userController.login);

// Auth middleware for protected routes
router.use(authenticateJWT);

// Protected REST routes
router.post('/users/register', userController.register);
router.get('/users', userController.getAll);
router.use('/characters', characterRoutes);

module.exports = router;
