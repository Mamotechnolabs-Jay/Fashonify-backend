const ChangeAuthService = require('../services/changeAuth.service');

class ChangeAuthController {
  // Update Email Handler
  static async updateEmail(req, res) {
    try {
      const { userId, currentEmail, newEmail, confirmEmail } = req.body;
      const result = await ChangeAuthService.updateEmail(userId, currentEmail, newEmail, confirmEmail);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Verify New Email Handler
  static async verifyNewEmail(req, res) {
    try {
      const { userId, verificationCode } = req.body;
      const result = await ChangeAuthService.verifyNewEmail(userId, verificationCode);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Update Phone Number Handler
  static async updatePhoneNumber(req, res) {
    try {
      const { userId, currentPhone, newPhone, confirmPhone } = req.body;
      const result = await ChangeAuthService.updatePhoneNumber(userId, currentPhone, newPhone, confirmPhone);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Verify New Phone Number Handler
  static async verifyNewPhoneNumber(req, res) {
    try {
      const { userId, verificationCode } = req.body;
      const result = await ChangeAuthService.verifyNewPhoneNumber(userId, verificationCode);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Update Password Handler
  static async updatePassword(req, res) {
    try {
      const { userId, currentPassword, newPassword, confirmPassword } = req.body;
      const result = await ChangeAuthService.updatePassword(userId, currentPassword, newPassword, confirmPassword);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = ChangeAuthController;