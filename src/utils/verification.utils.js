const nodemailer = require('nodemailer');
const twilio = require('twilio');

class VerificationUtil {
  // Generate Verification Code
  static generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send Email Verification
  static async sendEmailVerification(email, code) {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    try {
      await transporter.sendMail({
        from: '"E-Commerce App" <noreply@ecommerceapp.com>',
        to: email,
        subject: 'Your Verification Code',
        text: `Your verification code is: ${code}`,
        html: `<p>Your verification code is: <strong>${code}</strong></p>`
      });
    } catch (error) {
      console.error('Email verification failed:', error);
    }
  }

  // Send SMS Verification
  static async sendSMSVerification(phone, code) {
    const client = twilio(
      process.env.SMS_PROVIDER_SID, 
      process.env.SMS_PROVIDER_TOKEN
    );

    try {
      await client.messages.create({
        body: `Your verification code is: ${code}`,
        from: process.env.SMS_PROVIDER_PHONE,
        to: phone
      });
    } catch (error) {
      console.error('SMS verification failed:', error);
    }
  }

  // Send Password Reset Email
  static async sendPasswordResetEmail(email, resetToken) {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    try {
      await transporter.sendMail({
        from: '"E-Commerce App" <noreply@ecommerceapp.com>',
        to: email,
        subject: 'Password Reset Request',
        text: `Your password reset code is: ${resetToken}`,
        html: `<p>Your password reset code is: <strong>${resetToken}</strong></p>`
      });
    } catch (error) {
      console.error('Password reset email failed:', error);
    }
  }
}

module.exports = VerificationUtil;