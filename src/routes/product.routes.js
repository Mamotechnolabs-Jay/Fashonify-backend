const express = require('express');
const ProductController = require('../controllers/product.controller');
const AuthMiddleware = require('../middlewares/auth.middleware');
const upload = require('../config/multer.config');

const router = express.Router();

// Product Routes
router.post('/create', AuthMiddleware.authenticateUser, upload.single('image'), ProductController.createProduct);
router.get('/all', AuthMiddleware.authenticateUser, ProductController.getAllProducts);
router.get('/:id', AuthMiddleware.authenticateUser, ProductController.getProductById);
router.put('/update/:id', AuthMiddleware.authenticateUser, upload.single('image'), ProductController.updateProduct);
router.delete('/delete/:id', AuthMiddleware.authenticateUser, ProductController.deleteProduct);

module.exports = router;