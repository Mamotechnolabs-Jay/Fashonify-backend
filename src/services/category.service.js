const Category = require('../models/category.model');

class CategoryService {
  static async createCategory(data) {
    return Category.create(data);
  }

  static async getCategoryById(id) {
    return Category.findByPk(id);
  }

  static async getAllCategories() {
    return Category.findAll();
  }

  static async updateCategory(id, data) {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new Error('Category not found');
    }
    return category.update(data);
  }

  static async deleteCategory(id) {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new Error('Category not found');
    }
    return category.destroy();
  }
}

module.exports = CategoryService;