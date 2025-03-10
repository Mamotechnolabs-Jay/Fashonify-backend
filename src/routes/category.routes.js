const express = require('express');
const CategoryController = require('../controllers/category.controller');
const AuthMiddleware = require('../middlewares/auth.middleware');
const upload = require('../config/multer.config');

const router = express.Router();

// Category Routes
router.post('/create', AuthMiddleware.authenticateUser, upload.single('image'), CategoryController.createCategory);
router.get('/all', AuthMiddleware.authenticateUser, CategoryController.getAllCategories);
router.get('/:id', AuthMiddleware.authenticateUser, CategoryController.getCategoryById);
router.put('/update/:id', AuthMiddleware.authenticateUser, upload.single('image'), CategoryController.updateCategory);
router.delete('/delete/:id', AuthMiddleware.authenticateUser, CategoryController.deleteCategory);

module.exports = router;