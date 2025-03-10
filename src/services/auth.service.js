const User = require('../models/user.model');
const VerificationUtil = require('../utils/verification.utils');
const JWTUtil = require('../utils/jwt.utils');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

class AuthService {
  // User Signup Step 1
  static async signupStep1(userData) {
    const { email, phone, password, confirmPassword } = userData;

    // Validate passwords
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    // Check existing user
    const existingUser = await User.findOne({ 
      where: { 
        [Op.or]: [{ email }, { phone }]
      } 
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create user without verification code
    const user = await User.create({
      email,
      phone,
      password
    });

    return user;
  }

  // User Signup Step 2
  static async signupStep2(userId, verificationMethod) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Generate verification code
    const verificationCode = VerificationUtil.generateCode();
    user.verificationCode = verificationCode;
    await user.save();

    // Send verification notifications based on user choice
    if (verificationMethod === 'email') {
      await VerificationUtil.sendEmailVerification(user.email, verificationCode);
    } else if (verificationMethod === 'sms') {
      await VerificationUtil.sendSMSVerification(user.phone, verificationCode);
    } else {
      throw new Error('Invalid verification method');
    }

    return user;
  }

  // User Login
  static async login(emailOrPhone, password) {
    const user = await User.findOne({ 
      where: { 
        [Op.or]: [{ email: emailOrPhone }, { phone: emailOrPhone }]
      } 
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = JWTUtil.generateToken(user);

    return { token, user };
  }

  // Verify User
  static async verifyUser(email, verificationCode) {
    const user = await User.findOne({ 
      where: { 
        email,
        verificationCode 
      } 
    });

    if (!user) {
      throw new Error('Invalid verification code');
    }

    user.isVerified = true;
    user.verificationCode = null;
    await user.save();

    // Generate token
    const token = JWTUtil.generateToken(user);

    return { token, user };
  }

  // Google Authentication
  static async googleAuth(profile) {
    let user = await User.findOne({ where: { googleId: profile.id } });
    if (!user) {
      user = await User.create({
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        isVerified: true
      });
    }
    const token = JWTUtil.generateToken(user);
    return { token, user };
  }

  // Facebook Authentication
  static async facebookAuth(profile) {
    let user = await User.findOne({ where: { facebookId: profile.id } });
    if (!user) {
      user = await User.create({
        facebookId: profile.id,
        email: profile.emails[0].value,
        name: `${profile.name.givenName} ${profile.name.familyName}`,
        isVerified: true
      });
    }
    const token = JWTUtil.generateToken(user);
    return { token, user };
  }

  // Request Password Reset Step 1
  static async requestPasswordResetStep1(emailOrPhone, verificationMethod) {
    const user = await User.findOne({ 
      where: { 
        [Op.or]: [{ email: emailOrPhone }, { phone: emailOrPhone }]
      } 
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Generate reset token
    const resetToken = VerificationUtil.generateCode();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send reset notifications based on user choice
    if (verificationMethod === 'email') {
      await VerificationUtil.sendPasswordResetEmail(user.email, resetToken);
    } else if (verificationMethod === 'sms') {
      await VerificationUtil.sendPasswordResetSMS(user.phone, resetToken);
    } else {
      throw new Error('Invalid verification method');
    }

    return { message: 'Password reset code sent' };
  }

  // Verify Password Reset Token
  static async verifyPasswordResetToken(emailOrPhone, resetToken) {
    const user = await User.findOne({ 
      where: { 
        [Op.or]: [{ email: emailOrPhone }, { phone: emailOrPhone }],
        resetPasswordToken: resetToken,
        resetPasswordExpires: { [Op.gt]: Date.now() }
      } 
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    return { message: 'Reset token verified', userId: user.id };
  }

  // Reset Password
  static async resetPassword(userId, newPassword, confirmPassword) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Validate passwords
    if (newPassword !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return { message: 'Password reset successful' };
  }
}

module.exports = AuthService;