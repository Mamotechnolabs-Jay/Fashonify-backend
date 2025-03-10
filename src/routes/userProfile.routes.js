const express = require('express');
const UserProfileController = require('../controllers/userProfile.controller');
const AuthMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// User Profile Routes
router.post('/profiles', AuthMiddleware.authenticateUser, UserProfileController.createProfile);
router.get('/profiles', AuthMiddleware.authenticateUser, UserProfileController.getProfiles);
router.put('/profiles/:profileId', AuthMiddleware.authenticateUser, UserProfileController.updateProfile);
router.delete('/profiles/:profileId', AuthMiddleware.authenticateUser, UserProfileController.deleteProfile);

module.exports = router;