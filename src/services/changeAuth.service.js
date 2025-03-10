const User = require('../models/user.model');
const VerificationUtil = require('../utils/verification.utils');
const bcrypt = require('bcryptjs');

class ChangeAuthService {
  // Update Email
  static async updateEmail(userId, currentEmail, newEmail, confirmEmail) {
    if (newEmail !== confirmEmail) {
      throw new Error('New email and confirm email do not match');
    }

    const user = await User.findOne({ where: { id: userId, email: currentEmail } });
    if (!user) {
      throw new Error('Current email is incorrect');
    }

    const verificationCode = VerificationUtil.generateCode();
    user.newEmail = newEmail;
    user.emailVerificationCode = verificationCode;
    await user.save();

    await VerificationUtil.sendEmailVerification(newEmail, verificationCode);

    return { message: 'Verification code sent to new email' };
  }

  // Verify New Email
  static async verifyNewEmail(userId, verificationCode) {
    const user = await User.findOne({ where: { id: userId, emailVerificationCode: verificationCode } });
    if (!user) {
      throw new Error('Invalid verification code');
    }

    user.email = user.newEmail;
    user.newEmail = null;
    user.emailVerificationCode = null;
    await user.save();

    return { message: 'Email updated successfully' };
  }

  // Update Phone Number
  static async updatePhoneNumber(userId, currentPhone, newPhone, confirmPhone) {
    if (newPhone !== confirmPhone) {
      throw new Error('New phone number and confirm phone number do not match');
    }

    const user = await User.findOne({ where: { id: userId, phone: currentPhone } });
    if (!user) {
      throw new Error('Current phone number is incorrect');
    }

    const verificationCode = VerificationUtil.generateCode();
    user.newPhone = newPhone;
    user.phoneVerificationCode = verificationCode;
    await user.save();

    await VerificationUtil.sendSMSVerification(newPhone, verificationCode);

    return { message: 'Verification code sent to new phone number' };
  }

  // Verify New Phone Number
  static async verifyNewPhoneNumber(userId, verificationCode) {
    const user = await User.findOne({ where: { id: userId, phoneVerificationCode: verificationCode } });
    if (!user) {
      throw new Error('Invalid verification code');
    }

    user.phone = user.newPhone;
    user.newPhone = null;
    user.phoneVerificationCode = null;
    await user.save();

    return { message: 'Phone number updated successfully' };
  }

  // Update Password
  static async updatePassword(userId, currentPassword, newPassword, confirmPassword) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new Error('Current password is incorrect');
    }

    if (newPassword !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return { message: 'Password updated successfully' };
  }
}

module.exports = ChangeAuthService;