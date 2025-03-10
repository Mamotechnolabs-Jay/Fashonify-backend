const UserProfile = require('../models/userProfile.model');

class UserProfileService {
  static async createProfile(userId, profileData) {
    const profile = await UserProfile.create({ userId, ...profileData });
    console.log("profile", profile);
    return profile;
  }

  static async getProfiles(userId) {
    const profiles = await UserProfile.findAll({ where: { userId } });
    return profiles;
  }

  static async updateProfile(profileId, profileData) {
    const profile = await UserProfile.findByPk(profileId);
    if (!profile) {
      throw new Error('Profile not found');
    }
    await profile.update(profileData);
    return profile;
  }

  static async deleteProfile(profileId) {
    const profile = await UserProfile.findByPk(profileId);
    if (!profile) {
      throw new Error('Profile not found');
    }
    await profile.destroy();
    return { message: 'Profile deleted successfully' };
  }
}

module.exports = UserProfileService;