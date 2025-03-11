const AuthService = require('../services/auth.service');

class AuthController {
  // Signup Step 1 Handler
  static async signupStep1(req, res) {
    try {
      const userData = req.body;
      const user = await AuthService.signupStep1(userData);

      res.status(201).json({
        success: true,
        message: 'User created successfully. Please select verification method.',
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone
        }
      });
    } catch (error) {
      console.error('Signup Step 1 error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Signup Step 2 Handler
  static async signupStep2(req, res) {
    try {
      const { userId, verificationMethod } = req.body;
      const user = await AuthService.signupStep2(userId, verificationMethod);

      console.log('User:', user);

      res.status(200).json({
        success: true,
        message: `Verification code sent via ${verificationMethod}.`,
        userId: user.id
      });
    } catch (error) {
      console.error('Signup Step 2 error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Login Handler
  static async login(req, res) {
    try {
      const { emailOrPhone, password } = req.body;
      const result = await AuthService.login(emailOrPhone, password);

      if (result.needsVerification) {
        return res.status(206).json({
          message: 'Verification required. Code sent.'
        });
      }

      res.status(200).json({
        message: 'Login successful',
        token: result.token,
        user: result.user
      });
    } catch (error) {
      res.status(401).json({ 
        message: error.message 
      });
    }
  }

  // Verify User Handler
  static async verifyUser(req, res) {
    try {
      const { emailOrPhone, verificationCode } = req.body;
      const result = await AuthService.verifyUser(emailOrPhone, verificationCode);

      res.status(200).json({
        message: 'User verified successfully',
        token: result.token,
        user: result.user
      });
    } catch (error) {
      res.status(400).json({ 
        message: error.message 
      });
    }
  }

  // Request Password Reset Step 1 Handler
  static async requestPasswordResetStep1(req, res) {
    try {
      const { emailOrPhone, verificationMethod } = req.body;
      const result = await AuthService.requestPasswordResetStep1(emailOrPhone, verificationMethod);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ 
        message: error.message 
      });
    }
  }

  // Verify Password Reset Token Handler
  static async verifyPasswordResetToken(req, res) {
    try {
      const { emailOrPhone, resetToken } = req.body;
      const result = await AuthService.verifyPasswordResetToken(emailOrPhone, resetToken);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ 
        message: error.message 
      });
    }
  }

  // Reset Password Handler
  static async resetPassword(req, res) {
    try {
      const { userId, newPassword, confirmPassword } = req.body;
      const result = await AuthService.resetPassword(userId, newPassword, confirmPassword);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ 
        message: error.message 
      });
    }
  }
}

module.exports = AuthController;