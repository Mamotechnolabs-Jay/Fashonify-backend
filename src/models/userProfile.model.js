const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class UserProfile extends Model {}

UserProfile.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  height: {
    type: DataTypes.STRING,
    allowNull: false
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: false
  },
  weight: {
    type: DataTypes.STRING,
    allowNull: false
  },
  bodyType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  age: {
    type: DataTypes.STRING,
    allowNull: false
  },
  profilePicture: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'UserProfile',
  tableName: 'user_profiles'
});

module.exports = UserProfile;