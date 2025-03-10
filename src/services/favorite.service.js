const Favorite = require('../models/favorite.model');

class FavoriteService {
  static async addFavorite(userId, productId) {
    return Favorite.create({ userId, productId });
  }

  static async getFavoritesByUser(userId) {
    return Favorite.findAll({ where: { userId } });
  }

  static async deleteFavorite(userId, productId) {
    const favorite = await Favorite.findOne({ where: { userId, productId } });
    if (!favorite) {
      throw new Error('Favorite not found');
    }
    return favorite.destroy();
  }
}

module.exports = FavoriteService;