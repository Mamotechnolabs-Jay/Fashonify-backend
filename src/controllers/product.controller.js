const ProductService = require('../services/product.service');

class ProductController {
  static async createProduct(req, res) {
    try {
      const { file } = req;
      const productData = {
        ...req.body,
        image: file ? `/uploads/${file.fieldname}/${file.filename}` : null
      };
      const product = await ProductService.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getProductById(req, res) {
    try {
      const product = await ProductService.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json(product);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getAllProducts(req, res) {
    try {
      const products = await ProductService.getAllProducts();
      res.status(200).json(products);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async updateProduct(req, res) {
    try {
      const { file } = req;
      const productData = {
        ...req.body,
        image: file ? `/uploads/${file.fieldname}/${file.filename}` : req.body.image
      };
      const product = await ProductService.updateProduct(req.params.id, productData);
      res.status(200).json(product);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async deleteProduct(req, res) {
    try {
      await ProductService.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = ProductController;