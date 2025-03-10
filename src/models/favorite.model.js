const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Favorite extends Model {}

Favorite.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Favorite',
  tableName: 'favorites'
});

module.exports = Favorite;