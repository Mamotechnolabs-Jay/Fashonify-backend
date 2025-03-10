const express = require('express');
const BrandController = require('../controllers/brand.controller');
const AuthMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// Brand Routes
router.post('/create', AuthMiddleware.authenticateUser, BrandController.createBrand);
router.get('/all', AuthMiddleware.authenticateUser, BrandController.getAllBrands);
router.get('/:id', AuthMiddleware.authenticateUser, BrandController.getBrandById);
router.put('/update/:id', AuthMiddleware.authenticateUser, BrandController.updateBrand);
router.delete('/delete/:id', AuthMiddleware.authenticateUser, BrandController.deleteBrand);

module.exports = router;