const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();
require('./src/config/passport.config');

// Database Connection
const sequelize = require('./src/config/database');

// Routes
const authRoutes = require('./src/routes/auth.routes');
const userProfileRoutes = require('./src/routes/userProfile.routes');
const photoAnalysisRoutes = require('./src/routes/photoAnalysis.routes');
const productRoutes = require('./src/routes/product.routes');
const categoryRoutes = require('./src/routes/category.routes');
const brandRoutes = require('./src/routes/brand.routes');
const favoriteRoutes = require('./src/routes/favorite.routes');
const changeAuthRoutes = require('./src/routes/changeAuth.routes');

// Middleware
const errorHandler = require('./src/middlewares/error-handler.middleware');
const logger = require('./src/utils/logger.utils');

const app = express();

// Middleware Configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8080'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session middleware - MUST be added BEFORE passport.initialize()
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root route for testing
app.get('/', (req, res) => {
  res.json({
    message: 'Hello World',
    status: 'online',
    endpoints: {
      auth: '/api/auth',
      userProfiles: '/api/user-profiles',
      photoAnalysis: '/api/photo-analysis',
      products: '/api/products',
      categories: '/api/categories',
      brands: '/api/brands',
      favorites: '/api/favorites'
    }
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(503).json({ 
      status: 'error', 
      database: 'disconnected',
      message: error.message
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user-profiles', userProfileRoutes);
app.use('/api/photo-analysis', photoAnalysisRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/change-auth', changeAuthRoutes);

// Global Error Handler
app.use(errorHandler);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Endpoint Not Found',
    status: 404
  });
});

// Server Configuration
const PORT = process.env.PORT || 4000;

// Start Server
const startServer = async () => {
  try {
    console.log('Starting server...');
    console.log('Connecting to database...');
    
    // Database Connection
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // Sync Models - use alter to update schema without dropping tables
    await sequelize.sync({ alter: true });
    console.log('Models synchronized');

    // Start Express Server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;