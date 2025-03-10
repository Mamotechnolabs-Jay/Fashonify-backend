const express = require('express');
const FavoriteController = require('../controllers/favorite.controller');
const AuthMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// Favorite Routes
router.post('/add', AuthMiddleware.authenticateUser, FavoriteController.addFavorite);
router.get('/user/:userId', AuthMiddleware.authenticateUser, FavoriteController.getFavoritesByUser);
router.delete('/delete', AuthMiddleware.authenticateUser, FavoriteController.deleteFavorite);

module.exports = router;