const CategoryService = require('../services/category.service');

class CategoryController {
  static async createCategory(req, res) {
    try {
      const { file } = req;
      const categoryData = {
        ...req.body,
        image: file ? `/uploads/${file.fieldname}/${file.filename}` : null
      };
      const category = await CategoryService.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getCategoryById(req, res) {
    try {
      const category = await CategoryService.getCategoryById(req.params.id);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      res.status(200).json(category);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getAllCategories(req, res) {
    try {
      const categories = await CategoryService.getAllCategories();
      res.status(200).json(categories);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async updateCategory(req, res) {
    try {
      const { file } = req;
      const categoryData = {
        ...req.body,
        image: file ? `/uploads/${file.fieldname}/${file.filename}` : req.body.image
      };
      const category = await CategoryService.updateCategory(req.params.id, categoryData);
      res.status(200).json(category);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async deleteCategory(req, res) {
    try {
      await CategoryService.deleteCategory(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = CategoryController;