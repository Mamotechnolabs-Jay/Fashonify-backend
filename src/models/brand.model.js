const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Brand extends Model {}

Brand.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  sequelize,
  modelName: 'Brand',
  tableName: 'brands'
});

module.exports = Brand;