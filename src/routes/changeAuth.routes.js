const express = require('express');
const ChangeAuthController = require('../controllers/changeAuth.controller');
const AuthMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// Update Email Route
router.post('/update-email', AuthMiddleware.authenticateUser, ChangeAuthController.updateEmail);

// Verify New Email Route
router.post('/verify-new-email', AuthMiddleware.authenticateUser, ChangeAuthController.verifyNewEmail);

// Update Phone Number Route
router.post('/update-phone-number', AuthMiddleware.authenticateUser, ChangeAuthController.updatePhoneNumber);

// Verify New Phone Number Route
router.post('/verify-new-phone-number', AuthMiddleware.authenticateUser, ChangeAuthController.verifyNewPhoneNumber);

// Update Password Route
router.post('/update-password', AuthMiddleware.authenticateUser, ChangeAuthController.updatePassword);

module.exports = router;