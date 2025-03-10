const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

// Create Express app
const app = express();

// Middleware Configuration
app.use(cors({
  origin: '*', // Allow all origins during development
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

// Root route for testing
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Fashionify API',
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
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Lazy-load dependencies to reduce cold start time
let dbInitialized = false;

const initializeApp = async (req, res, next) => {
  // Skip initialization if already done
  if (dbInitialized) {
    return next();
  }

  try {
    // Load passport config
    require('./src/config/passport.config');

    // Database Connection
    const sequelize = require('./src/config/database');
    await sequelize.authenticate();
    console.log('Database connected successfully');
    
    // Mark as initialized
    dbInitialized = true;
    next();
  } catch (error) {
    console.error('Failed to initialize app:', error);
    return res.status(500).json({
      error: 'Could not connect to database',
      message: 'Server initialization failed'
    });
  }
};

// Apply initialization middleware only to API routes
app.use('/api', initializeApp);

// Routes - only load after middleware
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/user-profiles', require('./src/routes/userProfile.routes'));
app.use('/api/photo-analysis', require('./src/routes/photoAnalysis.routes'));
app.use('/api/products', require('./src/routes/product.routes'));
app.use('/api/categories', require('./src/routes/category.routes'));
app.use('/api/brands', require('./src/routes/brand.routes'));
app.use('/api/favorites', require('./src/routes/favorite.routes'));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handler middleware
const errorHandler = require('./src/middlewares/error-handler.middleware');
app.use(errorHandler);

// 404 Handler - must be after all other routes
app.use((req, res) => {
  res.status(404).json({
    message: 'Endpoint Not Found',
    status: 404
  });
});

// Server Configuration for local development
const PORT = process.env.PORT || 4000;

// Only start server in local development mode
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the Express app for serverless deployment
module.exports = app;