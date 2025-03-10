const express = require('express');
const passport = require('passport');
const AuthController = require('../controllers/auth.controller');

const router = express.Router();

// Signup Step 1 Route
router.post('/signup-step1', AuthController.signupStep1);

// Signup Step 2 Route
router.post('/signup-step2', AuthController.signupStep2);

// Login Route
router.post('/login', AuthController.login);

// Verify User Route
router.post('/verify', AuthController.verifyUser);

// Request Password Reset Step 1 Route
router.post('/request-password-reset-step1', AuthController.requestPasswordResetStep1);

// Verify Password Reset Token Route
router.post('/verify-password-reset-token', AuthController.verifyPasswordResetToken);

// Reset Password Route
router.post('/reset-password', AuthController.resetPassword);

// Google Authentication Route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google Authentication Callback Route
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  res.json({ token: req.user.token, user: req.user.user });
});

// Facebook Authentication Route
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

// Facebook Authentication Callback Route
router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }), (req, res) => {
  res.json({ token: req.user.token, user: req.user.user });
});

module.exports = router;