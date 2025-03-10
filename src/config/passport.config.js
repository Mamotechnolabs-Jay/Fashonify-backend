const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const AuthService = require('../services/auth.service');
const JWTUtil = require('../utils/jwt.utils');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:4000/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const { token, user } = await AuthService.googleAuth(profile);
    done(null, { token, user });
  } catch (error) {
    done(error, null);
  }
}));

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: 'http://localhost:4000/api/auth/facebook/callback',
  profileFields: ['id', 'emails', 'name']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const { token, user } = await AuthService.facebookAuth(profile);
    done(null, { token, user });
  } catch (error) {
    done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.token);
});

passport.deserializeUser(async (token, done) => {
  try {
    const user = await JWTUtil.verifyToken(token);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;