const { Sequelize } = require('sequelize');

// Connection pool settings optimized for serverless
const sequelize = new Sequelize(
  process.env.DB_NAME, 
  process.env.DB_USER, 
  process.env.DB_PASSWORD, 
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      },
      // Optimize connection settings
      connectTimeout: 5000 // 5 seconds
    },
    logging: false, // Disable logging for better performance
    pool: {
      max: 2,
      min: 0,
      acquire: 8000, // 8 seconds timeout
      idle: 3000
    },
    define: {
      timestamps: true,
      underscored: true
    },
    retry: {
      max: 1 // Only try to connect once
    }
  }
);

module.exports = sequelize;