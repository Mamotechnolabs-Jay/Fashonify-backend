const BrandService = require('../services/brand.service');

class BrandController {
  static async createBrand(req, res) {
    try {
      const brand = await BrandService.createBrand(req.body);
      res.status(201).json(brand);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getBrandById(req, res) {
    try {
      const brand = await BrandService.getBrandById(req.params.id);
      if (!brand) {
        return res.status(404).json({ message: 'Brand not found' });
      }
      res.status(200).json(brand);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getAllBrands(req, res) {
    try {
      const brands = await BrandService.getAllBrands();
      res.status(200).json(brands);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async updateBrand(req, res) {
    try {
      const brand = await BrandService.updateBrand(req.params.id, req.body);
      res.status(200).json(brand);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async deleteBrand(req, res) {
    try {
      await BrandService.deleteBrand(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = BrandController;