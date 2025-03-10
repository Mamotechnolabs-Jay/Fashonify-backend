const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');
const UserProfile = require('./userProfile.model');

class User extends Model {
  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  }
}

User.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true, // Allow null for social logins
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true // Allow null for social logins
  },
  googleId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  facebookId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verificationCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Establish relationships
User.hasMany(UserProfile, { foreignKey: 'userId', as: 'profiles' });
UserProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = User;