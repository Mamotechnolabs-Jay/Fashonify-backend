const JWTUtil = require('../utils/jwt.utils');
const User = require('../models/user.model');

class AuthMiddleware {
  // Validate JWT Token
  static async authenticateUser(req, res, next) {
    try {
      // Get token from header
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ 
          message: 'No token provided' 
        });
      }

      // Extract token
      const token = authHeader.split(' ')[1];
      if (!token) {
        return res.status(401).json({ 
          message: 'Invalid token format' 
        });
      }

      // Verify token
      const decoded = JWTUtil.verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ 
          message: 'Invalid or expired token' 
        });
      }

      // Find user
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return res.status(401).json({ 
          message: 'User not found' 
        });
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  }

  // Check User Role (optional)
  static async requireRole(roles) {
    return async (req, res, next) => {
      // Implement role-based access control
      // This is a placeholder for future implementation
      next();
    };
  }
}

module.exports = AuthMiddleware;