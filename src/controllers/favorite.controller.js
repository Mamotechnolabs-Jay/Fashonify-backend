const FavoriteService = require('../services/favorite.service');

class FavoriteController {
  static async addFavorite(req, res) {
    try {
      const { userId, productId } = req.body;
      const favorite = await FavoriteService.addFavorite(userId, productId);
      res.status(201).json(favorite);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getFavoritesByUser(req, res) {
    try {
      const { userId } = req.params;
      const favorites = await FavoriteService.getFavoritesByUser(userId);
      res.status(200).json(favorites);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async deleteFavorite(req, res) {
    try {
      const { userId, productId } = req.body;
      await FavoriteService.deleteFavorite(userId, productId);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = FavoriteController;