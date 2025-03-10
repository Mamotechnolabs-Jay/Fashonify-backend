const Product = require('../models/products.model');

class ProductService {
  static async createProduct(data) {
    return Product.create(data);
  }

  static async getProductById(id) {
    return Product.findByPk(id);
  }

  static async getAllProducts() {
    return Product.findAll();
  }

  static async updateProduct(id, data) {
    const product = await Product.findByPk(id);
    if (!product) {
      throw new Error('Product not found');
    }
    return product.update(data);
  }

  static async deleteProduct(id) {
    const product = await Product.findByPk(id);
    if (!product) {
      throw new Error('Product not found');
    }
    return product.destroy();
  }
}

module.exports = ProductService;