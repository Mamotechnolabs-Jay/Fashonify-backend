const jwt = require('jsonwebtoken');

class JWTUtil {
  // Generate JWT Token
  static generateToken(user) {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email 
      }, 
      process.env.JWT_SECRET, 
      { 
        expiresIn: process.env.JWT_EXPIRATION 
      }
    );
  }

  // Verify JWT Token
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return null;
    }
  }
}

module.exports = JWTUtil;