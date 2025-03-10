const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Category extends Model {}

Category.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true // Allow null for categories without images
  }
}, {
  sequelize,
  modelName: 'Category',
  tableName: 'categories'
});

module.exports = Category;