const logger = require('../utils/logger.utils');

const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(`Error: ${err.message}`, {
    method: req.method,
    path: req.path,
    body: req.body,
    stack: err.stack
  });

  // Determine status code
  const statusCode = err.status || 
    (err.name === 'ValidationError' ? 400 :
    (err.name === 'UnauthorizedError' ? 401 :
    (err.name === 'ForbiddenError' ? 403 : 500)));

  // Send error response
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;