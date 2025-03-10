const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class PhotoAnalysis extends Model {}

PhotoAnalysis.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  profileId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  photoPath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  height: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  chest: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  bicep: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  hip: {
    type: DataTypes.FLOAT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'PhotoAnalysis',
  tableName: 'photo_analyses'
});

module.exports = PhotoAnalysis;